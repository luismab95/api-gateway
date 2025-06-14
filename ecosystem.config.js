module.exports = {
  apps: [
    {
      name: "api-gateway",
      script: "src/server.ts",
      interpreter: "ts-node",
      instances: 1,
      watch_delay: 1000, 
      ignore_watch: ["node_modules", "logs"],
      autorestart: true,
      watch: true,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
