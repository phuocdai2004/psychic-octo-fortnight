# GitHub Actions CI/CD Setup Guide

This project uses GitHub Actions for continuous integration and deployment to Render.

## 🔧 Required GitHub Secrets

You need to configure the following secrets in your GitHub repository:

### Navigate to: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### Required Secrets:

1. **MONGO_URI**
   ```
   mongodb+srv://midclonic:phuocdai2004@midclinic.iqgne7s.mongodb.net/medclinic?retryWrites=true&w=majority
   ```
   Your MongoDB connection string

2. **SESSION_SECRET**
   ```
   Generate a strong random string, e.g., using:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Your session secret key

3. **RENDER_API_KEY**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click on your profile (top right) → Account Settings
   - Scroll to "API Keys" section
   - Create a new API key
   - Copy and save as GitHub secret

4. **RENDER_SERVICE_ID**
   - Go to your Render service dashboard
   - Look at the URL: `https://dashboard.render.com/web/srv-XXXXXXXXXXXXX`
   - The `srv-XXXXXXXXXXXXX` part is your Service ID
   - Copy and save as GitHub secret

## 📋 Workflows Included

### 1. `ci-cd.yml` - Main CI/CD Pipeline
**Triggers:** Push to main/master branch, Pull requests

**Jobs:**
- ✅ **Test**: Installs dependencies, runs security audit
- 🐳 **Build**: Builds and tests Docker image
- 🚀 **Deploy**: Triggers deployment on Render (only on main/master)

### 2. `docker-build.yml` - Docker Build and Validate
**Triggers:** Push to main/master, version tags

**Jobs:**
- 🐳 Builds Docker image with caching
- ✅ Validates Docker build succeeds
- 🏷️ Tags with commit SHA for tracking

## 🚀 How It Works

### When you push to main/master:
1. Code is checked out
2. Dependencies are installed and tested
3. Docker image is built
4. Image is tested by running a container
5. If all tests pass, deployment is triggered on Render
6. Render pulls the latest code and rebuilds

### When you create a pull request:
1. Code is checked out
2. Dependencies are installed and tested
3. Security audit is run
4. No deployment happens (safe testing)

## 📝 Setup Instructions

### Step 1: Create Render Service First
```bash
1. Go to https://dashboard.render.com/
2. Create a new Web Service
3. Choose "Docker" as environment
4. Connect your GitHub repository
5. Add environment variables (MONGO_URI, SESSION_SECRET, NODE_ENV, PORT)
6. Get your Service ID from the URL
7. Generate an API key from Account Settings
```

### Step 2: Configure GitHub Secrets
```bash
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add all required secrets listed above
```

### Step 3: Push to GitHub
```bash
git add .
git commit -m "Add GitHub Actions CI/CD"
git push origin main
```

### Step 4: Monitor Deployment
```bash
1. Go to GitHub → Actions tab
2. Watch the workflow run
3. Check Render dashboard for deployment status
```

## 🔄 Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Push to main/master                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Job 1: TEST                                                │
│  • Checkout code                                            │
│  • Setup Node.js 18                                         │
│  • Install dependencies                                     │
│  • Run security audit                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Job 2: BUILD                                               │
│  • Checkout code                                            │
│  • Setup Docker Buildx                                      │
│  • Build Docker image                                       │
│  • Test Docker container                                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Job 3: DEPLOY                                              │
│  • Trigger Render deployment via API                        │
│  • Send deployment notification                             │
└─────────────────────────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Deployment fails on Render
- Check if RENDER_API_KEY is correct
- Verify RENDER_SERVICE_ID matches your service
- Ensure Render service is set to "Docker" environment

### Docker build fails
- Check Dockerfile syntax
- Ensure all files are committed to Git
- Check .dockerignore is not excluding required files

### Tests fail
- Check if package.json has correct dependencies
- Verify MongoDB connection string is valid
- Check if all required files are present

### Cannot find secrets
- Ensure secrets are added in repository settings
- Check secret names match exactly (case-sensitive)
- Secrets are not available in pull requests from forks

## 📊 Monitoring

### View Workflow Runs
```
GitHub Repository → Actions tab → Select workflow
```

### View Deployment Logs
```
Render Dashboard → Your Service → Logs tab
```

### Check Application Health
```
Visit your Render URL after deployment completes
```

## 🔒 Security Best Practices

1. **Never commit secrets** to your repository
2. **Use environment-specific secrets** for different stages
3. **Rotate API keys** regularly
4. **Use HTTPS** in production
5. **Enable branch protection** on main/master
6. **Require PR reviews** before merging
7. **Enable security scanning** in GitHub

## 🎯 Next Steps

1. ✅ Set up all required GitHub secrets
2. ✅ Create Render service
3. ✅ Push code to GitHub
4. ✅ Monitor first deployment
5. ✅ Test the deployed application
6. 🔄 Make changes and watch auto-deployment!

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Render Documentation](https://render.com/docs)
- [Docker Documentation](https://docs.docker.com/)

---

**Pro Tip:** Enable GitHub Actions status badge in your README:
```markdown
![CI/CD](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/CD%20Pipeline/badge.svg)
```
