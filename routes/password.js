const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateOTP, getOTPExpiry, verifyOTP } = require('../services/otpService');
const { sendOTPEmail, sendPasswordResetConfirmation } = require('../services/emailService');

// Show forgot password page
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { error: null, success: null });
});

// Request OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.render('forgot-password', { 
        error: 'Vui lòng nhập email', 
        success: null 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.render('forgot-password', { 
        error: 'Email không tồn tại trong hệ thống', 
        success: null 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // Save OTP to database
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = otpExpiry;
    await user.save();

    // Send OTP via email
    const emailResult = await sendOTPEmail(user.email, otp, user.username);

    if (!emailResult.success) {
      return res.render('forgot-password', { 
        error: 'Không thể gửi email. Vui lòng thử lại sau.', 
        success: null 
      });
    }

    // Redirect to verify OTP page
    req.session.resetEmail = user.email;
    res.redirect('/verify-otp');

  } catch (error) {
    console.error('Forgot password error:', error);
    res.render('forgot-password', { 
      error: 'Có lỗi xảy ra. Vui lòng thử lại.', 
      success: null 
    });
  }
});

// Show verify OTP page
router.get('/verify-otp', (req, res) => {
  if (!req.session.resetEmail) {
    return res.redirect('/forgot-password');
  }
  res.render('verify-otp', { error: null, email: req.session.resetEmail });
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.session.resetEmail;

    if (!email) {
      return res.redirect('/forgot-password');
    }

    if (!otp) {
      return res.render('verify-otp', { 
        error: 'Vui lòng nhập mã OTP', 
        email 
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.redirect('/forgot-password');
    }

    // Verify OTP
    const otpVerification = verifyOTP(otp, user.resetPasswordOTP, user.resetPasswordExpires);

    if (!otpVerification.valid) {
      return res.render('verify-otp', { 
        error: otpVerification.message, 
        email 
      });
    }

    // OTP valid, redirect to reset password page
    req.session.resetOTPVerified = true;
    res.redirect('/reset-password');

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.render('verify-otp', { 
      error: 'Có lỗi xảy ra. Vui lòng thử lại.', 
      email: req.session.resetEmail 
    });
  }
});

// Show reset password page
router.get('/reset-password', (req, res) => {
  if (!req.session.resetOTPVerified || !req.session.resetEmail) {
    return res.redirect('/forgot-password');
  }
  res.render('reset-password', { error: null, email: req.session.resetEmail });
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const email = req.session.resetEmail;

    if (!req.session.resetOTPVerified || !email) {
      return res.redirect('/forgot-password');
    }

    // Validation
    if (!password || !confirmPassword) {
      return res.render('reset-password', { 
        error: 'Vui lòng nhập đầy đủ thông tin', 
        email 
      });
    }

    if (password !== confirmPassword) {
      return res.render('reset-password', { 
        error: 'Mật khẩu không khớp', 
        email 
      });
    }

    if (password.length < 6) {
      return res.render('reset-password', { 
        error: 'Mật khẩu phải có ít nhất 6 ký tự', 
        email 
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.redirect('/forgot-password');
    }

    // Update password
    user.password = password;
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Send confirmation email
    await sendPasswordResetConfirmation(user.email, user.username);

    // Clear session
    delete req.session.resetEmail;
    delete req.session.resetOTPVerified;

    // Redirect to login with success message
    req.session.successMessage = 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.';
    res.redirect('/login');

  } catch (error) {
    console.error('Reset password error:', error);
    res.render('reset-password', { 
      error: 'Có lỗi xảy ra. Vui lòng thử lại.', 
      email: req.session.resetEmail 
    });
  }
});

module.exports = router;
