const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin, canManageUserMiddleware, requireRole } = require('../middleware/rbac');
const { ROLES, ROLE_DESCRIPTIONS, canManageUser } = require('../constants/roles');

// All admin routes require authentication + admin role
router.use(isAuthenticated);
router.use(isAdmin());

// Admin Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    
    // Count by role
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      roleStats: roleStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    };
    
    res.render('admin/dashboard', {
      stats,
      currentUser: req.currentUser
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).send('Error loading admin dashboard');
  }
});

// User Management - List all users
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const searchQuery = req.query.search || '';
    const roleFilter = req.query.role || '';
    const statusFilter = req.query.status || '';
    
    // Build query
    const query = {};
    
    if (searchQuery) {
      query.$or = [
        { username: new RegExp(searchQuery, 'i') },
        { email: new RegExp(searchQuery, 'i') },
        { fullName: new RegExp(searchQuery, 'i') }
      ];
    }
    
    if (roleFilter) {
      query.role = roleFilter;
    }
    
    if (statusFilter === 'active') {
      query.isActive = true;
    } else if (statusFilter === 'inactive') {
      query.isActive = false;
    }
    
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.render('admin/users', {
      users,
      currentUser: req.currentUser,
      currentPage: page,
      totalPages,
      searchQuery,
      roleFilter,
      statusFilter,
      roles: ROLES,
      roleDescriptions: ROLE_DESCRIPTIONS
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).send('Error loading users list');
  }
});

// View single user details
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).send('User not found');
    }
    
    res.render('admin/user-detail', {
      user,
      currentUser: req.currentUser,
      roles: ROLES,
      roleDescriptions: ROLE_DESCRIPTIONS,
      canManage: canManageUser(req.currentUser.role, user.role)
    });
  } catch (error) {
    console.error('User detail error:', error);
    res.status(500).send('Error loading user details');
  }
});

// Update user role
router.post('/users/:id/role', canManageUserMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    const targetUser = req.targetUser;
    
    // Validate role
    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }
    
    // Check if admin can assign this role
    if (!canManageUser(req.currentUser.role, role)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot assign this role'
      });
    }
    
    targetUser.role = role;
    await targetUser.save();
    
    res.json({
      success: true,
      message: 'Role updated successfully'
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating role'
    });
  }
});

// Activate/Deactivate user
router.post('/users/:id/toggle-status', canManageUserMiddleware, async (req, res) => {
  try {
    const targetUser = req.targetUser;
    
    targetUser.isActive = !targetUser.isActive;
    await targetUser.save();
    
    res.json({
      success: true,
      message: `User ${targetUser.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: targetUser.isActive
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
});

// Delete user (soft delete - deactivate)
router.post('/users/:id/delete', canManageUserMiddleware, async (req, res) => {
  try {
    const targetUser = req.targetUser;
    
    // Cannot delete SUPER_ADMIN
    if (targetUser.role === ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete SUPER_ADMIN'
      });
    }
    
    targetUser.isActive = false;
    await targetUser.save();
    
    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
});

// Hard delete user (permanent deletion - only for SUPER_ADMIN)
router.post('/users/:id/hard-delete', requireRole(ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Cannot delete SUPER_ADMIN
    if (targetUser.role === ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete SUPER_ADMIN'
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'User permanently deleted'
    });
  } catch (error) {
    console.error('Hard delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
});

// Update user profile (admin can update any user)
router.post('/users/:id/update', canManageUserMiddleware, async (req, res) => {
  try {
    const { fullName, phone, email, dateOfBirth, gender, address } = req.body;
    const targetUser = req.targetUser;
    
    // Validation
    if (email) {
      // Check if email already exists for another user
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: targetUser._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      
      targetUser.email = email;
    }
    
    if (phone && !/^[0-9]{10,11}$/.test(phone.replace(/[\s-]/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number (10-11 digits)'
      });
    }
    
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      
      if (dob > today || age > 150) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date of birth'
        });
      }
      
      targetUser.dateOfBirth = dateOfBirth;
    }
    
    if (fullName) targetUser.fullName = fullName;
    if (phone) targetUser.phone = phone;
    if (gender) targetUser.gender = gender;
    if (address) targetUser.address = address;
    
    await targetUser.save();
    
    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
});

module.exports = router;
