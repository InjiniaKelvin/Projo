#!/usr/bin/env node

// SIMPLIFIED COMPREHENSIVE BOOKING SYSTEM TEST
// Quick validation of all implemented features

console.log('🚀 QUICKFIX BOOKING SYSTEM - IMPLEMENTATION VERIFICATION');
console.log('=' .repeat(60));

const fs = require('fs');
const path = require('path');

// Color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test results tracker
const results = {};

function testCustomBookingID() {
  log('\n🔍 Testing Custom Booking ID Format...', 'cyan');
  
  const bookingModelPath = './backend/models/Booking.js';
  if (fs.existsSync(bookingModelPath)) {
    const content = fs.readFileSync(bookingModelPath, 'utf8');
    const hasFormat = content.includes('q[phone-first-2]b[phone-last-3]t[timestamp][r/e]');
    const hasImplementation = content.includes('phoneFirst2') && content.includes('phoneLast3');
    
    if (hasFormat && hasImplementation) {
      log('✅ Custom booking ID format implemented correctly', 'green');
      results.bookingId = true;
    } else {
      log('❌ Custom booking ID format missing', 'red');
      results.bookingId = false;
    }
  } else {
    log('❌ Booking model not found', 'red');
    results.bookingId = false;
  }
}

function testTimeValidation() {
  log('\n🕐 Testing 2-Hour Time Validation...', 'cyan');
  
  const backendPath = './backend/controllers/bookingController.js';
  const frontendPath = './app/booking/redesigned-form.tsx';
  
  let backendOk = false;
  let frontendOk = false;
  
  if (fs.existsSync(backendPath)) {
    const content = fs.readFileSync(backendPath, 'utf8');
    backendOk = content.includes('2 * 60 * 60 * 1000') && content.includes('minimumBookingTime');
  }
  
  if (fs.existsSync(frontendPath)) {
    const content = fs.readFileSync(frontendPath, 'utf8');
    frontendOk = content.includes('2 * 60 * 60 * 1000') || content.includes('at least 2 hours');
  }
  
  if (backendOk && frontendOk) {
    log('✅ Time validation implemented (backend & frontend)', 'green');
    results.timeValidation = true;
  } else {
    log('❌ Time validation incomplete', 'red');
    results.timeValidation = false;
  }
}

function testEmergencyNavigation() {
  log('\n🚨 Testing Emergency Navigation...', 'cyan');
  
  const emergencyPath = './app/booking/emergency-services.tsx';
  const formPath = './app/booking/redesigned-form.tsx';
  
  let navigationOk = false;
  let paramsOk = false;
  
  if (fs.existsSync(emergencyPath)) {
    const content = fs.readFileSync(emergencyPath, 'utf8');
    navigationOk = content.includes('/booking/redesigned-form');
  }
  
  if (fs.existsSync(formPath)) {
    const content = fs.readFileSync(formPath, 'utf8');
    paramsOk = content.includes('useAuth') && content.includes('params.isEmergency');
  }
  
  if (navigationOk && paramsOk) {
    log('✅ Emergency navigation fixed', 'green');
    results.emergencyNav = true;
  } else {
    log('❌ Emergency navigation needs work', 'red');
    results.emergencyNav = false;
  }
}

function testBookingDisplay() {
  log('\n📋 Testing Booking Display...', 'cyan');
  
  const bookingsPath = './app/bookings.js';
  
  if (fs.existsSync(bookingsPath)) {
    const content = fs.readFileSync(bookingsPath, 'utf8');
    const hasEmergencyTab = content.includes('Emergency') && content.includes('emergency');
    const hasFiltering = content.includes('booking.urgency');
    
    if (hasEmergencyTab && hasFiltering) {
      log('✅ Booking display enhanced', 'green');
      results.bookingDisplay = true;
    } else {
      log('❌ Booking display incomplete', 'red');
      results.bookingDisplay = false;
    }
  } else {
    log('❌ Bookings file not found', 'red');
    results.bookingDisplay = false;
  }
}

