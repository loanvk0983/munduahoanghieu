#!/usr/bin/env node

/**
 * Script tự động fix tất cả relative image paths thành absolute paths
 * Chạy sau khi check-image-paths.js phát hiện lỗi
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

// Các replacement rules
const REPLACEMENTS = [
  { from: /src=["']assets\//g, to: 'src="/assets/', name: 'HTML img src' },
  { from: /src:\s*["']assets\//g, to: (match) => match.replace('assets/', '/assets/'), name: 'JS object src' },
  { from: /url\(["']?assets\//g, to: (match) => match.replace('assets/', '/assets/'), name: 'CSS url()' },
];

const SCAN_DIRS = ['views', 'public/js', 'src'];
const EXTENSIONS = ['.twig', '.html', '.js', '.css'];

let filesFixed = 0;
let totalReplacements = 0;

function fixDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixDirectory(fullPath);
    } else if (EXTENSIONS.includes(path.extname(item))) {
      fixFile(fullPath);
    }
  });
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let replacements = 0;
  
  REPLACEMENTS.forEach(rule => {
    const matches = content.match(rule.from);
    if (matches) {
      const count = matches.length;
      content = content.replace(rule.from, rule.to);
      replacements += count;
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesFixed++;
    totalReplacements += replacements;
    console.log(
      `${COLORS.green}✅${COLORS.reset} ${filePath} ` +
      `${COLORS.yellow}(${replacements} fix${replacements > 1 ? 'es' : ''})${COLORS.reset}`
    );
  }
}

console.log(`${COLORS.blue}🔧 Fixing image paths...${COLORS.reset}\n`);

SCAN_DIRS.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    console.log(`Scanning: ${dir}/`);
    fixDirectory(fullPath);
  }
});

console.log(`\n${COLORS.blue}─────────────────────────────────────${COLORS.reset}`);

if (filesFixed > 0) {
  console.log(`${COLORS.green}✅ Fixed ${totalReplacements} path(s) in ${filesFixed} file(s)${COLORS.reset}`);
  console.log(`\n${COLORS.yellow}Run check again:${COLORS.reset}`);
  console.log(`  node scripts/check-image-paths.js`);
} else {
  console.log(`${COLORS.green}✅ No fixes needed!${COLORS.reset}`);
}
