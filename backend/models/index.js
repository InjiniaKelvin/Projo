/**
 * Models Index File
 * 
 * This file exports all MongoDB models for the QuickFix app.
 * Import this file to access all models in other parts of the application.
 */

const User = require('./User');
const Booking = require('./Booking');
const Service = require('./Service');
const Transaction = require('./Transaction');
const Wallet = require('./Wallet');
const Message = require('./Message');
const Notification = require('./Notification');

module.exports = {
  User,
  Booking,
  Service,
  Transaction,
  Wallet,
  Message,
  Notification
};
