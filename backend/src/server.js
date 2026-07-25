// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import dashboardRoutes from './routes/dashboard.js';
import settingsRoutes from './routes/settings.js';
import lgdRoutes from './routes/lgd.js';
import { seedDemoData } from './seed.js';

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Request logging middleware for debugging API calls
app.use((req, res, next) => {
  console.log(`[API Request]: ${req.method} ${req.path}`);
  next();
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/lgd', lgdRoutes);

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'running', service: 'StockFlow MVP API' });
});

// Root handler
app.get('/', (req, res) => {
  res.send('StockFlow MVP Backend API is running');
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, async () => {
  console.log(`===================================================`);
  console.log(`🚀 StockFlow MVP Backend Server running!`);
  console.log(`   Local Server: http://localhost:${PORT}`);
  console.log(`===================================================`);
  
  // Seed demo data on startup if not already seeded
  await seedDemoData();
});

// Force nodemon reload
