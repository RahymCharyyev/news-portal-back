module.exports = {
  apps: [
    {
      name: 'news_back',
      script: './dist/index.js',
      time: true,
      kill_timeout: 10000,
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3502,
      },
    },
  ],
};
