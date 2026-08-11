# Production Deployment Guide

This guide explains how to deploy the RexiChip application to a production environment using Firebase Hosting and Cloud Functions.

## Prerequisites

- Firebase CLI installed globally: `npm install -g firebase-tools`
- Firebase project created (same one you use for development)
- Production environment variables configured

## Deployment Methods

### Option 1: Firebase Hosting + Cloud Functions (Recommended)

This deploys your entire app (frontend + backend) to Firebase.

#### Step 1: Login to Firebase
```bash
firebase login
```

#### Step 2: Initialize Firebase (if not already done)
```bash
firebase init
```
Select:
- ✅ Functions
- ✅ Hosting

#### Step 3: Configure Production Environment Variables

Firebase Functions use environment config instead of `.env` files:

```bash
# Set all your production environment variables
firebase functions:config:set \
  firebase.api_key="YOUR_PROD_API_KEY" \
  firebase.auth_domain="your-prod-project.firebaseapp.com" \
  firebase.database_url="https://your-prod-project.firebaseio.com" \
  firebase.project_id="your-prod-project" \
  firebase.storage_bucket="your-prod-project.appspot.com" \
  firebase.messaging_sender_id="YOUR_SENDER_ID" \
  firebase.app_id="YOUR_APP_ID" \
  app.port="3000" \
  app.allowed_origins="https://your-domain.com" \
  cache.ttl_ms="30000" \
  cache.shows_ttl_ms="60000"

# View your config
firebase functions:config:get
```

#### Step 4: Update `index.js` for Firebase Functions

Your `index.js` should export the Express app for Firebase:

```javascript
const functions = require("firebase-functions");
const app = require("./src/server");

exports.app = functions.https.onRequest(app);
```

#### Step 5: Deploy to Production

```bash
# Deploy everything (hosting + functions)
firebase deploy

# Or deploy separately:
firebase deploy --only hosting
firebase deploy --only functions
```

#### Step 6: Access Your Production App

After deployment, Firebase will provide URLs:
- **Hosting URL**: `https://your-project.web.app` or `https://your-domain.com` (if custom domain)
- **Functions URL**: `https://us-central1-your-project.cloudfunctions.net/app`

---

### Option 2: Traditional Server Deployment (VPS/Cloud Server)

Deploy to a VPS (e.g., DigitalOcean, AWS EC2, Azure VM).

#### Step 1: Prepare Production Environment

1. **Set up a Linux server** (Ubuntu recommended)
2. **Install Node.js** (v18 or higher)
3. **Install PM2** for process management:
   ```bash
   npm install -g pm2
   ```

#### Step 2: Transfer Your Code

```bash
# On your local machine
git push origin main

# On your server
git clone <your-repo-url>
cd "node js"
npm install --production
```

#### Step 3: Configure Production Environment

Create a `.env` file on the server with production values:

```bash
nano .env
```

```env
NODE_ENV=production
PORT=3000
FIREBASE_API_KEY=your-prod-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
FIREBASE_PROJECT_ID=your-project
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
ALLOWED_ORIGINS=https://yourdomain.com
FIREBASE_SERVICE_ACCOUNT_PATH=src/firebase/key.json
LOG_LEVEL=warn
```

#### Step 4: Upload Service Account Key

Upload your Firebase service account JSON file to `src/firebase/key.json` on the server.

#### Step 5: Start with PM2

```bash
# Start the application
pm2 start src/app.js --name rexichip

# Save PM2 config
pm2 save

# Set PM2 to start on server reboot
pm2 startup
```

#### Step 6: Set Up Nginx as Reverse Proxy

Install Nginx:
```bash
sudo apt update
sudo apt install nginx
```

Configure Nginx (`/etc/nginx/sites-available/rexichip`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/rexichip /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 7: Set Up SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Production Checklist

### Security
- [ ] All environment variables set correctly
- [ ] Firebase service account key secured (not in git)
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled (already configured)
- [ ] Helmet middleware enabled (already configured)
- [ ] SSL/HTTPS enabled

### Performance
- [ ] Set `NODE_ENV=production`
- [ ] Configure cache TTLs appropriately
- [ ] Set `LOG_LEVEL=warn` or `error` (not `debug`)
- [ ] Tesseract language files accessible

### Monitoring
- [ ] Set up error logging (consider services like Sentry)
- [ ] Monitor Firebase usage
- [ ] Set up uptime monitoring (Uptime Robot, Pingdom)

### Deployment
- [ ] Test all features in production
- [ ] Verify OCR works with production Tesseract config
- [ ] Check Firebase Realtime Database rules
- [ ] Verify file uploads work

## Updating Production

### Firebase Method
```bash
firebase deploy
```

### VPS Method
```bash
# On server
cd "node js"
git pull origin main
npm install --production
pm2 restart rexichip
```

## Rollback

### Firebase
```bash
firebase hosting:clone SOURCE_SITE_ID:VERSION_ID DESTINATION_SITE_ID
```

### VPS
```bash
git checkout <previous-commit>
pm2 restart rexichip
```

## Environment Differences

| Feature | Development | Production |
|---------|-------------|------------|
| Server | `nodemon` (auto-restart) | `node` or PM2 |
| Port | 3000 (configurable) | 80/443 (via proxy) |
| Logging | `debug` | `warn` or `error` |
| CORS | `localhost:3000,3001` | Your domain only |
| SSL | Not required | Required (HTTPS) |
| Error Details | Verbose | Minimal (security) |

## Troubleshooting Production

### Logs (Firebase)
```bash
firebase functions:log
```

### Logs (PM2)
```bash
pm2 logs rexichip
pm2 logs rexichip --lines 100
```

### Common Issues

1. **"Module not found" errors**: Run `npm install --production`
2. **OCR not working**: Ensure `eng.traineddata`, `heb.traineddata`, `osd.traineddata` are deployed
3. **Firebase permission errors**: Check service account key and Firebase rules
4. **CORS errors**: Update `ALLOWED_ORIGINS` in production config
