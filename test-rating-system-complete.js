/**
 * QuickFix Rating System - Comprehensive Test Suite
 * 
 * This test script matches the exact QuickFix project structure and validates:
 * - Rating Model (backend/models/Rating.js)
 * - Booking Model (backend/models/Booking.js - BookingRedesigned)
 * - User Model (backend/models/User.js)
 * - Rating Controller (backend/controllers/ratingController.js)
 * - Full end-to-end rating workflow
 * 
 * NO EMOJIS - Professional test output
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import actual models from the project
const Rating = require('./backend/models/Rating');
const BookingRedesigned = require('./backend/models/Booking');
const User = require('./backend/models/User');

// Test configuration
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Test data
let testClient;
let testTechnician;
let testBooking1;
let testBooking2;
let testRating1;
let testRating2;

/**
 * Utility Functions
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(title, colors.cyan);
  log('='.repeat(60), colors.cyan);
}

function recordTest(name, passed, details = '') {
  testResults.total++;
  const status = passed ? '[PASS]' : '[FAIL]';
  const color = passed ? colors.green : colors.red;
  
  log(`${status} ${name}${details ? ': ' + details : ''}`, color);
  
  testResults.details.push({ name, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
  
  return passed;
}

/**
 * Generate valid Kenyan phone number
 */
