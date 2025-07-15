/**
 * Models Index File
 * 
 * This file exports all MongoDB models for the QuickFix app.
 * Import this file to access all models in other parts of the application.
 */

const User = require('./User');
const Wallet = require('./Wallet');
const Transaction = require('./Transaction');
const Booking = require('./Booking');

module.exports = {
  User,
  Wallet,
  Transaction,
  Booking
};
