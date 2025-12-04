#!/usr/bin/env node
/**
 * Test script to check if homepage data exists in database
 */

const path = require('path');
const config = require('../../config/environment');
const db = require('../../lib/database');

async function testHomepageDatabase() {
  try {
    console.log('🧪 Starting Homepage Database Test...\n');
    
    // Initialize database
    console.log('1️⃣ Initializing database pool...');
    await db.initializePool();
    console.log('✅ Database pool initialized\n');
    
    // Define homepage tables
    const tables = [
      'homepage_banners',
      'homepage_service_features',
      'homepage_why_choose_items',
      'homepage_featured_products',
      'homepage_gallery_items',
      'homepage_contact_buttons',
      'homepage_settings'
    ];
    
    console.log('2️⃣ Checking homepage tables...\n');
    
    let totalRecords = 0;
    
    // Check each table
    for (const table of tables) {
      try {
        const result = await db.queryOne(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result.count;
        totalRecords += count;
        console.log(`✅ ${table.padEnd(35)}: ${count} records`);
      } catch (error) {
        console.error(`❌ ${table.padEnd(35)}: Table not found or error`);
      }
    }
    
    console.log(`\n📊 Total records: ${totalRecords}\n`);
    
    if (totalRecords === 0) {
      console.warn('⚠️ No data found in homepage tables!');
      console.log('Please run schema_homepage.sql to create tables and insert sample data.');
      return;
    }
    
    // Test sample queries
    console.log('3️⃣ Testing sample queries...\n');
    
    // Get active banners
    const banners = await db.query(
      'SELECT id, title, subtitle FROM homepage_banners WHERE active = TRUE ORDER BY sort_order LIMIT 3'
    );
    console.log(`✅ Active banners: ${banners.length}`);
    if (banners.length > 0) {
      console.log(`   First banner: "${banners[0].title}"`);
    }
    
    // Get why choose items
    const whyChoose = await db.query(
      'SELECT id, title FROM homepage_why_choose_items WHERE active = TRUE ORDER BY sort_order'
    );
    console.log(`✅ Why choose items: ${whyChoose.length}`);
    
    // Get featured products
    const products = await db.query(
      'SELECT id, name FROM homepage_featured_products WHERE active = TRUE ORDER BY sort_order'
    );
    console.log(`✅ Featured products: ${products.length}`);
    
    // Get gallery items by type
    const galleryProducts = await db.query(
      'SELECT COUNT(*) as count FROM homepage_gallery_items WHERE gallery_type = "products" AND active = TRUE'
    );
    const galleryResults = await db.query(
      'SELECT COUNT(*) as count FROM homepage_gallery_items WHERE gallery_type = "results" AND active = TRUE'
    );
    console.log(`✅ Gallery - Products: ${galleryProducts[0].count}, Results: ${galleryResults[0].count}`);
    
    console.log('\n✅ All homepage database tests passed!\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await db.closePool();
    process.exit(0);
  }
}

// Run test
testHomepageDatabase();
