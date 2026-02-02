# PRD: Division 2 Gear Tracker (Armor Sets + Exotics)

## 1) Problem

Tracking **Division 2 gear** across multiple armor set pieces and exotic items is annoying, especially across multiple characters/builds. You want a simple “do I have it?” checklist tied to **your account**, not a shared spreadsheet that drifts out of date.

## 2) Goals

* A **Division 2 gear tracker** web app that shows:

  * Armor sets → each set piece (mask, chest, holster, backpack, gloves, kneepads)
  * Exotic weapons and exotic armor
* One-click **checkbox** to mark owned/not owned
* Data is **per logged-in user**
* Hosted on **iFastNet**
* Uses **Firebase Authentication** + **SQL database**

## 3) Non-goals

* Build optimization, DPS math, loadouts, or stat rolls
* Multi-user sharing/clans (v1)
* Scanning game inventory or API sync (v1)

## 4) Users

* **Primary user:** you (one account), possibly future friends later
* **Core need:** fast, low-friction collection tracking

## 5) User stories

* As a user, I can sign in and see **my** tracked items.
* As a user, I can toggle a checkbox to mark an item as owned.
* As a user, I can filter to show only missing items.
* As a user, I can search items by name (sets + exotics).
* As a user, I can see completion progress per armor set (ex: 4/6).

## 6) UX overview (single page app feel)

### Page layout (after login)

* Header:

  * App name + user email + sign out
  * Search box
  * Toggle: **Show Missing Only**
* Main content: two sections

  1. **Armor Sets**

     * Each set is a collapsible card (default expanded or remember last state)
     * Inside: 6 rows (piece name + checkbox)
     * Progress badge: `x/6`
  2. **Exotics**

     * Sub-tabs or filters: Weapons / Armor
     * List view with checkbox per item

### Checkbox behavior

* Clicking checkbox updates immediately (optimistic UI)
* If save fails: revert checkbox and show small toast message

## 7) Functional requirements

### Authentication

* Firebase Auth with email/password (v1)
* Optional later: Google sign-in

### Data and ownership tracking

* Each user has their own “owned” records.
* Items are global definitions (the list of sets/pieces/exotics).
* Owned state is stored as a per-user mapping: (user_id, item_id) → owned boolean.

### Core features (v1)

* Login / logout
* View armor sets and pieces
* View exotic items (weapons + armor)
* Toggle owned state via checkbox
* Search
* Filter missing only
* Set completion counts

### Admin / data loading (v1)

Pick one:

* **Option A (recommended):** seed items into SQL once via script or admin page
* Option B: hardcode item catalog in the frontend (fastest, but annoying to update)

## 8) Data model (SQL)

Assume MySQL/MariaDB on iFastNet.

### Tables

**users**

* id (PK, int auto)
* firebase_uid (unique, varchar)
* email (varchar)
* created_at (datetime)

**items**

* id (PK, int auto)
* type (enum: `armor_set_piece`, `exotic_weapon`, `exotic_armor`)
* name (varchar)

  * For armor set pieces: item display name like “Striker’s Battlegear – Mask”
* set_name (varchar, nullable)

  * For armor set pieces only, like “Striker’s Battlegear”
* slot (enum nullable: `mask`, `chest`, `holster`, `backpack`, `gloves`, `kneepads`)
* sort_order (int)
* is_active (bool default true)

**user_items**

* user_id (FK → users.id)
* item_id (FK → items.id)
* owned (bool default true)
* updated_at (datetime)
* PRIMARY KEY (user_id, item_id)

### Notes

* If a row exists in `user_items`, treat it as owned=true (and allow owned=false if you want explicit “unowned” saves).
* Or simpler: presence means owned. In that case, drop `owned` column.

## 9) API (backend)

You’ll host on iFastNet, so keep it simple:

* Node/Express or PHP backend (both workable on iFastNet)
* Firebase Admin SDK runs on the server to verify tokens

### Endpoints (example)

* `GET /api/catalog`
  Returns all items (armor set pieces + exotics)
* `GET /api/me/items`
  Returns owned item_ids for the logged-in user
* `PUT /api/me/items/:itemId`
  Body: `{ owned: true|false }`

### Auth flow

* Frontend signs in via Firebase Auth → gets ID token
* Frontend sends `Authorization: Bearer <id_token>`
* Backend verifies token, maps `firebase_uid` to local `users.id`

## 10) Hosting on iFastNet (deployment assumptions)

Typical iFastNet plans support:

* Static hosting (good for React/Vite build)
* PHP and MySQL/MariaDB commonly available
* Node support varies by plan; if Node isn’t available, use PHP for the API layer

### Deployment approach

* Frontend: React (Vite) or simple HTML/JS

  * Build output uploaded to `public_html/`
* Backend:

  * **If PHP:** `api/` folder with PHP endpoints + Firebase token verification via REST/JWT libraries
  * **If Node supported:** Express app with Firebase Admin SDK
* DB: MySQL/MariaDB provisioned in cPanel

## 11) Security + privacy

* All “owned” reads/writes require verified Firebase ID token
* Never trust client-provided user IDs
* Use parameterized queries (no string-built SQL)
* Rate limit basic endpoints if available (or keep it minimal; this is low-risk personal use)

## 12) Performance targets

* Page load < 2 seconds on typical home internet
* Checkbox toggle round-trip < 300 ms typical (best-effort; iFastNet shared hosting can vary)

## 13) Accessibility

* Checkboxes keyboard accessible (tab + space)
* Proper labels for each checkbox

## 14) Analytics (optional, v1.1)

* Track only basic events (no creepy stuff):

  * login
  * toggle owned
  * search usage

## 15) Risks / constraints

* iFastNet may limit backend options (Node vs PHP)
* Keeping the item catalog updated (new seasons, new exotics)
* Firebase Admin verification setup differs between Node/PHP

## 16) Milestones

1. **MVP skeleton**

   * Firebase Auth login/logout
   * Single page layout + placeholder lists
2. **Database + catalog**

   * Create tables
   * Seed catalog
3. **User-owned tracking**

   * `GET /me/items`, `PUT /me/items/:id`
   * Checkbox wiring + optimistic UI
4. **Polish**

   * Search + missing-only filter
   * Progress counts per set
5. **Deploy**

   * Upload build + configure backend + DB creds + environment variables

## 17) Acceptance criteria (definition of done)

* I can log in and only see **my** Division 2 gear tracker data.
* Armor set section shows multiple sets, each with 6 pieces and checkboxes.
* Exotics section lists exotic weapons and armor with checkboxes.
* Toggling a checkbox persists after refresh.
* Search and “missing only” filter work.
