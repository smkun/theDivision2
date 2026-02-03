# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Division 2 Gear Tracker - A web application for tracking Division 2 armor sets and exotic items with per-user ownership tracking.

**Tech Stack:**
- Frontend: React (Vite) or simple HTML/JS
- Backend: Node/Express OR PHP (depending on iFastNet hosting capabilities)
- Database: MySQL/MariaDB
- Authentication: Firebase Authentication
- Hosting: iFastNet

## Architecture

### Three-Tier Structure

1. **Frontend (Static Build)**
   - Single-page app feel with two main sections: Armor Sets and Exotics
   - Optimistic UI for checkbox toggles
   - Firebase Auth client SDK for authentication
   - Search and filtering capabilities (search by name, "show missing only")

2. **Backend API**
   - Verifies Firebase ID tokens using Firebase Admin SDK (Node) or REST/JWT libraries (PHP)
   - Maps `firebase_uid` to local database `users.id`
   - All endpoints require authenticated requests via `Authorization: Bearer <id_token>`
   - Core endpoints:
     - `GET /api/catalog` - Returns all items (armor set pieces + exotics)
     - `GET /api/me/items` - Returns owned item_ids for logged-in user
     - `PUT /api/me/items/:itemId` - Updates ownership state

3. **Database (MySQL/MariaDB)**
   - **users**: Maps Firebase UIDs to local user records
   - **items**: Global catalog of armor sets, pieces, and exotics
   - **user_items**: Per-user ownership tracking (composite PK: user_id, item_id)

### Data Model Key Points

**Items table** uses type enum: `armor_set_piece`, `exotic_weapon`, `exotic_armor`
- Armor set pieces include: `set_name` (e.g., "Striker's Battlegear") and `slot` (mask, chest, holster, backpack, gloves, kneepads)
- Exotics are categorized as weapons or armor
- `sort_order` field controls display ordering

**User ownership** tracked via `user_items` table - presence of row indicates ownership (or use explicit `owned` boolean column)

## Security Requirements

- **Never trust client-provided user IDs** - always verify Firebase ID token and map to backend user_id
- Use parameterized queries to prevent SQL injection
- All ownership reads/writes require verified Firebase token
- Backend must validate that users can only access their own data

## Development Constraints

- iFastNet hosting may limit backend options (check Node vs PHP availability)
- Shared hosting environment - expect variable API response times
- Target: checkbox toggle round-trip < 300ms, page load < 2s

## Data Seeding

Item catalog (armor sets and exotics) must be seeded into SQL database. Choose one approach:
- Admin script to populate `items` table
- Admin page for catalog management
- Avoid hardcoding catalog in frontend (maintenance burden)

## Deployment Structure

- Frontend build → `public_html/`
- Backend → `api/` folder (PHP) or separate Node process
- Database credentials → environment variables or config files (never commit)
- Firebase config → environment-specific settings

## Feature Scope (v1)

**In scope:**
- Email/password authentication
- Checkbox-based ownership tracking
- Armor set completion progress (x/6 pieces)
- Search by name
- Filter to show missing items only
- Per-user data isolation

**Out of scope:**
- Build optimization, DPS calculations, stat tracking
- Multi-user sharing or clan features
- Game API integration or inventory scanning
- Google sign-in (post-v1)

---

## Session Summary — 2026-02-02

### Changes Made

**Database:**
- Added `named_item` and `named_weapon` to the `items.type` ENUM (full list: `armor_set_piece`, `exotic_weapon`, `exotic_armor`, `named_item`, `named_weapon`)
- Inserted 57 named high-end gear pieces across all 6 armor slots:
  - Masks (4), Chests (18), Holsters (11), Backpacks (17), Gloves (5), Kneepads (2)
- Inserted 49 named high-end weapons across all 7 weapon types:
  - Assault Rifles (10), SMGs (7), LMGs (8), Rifles (6), Shotguns (8), Marksman Rifles (5), Pistols (5)
