#!/usr/bin/env bash
#
# Re-deploy en el servidor. Ejecutar EN EL DROPLET, dentro del repo:
#   bash deploy/deploy.sh
#
# Hace: git pull -> copia el build del frontend -> backend (deps/migraciones/build) -> pm2 restart.
# El build PESADO de React se hace en local y viaja por git; aquí solo se copia.

set -euo pipefail

# Raíz del repo = carpeta padre de este script.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
WEB_ROOT="${WEB_ROOT:-/var/www/distribuidora}"
PM2_APP="${PM2_APP:-distribuidora-api}"

cd "$REPO_DIR"

echo "==> 1/5 Actualizando código (git pull)"
git pull --ff-only

echo "==> 2/5 Publicando frontend en $WEB_ROOT"
if [ ! -d "frontend/build" ]; then
  echo "ERROR: no existe frontend/build. Compílalo en tu máquina (npm run build) y súbelo (git add -f frontend/build)." >&2
  exit 1
fi
sudo mkdir -p "$WEB_ROOT"
# --delete deja el destino idéntico al build actual.
sudo rsync -a --delete frontend/build/ "$WEB_ROOT/"

echo "==> 3/5 Backend: dependencias"
cd backend
npm ci

echo "==> 4/5 Backend: migraciones + build"
npm run migration:run
npm run build

echo "==> 5/5 Reiniciando API (pm2)"
if pm2 describe "$PM2_APP" >/dev/null 2>&1; then
  pm2 restart "$PM2_APP" --update-env
else
  pm2 start ecosystem.config.js
  pm2 save
fi

echo "==> Listo. Estado:"
pm2 status "$PM2_APP" || true
