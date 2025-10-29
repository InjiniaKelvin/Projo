/**
 * Currency formatting utilities for Kenyan Shillings
 */

/**
 * Format amount as Kenyan Shillings
 * @param {number} amount - The amount to format
 * @param {boolean} showCurrency - Whether to show currency symbol
 * @returns {string} Formatted currency string
 */
export const formatKES = (amount, showCurrency = true) => {
 if (typeof amount !== 'number' || isNaN(amount)) {
 return showCurrency ? 'KES 0' : '0';
 }
 
 // Format with commas for thousands
 const formatted = amount.toLocaleString('en-KE', {
 minimumFractionDigits: 0,
 maximumFractionDigits: 2,
 });
 
 return showCurrency ? `KES ${formatted}` : formatted;
};

/**
 * Format amount as abbreviated Kenyan Shillings (e.g., KES 1.2K, KES 1.5M)
 * @param {number} amount - The amount to format
 * @param {boolean} showCurrency - Whether to show currency symbol
 * @returns {string} Formatted abbreviated currency string
 */
export const formatKESAbbreviated = (amount, showCurrency = true) => {
 if (typeof amount !== 'number' || isNaN(amount)) {
 return showCurrency ? 'KES 0' : '0';
 }
 
 let formatted;
 if (amount >= 1000000) {
 formatted = (amount / 1000000).toFixed(1) + 'M';
 } else if (amount >= 1000) {
 formatted = (amount / 1000).toFixed(1) + 'K';
 } else {
 formatted = amount.toFixed(0);
 }
 
 return showCurrency ? `KES ${formatted}` : formatted;
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed amount
 */
export const parseKES = (currencyString) => {
 if (typeof currencyString !== 'string') {
 return 0;
 }
 
 // Remove currency symbols and spaces
 const cleaned = currencyString.replace(/[KES\s,]/g, '');
 const amount = parseFloat(cleaned);
 
 return isNaN(amount) ? 0 : amount;
};
