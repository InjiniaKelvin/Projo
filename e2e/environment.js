/**
 * Detox Test Environment
 */

const DetoxEnvironment = require('detox/runners/jest/environment');

class CustomDetoxEnvironment extends DetoxEnvironment {
 constructor(config, context) {
 super(config, context);
 }

 async setup() {
 await super.setup();
 
 // Add custom setup logic here if needed
 }

 async teardown() {
 await super.teardown();
 }
}

module.exports = CustomDetoxEnvironment;
