const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define what a User looks like in the database
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before saving to database
userSchema.pre('save', async function(next) {
  // Only hash the password if it's new or changed
  if (!this.isModified('password')) return next();
  
  // Hash the password with bcrypt
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to check if password is correct
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);