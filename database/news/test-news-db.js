#!/usr/bin/env node
/**
 * Test script to check if news data exists in database
 */

const path = require('path');
const config = require('../../config/environment');
const db = require('../../lib/database');
const NewsController = require('../../src/controllers/newsController');

async function testNewsDatabase() {
  try {
    console.log('🧪 Starting News Database Test...\n');
    
    // Initialize database
    console.log('1️⃣ Initializing database pool...');
    await db.initializePool();
    console.log('✅ Database pool initialized\n');
    
    // Check if news table exists
    console.log('2️⃣ Checking if news table exists...');
    const tableCheck = await db.query(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'news'
    `, [config.DB_NAME]);
    
    if (tableCheck.length === 0) {
      console.error('❌ News table does not exist!');
      return;
    }
    console.log('✅ News table exists\n');
    
    // Check total news count
    console.log('3️⃣ Checking total news count...');
    const countResult = await db.queryOne('SELECT COUNT(*) as count FROM news');
    const totalNews = countResult.count;
    console.log(`✅ Total news in database: ${totalNews}\n`);
    
    if (totalNews === 0) {
      console.warn('⚠️ No news articles found in database!');
      console.log('Please insert sample data using news_database.sql');
      return;
    }
    
    // Raw query test
    console.log('4️⃣ Running raw query to fetch first 3 news...');
    const rawNews = await db.query(`
      SELECT 
        n.id,
        n.title,
        n.excerpt,
        n.category,
        n.category_name as categoryName,
        n.date,
        n.views,
        n.cover,
        n.content
      FROM news n
      LIMIT 3
    `);
    console.log('✅ Raw query result:');
    console.log(JSON.stringify(rawNews, null, 2));
    console.log();
    
    // Test NewsController.getAllNews()
    console.log('5️⃣ Testing NewsController.getAllNews()...');
    const allNews = await NewsController.getAllNews();
    console.log(`✅ Got ${allNews.length} news articles from controller`);
    console.log('First article:');
    console.log(JSON.stringify(allNews[0] || {}, null, 2));
    console.log();
    
    // Test with category filter
    console.log('6️⃣ Testing category filter (techniques)...');
    const filteredNews = await NewsController.getAllNews('techniques');
    console.log(`✅ Got ${filteredNews.length} articles with category 'techniques'\n`);
    
    console.log('✅ All tests passed!');
    console.log('\n📊 Summary:');
    console.log(`- Total news: ${totalNews}`);
    console.log(`- getAllNews() returns: ${allNews.length} items`);
    console.log(`- Filtered news: ${filteredNews.length} items`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await db.closePool();
    process.exit(0);
  }
}

// Run test
testNewsDatabase();
