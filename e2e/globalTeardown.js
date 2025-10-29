/**
 * Global Teardown for Detox Tests
 */

const detox = require('detox');

module.exports = async () => {
 console.log(' Starting Detox global teardown...');
 
 // Clean up Detox
 await detox.globalCleanup();
 
 console.log('[COMPLETED] Detox global teardown completed');
};
