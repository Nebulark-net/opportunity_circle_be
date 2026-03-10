import { v4 as uuidv4 } from 'uuid';

const correlationMiddleware = (req, res, next) => {
  const correlationId = req.header('x-correlation-id') || uuidv4();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
};

export default correlationMiddleware;
