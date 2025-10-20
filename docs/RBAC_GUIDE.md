# 🔐 HỆ THỐNG PHÂN QUYỀN (RBAC) - MEDCLINIC

## 📋 TỔNG QUAN

Hệ thống phân quyền dựa trên vai trò (Role-Based Access Control) với 6 cấp độ:

| Role | Tên tiếng Việt | Mô tả | Có thể xóa/sửa |
|------|----------------|-------|----------------|
| **SUPER_ADMIN** | Quản trị tối cao | Toàn quyền hệ thống | ❌ KHÔNG |
| **ADMIN** | Quản trị viên | Quản trị viên hệ thống | ✅ CÓ |
| **MANAGER** | Quản lý | Quản lý phòng ban | ✅ CÓ |
| **DOCTOR** | Bác sĩ | Nhân viên y tế | ✅ CÓ |
| **STAFF** | Nhân viên | Nhân viên hỗ trợ | ✅ CÓ |
| **PATIENT** | Bệnh nhân | Người dùng cuối | ✅ CÓ |

---

## 🎯 PHÂN CẤP QUYỀN

```
SUPER_ADMIN (100) ← Cao nhất
    ↓
ADMIN (80)
    ↓
MANAGER (60)
    ↓
DOCTOR (40)
    ↓
STAFF (20)
    ↓
PATIENT (10) ← Thấp nhất
```

**Nguyên tắc:** Role cao hơn có thể quản lý role thấp hơn.

---

## 📁 CẤU TRÚC FILES

```
constants/
  └── roles.js              # Định nghĩa roles, permissions
middleware/
  └── rbac.js               # RBAC middleware
models/
  └── User.js               # User model với role field
```

---

## 🔧 CÁC MIDDLEWARE SẴN CÓ

### 1. `requireRole(allowedRoles)`
Yêu cầu user phải có 1 trong các role được phép.

```javascript
// Cho phép nhiều roles
router.get('/admin', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  res.send('Admin area');
});

// Cho phép 1 role
router.get('/doctor', requireRole('DOCTOR'), (req, res) => {
  res.send('Doctor area');
});
```

### 2. `isAdmin()`
Chỉ cho phép SUPER_ADMIN và ADMIN.

```javascript
const { isAdmin } = require('./middleware/rbac');

router.get('/admin/dashboard', isAuthenticated, isAdmin(), (req, res) => {
  res.render('admin/dashboard');
});
```

### 3. `isManager()`
Cho phép SUPER_ADMIN, ADMIN, MANAGER.

```javascript
router.get('/reports', isAuthenticated, isManager(), (req, res) => {
  res.render('reports');
});
```

### 4. `isDoctor()`
Cho phép SUPER_ADMIN, ADMIN, MANAGER, DOCTOR.

```javascript
router.post('/prescriptions', isAuthenticated, isDoctor(), (req, res) => {
  // Create prescription
});
```

### 5. `isStaff()`
Cho phép tất cả trừ PATIENT.

```javascript
router.get('/appointments/all', isAuthenticated, isStaff(), (req, res) => {
  // View all appointments
});
```

### 6. `checkPermission(allowedRoles)`
Tương tự `requireRole`, nhưng tên rõ ràng hơn.

```javascript
const { PERMISSIONS } = require('./constants/roles');

router.delete('/users/:id', 
  isAuthenticated, 
  checkPermission(PERMISSIONS.USER.DELETE),
  (req, res) => {
    // Delete user
  }
);
```

### 7. `canManageUserMiddleware`
Kiểm tra xem user hiện tại có thể quản lý user khác không.

```javascript
router.put('/users/:id/role', 
  isAuthenticated,
  canManageUserMiddleware,
  (req, res) => {
    // req.currentUser - user đang thực hiện action
    // req.targetUser - user bị tác động
    
    // Update role
  }
);
```

### 8. `isOwnerOrHigher(getResourceOwnerId)`
Kiểm tra user có phải owner của resource hoặc có role cao hơn.

```javascript
const { isOwnerOrHigher } = require('./middleware/rbac');
const Medication = require('./models/Medication');

router.delete('/medications/:id',
  isAuthenticated,
  isOwnerOrHigher(async (req) => {
    const med = await Medication.findById(req.params.id);
    return med?.userId; // Return owner ID
  }),
  (req, res) => {
    // Delete medication
  }
);
```

### 9. `attachUserRole`
Attach role info vào mọi request (dùng cho views).

```javascript
// server.js
app.use(attachUserRole);

// Trong EJS views:
<% if (userRole === 'ADMIN') { %>
  <a href="/admin">Admin Panel</a>
<% } %>
```

---

## 🎯 PERMISSIONS THEO MODULE

