const knex = require('knex');
require('dotenv').config();

// Simple database configuration for Vercel serverless
const config = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: {
    min: 0,
    max: 1,
    acquireTimeoutMillis: 5000,
    createTimeoutMillis: 5000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 5000
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
