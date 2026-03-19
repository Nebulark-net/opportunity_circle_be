import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import passport from 'passport';
import './config/passport.js';
import correlationMiddleware from './middleware/correlation.js';
import errorHandler from './middleware/error.js';
import rateLimit from 'express-rate-limit';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

app.use(correlationMiddleware);

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later.',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per 15 minutes
  message: 'Too many login attempts from this IP, please try again later.',
});

// Apply limiters
app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);

app.use(passport.initialize());

// routes import
import authRouter from './api/authRoutes.js';
import opportunityRouter from './api/opportunityRoutes.js';
import seekerRouter from './api/seekerRoutes.js';
import onboardingRouter from './api/onboarding.routes.js';
import publisherRouter from './api/publisherRoutes.js';
import mentorRouter from './api/mentorRoutes.js';
import cmsRouter from './api/cmsRoutes.js';
import resourceRouter from './api/resourceRoutes.js';
import notificationRouter from './api/notificationRoutes.js';
import applicationRouter from './api/applicationRoutes.js';
import adminRouter from './api/adminRoutes.js';
import { specs, swaggerUi } from './config/swagger.js';

// routes declaration
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

app.use('/api/auth', authRouter);
app.use('/api/opportunities', opportunityRouter);
app.use('/api/seekers', seekerRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/publishers', publisherRouter);
app.use('/api/mentors', mentorRouter);
app.use('/api/cms', cmsRouter);
app.use('/api/resources', resourceRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/admin', adminRouter);

// http://localhost:5000/api/auth/register

app.use(errorHandler);

export { app };
