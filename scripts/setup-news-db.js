#!/usr/bin/env node
/**
 * Setup News Database
 * This script initializes the news database table and imports sample data
 * Usage: node scripts/setup-news-db.js
 */

const path = require('path');
const fs = require('fs');
const db = require('../lib/database');

const config = require('../config/environment');

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...');
    console.log(`📌 Host: ${config.DB_HOST}:${config.DB_PORT}`);
    console.log(`📌 Database: ${config.DB_NAME}`);
    console.log(`📌 User: ${config.DB_USER}`);

    // Initialize database connection
    await db.initializePool();

    // Read the SQL schema file
    const sqlFile = path.join(__dirname, '../news_database.sql');
    if (!fs.existsSync(sqlFile)) {
      console.error('❌ SQL schema file not found:', sqlFile);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Split SQL statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    console.log(`\n📋 Found ${statements.length} SQL statements to execute`);

    // Execute statements
    let executed = 0;
    for (const statement of statements) {
      try {
        if (statement.length > 10) {
          await db.query(statement);
          executed++;
        }
      } catch (err) {
        // Ignore table already exists errors
        if (!err.message.includes('already exists')) {
          console.error('❌ Error executing statement:', err.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
        }
      }
    }

    console.log(`\n✅ Successfully executed ${executed} statements`);

    // Verify data
    const newsCount = await db.query('SELECT COUNT(*) as count FROM news');
    console.log(`\n📊 News table contains: ${newsCount[0].count} articles`);

    const categoryCount = await db.query('SELECT COUNT(DISTINCT category) as count FROM news_categories');
    console.log(`📊 Categories: ${categoryCount[0].count}`);

    const imagesCount = await db.query('SELECT COUNT(*) as count FROM news_images');
    console.log(`📊 Images linked: ${imagesCount[0].count}`);

    console.log('\n✅ Database setup completed successfully!');

    // Show sample query
    console.log('\n📝 Sample data:');
    const sample = await db.query('SELECT id, title, category_name, views FROM news LIMIT 3');
    console.table(sample);

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await db.closePool();
    process.exit(0);
  }
}

// Run setup
setupDatabase();
