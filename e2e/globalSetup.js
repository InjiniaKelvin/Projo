/**
 * Global Setup for Detox Tests
 */

const detox = require('detox');

module.exports = async () => {
 console.log('[LAUNCH] Starting Detox global setup...');
 
 // Initialize Detox configuration
 await detox.globalInit();
 
 console.log('[COMPLETED] Detox global setup completed');
};
