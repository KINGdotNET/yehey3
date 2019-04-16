module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'prod-weapp',
      script: 'build/server.js',
      instances: 1,
      max_memory_restart: '600M',
    },
  ],
};
