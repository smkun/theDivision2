# My Builds Feature Design

**Date:** 2026-02-04

## Overview

Add a "My Builds" section to the Division 2 Gear Tracker allowing users to create, save, and share their gear builds.

## Brand Sets Addition

Add brand sets (high-end gear) to the item catalog, structured like armor sets:

- **New item type:** `brand_piece` added to `items.type` ENUM
- **Structure:** Each brand has 6 pieces (mask, chest, holster, backpack, gloves, kneepads)
- **Brands to seed (~20):** Airaldi Holdings, Alps Summit Armament, Badger Tuff, Belstone Armory, Ceska Vyroba, China Light Industries, Douglas & Harding, Fenris Group AB, Gila Guard, Golan Gear Ltd, Grupo Sombra, Hana-U Corporation, Murakami Industries, Overlord Armaments, Petrov Defense Group, Providence Defense, Richter & Kaiser, Sokolov Concern, Walker Harris & Co, Wyvern Wear, Yaahl Gear
- **Total new items:** ~126 brand pieces (21 brands × 6 slots)
- **Sort order range:** 600–799 (alphabetical by brand, then by slot)

### Frontend: Brand Sets Tab
- New tab "Brand Sets" in main nav (after Named Items, before My Builds)
- Layout identical to Armor Sets: table with brand name rows, 6 slot columns with checkboxes
- Progress indicator per brand (x/6)
- Reuses `ArmorSetsTable` component pattern

## Database Schema

### Reference Tables (for dropdowns)

```sql
-- Attributes for gear pieces
attributes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type ENUM('core', 'minor', 'mod') NOT NULL
)
-- Examples: "Weapon Damage" (core), "Crit Chance" (minor), "Crit Damage" (mod)

-- Talents for gear and weapons
talents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slot_type ENUM('chest', 'backpack', 'weapon') NOT NULL
)
-- Examples: "Obliterate" (chest), "Vigilance" (backpack), "Sadist" (weapon)

-- Skills
skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL
)
-- Examples: "Chem Launcher - Firestarter", "Incinerator Turret"

-- Specializations
specializations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL
)
-- Examples: "Gunner", "Sharpshooter", "Survivalist", "Demolitionist", "Technician", "Firewall"
```

### Build Tables

```sql
-- Main builds table
builds (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  specialization_id INT,
  skill_1_id INT,
  skill_2_id INT,
  notes TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (specialization_id) REFERENCES specializations(id),
  FOREIGN KEY (skill_1_id) REFERENCES skills(id),
  FOREIGN KEY (skill_2_id) REFERENCES skills(id)
)

-- Gear slots for each build
build_gear (
  id INT PRIMARY KEY AUTO_INCREMENT,
  build_id INT NOT NULL,
  slot ENUM('mask', 'chest', 'backpack', 'gloves', 'holster', 'kneepads') NOT NULL,
  item_name VARCHAR(100),  -- freeform text or selected from catalog
  item_id INT,             -- FK to items table if selected from catalog, NULL if custom
  core_attr_id INT,
  minor_1_id INT,
  minor_2_id INT,
  mod_id INT,
  talent_id INT,           -- only for chest/backpack
  owned_override BOOLEAN,  -- for non-catalog items: user manually marks "I have it"
  FOREIGN KEY (build_id) REFERENCES builds(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (core_attr_id) REFERENCES attributes(id),
  FOREIGN KEY (minor_1_id) REFERENCES attributes(id),
  FOREIGN KEY (minor_2_id) REFERENCES attributes(id),
  FOREIGN KEY (mod_id) REFERENCES attributes(id),
  FOREIGN KEY (talent_id) REFERENCES talents(id),
  UNIQUE KEY (build_id, slot)
)

-- Weapon slots for each build
build_weapons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  build_id INT NOT NULL,
  slot ENUM('primary', 'secondary', 'pistol') NOT NULL,
  weapon_name VARCHAR(100),
  item_id INT,             -- FK to items table if selected from catalog, NULL if custom
  talent_id INT,
  owned_override BOOLEAN,  -- for non-catalog items: user manually marks "I have it"
  FOREIGN KEY (build_id) REFERENCES builds(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (talent_id) REFERENCES talents(id),
  UNIQUE KEY (build_id, slot)
)
```

## API Endpoints

