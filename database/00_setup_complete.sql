-- Division 2 Gear Tracker - Complete Database Setup
-- Run this file to create tables and seed all data
-- MySQL/MariaDB compatible

-- ============================================================================
-- STEP 1: Create Tables
-- ============================================================================
SOURCE 01_create_tables.sql;

-- ============================================================================
-- STEP 2: Seed Armor Set Pieces (138 items)
-- ============================================================================
SOURCE 02_seed_armor_sets.sql;

-- ============================================================================
-- STEP 3: Seed Exotic Weapons (33 items)
-- ============================================================================
SOURCE 03_seed_exotic_weapons.sql;

-- ============================================================================
-- STEP 4: Seed Exotic Armor (25 items)
-- ============================================================================
SOURCE 04_seed_exotic_armor.sql;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check total item count (should be 196)
SELECT 
    type,
    COUNT(*) as count
FROM items
GROUP BY type
ORDER BY type;

-- Expected results:
-- armor_set_piece: 138
-- exotic_armor: 25
-- exotic_weapon: 33
-- TOTAL: 196

-- Check armor sets (should be 23 sets with 6 pieces each)
SELECT 
    set_name,
    COUNT(*) as piece_count
FROM items
WHERE type = 'armor_set_piece'
GROUP BY set_name
ORDER BY set_name;

-- Verify all sets have exactly 6 pieces
SELECT 
    CASE 
        WHEN COUNT(*) = 23 THEN 'PASS: All 23 gear sets present'
        ELSE CONCAT('FAIL: Only ', COUNT(*), ' gear sets found')
    END as gear_set_check
FROM (
    SELECT set_name
    FROM items
    WHERE type = 'armor_set_piece'
    GROUP BY set_name
    HAVING COUNT(*) = 6
) as complete_sets;

-- Check exotic weapons by category (based on sort_order ranges)
SELECT 
    CASE 
        WHEN sort_order BETWEEN 200 AND 209 THEN 'Assault Rifles'
        WHEN sort_order BETWEEN 210 AND 219 THEN 'SMGs'
        WHEN sort_order BETWEEN 220 AND 229 THEN 'LMGs'
        WHEN sort_order BETWEEN 230 AND 239 THEN 'Rifles'
        WHEN sort_order BETWEEN 240 AND 249 THEN 'Shotguns'
        WHEN sort_order BETWEEN 250 AND 259 THEN 'Marksman Rifles'
        WHEN sort_order BETWEEN 260 AND 269 THEN 'Pistols'
    END as weapon_category,
    COUNT(*) as count
FROM items
WHERE type = 'exotic_weapon'
GROUP BY weapon_category
ORDER BY MIN(sort_order);

-- Check exotic armor by slot
SELECT 
    slot,
    COUNT(*) as count
FROM items
WHERE type = 'exotic_armor'
GROUP BY slot
ORDER BY 
    FIELD(slot, 'mask', 'chest', 'holster', 'backpack', 'gloves', 'kneepads');

-- Final summary
SELECT 
    'Database Setup Complete' as status,
    (SELECT COUNT(*) FROM items) as total_items,
    (SELECT COUNT(*) FROM items WHERE type = 'armor_set_piece') as armor_set_pieces,
    (SELECT COUNT(*) FROM items WHERE type = 'exotic_weapon') as exotic_weapons,
    (SELECT COUNT(*) FROM items WHERE type = 'exotic_armor') as exotic_armor,
    (SELECT COUNT(DISTINCT set_name) FROM items WHERE type = 'armor_set_piece') as gear_sets;