- Sort order range for named gear: 300–389 (300–309 masks, 310–329 chests, 330–349 holsters, 350–369 backpacks, 370–379 gloves, 380–389 kneepads)
- Sort order range for named weapons: 500–579 (500–519 ARs, 520–529 SMGs, 530–539 LMGs, 540–549 rifles, 550–559 shotguns, 560–569 MMRs, 570–579 pistols)
- Added missing exotics: Diamondback (shotgun), Collector (backpack), Shroud (marksman rifle)
- Added missing armor set: Ortiz: Exuro (6 pieces, sort_order 113–118)
- Removed accidental duplicate: The Bighorn (was already in DB as assault rifle)
- Removed incorrect entry: Uzina Getica (manufacturer, not an armor set)

**Frontend:**
- New component: `NamedItemsSection.jsx` — displays named items with top-level Weapons/Gear toggle, sub-tabs by weapon type or gear slot, progress bars per category
- New stylesheet: `NamedItemsSection.css` — dark/light mode, responsive, top-level tabs + sub-tabs + progress bar
- Updated `MainApp.jsx` — added third nav tab "Named Items", filters both `named_item` and `named_weapon` from catalog, passes to new component
- Updated `ExoticsSection.jsx` — items within each weapon type/armor slot now sorted alphabetically; weapon category order changed to match in-game (Shotguns before Rifles)
- Updated `NamedItemsSection.jsx` — weapon category tab order changed to match in-game (Shotguns before Rifles)

**Backend:**
- Fixed CORS config in `backend/src/server.js` — changed from hardcoded `localhost:5173` to dynamic regex accepting any `localhost` port (was blocking requests when Vite started on port 5175)

### Current Database Totals

- 26 armor sets (156 pieces)
- 38 exotic weapons
- 29 exotic armor pieces
- 57 named high-end gear
- 49 named high-end weapons
- **Total: 329 items**

### New Tasks / Next Steps
- Named items list may be incomplete — user should verify against in-game inventory and report missing items
- Named items sourced primarily from the Steam Community guide (steamcommunity.com/sharedfiles/filedetails/?id=3505676552); newer seasonal items may be missing
- Consider adding brand set name as metadata to named items (currently NULL in `set_name`)

### Risks
- Named item slot classifications were cross-referenced across multiple sources but some disagreements exist (e.g., Death Grips listed as Gloves in older sources, Holster in newer ones) — user may need to correct
- CORS fix allows any localhost port in development; production deployment should restrict to the actual frontend origin
- Database credentials are passed on the command line during manual SQL operations (MySQL warning about insecure password usage)

---

## Session Summary — 2026-02-03

### Changes Made

**Database — Named Weapons:**
- Added 6 missing assault rifles: Born Great, Glory Daze, Goalie, Lud, Manic, The Drill
- Added 2 missing SMGs: Cabaret, Cold Relations, Grown Great
- Added 3 missing LMGs: Big Show, New Reliable, Quiet Roar
- Added 3 missing shotguns: Like Glue, Thorn, The Mop
- Added 4 missing marksman rifles: Brutus, The Darkness, Instigator, Relic
- Added 3 missing rifles: Achilles, Stage Left, Sure
- Added 6 missing pistols: Diceros Special, Maxim 9, P320 XCompact, Sharpshooter's 93R, Survivalist D50, Firestarter
- Removed Doctor Home from named weapons (it's an exotic, not a named item)

**Database — Named Gear:**
- Added Bober (chest)
- Fixed slot misclassifications:
  - Visionario: moved from holsters to masks
  - Death Grips: moved from holsters to gloves
  - Devil's Due: moved from gloves to backpacks
  - Grease: moved from holsters to kneepads
- Populated `slot` column for all named gear items (was NULL, causing gear tabs to show empty)

**Frontend:**
- Updated `NamedItemsSection.jsx` — weapon category tab order: Marksman Rifles now before Rifles (matches in-game)
- Updated `WEAPON_CATEGORIES` sort_order ranges to reflect new database values after item additions shifted ranges

### Current Database Totals

- 26 armor sets (156 pieces)
- 38 exotic weapons
- 29 exotic armor pieces
- 58 named high-end gear (masks 5, chests 19, holsters 8, backpacks 18, gloves 5, kneepads 3)
- 70 named high-end weapons (ARs 16, SMGs 10, LMGs 11, shotguns 11, MMRs 7, rifles 8, pistols 11)
- **Total: 351 items**

### Notes
- Named items are now verified against user's in-game inventory
- Sort order ranges have shifted due to insertions; frontend `WEAPON_CATEGORIES` updated accordingly
