const path = require('path');
const svc = require(path.join(__dirname, '..', 'cms', 'services', 'exportService'));

(async () => {
  try {
    console.log('Calling CMS manualExport()...');
    const res = svc.manualExport();
    console.log('Export call returned:', res);
  } catch (err) {
    console.error('Export failed:', err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
