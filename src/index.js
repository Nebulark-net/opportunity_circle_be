import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { app } from './app.js';
import logger from './utils/logger.js';
import initCronJobs from './utils/cron.js';

dotenv.config({
  path: './.env',
});

// Check for required environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'BACKEND_URL',
  'FRONTEND_URL'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initCronJobs();

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Store io in app for access in controllers/services
app.set('io', io);

io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  socket.on('join', (userId) => {
    socket.join(userId);
    logger.info(`User ${userId} joined their private room`);
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      logger.info(`Server is running at port http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('MONGO db connection failed !!! ', err);
  });

export { io };
