// pm2 — mantiene vivo el backend NestJS y lo reinicia si se cae o al reiniciar el droplet.
// Uso:  cd backend && pm2 start ecosystem.config.js && pm2 save
module.exports = {
  apps: [
    {
      name: 'distribuidora-api',
      script: 'dist/main.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '400M',
      // El backend lee su configuración desde backend/.env (dotenv).
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
