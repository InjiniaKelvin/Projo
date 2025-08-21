/**
 * Jest Configuration for Detox E2E Tests
 */

module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.test.js'],
  testTimeout: 120000,
  maxWorkers: 1,
  testEnvironment: 'detox/runners/jest/testEnvironment',
  setupFilesAfterEnv: ['<rootDir>/e2e/init.js'],
  verbose: true,
  transform: {},
  collectCoverage: false,
  moduleFileExtensions: ['js', 'json'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/tests/'
  ]
};
