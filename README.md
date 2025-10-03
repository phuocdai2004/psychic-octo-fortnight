# 🏥 MedClinic - Medication Management System

A simple Express.js web application for managing medications with user authentication and CRUD operations.

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

Create a `.env` file with the following variables:

```env
MONGO_URI=your-mongodb-connection-string
PORT=3000
SESSION_SECRET=your-secret-key-change-this
NODE_ENV=development
```

## Docker Deployment

### Build Docker Image

```bash
docker build -t medication-app .
```

### Run Docker Container

```bash
docker run -p 3000:3000 --env-file .env medication-app
```

## CI/CD with GitHub Actions

This project includes automated CI/CD pipelines using GitHub Actions.

### Quick Setup

1. **Add GitHub Secrets** (Repository Settings → Secrets → Actions):
   - `MONGO_URI` - Your MongoDB connection string
   - `SESSION_SECRET` - Random secure string for sessions
   - `RENDER_API_KEY` - From Render Account Settings
   - `RENDER_SERVICE_ID` - From your Render service URL

2. **Push to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

3. **Automatic Deployment**:
   - Every push to `main` triggers: Test → Build → Deploy
   - Pull requests run tests only (no deployment)
   - Monitor progress in GitHub Actions tab

📖 **Detailed CI/CD Setup**: See [`.github/GITHUB_ACTIONS_SETUP.md`](.github/GITHUB_ACTIONS_SETUP.md)

## Deploying to Render

### Method 1: Using Render Dashboard

1. **Create a new Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"

2. **Connect your repository**
   - Connect your GitHub/GitLab repository
   - Or use "Deploy from Git URL"

3. **Configure the service**
   - **Name**: medication-management
   - **Environment**: Docker
   - **Region**: Choose closest to you
   - **Branch**: main (or your default branch)
   - **Root Directory**: Leave empty (unless your code is in a subdirectory)

4. **Add Environment Variables**
   Go to "Environment" tab and add:
   ```
   MONGO_URI=mongodb+srv://midclonic:phuocdai2004@midclinic.iqgne7s.mongodb.net/medclinic?retryWrites=true&w=majority
   SESSION_SECRET=your-strong-random-secret-key-here
   NODE_ENV=production
   PORT=3000
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your Docker container

### Method 2: Using render.yaml (Infrastructure as Code)

Create a `render.yaml` file in your project root:

```yaml
services:
  - type: web
    name: medication-app
    env: docker
    plan: free
    region: oregon
    envVars:
      - key: MONGO_URI
        sync: false
      - key: SESSION_SECRET
        generateValue: true
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
```

Then deploy via Render Blueprint.

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
