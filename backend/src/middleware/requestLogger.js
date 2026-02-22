const logger = require('../config/logger');

function serializePayload(payload) {
  if (payload === undefined) {
    return null;
  }

  if (Buffer.isBuffer(payload)) {
    return `Buffer(${payload.length})`;
  }

  if (typeof payload === 'string') {
    return payload.length > 1000 ? `${payload.slice(0, 1000)}...[truncated]` : payload;
  }

  try {
    return JSON.parse(JSON.stringify(payload));
  } catch (error) {
    return '[unserializable payload]';
  }
}

function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  const requestId = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

  logger.info('Incoming request', {
    requestId,
    method: req.method,
    path: req.originalUrl,
    params: req.params,
    query: req.query,
    body: serializePayload(req.body)
  });

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  let responseBody;

  res.json = (body) => {
    responseBody = serializePayload(body);
    return originalJson(body);
  };

  res.send = (body) => {
    if (responseBody === undefined) {
      responseBody = serializePayload(body);
    }
    return originalSend(body);
  };

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    logger.info('Outgoing response', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      response: responseBody ?? null
    });
  });

  next();
}

module.exports = requestLogger;