### User Management
```javascript
const { PERMISSIONS } = require('./constants/roles');

// Xem tất cả users
PERMISSIONS.USER.VIEW_ALL
// ['SUPER_ADMIN', 'ADMIN', 'MANAGER']

// Tạo user mới
PERMISSIONS.USER.CREATE
// ['SUPER_ADMIN', 'ADMIN']

// Assign role
PERMISSIONS.USER.ASSIGN_ROLE
// ['SUPER_ADMIN', 'ADMIN']
```

### Medical Records
```javascript
// Xem tất cả hồ sơ
PERMISSIONS.MEDICAL_RECORD.VIEW_ALL
// ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR']

// Tạo hồ sơ mới
PERMISSIONS.MEDICAL_RECORD.CREATE
// ['SUPER_ADMIN', 'ADMIN', 'DOCTOR']
```

### Appointments
```javascript
// Xem tất cả lịch hẹn
PERMISSIONS.APPOINTMENT.VIEW_ALL
// ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DOCTOR', 'STAFF']

// Confirm appointment
PERMISSIONS.APPOINTMENT.CONFIRM
// ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'STAFF']
```

### Medications
```javascript
// Prescribe (kê đơn)
PERMISSIONS.MEDICATION.PRESCRIBE
// ['SUPER_ADMIN', 'ADMIN', 'DOCTOR']

// Delete any medication
PERMISSIONS.MEDICATION.DELETE_ANY
// ['SUPER_ADMIN', 'ADMIN']
```

---

## 💻 VÍ DỤ SỬ DỤNG

### 1. Protect một route đơn giản

```javascript
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('./middleware/auth');
const { isAdmin } = require('./middleware/rbac');

// Chỉ admin mới vào được
router.get('/admin/settings', isAuthenticated, isAdmin(), (req, res) => {
  res.render('admin/settings');
});
```

### 2. Cho phép nhiều roles

```javascript
const { requireRole, ROLES } = require('./middleware/rbac');

// Doctor hoặc Staff
router.get('/patients', 
  isAuthenticated,
  requireRole([ROLES.DOCTOR, ROLES.STAFF]),
  async (req, res) => {
    // Get patients list
  }
);
```

### 3. Check ownership

```javascript
const { isOwnerOrHigher } = require('./middleware/rbac');
const Appointment = require('./models/Appointment');

router.put('/appointments/:id',
  isAuthenticated,
  isOwnerOrHigher(async (req) => {
    const appointment = await Appointment.findById(req.params.id);
    return appointment?.patientId;
  }),
  async (req, res) => {
    // Update appointment
    // req.isOwner sẽ là true nếu user là owner
  }
);
```

### 4. Trong views (EJS)

```html
<!-- Check role in view -->
<% if (locals.userRole === 'ADMIN' || locals.userRole === 'SUPER_ADMIN') { %>
  <a href="/admin">Admin Panel</a>
<% } %>

<% if (locals.userRole === 'DOCTOR') { %>
  <a href="/prescriptions">Kê đơn thuốc</a>
<% } %>

<!-- User info -->
<p>Welcome, <%= locals.userInfo?.username %></p>
<p>Role: <%= locals.userInfo?.role %></p>
```

---

## 🛠️ HELPER FUNCTIONS

### 1. Check permission in code

```javascript
const { hasPermission } = require('./constants/roles');

const userRole = req.userRole;
const allowedRoles = ['ADMIN', 'DOCTOR'];

if (hasPermission(userRole, allowedRoles)) {
  // User has permission
}
```

### 2. Check role hierarchy

```javascript
const { hasHigherRole, hasHigherOrEqualRole } = require('./constants/roles');

// Check if ADMIN > DOCTOR
hasHigherRole('ADMIN', 'DOCTOR'); // true

// Check if ADMIN >= ADMIN
hasHigherOrEqualRole('ADMIN', 'ADMIN'); // true
```

### 3. Check if can manage user

```javascript
const { canManageUser } = require('./constants/roles');

// ADMIN can manage DOCTOR?
canManageUser('ADMIN', 'DOCTOR'); // true

// DOCTOR can manage ADMIN?
canManageUser('DOCTOR', 'ADMIN'); // false

// Anyone can manage SUPER_ADMIN?
canManageUser('ADMIN', 'SUPER_ADMIN'); // false
```

---

## 🎨 INTEGRATE VÀO APP

### 1. Update server.js

```javascript
const { attachUserRole } = require('./middleware/rbac');

// Attach user role to all requests
app.use(attachUserRole);

// Routes with RBAC
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);
```

### 2. Create admin routes

