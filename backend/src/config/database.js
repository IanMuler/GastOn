const { Pool } = require('pg');
const config = require('./environment');

class DatabaseConnection {
  constructor() {
    this.pool = null;
  }

  /**
   * Initialize database connection pool
   * Uses connection pooling for better performance and resource management
   */
  async initialize() {
    try {
      // Configure pool settings for optimal performance
      const poolConfig = {
        connectionString: config.DATABASE_URL,
        min: config.DB_POOL_MIN,
        max: config.DB_POOL_MAX,
        idleTimeoutMillis: config.DB_POOL_IDLE_TIMEOUT,
        connectionTimeoutMillis: config.DB_POOL_CONNECTION_TIMEOUT,
        ssl: config.DB_SSL ? { rejectUnauthorized: false } : false,
      };

      this.pool = new Pool(poolConfig);

      // Handle pool errors
      this.pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
      });

      // Test the connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      console.log('✅ Database connection pool initialized successfully');
      
      if (config.isDevelopment) {
        console.log(`📊 Pool config: min=${poolConfig.min}, max=${poolConfig.max}`);
      }

    } catch (error) {
      console.error('❌ Failed to initialize database connection:', error);
      throw error;
    }
  }

  /**
   * Execute a query with error handling and connection management
   * @param {string} text - SQL query string
   * @param {Array} params - Query parameters
   * @returns {Object} Query result
   */
  async query(text, params = []) {
    const start = Date.now();
    
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (config.isDevelopment) {
        console.log('🔍 Executed query', { 
          text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          duration: `${duration}ms`,
          rows: result.rowCount 
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Database query error:', {
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        params,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Execute a transaction with automatic rollback on error
   * @param {Function} callback - Transaction operations
   * @returns {*} Transaction result
   */
  async transaction(callback) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get connection pool statistics for monitoring
   * @returns {Object} Pool statistics
   */
  getPoolStats() {
    if (!this.pool) {
      return { error: 'Pool not initialized' };
    }

    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }

  /**
   * Gracefully close the connection pool
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('🔒 Database connection pool closed');
    }
  }
}

// Create singleton instance
const db = new DatabaseConnection();

module.exports = db;