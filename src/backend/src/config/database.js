const knex = require('knex');
require('dotenv').config();

// Database configuration optimized for Vercel serverless
const config = {
  client: 'pg',
  connection: process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  } : {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'schedule_manager',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },
  pool: {
    min: 0, // Serverless functions start with 0 connections
    max: 1, // Limit connections for serverless
    acquireTimeoutMillis: 10000, // Reduced timeout
    createTimeoutMillis: 10000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 10000, // Reduced idle timeout
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
    propagateCreateError: false
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: '../migrations'
  },
  seeds: {
    directory: '../seeds'
  }
};

const db = knex(config);

// Test connection with timeout
const testConnection = async () => {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
};

// Test connection on startup
testConnection();

// Cleanup connections on process exit (important for serverless)
process.on('SIGINT', () => {
  db.destroy(() => {
    console.log('Database connections closed');
    process.exit(0);
  });
});

module.exports = db;
