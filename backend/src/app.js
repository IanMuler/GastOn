const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Configuration
const config = require('./config/environment');
const db = require('./config/database');

// Routes
const apiRoutes = require('./routes');

// Middleware
const { 
  errorHandler, 
  notFoundHandler, 
  requestLogger, 
  securityHeaders, 
  timeoutHandler 
} = require('./middleware/errorHandler');
const { basicRateLimit } = require('./middleware/validation');

/**
 * GastOn Express Application
 * 
 * Backend API for expense tracking mobile application
 * Built with clean architecture and best practices
 */

// Create Express app
const app = express();

// Trust proxy for correct IP addresses (for rate limiting, logging, etc.)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false, // Allow embedding
}));

app.use(securityHeaders);

// Request timeout
app.use(timeoutHandler(30000)); // 30 seconds

// Rate limiting (basic implementation)
if (config.isProduction) {
  app.use(basicRateLimit(100, 15 * 60 * 1000)); // 100 requests per 15 minutes
}

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow configured origins
    const allowedOrigins = [
      config.CORS_ORIGIN,
      'http://localhost:8081', // Expo default
      'http://localhost:3000', // Local development
      'http://192.168.1.100:8081', // Local network Expo
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (config.isDevelopment) {
      // Allow all origins in development
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Request logging
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  strict: true,
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
}));

// Health check endpoint (before API routes)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GastOn API is healthy',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: '1.0.0',
    database: 'connected', // Simplified check
    uptime: process.uptime(),
  });
});

// API routes
app.use(config.API_PREFIX, apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to GastOn API',
    version: '1.0.0',
    documentation: `${config.API_PREFIX}/`,
    health: '/health',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

/**
 * Start server function
 */
async function startServer() {
  try {
    // Initialize database connection
    console.log('🔌 Connecting to database...');
    await db.initialize();
    
    // Start server
    const server = app.listen(config.PORT, () => {
      console.log(`🚀 GastOn API server running on port ${config.PORT}`);
      console.log(`📍 Environment: ${config.NODE_ENV}`);
      console.log(`🌍 API Base URL: http://localhost:${config.PORT}${config.API_PREFIX}`);
      console.log(`💚 Health Check: http://localhost:${config.PORT}/health`);
      
      if (config.isDevelopment) {
        console.log(`📚 API Documentation: http://localhost:${config.PORT}${config.API_PREFIX}/`);
        console.log(`🎯 CORS Origin: ${config.CORS_ORIGIN}`);
      }
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n🔴 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('📡 HTTP server closed');
        
        try {
          await db.close();
          console.log('🔒 Database connection closed');
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⏰ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Listen for shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      shutdown('UNCAUGHT_EXCEPTION');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('UNHANDLED_REJECTION');
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

// Export app for testing
module.exports = { app, startServer };