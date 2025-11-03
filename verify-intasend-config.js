/**
 * Verify IntaSend LIVE Configuration
 */

require('dotenv').config();

console.log('\n[SEARCH] INTASEND CONFIGURATION CHECK\n');
console.log('=' .repeat(60));

const pubKey = process.env.INTASEND_PUBLISHABLE_KEY;
const secretKey = process.env.INTASEND_SECRET_KEY;
const env = process.env.INTASEND_ENV;

console.log('Publishable Key:', pubKey ? `${pubKey.substring(0, 20)}...` : '[FAILED] NOT SET');
console.log('Secret Key:', secretKey ? `${secretKey.substring(0, 20)}...` : '[FAILED] NOT SET');
console.log('Environment:', env || '[FAILED] NOT SET');
console.log('=' .repeat(60));

// Check if keys are LIVE
const isLivePub = pubKey && pubKey.includes('_live_');
const isLiveSecret = secretKey && secretKey.includes('_live_');
const isLiveEnv = env === 'live';

console.log('\nOK Status Check:');
console.log(' Publishable Key Type:', isLivePub ? '[URGENT] LIVE' : '🟡 TEST/SANDBOX');
console.log(' Secret Key Type:', isLiveSecret ? '[URGENT] LIVE' : '🟡 TEST/SANDBOX');
console.log(' Environment Setting:', isLiveEnv ? '[URGENT] LIVE' : '🟡 SANDBOX');

if (isLivePub && isLiveSecret && isLiveEnv) {
 console.log('\n[COMPLETED] All checks passed - Ready for LIVE production payments!');
 console.log('[WARNING] Real money will be processed!\n');
} else {
 console.log('\n[WARNING] Configuration mismatch detected:');
 if (!isLivePub) console.log(' * Publishable key is not LIVE');
 if (!isLiveSecret) console.log(' * Secret key is not LIVE');
 if (!isLiveEnv) console.log(' * Environment is not set to "live"');
 console.log('\n[FAILED] System is in TEST/SANDBOX mode\n');
}

// Display expected values
console.log('Expected LIVE configuration:');
console.log(' INTASEND_PUBLISHABLE_KEY=ISPubKey_live_...');
console.log(' INTASEND_SECRET_KEY=ISSecretKey_live_...');
console.log(' INTASEND_ENV=live\n');