### Reference Data (public, no auth)
- `GET /api/attributes` — All attributes grouped by type
- `GET /api/talents` — All talents grouped by slot_type
- `GET /api/skills` — All skills
- `GET /api/specializations` — All specializations

### User Builds (auth required)
- `GET /api/me/builds` — List current user's builds (summary)
- `GET /api/me/builds/:id` — Full build details
- `POST /api/me/builds` — Create new build
- `PUT /api/me/builds/:id` — Update build
- `DELETE /api/me/builds/:id` — Delete build
- `POST /api/me/builds/:id/duplicate` — Copy build with new name

### Public Builds (no auth for listing, auth for copy)
- `GET /api/builds/public` — List all public builds (summary: name, author, specialization)
- `GET /api/builds/public/:id` — Full details of a public build
- `POST /api/builds/public/:id/copy` — (auth required) Copy a public build to user's builds

## Frontend UI

### Navigation
- Add "My Builds" tab to main nav (after Named Items)

### My Builds Page Layout
1. **Header section:** "My Builds" title + "New Build" button
2. **User's builds:** Grid of cards showing:
   - Build name
   - Specialization
   - Quick summary (auto-generated from gear, e.g., "4pc Ongoing Directive + Fenris")
   - Public badge if shared
   - Edit / Duplicate / Delete buttons
3. **Community Builds section:**
   - List of all public builds
   - Shows author, build name, specialization
   - Click to view full details (read-only)

### Ownership Indicators (on build view)

Each item in a build displays ownership status with color coding:

- **Green** — Item is in catalog (armor sets, exotics, named items) AND user owns it (exists in user_items)
- **Yellow** — Item not in catalog (custom brand piece like "Fenris chest"), shows checkbox for manual "I have it" tracking (stored in owned_override column)
- **Red** — Item is in catalog but user doesn't own it

This helps users see at a glance what pieces they still need to farm for a build.

### Copy Public Build

Public builds show a "Copy to My Builds" button. When clicked:
1. Creates a new build owned by the current user
2. Copies all gear/weapon slots with their attributes
3. Sets is_public = false on the copy
4. User can then edit their copy

### Build Editor (modal or dedicated view)
- Build name field
- 6 gear slot rows:
  - Item name (combo box: catalog items + custom text)
  - Core attribute (dropdown)
  - Minor 1 (dropdown)
  - Minor 2 (dropdown)
  - Mod (dropdown)
  - Talent (dropdown, chest/backpack only)
- 3 weapon rows:
  - Weapon name (combo box)
  - Talent (dropdown)
- Specialization (dropdown)
- Skill 1 & Skill 2 (dropdowns)
- Notes (textarea)
- "Make Public" checkbox
- Save / Cancel buttons

## Data to Seed

### Attributes
- **Core:** Weapon Damage, Armor, Skill Tier
- **Minor:** Crit Chance, Crit Damage, Headshot Damage, Weapon Handling, Armor Regeneration, Health, Hazard Protection, Explosive Resistance, Skill Damage, Skill Haste, Skill Repair, Status Effects
- **Mod:** Crit Chance, Crit Damage, Headshot Damage, Weapon Handling, Armor Regeneration, Health, Hazard Protection, Skill Damage, Skill Haste, Skill Repair, Status Effects, Protection from Elites

### Specializations
- Sharpshooter, Survivalist, Demolitionist, Gunner, Technician, Firewall

### Skills (all variants)
- Chem Launcher (Firestarter, Riot Foam, Oxidizer, Reinforcer)
- Turret (Assault, Incinerator, Sniper, Artillery)
- Hive (Stinger, Restorer, Reviver, Artificer)
- Drone (Striker, Defender, Bombardier, Fixer, Tactician)
- Seeker Mine (Explosive, Airburst, Mender, Cluster)
- Firefly (Blinder, Burster, Demolisher)
- Pulse (Scanner, Remote, Jammer, Banshee)
- Shield (Bulwark, Crusader, Deflector)
- Trap (Shock, Shrapnel, Repair)
- Decoy

### Talents
- **Chest:** Obliterate, Glass Cannon, Spotter, Overwatch, Unbreakable, Intimidate, Headhunter, Kinetic Momentum, etc.
- **Backpack:** Vigilance, Composure, Bloodsucker, Adrenaline Rush, Companion, Opportunistic, etc.
- **Weapon:** Sadist, Pyromaniac, Optimist, Ranger, Strained, Close & Personal, Breadbasket, etc.

(Full lists to be compiled during implementation)
