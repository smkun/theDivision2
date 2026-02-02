# PLANNING.md

## Vision

Division 2 Gear Tracker is a personal web application that provides fast, low-friction collection tracking for Division 2 armor sets and exotic items with per-user ownership state persisted across sessions. Users can quickly toggle checkboxes to mark items as owned, filter to show only missing pieces, and track completion progress for each armor set. The app prioritizes simplicity over advanced features like build optimization or stat tracking.

## Tech Stack

- **Frontend:** React 18.x with Vite 5.x
- **Backend:** Node.js 20.x with Express 4.x (fallback to PHP 8.x if Node unavailable on iFastNet)
- **Database:** MySQL 8.x or MariaDB 10.x
- **Authentication:** Firebase Authentication 10.x (client SDK) + Firebase Admin SDK 12.x (server-side token verification)
- **Hosting:** iFastNet shared hosting
- **Build Tools:** Vite for frontend bundling, npm/pnpm for package management

## Components and Boundaries

### Frontend Components

**Authentication Layer:**
- `LoginPage` - Firebase Auth email/password sign-in
- `AuthProvider` - Context wrapper managing Firebase auth state
- `PrivateRoute` - Route guard requiring authentication

**Main Application:**
- `AppHeader` - User email display, sign-out button, search box, "Show Missing Only" toggle
- `ArmorSetsSection` - Container for all armor set cards
- `ArmorSetCard` - Collapsible card showing set name, progress (x/6), and 6 piece checkboxes
- `ExoticsSection` - Container with sub-tabs (Weapons/Armor) and exotic item list
- `ExoticItem` - Single exotic row with checkbox
- `ItemCheckbox` - Reusable checkbox component with optimistic UI and error handling

**State Management:**
- Local state via React hooks (useState, useContext)
- Optimistic updates: toggle checkbox immediately, revert on API failure with toast notification

### Backend Components

**API Layer (Express or PHP):**
- `auth.middleware.js` - Verifies Firebase ID token, maps firebase_uid to users.id
- `catalog.controller.js` - Handles `GET /api/catalog`
- `userItems.controller.js` - Handles `GET /api/me/items` and `PUT /api/me/items/:itemId`
- `db.connection.js` - MySQL connection pool configuration

**Database Schema:**
- `users` table - Maps firebase_uid to local user records
- `items` table - Global catalog of armor sets and exotics
- `user_items` table - Junction table tracking ownership per user

### Boundaries

- **Frontend ↔ Backend:** RESTful JSON API with JWT bearer tokens
- **Backend ↔ Database:** Parameterized SQL queries only (no ORM in v1)
- **Frontend ↔ Firebase:** Client SDK for auth only (token generation)
- **Backend ↔ Firebase:** Admin SDK for token verification only

## External Services and Data Flow

### Firebase Authentication Flow

1. User enters email/password in `LoginPage`
2. Frontend calls Firebase Auth client SDK → receives ID token
3. Frontend stores token in memory/session storage
4. All API requests include `Authorization: Bearer <id_token>` header
5. Backend middleware verifies token with Firebase Admin SDK
6. Backend maps `firebase_uid` to local `users.id` from database
7. Backend uses `users.id` for all ownership queries

### Data Flow: Toggle Ownership

1. User clicks checkbox in `ItemCheckbox` component
2. Component optimistically updates UI (checked state changes immediately)
3. Frontend sends `PUT /api/me/items/:itemId` with `{ owned: true|false }`
4. Backend verifies token → maps to user_id → upserts `user_items` row
5. Backend returns success/failure
6. On failure: frontend reverts checkbox and shows toast message

### Data Flow: Initial Load

1. User authenticates → frontend redirects to main page
2. Frontend makes parallel requests:
   - `GET /api/catalog` → returns all items with metadata
   - `GET /api/me/items` → returns array of owned item_ids for current user
3. Frontend merges data: match owned item_ids to catalog items
4. Frontend renders armor sets and exotics with appropriate checkbox states

## Key Decisions and Rationale

### 1. React + Vite over plain HTML/JS
**Rationale:** Component-based architecture simplifies state management for multiple armor sets and exotics. Vite provides fast development server and optimized production builds. Overkill avoided by keeping state local (no Redux).

### 2. Express (Node) preferred over PHP
**Rationale:** Firebase Admin SDK has better Node.js support and documentation. Easier token verification and async/await patterns. **Fallback to PHP only if iFastNet plan doesn't support Node.**

