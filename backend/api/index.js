/**
 * Vercel Serverless Entry Point
 *
 * This file serves as the entry point for Vercel serverless functions
 * It imports the Express app and exports it for Vercel to handle
 */

// Import the Express app from src
const app = require('../src/app');

// Export for Vercel serverless
module.exports = app;
