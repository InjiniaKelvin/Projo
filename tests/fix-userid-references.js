/**
 * Script to fix all userId references to clientId in bookingController.js
 * This will systematically replace populate('userId') with populate('clientId')
 * and booking.userId with booking.clientId throughout the file
 */

const fs = require('fs');
const path = require('path');

const filePath = './backend/controllers/bookingController.js';

console.log(' Fixing userId references in bookingController.js...\n');

try {
  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Track changes
  let changeCount = 0;
  
  // Replace populate('userId' with populate('clientId'
  const populateMatches = content.match(/\.populate\('userId'/g);
  if (populateMatches) {
    content = content.replace(/\.populate\('userId'/g, ".populate('clientId'");
    changeCount += populateMatches.length;
    console.log(` Fixed ${populateMatches.length} populate('userId') calls`);
  }
  
  // Replace booking.userId with booking.clientId
  const bookingUserIdMatches = content.match(/booking\.userId/g);
  if (bookingUserIdMatches) {
    content = content.replace(/booking\.userId/g, 'booking.clientId');
    changeCount += bookingUserIdMatches.length;
    console.log(` Fixed ${bookingUserIdMatches.length} booking.userId references`);
  }
  
  // Replace assignedTechnician with technicianId in populate calls
  const technicianMatches = content.match(/\.populate\('assignedTechnician'/g);
  if (technicianMatches) {
    content = content.replace(/\.populate\('assignedTechnician'/g, ".populate('technicianId'");
    changeCount += technicianMatches.length;
    console.log(` Fixed ${technicianMatches.length} populate('assignedTechnician') calls`);
  }
  
  // Replace booking.assignedTechnician with booking.technicianId  
  const bookingTechnicianMatches = content.match(/booking\.assignedTechnician/g);
  if (bookingTechnicianMatches) {
    content = content.replace(/booking\.assignedTechnician/g, 'booking.technicianId');
    changeCount += bookingTechnicianMatches.length;
    console.log(` Fixed ${bookingTechnicianMatches.length} booking.assignedTechnician references`);
  }
  
  // Write the file back
  fs.writeFileSync(filePath, content);
  
  console.log(`\n Successfully fixed ${changeCount} references in bookingController.js`);
  console.log(' The file has been updated with correct field names');
  
} catch (error) {
  console.error(' Error fixing file:', error.message);
}