### 3. user_items table with composite PK instead of boolean column on items
**Rationale:** Scales to multi-user without bloating items table. Clear separation: items = global catalog, user_items = per-user state. Enables future features like tracking acquisition date.

### 4. Optimistic UI for checkboxes
**Rationale:** Immediate feedback prevents perceived lag on shared hosting. User doesn't wait for server round-trip. Revert on failure is rare and acceptable UX trade-off.

### 5. Presence in user_items = owned (no explicit owned column)
**Rationale:** Simplifies queries: `SELECT item_id FROM user_items WHERE user_id = ?`. To mark as unowned, delete row. Alternative: add `owned boolean` column if explicit "unowned" state needed for analytics.

### 6. Seed catalog via script/admin page instead of hardcoding
**Rationale:** New exotics and armor sets release seasonally. Database-driven catalog allows updates without frontend redeployment. Admin page deferred to post-v1 (manual SQL insert acceptable initially).

### 7. No ORM (raw SQL with parameterization)
**Rationale:** Simple schema with 3 tables doesn't justify ORM overhead. Direct queries faster on shared hosting. Parameterized queries prevent SQL injection.

### 8. Search and filter client-side (no backend endpoints)
**Rationale:** Full catalog fits in memory (~50-100 items). Client-side filtering instant. Reduces API surface area and shared hosting load.

## Open Questions and Risks

### 1. iFastNet Node.js support
**Question:** Does the specific iFastNet plan support Node.js or only PHP?  
**Risk:** May need to implement backend in PHP, requiring different Firebase token verification approach (REST API or JWT library).  
**Next steps:** Check iFastNet plan documentation or contact support. Prototype Firebase token verification in both Node and PHP.

### 2. Database connection limits on shared hosting
**Question:** How many concurrent MySQL connections allowed?  
**Risk:** Connection pool exhaustion under load (unlikely for personal use but possible).  
**Next steps:** Configure conservative pool size (max 5-10 connections). Test with concurrent requests. Monitor error logs post-deployment.

### 3. Item catalog initial seed
**Question:** Where to source complete list of Division 2 armor sets and exotics?  
**Risk:** Manual data entry error-prone and time-consuming.  
**Next steps:** Research Division 2 wikis or community resources for structured data. Create SQL seed script with INSERT statements. Validate against in-game inventory.

### 4. Firebase quota limits (free tier)
**Question:** Will Firebase Auth free tier suffice for personal use (1 user, occasional friends)?  
**Risk:** Exceeding free tier quotas unlikely but possible if auth checks too frequent.  
**Next steps:** Review Firebase Auth pricing. Implement token caching on backend (verify once per session, cache user_id mapping).

### 5. CORS configuration for iFastNet hosting
**Question:** Will frontend (served from `public_html/`) and backend (`/api/`) have CORS issues?  
**Risk:** Browser blocks API requests if origins don't match or CORS headers missing.  
**Next steps:** Configure Express CORS middleware to allow frontend origin. Test locally with separate ports before deployment.

### 6. Checkbox state race conditions
**Question:** What happens if user rapidly toggles same checkbox (double-click)?  
**Risk:** Multiple PUT requests in flight, last-write-wins may cause unexpected state.  
**Next steps:** Debounce checkbox clicks or disable during API request. Add request deduplication logic (ignore subsequent toggles until first completes).

### 7. Mobile responsiveness
**Question:** Should armor set cards and exotic lists adapt to mobile screens?  
**Risk:** Primary use case likely desktop, but mobile access could be frustrating if not responsive.  
**Next steps:** Use responsive CSS (flexbox/grid). Test on mobile viewport during polish phase. Acceptable to defer advanced mobile UX to v1.1.

### 8. Item catalog versioning (new seasons)
**Question:** How to handle item additions/removals across game seasons?  
**Risk:** User owns deprecated items or misses new releases.  
**Next steps:** Add `is_active` boolean to items table (already in schema from [PRD.md](PRD.md)). Soft-delete deprecated items (set is_active=false). Create admin page for catalog management in v1.1.

### 9. Backup and recovery
**Question:** How to backup user ownership data?  
**Risk:** Data loss on hosting provider outage or accidental deletion.  
**Next steps:** Schedule mysqldump via cron (if iFastNet allows) or manual exports. Store backups off-server (Google Drive, GitHub private repo).

### 10. Environment variable management
**Question:** How to securely store Firebase credentials and DB passwords on iFastNet?  
**Risk:** Credentials committed to repo or exposed in public_html.  
**Next steps:** Use `.env` file in backend directory (outside public_html). Add `.env` to `.gitignore`. Document setup in README for deployment.
