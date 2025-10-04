/**
 * Local Development Server
 * This file is used for local development only
 * In production (Vercel), api/index.js is used instead
 */

const app = require('./app');
const config = require('./config/environment');
const db = require('./config/database');

/**
 * Start server function for local development
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

// Start server
startServer();
