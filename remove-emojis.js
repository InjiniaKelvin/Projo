#!/usr/bin/env node

/**
 * Emoji Removal Script for QuickFix Project
 * 
 * This script removes all emoji characters from JavaScript and TypeScript files
 * while preserving functionality and keeping emojis in markdown documentation.
 * 
 * Usage: node remove-emojis.js
 */

const fs = require('fs');
const path = require('path');

// Directories to scan
const SCAN_DIRECTORIES = [
  './contexts',
  './services',
  './backend',
  './Screens',
  './components',
  './app',
  './scripts',
  './Utils'
];

// Root level test files
const ROOT_TEST_FILES = [
  './test-complete-booking-flow.js',
  './test-booking-flow.js',
  './test-exact-web-flow.js',
  './test-booking-no-index.js',
  './test-web-simulation.js',
  './test-coordinate-structure.js',
  './test-booking-submission.js',
  './ultimate-booking-diagnostic.js',
  './comprehensive-booking-diagnostic.js',
  './booking-navigation-test.js',
  './booking-success-report.js',
  './debug-access-control.js',
  './debug-booking-simple.js',
  './e2e-booking-test.js',
  './final-booking-test.js',
  './fix-booking-issues.js',
  './fix-userid-references.js',
  './live-booking-test.js',
  './quick-booking-proof.js',
  './quick-booking-test.js',
  './response-format-test.js',
  './simple-booking-test.js',
  './validate-booking-replacement.js',
  './cleanup-indexes.js',
  './server.js',
  './server-mock.js'
];

// Shell script files
const SHELL_SCRIPTS = [
  './fix-vscode-hang.sh',
  './optimize-vscode.sh',
  './performance-monitor.sh',
  './restart-vscode-light.sh',
  './start-lightweight-vscode.sh',
  './test-e2e-booking-flow.sh',
  './run-e2e-tests.sh',
  './start-backend.sh'
];

// Files to exclude (documentation, etc.)
const EXCLUDE_PATTERNS = [
  /\.md$/,
  /README/,
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /\.expo/
];

// Emoji regex pattern - matches most common emojis
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F910}-\u{1F96B}\u{1F980}-\u{1F9E0}\u{FE00}-\u{FE0F}\u{200D}]/gu;

// Statistics
let stats = {
  filesScanned: 0,
  filesModified: 0,
  emojisRemoved: 0,
  errors: []
};

/**
 * Check if file should be excluded
 */
function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * Check if file is a JavaScript or TypeScript file
 */
function isCodeFile(filePath) {
  return /\.(js|jsx|ts|tsx)$/.test(filePath);
}

/**
 * Remove emojis from content
 */
function removeEmojis(content) {
  const matches = content.match(EMOJI_REGEX);
  if (matches) {
    stats.emojisRemoved += matches.length;
    return content.replace(EMOJI_REGEX, '');
  }
  return content;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    stats.filesScanned++;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const cleanedContent = removeEmojis(content);
    
    if (content !== cleanedContent) {
      fs.writeFileSync(filePath, cleanedContent, 'utf8');
      stats.filesModified++;
      console.log(`✓ Cleaned: ${filePath}`);
    }
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`✗ Error processing ${filePath}: ${error.message}`);
  }
}

/**
 * Recursively scan directory
 */
function scanDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠ Directory not found: ${dir}`);
    return;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    
    if (shouldExclude(fullPath)) {
      continue;
    }
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (stat.isFile() && isCodeFile(fullPath)) {
      processFile(fullPath);
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log('========================================');
  console.log('QuickFix Emoji Removal Script');
  console.log('========================================\n');
  
  console.log('Starting emoji removal process...\n');
  
  // Scan directories
  console.log('Scanning directories...');
  for (const dir of SCAN_DIRECTORIES) {
    console.log(`\n--- Processing directory: ${dir} ---`);
    scanDirectory(dir);
  }
  
  // Process root test files
  console.log('\n--- Processing root test files ---');
  for (const file of ROOT_TEST_FILES) {
    if (fs.existsSync(file)) {
      processFile(file);
    }
  }
  
  // Process shell scripts
  console.log('\n--- Processing shell scripts ---');
  for (const file of SHELL_SCRIPTS) {
    if (fs.existsSync(file)) {
      processFile(file);
    }
  }
  
  // Print summary
  console.log('\n========================================');
  console.log('EMOJI REMOVAL SUMMARY');
  console.log('========================================');
  console.log(`Files scanned: ${stats.filesScanned}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log(`Emojis removed: ${stats.emojisRemoved}`);
  console.log(`Errors: ${stats.errors.length}`);
  
  if (stats.errors.length > 0) {
    console.log('\nErrors encountered:');
    stats.errors.forEach(err => {
      console.log(`  - ${err.file}: ${err.error}`);
    });
  }
  
  console.log('\n✓ Emoji removal process completed!');
  console.log('========================================\n');
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    stats,
    note: 'Emojis preserved in markdown documentation files'
  };
  
  fs.writeFileSync(
    './emoji-removal-report.json',
    JSON.stringify(report, null, 2),
    'utf8'
  );
  
  console.log('Report saved to: emoji-removal-report.json\n');
}

// Run the script
main();
