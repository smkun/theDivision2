# Setup Checklist - Get Your App Running

Complete these steps to get your Division 2 Gear Tracker running locally.

## Current Status

- ✅ Frontend dependencies installed
- ✅ Frontend running on http://localhost:5173
- ✅ Backend dependencies installed
- ❌ Database not set up yet
- ❌ Backend not running (needs Firebase credentials)

---

## Step 1: Set Up Database (5 minutes)

You have SQLtools extension connected to your database. Run the setup file:

1. Open [ifatnet sv6.session.sql](./ifatnet%20sv6.session.sql) in VS Code
2. Click "Run on active connection" (or press Ctrl+E Ctrl+E)
3. This will:
   - Create `divtrack` database
   - Create 3 tables (`users`, `items`, `user_items`)
   - Insert 138 armor set pieces
   - Insert 33 exotic weapons
   - Insert 25 exotic armor pieces
   - **Total: 196 items ready to track**

**Expected output:**
```
Query OK, 1 row affected (0.01 sec)
Database changed
Query OK, 0 rows affected (0.05 sec)
... (table creation messages)
Query OK, 138 rows affected (0.02 sec)
Records: 138  Duplicates: 0  Warnings: 0
```

---

## Step 2: Get Firebase Service Account Credentials (3 minutes)

Your backend needs Firebase Admin SDK credentials to verify user tokens.

### Download Service Account JSON:

1. Go to https://console.firebase.google.com/project/divtrack-6a09d/settings/serviceaccounts/adminsdk
2. Click **"Generate New Private Key"**
3. Click **"Generate Key"** in the confirmation dialog
4. Save the downloaded JSON file

### Extract Credentials:

Open the downloaded JSON file and find these 3 values:

```json
{
  "project_id": "divtrack-6a09d",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@divtrack-6a09d.iam.gserviceaccount.com"
}
```

---

## Step 3: Configure Backend Environment (2 minutes)

Edit [backend/.env](./backend/.env) and uncomment/fill in the Firebase credentials:

```env
# Database Configuration (already set)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=divtrack

# Firebase Admin SDK - ADD YOUR CREDENTIALS HERE
FIREBASE_PROJECT_ID=divtrack-6a09d
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nPASTE_YOUR_ACTUAL_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@divtrack-6a09d.iam.gserviceaccount.com

# Server Configuration (already set)
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Important:**
- Keep the quotes around `FIREBASE_PRIVATE_KEY`
- Keep the `\n` characters in the private key (they represent line breaks)
- The private key should be one long line with `\n` throughout

---

## Step 4: Start Backend Server (1 minute)

In a new terminal:

```bash
cd backend
npm run dev
```

**Expected output:**
```
> divtrack-backend@1.0.0 dev
> nodemon src/server.js

[nodemon] starting `node src/server.js`
✅ Firebase Admin initialized successfully
✅ Database connection pool created
🚀 Server running on http://localhost:3000
```

---

## Step 5: Test the Application

Your frontend should already be running on http://localhost:5173

### Test Sign Up:
1. Enter an email (e.g., `test@example.com`)
2. Enter a password (minimum 6 characters)
3. Click **"Sign Up"**
4. You should see the main app with armor sets and exotics

### Test Sign In with Google (Optional):
1. Click **"Sign in with Google"**
2. **Note:** This requires enabling Google provider in Firebase Console:
   - Go to https://console.firebase.google.com/project/divtrack-6a09d/authentication/providers
   - Click "Google" → Enable → Save

### Test Gear Tracking:
1. Click checkboxes next to gear pieces
2. Progress bars should update immediately
3. Refresh the page - your selections should persist

---

## Troubleshooting

### Backend won't start: "Error initializing Firebase Admin"

**Fix:** Check that your `FIREBASE_PRIVATE_KEY` in `.env`:
- Is wrapped in double quotes
- Contains `\n` for line breaks (not actual newlines)
- Starts with `-----BEGIN PRIVATE KEY-----\n`
- Ends with `\n-----END PRIVATE KEY-----\n`

### Backend won't start: "Access denied for user 'root'@'localhost'"

**Fix:** Update `DB_PASSWORD` in `backend/.env` with your MySQL root password

### "Failed to load data" in browser console

**Fix:** Make sure backend is running on http://localhost:3000
- Check terminal for errors
- Try: `curl http://localhost:3000/api/health`

### Google Sign-In: "Cross-Origin-Opener-Policy" warning

**Status:** This is a non-critical warning in development mode. Functionality works normally.

---

## What Happens After Setup?

Once everything is running:

1. **Sign Up/Sign In** → Creates user in Firebase → Backend auto-creates local user record
2. **Check Gear** → Frontend updates UI immediately → Backend saves to database
3. **Refresh Page** → Data persists (loaded from database)
4. **Multiple Devices** → Same account, same data everywhere

---

## Next Steps After Local Testing

### Enable Google Sign-In (Optional)
https://console.firebase.google.com/project/divtrack-6a09d/authentication/providers

### Deploy to Production
See [FIREBASE_SETUP.md](./ProjectDocuments/FIREBASE_SETUP.md#production-deployment-ifastnet) for deployment instructions

---

## Quick Reference

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://localhost:5173 | Should already be running |
| Backend | http://localhost:3000 | Start with `npm run dev` |
| Database | localhost:3306 | Use SQLtools to run setup SQL |
| Firebase Console | https://console.firebase.google.com/project/divtrack-6a09d | For service account download |

---

## Need Help?

- Frontend code: [frontend/src/](./frontend/src/)
- Backend code: [backend/src/](./backend/src/)
- Database setup: [ifatnet sv6.session.sql](./ifatnet%20sv6.session.sql)
- Firebase guide: [FIREBASE_SETUP.md](./ProjectDocuments/FIREBASE_SETUP.md)
