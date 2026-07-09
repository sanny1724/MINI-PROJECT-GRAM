import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import errorHandler from './middlewares/error.js';

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Limit requests from same API (Rate limiting)
const limiter = rateLimit({
  max: 300, // Limit each IP to 300 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again in 15 minutes',
  },
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);

// Health check / welcome endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Restaurant Reservation API',
    status: 'healthy',
  });
});

// Handle undefined routes (404)
app.use('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server`);
  err.statusCode = 404;
  next(err);
});

// Centralized error handler
app.use(errorHandler);

export default app;
