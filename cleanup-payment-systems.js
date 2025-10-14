#!/usr/bin/env node

/**
 * Payment System Cleanup Script
 * 
 * This script removes Stripe and PayPal integrations from the QuickFix project,
 * keeping only M-Pesa as the payment gateway as per project requirements.
 * 
 * Actions:
 * 1. Identifies files with Stripe/PayPal code
 * 2. Creates backups before modification
 * 3. Removes Stripe and PayPal dependencies
 * 4. Updates package.json
 * 5. Generates cleanup report
 * 
 * Usage: node cleanup-payment-systems.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

// Check for dry-run mode
const DRY_RUN = process.argv.includes('--dry-run');

if (DRY_RUN) {
  console.log('\n⚠️  RUNNING IN DRY-RUN MODE - No files will be modified\n');
}

// Files requiring payment cleanup
const FILES_TO_CLEAN = [
  {
    path: './backend/controllers/enhancedPaymentController.js',
    type: 'controller',
    actions: 'Remove Stripe and PayPal imports, functions, and route handlers'
  },
  {
    path: './services/PaymentService.js',
    type: 'service',
    actions: 'Remove Stripe/PayPal payment methods from arrays and functions'
  },
  {
    path: './services/EscrowService.js',
    type: 'service',
    actions: 'Remove Stripe/PayPal payment processing switch cases'
  },
  {
    path: './Screens/AddFundsScreen.js',
    type: 'screen',
    actions: 'Remove Stripe/PayPal payment method options'
  },
  {
    path: './package.json',
    type: 'config',
    actions: 'Remove Stripe and PayPal dependencies'
  }
];

// Dependencies to remove from package.json
const DEPENDENCIES_TO_REMOVE = [
  '@stripe/stripe-react-native',
  'stripe',
  'paypal-rest-sdk',
  'react-native-paypal'
];

// Keywords to search for
const PAYMENT_KEYWORDS = {
  stripe: /stripe|Stripe|STRIPE/g,
  paypal: /paypal|PayPal|PAYPAL/g
};

let report = {
  timestamp: new Date().toISOString(),
  dryRun: DRY_RUN,
  filesAnalyzed: 0,
  filesModified: 0,
  backupsCreated: 0,
  stripeReferences: 0,
  paypalReferences: 0,
  errors: [],
  modifications: []
};

/**
 * Create backup of a file
 */
function createBackup(filePath) {
  if (DRY_RUN) {
    console.log(`[DRY-RUN] Would create backup: ${filePath}.backup`);
    report.backupsCreated++;
    return true;
  }
  
  try {
    const backupPath = `${filePath}.backup`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`✓ Backup created: ${backupPath}`);
    report.backupsCreated++;
    return true;
  } catch (error) {
    report.errors.push({ file: filePath, action: 'backup', error: error.message });
    console.error(`✗ Failed to create backup: ${error.message}`);
    return false;
  }
}

/**
 * Analyze file for payment gateway references
 */
function analyzeFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return null;
  }
  
  report.filesAnalyzed++;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const stripeMatches = content.match(PAYMENT_KEYWORDS.stripe);
    const paypalMatches = content.match(PAYMENT_KEYWORDS.paypal);
    
    const stripeCount = stripeMatches ? stripeMatches.length : 0;
    const paypalCount = paypalMatches ? paypalMatches.length : 0;
    
    report.stripeReferences += stripeCount;
    report.paypalReferences += paypalCount;
    
    return {
      content,
      stripeCount,
      paypalCount,
      hasPaymentRefs: stripeCount > 0 || paypalCount > 0
    };
  } catch (error) {
    report.errors.push({ file: filePath, action: 'analyze', error: error.message });
    return null;
  }
}

/**
 * Clean package.json
 */
function cleanPackageJson() {
  const packagePath = './package.json';
  console.log('\n--- Cleaning package.json ---');
  
  if (!fs.existsSync(packagePath)) {
    console.log('⚠️  package.json not found');
    return;
  }
  
  const analysis = analyzeFile(packagePath);
  if (!analysis) return;
  
  console.log(`Found ${analysis.stripeCount} Stripe references`);
  console.log(`Found ${analysis.paypalCount} PayPal references`);
  
  if (!analysis.hasPaymentRefs) {
    console.log('✓ No payment gateway references found in package.json');
    return;
  }
  
  if (!DRY_RUN) {
    createBackup(packagePath);
  }
  
  try {
    const packageData = JSON.parse(analysis.content);
    let modified = false;
    
    DEPENDENCIES_TO_REMOVE.forEach(dep => {
      if (packageData.dependencies && packageData.dependencies[dep]) {
        console.log(`${DRY_RUN ? '[DRY-RUN] Would remove' : 'Removing'} dependency: ${dep}`);
        if (!DRY_RUN) {
          delete packageData.dependencies[dep];
        }
        modified = true;
      }
    });
    
    if (modified) {
      if (!DRY_RUN) {
        fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2) + '\n', 'utf8');
        console.log('✓ package.json cleaned successfully');
        report.filesModified++;
      } else {
        console.log('[DRY-RUN] Would modify package.json');
      }
      
      report.modifications.push({
        file: packagePath,
        action: 'Removed payment gateway dependencies',
        dependenciesRemoved: DEPENDENCIES_TO_REMOVE
      });
    }
  } catch (error) {
    report.errors.push({ file: packagePath, action: 'clean', error: error.message });
    console.error(`✗ Error cleaning package.json: ${error.message}`);
  }
}

