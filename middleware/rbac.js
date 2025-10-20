const User = require('../models/User');
const { ROLES, PERMISSIONS, hasPermission, canManageUser, hasHigherOrEqualRole } = require('../constants/roles');

/**
 * Middleware to require specific role(s)
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 */
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized. Please login.'
        });
      }

      // Get user with role
      const user = await User.findById(req.session.userId).select('role isActive');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found.'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact admin.'
        });
      }

      // Convert single role to array
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Check if user has required role
      if (!hasPermission(user.role, rolesArray)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
          required: rolesArray,
          current: user.role
        });
      }

      // Attach user role to request
      req.userRole = user.role;
      req.user = user;
      
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

/**
 * Middleware to check if user is admin or higher
 */
const isAdmin = () => {
  return requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
};

/**
 * Middleware to check if user is manager or higher
 */
const isManager = () => {
  return requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]);
};

/**
 * Middleware to check if user is doctor or higher
 */
const isDoctor = () => {
  return requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.DOCTOR]);
};

/**
 * Middleware to check if user is staff or higher
 */
const isStaff = () => {
  return requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.DOCTOR, ROLES.STAFF]);
};

/**
 * Middleware to check custom permission
 * @param {string[]} allowedRoles - Array of allowed roles for this permission
 */
const checkPermission = (allowedRoles) => {
  return requireRole(allowedRoles);
};

/**
 * Middleware to check if user can manage another user
 * Usage: Put target user ID in req.params or req.body
 */
const canManageUserMiddleware = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Get current user
    const currentUser = await User.findById(req.session.userId).select('role');
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get target user ID from params or body
    const targetUserId = req.params.id || req.params.userId || req.body.userId;
    
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Target user ID is required'
      });
    }

    // Get target user
    const targetUser = await User.findById(targetUserId).select('role');
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    // Check if current user can manage target user
    if (!canManageUser(currentUser.role, targetUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot manage this user. Insufficient permissions.',
        yourRole: currentUser.role,
        targetRole: targetUser.role
      });
    }

    // Attach to request
    req.currentUser = currentUser;
    req.targetUser = targetUser;
    
    next();
  } catch (error) {
    console.error('Can manage user check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking permissions'
    });
  }
};

/**
 * Middleware to check if user owns the resource or has higher role
 * @param {Function} getResourceOwnerId - Function to get owner ID from request
 */
const isOwnerOrHigher = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const user = await User.findById(req.session.userId).select('role');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get resource owner ID
      const ownerId = await getResourceOwnerId(req);

      // Check if user is owner
      const isOwner = ownerId && ownerId.toString() === req.session.userId;

      // Check if user has high-level role (can access all)
      const hasHighRole = hasPermission(user.role, [
        ROLES.SUPER_ADMIN,
        ROLES.ADMIN,
        ROLES.MANAGER
      ]);

      if (!isOwner && !hasHighRole) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }

      req.user = user;
      req.isOwner = isOwner;
      
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

/**
 * Attach user role to all requests (for views)
 */
const attachUserRole = async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).select('role username email');
      if (user) {
        req.userRole = user.role;
        req.userInfo = {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        };
        // Make available in views
        res.locals.userRole = user.role;
        res.locals.userInfo = req.userInfo;
      }
    } catch (error) {
      console.error('Error attaching user role:', error);
    }
  }
  next();
};

module.exports = {
  // Middleware functions
  requireRole,
  isAdmin,
  isManager,
  isDoctor,
  isStaff,
  checkPermission,
  canManageUserMiddleware,
  isOwnerOrHigher,
  attachUserRole,
  
  // Constants (re-export from roles.js)
  ROLES,
  PERMISSIONS
};
