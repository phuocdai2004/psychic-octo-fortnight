const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Medication = require('../models/Medication');
const { isAuthenticated } = require('../middleware/auth');
const { requireRole, PERMISSIONS, isOwnerOrHigher } = require('../middleware/rbac');
const { generateOTP, getOTPExpiry, verifyOTP } = require('../services/otpService');
const { sendOTPEmail, sendPasswordResetConfirmation } = require('../services/emailService');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ============================================
// AUTH ROUTES
// ============================================

// Register
router.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    // Log the user in
    req.session.userId = user._id;
    req.session.username = user.username;

    res.json({
      message: 'Registration successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Create session
    req.session.userId = user._id;
    req.session.username = user.username;

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address,
        avatar: user.avatar,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// Logout
router.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      address: user.address,
      avatar: user.avatar,
      role: user.role,
      isActive: user.isActive
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// PASSWORD RESET ROUTES
// ============================================

// Request OTP
router.post('/password/forgot', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = otpExpiry;
    await user.save();

    // Send OTP via email
    const emailResult = await sendOTPEmail(user.email, otp, user.username);

    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send email. Please try again.' });
    }

    req.session.resetEmail = user.email;
    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Verify OTP
router.post('/password/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otpVerification = verifyOTP(otp, user.resetPasswordOTP, user.resetPasswordExpires);

    if (!otpVerification.valid) {
      return res.status(400).json({ message: otpVerification.message });
    }

    req.session.resetEmail = email;
    req.session.resetOTPVerified = true;

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Reset password
router.post('/password/reset', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = password;
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    await user.save();

    await sendPasswordResetConfirmation(user.email, user.username);

    delete req.session.resetEmail;
    delete req.session.resetOTPVerified;

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// ============================================
// MEDICATION ROUTES
// ============================================

// Get all medications
router.get('/medications', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const userRole = user.role;
    
    let medications;
    // Doctors, staff, and admins can see all medications
    if (['DOCTOR', 'STAFF', 'ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(userRole)) {
      medications = await Medication.find().populate('userId', 'username email').sort({ createdAt: -1 });
    } else {
      // Patients only see their own
      medications = await Medication.find({ userId: req.session.userId }).sort({ createdAt: -1 });
    }
    
    res.json(medications);
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ message: 'Error fetching medications' });
  }
});

// Get single medication
router.get('/medications/:id', isAuthenticated, async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id).populate('userId', 'username email');
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    res.json(medication);
  } catch (error) {
    console.error('Error fetching medication:', error);
    res.status(500).json({ message: 'Error fetching medication' });
  }
});

// Create medication
router.post('/medications', isAuthenticated, requireRole(PERMISSIONS.MEDICATION.PRESCRIBE), async (req, res) => {
  try {
    const { name, dosage, description, quantity, manufacturer, expiryDate } = req.body;

    if (!name || !dosage || !quantity) {
      return res.status(400).json({ message: 'Name, dosage, and quantity are required' });
    }

    const medication = new Medication({
      name,
      dosage,
      description,
      quantity,
      manufacturer,
      expiryDate: expiryDate || null,
      userId: req.session.userId
    });

    await medication.save();
    res.status(201).json(medication);
  } catch (error) {
    console.error('Error creating medication:', error);
    res.status(500).json({ message: 'Error creating medication' });
  }
});

// Update medication
router.put('/medications/:id', isAuthenticated, async (req, res) => {
  try {
    const { name, dosage, description, quantity, manufacturer, expiryDate } = req.body;

    if (!name || !dosage || !quantity) {
      return res.status(400).json({ message: 'Name, dosage, and quantity are required' });
    }

    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.userId },
      {
        name,
        dosage,
        description,
        quantity,
        manufacturer,
        expiryDate: expiryDate || null,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    res.json(medication);
  } catch (error) {
    console.error('Error updating medication:', error);
    res.status(500).json({ message: 'Error updating medication' });
  }
});

// Delete medication
router.delete('/medications/:id', isAuthenticated, async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    const user = await User.findById(req.session.userId);
    const isOwner = medication.userId.toString() === req.session.userId.toString();
    const isAdminOrHigher = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user.role);

    if (!isOwner && !isAdminOrHigher) {
      return res.status(403).json({ message: 'Not authorized to delete this medication' });
    }

    await Medication.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).json({ message: 'Error deleting medication' });
  }
});

// ============================================
// PROFILE ROUTES
// ============================================

// Get profile
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update profile
router.put('/profile', isAuthenticated, async (req, res) => {
  try {
    const { fullName, phone, dateOfBirth, gender, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.session.userId,
      {
        fullName,
        phone,
        dateOfBirth,
        gender,
        address,
        updatedAt: Date.now()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Upload avatar
router.post('/profile/avatar', isAuthenticated, async (req, res) => {
  try {
    const { avatar } = req.body; // Base64 image data

    if (!avatar) {
      return res.status(400).json({ message: 'No image provided' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(avatar, {
      folder: 'avatars',
      transformation: [
        { width: 300, height: 300, crop: 'fill' }
      ]
    });

    // Update user avatar
    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');

    res.json({ avatar: user.avatar });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
});

// Delete avatar
router.delete('/profile/avatar', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { avatar: null },
      { new: true }
    ).select('-password');

    res.json({ message: 'Avatar deleted successfully' });
  } catch (error) {
    console.error('Error deleting avatar:', error);
    res.status(500).json({ message: 'Error deleting avatar' });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Get admin dashboard stats
router.get('/admin/dashboard', isAuthenticated, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      roleDistribution
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ message: 'Error fetching dashboard' });
  }
});

// Get all users
router.get('/admin/users', isAuthenticated, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get single user
router.get('/admin/users/:id', isAuthenticated, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Update user role
router.put('/admin/users/:id/role', isAuthenticated, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Error updating user role' });
  }
});

// Toggle user status
router.put('/admin/users/:id/status', isAuthenticated, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, user });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ message: 'Error toggling user status' });
  }
});

// Update user
router.put('/admin/users/:id', isAuthenticated, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req, res) => {
  try {
    const { fullName, email, phone, role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, email, phone, role, isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user
router.delete('/admin/users/:id', isAuthenticated, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

module.exports = router;
