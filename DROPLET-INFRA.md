# Droplet compartido - guía para publicar otro proyecto

Este documento describe el droplet de DigitalOcean donde ya corre **Distribuidora del Sol**,
para que otro proyecto pueda publicarse en el **mismo droplet** sin romper lo existente.

> Los valores reflejan cómo quedó configurado el droplet durante el despliegue de Distribuidora
> del Sol. **Verifica en vivo** (hay comandos al final) antes de asumir; algo pudo cambiar.
> Este archivo **no contiene contraseñas**; las credenciales reales están en el `.env` del
> servidor (`~/distribuidora/backend/.env`).

---

## 1. Datos del droplet

- **IP pública:** `104.236.254.247`
- **Hostname del SO:** `del-sol`
- **Acceso:** `ssh root@104.236.254.247` (con la llave SSH ya autorizada)
- **SO:** Ubuntu 24.04 LTS
- **Tamaño:** `s-1vcpu-512mb-10gb` (1 vCPU, **512 MB RAM**, 10 GB disco), región NYC3
- **Swap:** 2 GB en `/swapfile` (imprescindible; 512 MB no alcanza para `npm ci`/builds)
- **Dominio gratis:** se usa `sslip.io`. `104.236.254.247.sslip.io` resuelve a la IP.
  Para otro proyecto puedes usar un subdominio: **`<loquesea>.104.236.254.247.sslip.io`**
  también resuelve a la misma IP (sin registrar ni pagar nada).

---

## 2. Software ya instalado (compartido)

- **Node.js 20 LTS** + npm
- **PostgreSQL** (local, escuchando en `5432`)
- **Nginx** (reverse proxy + archivos estáticos)
- **pm2** (global) como gestor de procesos Node
- **certbot** + `python3-certbot-nginx` (HTTPS gratis de Let's Encrypt)
- **git**, **rsync**

No hace falta reinstalar nada de esto para un segundo proyecto.

---

## 3. Lo que YA ocupa Distribuidora del Sol (no tocar)

| Recurso | Valor usado |
|---|---|
| Carpeta del repo | `~/distribuidora` |
| Backend (NestJS) | pm2 `distribuidora-api`, escuchando en `127.0.0.1:3001` |
| Entry del backend | `dist/src/main.js` (via `ecosystem.config.js`) |
| Frontend (estático) | `/var/www/distribuidora` |
| Nginx site | `/etc/nginx/sites-available/distribuidora` (symlink en `sites-enabled`) |
| Hostname/cert | `104.236.254.247.sslip.io` |
| Base de datos | DB `distribuidora`, usuario `distribuidora` (Postgres local) |

**No reutilices** el puerto 3001, el nombre pm2 `distribuidora-api`, la carpeta
`/var/www/distribuidora`, ni ese server block de Nginx.

---

## 4. Convenciones para el NUEVO proyecto

Elige valores propios, por ejemplo (ajústalos a tu proyecto, aquí `proyecto2`):

| Recurso | Sugerencia |
|---|---|
| Repo | `~/proyecto2` |
| Puerto backend | `3002` (o el que no esté en uso) |
| pm2 | `proyecto2-api` |
| Frontend estático | `/var/www/proyecto2` |
| Nginx site | `/etc/nginx/sites-available/proyecto2` |
| Hostname/cert | `proyecto2.104.236.254.247.sslip.io` |
| Base de datos | DB `proyecto2`, usuario `proyecto2` (clave nueva y fuerte) |

La clave es que **cada proyecto tiene su propio puerto, su propio server block de Nginx con un
hostname sslip.io distinto, su propia carpeta y su propia base de datos.** Nginx enruta por
`server_name` (hostname), así ambos conviven en el puerto 80/443.

---

## 5. Pasos para publicar el segundo proyecto

> Igual que en Distribuidora del Sol: **el frontend se compila en tu Mac** y se sube ya
> compilado por rsync; el backend se construye en el servidor. 512 MB es muy justo.

### 5.1 Base de datos (en el droplet)
```bash
sudo -u postgres psql <<'SQL'
CREATE USER proyecto2 WITH PASSWORD 'PON_UNA_CLAVE_FUERTE';
CREATE DATABASE proyecto2 OWNER proyecto2;
GRANT ALL PRIVILEGES ON DATABASE proyecto2 TO proyecto2;
SQL
```

### 5.2 Código + backend (en el droplet)
```bash
cd ~
git clone <tu-repo> proyecto2
cd proyecto2/backend
cp .env.example .env
nano .env            # DB_NAME=proyecto2, DB_USERNAME=proyecto2, PORT=3002, etc.
npm ci
npm run build
pm2 start ecosystem.config.js   # debe apuntar a tu entry y puerto 3002
pm2 save
```

### 5.3 Frontend (build en tu Mac, subir por rsync)
```bash
# en tu Mac:
cd frontend && npm run build && cd ..
rsync -a --delete frontend/build/ root@104.236.254.247:/var/www/proyecto2/
```
```bash
# en el droplet, crear la carpeta antes si no existe:
sudo mkdir -p /var/www/proyecto2
```

### 5.4 Nginx (nuevo server block, no tocar el de distribuidora)
Crea `/etc/nginx/sites-available/proyecto2` (ajusta puerto/hostname/raíz):
```nginx
server {
    listen 80;
    server_name proyecto2.104.236.254.247.sslip.io;
    root /var/www/proyecto2;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    # si usa websockets:
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 3600s;
    }
    location / {
        try_files $uri $uri/ /index.html;   # SPA fallback
    }
}
```
```bash
sudo ln -sf /etc/nginx/sites-available/proyecto2 /etc/nginx/sites-enabled/proyecto2
sudo nginx -t && sudo systemctl reload nginx
```

### 5.5 HTTPS (certbot, solo tu hostname)
```bash
sudo certbot --nginx -d proyecto2.104.236.254.247.sslip.io
```
> El `server_name` debe ser exactamente tu hostname (no `_`) o certbot no lo reconoce.

---

## 6. Trampas conocidas (512 MB)

- **`Killed` durante `npm ci`/build:** es falta de memoria. El swap de 2 GB ya existe; si aun
  así falla, compila el frontend en tu Mac (ya lo hacemos) y, si hace falta, el backend también
  (`npm run build` local y subir `dist/`).
- **No corras builds de los dos proyectos a la vez.**
- **pm2 arranque automático:** corre `pm2 startup` una vez (ya hecho para el usuario actual) y
  `pm2 save` después de agregar tu proceso, para que reviva al reiniciar.
- **Nginx:** no borres el `sites-enabled/distribuidora`. Solo agrega el tuyo.

---

## 7. Seguridad / firewall

- `ufw` activo con `OpenSSH` y `Nginx Full` permitidos.
- **El puerto `5432` (PostgreSQL) está abierto a Internet** (`0.0.0.0/0`) por una decisión previa
  para conectarse con DataGrip/DBeaver. Si tu proyecto no lo necesita expuesto, considera
  cerrarlo (`sudo ufw delete allow 5432/tcp`) o restringirlo por IP. Tu base nueva comparte ese
  mismo Postgres, así que **usa una clave fuerte**.
- No reutilices credenciales entre proyectos.

---

## 8. Comandos para verificar el estado real

```bash
# puertos en uso (ver qué está libre para el backend)
sudo ss -ltnp | grep -E ':(3001|3002|80|443|5432)'

# procesos pm2
pm2 status

# sites de nginx activos
ls -l /etc/nginx/sites-enabled/

# bases de datos existentes
sudo -u postgres psql -c '\l'

# memoria y swap
free -h

# certificados emitidos
sudo certbot certificates
```
