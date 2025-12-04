#!/usr/bin/env node
/**
 * Quick Diagnosis Script for News System
 * Run this to identify any remaining issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 QUICK NEWS SYSTEM DIAGNOSIS\n');
console.log('=' .repeat(60));

// Check 1: Files exist
console.log('\n✓ FILE CHECK:');
const files = [
  'src/controllers/newsController.js',
  'src/server.js',
  'views/news.twig',
  'lib/database.js'
];

files.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Check 2: Key code patterns
console.log('\n✓ CODE PATTERN CHECK:');

const serverCode = fs.readFileSync(path.join(__dirname, 'src/server.js'), 'utf8');
const hasObjectPass = serverCode.includes('quickNewsData: quickNews,');
console.log(`  ${hasObjectPass ? '✅' : '❌'} server.js passes objects to Twig`);

const twigCode = fs.readFileSync(path.join(__dirname, 'views/news.twig'), 'utf8');
const hasJsonLoad = twigCode.includes('allNewsDataJson|raw');
console.log(`  ${hasJsonLoad ? '✅' : '❌'} news.twig loads from JSON stringify`);

const controllerCode = fs.readFileSync(path.join(__dirname, 'src/controllers/newsController.js'), 'utf8');
const fixedSQL = !controllerCode.includes('FIND_IN_SET');
console.log(`  ${fixedSQL ? '✅' : '❌'} newsController.js SQL is fixed`);

// Check 3: Environment
console.log('\n✓ ENVIRONMENT CHECK:');
const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const hasDatabaseConfig = envFile.includes('DB_HOST');
console.log(`  ${hasDatabaseConfig ? '✅' : '❌'} .env has database config`);

// Check 4: Database
console.log('\n✓ DATABASE TABLE CHECK:');
console.log('  Run: node test-news-db.js');
console.log('  This will verify:');
console.log('    - Database connection');
console.log('    - News table exists');
console.log('    - Sample data exists');
console.log('    - getAllNews() works');

console.log('\n' + '='.repeat(60));
console.log('\n📱 BROWSER CONSOLE CHECKS:\n');
console.log('1. Open http://localhost:8080/tin-tuc');
console.log('2. Open DevTools (F12) → Console tab');
console.log('3. Paste these commands:\n');

console.log('  console.log("Data check:")');
console.log('  console.log("- mockNewsData:", mockNewsData.length, "items");');
console.log('  console.log("- quickNewsData:", quickNewsData.length, "items");');
console.log('  console.log("- First news:", mockNewsData[0]);');
console.log('\n4. Check if all outputs are correct\n');

console.log('=' .repeat(60));
console.log('\n✨ If everything is ✅, your news system should work!\n');
