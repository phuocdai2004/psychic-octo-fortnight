# 🏥 MedClinic - Medication Management System

A simple Express.js web application for managing medications with user authentication and CRUD operations.

## 🚀 Quick Deploy to Render

1. **Fork/Clone this repo**
2. **Go to [Render](https://dashboard.render.com/)** → New Web Service → Connect GitHub
3. **Choose Docker** environment
4. **Add environment variables** in Render:
   - `MONGO_URI` (already provided below)
   - `SESSION_SECRET` (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `NODE_ENV=production`
5. **Enable Auto-Deploy** ✅
6. **Push to GitHub** → Render deploys automatically!

📖 **See [SIMPLE_DEPLOY.md](SIMPLE_DEPLOY.md) for detailed step-by-step instructions**

## Features

- ✅ User Registration & Login (Session-based authentication)
- ✅ Secure password hashing with bcrypt
- ✅ CRUD operations for medications
- ✅ MongoDB database integration
- ✅ Responsive EJS templates
- ✅ Docker support for easy deployment
- ✅ Ready for Render.com deployment
- ✅ GitHub Actions CI/CD pipeline

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **View Engine**: EJS
- **Authentication**: Express-session with Connect-mongo
- **Containerization**: Docker

## Project Structure

```
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   ├── User.js              # User model
│   └── Medication.js        # Medication model
├── routes/
│   ├── auth.js              # Auth routes (login, register, logout)
│   └── medications.js       # Medication CRUD routes
├── views/
│   ├── login.ejs            # Login page
│   ├── register.ejs         # Registration page
│   └── medications/
│       ├── index.ejs        # List medications
│       ├── new.ejs          # Add medication form
│       └── edit.ejs         # Edit medication form
├── .env                     # Environment variables
├── .dockerignore            # Docker ignore file
├── Dockerfile               # Docker configuration
├── package.json             # Dependencies
└── server.js                # Main application file
```

## Local Development

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd devops
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - The `.env` file is already configured with your MongoDB connection
   - Update `SESSION_SECRET` for production

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Environment Variables

```env
MONGO_URI=mongodb+srv://midclonic:<hcvshcv>@midclinic.iqgne7s.mongodb.net/medclinic?retryWrites=true&w=majority
SESSION_SECRET=generate-random-string
NODE_ENV=production
PORT=3000
```

**What is SESSION_SECRET?** A random string that encrypts user login sessions (cookies). Generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Docker Deployment

### Local Testing with Docker Compose

```bash
# Create .env file first with your variables
docker-compose up
```

Visit: `http://localhost:3000`

### Build and Run Manually

```bash
docker build -t medication-app .
docker run -p 3000:3000 --env-file .env medication-app
```

## CI/CD with GitHub Actions

**Super Simple!** The workflow automatically:
- ✅ Tests your code
- 🐳 Builds Docker image
- ✅ Verifies everything works

**No secrets needed!** Just connect Render to GitHub and enable auto-deploy.

When you push to `main`:
```bash
git push origin main
```

GitHub Actions runs tests → Render auto-deploys → Done! �

## Deploying to Render

### The Simple Way (Recommended)

1. **Create a new Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the service**
   - **Environment**: Docker
   - **Branch**: main
   - **Auto-Deploy**: Yes ✅

3. **Add Environment Variables** (in Render dashboard)
   ```
   MONGO_URI=mongodb+srv://midclonic:phuocdai2004@midclinic.iqgne7s.mongodb.net/medclinic?retryWrites=true&w=majority
   SESSION_SECRET=your-random-secret-here
   NODE_ENV=production
   PORT=3000
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render builds and deploys automatically
   - Future pushes to GitHub auto-deploy! 🎉

📖 **Step-by-step guide**: See [SIMPLE_DEPLOY.md](SIMPLE_DEPLOY.md)

## MongoDB Atlas Configuration

Make sure your MongoDB Atlas cluster allows connections from Render:

1. Go to MongoDB Atlas Dashboard
2. Navigate to Network Access
3. Add IP Address: `0.0.0.0/0` (allow from anywhere)
   - Note: For better security, add Render's IP addresses specifically

## Usage

### Register a New Account
1. Navigate to the home page
2. Click "Register here"
3. Fill in username, email, and password
4. Submit the form

### Login
1. Go to the login page
2. Enter your username and password
3. Click "Login"

### Manage Medications
- **View all medications**: Automatically shown after login
- **Add new medication**: Click "+ Add Medication" button
- **Edit medication**: Click "Edit" button on any medication
- **Delete medication**: Click "Delete" button (with confirmation)

## Security Notes

- Passwords are hashed using bcrypt before storage
- Sessions are stored in MongoDB for persistence
- CSRF protection recommended for production (not included in this simple version)
- Always use HTTPS in production
- Change the `SESSION_SECRET` to a strong random value

## API Routes

### Authentication Routes
- `GET /register` - Registration page
- `POST /register` - Create new user
- `GET /login` - Login page
- `POST /login` - Authenticate user
- `GET /logout` - Logout user

### Medication Routes (Protected)
- `GET /medications` - List all medications
- `GET /medications/new` - New medication form
- `POST /medications` - Create medication
- `GET /medications/:id/edit` - Edit medication form
- `PUT /medications/:id` - Update medication
- `DELETE /medications/:id` - Delete medication

## Troubleshooting

### MongoDB Connection Issues
- Verify your MongoDB URI is correct
- Check network access settings in MongoDB Atlas
- Ensure IP whitelist includes `0.0.0.0/0` or Render's IPs

### Session Issues
- Clear browser cookies
- Check that SESSION_SECRET is set
- Verify MongoDB connection for session store

### Port Issues on Render
- Render automatically sets the PORT environment variable
- The app uses `process.env.PORT` which Render provides

## License

ISC

## Support

For issues or questions, please open an issue in the repository.

---

Made with ❤️ for medication management
