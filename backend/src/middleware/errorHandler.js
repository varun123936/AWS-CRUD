const logger = require('../config/logger');

function errorHandler(error, req, res, next) {
  logger.error('Unhandled API error', {
    method: req.method,
    path: req.originalUrl,
    message: error.message,
    stack: error.stack
  });

  if (res.headersSent) {
    return next(error);
  }

  const status = error.status || 500;
  const message = error.publicMessage || (status === 500 ? 'Internal server error' : error.message);

  return res.status(status).json({ message });
}

module.exports = errorHandler;
