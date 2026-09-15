# Despliegue - Distribuidora del Sol (DigitalOcean droplet, sin dominio de pago)

Guía paso a paso para publicar el sistema en **un solo droplet**, con:

- **Nginx** sirviendo el frontend (build de React) y haciendo *proxy* de `/api` y `/socket.io` al backend → **un solo origen**, sin CORS ni IPs quemadas.
- **NestJS** corriendo con **pm2** en `localhost:3001`.
- **PostgreSQL** local en el droplet.
- **HTTPS gratis** con **certbot** + un hostname gratuito (`sslip.io`), sin comprar dominio.

El **build pesado de React se hace en tu máquina** y se sube ya compilado, para que el droplet no se quede sin memoria. Este proyecto corre en un droplet de **512 MB** con **2 GB de swap** (ver paso 2.1); el swap es imprescindible en 512 MB.

---

## 0. Resumen de la arquitectura

```
Navegador ──HTTPS──> Nginx (:80/:443)
                        ├── /            → /var/www/distribuidora  (build de React)
                        ├── /api/        → 127.0.0.1:3001          (NestJS, pm2)
                        └── /socket.io/  → 127.0.0.1:3001          (WebSocket)
                                                    └── PostgreSQL (localhost:5432)
```

---

## 1. En TU MÁQUINA (local): compilar y subir

El frontend se compila local (`REACT_APP_API_URL=/api` ya está en `frontend/.env.production`).

```bash
cd frontend
npm ci
npm run build          # genera frontend/build/
```

Sube el build ya compilado a GitHub. Como `frontend/build` está en `.gitignore`, se fuerza:

```bash
cd ..
git add -f frontend/build
git add DEPLOY.md deploy/ backend/ecosystem.config.js backend/.env.production.example frontend/.env.production
git commit -m "Build de producción + paquete de despliegue"
git push
```

> Alternativa sin ensuciar el repo: en vez de `git add -f frontend/build`, subir el build por `scp -r frontend/build/* usuario@IP:/var/www/distribuidora/`. Ambas sirven.

El backend NO se compila en local (su build con `nest build` es liviano y se hace en el server).

---

## 2. Crear el droplet

- **Ubuntu 24.04 LTS**. Este despliegue corre en un droplet de **512 MB / 1 vCPU** (`s-1vcpu-512mb`).
- Agrega tu llave SSH.
- **IP pública de este proyecto:** `104.236.254.247`

Entra por SSH:

```bash
ssh root@104.236.254.247
```

> **512 MB es muy justo:** basta para el uso de 3 personas *en marcha*, pero `npm ci`, las migraciones y `nest build` se quedan sin memoria (`Killed`) sin swap. Por eso el **paso 2.1 (swap) es obligatorio** antes de instalar nada.

### 2.1 Swap (OBLIGATORIO en 512 MB)

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h   # debe mostrar  Swap: 2.0Gi
```

---

## 3. Instalar dependencias del sistema

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt update && sudo apt install -y nodejs postgresql nginx git rsync

# pm2 y certbot
sudo npm install -g pm2
sudo apt install -y certbot python3-certbot-nginx

# Firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

---

## 4. Base de datos PostgreSQL

```bash
sudo -u postgres psql <<'SQL'
CREATE USER distribuidora WITH PASSWORD 'PON_UNA_CLAVE_FUERTE';
CREATE DATABASE distribuidora OWNER distribuidora;
GRANT ALL PRIVILEGES ON DATABASE distribuidora TO distribuidora;
SQL
```

El esquema `public` viene por defecto.

---

## 5. Clonar el repo

```bash
cd ~
git clone https://github.com/titomon98/TU_REPO.git distribuidora
cd distribuidora
```

---

## 6. Backend (NestJS)

```bash
cd ~/distribuidora/backend

# Configuración
cp .env.production.example .env
nano .env
#   - DB_PASSWORD  = la clave que pusiste en el paso 4
#   - JWT_SECRET   = genera uno:  openssl rand -hex 32
#   - CORS_ORIGIN  = https://104.236.254.247.sslip.io   (lo defines en el paso 8)

# Producción SIN datos de prueba: elimina la migración de los 50 registros demo.
# (Deja el esquema + admin + roles + cliente CF, que sí se necesitan.)
rm -f migrations/021-migracion-21-datos-prueba.ts

npm ci                 # instala dependencias (incluye las de las migraciones)
npm run migration:run  # crea tablas, roles, y el usuario admin
npm run build          # compila a dist/ (liviano)