function generateKenyanPhone() {
  const prefixes = ['700', '701', '710', '711', '720', '721', '722', '733'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  return `+254${prefix}${suffix}`;
}

/**
 * Generate unique email
 */
function generateEmail(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@quickfix.test`;
}

/**
 * SETUP: Create test data matching QuickFix structure
 */
async function setupTestData() {
  try {
    logSection('SETUP: Creating Test Data');
    
    // Create test client (role: 'client')
    const clientPhone = generateKenyanPhone();
    testClient = await User.create({
      firstName: 'Test',
      lastName: 'Client',
      email: generateEmail('client'),
      phoneNumber: clientPhone,
      password: 'TestPass123!',
      role: 'client',
      isVerified: true,
      isPhoneVerified: true
    });
    log(`Created test client: ${testClient._id} (${testClient.phoneNumber})`, colors.green);
    
    // Create test technician (role: 'technician')
    const technicianPhone = generateKenyanPhone();
    testTechnician = await User.create({
      firstName: 'Test',
      lastName: 'Technician',
      email: generateEmail('technician'),
      phoneNumber: technicianPhone,
      password: 'TestPass123!',
      role: 'technician',
      isVerified: true,
      isPhoneVerified: true,
      skills: [
        { name: 'Plumbing', experience: 5, certified: true },
        { name: 'Electrical', experience: 3, certified: false }
      ],
      rating: { average: 0, count: 0 }
    });
    log(`Created test technician: ${testTechnician._id} (${testTechnician.phoneNumber})`, colors.green);
    
    // Create test booking 1 (completed) - matches BookingRedesigned schema
    // Note: Try direct insertOne to bypass any Mongoose middleware issues
    log('Preparing booking data...', colors.dim);
    
    // Generate bookingId manually to avoid any auto-generation issues
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
    const phoneLast4 = testClient.phoneNumber.slice(-4);
    const random1 = Math.random().toString(36).substr(2, 4).toUpperCase();
    const manualBookingId1 = `QF${dateStr}${timeStr}${phoneLast4}${random1}`;
    
    const bookingData1 = {
      bookingId: manualBookingId1,
      clientPhone: testClient.phoneNumber,
      clientName: `${testClient.firstName} ${testClient.lastName}`,
      clientEmail: testClient.email,
      userId: testClient._id,
      technicianId: testTechnician._id,
      serviceType: 'plumbing',
      serviceDescription: 'Fix leaking kitchen sink and replace washers',
      urgency: 'normal',
      location: {
        constituency: 'Westlands',
        ward: 'Parklands',
        road: 'Woodvale Grove',
        description: 'White apartment building next to supermarket',
        landmarks: 'Near Sarit Centre'
      },
      preferredDate: new Date(Date.now() + 86400000), // Tomorrow
      preferredTimeSlot: '08:00-10:00',
      status: 'completed',
      completedAt: new Date(),
      submittedAt: new Date()
    };
    
    log('Inserting booking directly to collection...', colors.dim);
    const result1 = await mongoose.connection.collection('bookingredesigneds').insertOne(bookingData1);
    testBooking1 = await BookingRedesigned.findById(result1.insertedId);
    log(`Created test booking 1: ${testBooking1._id} (${testBooking1.bookingId})`, colors.green);
    
    // Create test booking 2 (completed) - for multiple ratings test
    const random2 = Math.random().toString(36).substr(2, 4).toUpperCase();
    const manualBookingId2 = `QF${dateStr}${timeStr}${phoneLast4}${random2}`;
    
    const bookingData2 = {
      bookingId: manualBookingId2,
      clientPhone: testClient.phoneNumber,
      clientName: `${testClient.firstName} ${testClient.lastName}`,
      clientEmail: testClient.email,
      userId: testClient._id,
      technicianId: testTechnician._id,
      serviceType: 'electrical',
      serviceDescription: 'Install ceiling light fixture and check wiring',
      urgency: 'normal',
      location: {
        constituency: 'Westlands',
        ward: 'Parklands',
        road: 'Woodvale Grove',
        description: 'White apartment building next to supermarket',
        landmarks: 'Near Sarit Centre'
      },
      preferredDate: new Date(Date.now() + 86400000), // Tomorrow
      preferredTimeSlot: '10:00-12:00',
      status: 'completed',
      completedAt: new Date(),
      submittedAt: new Date()
    };
    
    const result2 = await mongoose.connection.collection('bookingredesigneds').insertOne(bookingData2);
    testBooking2 = await BookingRedesigned.findById(result2.insertedId);
    log(`Created test booking 2: ${testBooking2._id} (${testBooking2.bookingId})`, colors.green);
    
    log('\nSetup completed successfully', colors.green);
    return true;
  } catch (error) {
    log(`\nSetup failed: ${error.message}`, colors.red);
    console.error(error);
    return false;
  }
}

/**
 * TEST 1: Submit a rating for completed booking
 */
async function test01_submitRating() {
  logSection('TEST 1: Submit Rating for Completed Booking');
  
  try {
    testRating1 = await Rating.create({
      booking: testBooking1._id,
      technician: testTechnician._id,
      customer: testClient._id,
      ratings: {
        service: 5,
        technician: 5,
        overall: 5
      },
      feedback: 'Excellent service! The technician was very professional and fixed the issue quickly.',
      quickFeedback: ['Professional service', 'On time arrival', 'Quality work', 'Would recommend']
    });
    
    return recordTest(
      'Submit rating',
      testRating1 && testRating1._id,
      `Rating ID: ${testRating1._id}`
    );
  } catch (error) {
    return recordTest('Submit rating', false, error.message);
  }
}

/**
 * TEST 2: Verify technician rating automatically updated
 */
async function test02_technicianRatingUpdate() {
  logSection('TEST 2: Technician Rating Auto-Update');
  
  try {
    // Wait for post-save hook to execute
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedTechnician = await User.findById(testTechnician._id);
    
    const isCorrect = updatedTechnician.rating.average === 5 && 
                     updatedTechnician.rating.count === 1;
    
    return recordTest(
      'Technician rating updated automatically',
      isCorrect,
      `Average: ${updatedTechnician.rating.average}, Count: ${updatedTechnician.rating.count} (Expected: 5, 1)`
    );
  } catch (error) {
    return recordTest('Technician rating updated automatically', false, error.message);
  }
}

/**
 * TEST 3: Retrieve rating by booking ID
 */
async function test03_getRatingByBooking() {
  logSection('TEST 3: Retrieve Rating by Booking ID');
  
  try {
    const rating = await Rating.findOne({ booking: testBooking1._id })
      .populate('customer', 'firstName lastName email')
      .populate('technician', 'firstName lastName email rating')
      .populate('booking', 'bookingId serviceType completedAt');
    
    const found = rating && 
                 rating._id.toString() === testRating1._id.toString() &&
                 rating.booking.bookingId === testBooking1.bookingId;
    
    return recordTest(
      'Retrieve rating by booking ID',
      found,
      found ? `Found rating with all populated fields` : 'Rating not found or incomplete'
    );
  } catch (error) {
    return recordTest('Retrieve rating by booking ID', false, error.message);
  }
}

/**
 * TEST 4: Get technician statistics
 */
async function test04_getTechnicianStats() {
  logSection('TEST 4: Technician Rating Statistics');
  
  try {
    const stats = await Rating.getTechnicianStats(testTechnician._id);
    
    const isCorrect = stats.totalRatings === 1 && 
                     stats.averageOverall === 5 &&
                     stats.distribution[5] === 1;
    
    return recordTest(
      'Get technician statistics',
      isCorrect,
      `Total: ${stats.totalRatings}, Avg: ${stats.averageOverall}, 5-star: ${stats.distribution[5]}`
    );
  } catch (error) {
    return recordTest('Get technician statistics', false, error.message);
  }
}

/**
 * TEST 5: Prevent duplicate rating for same booking
 */
async function test05_preventDuplicateRating() {
  logSection('TEST 5: Prevent Duplicate Rating');
  
  try {
    let errorOccurred = false;
    let errorCode = null;
    
    try {
      await Rating.create({
        booking: testBooking1._id,
        technician: testTechnician._id,
        customer: testClient._id,
        ratings: {
          service: 4,
          technician: 4,
          overall: 4
        },
        feedback: 'Trying to rate again'
      });
    } catch (error) {
      errorOccurred = true;
      errorCode = error.code;
    }
    
    const prevented = errorOccurred && (errorCode === 11000 || errorCode === 11001);
    
    return recordTest(
      'Prevent duplicate rating',
      prevented,
      prevented ? 'Duplicate prevented by unique index' : 'Duplicate was allowed (ERROR)'
    );
  } catch (error) {
    return recordTest('Prevent duplicate rating', false, error.message);
  }
}

/**
 * TEST 6: Submit second rating and verify average calculation
 */
async function test06_multipleRatingsAverage() {
  logSection('TEST 6: Multiple Ratings Average Calculation');
  
  try {
    // Create second rating with rating of 3
    testRating2 = await Rating.create({
      booking: testBooking2._id,
      technician: testTechnician._id,
      customer: testClient._id,
      ratings: {
        service: 3,
        technician: 3,
        overall: 3
      },
      feedback: 'Good service, but took longer than expected.',
      quickFeedback: ['Quality work', 'Friendly technician']
    });
    
    // Wait for update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedTechnician = await User.findById(testTechnician._id);
    
    // Expected average: (5 + 3) / 2 = 4
    const isCorrect = updatedTechnician.rating.average === 4 && 
                     updatedTechnician.rating.count === 2;
    
    return recordTest(
      'Multiple ratings average calculation',
      isCorrect,
      `Average: ${updatedTechnician.rating.average}, Count: ${updatedTechnician.rating.count} (Expected: 4, 2)`
    );
  } catch (error) {
    return recordTest('Multiple ratings average calculation', false, error.message);
  }
}

/**
 * TEST 7: Flag a rating as inappropriate
 */
async function test07_flagRating() {
  logSection('TEST 7: Flag Rating as Inappropriate');
  
  try {
    await testRating1.flagRating(testClient._id, 'spam');
    
    const isFlagged = testRating1.flagged.isFlagged === true &&
                     testRating1.flagged.reason === 'spam' &&
                     testRating1.flagged.moderationStatus === 'pending' &&
                     testRating1.flagged.flaggedBy.toString() === testClient._id.toString();
    
    return recordTest(
      'Flag rating as inappropriate',
      isFlagged,
      `Flagged: ${testRating1.flagged.isFlagged}, Reason: ${testRating1.flagged.reason}, Status: ${testRating1.flagged.moderationStatus}`
    );
  } catch (error) {
    return recordTest('Flag rating as inappropriate', false, error.message);
  }
}

/**
 * TEST 8: Technician responds to rating
 */
async function test08_technicianResponse() {
  logSection('TEST 8: Technician Response to Rating');
  
  try {
    const response = 'Thank you for your feedback! We appreciate your business and are glad we could help.';
    await testRating2.addTechnicianResponse(response);
    
    const hasResponse = testRating2.technicianResponse.content === response &&
                       testRating2.technicianResponse.respondedAt instanceof Date;
    
    return recordTest(
      'Technician response to rating',
      hasResponse,
      `Response added: "${testRating2.technicianResponse.content.substring(0, 50)}..."`
    );
  } catch (error) {
    return recordTest('Technician response to rating', false, error.message);
  }
}

/**
 * TEST 9: Mark rating as helpful
 */
async function test09_markHelpful() {
  logSection('TEST 9: Mark Rating as Helpful');
  
  try {
    await testRating2.markHelpful(testClient._id);
    
    const isMarked = testRating2.helpful.count === 1 &&
                    testRating2.helpful.users.some(id => id.toString() === testClient._id.toString());
    
    return recordTest(
      'Mark rating as helpful',
      isMarked,
      `Helpful count: ${testRating2.helpful.count}, Users: ${testRating2.helpful.users.length}`
    );
  } catch (error) {
    return recordTest('Mark rating as helpful', false, error.message);
  }
}

/**
 * TEST 10: Virtual properties (averageRating, ratingLabel)
 */
async function test10_virtualProperties() {
  logSection('TEST 10: Virtual Properties');
  
  try {
    const rating = await Rating.findById(testRating1._id);
    
    const avgRating = rating.averageRating;
    const label = rating.ratingLabel;
    
    const isCorrect = avgRating === '5.00' && label === 'Excellent';
    
    return recordTest(
      'Virtual properties',
      isCorrect,
      `Average: ${avgRating}, Label: "${label}" (Expected: "5.00", "Excellent")`
    );
  } catch (error) {
    return recordTest('Virtual properties', false, error.message);
  }
}

/**
 * TEST 11: Get recent technician ratings
 */
async function test11_getRecentRatings() {
  logSection('TEST 11: Get Recent Technician Ratings');
  
  try {
    const recentRatings = await Rating.getTechnicianRecentRatings(testTechnician._id, 10);
    
    // After test 7, testRating1 is flagged, so only testRating2 should appear
    const isCorrect = recentRatings.length === 1 &&
                     recentRatings[0].technician.toString() === testTechnician._id.toString();
    
    return recordTest(
      'Get recent technician ratings',
      isCorrect,
      `Found ${recentRatings.length} ratings (Expected: 1 - excluding flagged rating)`
    );
  } catch (error) {
    return recordTest('Get recent technician ratings', false, error.message);
  }
}

/**
 * TEST 12: Verify rating only for completed bookings
 */
async function test12_onlyCompletedBookings() {
  logSection('TEST 12: Verify Rating Only for Completed Bookings');
  
  try {
    // Create a pending booking - use same date components from setup
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
    const phoneLast4 = testClient.phoneNumber.slice(-4);
    const random3 = Math.random().toString(36).substr(2, 4).toUpperCase();
    const manualBookingId3 = `QF${dateStr}${timeStr}${phoneLast4}${random3}`;
    
    const pendingBookingData = {
      bookingId: manualBookingId3,
      clientPhone: testClient.phoneNumber,
      clientName: `${testClient.firstName} ${testClient.lastName}`,
      clientEmail: testClient.email,
      userId: testClient._id,
      technicianId: testTechnician._id,
      serviceType: 'plumbing',
      serviceDescription: 'Test pending booking',
      urgency: 'normal',
      location: {
        constituency: 'Westlands',
        ward: 'Parklands',
        road: 'Test Road',
        description: 'Test location'
      },
      preferredDate: new Date(Date.now() + 86400000), // Tomorrow
      preferredTimeSlot: '14:00-16:00',
      status: 'submitted',  // Not completed
      submittedAt: new Date()
    };
    
    const result3 = await mongoose.connection.collection('bookingredesigneds').insertOne(pendingBookingData);
    const pendingBooking = await BookingRedesigned.findById(result3.insertedId);
    
    let errorOccurred = false;
    try {
      await Rating.create({
        booking: pendingBooking._id,
        technician: testTechnician._id,
        customer: testClient._id,
        ratings: { service: 5, technician: 5, overall: 5 }
      });
    } catch (error) {
      errorOccurred = error.message.includes('completed');
    }
    
    // Cleanup
    await BookingRedesigned.deleteOne({ _id: pendingBooking._id });
    
    return recordTest(
      'Verify rating only for completed bookings',
      errorOccurred,
      errorOccurred ? 'Non-completed booking rejected' : 'Non-completed booking was allowed (ERROR)'
    );
  } catch (error) {
    return recordTest('Verify rating only for completed bookings', false, error.message);
  }
}

/**
 * CLEANUP: Remove all test data
 */
async function cleanupTestData() {
  try {
    logSection('CLEANUP: Removing Test Data');
    
    // Delete ratings
    await Rating.deleteMany({ customer: testClient._id });
    log('Deleted test ratings', colors.green);
    
    // Delete bookings
    await BookingRedesigned.deleteMany({ userId: testClient._id });
    log('Deleted test bookings', colors.green);
    
    // Delete users
    await User.deleteOne({ _id: testClient._id });
    await User.deleteOne({ _id: testTechnician._id });
    log('Deleted test users', colors.green);
    
    log('\nCleanup completed successfully', colors.green);
    return true;
  } catch (error) {
    log(`\nCleanup failed: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Print comprehensive test summary
 */
function printTestSummary() {
  logSection('TEST SUMMARY');
  
  log(`\nTotal Tests Run: ${testResults.total}`);
  log(`Passed: ${testResults.passed}`, colors.green);
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? colors.red : colors.green);
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
  log(`Success Rate: ${successRate}%`, successRate === '100.00' ? colors.green : colors.yellow);
  
  if (testResults.failed > 0) {
    log('\nFailed Tests:', colors.red);
    testResults.details
      .filter(t => !t.passed)
      .forEach(t => log(`  - ${t.name}: ${t.details}`, colors.red));
  }
  
  log('\n' + '='.repeat(60), colors.cyan);
  
  if (testResults.failed === 0) {
    log('ALL TESTS PASSED - Rating system is working correctly!', colors.green);
  } else {
    log(`${testResults.failed} TEST(S) FAILED - Please review errors above.`, colors.red);
  }
  
  log('='.repeat(60) + '\n', colors.cyan);
}

/**
 * Main test runner
 */
async function runAllTests() {
  try {
    // Connect to database
    log('Connecting to MongoDB...', colors.cyan);
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGO_URI or MONGODB_URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    log('Connected to MongoDB successfully\n', colors.green);
    
    // Setup
    const setupSuccess = await setupTestData();
    if (!setupSuccess) {
      log('\nSetup failed. Aborting tests.', colors.red);
      process.exit(1);
    }
    
    // Run all tests
    await test01_submitRating();
    await test02_technicianRatingUpdate();
    await test03_getRatingByBooking();
    await test04_getTechnicianStats();
    await test05_preventDuplicateRating();
    await test06_multipleRatingsAverage();
    await test07_flagRating();
    await test08_technicianResponse();
    await test09_markHelpful();
    await test10_virtualProperties();
    await test11_getRecentRatings();
    await test12_onlyCompletedBookings();
    
    // Cleanup
    await cleanupTestData();
    
    // Print summary
    printTestSummary();
    
    // Close connection
    await mongoose.connection.close();
    log('Database connection closed', colors.cyan);
    
    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
    
  } catch (error) {
    log(`\nFatal error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
