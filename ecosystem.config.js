module.exports = {
  apps: [
    {
      name: 'server',
      script: '/var/www/Eatorder/backend/server.js',
      env: {
        NODE_OPTIONS: '--max-old-space-size=2048',  // Set the heap size to 2048 MB (2 GB)
      },
      max_memory_restart: '200M',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
    },
    // Add other applications here if needed
  ],
};
