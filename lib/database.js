const mysql = require('mysql2/promise');
const config = require('../config/environment');

let pool = null;

/**
 * Initialize MySQL connection pool
 */
async function initializePool() {
  try {
    pool = mysql.createPool({
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      waitForConnections: true,
      connectionLimit: config.DB_POOL_LIMIT,
      queueLimit: 0,
      timezone: config.DB_TIMEZONE,
      supportBigNumbers: true,
      bigNumberStrings: true,
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 0
    });

    // Test the connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully!');
    console.log(`📌 Host: ${config.DB_HOST}:${config.DB_PORT}`);
    console.log(`📌 Database: ${config.DB_NAME}`);
    console.log(`📌 User: ${config.DB_USER}`);
    connection.release();

    return pool;
  } catch (error) {
    console.error('❌ Failed to connect to MySQL:', error.message);
    throw error;
  }
}

/**
 * Get database pool (initialize if needed)
 */
async function getPool() {
  if (!pool) {
    await initializePool();
  }
  return pool;
}

/**
 * Execute a query with parameters
 * @param {string} sql - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise} Query result
 */
async function query(sql, params = []) {
  try {
    const db = await getPool();
    const [rows] = await db.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    console.error('Query:', sql);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Execute multiple queries in a transaction
 * @param {array} queries - Array of {sql, params} objects
 * @returns {Promise} Results array
 */
async function transaction(queries) {
  const connection = await (await getPool()).getConnection();
  
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const q of queries) {
      const [rows] = await connection.execute(q.sql, q.params || []);
      results.push(rows);
    }
    
    await connection.commit();
    console.log(`✅ Transaction completed with ${queries.length} queries`);
    return results;
  } catch (error) {
    await connection.rollback();
    console.error('❌ Transaction failed, rolled back:', error.message);
    throw error;
  } finally {
    await connection.release();
  }
}

/**
 * Get a single row
 * @param {string} sql - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise} First row or null
 */
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Insert a row and get the inserted ID
 * @param {string} table - Table name
 * @param {object} data - Data to insert
 * @returns {Promise} Insert result with insertId
 */
async function insert(table, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  const result = await query(sql, values);
  return result;
}

/**
 * Update rows
 * @param {string} table - Table name
 * @param {object} data - Data to update
 * @param {string} where - WHERE clause condition (e.g., 'id = ?')
 * @param {array} params - WHERE clause parameters
 * @returns {Promise} Update result
 */
async function update(table, data, where, params = []) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map(key => `${key} = ?`).join(', ');
  
  const sql = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
  const allParams = [...values, ...params];
  
  const result = await query(sql, allParams);
  return result;
}

/**
 * Delete rows
 * @param {string} table - Table name
 * @param {string} where - WHERE clause condition (e.g., 'id = ?')
 * @param {array} params - WHERE clause parameters
 * @returns {Promise} Delete result
 */
async function deleteRow(table, where, params = []) {
  const sql = `DELETE FROM ${table} WHERE ${where}`;
  const result = await query(sql, params);
  return result;
}

/**
 * Close the connection pool
 */
async function closePool() {
  if (pool) {
    await pool.end();
    console.log('✅ MySQL connection pool closed');
    pool = null;
  }
}

/**
 * Get database statistics
 */
async function getStats() {
  try {
    const connection = await (await getPool()).getConnection();
    const [result] = await connection.query('SELECT DATABASE() as db, USER() as user, NOW() as now');
    connection.release();
    return result[0];
  } catch (error) {
    console.error('Error getting database stats:', error.message);
    return null;
  }
}

module.exports = {
  initializePool,
  getPool,
  query,
  queryOne,
  transaction,
  insert,
  update,
  deleteRow,
  closePool,
  getStats
};
