module.exports = {
  apps: [{
    name: 'vpn-backend',
    script: './server.js',
    cwd: '/home/azureuser/ZeroTraceVPN/backend',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/home/azureuser/.pm2/logs/vpn-backend-error.log',
    out_file: '/home/azureuser/.pm2/logs/vpn-backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 3000,
    kill_timeout: 5000
  }]
};
