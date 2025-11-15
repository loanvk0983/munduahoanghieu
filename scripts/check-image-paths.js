#!/usr/bin/env node

/**
 * Script kiểm tra tất cả image paths trong project
 * Đảm bảo tất cả đều dùng absolute path (bắt đầu bằng /)
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Các pattern cần kiểm tra
const PATTERNS = [
  { regex: /src=["']assets\//g, name: 'HTML img src' },
  { regex: /src:\s*["']assets\//g, name: 'JS object src' },
  { regex: /url\(["']?assets\//g, name: 'CSS url()' },
  { regex: /background(-image)?:\s*url\(["']?assets\//g, name: 'CSS background' },
];

// Các thư mục cần scan
const SCAN_DIRS = [
  'views',
  'public/js',
  'src'
];

// Các file extension cần check
const EXTENSIONS = ['.twig', '.html', '.js', '.css'];

let totalErrors = 0;
let filesScanned = 0;

function scanDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (EXTENSIONS.includes(path.extname(item))) {
      checkFile(fullPath);
    }
  });
}

function checkFile(filePath) {
  filesScanned++;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let fileHasErrors = false;
  
  lines.forEach((line, lineIndex) => {
    PATTERNS.forEach(pattern => {
      const matches = line.matchAll(pattern.regex);
      
      for (const match of matches) {
        if (!fileHasErrors) {
          console.log(`\n${COLORS.red}❌ ${filePath}${COLORS.reset}`);
          fileHasErrors = true;
        }
        
        totalErrors++;
        console.log(
          `  ${COLORS.yellow}Line ${lineIndex + 1}:${COLORS.reset} ` +
          `${pattern.name} - ${COLORS.blue}${match[0]}${COLORS.reset}`
        );
        
        // Show context
        const start = Math.max(0, match.index - 20);
        const end = Math.min(line.length, match.index + match[0].length + 20);
        const context = line.substring(start, end);
        console.log(`  ${COLORS.yellow}>${COLORS.reset} ...${context}...`);
      }
    });
  });
}

console.log(`${COLORS.blue}🔍 Checking image paths...${COLORS.reset}\n`);

SCAN_DIRS.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    console.log(`Scanning: ${dir}/`);
    scanDirectory(fullPath);
  }
});

console.log(`\n${COLORS.blue}─────────────────────────────────────${COLORS.reset}`);
console.log(`Files scanned: ${filesScanned}`);

if (totalErrors > 0) {
  console.log(`${COLORS.red}❌ Found ${totalErrors} relative path(s)${COLORS.reset}`);
  console.log(`\n${COLORS.yellow}Fix by running:${COLORS.reset}`);
  console.log(`  node scripts/fix-image-paths.js`);
  process.exit(1);
} else {
  console.log(`${COLORS.green}✅ All image paths are absolute!${COLORS.reset}`);
  process.exit(0);
}
