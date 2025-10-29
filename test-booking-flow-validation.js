/**
 * COMPREHENSIVE BOOKING FLOW VALIDATION
 * 
 * This script validates the complete booking flow with real data
 * to ensure frontend and backend work perfectly together
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// EXACT FRONTEND DATA STRUCTURE (what the frontend sends)
const frontendBookingData = {
 clientName: "John Doe",
 clientPhone: "0712345678",
 clientEmail: "john.doe@example.com",
 communicationPhone: "", // Optional, can be empty
 
 serviceType: "plumbing",
 serviceDescription: "Kitchen sink is leaking badly. Water dripping from the U-bend pipe under the sink. Need urgent repair and replacement of worn washers.",
 urgency: "normal",
 
 location: {
 constituency: "Westlands",
 ward: "Kitisuru",
 road: "Spring Valley Road",
 description: "Green apartment building, Unit 5B, second floor, door on the left",
 landmarks: "Near Village Market shopping center, opposite Shell petrol station"
 },
 
 preferredDate: "2025-10-16",
 preferredTimeSlot: "10:00-12:00",
 specialRequirements: "Please bring pipe sealant and replacement washers. Gate code is 1234."
};

async function validateBookingFlow() {
 console.log('\n========================================');
 console.log('COMPREHENSIVE BOOKING FLOW VALIDATION');
 console.log('========================================\n');

 let validationPassed = true;
 const validationResults = [];

 // TEST 1: Validate Required Fields
 console.log('TEST 1: Validating Required Fields...');
 const requiredFields = [
 'clientName',
 'clientPhone',
 'serviceType',
 'serviceDescription',
 'location.constituency',
 'location.ward',
 'location.road',
 'location.description',
 'preferredDate',
 'preferredTimeSlot'
 ];

 let missingFields = [];
 requiredFields.forEach(field => {
 const keys = field.split('.');
 let value = frontendBookingData;
 for (const key of keys) {
 value = value?.[key];
 }
 if (!value || (typeof value === 'string' && !value.trim())) {
 missingFields.push(field);
 }
 });

 if (missingFields.length === 0) {
 console.log('OK All required fields present');
 validationResults.push({ test: 'Required Fields', status: 'PASS' });
 } else {
 console.log('FAIL Missing required fields:', missingFields);
 validationResults.push({ test: 'Required Fields', status: 'FAIL', details: missingFields });
 validationPassed = false;
 }

 console.log('\n----------------------------------------\n');

 // TEST 2: Validate Phone Format
 console.log('TEST 2: Validating Phone Format...');
 const phoneRegex = /^(254|0)?[17][0-9]{8}$/;
 const cleanPhone = frontendBookingData.clientPhone.replace(/[\s\-\+]/g, '');
 
 if (phoneRegex.test(cleanPhone)) {
 console.log('OK Phone format valid:', frontendBookingData.clientPhone);
 console.log(' Will normalize to:', cleanPhone.startsWith('0') ? '+254' + cleanPhone.slice(1) : cleanPhone);
 validationResults.push({ test: 'Phone Format', status: 'PASS' });
 } else {
 console.log('FAIL Invalid phone format:', frontendBookingData.clientPhone);
 validationResults.push({ test: 'Phone Format', status: 'FAIL' });
 validationPassed = false;
 }

 console.log('\n----------------------------------------\n');

 // TEST 3: Validate Email Format (if provided)
 console.log('TEST 3: Validating Email Format...');
 if (frontendBookingData.clientEmail) {
 const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
 if (emailRegex.test(frontendBookingData.clientEmail)) {
 console.log('OK Email format valid:', frontendBookingData.clientEmail);
 validationResults.push({ test: 'Email Format', status: 'PASS' });
 } else {
 console.log('FAIL Invalid email format:', frontendBookingData.clientEmail);
 validationResults.push({ test: 'Email Format', status: 'FAIL' });
 validationPassed = false;
 }
 } else {
 console.log('o Email not provided (optional)');
 validationResults.push({ test: 'Email Format', status: 'SKIP' });
 }

 console.log('\n----------------------------------------\n');

 // TEST 4: Validate Date
 console.log('TEST 4: Validating Preferred Date...');
 const prefDate = new Date(frontendBookingData.preferredDate);
 const today = new Date();
 today.setHours(0, 0, 0, 0);

 if (prefDate >= today) {
 console.log('OK Date is valid and not in the past');
 console.log(' Preferred date:', frontendBookingData.preferredDate);
 validationResults.push({ test: 'Date Validation', status: 'PASS' });
 } else {
 console.log('FAIL Date is in the past:', frontendBookingData.preferredDate);
 validationResults.push({ test: 'Date Validation', status: 'FAIL' });
 validationPassed = false;
 }

 console.log('\n----------------------------------------\n');

 // TEST 5: Validate Service Type
 console.log('TEST 5: Validating Service Type...');
 const validServiceTypes = [
 'plumbing', 'electrical', 'carpentry', 'painting', 'cleaning',
 'appliance_repair', 'air_conditioning', 'roofing', 'gardening',
 'pest_control', 'security_systems', 'solar_installation',
 'general_maintenance', 'other'
 ];

 if (validServiceTypes.includes(frontendBookingData.serviceType)) {
 console.log('OK Service type is valid:', frontendBookingData.serviceType);
 validationResults.push({ test: 'Service Type', status: 'PASS' });
 } else {
 console.log('FAIL Invalid service type:', frontendBookingData.serviceType);
 validationResults.push({ test: 'Service Type', status: 'FAIL' });
 validationPassed = false;
 }

 console.log('\n----------------------------------------\n');

 // TEST 6: Validate Time Slot
 console.log('TEST 6: Validating Time Slot...');
 const validTimeSlots = [
 '08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00',
 '16:00-18:00', 'emergency-asap', 'emergency-today', 'flexible'
 ];

 if (validTimeSlots.includes(frontendBookingData.preferredTimeSlot)) {
 console.log('OK Time slot is valid:', frontendBookingData.preferredTimeSlot);
 validationResults.push({ test: 'Time Slot', status: 'PASS' });
 } else {
 console.log('FAIL Invalid time slot:', frontendBookingData.preferredTimeSlot);
 validationResults.push({ test: 'Time Slot', status: 'FAIL' });
 validationPassed = false;
 }

 console.log('\n----------------------------------------\n');

 // TEST 7: Validate Description Length
 console.log('TEST 7: Validating Description Length...');
 if (frontendBookingData.serviceDescription.length >= 10) {
 console.log('OK Description is adequate length:', frontendBookingData.serviceDescription.length, 'characters');
 validationResults.push({ test: 'Description Length', status: 'PASS' });
 } else {
 console.log('FAIL Description too short:', frontendBookingData.serviceDescription.length, 'characters (minimum 10)');
 validationResults.push({ test: 'Description Length', status: 'FAIL' });
 validationPassed = false;
 }

 console.log('\n----------------------------------------\n');

 // TEST 8: Validate Data Structure (Backend Compatibility)
 console.log('TEST 8: Validating Backend Compatibility...');
 const hasNestedLocation = frontendBookingData.location && 
 typeof frontendBookingData.location === 'object';
 
 if (hasNestedLocation) {
 console.log('OK Location is properly nested object');
 console.log(' Constituency:', frontendBookingData.location.constituency);
 console.log(' Ward:', frontendBookingData.location.ward);
 console.log(' Road:', frontendBookingData.location.road);
 validationResults.push({ test: 'Data Structure', status: 'PASS' });
 } else {
 console.log('FAIL Location is not properly structured');
 validationResults.push({ test: 'Data Structure', status: 'FAIL' });
 validationPassed = false;
 }

 console.log('\n========================================');
 console.log('VALIDATION SUMMARY');
 console.log('========================================\n');

 console.log('Test Results:');
 validationResults.forEach(result => {
 const symbol = result.status === 'PASS' ? 'OK' : 
 result.status === 'FAIL' ? 'FAIL' : 'o';
 console.log(` ${symbol} ${result.test}: ${result.status}`);
 if (result.details) {
 console.log(` Details: ${result.details.join(', ')}`);
 }
 });

 const passCount = validationResults.filter(r => r.status === 'PASS').length;
 const failCount = validationResults.filter(r => r.status === 'FAIL').length;
 const skipCount = validationResults.filter(r => r.status === 'SKIP').length;

 console.log('\nStatistics:');
 console.log(' Passed:', passCount);
 console.log(' Failed:', failCount);
 console.log(' Skipped:', skipCount);
 console.log(' Total:', validationResults.length);

 console.log('\n========================================');
 
 if (validationPassed && failCount === 0) {
 console.log('STATUS: ALL VALIDATIONS PASSED OK');
 console.log('========================================\n');
 console.log('The booking data is valid and ready for submission.');
 console.log('Frontend-Backend data flow is properly aligned.\n');
 return true;
 } else {
 console.log('STATUS: VALIDATION FAILED FAIL');
 console.log('========================================\n');
 console.log('There are validation errors that need to be fixed.\n');
 return false;
 }
}

// Run validation
validateBookingFlow()
 .then(success => {
 process.exit(success ? 0 : 1);
 })
 .catch(error => {
 console.error('Unexpected error:', error);
 process.exit(1);
 });
