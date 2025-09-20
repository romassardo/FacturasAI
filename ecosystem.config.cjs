// Configuración de PM2 para desarrollo
module.exports = {
  apps: [
    {
      name: 'invoice-processor',
      script: 'npx',
      args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false, // Deshabilitar monitoreo de archivos de PM2
      instances: 1, // Modo desarrollo usa solo una instancia
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 3,
      min_uptime: '10s'
    }
  ]
}