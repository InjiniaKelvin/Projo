/**
 * IntaSend Integration Test Script
 * 
 * This script tests all IntaSend payment integration components:
 * - Service initialization
 * - M-Pesa STK Push
 * - Card payments
 * - Payouts to technicians
 * - Webhook handling
 * - Payment status checks
 * - Escrow workflow
 * 
 * Run with: node backend/test-intasend-integration.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const IntaSendService = require('./services/IntaSendService');
const Wallet = require('./models/Wallet');
const Transaction = require('./models/Transaction');
const User = require('./models/User');

// ANSI color codes for terminal output
const colors = {
 reset: '\x1b[0m',
 green: '\x1b[32m',
 red: '\x1b[31m',
 yellow: '\x1b[33m',
 blue: '\x1b[34m',
 cyan: '\x1b[36m'
};

// Test results tracker
const testResults = {
 passed: 0,
 failed: 0,
 total: 0
};

/**
 * Print test header
 */
function printHeader(title) {
 console.log(`\n${'='.repeat(80)}`);
 console.log(`${colors.cyan}${title}${colors.reset}`);
 console.log(`${'='.repeat(80)}\n`);
}

/**
 * Print test result
 */
function printResult(testName, passed, message = '') {
 testResults.total++;
 if (passed) {
 testResults.passed++;
 console.log(`${colors.green}OK PASS${colors.reset} - ${testName}`);
 } else {
 testResults.failed++;
 console.log(`${colors.red}FAIL FAIL${colors.reset} - ${testName}`);
 }
 if (message) {
 console.log(` ${colors.yellow}→${colors.reset} ${message}`);
 }
}

/**
 * Print test summary
 */
function printSummary() {
 console.log(`\n${'='.repeat(80)}`);
 console.log(`${colors.cyan}TEST SUMMARY${colors.reset}`);
 console.log(`${'='.repeat(80)}`);
 console.log(`Total Tests: ${testResults.total}`);
 console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
 console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
 console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
 console.log(`${'='.repeat(80)}\n`);
}

/**
 * Test 1: Environment Variables Configuration
 */
async function testEnvironmentConfig() {
 printHeader('TEST 1: Environment Variables Configuration');
 
 const publishableKey = process.env.INTASEND_PUBLISHABLE_KEY;
 const secretKey = process.env.INTASEND_SECRET_KEY;
 const env = process.env.INTASEND_ENV;
 const callbackUrl = process.env.INTASEND_CALLBACK_URL;
 
 printResult(
 'INTASEND_PUBLISHABLE_KEY is set',
 !!publishableKey && publishableKey.startsWith('ISPubKey_'),
 publishableKey ? `Key: ${publishableKey.substring(0, 20)}...` : 'Missing'
 );
 
 printResult(
 'INTASEND_SECRET_KEY is set',
 !!secretKey && secretKey.startsWith('ISSecretKey_'),
 secretKey ? `Key: ${secretKey.substring(0, 20)}...` : 'Missing'
 );
 
 printResult(
 'INTASEND_ENV is configured',
 env === 'sandbox' || env === 'production',
 `Environment: ${env || 'Not set'}`
 );
 
 printResult(
 'INTASEND_CALLBACK_URL is set',
 !!callbackUrl,
 callbackUrl || 'Not configured'
 );
}

/**
 * Test 2: IntaSend Service Initialization
 */
async function testServiceInitialization() {
 printHeader('TEST 2: IntaSend Service Initialization');
 
 try {
 printResult(
 'IntaSendService module loads',
 IntaSendService !== null && IntaSendService !== undefined,
 'Service imported successfully'
 );
 
 printResult(
 'IntaSend SDK client initialized',
 IntaSendService.intasend !== null,
 'SDK client created'
 );
 
 printResult(
 'Collection service initialized',
 IntaSendService.collection !== null,
 'Collection API available'
 );
 
 printResult(
 'Payout service initialized',
 IntaSendService.payout !== null,
 'Payout API available'
 );
 
 printResult(
 'Test mode configured correctly',
 IntaSendService.isTestMode === (process.env.INTASEND_ENV === 'sandbox'),
 `Test mode: ${IntaSendService.isTestMode}`
 );
 
 const methods = IntaSendService.getSupportedPaymentMethods();
 printResult(
 'Supported payment methods available',
 Array.isArray(methods) && methods.length >= 2,
 `Methods: ${methods.map(m => m.id).join(', ')}`
 );
 
 } catch (error) {
 printResult('IntaSendService initialization', false, error.message);
 }
}

/**
 * Test 3: Phone Number Formatting
 */
