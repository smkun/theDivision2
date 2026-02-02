# Division 2 Gear Tracker

A web application for tracking Division 2 armor sets and exotic items with per-user ownership tracking.

## Features

- ✅ **User Authentication** - Firebase Auth with email/password
- ✅ **196 Trackable Items** - 23 armor sets (138 pieces) + 33 exotic weapons + 25 exotic armor
- ✅ **Progress Tracking** - Visual progress bars for each armor set (x/6 completion)
- ✅ **Search & Filter** - Search by name, filter to show only missing items
- ✅ **Optimistic UI** - Instant checkbox updates with error handling
- ✅ **Responsive Design** - Works on desktop and mobile

## Tech Stack

**Frontend:**
- React 18 + Vite
- Firebase Auth (client SDK)
- Axios for API calls

**Backend:**
- Node.js + Express
- Firebase Admin SDK (token verification)
- MySQL/MariaDB

**Hosting:**
- iFastNet (or any Node.js + MySQL host)

## Project Structure

```
theDivision2/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── config/        # Firebase config
│   │   ├── contexts/      # React contexts (Auth)
│   │   └── services/      # API service
│   └── package.json
├── backend/               # Express backend
│   ├── src/
│   │   ├── config/       # Firebase Admin, DB config
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth middleware
│   │   └── routes/       # API routes
│   └── package.json
├── database/             # SQL schema & seed data
│   ├── 01_create_tables.sql
│   ├── 02_seed_armor_sets.sql
│   ├── 03_seed_exotic_weapons.sql
│   ├── 04_seed_exotic_armor.sql
│   └── 00_setup_complete.sql
└── ProjectDocuments/     # Planning & guides
    ├── PRD.md
    ├── PLANNING.md
    ├── GAME_DATA.md
    └── FIREBASE_SETUP.md
```

## Quick Start

### Prerequisites

- Node.js 20+
- MySQL 8+ or MariaDB 10+
- Firebase project (see [FIREBASE_SETUP.md](ProjectDocuments/FIREBASE_SETUP.md))

### 1. Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE divtrack;"

# Run setup script
mysql -u root -p divtrack < database/00_setup_complete.sql
```

See [database/README.md](database/README.md) for details.

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database and Firebase credentials

# Start backend
npm run dev
```

Backend runs on http://localhost:3000

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start frontend
npm run dev
```

Frontend runs on http://localhost:5173

### 4. Create Test User

1. Go to http://localhost:5173
2. Click "Sign Up"
3. Enter email and password (min 6 characters)
4. Start tracking your gear!

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/catalog` | No | Get all items (armor sets + exotics) |
| GET | `/api/me/items` | Yes | Get owned items for current user |
| PUT | `/api/me/items/:itemId` | Yes | Update ownership status |

## Environment Variables

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=divtrack

# Firebase Admin SDK
FIREBASE_PROJECT_ID=divtrack-6a09d
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@divtrack-6a09d.iam.gserviceaccount.com

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
```

## Development Commands

### Frontend

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend

```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
```

## Deployment

See [ProjectDocuments/FIREBASE_SETUP.md](ProjectDocuments/FIREBASE_SETUP.md) for Firebase setup.

### iFastNet Deployment

1. **Database:**
   - Create MySQL database via cPanel
   - Run `database/00_setup_complete.sql`
   - Note credentials

2. **Backend:**
   - Upload `backend/` to `api/` directory
   - Create `.env` with production credentials
   - Install: `npm install --production`
   - Start server (method depends on iFastNet Node.js support)

3. **Frontend:**
   - Build: `npm run build`
   - Upload `dist/` contents to `public_html/`

## Documentation

- [PRD.md](ProjectDocuments/PRD.md) - Product requirements
- [PLANNING.md](ProjectDocuments/PLANNING.md) - Technical planning
- [GAME_DATA.md](ProjectDocuments/GAME_DATA.md) - Item catalog details
- [FIREBASE_SETUP.md](ProjectDocuments/FIREBASE_SETUP.md) - Firebase configuration guide
- [database/README.md](database/README.md) - Database setup guide
- [CLAUDE.md](CLAUDE.md) - Guide for Claude Code

## Data Model

### Tables

**users** - Maps Firebase UIDs to local user IDs
- `id`, `firebase_uid`, `email`, `created_at`

**items** - Global catalog (196 items)
- `id`, `type`, `name`, `set_name`, `slot`, `sort_order`, `is_active`

**user_items** - Per-user ownership
- `user_id`, `item_id`, `owned`, `updated_at`

## Security

- Firebase ID tokens verified on every protected endpoint
- User IDs never trusted from client
- Parameterized SQL queries (no SQL injection)
- CORS restricted to frontend origin
- Service account credentials in `.env` (not committed)

## License

ISC

## Support

For issues or questions, see the project documentation in `ProjectDocuments/`.
