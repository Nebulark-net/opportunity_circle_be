import winston from 'winston';
import { ApiError } from '../utils/apiError.js';

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (!(err instanceof ApiError)) {
    statusCode = err.statusCode || 500;
    message = err.message || 'Internal Server Error';
  }

  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    correlationId: req.correlationId,
  };

  winston.error(`${statusCode} - ${message} - ID: ${req.correlationId}`);

  res.status(statusCode).send(response);
};

export default errorHandler;
