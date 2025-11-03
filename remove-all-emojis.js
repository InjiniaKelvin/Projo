#!/usr/bin/env node

/**
 * Comprehensive Emoji Removal Script for Entire Project
 * Removes ALL emojis from code files, documentation, and test files
 * Makes content professional and human-readable
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ROOT = '/home/injinia47/Desktop/PROJO/Projo';
const EXCLUDED_DIRS = ['node_modules', '.git', 'build', 'dist', '.expo'];
const FILE_EXTENSIONS = ['.md', '.js', '.jsx', '.ts', '.tsx', '.json'];

// Emoji mappings to text equivalents
const EMOJI_REPLACEMENTS = [
 // Documentation markers
 { emoji: /\/\/ Added:/g, replacement: '// Added:' },
 { emoji: /\/\/ Revised:/g, replacement: '// Revised:' },
 { emoji: /\/\/ /g, replacement: '// Note:' },
 { emoji: /\/\/ /g, replacement: '// Modified:' },
 
 // Status indicators
 { emoji: /[COMPLETED]/g, replacement: '[COMPLETED]' },
 { emoji: /[FAILED]/g, replacement: '[FAILED]' },
 { emoji: /[WARNING]/g, replacement: '[WARNING]' },
 { emoji: /[CRITICAL]/g, replacement: '[CRITICAL]' },
 { emoji: /[INFO]/g, replacement: '[INFO]' },
 { emoji: /[NOTE]/g, replacement: '[NOTE]' },
 { emoji: /[IN PROGRESS]/g, replacement: '[IN PROGRESS]' },
 { emoji: /[URGENT]/g, replacement: '[URGENT]' },
 
 // Action emojis
 { emoji: /[LAUNCH]/g, replacement: '[LAUNCH]' },
 { emoji: /[TARGET]/g, replacement: '[TARGET]' },
 { emoji: /[SUCCESS]/g, replacement: '[SUCCESS]' },
 { emoji: /[DOCUMENTATION]/g, replacement: '[DOCUMENTATION]' },
 { emoji: /[PACKAGE]/g, replacement: '[PACKAGE]' },
 { emoji: /[METRICS]/g, replacement: '[METRICS]' },
 { emoji: /[DOCUMENT]/g, replacement: '[DOCUMENT]' },
 { emoji: /[CHECKLIST]/g, replacement: '[CHECKLIST]' },
 { emoji: /[SIZE]/g, replacement: '[SIZE]' },
 { emoji: /[CONTACT]/g, replacement: '[CONTACT]' },
 { emoji: /[MOBILE]/g, replacement: '[MOBILE]' },
 
 // Technical emojis
 { emoji: /[SECURE]/g, replacement: '[SECURE]' },
 { emoji: /[SEARCH]/g, replacement: '[SEARCH]' },
 { emoji: /[PAYMENT]/g, replacement: '[PAYMENT]' },
 { emoji: /[CURRENCY]/g, replacement: '[CURRENCY]' },
 { emoji: /[CARD]/g, replacement: '[CARD]' },
 { emoji: /[KEY]/g, replacement: '[KEY]' },
 
 // Numbers/indicators
 { emoji: /1./g, replacement: '1.' },
 { emoji: /2./g, replacement: '2.' },
 { emoji: /3./g, replacement: '3.' },
 { emoji: /4./g, replacement: '4.' },
 { emoji: /5./g, replacement: '5.' },
 { emoji: /6./g, replacement: '6.' },
 { emoji: /7./g, replacement: '7.' },
 { emoji: /8./g, replacement: '8.' },
 { emoji: /9./g, replacement: '9.' },
 
 // Symbols
 { emoji: /OK/g, replacement: 'OK' },
 { emoji: /FAIL/g, replacement: 'FAIL' },
 { emoji: /x/g, replacement: 'x' },
 { emoji: /o/g, replacement: 'o' },
 
 // Generic emoji removal (catches any remaining emojis)
 { emoji: /[\u{1F600}-\u{1F64F}]/gu, replacement: '' }, // Emoticons
 { emoji: /[\u{1F300}-\u{1F5FF}]/gu, replacement: '' }, // Misc Symbols
 { emoji: /[\u{1F680}-\u{1F6FF}]/gu, replacement: '' }, // Transport
 { emoji: /[\u{1F1E0}-\u{1F1FF}]/gu, replacement: '' }, // Flags
 { emoji: /[\u{2600}-\u{26FF}]/gu, replacement: '' }, // Misc symbols
 { emoji: /[\u{2700}-\u{27BF}]/gu, replacement: '' }, // Dingbats
 { emoji: /[\u{1F900}-\u{1F9FF}]/gu, replacement: '' }, // Supplemental Symbols
 { emoji: /[\u{1FA00}-\u{1FA6F}]/gu, replacement: '' }, // Extended Symbols
];

// Statistics
let stats = {
 filesScanned: 0,
 filesModified: 0,
 emojisRemoved: 0,
 errors: 0,
 modifiedFiles: []
};

/**
 * Check if directory should be excluded
 */
