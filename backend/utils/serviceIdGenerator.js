/**
 * Service ID Generator Utility
 * 
 * Generates intelligent service IDs based on:
 * - Service urgency (E for Emergency, R for Regular)
 * - Client name abbreviation
 * - Phone number digits
 * - Random suffix for uniqueness
 * - Always ends with 'Q'
 * 
 * Format: [E/R][NameAbbrev][PhoneDigits][Random]Q
 * Examples: EJOD123456Q, RJAS789012Q
 */

/**
 * Generate a unique service ID
 * @param {Object} params - Parameters for ID generation
 * @param {string} params.clientName - Full name of the client
 * @param {string} params.phoneNumber - Client's phone number
 * @param {string} params.urgency - Service urgency level
 * @param {string} params.serviceType - Type of service
 * @returns {string} Generated service ID
 */
function generateServiceId(urgency, clientName, phoneNumber, serviceType = null) {
 try {
 // Handle both parameter styles for backward compatibility
 let actualUrgency, actualClientName, actualPhoneNumber;
 
 if (typeof urgency === 'object' && urgency !== null) {
 // Object parameter style - support multiple property names
 actualUrgency = urgency.isEmergency || urgency.urgency;
 actualClientName = urgency.customerName || urgency.clientName;
 actualPhoneNumber = urgency.phoneNumber;
 } else {
 // Individual parameter style
 actualUrgency = urgency;
 actualClientName = clientName;
 actualPhoneNumber = phoneNumber;
 }
 
 // 1. Service prefix based on urgency
 const prefix = (actualUrgency === true || actualUrgency === 'emergency' || actualUrgency === 'Emergency') ? 'E' : 'R';
 
 // 2. Clean and process client name - ensure it's a string
 const cleanName = String(actualClientName || '').trim().toUpperCase().replace(/[^A-Z\s]/g, '');
 const nameParts = cleanName.split(' ').filter(part => part.length > 0);
 
 // Get name abbreviation (first 2 letters of first name + first letter of last name)
 let nameAbbrev = '';
 if (nameParts.length >= 2) {
 nameAbbrev = nameParts[0].substring(0, 2) + nameParts[1].substring(0, 1);
 } else if (nameParts.length === 1) {
 nameAbbrev = nameParts[0].substring(0, 3);
 } else {
 nameAbbrev = 'USR'; // fallback
 }
 
 // 3. Process phone number - ensure it's a string
 let cleanPhone = String(actualPhoneNumber || '').replace(/[\s\-\+]/g, '');
 
 // Handle Kenyan phone number formats
 if (cleanPhone.startsWith('254')) {
 cleanPhone = cleanPhone.substring(3); // Remove country code
 } else if (cleanPhone.startsWith('0')) {
 cleanPhone = cleanPhone.substring(1); // Remove leading 0
 }
 
 // Extract digits based on Kenyan format (7X or 1X after removing prefix)
 let phoneDigits = '';
 if (cleanPhone.length >= 8) {
 // Get digits after 07/01 (positions 1-2) and last 3 digits
 const secondThirdDigit = cleanPhone.substring(1, 3);
 const lastThreeDigits = cleanPhone.substring(cleanPhone.length - 3);
 phoneDigits = secondThirdDigit + lastThreeDigits;
 } else {
 // Fallback for shorter numbers
 phoneDigits = cleanPhone.substring(0, Math.min(5, cleanPhone.length)).padEnd(5, '0');
 }
 
 // 4. Add random element for uniqueness (2 digits)
 const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
 
 // 5. Construct service ID: [E/R][NameAbbrev][PhoneDigits][Random]Q
 const serviceId = `${prefix}${nameAbbrev}${phoneDigits}${randomSuffix}Q`;
 
 return serviceId;
 
 } catch (error) {
 console.error('Error generating service ID:', error);
 // Fallback ID generation
 const fallbackPrefix = urgency === 'emergency' ? 'E' : 'R';
 const fallbackId = `${fallbackPrefix}${Date.now().toString().slice(-7)}Q`;
 return fallbackId;
 }
}

/**
 * Validate service ID format
 * @param {string} serviceId - Service ID to validate
 * @returns {boolean} Whether the ID is valid
 */
function validateServiceId(serviceId) {
 if (!serviceId || typeof serviceId !== 'string') return false;
 
 // Check basic format: starts with E or R, ends with Q, length between 8-15 chars
 const format = /^[ER][A-Z0-9]{6,13}Q$/;
 return format.test(serviceId);
}

/**
 * Parse service ID to extract information
 * @param {string} serviceId - Service ID to parse
 * @returns {Object} Parsed information
 */
function parseServiceId(serviceId) {
 if (!validateServiceId(serviceId)) {
 return { valid: false };
 }
 
 const urgencyType = serviceId[0] === 'E' ? 'emergency' : 'regular';
 const nameAbbrev = serviceId.substring(1, 4);
 const phoneDigits = serviceId.substring(4, serviceId.length - 3);
 const timestamp = serviceId.substring(serviceId.length - 3, serviceId.length - 1);
 
 return {
 valid: true,
 urgencyType,
 nameAbbrev,
 phoneDigits,
 timestamp,
 fullId: serviceId
 };
}

module.exports = {
 generateServiceId,
 validateServiceId,
 parseServiceId
};