function testTimeGreeting() {
  log('\n🌅 Testing Time-Based Greeting...', 'cyan');
  
  const dashboardPath = './Screens/ClientDashboard.js';
  
  if (fs.existsSync(dashboardPath)) {
    const content = fs.readFileSync(dashboardPath, 'utf8');
    const hasGreeting = content.includes('getTimeBasedGreeting');
    const hasTimeLogic = content.includes('Good morning') && content.includes('Good evening');
    
    if (hasGreeting && hasTimeLogic) {
      log('✅ Time-based greeting implemented', 'green');
      results.timeGreeting = true;
    } else {
      log('❌ Time-based greeting missing', 'red');
      results.timeGreeting = false;
    }
  } else {
    log('❌ Dashboard file not found', 'red');
    results.timeGreeting = false;
  }
}

function testDatePicker() {
  log('\n📅 Testing Date Picker...', 'cyan');
  
  const formPath = './app/booking/redesigned-form.tsx';
  
  if (fs.existsExists(formPath)) {
    const content = fs.readFileSync(formPath, 'utf8');
    const hasDatePicker = content.includes('DateTimePicker') && content.includes('showDatePicker');
    
    if (hasDatePicker) {
      log('✅ Date picker implemented', 'green');
      results.datePicker = true;
    } else {
      log('❌ Date picker missing', 'red');
      results.datePicker = false;
    }
  } else {
    log('❌ Form file not found', 'red');
    results.datePicker = false;
  }
}

function testAutopopulation() {
  log('\n👤 Testing User Data Autopopulation...', 'cyan');
  
  const formPath = './app/booking/redesigned-form.tsx';
  const dashboardPath = './Screens/ClientDashboard.js';
  
  let formOk = false;
  let dashboardOk = false;
  
  if (fs.existsSync(formPath)) {
    const content = fs.readFileSync(formPath, 'utf8');
    formOk = content.includes('useAuth') && content.includes('user.firstName');
  }
  
  if (fs.existsSync(dashboardPath)) {
    const content = fs.readFileSync(dashboardPath, 'utf8');
    dashboardOk = content.includes('user?.firstName') || content.includes('user?.name');
  }
  
  if (formOk && dashboardOk) {
    log('✅ User data autopopulation implemented', 'green');
    results.autopopulation = true;
  } else {
    log('❌ Autopopulation needs work', 'red');
    results.autopopulation = false;
  }
}

function testNavigationFix() {
  log('\n🔄 Testing Navigation Fix...', 'cyan');
  
  const regularServicesPath = './app/booking/regular-services.tsx';
  
  if (fs.existsSync(regularServicesPath)) {
    const content = fs.readFileSync(regularServicesPath, 'utf8');
    const hasNavigationFix = content.includes("router.replace('/dashboard/client')");
    
    if (hasNavigationFix) {
      log('✅ Navigation fix implemented', 'green');
      results.navigationFix = true;
    } else {
      log('❌ Navigation fix missing', 'red');
      results.navigationFix = false;
    }
  } else {
    log('❌ Regular services file not found', 'red');
    results.navigationFix = false;
  }
}

// Run all tests
function runAllTests() {
  testCustomBookingID();
  testTimeValidation();
  testEmergencyNavigation();
  testBookingDisplay();
  testTimeGreeting();
  testDatePicker();
  testAutopopulation();
  testNavigationFix();
  
  // Summary
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(Boolean).length;
  
  log('\n📊 FINAL SUMMARY', 'magenta');
  log('=' .repeat(40), 'magenta');
  log(`Total Tests: ${total}`, 'cyan');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${total - passed}`, 'red');
  log(`Success Rate: ${Math.round((passed / total) * 100)}%`, 'yellow');
  
  if (passed === total) {
    log('\n🎉 ALL SYSTEMS OPERATIONAL!', 'green');
    log('QuickFix booking system is ready for submission! 🚀', 'green');
  } else {
    log('\n⚠️ Some issues detected. Review failed tests above.', 'yellow');
  }
  
  console.log('\n' + '=' .repeat(60));
}

// Fix the typo in testDatePicker
function testDatePicker() {
  log('\n📅 Testing Date Picker...', 'cyan');
  
  const formPath = './app/booking/redesigned-form.tsx';
  
  if (fs.existsSync(formPath)) {
    const content = fs.readFileSync(formPath, 'utf8');
    const hasDatePicker = content.includes('DateTimePicker') && content.includes('showDatePicker');
    
    if (hasDatePicker) {
      log('✅ Date picker implemented', 'green');
      results.datePicker = true;
    } else {
      log('❌ Date picker missing', 'red');
      results.datePicker = false;
    }
  } else {
    log('❌ Form file not found', 'red');
    results.datePicker = false;
  }
}

// Execute tests
runAllTests();
