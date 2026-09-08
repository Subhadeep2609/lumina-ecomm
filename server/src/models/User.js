import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'seller', 'admin'],
    default: 'user'
  },
  avatar: {
    url: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
    },
    public_id: {
      type: String,
      default: 'default_avatar'
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    default: '+1 (555) 019-2834'
  },
  bio: {
    type: String,
    default: 'LuminaMarket Enthusiast & Passionate Shopper'
  },
  shippingAddress: {
    street: { type: String, default: '742 Evergreen Terrace' },
    city: { type: String, default: 'Springfield' },
    state: { type: String, default: 'NY' },
    postalCode: { type: String, default: '10001' },
    country: { type: String, default: 'United States' }
  },
  verificationOtp: {
    type: String,
    select: false
  },
  otpExpiresAt: {
    type: Date,
    select: false
  },
  resetPasswordOtp: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT Token
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || 'lumina_super_secret_jwt_key_2026_x99',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Generate 6-digit OTP for email verification
UserSchema.methods.generateVerificationOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationOtp = otp;
  this.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  return otp;
};

const User = mongoose.model('User', UserSchema);
export default User;