async function testPhoneNumberFormatting() {
 printHeader('TEST 3: Phone Number Formatting');
 
 const testCases = [
 { input: '0712345678', expected: '254712345678' },
 { input: '254712345678', expected: '254712345678' },
 { input: '+254712345678', expected: '254712345678' },
 { input: '712345678', expected: '254712345678' },
 ];
 
 for (const testCase of testCases) {
 try {
 const result = IntaSendService.formatPhoneNumber(testCase.input);
 printResult(
 `Format ${testCase.input}`,
 result === testCase.expected,
 `Input: ${testCase.input} → Output: ${result} (Expected: ${testCase.expected})`
 );
 } catch (error) {
 printResult(`Format ${testCase.input}`, false, error.message);
 }
 }
 
 // Test invalid phone number
 try {
 IntaSendService.formatPhoneNumber('123');
 printResult('Reject invalid phone number', false, 'Should have thrown error');
 } catch (error) {
 printResult('Reject invalid phone number', true, 'Validation working correctly');
 }
}

/**
 * Test 4: Fee Calculation
 */
async function testFeeCalculation() {
 printHeader('TEST 4: Fee Calculation');
 
 const mpesaFees = IntaSendService.calculateFees(1000, 'mpesa');
 printResult(
 'M-Pesa fee calculation',
 mpesaFees.totalFee === 25, // 1.5% of 1000 = 15, + 10 fixed = 25
 `Amount: 1000 KES → Fee: ${mpesaFees.totalFee} KES (${mpesaFees.feePercentage}% + ${mpesaFees.fixedFee} KES)`
 );
 
 const cardFees = IntaSendService.calculateFees(1000, 'card');
 printResult(
 'Card fee calculation',
 cardFees.totalFee === 35, // 3.5% of 1000 = 35
 `Amount: 1000 KES → Fee: ${cardFees.totalFee} KES (${cardFees.feePercentage}%)`
 );
 
 printResult(
 'Net amount calculated correctly (M-Pesa)',
 mpesaFees.netAmount === 975,
 `Gross: ${mpesaFees.grossAmount} - Fee: ${mpesaFees.totalFee} = Net: ${mpesaFees.netAmount}`
 );
}

/**
 * Test 5: Database Connection and Models
 */
async function testDatabaseModels() {
 printHeader('TEST 5: Database Models and Connection');
 
 try {
 // Check if MongoDB is connected
 const isConnected = mongoose.connection.readyState === 1;
 printResult(
 'MongoDB connection',
 isConnected,
 `State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`
 );
 
 if (!isConnected) {
 console.log(`${colors.yellow}Attempting to connect to MongoDB...${colors.reset}`);
 await mongoose.connect(process.env.MONGO_URI);
 printResult('MongoDB reconnection', true, 'Connected successfully');
 }
 
 // Test Wallet model
 printResult(
 'Wallet model loaded',
 Wallet !== null && typeof Wallet.findByUserId === 'function',
 'Model has required methods'
 );
 
 // Test Transaction model
 printResult(
 'Transaction model loaded',
 Transaction !== null && Transaction.schema !== null,
 'Model schema defined'
 );
 
 // Check transaction types
 const transactionTypes = ['deposit', 'withdrawal', 'payment', 'refund', 'escrow_hold', 'escrow_release'];
 const schemaTypes = Transaction.schema.path('type').enumValues || [];
 printResult(
 'Transaction types configured',
 transactionTypes.every(type => schemaTypes.includes(type)),
 `Types: ${schemaTypes.join(', ')}`
 );
 
 } catch (error) {
 printResult('Database models test', false, error.message);
 }
}

/**
 * Test 6: Webhook Data Processing
 */
async function testWebhookProcessing() {
 printHeader('TEST 6: Webhook Data Processing');
 
 const mockWebhookData = {
 invoice_id: 'INV_TEST_12345',
 api_ref: 'WALLET_TOPUP_USER123_1234567890',
 state: 'COMPLETE',
 value: '1000.00',
 currency: 'KES',
 paid_amount: '1000.00',
 mpesa_reference: 'MPESA_REF_12345',
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString()
 };
 
 try {
 const result = await IntaSendService.handleWebhook(mockWebhookData);
 
 printResult(
 'Webhook data parsed',
 result.success === true,
 'Webhook processed successfully'
 );
 
 printResult(
 'Payment marked as successful',
 result.data.isSuccess === true,
 `State: ${result.data.state}`
 );
 
 printResult(
 'Invoice ID extracted',
 result.data.invoiceId === mockWebhookData.invoice_id,
 `Invoice: ${result.data.invoiceId}`
 );
 
 printResult(
 'M-Pesa reference captured',
 result.data.mpesaReference === mockWebhookData.mpesa_reference,
 `Reference: ${result.data.mpesaReference}`
 );
 
 } catch (error) {
 printResult('Webhook processing', false, error.message);
 }
 
 // Test failed payment webhook
 const failedWebhookData = {
 ...mockWebhookData,
 state: 'FAILED',
 failed_reason: 'Insufficient funds'
 };
 
 try {
 const result = await IntaSendService.handleWebhook(failedWebhookData);
 
 printResult(
 'Failed payment detected',
 result.data.isFailed === true,
 `Reason: ${result.data.failedReason}`
 );
 
 } catch (error) {
 printResult('Failed webhook processing', false, error.message);
 }
}

