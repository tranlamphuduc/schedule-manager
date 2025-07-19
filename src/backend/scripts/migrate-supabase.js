#!/usr/bin/env node

/**
 * Script to run migrations on Supabase database
 * Usage: node scripts/migrate-supabase.js
 */

require('dotenv').config({ path: '.env.production' });
const knex = require('knex');

// Supabase connection string
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=require`;

console.log('🔗 Connection string:', connectionString.replace(process.env.DB_PASSWORD, '***'));

// Supabase connection configuration
const config = {
  client: 'pg',
  connection: connectionString,
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: '../migrations'
  }
};

async function runMigrations() {
  const db = knex(config);
  
  try {
    console.log('🚀 Starting Supabase migrations...');
    
    // Test connection
    await db.raw('SELECT 1');
    console.log('✅ Connected to Supabase database');
    
    // Run migrations
    const [batchNo, log] = await db.migrate.latest();
    
    if (log.length === 0) {
      console.log('✅ Database is already up to date');
    } else {
      console.log(`✅ Batch ${batchNo} run: ${log.length} migrations`);
      log.forEach(migration => {
        console.log(`   - ${migration}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run migrations
runMigrations();
