# 🖼️ Cloudinary Setup Guide

## Tạo tài khoản Cloudinary (FREE)

1. **Đăng ký tài khoản:**
   - Truy cập: https://cloudinary.com/users/register/free
   - Đăng ký với email hoặc Google

2. **Lấy API Credentials:**
   - Sau khi đăng ký, vào Dashboard: https://console.cloudinary.com/
   - Bạn sẽ thấy thông tin:
     ```
     Cloud name: your-cloud-name
     API Key: 123456789012345
     API Secret: xxxxxxxxxxxxxxxxxxxxx
     ```

3. **Cập nhật file `.env`:**
   ```bash
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxx
   ```

## Giới hạn FREE tier:

- ✅ 25 credits/tháng (~ 25,000 transformations)
- ✅ 25GB storage
- ✅ 25GB bandwidth
- ✅ Đủ cho development và small projects

## Test Cloudinary

Sau khi setup, test bằng cách:

1. Đăng nhập vào app
2. Vào Profile (`/profile`)
3. Upload ảnh đại diện
4. Check Cloudinary Dashboard → Media Library

## Troubleshooting

### Error: "Invalid cloud name"
- Check `CLOUDINARY_CLOUD_NAME` trong `.env`
- Restart server sau khi update `.env`

### Error: "Upload failed"
- Check API Key và API Secret
- Check file size (max 5MB)
- Check internet connection

### Ảnh không hiển thị
- Check URL trong database
- Check Cloudinary folder: `medclinic/avatars`

## Cấu trúc folder trên Cloudinary

```
medclinic/
  └── avatars/
      ├── user1_avatar.jpg
      ├── user2_avatar.jpg
      └── ...
```

## Xóa ảnh cũ tự động

Code đã tự động xóa ảnh cũ trên Cloudinary khi user upload ảnh mới hoặc xóa ảnh.

---

📧 Need help? Contact: phuocdainguyen2412@gmail.com
