const fs = require('fs');
const path = require('path');

// So sánh 2 file JSON content
const file1Path = path.join(__dirname, '..', 'data', 'content.json');
const file2Path = path.join(__dirname, '..', 'public', 'data', 'content.json');

console.log('🔍 So sánh nội dung giữa CMS export và public content...\n');

try {
  const content1 = JSON.parse(fs.readFileSync(file1Path, 'utf8'));
  const content2 = JSON.parse(fs.readFileSync(file2Path, 'utf8'));

  console.log('📁 File 1 (CMS export):', file1Path);
  console.log('📁 File 2 (Public content):', file2Path);
  console.log('');

  // So sánh metadata
  console.log('📊 Metadata:');
  console.log('  CMS export time:', content1._metadata?.exportedAt || 'N/A');
  console.log('  Public export time:', content2._metadata?.exportedAt || 'N/A');
  console.log('');

  // So sánh các sections chính
  const sections = ['banners', 'about', 'products', 'testimonials', 'news', 'contact', 'gallery'];
  
  let allMatch = true;
  
  for (const section of sections) {
    const count1 = Array.isArray(content1[section]) ? content1[section].length : (content1[section] ? 1 : 0);
    const count2 = Array.isArray(content2[section]) ? content2[section].length : (content2[section] ? 1 : 0);
    
    const match = count1 === count2;
    const icon = match ? '✅' : '❌';
    
    console.log(`${icon} ${section}:`);
    console.log(`   CMS: ${count1} items | Public: ${count2} items`);
    
    if (!match) {
      allMatch = false;
    }
  }

  console.log('');
  
  if (allMatch) {
    console.log('✅ Tất cả sections đều khớp về số lượng!');
    console.log('🎉 CMS export và public content đã đồng bộ.');
  } else {
    console.log('⚠️  Có sự khác biệt giữa CMS export và public content.');
    console.log('💡 Có thể cần copy data/content.json → public/data/content.json');
  }

  // Kiểm tra chi tiết một vài trường quan trọng
  console.log('\n📋 Sample check (banners):');
  if (content1.banners?.[0] && content2.banners?.[0]) {
    console.log('  CMS banner 1 title:', content1.banners[0].title);
    console.log('  Public banner 1 title:', content2.banners[0].title);
    console.log('  Match:', content1.banners[0].title === content2.banners[0].title ? '✅' : '❌');
  }

} catch (error) {
  console.error('❌ Lỗi khi so sánh:', error.message);
  process.exit(1);
}
