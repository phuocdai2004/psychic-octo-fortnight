# Hướng Dẫn Cấu Hình Email Cho Forgot Password

## ✅ Feature Đã Hoàn Thành

Chức năng **Quên Mật Khẩu & OTP** đã được tích hợp hoàn chỉnh với các tính năng:

- ✉️ Gửi mã OTP qua email (6 chữ số)
- ⏰ Mã OTP có hiệu lực 10 phút
- 🔐 Xác thực OTP an toàn
- 🔑 Đặt lại mật khẩu mới
- 📧 Email xác nhận sau khi đổi mật khẩu thành công

## 🔧 Cấu Hình Gmail App Password

### Bước 1: Tạo Gmail App Password

1. Truy cập: https://myaccount.google.com/apppasswords
2. Đăng nhập vào Gmail của bạn
3. Chọn **"Mail"** và **"Windows Computer"** (hoặc tùy chọn khác)
4. Click **"Generate"**
5. Copy **App Password** 16 ký tự (định dạng: xxxx xxxx xxxx xxxx)

### Bước 2: Cập Nhật File .env

Mở file `.env` trong thư mục gốc của project và thêm:

```bash
# Email Configuration (Gmail)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

**Thay thế:**
- `your-gmail@gmail.com` → Email Gmail của bạn
- `xxxx xxxx xxxx xxxx` → App Password vừa tạo (có thể để nguyên dấu cách hoặc bỏ hết)

### Ví dụ:

```bash
EMAIL_USER=phuocdai2004@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

## 🚀 Chạy Ứng Dụng

```bash
# Cài đặt dependencies (nếu chưa cài)
npm install

# Chạy development mode
npm run dev

# Hoặc chạy production mode
npm start
```

## 🧪 Test Forgot Password Flow

1. **Mở trình duyệt:** http://localhost:3000/login
2. **Click link:** "Forgot your password?"
3. **Nhập email** đã đăng ký trong hệ thống
4. **Click:** "Gửi Mã OTP"
5. **Kiểm tra email** → Mở email có subject "Mã OTP Đặt Lại Mật Khẩu - MedClinic"
6. **Nhập mã OTP** 6 chữ số (tự động submit khi đủ 6 số)
7. **Nhập mật khẩu mới** (tối thiểu 6 ký tự)
8. **Click:** "Đặt Lại Mật Khẩu"
9. **Login** với mật khẩu mới

## 📋 Các Routes Mới

| Route | Method | Mô Tả |
|-------|--------|-------|
| `/forgot-password` | GET | Hiển thị trang nhập email |
| `/forgot-password` | POST | Gửi mã OTP qua email |
| `/verify-otp` | GET | Hiển thị trang nhập OTP |
| `/verify-otp` | POST | Xác thực mã OTP |
| `/reset-password` | GET | Hiển thị trang đặt lại mật khẩu |
| `/reset-password` | POST | Cập nhật mật khẩu mới |

## 🛠️ Files Đã Tạo/Cập Nhật

### Services:
- ✅ `services/emailService.js` - Gửi email qua Gmail SMTP
- ✅ `services/otpService.js` - Generate & validate OTP

### Routes:
- ✅ `routes/password.js` - Xử lý forgot password flow

### Views:
- ✅ `views/forgot-password.ejs` - Trang nhập email
- ✅ `views/verify-otp.ejs` - Trang nhập OTP
- ✅ `views/reset-password.ejs` - Trang đặt lại mật khẩu

### Models:
- ✅ `models/User.js` - Thêm fields: `resetPasswordOTP`, `resetPasswordExpires`

### Updated:
- ✅ `server.js` - Mount password routes
- ✅ `views/login.ejs` - Thêm link "Forgot password"
- ✅ `package.json` - Thêm nodemailer dependency

## ⚠️ Lưu Ý Quan Trọng

1. **Gmail Security:**
   - Phải bật **2-Step Verification** trước khi tạo App Password
   - Không sử dụng mật khẩu Gmail thông thường
   - App Password chỉ hiển thị 1 lần, nên copy ngay

2. **Email Delivery:**
   - Email có thể vào **Spam/Junk** folder
   - Thời gian gửi email: 2-5 giây (tùy kết nối mạng)

3. **OTP Expiry:**
   - Mã OTP hết hạn sau **10 phút**
   - Sau khi hết hạn cần request OTP mới

4. **Session Management:**
   - Email và trạng thái xác thực được lưu trong session
   - Session sẽ bị clear sau khi reset password thành công

## 🐛 Troubleshooting

### Lỗi: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Nguyên nhân:** Sử dụng mật khẩu Gmail thay vì App Password

**Giải pháp:** Tạo Gmail App Password theo Bước 1

### Lỗi: "connect ECONNREFUSED"

**Nguyên nhân:** Không có kết nối internet hoặc Gmail SMTP bị chặn

**Giải pháp:** 
- Kiểm tra kết nối internet
- Tắt Firewall/VPN thử lại

### Email không được gửi

**Giải pháp:**
1. Kiểm tra `EMAIL_USER` và `EMAIL_PASS` trong `.env`
2. Verify email trong console log: `Email sent successfully`
3. Kiểm tra Spam folder
4. Thử gửi email test với account khác

## 📚 Next Steps (Phase 1 - Easy Features)

✅ **Completed:** Forgot Password & OTP (2 days)

**Upcoming:**
- 👤 View/Update Profile + Upload Avatar (Cloudinary) - 2 days
- 📅 Appointment Scheduling - 3 days
- 📋 Medical Records Viewing - 2 days
- 💳 Payment Integration (VNPay/Momo) - 3 days
- ⭐ Review/Rating System - 2 days

## 🎯 Success Criteria

- [x] User có thể request OTP qua email
- [x] OTP được gửi trong vòng 5 giây
- [x] OTP có thời gian hết hạn 10 phút
- [x] Mã OTP được validate chính xác
- [x] Mật khẩu mới được hash và lưu vào DB
- [x] Email xác nhận được gửi sau reset
- [x] Session được clear sau khi hoàn tất
- [x] UI responsive và user-friendly

## 📞 Support

Nếu gặp vấn đề, hãy kiểm tra:
1. Console logs trong terminal
2. Network tab trong browser DevTools
3. Email logs trong Gmail "Sent" folder

---

**Author:** MedClinic Team  
**Last Updated:** 2024  
**Version:** 1.0.0
