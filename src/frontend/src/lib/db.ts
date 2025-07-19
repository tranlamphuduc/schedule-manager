import mysql from 'mysql2/promise'

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'schedule_manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+07:00', // Vietnam timezone
}

// Create connection pool
let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Get a single connection
export async function getConnection(): Promise<mysql.PoolConnection> {
  const pool = getPool()
  return await pool.getConnection()
}

// Execute query with connection pool
export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  const pool = getPool()
  try {
    const [rows] = await pool.execute(query, params)
    return rows as T[]
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Execute single query and return first result
export async function executeQuerySingle<T = any>(
  query: string,
  params: any[] = []
): Promise<T | null> {
  const results = await executeQuery<T>(query, params)
  return results.length > 0 ? results[0] : null
}

// Execute insert query and return inserted ID
export async function executeInsert(
  query: string,
  params: any[] = []
): Promise<string> {
  const pool = getPool()
  try {
    const [result] = await pool.execute(query, params)
    const insertResult = result as mysql.ResultSetHeader
    return insertResult.insertId?.toString() || ''
  } catch (error) {
    console.error('Database insert error:', error)
    throw error
  }
}

// Execute update/delete query and return affected rows
export async function executeUpdate(
  query: string,
  params: any[] = []
): Promise<number> {
  const pool = getPool()
  try {
    const [result] = await pool.execute(query, params)
    const updateResult = result as mysql.ResultSetHeader
    return updateResult.affectedRows
  } catch (error) {
    console.error('Database update error:', error)
    throw error
  }
}

// Transaction helper
export async function withTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getConnection()
  
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool()
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    console.log('Database connection successful')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Close all connections
export async function closeConnections(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

// Database utility functions
export const db = {
  query: executeQuery,
  querySingle: executeQuerySingle,
  insert: executeInsert,
  update: executeUpdate,
  transaction: withTransaction,
  test: testConnection,
  close: closeConnections,
}

export default db
