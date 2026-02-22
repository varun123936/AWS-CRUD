require('dotenv').config();

const app = require('./src/app');
const logger = require('./src/config/logger');
const { testConnection } = require('./src/config/db');

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await testConnection();
    logger.info('Database connection established');

    app.listen(PORT, () => {
      logger.info('Backend server is running', { port: PORT });
    });
  } catch (error) {
    logger.error('Server startup failed', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

startServer();