```javascript
// routes/admin.js
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');

// All routes require authentication + admin role
router.use(isAuthenticated);
router.use(isAdmin());

router.get('/dashboard', (req, res) => {
  res.render('admin/dashboard');
});

router.get('/users', async (req, res) => {
  const users = await User.find();
  res.render('admin/users', { users });
});

module.exports = router;
```

### 3. Update existing routes

```javascript
// routes/medications.js
const { isOwnerOrHigher } = require('../middleware/rbac');

// Only owner or admin+ can delete
router.delete('/:id',
  isAuthenticated,
  isOwnerOrHigher(async (req) => {
    const med = await Medication.findById(req.params.id);
    return med?.userId;
  }),
  async (req, res) => {
    // Delete logic
  }
);
```

---

## 🔒 BẢO MẬT

### 1. SUPER_ADMIN không thể bị xóa/sửa

```javascript
const { ROLE_DESCRIPTIONS } = require('./constants/roles');

if (targetUser.role === 'SUPER_ADMIN') {
  const roleInfo = ROLE_DESCRIPTIONS.SUPER_ADMIN;
  if (!roleInfo.canBeDeleted) {
    return res.status(403).json({
      message: 'SUPER_ADMIN cannot be deleted'
    });
  }
}
```

### 2. User chỉ quản lý được role thấp hơn

```javascript
const { canManageUser } = require('./constants/roles');

if (!canManageUser(currentUser.role, targetUser.role)) {
  return res.status(403).json({
    message: 'Cannot manage user with equal or higher role'
  });
}
```

### 3. Deactivate user thay vì xóa

```javascript
// User model có field isActive
const user = await User.findById(userId);
user.isActive = false;
await user.save();
```

---

## 📊 MIGRATION DATA

Nếu đã có users trong DB, cần migrate để thêm role:

```javascript
// Script: migrate-roles.js
const mongoose = require('mongoose');
const User = require('./models/User');

async function migrateRoles() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Set all existing users to PATIENT
  await User.updateMany(
    { role: { $exists: false } },
    { $set: { role: 'PATIENT', isActive: true } }
  );
  
  console.log('Migration complete');
  process.exit(0);
}

migrateRoles();
```

Run:
```bash
node migrate-roles.js
```

---

## 🧪 TESTING

### Test roles:

```javascript
// Create test users
const superAdmin = await User.create({
  username: 'superadmin',
  email: 'super@example.com',
  password: 'password',
  role: 'SUPER_ADMIN'
});

const admin = await User.create({
  username: 'admin',
  email: 'admin@example.com',
  password: 'password',
  role: 'ADMIN'
});

const doctor = await User.create({
  username: 'doctor',
  email: 'doctor@example.com',
  password: 'password',
  role: 'DOCTOR'
});

const patient = await User.create({
  username: 'patient',
  email: 'patient@example.com',
  password: 'password',
  role: 'PATIENT'
});
```

---

## ❓ FAQ

### Q: Làm sao tạo SUPER_ADMIN đầu tiên?

A: Tạo trực tiếp trong database hoặc qua script:

```javascript
const User = require('./models/User');

async function createSuperAdmin() {
  const exists = await User.findOne({ role: 'SUPER_ADMIN' });
  
  if (!exists) {
    await User.create({
      username: 'superadmin',
      email: 'super@medclinic.com',
      password: 'change-this-password',
      fullName: 'Super Administrator',
      role: 'SUPER_ADMIN',
      isActive: true
    });
    
    console.log('✅ SUPER_ADMIN created');
  }
}

createSuperAdmin();
```

### Q: User có thể tự chọn role khi đăng ký không?

A: **KHÔNG NÊN**. Mặc định nên là PATIENT, admin assign role sau.

```javascript
// routes/auth.js - Register
const user = new User({
  username,
  email,
  password,
  role: 'PATIENT' // Always default to PATIENT
});
```

### Q: Làm sao assign role cho user?

A: Tạo admin route:

```javascript
// routes/admin.js
router.put('/users/:id/role',
  isAuthenticated,
  isAdmin(),
  canManageUserMiddleware,
  async (req, res) => {
    const { role } = req.body;
    const targetUser = req.targetUser;
    
    targetUser.role = role;
    await targetUser.save();
    
    res.json({ success: true });
  }
);
```

---

## 📝 NEXT STEPS

1. ✅ Tạo admin dashboard UI
2. ✅ Tạo user management page
3. ✅ Apply RBAC vào các routes hiện có
4. ✅ Tạo doctor dashboard
5. ✅ Tạo manager dashboard
6. ✅ Testing toàn bộ hệ thống

---

## 📧 Support

Need help? phuocdainguyen2412@gmail.com

---

**🎉 Hệ thống RBAC đã sẵn sàng sử dụng!**
