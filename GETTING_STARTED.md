# Getting Started with Division 2 Gear Tracker

This guide will walk you through setting up the Division 2 Gear Tracker from scratch.

## Step 1: Install Prerequisites

### Required Software

1. **Node.js 20+**
   ```bash
   node --version  # Should be v20 or higher
   ```
   Download from https://nodejs.org if needed.

2. **MySQL 8+ or MariaDB 10+**
   ```bash
   mysql --version
   ```
   Install via package manager or download from https://www.mysql.com

3. **Git** (for version control)
   ```bash
   git --version
   ```

## Step 2: Clone or Download Project

```bash
cd /your/projects/directory
# If you have it in git:
git clone <repository-url>
cd theDivision2
```

## Step 3: Set Up Database

### Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE divtrack;
exit;
```

### Seed Data

```bash
# Run the complete setup script
mysql -u root -p divtrack < database/00_setup_complete.sql
```

This will:
- Create 3 tables (`users`, `items`, `user_items`)
- Insert 138 armor set pieces
- Insert 33 exotic weapons
- Insert 25 exotic armor pieces
- Run verification queries

**Expected output:** 196 total items

## Step 4: Configure Firebase

### Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Create a project"
3. Name it (e.g., "Division 2 Tracker")
4. Disable Google Analytics (optional)

### Enable Email Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Select **Email/Password**
4. Enable it and save

### Download Service Account Key

1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. Download the JSON file
4. Save it somewhere secure (NOT in the project folder)

### Get Firebase Config

The frontend config is already set up in `frontend/src/config/firebase.js` with your credentials:
- Project ID: `divtrack-6a09d`
- API Key: `AIzaSyCSqLD2vxKHMXAF6u5PJPQL8j6InK51OMc`

## Step 5: Configure Backend

### Create .env File

```bash
cd backend
cp .env.example .env
```

### Edit backend/.env

```env
# Database (use your actual MySQL credentials)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=divtrack

# Firebase Admin - Option 1: File path (easier)
FIREBASE_SERVICE_ACCOUNT_PATH=/absolute/path/to/your-service-account.json

# OR Option 2: Individual credentials (copy from service account JSON)
FIREBASE_PROJECT_ID=divtrack-6a09d
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@divtrack-6a09d.iam.gserviceaccount.com

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Install Dependencies

```bash
npm install
```

### Test Backend

```bash
npm run dev
```

You should see:
```
Database connected successfully
Firebase Admin initialized successfully
Server running on port 3000
```

Leave it running!

## Step 6: Configure Frontend

### Create .env File (Optional)

```bash
cd ../frontend
cp .env.example .env
```

The defaults work fine for local development.

### Install Dependencies

```bash
npm install
```

### Start Frontend

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

## Step 7: Test the App

1. Open http://localhost:5173 in your browser
2. You'll see the login page

### Create Your First User

1. Click **"Don't have an account? Sign Up"**
2. Enter your email and a password (min 6 characters)
3. Click **Sign Up**

### Start Tracking!

You should now see:
- **App Header** with your email and sign out button
- **Search bar** and "Show Missing Only" toggle
- **Armor Sets section** with 23 collapsible cards
- **Exotics section** with Weapons/Armor tabs

Click checkboxes to mark items as owned. The progress bars update automatically!

## Troubleshooting

### Backend won't start

**Error: "Database connection failed"**
- Check `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `backend/.env`
- Verify MySQL is running: `mysql -u root -p`

**Error: "Firebase Admin initialization failed"**
- Check `FIREBASE_SERVICE_ACCOUNT_PATH` points to correct file
- Or verify `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` are set

### Frontend won't connect

**Error: "Failed to load data"**
- Check backend is running on port 3000
- Check CORS_ORIGIN in `backend/.env` includes `http://localhost:5173`

**Error: "Authentication failed"**
- Check Firebase credentials in `frontend/src/config/firebase.js`
- Verify Email/Password authentication is enabled in Firebase Console

### Database issues

**Error: "Table doesn't exist"**
```bash
# Re-run database setup
mysql -u root -p divtrack < database/00_setup_complete.sql
```

**Wrong item count**
```sql
-- Check totals
SELECT type, COUNT(*) FROM items GROUP BY type;

-- Expected:
-- armor_set_piece: 138
-- exotic_weapon: 33
-- exotic_armor: 25
```

## Next Steps

### Add More Users

Just sign up with different email addresses. Each user has their own separate tracking.

### Customize Data

To add new items (when new seasons release):
1. Edit the appropriate `database/0X_seed_*.sql` file
2. Add new INSERT statements
3. Re-run the database setup

### Deploy to Production

See [ProjectDocuments/FIREBASE_SETUP.md](ProjectDocuments/FIREBASE_SETUP.md) for deployment instructions.

## Quick Reference

| Component | Command | URL |
|-----------|---------|-----|
| Backend Dev | `cd backend && npm run dev` | http://localhost:3000 |
| Frontend Dev | `cd frontend && npm run dev` | http://localhost:5173 |
| Firebase Console | - | https://console.firebase.google.com |
| MySQL CLI | `mysql -u root -p` | - |

## File Checklist

Before starting, verify these files exist:

- ✅ `backend/.env` (copied from `.env.example` and edited)
- ✅ `frontend/src/config/firebase.js` (already configured)
- ✅ Firebase service account JSON file (downloaded and path set in `backend/.env`)
- ✅ Database seeded (ran `database/00_setup_complete.sql`)

## Get Help

- **Firebase Setup:** See [ProjectDocuments/FIREBASE_SETUP.md](ProjectDocuments/FIREBASE_SETUP.md)
- **Database Setup:** See [database/README.md](database/README.md)
- **Architecture:** See [ProjectDocuments/PLANNING.md](ProjectDocuments/PLANNING.md)
- **Requirements:** See [ProjectDocuments/PRD.md](ProjectDocuments/PRD.md)

Enjoy tracking your Division 2 gear! 🎮
