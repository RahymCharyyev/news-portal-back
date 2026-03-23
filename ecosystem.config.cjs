module.exports = {
  apps: [
    {
      name: 'news_back',
      script: './build/src/index.js',
      time: true,
      kill_timeout: 10000,
      instances: 3,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3502,
      },
    },
  ],
};
