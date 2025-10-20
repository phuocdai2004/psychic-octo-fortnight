# 🏥 Medication Management System

A full-stack medical management application with **React frontend** and **Node.js backend**, featuring role-based access control (RBAC), medication management, user profiles, and admin dashboard.

![Tech Stack](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

---

## ✨ Features

### 🔐 Authentication & Authorization
- User registration and login
- Session-based authentication with secure cookies
- 6-tier role-based access control (RBAC)
- Password reset with OTP email verification

### 💊 Medication Management
- Create, read, update, delete medications
- Role-based permissions (Doctor+ can prescribe)
- View all medications or personal medications by role
- Track dosage, quantity, manufacturer, expiry dates

### 👤 User Profile
- View and edit profile information
- Avatar upload to Cloudinary
- Manage personal details (phone, DOB, address, gender)

### 👨‍💼 Admin Dashboard
- User statistics and analytics
- Role distribution visualization
- User management (view, edit, activate/deactivate)
- Change user roles
- View all system users

### 📧 Email Services
- OTP verification for password reset
- Password reset confirmation emails
- Gmail integration with app passwords

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│   React Frontend (Port 3000/80)         │
│   - Material-UI components              │
│   - React Router                        │
│   - Axios API client                    │
│   - Context-based state management      │
└──────────────┬──────────────────────────┘
               │ /api/* requests
               ▼
┌─────────────────────────────────────────┐
│   Node.js Backend (Port 5000)           │
│   - Express.js REST API                 │
│   - RBAC middleware                     │
│   - Session management                  │
│   - File uploads (Cloudinary)           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   MongoDB Atlas (Cloud)                 │
│   - User collection                     │
│   - Medication collection               │
│   - Session store                       │
└─────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### **Option 1: Docker (Recommended)**

```powershell
# 1. Clone the repository
git clone <your-repo-url>
cd devops

# 2. Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# 3. Build and run with Docker
docker-compose up --build

# 4. Access the application
# Frontend: http://localhost
# Backend: http://localhost:5000
```

📖 **See [DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md) for detailed Docker instructions**

---

### **Option 2: Local Development**

#### **Prerequisites**
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Gmail account with app password

#### **Setup Backend**

```powershell
# 1. Install backend dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# 3. Start backend server
npm start
# Backend runs on http://localhost:5000
```

#### **Setup Frontend**

```powershell
# 1. Navigate to frontend folder
cd frontend

# 2. Install frontend dependencies
npm install

# 3. Start React development server
npm start
# Frontend runs on http://localhost:3000
```

📖 **See [REACT_SETUP.md](REACT_SETUP.md) for detailed React setup**

---

## 📂 Project Structure

```
d:\devops\
├── backend/
│   ├── config/
│   │   └── database.js              # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js                  # Authentication middleware
│   │   └── rbac.js                  # Role-based access control
│   ├── models/
│   │   ├── User.js                  # User schema (6 roles)
│   │   └── Medication.js            # Medication schema
│   ├── routes/
│   │   └── api.js                   # All REST API endpoints
│   ├── services/
│   │   ├── emailService.js          # Email/OTP functions
│   │   └── otpService.js            # OTP generation/verification
│   ├── scripts/
│   │   ├── migrate-roles.js         # Migrate user roles
│   │   └── create-superadmin.js     # Create super admin
│   ├── server.js                    # Express server
│   ├── Dockerfile                   # Backend Docker image
│   └── package.json                 # Backend dependencies
│
├── frontend/
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js            # Main layout (AppBar + Drawer)
│   │   │   └── ProtectedRoute.js    # Route protection
│   │   ├── contexts/
│   │   │   └── AuthContext.js       # Global auth state
│   │   ├── pages/
│   │   │   ├── Login.js             # Login page
│   │   │   ├── Register.js          # Registration page
│   │   │   ├── Dashboard.js         # Main dashboard
│   │   │   ├── Profile.js           # User profile
│   │   │   ├── Medications/
│   │   │   │   └── MedicationsList.js  # Medications CRUD
│   │   │   └── Admin/
│   │   │       ├── AdminDashboard.js   # Admin stats
│   │   │       └── AdminUsers.js       # User management
│   │   ├── services/
│   │   │   ├── api.js               # Axios configuration
│   │   │   └── index.js             # API service functions
│   │   └── App.js                   # Root component
│   ├── Dockerfile                   # Frontend Docker image
│   ├── nginx.conf                   # Nginx configuration
│   └── package.json                 # Frontend dependencies
│
├── docker-compose.yml               # Multi-container orchestration
├── .env                             # Environment variables
└── .env.example                     # Environment template
```

---

## 🎭 User Roles & Permissions

| Role | Permissions |
|------|------------|
| **SUPER_ADMIN** | Full system access, delete users |
| **ADMIN** | Manage users, view all data |
| **MANAGER** | View all medications, manage resources |
| **DOCTOR** | Prescribe medications, view all |
| **STAFF** | View all medications, limited access |
| **PATIENT** | View own medications only |

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/me` - Get current user

### Password Reset
- `POST /api/password/forgot` - Request OTP
- `POST /api/password/verify-otp` - Verify OTP
- `POST /api/password/reset` - Reset password

### Medications
- `GET /api/medications` - Get all medications
- `GET /api/medications/:id` - Get single medication
- `POST /api/medications` - Create medication
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/avatar` - Upload avatar
- `DELETE /api/profile/avatar` - Delete avatar

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get single user
- `PUT /api/admin/users/:id/role` - Update user role
- `PUT /api/admin/users/:id/status` - Toggle user status
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

📖 **See [REACT_SETUP.md](REACT_SETUP.md) for complete API documentation**

---

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/database

# Server
PORT=5000
SESSION_SECRET=your-secret-key-here
NODE_ENV=development

# CORS (for production)
CORS_ORIGIN=http://localhost

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🧪 Testing

### **Register Test Account**
```
1. Open http://localhost:3000
2. Click "Register"
3. Fill in details:
   - Username: testuser
   - Email: test@example.com
   - Password: Test123!
4. Click "Register"
```

### **Test Admin Features**
```powershell
# Create super admin account
npm run create-admin
```

---

## 📦 Docker Deployment

### **Build Images**
```powershell
docker-compose build
```

### **Start Services**
```powershell
docker-compose up -d
```

### **View Logs**
```powershell
docker-compose logs -f
```

### **Stop Services**
```powershell
docker-compose down
```

📖 **See [DOCKER_GUIDE.md](DOCKER_GUIDE.md) for complete Docker documentation**

---

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.0 - UI library
- **Material-UI** 7.3.4 - Component library
- **React Router** 7.9.4 - Routing
- **Axios** 1.12.2 - HTTP client
- **Emotion** - CSS-in-JS

### Backend
- **Node.js** 18 - Runtime
- **Express** 4.18.2 - Web framework
- **MongoDB** 8.0.0 - Database
- **Mongoose** - ODM
- **Express Session** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - File storage
- **Nodemailer** - Email service

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Web server (production)

---

## 📚 Documentation

- [REACT_SETUP.md](REACT_SETUP.md) - React frontend setup and architecture
- [DOCKER_GUIDE.md](DOCKER_GUIDE.md) - Complete Docker deployment guide
- [DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md) - Quick Docker commands
- [RBAC_GUIDE.md](RBAC_GUIDE.md) - Role-based access control documentation
- [FORGOT_PASSWORD_SETUP.md](docs/FORGOT_PASSWORD_SETUP.md) - Password reset flow

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgments

- Material-UI for the amazing component library
- MongoDB Atlas for cloud database
- Cloudinary for file storage
- Docker for containerization

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation files
- Review logs: `docker-compose logs -f`

---

**Built with ❤️ using React, Node.js, and MongoDB**
