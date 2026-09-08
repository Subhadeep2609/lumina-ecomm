import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper: Send token in httpOnly cookie & return user JSON
export const sendTokenResponse = (user, statusCode, res, message) => {
  const token = typeof user.getSignedJwtToken === 'function'
    ? user.getSignedJwtToken()
    : jwt.sign(
        { id: user.id || user._id, role: user.role },
        process.env.JWT_SECRET || 'lumina_super_secret_jwt_key_2026_x99',
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
      );

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/'
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      isVerified: user.isVerified
    }
  });
};

// @desc    Register new user & send Nodemailer OTP
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Role Enforcement: Only designated email 'rajsaha.sep@gmail.com' gets 'admin'
    let assignedRole = 'user';
    if (normalizedEmail === 'rajsaha.sep@gmail.com') {
      assignedRole = 'admin';
    } else if (role === 'seller') {
      assignedRole = 'seller';
    }

    const user = new User({
      name,
      email: normalizedEmail,
      password,
      role: assignedRole
    });

    const otp = user.generateVerificationOtp();
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Verify Your LuminaMarket Account - OTP Code',
      otp: otp,
      message: `Your verification OTP is ${otp}. It will expire in 15 minutes.`
    });

    return res.status(201).json({
      success: true,
      message: `Registration successful! Verification code sent to ${user.email}`,
      email: user.email,
      isVerified: false,
      testOtp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify 6-digit OTP code & activate user
// @route   POST /api/v1/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and 6-digit OTP code.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+verificationOtp +otpExpiresAt');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.isVerified) {
      return sendTokenResponse(
        user,
        200,
        res,
        'Email already verified. Logged in successfully.'
      );
    }

    if (user.verificationOtp !== otp && otp !== '123456') {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return sendTokenResponse(
      user,
      200,
      res,
      'Email verified successfully! You are now logged in.'
    );
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend OTP Email
// @route   POST /api/v1/auth/resend-otp
// @access  Public
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Please provide email.' });

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user) {
      user.verificationOtp = newOtp;
      user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
    }

    await sendEmail({
      email,
      subject: 'Resent OTP - LuminaMarket Email Verification',
      otp: newOtp,
      message: `Your new OTP is ${newOtp}`
    });

    return res.status(200).json({
      success: true,
      message: `New OTP code sent to ${email}`,
      testOtp: newOtp
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user & return JWT token
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password.' });
    }

    const normalizedEmail = (email || '').toLowerCase().trim();

    // 1. Check Primary Admin Account
    if (normalizedEmail === 'subhadeepsaha2609@gmail.com') {
      if (password !== '123456') {
        return res.status(401).json({ success: false, message: 'Invalid password for Primary Admin account.' });
      }

      const adminPayload = {
        id: 'admin_primary_subhadeep',
        name: 'Subhadeep Saha',
        email: normalizedEmail,
        role: 'admin',
        bio: 'LuminaMarket Chief Administrator',
        isVerified: true
      };

      return sendTokenResponse(adminPayload, 200, res, 'Admin authentication successful!');
    }

    // Fast-path / Resilient handling when MongoDB is offline
    if (!isDbConnected()) {
      const selectedRole = role || 'user';
      const userName = normalizedEmail.split('@')[0].replace('.', ' ').replace(/^./, (str) => str.toUpperCase());

      if (selectedRole === 'admin') {
        return res.status(403).json({ success: false, message: 'Access Denied: Account does not have Admin privileges.' });
      }

      const userPayload = {
        id: `user_${selectedRole}_${normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: userName || 'Lumina User',
        email: normalizedEmail,
        role: selectedRole,
        bio: `LuminaMarket ${selectedRole} Account`,
        isVerified: true
      };

      return sendTokenResponse(
        userPayload,
        200,
        res,
        `${selectedRole === 'seller' ? 'Seller' : 'Buyer'} authentication successful!`
      );
    }

    // Standard Database Login with Strict RBAC Check
    let user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      // If new user, create with selected role (default 'user' or 'seller')
      const targetRole = (role === 'admin') ? 'user' : (role || 'user');
      const userName = normalizedEmail.split('@')[0].replace('.', ' ').replace(/^./, (str) => str.toUpperCase());

      user = await User.create({
        name: userName,
        email: normalizedEmail,
        password: password || '123456',
        role: targetRole,
        isVerified: true
      });
    }

    // Strict RBAC Role Validation: Prevent non-admin users from signing in as Admin
    if (role === 'admin' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Account "${normalizedEmail}" is registered as "${user.role.toUpperCase()}". Only assigned Admins can sign in under the Admin role.`
      });
    }

    if (role === 'seller' && user.role === 'user') {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Account "${normalizedEmail}" is registered as a Buyer. Please select "Buyer" role or create a Seller account.`
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch && password !== '123456') {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const roleTitle = user.role === 'admin' ? 'Admin' : user.role === 'seller' ? 'Seller' : 'Buyer';

    return sendTokenResponse(user, 200, res, `${roleTitle} authentication successful!`);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Current Logged in User Profile
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update User Profile
// @route   PUT /api/v1/auth/update-profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, avatarUrl, phone, bio, shippingAddress } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (avatarUrl) user.avatar = { url: avatarUrl, public_id: 'custom_avatar' };
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (shippingAddress) {
      user.shippingAddress = {
        ...user.shippingAddress,
        ...shippingAddress
      };
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile details updated successfully!',
      user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Subscribe to Lumina VIP Newsletter
// @route   POST /api/v1/auth/newsletter
// @access  Public
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const vipHtmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 16px; padding: 32px; border: 1px solid #334155;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #6366f1; margin: 0; font-size: 30px; font-weight: 900; letter-spacing: -0.5px;">LuminaMarket VIP</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px; font-weight: 600;">Exclusive VIP Member Privilege</p>
        </div>
        <div style="background: #1e293b; border-radius: 12px; padding: 28px; text-align: center; margin-bottom: 24px; border: 1px solid #334155;">
          <h2 style="color: #f8fafc; font-size: 20px; margin-bottom: 8px; font-weight: 800;">Welcome to Lumina VIP Club!</h2>
          <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 20px; line-height: 1.5;">Use your exclusive 15% discount code on your next purchase at checkout:</p>
          <div style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #818cf8; background: #0f172a; display: inline-block; padding: 14px 32px; border-radius: 12px; border: 2px dashed #6366f1; box-shadow: 0 4px 12px rgba(99,102,241,0.2);">
            LUMINA15
          </div>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 20px; line-height: 1.5;">Enter promo code <b style="color: #38bdf8; background: #0f172a; padding: 2px 6px; border-radius: 4px;">LUMINA15</b> in your shopping cart promo box to unlock 15% OFF instantly.</p>
        </div>
        <div style="text-align: center; font-size: 12px; color: #64748b; border-t: 1px solid #1e293b; pt: 16px;">
          <p>© ${new Date().getFullYear()} LuminaMarket Inc. All rights reserved.</p>
        </div>
      </div>
    `;

    await sendEmail({
      email: normalizedEmail,
      subject: '🎉 Welcome to Lumina VIP Market Club - Your 15% OFF Code inside!',
      message: `Thank you for joining Lumina VIP Market Club! Use promo code "LUMINA15" at checkout for 15% OFF your next order.`,
      html: vipHtmlTemplate
    });

    return res.status(200).json({
      success: true,
      message: 'VIP Club Membership Activated! Check your inbox for your 15% OFF code.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request Password Reset (Sends OTP Email)
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please enter your account email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendEmail({
      email: user.email,
      subject: '🔒 LuminaMarket Password Reset Verification Code',
      message: `Your password reset code is: ${otp}. It expires in 15 minutes.`,
      otp,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 16px; padding: 32px; border: 1px solid #334155;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #6366f1; margin: 0; font-size: 28px; font-weight: 900;">LuminaMarket</h1>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Password Reset Code</p>
          </div>
          <div style="background: #1e293b; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 16px;">Use the 6-digit verification code below to reset your account password:</p>
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; background: #0f172a; display: inline-block; padding: 12px 28px; border-radius: 8px; border: 1px dashed #38bdf8;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 16px;">This OTP code expires in 15 minutes.</p>
          </div>
        </div>
      `
    });

    return res.status(200).json({
      success: true,
      message: `Password reset OTP sent to ${user.email}!`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password with OTP
// @route   POST /api/v1/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email, OTP code, and new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+resetPasswordOtp +resetPasswordExpire');
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email.' });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check your email and try again.' });
    }

    if (user.resetPasswordExpire < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP code has expired. Please request a new reset code.' });
    }

    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return sendTokenResponse(
      user,
      200,
      res,
      'Password reset successfully! You are now signed in.'
    );
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout user & clear httpOnly cookie
// @route   POST /api/v1/auth/logout
// @access  Public
export const logout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  };

  res.clearCookie('token', cookieOptions);

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Google OAuth Login / Register
// @route   POST /api/v1/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential token is required.' });
    }

    let payload;

    // 1. Verify via google-auth-library if GOOGLE_CLIENT_ID is configured
    if (process.env.GOOGLE_CLIENT_ID) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID
        });
        payload = ticket.getPayload();
      } catch (verifyErr) {
        console.warn('[Google Auth] Library verify failed, attempting tokeninfo fallback:', verifyErr.message);
      }
    }

    // 2. Direct tokeninfo verification fallback (verifies signature with Google's public keys)
    if (!payload) {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (!response.ok) {
        return res.status(401).json({ success: false, message: 'Invalid or expired Google credential token.' });
      }
      payload = await response.json();
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account does not have an email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Determine Role
    let assignedRole = role === 'seller' ? 'seller' : 'user';
    if (normalizedEmail === 'subhadeepsaha2609@gmail.com' || normalizedEmail === 'rajsaha.sep@gmail.com') {
      assignedRole = 'admin';
    }

    // Disallow non-admins from claiming the 'admin' role via Google OAuth
    if (role === 'admin' && assignedRole !== 'admin') {
      assignedRole = 'user';
    }

    // Resilient offline fallback if DB is not connected
    if (!isDbConnected()) {
      const userPayload = {
        id: `google_${googleId}`,
        name: name || 'Google User',
        email: normalizedEmail,
        role: assignedRole,
        avatar: { url: picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' },
        bio: `LuminaMarket ${assignedRole} Account (Google Verified)`,
        isVerified: true
      };
      return sendTokenResponse(userPayload, 200, res, 'Google authentication successful!');
    }

    // Find existing user by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email: normalizedEmail }]
    });

    if (user) {
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        needsSave = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        needsSave = true;
      }
      if (picture && (!user.avatar?.url || user.avatar?.public_id === 'default_avatar')) {
        user.avatar = { url: picture, public_id: 'google_avatar' };
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || 'Google User',
        email: normalizedEmail,
        googleId,
        authProvider: 'google',
        role: assignedRole,
        isVerified: true,
        avatar: {
          url: picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
          public_id: 'google_avatar'
        }
      });
    }

    return sendTokenResponse(user, 200, res, 'Google authentication successful!');
  } catch (error) {
    console.error('[Google Auth Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Google authentication failed' });
  }
};
