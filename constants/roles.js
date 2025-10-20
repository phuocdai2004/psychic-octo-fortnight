// Role-Based Access Control (RBAC) Constants

/**
 * User Roles in the system
 * Hierarchy: SUPER_ADMIN > ADMIN > MANAGER > DOCTOR > STAFF > PATIENT
 */
const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',  // Toàn quyền, không thể xóa/sửa
  ADMIN: 'ADMIN',              // Quản trị viên hệ thống
  MANAGER: 'MANAGER',          // Quản lý phòng ban
  DOCTOR: 'DOCTOR',            // Nhân viên y tế
  STAFF: 'STAFF',              // Nhân viên hỗ trợ
  PATIENT: 'PATIENT'           // Người dùng cuối
};

/**
 * Role hierarchy (for inheritance)
 * Higher number = more privileges
 */
const ROLE_HIERARCHY = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  MANAGER: 60,
  DOCTOR: 40,
  STAFF: 20,
  PATIENT: 10
};

/**
 * Permissions by feature/module
 */
const PERMISSIONS = {
  // User Management
  USER: {
    VIEW_ALL: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
    VIEW_OWN: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR', 'STAFF', 'PATIENT'],
    CREATE: ['SUPER_ADMIN', 'ADMIN'],
    UPDATE_ANY: ['SUPER_ADMIN', 'ADMIN'],
    UPDATE_OWN: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR', 'STAFF', 'PATIENT'],
    DELETE: ['SUPER_ADMIN', 'ADMIN'],
    ASSIGN_ROLE: ['SUPER_ADMIN', 'ADMIN'],
    DEACTIVATE: ['SUPER_ADMIN', 'ADMIN']
  },

  // Medical Records
  MEDICAL_RECORD: {
    VIEW_ALL: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR'],
    VIEW_OWN: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR', 'PATIENT'],
    CREATE: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR'],
    UPDATE: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR'],
    DELETE: ['SUPER_ADMIN', 'ADMIN'],
    EXPORT: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR']
  },

  // Appointments
  APPOINTMENT: {
    VIEW_ALL: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR', 'STAFF'],
    VIEW_OWN: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR', 'STAFF', 'PATIENT'],
    CREATE: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR', 'STAFF', 'PATIENT'],
    UPDATE_ANY: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR', 'STAFF'],
    UPDATE_OWN: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR', 'STAFF', 'PATIENT'],
    CANCEL: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR', 'STAFF', 'PATIENT'],
    CONFIRM: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'STAFF']
  },

  // Medications
  MEDICATION: {
    VIEW_ALL: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR', 'STAFF'],
    VIEW_OWN: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR', 'STAFF', 'PATIENT'],
    CREATE: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR', 'STAFF', 'PATIENT'],
    UPDATE_ANY: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR'],
    UPDATE_OWN: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR', 'STAFF', 'PATIENT'],
    DELETE_ANY: ['SUPER_ADMIN', 'ADMIN'],
    DELETE_OWN: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR', 'STAFF', 'PATIENT'],
    PRESCRIBE: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR']
  },

  // Payments
  PAYMENT: {
    VIEW_ALL: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
    VIEW_OWN: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR', 'STAFF', 'PATIENT'],
    CREATE: ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'PATIENT'],
    REFUND: ['SUPER_ADMIN', 'ADMIN'],
    EXPORT: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
  },

  // Reports & Analytics
  REPORT: {
    VIEW_SYSTEM: ['SUPER_ADMIN', 'ADMIN'],
    VIEW_DEPARTMENT: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
    VIEW_OWN: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR'],
    EXPORT: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
  },

  // System Settings
  SYSTEM: {
    MANAGE_SETTINGS: ['SUPER_ADMIN'],
    VIEW_LOGS: ['SUPER_ADMIN', 'ADMIN'],
    BACKUP: ['SUPER_ADMIN'],
    RESTORE: ['SUPER_ADMIN']
  }
};

/**
 * Role descriptions (Vietnamese)
 */
const ROLE_DESCRIPTIONS = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    nameVi: 'Quản trị tối cao',
    description: 'Toàn quyền hệ thống, không thể xóa hoặc sửa',
    canBeDeleted: false,
    canBeModified: false
  },
  ADMIN: {
    name: 'Administrator',
    nameVi: 'Quản trị viên',
    description: 'Quản trị viên hệ thống',
    canBeDeleted: true,
    canBeModified: true
  },
  MANAGER: {
    name: 'Manager',
    nameVi: 'Quản lý',
    description: 'Quản lý phòng ban',
    canBeDeleted: true,
    canBeModified: true
  },
  DOCTOR: {
    name: 'Doctor',
    nameVi: 'Bác sĩ',
    description: 'Nhân viên y tế',
    canBeDeleted: true,
    canBeModified: true
  },
  STAFF: {
    name: 'Staff',
    nameVi: 'Nhân viên',
    description: 'Nhân viên hỗ trợ',
    canBeDeleted: true,
    canBeModified: true
  },
  PATIENT: {
    name: 'Patient',
    nameVi: 'Bệnh nhân',
    description: 'Người dùng cuối',
    canBeDeleted: true,
    canBeModified: true
  }
};

/**
 * Check if a role has permission
 * @param {string} userRole - User's role
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {boolean}
 */
const hasPermission = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

/**
 * Check if role1 has higher or equal privilege than role2
 * @param {string} role1 
 * @param {string} role2 
 * @returns {boolean}
 */
const hasHigherOrEqualRole = (role1, role2) => {
  return ROLE_HIERARCHY[role1] >= ROLE_HIERARCHY[role2];
};

/**
 * Check if role1 has higher privilege than role2
 * @param {string} role1 
 * @param {string} role2 
 * @returns {boolean}
 */
const hasHigherRole = (role1, role2) => {
  return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
};

/**
 * Get all roles below a certain role
 * @param {string} role 
 * @returns {string[]}
 */
const getRolesBelow = (role) => {
  const roleLevel = ROLE_HIERARCHY[role];
  return Object.keys(ROLE_HIERARCHY).filter(
    r => ROLE_HIERARCHY[r] < roleLevel
  );
};

/**
 * Check if user can manage (edit/delete) another user based on roles
 * @param {string} managerRole - Role of the user trying to manage
 * @param {string} targetRole - Role of the user being managed
 * @returns {boolean}
 */
const canManageUser = (managerRole, targetRole) => {
  // SUPER_ADMIN cannot be managed by anyone
  if (targetRole === ROLES.SUPER_ADMIN) {
    return false;
  }
  
  // Only users with higher role can manage
  return hasHigherRole(managerRole, targetRole);
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  ROLE_DESCRIPTIONS,
  hasPermission,
  hasHigherOrEqualRole,
  hasHigherRole,
  getRolesBelow,
  canManageUser
};
