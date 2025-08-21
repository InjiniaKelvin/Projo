/**
 * Validation script to ensure booking flow replacement was successful
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Booking System Replacement...\n');

// Check if main booking files exist
const filesToCheck = [
  'backend/controllers/bookingController.js',
  'backend/models/Booking.js', 
  'backend/routes/bookings.js',
  'app/booking/details.tsx'
];

const oldFilesRemoved = [
  'backend/controllers/bookingController_old.js',
  'backend/models/Booking_old.js',
  'backend/routes/bookings_old.js',
  'app/booking/details_old.tsx'
];

let allValid = true;

console.log('✅ Checking main booking files exist:');
filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✓ ${file}`);
  } else {
    console.log(`   ✗ ${file} - MISSING!`);
    allValid = false;
  }
});

console.log('\n✅ Checking old files were removed:');
oldFilesRemoved.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) {
    console.log(`   ✓ ${file} - Removed`);
  } else {
    console.log(`   ✗ ${file} - Still exists!`);
    allValid = false;
  }
});

console.log('\n✅ Checking backup files exist:');
const backupFiles = [
  'backend/controllers/BookingControllerRedesigned_backup.js',
  'backend/models/BookingRedesigned_backup.js',
  'backend/routes/bookingRedesigned_backup.js',
  'app/booking/redesigned-form_backup.tsx'
];

backupFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✓ ${file}`);
  } else {
    console.log(`   ✗ ${file} - MISSING BACKUP!`);
    allValid = false;
  }
});

if (allValid) {
  console.log('\n🎉 Booking system replacement completed successfully!');
  console.log('✅ All main files are in place');
  console.log('✅ Old files have been removed');
  console.log('✅ Backup files are preserved');
  console.log('✅ Redesigned booking system is now the primary system');
} else {
  console.log('\n❌ Some issues found during validation');
}
