const { Client } = require('pg');

// Test direct connection without Knex
async function testDirectConnection() {
  const connectionString = 'postgresql://postgres:%211TaMaZaToKa@db.vqidmflvtrrxnzspqkka.supabase.co:5432/postgres';
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT 1 as test');
    console.log('✅ Query successful:', result.rows[0]);
    
    await client.end();
    console.log('✅ Connection closed');
    
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Export for use in API
module.exports = { testDirectConnection };

// Run test if called directly
if (require.main === module) {
  testDirectConnection();
}
