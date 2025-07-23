const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const categoryRoutes = require('./routes/categories');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  process.env.FRONTEND_URL,
  'https://schedule-manager-frontend-three.vercel.app',
  'https://schedule-manager-frontend-git-main-phuduc-projects-36c1004.vercel.app',
  'https://schedule-manager-frontend-kom08a3s-phuduc-projects-36c1004.vercel.app',
  'https://schedule-manager-frontend-f1884uq30-phuducs-projects-36c10014.vercel.app',
  'https://your-app.vercel.app' // Will be updated with actual domain
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow all Vercel preview deployments
    if (origin && origin.includes('.vercel.app')) {
      return callback(null, true);
    }

    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 */
// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Database test endpoint
app.get('/test-db', async (req, res) => {
  try {
    const db = require('./config/database');
    const result = await db.raw('SELECT 1 as test');
    res.json({
      status: 'Database connected',
      result: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Direct connection test
app.get('/test-direct', async (req, res) => {
  try {
    const { testDirectConnection } = require('../test-direct-connection');
    const result = await testDirectConnection();

    if (result.success) {
      res.json({
        status: 'Direct connection successful',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        status: 'Direct connection failed',
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'Direct connection test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Schedule Manager API Documentation'
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📅 Schedule Manager Backend API`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`💡 Health Check: http://localhost:${PORT}/health`);
  });
} else {
  console.log('🚀 Schedule Manager Backend API ready for Vercel');
}

module.exports = app;
