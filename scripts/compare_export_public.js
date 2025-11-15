const fs = require('fs');
const path = require('path');

const publicPath = path.join(__dirname, '..', 'public', 'data', 'content.json');
const exportPath = path.join(__dirname, '..', 'data', 'content.json');

function load(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { console.error('Failed to read', p, e.message); process.exit(2); }
}

function keys(obj) { return Object.keys(obj || {}).sort(); }

function sampleDiff(a, b) {
  const diffs = [];
  const allKeys = Array.from(new Set([...Object.keys(a||{}), ...Object.keys(b||{})]));
  for (const k of allKeys) {
    const va = a ? a[k] : undefined;
    const vb = b ? b[k] : undefined;
    if (JSON.stringify(va) !== JSON.stringify(vb)) {
      diffs.push({ key: k, publicSample: va === undefined ? undefined : (typeof va === 'object' ? (Array.isArray(va) ? `Array(${va.length})` : 'Object') : va), exportSample: vb === undefined ? undefined : (typeof vb === 'object' ? (Array.isArray(vb) ? `Array(${vb.length})` : 'Object') : vb) });
    }
  }
  return diffs;
}

const pub = load(publicPath);
const exp = load(exportPath);

console.log('📁 public file:', publicPath);
console.log('📁 export file:', exportPath);

const pubKeys = keys(pub);
const expKeys = keys(exp);

console.log('\n🔑 Top-level keys in public (count ' + pubKeys.length + '):', pubKeys.join(', '));
console.log('\n🔑 Top-level keys in export (count ' + expKeys.length + '):', expKeys.join(', '));

const missingInExport = pubKeys.filter(k => !expKeys.includes(k));
const missingInPublic = expKeys.filter(k => !pubKeys.includes(k));

if (missingInExport.length) console.log('\n⚠️ Keys present in public but missing in export:', missingInExport.join(', '));
if (missingInPublic.length) console.log('\n⚠️ Keys present in export but missing in public:', missingInPublic.join(', '));

const diffs = sampleDiff(pub, exp);
if (!diffs.length) {
  console.log('\n✅ Files are structurally identical (top-level values match).');
  process.exit(0);
}

console.log('\n❗ Top-level differences (sample):');
diffs.slice(0, 12).forEach(d => {
  console.log(`- ${d.key}: public -> ${JSON.stringify(d.publicSample)} | export -> ${JSON.stringify(d.exportSample)}`);
});

console.log(`\nTotal differing top-level keys: ${diffs.length}`);
process.exit(0);
