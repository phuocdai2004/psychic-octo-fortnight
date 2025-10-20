const crypto = require('crypto');

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Tính thời gian hết hạn OTP (10 phút)
const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

// Kiểm tra OTP có hết hạn chưa
const isOTPExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};

// Verify OTP
const verifyOTP = (inputOTP, storedOTP, expiryDate) => {
  if (!storedOTP || !expiryDate) {
    return { valid: false, message: 'OTP không tồn tại' };
  }

  if (isOTPExpired(expiryDate)) {
    return { valid: false, message: 'OTP đã hết hạn' };
  }

  if (inputOTP !== storedOTP) {
    return { valid: false, message: 'OTP không đúng' };
  }

  return { valid: true, message: 'OTP hợp lệ' };
};

module.exports = {
  generateOTP,
  getOTPExpiry,
  isOTPExpired,
  verifyOTP
};
