/**
 * Sync content.json from Website to CMS
 * Keeps content synchronized between frontend and admin
 */

const fs = require('fs');
const path = require('path');

// Define paths
const websiteContentPath = path.join(__dirname, '../website/data/content.json');
const cmsContentPath = path.join(__dirname, '../cms/data/content.json');
const sharedContentPath = path.join(__dirname, '../shared/content.json');

console.log('🔄 Starting content synchronization...\n');

try {
  // Check if source file exists
  if (!fs.existsSync(websiteContentPath)) {
    console.error('❌ Source file not found:', websiteContentPath);
    process.exit(1);
  }

  // Ensure CMS data directory exists
  const cmsDataDir = path.dirname(cmsContentPath);
  if (!fs.existsSync(cmsDataDir)) {
    fs.mkdirSync(cmsDataDir, { recursive: true });
    console.log('✅ Created CMS data directory');
  }

  // Copy website/data/content.json → cms/data/content.json
  fs.copyFileSync(websiteContentPath, cmsContentPath);
  console.log('✅ Copied: website/data/content.json → cms/data/content.json');

  // Copy to shared folder (backup)
  if (fs.existsSync(path.dirname(sharedContentPath))) {
    fs.copyFileSync(websiteContentPath, sharedContentPath);
    console.log('✅ Copied: website/data/content.json → shared/content.json');
  }

  // Display file info
  const stats = fs.statSync(websiteContentPath);
  const fileSize = (stats.size / 1024).toFixed(2);
  console.log(`\n📊 File size: ${fileSize} KB`);
  console.log(`📅 Last modified: ${stats.mtime.toLocaleString()}`);

  console.log('\n✅ Content synchronization completed successfully!');
  console.log('\n💡 CMS can now manage content at http://localhost:4000/admin');

} catch (error) {
  console.error('\n❌ Synchronization failed:', error.message);
  process.exit(1);
}
