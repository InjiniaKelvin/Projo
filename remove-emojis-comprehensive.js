#!/usr/bin/env node

/**
 * Comprehensive Emoji Removal Script for QuickFix Project
 * 
 * This script removes ALL emoji characters from code files while preserving functionality.
 * It processes JavaScript, TypeScript, and other code files but preserves markdown formatting.
 * 
 * Usage: node remove-emojis-comprehensive.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
 // Directories to scan recursively
 scanDirectories: [
 './backend',
 './app',
 './components',
 './contexts',
 './services',
 './Screens',
 './scripts',
 './Utils',
 './hooks',
 './navigation',
 './constants',
 './config'
 ],
 
 // File extensions to process
 fileExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
 
 // Root level files to include
 rootTestFiles: [
 'test-e2e-flow.js',
 'test-e2e-technician-system.js',
 'test-stk-push-now.js',
 'test-stk-working.js',
 'test-all-payments.js',
 'test-complete-booking-flow.js',
 'test-complete-fast.js',
 'server.js',
 'index.js'
 ],
 
 // Files to exclude
 excludePatterns: [
 'node_modules',
 '.git',
 'backup',
 'dist',
 'build',
 '.expo'
 ]
};

// Emoji patterns to remove
const EMOJI_PATTERNS = [
 /[COMPLETED]/g, /[FAILED]/g, /[WARNING]/g, /[LAUNCH]/g, /[MOBILE]/g, /[PAYMENT]/g, /[NOTE]/g, /[INFO]/g,
 /[CARD]/g, /🆔/g, /[IN PROGRESS]/g, /[CHECKLIST]/g, /[TARGET]/g, //g, /[METRICS]/g, /[SUCCESS]/g,
 //g, /[URGENT]/g, /🟠/g, /🟡/g, /🟢/g, //g, /🟣/g, //g,
 /⬜/g, /🟥/g, /🟧/g, /🟨/g, /🟩/g, /🟦/g, /🟪/g, /⬛/g,
 /[SECURE]/g, //g, //g, //g, //g, /[PACKAGE]/g, //g, /⏰/g,
 //g, //g, /[CRITICAL]/g, /⭐/g, //g, //g, //g, /[CONTACT]/g,
 //g, //g, //g, //g, //g, //g, //g, //g,
 //g, //g, //g, //g, //g, //g, //g, /[KEYBOARD]/g,
 //g, //g, //g, //g, //g, //g, //g, //g,
 //g, //g, //g, //g, /🃏/g, /🀄/g, //g, //g
];

// Comprehensive emoji removal regex (covers most emojis)
const COMPREHENSIVE_EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F910}-\u{1F96B}]|[\u{1F980}-\u{1F9E0}]/gu;

// Replacement mappings
const EMOJI_REPLACEMENTS = {
 '[COMPLETED]': '[SUCCESS]',
 '[FAILED]': '[ERROR]',
 '[WARNING]': '[WARNING]',
 '[LAUNCH]': '[LAUNCH]',
 '[MOBILE]': '[PHONE]',
 '[PAYMENT]': '[MONEY]',
 '[NOTE]': '[NOTE]',
 '[INFO]': '[INFO]',
 '[CARD]': '[CARD]',
 '🆔': '[ID]',
 '[IN PROGRESS]': '[WAIT]',
 '[CHECKLIST]': '[LIST]',
 '[TARGET]': '[TARGET]',
 '': '[TOOL]',
 '[METRICS]': '[CHART]',
 '[SUCCESS]': '[CELEBRATE]',
 '': '[SPARKLE]',
 '[URGENT]': '[RED]',
 '🟢': '[GREEN]',
 '': '[BLUE]',
 '🟡': '[YELLOW]',
 '🟠': '[ORANGE]'
};

// Statistics
let stats = {
 filesProcessed: 0,
 filesModified: 0,
 emojisRemoved: 0,
 errors: []
};

/**
 * Check if path should be excluded
 */
function shouldExclude(filePath) {
 return CONFIG.excludePatterns.some(pattern => filePath.includes(pattern));
}

/**
 * Check if file should be processed
 */
function shouldProcessFile(filename) {
 return CONFIG.fileExtensions.some(ext => filename.endsWith(ext));
}