pm2 start ecosystem.config.js
pm2 save
pm2 startup            # ejecuta la línea que imprime, para que arranque solo al reiniciar
```

Verifica que responde: `curl -s -o /dev/null -w "%{http_code}\n" localhost:3001/api/auth/login -X POST -H "Content-Type: application/json" -d '{}'` → debe dar `400` (respondió).

---

## 7. Frontend (archivos estáticos)

```bash
sudo mkdir -p /var/www/distribuidora
sudo cp -r ~/distribuidora/frontend/build/* /var/www/distribuidora/
```

---

## 8. Nginx + hostname gratis + HTTPS (certbot)

**Hostname gratis:** `sslip.io` resuelve a tu IP sin registrar nada. Aquí usamos
`104.236.254.247.sslip.io` (que es a lo que se emitió el certificado). Debe ser el MISMO valor en el navegador, en `server_name` y en `CORS_ORIGIN`.

```bash
# 1) Instala la config
sudo cp ~/distribuidora/deploy/nginx-distribuidora.conf /etc/nginx/sites-available/distribuidora
sudo ln -sf /etc/nginx/sites-available/distribuidora /etc/nginx/sites-enabled/distribuidora
sudo rm -f /etc/nginx/sites-enabled/default

# 2) Pon tu hostname en server_name (IMPRESCINDIBLE: certbot NO reconoce "_")
sudo sed -i 's/server_name _;/server_name 104.236.254.247.sslip.io;/' /etc/nginx/sites-available/distribuidora

# 3) Prueba y recarga
sudo nginx -t && sudo systemctl reload nginx

# 4) HTTPS automático (edita Nginx y programa la renovación solo)
sudo certbot --nginx -d 104.236.254.247.sslip.io
```

> Si certbot dice *"Could not automatically find a matching server block"*, es que el `server_name` quedó en `_`. Corrige con el `sed` del paso 2, `sudo systemctl reload nginx`, y reinstala el cert:
> `sudo certbot install --cert-name 104.236.254.247.sslip.io`

Ya deberías abrir **https://104.236.254.247.sslip.io** en el navegador.

**Ajusta el CORS del backend** al mismo origen y reinícialo:

```bash
cd ~/distribuidora/backend
nano .env      # CORS_ORIGIN=https://104.236.254.247.sslip.io
pm2 restart distribuidora-api
```

> Nota: el frontend usa rutas relativas (`/api`, `/socket.io`), así que **no** hay que recompilarlo al activar HTTPS. Solo importa `CORS_ORIGIN` (lo usa el WebSocket).

---

## 9. Primer ingreso y seguridad

- Entra con el usuario **`admin` / `admin123`** (sembrado por la migración).
- **Cambia la contraseña de inmediato** en el menú de perfil → **Mi cuenta**.
- Crea los usuarios reales (cajero, despachador) desde **Usuarios**.

Checklist de seguridad:
- [ ] `JWT_SECRET` largo y aleatorio (no el de ejemplo).
- [ ] Clave fuerte de PostgreSQL.
- [ ] HTTPS activo (certbot) - así las contraseñas no viajan en claro.
- [ ] Firewall `ufw` activo (solo SSH y Nginx).

---

## 10. Actualizar el sistema (re-deploy)

**En tu máquina:**
```bash
cd frontend && npm run build && cd ..
git add -f frontend/build && git commit -m "Nuevo build" && git push
```

**En el droplet** - un solo comando con el script incluido:
```bash
cd ~/distribuidora
bash deploy/deploy.sh
```
Hace todo: `git pull`, copia el build del frontend a `/var/www/distribuidora`, `npm ci` + migraciones + `nest build` del backend, y `pm2 restart`.

<details><summary>…o los pasos a mano (equivalente)</summary>

```bash
cd ~/distribuidora && git pull
sudo rsync -a --delete frontend/build/ /var/www/distribuidora/
cd backend && npm ci && npm run migration:run && npm run build && pm2 restart distribuidora-api
```
</details>

---

## 11. Notas útiles

- **Memoria:** el swap de 2 GB (paso 2.1) es lo que permite que 512 MB aguante `npm ci` y `nest build`. Si ves `Killed`, casi siempre es que falta el swap. Alternativa: compilar el backend en tu Mac (`cd backend && npm run build`) y subir `dist/` con `git add -f backend/dist`.
- **`main.js`:** Nest lo compila en `dist/src/main.js` (no `dist/main.js`); por eso `ecosystem.config.js` y `start:prod` apuntan ahí.
- **Logs del backend:** `pm2 logs distribuidora-api`
- **Estado:** `pm2 status`
- **Backup de la BD:** `sudo -u postgres pg_dump distribuidora > backup_$(date +%F).sql`
- **Renovación HTTPS:** certbot deja un timer de systemd; se renueva solo. Probar: `sudo certbot renew --dry-run`.
- Si prefieres quedarte **solo con IP y HTTP** (sin certbot): pon `CORS_ORIGIN=http://TU_IP`, `server_name TU_IP;` y omite el paso de certbot. Funciona, pero las contraseñas viajarían sin cifrar (no recomendado).
