# Firebase Setup Guide

This guide covers setting up Firebase Authentication for the Division 2 Gear Tracker.

## Project Information

- **Project ID:** `divtrack-6a09d`
- **Auth Domain:** `divtrack-6a09d.firebaseapp.com`
- **Console:** https://console.firebase.google.com/project/divtrack-6a09d

## Frontend Setup (Already Configured)

The frontend Firebase client configuration is already set up in [frontend/src/config/firebase.js](../frontend/src/config/firebase.js).

### What's Included

```javascript
import { auth } from '@/config/firebase';

// Use auth for:
// - signInWithEmailAndPassword()
// - createUserWithEmailAndPassword()
// - signOut()
// - onAuthStateChanged()
```

The configuration includes:
- ✅ Firebase Authentication
- ✅ Analytics (optional)
- ✅ API keys (safe to expose in frontend)

**Note:** Firebase client API keys are safe to include in frontend code. They're not secret credentials.

---

## Backend Setup (Requires Service Account)

The backend needs Firebase Admin SDK to verify ID tokens sent from the frontend.

### Step 1: Download Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/project/divtrack-6a09d)
2. Click **Project Settings** (gear icon) → **Service Accounts** tab
3. Click **Generate New Private Key**
4. Save the JSON file as `divtrack-6a09d-firebase-adminsdk.json`
5. **IMPORTANT:** Store this file in a secure location **outside** your project directory or in `backend/` (it's gitignored)

### Step 2: Configure Backend Environment Variables

Copy the example file:

```bash
cd backend
cp .env.example .env
```

Choose one of two options:

#### Option A: Service Account File Path (Easier for Local Development)

Edit `backend/.env`:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=/absolute/path/to/divtrack-6a09d-firebase-adminsdk.json
```

#### Option B: Individual Environment Variables (Better for Production/iFastNet)

Open your service account JSON file and extract these values:

```json
{
  "project_id": "divtrack-6a09d",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@divtrack-6a09d.iam.gserviceaccount.com"
}
```

Add to `backend/.env`:

```env
FIREBASE_PROJECT_ID=divtrack-6a09d
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@divtrack-6a09d.iam.gserviceaccount.com
```

**Important:** The private key must include `\n` for line breaks. Keep the quotes around the entire key.

### Step 3: Database Configuration

Also in `backend/.env`, add your database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=divtrack
```

---

## Authentication Flow

### 1. User Signs In (Frontend)

```javascript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase';

const { user } = await signInWithEmailAndPassword(auth, email, password);
const idToken = await user.getIdToken();

// Send idToken to backend API
fetch('/api/me/items', {
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
});
```

### 2. Backend Verifies Token

```javascript
const { admin } = require('./config/firebase-admin');

// Middleware to verify Firebase ID token
async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.firebaseUid = decodedToken.uid;
    req.email = decodedToken.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### 3. Map Firebase UID to Local User

```javascript
// Get or create user in local database
const [user] = await db.query(
  'SELECT id FROM users WHERE firebase_uid = ?',
  [req.firebaseUid]
);

if (!user) {
  // First time user - create record
  const result = await db.query(
    'INSERT INTO users (firebase_uid, email) VALUES (?, ?)',
    [req.firebaseUid, req.email]
  );
  req.userId = result.insertId;
} else {
  req.userId = user.id;
}
```

---

## Security Best Practices

### ✅ DO

- Store service account keys in `.env` (never commit)
- Use environment variables for all credentials
- Verify tokens on every protected API endpoint
- Use Firebase UID as the source of truth for user identity

### ❌ DON'T

- Commit `.env` or service account JSON files to git
- Trust client-provided user IDs
- Skip token verification
- Store Firebase credentials in frontend code (except client SDK config)

---

## Testing Authentication

### Create Test User

1. Go to [Firebase Console](https://console.firebase.google.com/project/divtrack-6a09d)
2. Navigate to **Authentication** → **Users**
3. Click **Add User**
4. Enter email and password
5. Click **Add User**

Or use Firebase Auth REST API:

```bash
curl -X POST \
  'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCSqLD2vxKHMXAF6u5PJPQL8j6InK51OMc' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "returnSecureToken": true
  }'
```

### Verify Token (Backend Test)

```javascript
// Test script: test-auth.js
const { admin } = require('./src/config/firebase-admin');

const testToken = 'PASTE_ID_TOKEN_FROM_FRONTEND_HERE';

admin.auth().verifyIdToken(testToken)
  .then(decodedToken => {
    console.log('✅ Token valid!');
    console.log('UID:', decodedToken.uid);
    console.log('Email:', decodedToken.email);
  })
  .catch(error => {
    console.error('❌ Token invalid:', error);
  });
```

---

## Troubleshooting

### Error: "Error initializing Firebase Admin"

**Cause:** Missing or invalid service account credentials

**Fix:**
1. Check `.env` file exists in `backend/` directory
2. Verify service account path or environment variables are correct
3. Ensure private key includes `\n` line breaks

### Error: "ID token has expired"

**Cause:** Frontend token is older than 1 hour

**Fix:**
```javascript
// Refresh token before API calls
const idToken = await auth.currentUser.getIdToken(true); // force refresh
```

### Error: "No user record found"

**Cause:** Firebase UID doesn't exist in local `users` table

**Fix:** Implement user creation logic in backend (see "Map Firebase UID to Local User" above)

### Error: "CORS policy blocked"

**Cause:** Backend CORS not configured for frontend origin

**Fix:** Add to backend CORS middleware:
```javascript
app.use(cors({
  origin: 'http://localhost:5173' // or your frontend URL
}));
```

---

## Production Deployment (iFastNet)

### Frontend

1. Build the app: `npm run build`
2. Upload `dist/` contents to `public_html/`
3. Firebase client config is already included in bundle

### Backend

1. Upload backend files to `api/` directory
2. Create `.env` file on server with:
   - Database credentials (from cPanel)
   - Firebase service account credentials (Option B - individual env vars)
3. Install dependencies: `npm install --production`
4. Start server (method depends on iFastNet Node.js support)

### Environment Variables on iFastNet

If Node.js is supported, create `.env` file:
```env
DB_HOST=localhost
DB_USER=cpanel_username_dbuser
DB_PASSWORD=your_db_password
DB_NAME=cpanel_username_divtrack

FIREBASE_PROJECT_ID=divtrack-6a09d
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@divtrack-6a09d.iam.gserviceaccount.com

NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

**Important:** Store `.env` outside `public_html/` to prevent public access.

---

## Quick Reference

| Item | Value |
|------|-------|
| Project ID | `divtrack-6a09d` |
| Frontend Config | [frontend/src/config/firebase.js](../frontend/src/config/firebase.js) |
| Backend Config | [backend/src/config/firebase-admin.js](../backend/src/config/firebase-admin.js) |
| API Key (Public) | `AIzaSyCSqLD2vxKHMXAF6u5PJPQL8j6InK51OMc` |
| Auth Domain | `divtrack-6a09d.firebaseapp.com` |
| Service Account | Download from Firebase Console |

---

## Next Steps

1. ✅ Frontend config already complete
2. ⬜ Download service account key
3. ⬜ Configure backend `.env`
4. ⬜ Set up database (see [database/README.md](../database/README.md))
5. ⬜ Create test user in Firebase Console
6. ⬜ Test authentication flow
