# Database Setup Guide

This directory contains all SQL scripts needed to set up the Division 2 Gear Tracker database.

## Quick Start

### Option 1: All-in-One Setup (Recommended)

Run the complete setup script that executes all migrations in order:

```bash
mysql -u your_username -p your_database_name < 00_setup_complete.sql
```

### Option 2: Step-by-Step Setup

Execute each script individually:

```bash
mysql -u your_username -p your_database_name < 01_create_tables.sql
mysql -u your_username -p your_database_name < 02_seed_armor_sets.sql
mysql -u your_username -p your_database_name < 03_seed_exotic_weapons.sql
mysql -u your_username -p your_database_name < 04_seed_exotic_armor.sql
```

## Files Overview

| File | Description | Records |
|------|-------------|---------|
| `00_setup_complete.sql` | Master script that runs all setup files + verification queries | - |
| `01_create_tables.sql` | Creates `users`, `items`, and `user_items` tables | 3 tables |
| `02_seed_armor_sets.sql` | Inserts all 23 gear sets (6 pieces each) | 138 items |
| `03_seed_exotic_weapons.sql` | Inserts exotic weapons (7 categories) | 33 items |
| `04_seed_exotic_armor.sql` | Inserts exotic armor (6 slots) | 25 items |

**Total Items:** 196 (138 armor set pieces + 33 exotic weapons + 25 exotic armor)

## Database Schema

### Tables

**users**
- Maps Firebase Authentication UIDs to local user IDs
- Fields: `id`, `firebase_uid`, `email`, `created_at`

**items**
- Global catalog of all trackable items
- Fields: `id`, `type`, `name`, `set_name`, `slot`, `sort_order`, `is_active`, `created_at`
- Types: `armor_set_piece`, `exotic_weapon`, `exotic_armor`

**user_items**
- Tracks which items each user owns
- Fields: `user_id`, `item_id`, `owned`, `updated_at`
- Composite primary key: `(user_id, item_id)`

## Sort Order Convention

Items are organized by `sort_order` for consistent display:

- **1-138**: Armor set pieces (grouped by set, 6 pieces each)
- **200-209**: Exotic Assault Rifles
- **210-219**: Exotic SMGs
- **220-229**: Exotic LMGs
- **230-239**: Exotic Rifles
- **240-249**: Exotic Shotguns
- **250-259**: Exotic Marksman Rifles
- **260-269**: Exotic Pistols
- **300-304**: Exotic Masks
- **310-313**: Exotic Chest Pieces
- **320-325**: Exotic Holsters
- **330-333**: Exotic Backpacks
- **340-342**: Exotic Gloves
- **350-352**: Exotic Kneepads

## Verification

After running setup, verify the database:

```sql
-- Check total items (should be 196)
SELECT type, COUNT(*) as count FROM items GROUP BY type;

-- Check all gear sets have 6 pieces
SELECT set_name, COUNT(*) FROM items 
WHERE type = 'armor_set_piece' 
GROUP BY set_name;

-- View all exotic weapons
SELECT name FROM items 
WHERE type = 'exotic_weapon' 
ORDER BY sort_order;
```

Expected results:
- `armor_set_piece`: 138 items
- `exotic_weapon`: 33 items
- `exotic_armor`: 25 items
- 23 gear sets, each with exactly 6 pieces

## Adding New Items (Future Seasons)

When new gear sets or exotics are released:

1. Choose next available `sort_order` in appropriate range
2. Insert with `is_active = true`
3. For deprecated items, update: `UPDATE items SET is_active = false WHERE id = ?`

Example:

```sql
-- Add new exotic assault rifle
INSERT INTO items (type, name, set_name, slot, sort_order, is_active) 
VALUES ('exotic_weapon', 'New Exotic AR Name', NULL, NULL, 206, true);

-- Add new gear set (6 pieces)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'New Set – Mask', 'New Set', 'mask', 139),
('armor_set_piece', 'New Set – Chest', 'New Set', 'chest', 140),
-- ... continue for all 6 slots
```

## Backup Recommendations

Before making changes:

```bash
# Backup entire database
mysqldump -u your_username -p your_database_name > backup_$(date +%Y%m%d).sql

# Backup only items table
mysqldump -u your_username -p your_database_name items > items_backup_$(date +%Y%m%d).sql
```

## Troubleshooting

**Error: "Table already exists"**
- The setup script drops tables first. If you want to preserve data, backup first.

**Error: "Duplicate entry"**
- Check if data was already seeded. You can reset by running `01_create_tables.sql` (WARNING: destroys all data).

**Wrong item count**
- Run verification queries in `00_setup_complete.sql` to identify which category is incorrect.

## Connection String (iFastNet Example)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
```

Store these in `.env` file (never commit to git).
