(async () => {
  try {
    console.log('Running E2E test for CMS -> Website sync');
    const api = require('../cms/routes/api');

    console.log('\n-> Running preview flow (runPreview)');
    const preview = await api.runPreview();
    console.log('Preview result:', preview);

    console.log('\n-> Running build flow (runBuild)');
    const build = await api.runBuild();
    console.log('Build result:', build);

    console.log('\nE2E test completed');
  } catch (err) {
    console.error('E2E test failed:', err);
    process.exit(1);
  }
})();
