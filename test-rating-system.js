/**
 * Rating System Test Script
 * 
 * Tests all rating functionality including:
 * - Rating submission
 * - Technician rating calculation
 * - Rating retrieval
 * - Flagging and moderation
 * - Technician responses
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Rating = require('./backend/models/Rating');
const Booking = require('./backend/models/Booking');
const User = require('./backend/models/User');

// Test configuration
const TEST_CONFIG = {
  colors: {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
  }
};

const { colors } = TEST_CONFIG;

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  const icon = passed ? 'PASS' : 'FAIL';
  const color = passed ? colors.green : colors.red;
  log(`[${icon}] ${name}${details ? ': ' + details : ''}`, color);
  
  results.tests.push({ name, passed, details });
  if (passed) results.passed++;
  else results.failed++;
}

// Test data
let testCustomer;
let testTechnician;
let testBooking;
let testRating;

/**
 * Setup: Create test data
 */
async function setup() {
  try {
    log('\n=== SETUP: Creating Test Data ===', colors.cyan);
    
    // Create test customer
    testCustomer = await User.create({
      firstName: 'Test',
      lastName: 'Customer',
      email: `testcustomer_${Date.now()}@test.com`,
      phoneNumber: `+254700${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
      password: 'TestPass123!',
      role: 'client',
      isVerified: true
    });
    log(`Created test customer: ${testCustomer._id}`, colors.green);
    
    // Create test technician
    testTechnician = await User.create({
      firstName: 'Test',
      lastName: 'Technician',
      email: `testtechnician_${Date.now()}@test.com`,
      phoneNumber: `+254701${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
      password: 'TestPass123!',
      role: 'technician',
      isVerified: true,
      skills: [{ name: 'Plumbing', experience: 5, certified: true }],
      rating: { average: 0, count: 0 }
    });
    log(`Created test technician: ${testTechnician._id}`, colors.green);
    
    // Create test booking
    testBooking = await Booking.create({
      bookingId: `TEST-${Date.now()}`,
      userId: testCustomer._id,
      clientPhone: testCustomer.phoneNumber,
      clientName: `${testCustomer.firstName} ${testCustomer.lastName}`,
      clientEmail: testCustomer.email,
      technicianId: testTechnician._id,
      serviceType: 'plumbing',
      serviceDescription: 'Test plumbing service for leak repair',
      location: {
        address: '123 Test Street, Nairobi',
        description: 'Near Test Mall',
        road: 'Test Road',
        ward: 'Test Ward',
        constituency: 'Westlands',
        latitude: -1.286389,
        longitude: 36.817223
      },
      preferredDate: new Date(),
      preferredTimeSlot: '08:00-10:00',
      status: 'completed',
      completedAt: new Date()
    });
    log(`Created test booking: ${testBooking._id}`, colors.green);
    
    log('Setup completed successfully\n', colors.green);
    return true;
  } catch (error) {
    log(`Setup failed: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Test 1: Submit a rating
 */
async function test_submitRating() {
  try {
    log('\n=== TEST 1: Submit Rating ===', colors.cyan);
    
    testRating = await Rating.create({
      booking: testBooking._id,
      technician: testTechnician._id,
      customer: testCustomer._id,
      ratings: {
        service: 5,
        technician: 5,
        overall: 5
      },
      feedback: 'Excellent service! Very professional.',
      quickFeedback: ['Professional service', 'On time arrival', 'Quality work']
    });
    
    logTest('Submit rating', testRating && testRating._id, `Rating ID: ${testRating._id}`);
    return true;
  } catch (error) {
    logTest('Submit rating', false, error.message);
    return false;
  }
}

/**
 * Test 2: Verify technician rating updated
 */
async function test_technicianRatingUpdate() {
  try {
    log('\n=== TEST 2: Technician Rating Update ===', colors.cyan);
    
    // Wait a bit for the post-save hook to execute
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedTechnician = await User.findById(testTechnician._id);
    
    const ratingUpdated = updatedTechnician.rating.average === 5 && updatedTechnician.rating.count === 1;
    
    logTest(
      'Technician rating updated',
      ratingUpdated,
      `Average: ${updatedTechnician.rating.average}, Count: ${updatedTechnician.rating.count}`
    );
    
    return ratingUpdated;
  } catch (error) {
    logTest('Technician rating updated', false, error.message);
    return false;
  }
}

/**
 * Test 3: Retrieve rating by booking ID
 */
async function test_getRatingByBooking() {
  try {
    log('\n=== TEST 3: Retrieve Rating by Booking ===', colors.cyan);
    
    const rating = await Rating.findOne({ booking: testBooking._id });
    
    const found = rating && rating._id.toString() === testRating._id.toString();
    
    logTest('Retrieve rating by booking', found, found ? `Found rating: ${rating._id}` : 'Rating not found');
    
    return found;
  } catch (error) {
    logTest('Retrieve rating by booking', false, error.message);
    return false;
  }
}

/**
 * Test 4: Get technician statistics
 */
async function test_getTechnicianStats() {
  try {
    log('\n=== TEST 4: Technician Statistics ===', colors.cyan);
    
    const stats = await Rating.getTechnicianStats(testTechnician._id);
    
    const correct = stats.totalRatings === 1 && 
                   stats.averageOverall === 5 &&
                   stats.distribution[5] === 1;
    
    logTest(
      'Get technician statistics',
      correct,
      `Total: ${stats.totalRatings}, Avg: ${stats.averageOverall}, 5-star: ${stats.distribution[5]}`
    );
    
    return correct;
  } catch (error) {
    logTest('Get technician statistics', false, error.message);
    return false;
  }
}

/**
 * Test 5: Flag a rating
 */
async function test_flagRating() {
  try {
    log('\n=== TEST 5: Flag Rating ===', colors.cyan);
    
    await testRating.flagRating(testCustomer._id, 'spam');
    
    const flagged = testRating.flagged.isFlagged === true &&
                   testRating.flagged.reason === 'spam' &&
                   testRating.flagged.moderationStatus === 'pending';
    
    logTest(
      'Flag rating',
      flagged,
      `Flagged: ${testRating.flagged.isFlagged}, Reason: ${testRating.flagged.reason}`
    );
    
    return flagged;
  } catch (error) {
    logTest('Flag rating', false, error.message);
    return false;
  }
}

/**
 * Test 6: Technician response
 */
async function test_technicianResponse() {
  try {
    log('\n=== TEST 6: Technician Response ===', colors.cyan);
    
    await testRating.addTechnicianResponse('Thank you for your feedback!');
    
    const hasResponse = testRating.technicianResponse.content === 'Thank you for your feedback!' &&
                       testRating.technicianResponse.respondedAt instanceof Date;
    
    logTest(
      'Technician response',
      hasResponse,
      `Response: ${testRating.technicianResponse.content}`
    );
    
    return hasResponse;
  } catch (error) {
    logTest('Technician response', false, error.message);
    return false;
  }
}

/**
 * Test 7: Mark rating as helpful
 */
async function test_markHelpful() {
  try {
    log('\n=== TEST 7: Mark Rating as Helpful ===', colors.cyan);
    
    await testRating.markHelpful(testCustomer._id);
    
    const marked = testRating.helpful.count === 1 &&
                  testRating.helpful.users.includes(testCustomer._id);
    
    logTest(
      'Mark rating as helpful',
      marked,
      `Helpful count: ${testRating.helpful.count}`
    );
    
    return marked;
  } catch (error) {
    logTest('Mark rating as helpful', false, error.message);
    return false;
  }
}

/**
 * Test 8: Prevent duplicate rating for same booking
 */
async function test_preventDuplicateRating() {
  try {
    log('\n=== TEST 8: Prevent Duplicate Rating ===', colors.cyan);
    
    let duplicateError = null;
    
    try {
      await Rating.create({
        booking: testBooking._id,
        technician: testTechnician._id,
        customer: testCustomer._id,
        ratings: {
          service: 4,
          technician: 4,
          overall: 4
        },
        feedback: 'Another rating'
      });
    } catch (error) {
      duplicateError = error;
    }
    
    const prevented = duplicateError !== null && 
                     (duplicateError.code === 11000 || duplicateError.message.includes('duplicate'));
    
    logTest(
      'Prevent duplicate rating',
      prevented,
      prevented ? 'Duplicate prevented successfully' : 'Duplicate was allowed (FAIL)'
    );
    
    return prevented;
  } catch (error) {
    logTest('Prevent duplicate rating', false, error.message);
    return false;
  }
}

/**
 * Test 9: Submit multiple ratings and verify average calculation
 */
async function test_multipleRatingsAverage() {
  try {
    log('\n=== TEST 9: Multiple Ratings Average Calculation ===', colors.cyan);
    
    // Create additional bookings and ratings
    const booking2 = await Booking.create({
      bookingId: `TEST-${Date.now()}-2`,
      userId: testCustomer._id,
      clientPhone: testCustomer.phoneNumber,
      technicianId: testTechnician._id,
      serviceType: 'Plumbing',
      serviceDescription: 'Test service 2',
      location: {
        address: 'Test Address 2',
        latitude: -1.286389,
        longitude: 36.817223
      },
      status: 'completed',
      completedAt: new Date()
    });
    
    await Rating.create({
      booking: booking2._id,
      technician: testTechnician._id,
      customer: testCustomer._id,
      ratings: {
        service: 3,
        technician: 3,
        overall: 3
      },
      feedback: 'Good service'
    });
    
    // Wait for update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedTechnician = await User.findById(testTechnician._id);
    
    // Average should be (5 + 3) / 2 = 4
    const correctAverage = updatedTechnician.rating.average === 4 && 
                          updatedTechnician.rating.count === 2;
    
    logTest(
      'Multiple ratings average',
      correctAverage,
      `Average: ${updatedTechnician.rating.average}, Count: ${updatedTechnician.rating.count}, Expected: 4, 2`
    );
    
    return correctAverage;
  } catch (error) {
    logTest('Multiple ratings average', false, error.message);
    return false;
  }
}

/**
 * Test 10: Virtual properties
 */
async function test_virtualProperties() {
  try {
    log('\n=== TEST 10: Virtual Properties ===', colors.cyan);
    
    const rating = await Rating.findById(testRating._id);
    
    const avgRating = rating.averageRating;
    const label = rating.ratingLabel;
    
    const correct = avgRating === '5.00' && label === 'Excellent';
    
    logTest(
      'Virtual properties',
      correct,
      `Average: ${avgRating}, Label: ${label}`
    );
    
    return correct;
  } catch (error) {
    logTest('Virtual properties', false, error.message);
    return false;
  }
}

/**
 * Cleanup: Remove test data
 */
async function cleanup() {
  try {
    log('\n=== CLEANUP: Removing Test Data ===', colors.cyan);
    
    await Rating.deleteMany({ customer: testCustomer._id });
    await Booking.deleteMany({ userId: testCustomer._id });
    await User.deleteOne({ _id: testCustomer._id });
    await User.deleteOne({ _id: testTechnician._id });
    
    log('Cleanup completed successfully\n', colors.green);
    return true;
  } catch (error) {
    log(`Cleanup failed: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Print test summary
 */
function printSummary() {
  log('\n=== TEST SUMMARY ===', colors.cyan);
  log(`Total Tests: ${results.passed + results.failed}`);
  log(`Passed: ${results.passed}`, colors.green);
  log(`Failed: ${results.failed}`, results.failed > 0 ? colors.red : colors.green);
  log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`);
  
  if (results.failed > 0) {
    log('\nFailed Tests:', colors.red);
    results.tests.filter(t => !t.passed).forEach(t => {
      log(`  - ${t.name}: ${t.details}`, colors.red);
    });
  }
  
  log('\n');
}

/**
 * Main test runner
 */
async function runTests() {
  try {
    // Connect to database
    log('Connecting to database...', colors.cyan);
    
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI or MONGODB_URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    log('Connected to database\n', colors.green);
    
    // Setup
    const setupSuccess = await setup();
    if (!setupSuccess) {
      log('Setup failed. Aborting tests.', colors.red);
      process.exit(1);
    }
    
    // Run tests
    await test_submitRating();
    await test_technicianRatingUpdate();
    await test_getRatingByBooking();
    await test_getTechnicianStats();
    await test_flagRating();
    await test_technicianResponse();
    await test_markHelpful();
    await test_preventDuplicateRating();
    await test_multipleRatingsAverage();
    await test_virtualProperties();
    
    // Cleanup
    await cleanup();
    
    // Print summary
    printSummary();
    
    // Exit
    await mongoose.connection.close();
    process.exit(results.failed > 0 ? 1 : 0);
    
  } catch (error) {
    log(`\nFatal error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