function shouldExcludeDir(dirPath) {
 return EXCLUDED_DIRS.some(excluded => dirPath.includes(excluded));
}

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath) {
 const ext = path.extname(filePath);
 return FILE_EXTENSIONS.includes(ext);
}

/**
 * Remove emojis from content
 */
function removeEmojis(content) {
 let modified = content;
 let removedCount = 0;
 
 for (const { emoji, replacement } of EMOJI_REPLACEMENTS) {
 const matches = (modified.match(emoji) || []).length;
 if (matches > 0) {
 modified = modified.replace(emoji, replacement);
 removedCount += matches;
 }
 }
 
 return { modified, removedCount };
}

/**
 * Process a single file
 */
function processFile(filePath) {
 try {
 stats.filesScanned++;
 
 const content = fs.readFileSync(filePath, 'utf8');
 const { modified, removedCount } = removeEmojis(content);
 
 if (removedCount > 0) {
 fs.writeFileSync(filePath, modified, 'utf8');
 stats.filesModified++;
 stats.emojisRemoved += removedCount;
 stats.modifiedFiles.push({
 path: filePath.replace(PROJECT_ROOT, ''),
 emojisRemoved: removedCount
 });
 
 console.log(` [${removedCount} emojis] ${path.basename(filePath)}`);
 }
 } catch (error) {
 stats.errors++;
 console.error(` [ERROR] ${path.basename(filePath)}: ${error.message}`);
 }
}

/**
 * Recursively scan directory
 */
function scanDirectory(dirPath) {
 if (shouldExcludeDir(dirPath)) {
 return;
 }
 
 try {
 const items = fs.readdirSync(dirPath);
 
 for (const item of items) {
 const itemPath = path.join(dirPath, item);
 const stat = fs.statSync(itemPath);
 
 if (stat.isDirectory()) {
 scanDirectory(itemPath);
 } else if (stat.isFile() && shouldProcessFile(itemPath)) {
 processFile(itemPath);
 }
 }
 } catch (error) {
 console.error(`Error scanning ${dirPath}: ${error.message}`);
 }
}

/**
 * Generate report
 */
function generateReport() {
 const report = {
 timestamp: new Date().toISOString(),
 summary: {
 filesScanned: stats.filesScanned,
 filesModified: stats.filesModified,
 totalEmojisRemoved: stats.emojisRemoved,
 errors: stats.errors
 },
 modifiedFiles: stats.modifiedFiles.sort((a, b) => b.emojisRemoved - a.emojisRemoved)
 };
 
 const reportPath = path.join(PROJECT_ROOT, 'emoji-removal-report.json');
 fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
 
 return report;
}

/**
 * Main execution
 */
function main() {
 console.log('========================================');
 console.log('EMOJI REMOVAL SCRIPT');
 console.log('========================================');
 console.log(`Project Root: ${PROJECT_ROOT}`);
 console.log(`Target Extensions: ${FILE_EXTENSIONS.join(', ')}`);
 console.log(`Excluded Dirs: ${EXCLUDED_DIRS.join(', ')}`);
 console.log('========================================\n');
 
 console.log('Scanning project for emojis...\n');
 
 scanDirectory(PROJECT_ROOT);
 
 console.log('\n========================================');
 console.log('EMOJI REMOVAL COMPLETE');
 console.log('========================================');
 console.log(`Files Scanned: ${stats.filesScanned}`);
 console.log(`Files Modified: ${stats.filesModified}`);
 console.log(`Total Emojis Removed: ${stats.emojisRemoved}`);
 console.log(`Errors: ${stats.errors}`);
 console.log('========================================\n');
 
 const report = generateReport();
 console.log('Detailed report saved to: emoji-removal-report.json\n');
 
 if (stats.filesModified > 0) {
 console.log('TOP 10 FILES WITH MOST EMOJIS REMOVED:');
 console.log('----------------------------------------');
 report.modifiedFiles.slice(0, 10).forEach((file, index) => {
 console.log(`${index + 1}. ${file.path} (${file.emojisRemoved} emojis)`);
 });
 }
 
 console.log('\n========================================');
 console.log('All emojis have been removed from the project.');
 console.log('Content is now professional and human-readable.');
 console.log('========================================\n');
}

// Run the script
main();
