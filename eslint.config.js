// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
 expoConfig,
 {
 ignores: ['dist/*'],
 },
 {
 files: ['e2e/**/*.js', 'e2e/**/*.ts'],
 languageOptions: {
 globals: {
 // Jest globals
 describe: 'readonly',
 it: 'readonly',
 test: 'readonly',
 beforeAll: 'readonly',
 beforeEach: 'readonly',
 afterAll: 'readonly',
 afterEach: 'readonly',
 expect: 'readonly',
 jest: 'readonly',
 // Detox globals
 device: 'readonly',
 element: 'readonly',
 by: 'readonly',
 waitFor: 'readonly',
 // Node globals
 console: 'readonly',
 process: 'readonly',
 Buffer: 'readonly',
 __dirname: 'readonly',
 __filename: 'readonly',
 global: 'readonly',
 require: 'readonly',
 module: 'readonly',
 exports: 'readonly'
 }
 }
 }
]);