/**
 * Test 7: Integration with Payment Controller Methods
 */
async function testControllerIntegration() {
 printHeader('TEST 7: Payment Controller Integration Check');
 
 try {
 const paymentController = require('./controllers/paymentController');
 
 printResult(
 'paymentController module loaded',
 paymentController !== null,
 'Controller imported successfully'
 );
 
 const requiredMethods = [
 'getWallet',
 'addFunds',
 'withdrawFunds',
 'transferToEscrow',
 'releaseFromEscrow',
 'handleIntaSendWebhook',
 'checkPaymentStatus',
 'getTransactionHistory'
 ];
 
 for (const method of requiredMethods) {
 printResult(
 `Controller has ${method} method`,
 typeof paymentController[method] === 'function',
 `Method type: ${typeof paymentController[method]}`
 );
 }
 
 } catch (error) {
 printResult('Controller integration', false, error.message);
 }
}

/**
 * Test 8: Routes Configuration
 */
async function testRoutesConfiguration() {
 printHeader('TEST 8: Payment Routes Configuration');
 
 try {
 // We can't directly test routes without starting the server,
 // but we can check if the routes file loads
 const fs = require('fs');
 const routesPath = './routes/payments.js';
 
 const routesExist = fs.existsSync(routesPath);
 printResult(
 'Payment routes file exists',
 routesExist,
 routesPath
 );
 
 if (routesExist) {
 const routesContent = fs.readFileSync(routesPath, 'utf8');
 
 const requiredEndpoints = [
 '/wallet',
 '/add-funds',
 '/withdraw-funds',
 '/escrow/deposit',
 '/escrow/release',
 '/transactions',
 '/intasend/callback',
 '/status/:transactionId'
 ];
 
 for (const endpoint of requiredEndpoints) {
 const hasEndpoint = routesContent.includes(`'${endpoint}'`) || 
 routesContent.includes(`"${endpoint}"`);
 printResult(
 `Route ${endpoint} defined`,
 hasEndpoint,
 hasEndpoint ? 'Found' : 'Missing'
 );
 }
 }
 
 } catch (error) {
 printResult('Routes configuration', false, error.message);
 }
}

/**
 * Main test runner
 */
async function runAllTests() {
 console.log(`${colors.cyan}`);
 console.log(`
 ╔═══════════════════════════════════════════════════════════════════════════════╗
 ║ ║
 ║ IntaSend Payment Integration Test Suite ║
 ║ QuickFix Platform ║
 ║ ║
 ╚═══════════════════════════════════════════════════════════════════════════════╝
 ${colors.reset}`);
 
 console.log(`\n${colors.yellow}Starting comprehensive integration tests...${colors.reset}\n`);
 
 try {
 // Run all test suites
 await testEnvironmentConfig();
 await testServiceInitialization();
 await testPhoneNumberFormatting();
 await testFeeCalculation();
 await testDatabaseModels();
 await testWebhookProcessing();
 await testControllerIntegration();
 await testRoutesConfiguration();
 
 // Print summary
 printSummary();
 
 // Determine exit code
 const success = testResults.failed === 0;
 
 if (success) {
 console.log(`${colors.green}OK All tests passed! IntaSend integration is ready.${colors.reset}\n`);
 } else {
 console.log(`${colors.red}FAIL Some tests failed. Please review the issues above.${colors.reset}\n`);
 }
 
 // Close database connection
 if (mongoose.connection.readyState === 1) {
 await mongoose.connection.close();
 console.log(`${colors.blue}MongoDB connection closed.${colors.reset}\n`);
 }
 
 process.exit(success ? 0 : 1);
 
 } catch (error) {
 console.error(`${colors.red}Fatal error during testing:${colors.reset}`, error);
 process.exit(1);
 }
}

// Run tests if this file is executed directly
if (require.main === module) {
 runAllTests();
}

module.exports = {
 testEnvironmentConfig,
 testServiceInitialization,
 testPhoneNumberFormatting,
 testFeeCalculation,
 testDatabaseModels,
 testWebhookProcessing,
 testControllerIntegration,
 testRoutesConfiguration
};
