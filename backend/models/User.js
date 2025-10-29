/**
 * User Model for QuickFix App
 * 
 * This model defines the structure for all users (clients, technicians, admins)
 * with role-based authentication, profile management, and security features.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const mongoosePaginate = require('mongoose-paginate-v2');

const userSchema = new mongoose.Schema({
 // Basic Information
 email: {
 type: String,
 required: [true, 'Email is required'],
 unique: true,
 lowercase: true,
 trim: true,
 match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/, 'Please enter a valid email']
 },
 
 password: {
 type: String,
 required: [true, 'Password is required'],
 minlength: [6, 'Password must be at least 6 characters long'],
 select: false // Don't include password in queries by default (security & performance)
 },
 
 firstName: {
 type: String,
 required: [true, 'First name is required'],
 trim: true,
 maxlength: [50, 'First name cannot exceed 50 characters']
 },
 
 lastName: {
 type: String,
 required: [true, 'Last name is required'],
 trim: true,
 maxlength: [50, 'Last name cannot exceed 50 characters']
 },
 
 phoneNumber: {
 type: String,
 required: [true, 'Phone number is required'],
 trim: true,
 match: [/^(\+?254|0)[1-9]\d{8}$/, 'Please enter a valid Kenyan phone number']
 },
 
 // Role-based access control
 role: {
 type: String,
 enum: ['client', 'technician', 'admin'],
 default: 'client',
 required: true
 },
 
 // Profile Information
 profileImage: {
 type: String,
 default: null
 },
 
 dateOfBirth: {
 type: Date,
 validate: {
 validator: function(value) {
 return !value || value < new Date();
 },
 message: 'Date of birth cannot be in the future'
 }
 },
 
 gender: {
 type: String,
 enum: ['male', 'female', 'other', 'prefer_not_to_say'],
 default: 'prefer_not_to_say'
 },
 
 // Location Information
 address: {
 street: { type: String, trim: true },
 city: { type: String, trim: true },
 county: { type: String, trim: true },
 postalCode: { type: String, trim: true },
 country: { type: String, default: 'Kenya', trim: true }
 },
 
 location: {
 type: {
 type: String,
 enum: ['Point'],
 default: 'Point'
 },
 coordinates: {
 type: [Number], // [longitude, latitude]
 default: [0, 0]
 }
 },
 
 // Technician-specific fields
 skills: [{
 name: {
 type: String,
 required: function() { return this.role === 'technician'; }
 },
 experience: {
 type: Number, // years of experience
 min: 0,
 max: 50
 },
 certified: {
 type: Boolean,
 default: false
 }
 }],
 
 availability: {
 isAvailable: {
 type: Boolean,
 default: function() { return this.role === 'technician' ? true : undefined; }
 },
 workingHours: {
 start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }, // HH:MM format
 end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
 },
 workingDays: [{
 type: String,
 enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
 }]
 },
 
 // Rating and Reviews
 rating: {
 average: { type: Number, default: 0, min: 0, max: 5 },
 count: { type: Number, default: 0, min: 0 }
 },
 
 // Account Status
 isActive: {
 type: Boolean,
 default: true
 },
 
 isVerified: {
 type: Boolean,
 default: false
 },
 
 isEmailVerified: {
 type: Boolean,
 default: false
 },
 
 isPhoneVerified: {
 type: Boolean,
 default: false
 },
 
 // Security
 lastLogin: {
 type: Date,
 default: null
 },
 
 refreshTokens: [{
 token: String,
 createdAt: { type: Date, default: Date.now },
 expiresAt: Date
 }],
 
 passwordResetToken: {
 type: String,
 default: null
 },
 
 passwordResetExpires: {
 type: Date,
 default: null
 },
 
 emailVerificationToken: {
 type: String,
 default: null
 },
 
 emailVerificationExpires: {
 type: Date,
 default: null
 },
 
 // Financial Information (linked to wallet)
 walletId: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'Wallet',
 default: null
 }
}, {
 timestamps: true, // Adds createdAt and updatedAt
 toJSON: { 
 virtuals: true,
 transform: function(doc, ret) {
 delete ret.password;
 delete ret.refreshTokens;
 delete ret.passwordResetToken;
 delete ret.emailVerificationToken;
 return ret;
 }
 },
 toObject: { virtuals: true }
});

// Indexes for better query performance
// Note: email already has unique index, phoneNumber should be unique too
userSchema.index({ phoneNumber: 1 });
userSchema.index({ role: 1 });
userSchema.index({ location: '2dsphere' }); // Geospatial index for location-based queries
userSchema.index({ 'skills.name': 1 });
userSchema.index({ isActive: 1, isVerified: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
 return `${this.firstName} ${this.lastName}`;
});

// Virtual for age calculation
userSchema.virtual('age').get(function() {
 if (!this.dateOfBirth) return null;
 return Math.floor((Date.now() - this.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
 // Only hash the password if it has been modified (or is new)
 if (!this.isModified('password')) return next();
 
 try {
 // Hash password with cost of 10 (faster, still secure)
 const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
 this.password = await bcrypt.hash(this.password, saltRounds);
 next();
 } catch (error) {
 next(error);
 }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
 try {
 return await bcrypt.compare(candidatePassword, this.password);
 } catch (error) {
 throw new Error('Password comparison failed');
 }
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
 const crypto = require('crypto');
 const resetToken = crypto.randomBytes(32).toString('hex');
 
 this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
 this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
 
 return resetToken;
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
 const crypto = require('crypto');
 const verificationToken = crypto.randomBytes(32).toString('hex');
 
 this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
 this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
 
 return verificationToken;
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
 this.lastLogin = new Date();
 return this.save({ validateBeforeSave: false });
};

// Method to add refresh token
userSchema.methods.addRefreshToken = function(token, expiresIn = '7d') {
 const expiresAt = new Date();
 const days = parseInt(expiresIn.replace('d', ''));
 expiresAt.setDate(expiresAt.getDate() + days);
 
 this.refreshTokens.push({
 token,
 expiresAt
 });
 
 // Keep only the latest 5 refresh tokens
 if (this.refreshTokens.length > 5) {
 this.refreshTokens = this.refreshTokens.slice(-5);
 }
 
 return this.save({ validateBeforeSave: false });
};

// Method to remove refresh token
userSchema.methods.removeRefreshToken = function(token) {
 this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
 return this.save({ validateBeforeSave: false });
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
 return this.findOne({ email: email.toLowerCase() });
};

// Static method to find technicians by skill and location
userSchema.statics.findTechniciansBySkillAndLocation = function(skillName, longitude, latitude, maxDistance = 10000) {
 return this.find({
 role: 'technician',
 isActive: true,
 isVerified: true,
 'availability.isAvailable': true,
 'skills.name': { $regex: new RegExp(skillName, 'i') },
 location: {
 $near: {
 $geometry: { type: 'Point', coordinates: [longitude, latitude] },
 $maxDistance: maxDistance // in meters
 }
 }
 });
};

// Add pagination plugin
userSchema.plugin(mongoosePaginate);

// Export the model
module.exports = mongoose.model('User', userSchema);