/**
 * Analyze all target files
 */
function analyzeAllFiles() {
  console.log('\n========================================');
  console.log('Payment System Cleanup Analysis');
  console.log('========================================\n');
  
  FILES_TO_CLEAN.forEach(fileInfo => {
    console.log(`\n--- Analyzing: ${fileInfo.path} ---`);
    console.log(`Type: ${fileInfo.type}`);
    console.log(`Actions: ${fileInfo.actions}`);
    
    const analysis = analyzeFile(fileInfo.path);
    
    if (analysis) {
      if (analysis.hasPaymentRefs) {
        console.log(`⚠️  Found ${analysis.stripeCount} Stripe reference(s)`);
        console.log(`⚠️  Found ${analysis.paypalCount} PayPal reference(s)`);
        console.log(`➡️  Manual review and cleanup required`);
        
        report.modifications.push({
          file: fileInfo.path,
          type: fileInfo.type,
          stripeReferences: analysis.stripeCount,
          paypalReferences: analysis.paypalCount,
          status: 'REQUIRES MANUAL CLEANUP',
          actions: fileInfo.actions
        });
      } else {
        console.log('✓ No payment gateway references found');
      }
    }
  });
}

/**
 * Generate cleanup instructions
 */
function generateCleanupInstructions() {
  console.log('\n========================================');
  console.log('MANUAL CLEANUP INSTRUCTIONS');
  console.log('========================================\n');
  
  console.log('The following files require manual code cleanup:\n');
  
  const filesToClean = report.modifications.filter(m => m.status === 'REQUIRES MANUAL CLEANUP');
  
  filesToClean.forEach((mod, index) => {
    console.log(`${index + 1}. ${mod.file}`);
    console.log(`   Stripe references: ${mod.stripeReferences}`);
    console.log(`   PayPal references: ${mod.paypalReferences}`);
    console.log(`   Actions: ${mod.actions}\n`);
  });
  
  console.log('Specific cleanup tasks:\n');
  
  console.log('📄 backend/controllers/enhancedPaymentController.js:');
  console.log('   - Remove line 13: const stripe = require(\'stripe\')...');
  console.log('   - Remove line 14: const paypal = require(\'paypal-rest-sdk\')');
  console.log('   - Remove lines 22-26: PayPal configuration');
  console.log('   - Remove createStripePaymentIntent function');
  console.log('   - Remove createPayPalPayment function');
  console.log('   - Update createPaymentIntent to only handle M-Pesa\n');
  
  console.log('📄 services/PaymentService.js:');
  console.log('   - Remove Stripe and PayPal from payment methods array');
  console.log('   - Update createPaymentIntent default method to \'mpesa\'');
  console.log('   - Remove Stripe/PayPal specific functions\n');
  
  console.log('📄 services/EscrowService.js:');
  console.log('   - Remove case \'stripe_card\': section');
  console.log('   - Remove case \'paypal\': section');
  console.log('   - Keep only M-Pesa payment processing\n');
  
  console.log('📄 Screens/AddFundsScreen.js:');
  console.log('   - Remove Stripe and PayPal from payment method options');
  console.log('   - Update UI to show only M-Pesa option\n');
}

/**
 * Print summary report
 */
function printSummary() {
  console.log('\n========================================');
  console.log('CLEANUP SUMMARY');
  console.log('========================================');
  console.log(`Files analyzed: ${report.filesAnalyzed}`);
  console.log(`Files modified: ${report.filesModified}`);
  console.log(`Backups created: ${report.backupsCreated}`);
  console.log(`Total Stripe references: ${report.stripeReferences}`);
  console.log(`Total PayPal references: ${report.paypalReferences}`);
  console.log(`Errors: ${report.errors.length}`);
  
  if (report.errors.length > 0) {
    console.log('\nErrors encountered:');
    report.errors.forEach(err => {
      console.log(`  - ${err.file} (${err.action}): ${err.error}`);
    });
  }
  
  console.log('\n========================================\n');
}

/**
 * Save report to file
 */
function saveReport() {
  const reportPath = './payment-cleanup-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`📊 Detailed report saved to: ${reportPath}\n`);
}

/**
 * Main execution
 */
function main() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  QuickFix Payment System Cleanup      ║');
  console.log('║  Removing Stripe & PayPal Integration ║');
  console.log('║  Keeping M-Pesa Only                  ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  if (DRY_RUN) {
    console.log('⚠️  DRY-RUN MODE: No files will be modified');
    console.log('   Remove --dry-run flag to apply changes\n');
  }
  
  // Analyze all files
  analyzeAllFiles();
  
  // Clean package.json
  cleanPackageJson();
  
  // Generate cleanup instructions
  generateCleanupInstructions();
  
  // Print summary
  printSummary();
  
  // Save report
  saveReport();
  
  if (!DRY_RUN) {
    console.log('✅ Cleanup completed!\n');
    console.log('Next steps:');
    console.log('1. Review the payment-cleanup-report.json file');
    console.log('2. Manually clean the files listed in the report');
    console.log('3. Run: npm install (to remove deleted packages)');
    console.log('4. Test the M-Pesa integration thoroughly');
    console.log('5. Commit your changes\n');
  } else {
    console.log('ℹ️  To apply changes, run: node cleanup-payment-systems.js\n');
  }
}

// Run the script
main();
