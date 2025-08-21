/**
 * Global Setup for Detox Tests
 */

const detox = require('detox');

module.exports = async () => {
  console.log('🚀 Starting Detox global setup...');
  
  // Initialize Detox configuration
  await detox.globalInit();
  
  console.log('✅ Detox global setup completed');
};
