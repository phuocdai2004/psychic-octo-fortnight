const nodemailer = require('nodemailer');

// Cấu hình email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Email của bạn
    pass: process.env.EMAIL_PASS  // App Password của Gmail
  }
});

// Gửi OTP qua email
const sendOTPEmail = async (email, otp, username) => {
  const mailOptions = {
    from: `"MedClinic" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Mã OTP Khôi Phục Mật Khẩu - MedClinic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #667eea; text-align: center;">🏥 MedClinic</h2>
        <h3 style="color: #333;">Xin chào ${username},</h3>
        <p>Bạn đã yêu cầu khôi phục mật khẩu. Đây là mã OTP của bạn:</p>
        <div style="background: #f0f0f0; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666;">Mã OTP này có hiệu lực trong <strong>10 phút</strong>.</p>
        <p style="color: #999; font-size: 12px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="text-align: center; color: #999; font-size: 12px;">© 2025 MedClinic. All rights reserved.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Gửi email xác nhận reset password thành công
const sendPasswordResetConfirmation = async (email, username) => {
  const mailOptions = {
    from: `"MedClinic" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Mật Khẩu Đã Được Thay Đổi - MedClinic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #667eea; text-align: center;">🏥 MedClinic</h2>
        <h3 style="color: #333;">Xin chào ${username},</h3>
        <p>Mật khẩu của bạn đã được thay đổi thành công.</p>
        <p style="color: #666;">Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với chúng tôi ngay lập tức.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL || 'http://localhost:3000'}/login" 
             style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Đăng Nhập Ngay
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="text-align: center; color: #999; font-size: 12px;">© 2025 MedClinic. All rights reserved.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetConfirmation
};
