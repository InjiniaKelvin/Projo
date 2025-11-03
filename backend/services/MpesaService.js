const axios = require('axios');
const { Buffer } = require('buffer');
const logger = require('../config/logger');

class MpesaService {
 constructor() {
 this.baseUrl = process.env.MPESA_ENV === 'production' 
 ? 'https://api.safaricom.co.ke' 
 : 'https://sandbox.safaricom.co.ke';
 this.consumerKey = process.env.MPESA_CONSUMER_KEY;
 this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
 this.shortcode = process.env.MPESA_SHORTCODE;
 this.passkey = process.env.MPESA_PASSKEY;
 this.callbackUrl = process.env.MPESA_CALLBACK_URL;
 this.accessToken = null;
 this.tokenExpiry = null;
 }

 async authenticate() {
 try {
 if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
 return this.accessToken;
 }

 const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
 
 const response = await axios.get(
 `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
 {
 headers: {
 'Authorization': `Basic ${auth}`,
 'Content-Type': 'application/json'
 }
 }
 );

 this.accessToken = response.data.access_token;
 this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
 
 logger.info('M-PESA authentication successful');
 return this.accessToken;
 } catch (error) {
 logger.error('M-PESA authentication failed:', error.response?.data || error.message);
 throw new Error('Failed to authenticate with M-PESA API');
 }
 }

 async initiateStkPush(phoneNumber, amount, accountReference, transactionDesc) {
 try {
 const accessToken = await this.authenticate();
 
 // Generate timestamp
 const timestamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 14);
 
 // Generate password
 const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');
 
 // Format phone number
 const formattedPhone = this.formatPhoneNumber(phoneNumber);
 
 const stkPushData = {
 BusinessShortCode: this.shortcode,
 Password: password,
 Timestamp: timestamp,
 TransactionType: "CustomerPayBillOnline",
 Amount: amount,
 PartyA: formattedPhone,
 PartyB: this.shortcode,
 PhoneNumber: formattedPhone,
 CallBackURL: this.callbackUrl,
 AccountReference: accountReference,
 TransactionDesc: transactionDesc
 };

 const response = await axios.post(
 `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
 stkPushData,
 {
 headers: {
 'Authorization': `Bearer ${accessToken}`,
 'Content-Type': 'application/json'
 }
 }
 );

 logger.info('STK Push initiated successfully', {
 checkoutRequestId: response.data.CheckoutRequestID,
 merchantRequestId: response.data.MerchantRequestID
 });

 return {
 success: true,
 checkoutRequestId: response.data.CheckoutRequestID,
 merchantRequestId: response.data.MerchantRequestID,
 responseCode: response.data.ResponseCode,
 responseDescription: response.data.ResponseDescription,
 customerMessage: response.data.CustomerMessage
 };
 } catch (error) {
 logger.error('STK Push failed:', error.response?.data || error.message);
 
 return {
 success: false,
 error: error.response?.data?.errorMessage || 'Failed to initiate payment',
 errorCode: error.response?.data?.errorCode
 };
 }
 }

 async queryTransactionStatus(checkoutRequestId) {
 try {
 const accessToken = await this.authenticate();
 
 const timestamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 14);
 const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');
 
 const queryData = {
 BusinessShortCode: this.shortcode,
 Password: password,
 Timestamp: timestamp,
 CheckoutRequestID: checkoutRequestId
 };

 const response = await axios.post(
 `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
 queryData,
 {
 headers: {
 'Authorization': `Bearer ${accessToken}`,
 'Content-Type': 'application/json'
 }
 }
 );

 logger.info('Transaction status queried', {
 checkoutRequestId,
 resultCode: response.data.ResultCode
 });

 return {
 success: true,
 resultCode: response.data.ResultCode,
 resultDesc: response.data.ResultDesc,
 merchantRequestId: response.data.MerchantRequestID,
 checkoutRequestId: response.data.CheckoutRequestID
 };
 } catch (error) {
 logger.error('Transaction status query failed:', error.response?.data || error.message);
 
 return {
 success: false,
 error: error.response?.data?.errorMessage || 'Failed to query transaction status'
 };
 }
 }

 formatPhoneNumber(phoneNumber) {
 // Remove any non-digit characters
 let cleaned = phoneNumber.replace(/\D/g, '');
 
 // Handle different formats
 if (cleaned.startsWith('254')) {
 return cleaned;
 } else if (cleaned.startsWith('0')) {
 return '254' + cleaned.slice(1);
 } else if (cleaned.length === 9) {
 return '254' + cleaned;
 }
 
 return cleaned;
 }

 validatePhoneNumber(phoneNumber) {
 const formatted = this.formatPhoneNumber(phoneNumber);
 
 // Check if it's a valid Kenyan number
 if (!formatted.startsWith('254')) {
 return false;
 }
 
 // Check length (should be 12 digits for Kenyan numbers)
 if (formatted.length !== 12) {
 return false;
 }
 
 // Check if it's a valid mobile network prefix
 const prefix = formatted.slice(3, 6);
 const validPrefixes = ['701', '702', '703', '704', '705', '706', '707', '708', '709', '710', '711', '712', '713', '714', '715', '716', '717', '718', '719', '720', '721', '722', '723', '724', '725', '726', '727', '728', '729', '790', '791', '792', '793', '794', '795', '796', '797', '798', '799'];
 
 return validPrefixes.includes(prefix);
 }
}

module.exports = new MpesaService();
