const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Show profile page
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login');
    }

    res.render('profile', {
      user: user,
      error: null,
      success: null
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).send('Error loading profile');
  }
});

// Update profile information
router.post('/profile/update', isAuthenticated, async (req, res) => {
  try {
    const { fullName, phone, dateOfBirth, gender, address } = req.body;
    
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login');
    }

    // Validation
    if (phone && !/^[0-9]{10,11}$/.test(phone.replace(/[\s-]/g, ''))) {
      return res.render('profile', {
        user: user,
        error: 'Số điện thoại không hợp lệ (10-11 số)',
        success: null
      });
    }

    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      
      if (dob > today) {
        return res.render('profile', {
          user: user,
          error: 'Ngày sinh không thể ở tương lai',
          success: null
        });
      }
      
      if (age > 150) {
        return res.render('profile', {
          user: user,
          error: 'Ngày sinh không hợp lệ',
          success: null
        });
      }
    }

    // Update user fields
    user.fullName = fullName || '';
    user.phone = phone || '';
    user.dateOfBirth = dateOfBirth || null;
    user.gender = gender || '';
    user.address = address || '';
    
    await user.save();

    // Reload user to show updated data
    const updatedUser = await User.findById(req.session.userId);

    res.render('profile', {
      user: updatedUser,
      error: null,
      success: 'Cập nhật thông tin thành công!'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    const user = await User.findById(req.session.userId);
    res.render('profile', {
      user: user,
      error: 'Có lỗi xảy ra khi cập nhật thông tin',
      success: null
    });
  }
});

// Upload avatar
router.post('/profile/avatar', isAuthenticated, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      const user = await User.findById(req.session.userId);
      return res.render('profile', {
        user: user,
        error: 'Vui lòng chọn ảnh để upload',
        success: null
      });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login');
    }

    // Convert buffer to base64 for Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const uploadResult = await uploadImage(dataURI, 'medclinic/avatars');

    if (!uploadResult.success) {
      return res.render('profile', {
        user: user,
        error: 'Không thể upload ảnh. Vui lòng thử lại.',
        success: null
      });
    }

    // Delete old avatar if exists
    if (user.avatarPublicId) {
      await deleteImage(user.avatarPublicId);
    }

    // Update user avatar
    user.avatar = uploadResult.url;
    user.avatarPublicId = uploadResult.publicId;
    await user.save();

    // Reload user to show updated avatar
    const updatedUser = await User.findById(req.session.userId);

    res.render('profile', {
      user: updatedUser,
      error: null,
      success: 'Cập nhật ảnh đại diện thành công!'
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    const user = await User.findById(req.session.userId);
    res.render('profile', {
      user: user,
      error: error.message || 'Có lỗi xảy ra khi upload ảnh',
      success: null
    });
  }
});

// Delete avatar
router.post('/profile/avatar/delete', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login');
    }

    // Delete from Cloudinary if exists
    if (user.avatarPublicId) {
      await deleteImage(user.avatarPublicId);
    }

    // Remove avatar from user
    user.avatar = '';
    user.avatarPublicId = '';
    await user.save();

    // Reload user
    const updatedUser = await User.findById(req.session.userId);

    res.render('profile', {
      user: updatedUser,
      error: null,
      success: 'Đã xóa ảnh đại diện'
    });
  } catch (error) {
    console.error('Delete avatar error:', error);
    const user = await User.findById(req.session.userId);
    res.render('profile', {
      user: user,
      error: 'Có lỗi xảy ra khi xóa ảnh',
      success: null
    });
  }
});

module.exports = router;