/**
 * Remove emojis from text with intelligent replacement
 */
function removeEmojis(content) {
 let modified = content;
 let count = 0;
 
 // First, replace known emojis with text equivalents
 for (const [emoji, replacement] of Object.entries(EMOJI_REPLACEMENTS)) {
 const regex = new RegExp(emoji, 'g');
 const matches = (modified.match(regex) || []).length;
 if (matches > 0) {
 modified = modified.replace(regex, replacement);
 count += matches;
 }
 }
 
 // Then remove any remaining emojis using comprehensive pattern
 const remainingEmojis = modified.match(COMPREHENSIVE_EMOJI_REGEX);
 if (remainingEmojis) {
 count += remainingEmojis.length;
 modified = modified.replace(COMPREHENSIVE_EMOJI_REGEX, '');
 }
 
 // Remove any double spaces created by emoji removal
 modified = modified.replace(/ +/g, ' ');
 
 // Clean up lines that now only have whitespace
 modified = modified.replace(/^\s+$/gm, '');
 
 return { content: modified, count };
}

/**
 * Process a single file
 */
function processFile(filePath) {
 try {
 stats.filesProcessed++;
 
 const content = fs.readFileSync(filePath, 'utf8');
 const { content: cleanedContent, count } = removeEmojis(content);
 
 if (count > 0) {
 fs.writeFileSync(filePath, cleanedContent, 'utf8');
 stats.filesModified++;
 stats.emojisRemoved += count;
 console.log(` [CLEANED] ${filePath} - Removed ${count} emojis`);
 }
 } catch (error) {
 stats.errors.push({ file: filePath, error: error.message });
 console.error(` [ERROR] ${filePath}: ${error.message}`);
 }
}

/**
 * Process directory recursively
 */
function processDirectory(dirPath) {
 if (!fs.existsSync(dirPath)) {
 console.log(` [SKIP] Directory not found: ${dirPath}`);
 return;
 }
 
 const items = fs.readdirSync(dirPath);
 
 for (const item of items) {
 const fullPath = path.join(dirPath, item);
 
 if (shouldExclude(fullPath)) {
 continue;
 }
 
 const stat = fs.statSync(fullPath);
 
 if (stat.isDirectory()) {
 processDirectory(fullPath);
 } else if (stat.isFile() && shouldProcessFile(item)) {
 processFile(fullPath);
 }
 }
}

/**
 * Main execution
 */
function main() {
 console.log('=========================================');
 console.log('QuickFix Emoji Removal Script');
 console.log('=========================================\n');
 
 // Process all configured directories
 console.log('Processing directories...\n');
 for (const dir of CONFIG.scanDirectories) {
 if (fs.existsSync(dir)) {
 console.log(`Scanning: ${dir}`);
 processDirectory(dir);
 }
 }
 
 // Process root level test files
 console.log('\nProcessing root test files...\n');
 for (const file of CONFIG.rootTestFiles) {
 if (fs.existsSync(file)) {
 console.log(`Processing: ${file}`);
 processFile(file);
 }
 }
 
 // Print summary
 console.log('\n=========================================');
 console.log('Cleanup Summary');
 console.log('=========================================');
 console.log(`Files scanned: ${stats.filesProcessed}`);
 console.log(`Files modified: ${stats.filesModified}`);
 console.log(`Total emojis removed: ${stats.emojisRemoved}`);
 console.log(`Errors: ${stats.errors.length}`);
 
 if (stats.errors.length > 0) {
 console.log('\nErrors encountered:');
 stats.errors.forEach(err => {
 console.log(` - ${err.file}: ${err.error}`);
 });
 }
 
 console.log('\n[SUCCESS] Emoji removal completed!');
 console.log('=========================================\n');
 
 // Write report
 const report = {
 timestamp: new Date().toISOString(),
 filesProcessed: stats.filesProcessed,
 filesModified: stats.filesModified,
 emojisRemoved: stats.emojisRemoved,
 errors: stats.errors
 };
 
 fs.writeFileSync(
 'emoji-removal-report.json',
 JSON.stringify(report, null, 2)
 );
 
 console.log('Report saved to: emoji-removal-report.json\n');
}

// Run the script
if (require.main === module) {
 main();
}

module.exports = { removeEmojis, processFile };
