-- Division 2 Gear Tracker - Complete Database Setup
-- Run this entire file to set up the database

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS divtrack;
USE divtrack;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS user_items;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;

-- Users table: Maps Firebase UIDs to local user records
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_firebase_uid (firebase_uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Items table: Global catalog of armor sets and exotics
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('armor_set_piece', 'exotic_weapon', 'exotic_armor') NOT NULL,
    name VARCHAR(255) NOT NULL,
    set_name VARCHAR(255) NULL COMMENT 'For armor set pieces only',
    slot ENUM('mask', 'chest', 'holster', 'backpack', 'gloves', 'kneepads') NULL COMMENT 'For armor set pieces and exotic armor',
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_set_name (set_name),
    INDEX idx_slot (slot),
    INDEX idx_is_active (is_active),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Items table: Per-user ownership tracking
CREATE TABLE user_items (
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    owned BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, item_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    INDEX idx_user_owned (user_id, owned)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SEED ARMOR SET PIECES (138 items)
-- ============================================================================

-- Striker's Battlegear (sort_order 1-6)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', "Striker's Battlegear – Mask", "Striker's Battlegear", 'mask', 1),
('armor_set_piece', "Striker's Battlegear – Chest", "Striker's Battlegear", 'chest', 2),
('armor_set_piece', "Striker's Battlegear – Holster", "Striker's Battlegear", 'holster', 3),
('armor_set_piece', "Striker's Battlegear – Backpack", "Striker's Battlegear", 'backpack', 4),
('armor_set_piece', "Striker's Battlegear – Gloves", "Striker's Battlegear", 'gloves', 5),
('armor_set_piece', "Striker's Battlegear – Kneepads", "Striker's Battlegear", 'kneepads', 6);

-- Heartbreaker (sort_order 7-12)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'Heartbreaker – Mask', 'Heartbreaker', 'mask', 7),
('armor_set_piece', 'Heartbreaker – Chest', 'Heartbreaker', 'chest', 8),
('armor_set_piece', 'Heartbreaker – Holster', 'Heartbreaker', 'holster', 9),
('armor_set_piece', 'Heartbreaker – Backpack', 'Heartbreaker', 'backpack', 10),
('armor_set_piece', 'Heartbreaker – Gloves', 'Heartbreaker', 'gloves', 11),
('armor_set_piece', 'Heartbreaker – Kneepads', 'Heartbreaker', 'kneepads', 12);

-- Umbra Initiative (sort_order 13-18)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'Umbra Initiative – Mask', 'Umbra Initiative', 'mask', 13),
('armor_set_piece', 'Umbra Initiative – Chest', 'Umbra Initiative', 'chest', 14),
('armor_set_piece', 'Umbra Initiative – Holster', 'Umbra Initiative', 'holster', 15),
('armor_set_piece', 'Umbra Initiative – Backpack', 'Umbra Initiative', 'backpack', 16),
('armor_set_piece', 'Umbra Initiative – Gloves', 'Umbra Initiative', 'gloves', 17),
('armor_set_piece', 'Umbra Initiative – Kneepads', 'Umbra Initiative', 'kneepads', 18);

-- Hunter's Fury (sort_order 19-24)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', "Hunter's Fury – Mask", "Hunter's Fury", 'mask', 19),
('armor_set_piece', "Hunter's Fury – Chest", "Hunter's Fury", 'chest', 20),
('armor_set_piece', "Hunter's Fury – Holster", "Hunter's Fury", 'holster', 21),
('armor_set_piece', "Hunter's Fury – Backpack", "Hunter's Fury", 'backpack', 22),
('armor_set_piece', "Hunter's Fury – Gloves", "Hunter's Fury", 'gloves', 23),
('armor_set_piece', "Hunter's Fury – Kneepads", "Hunter's Fury", 'kneepads', 24);

-- Negotiator's Dilemma (sort_order 25-30)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', "Negotiator's Dilemma – Mask", "Negotiator's Dilemma", 'mask', 25),
('armor_set_piece', "Negotiator's Dilemma – Chest", "Negotiator's Dilemma", 'chest', 26),
('armor_set_piece', "Negotiator's Dilemma – Holster", "Negotiator's Dilemma", 'holster', 27),
('armor_set_piece', "Negotiator's Dilemma – Backpack", "Negotiator's Dilemma", 'backpack', 28),
('armor_set_piece', "Negotiator's Dilemma – Gloves", "Negotiator's Dilemma", 'gloves', 29),
('armor_set_piece', "Negotiator's Dilemma – Kneepads", "Negotiator's Dilemma", 'kneepads', 30);

-- Hotshot (sort_order 31-36)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'Hotshot – Mask', 'Hotshot', 'mask', 31),
('armor_set_piece', 'Hotshot – Chest', 'Hotshot', 'chest', 32),
('armor_set_piece', 'Hotshot – Holster', 'Hotshot', 'holster', 33),
('armor_set_piece', 'Hotshot – Backpack', 'Hotshot', 'backpack', 34),
('armor_set_piece', 'Hotshot – Gloves', 'Hotshot', 'gloves', 35),
('armor_set_piece', 'Hotshot – Kneepads', 'Hotshot', 'kneepads', 36);

-- Rigger (sort_order 37-42)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'Rigger – Mask', 'Rigger', 'mask', 37),
('armor_set_piece', 'Rigger – Chest', 'Rigger', 'chest', 38),
('armor_set_piece', 'Rigger – Holster', 'Rigger', 'holster', 39),
('armor_set_piece', 'Rigger – Backpack', 'Rigger', 'backpack', 40),
('armor_set_piece', 'Rigger – Gloves', 'Rigger', 'gloves', 41),
('armor_set_piece', 'Rigger – Kneepads', 'Rigger', 'kneepads', 42);

-- Eclipse Protocol (sort_order 43-48)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'Eclipse Protocol – Mask', 'Eclipse Protocol', 'mask', 43),
('armor_set_piece', 'Eclipse Protocol – Chest', 'Eclipse Protocol', 'chest', 44),
('armor_set_piece', 'Eclipse Protocol – Holster', 'Eclipse Protocol', 'holster', 45),
('armor_set_piece', 'Eclipse Protocol – Backpack', 'Eclipse Protocol', 'backpack', 46),
('armor_set_piece', 'Eclipse Protocol – Gloves', 'Eclipse Protocol', 'gloves', 47),
('armor_set_piece', 'Eclipse Protocol – Kneepads', 'Eclipse Protocol', 'kneepads', 48);

-- Future Initiative (sort_order 49-54)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'Future Initiative – Mask', 'Future Initiative', 'mask', 49),
('armor_set_piece', 'Future Initiative – Chest', 'Future Initiative', 'chest', 50),
('armor_set_piece', 'Future Initiative – Holster', 'Future Initiative', 'holster', 51),
('armor_set_piece', 'Future Initiative – Backpack', 'Future Initiative', 'backpack', 52),
('armor_set_piece', 'Future Initiative – Gloves', 'Future Initiative', 'gloves', 53),
('armor_set_piece', 'Future Initiative – Kneepads', 'Future Initiative', 'kneepads', 54);

-- Foundry Bulwark (sort_order 55-60)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'Foundry Bulwark – Mask', 'Foundry Bulwark', 'mask', 55),
('armor_set_piece', 'Foundry Bulwark – Chest', 'Foundry Bulwark', 'chest', 56),
('armor_set_piece', 'Foundry Bulwark – Holster', 'Foundry Bulwark', 'holster', 57),
('armor_set_piece', 'Foundry Bulwark – Backpack', 'Foundry Bulwark', 'backpack', 58),
('armor_set_piece', 'Foundry Bulwark – Gloves', 'Foundry Bulwark', 'gloves', 59),
('armor_set_piece', 'Foundry Bulwark – Kneepads', 'Foundry Bulwark', 'kneepads', 60);

-- Hard Wired (sort_order 61-66)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'Hard Wired – Mask', 'Hard Wired', 'mask', 61),
('armor_set_piece', 'Hard Wired – Chest', 'Hard Wired', 'chest', 62),
('armor_set_piece', 'Hard Wired – Holster', 'Hard Wired', 'holster', 63),
('armor_set_piece', 'Hard Wired – Backpack', 'Hard Wired', 'backpack', 64),
('armor_set_piece', 'Hard Wired – Gloves', 'Hard Wired', 'gloves', 65),
('armor_set_piece', 'Hard Wired – Kneepads', 'Hard Wired', 'kneepads', 66);

-- Ongoing Directive (sort_order 67-72)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'Ongoing Directive – Mask', 'Ongoing Directive', 'mask', 67),
('armor_set_piece', 'Ongoing Directive – Chest', 'Ongoing Directive', 'chest', 68),
('armor_set_piece', 'Ongoing Directive – Holster', 'Ongoing Directive', 'holster', 69),
('armor_set_piece', 'Ongoing Directive – Backpack', 'Ongoing Directive', 'backpack', 70),
('armor_set_piece', 'Ongoing Directive – Gloves', 'Ongoing Directive', 'gloves', 71),
('armor_set_piece', 'Ongoing Directive – Kneepads', 'Ongoing Directive', 'kneepads', 72);

-- Aces & Eights (sort_order 73-78)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'Aces & Eights – Mask', 'Aces & Eights', 'mask', 73),
('armor_set_piece', 'Aces & Eights – Chest', 'Aces & Eights', 'chest', 74),
('armor_set_piece', 'Aces & Eights – Holster', 'Aces & Eights', 'holster', 75),
('armor_set_piece', 'Aces & Eights – Backpack', 'Aces & Eights', 'backpack', 76),
('armor_set_piece', 'Aces & Eights – Gloves', 'Aces & Eights', 'gloves', 77),
('armor_set_piece', 'Aces & Eights – Kneepads', 'Aces & Eights', 'kneepads', 78);

-- Aegis (sort_order 79-84)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'Aegis – Mask', 'Aegis', 'mask', 79),
('armor_set_piece', 'Aegis – Chest', 'Aegis', 'chest', 80),
('armor_set_piece', 'Aegis – Holster', 'Aegis', 'holster', 81),
('armor_set_piece', 'Aegis – Backpack', 'Aegis', 'backpack', 82),
('armor_set_piece', 'Aegis – Gloves', 'Aegis', 'gloves', 83),
('armor_set_piece', 'Aegis – Kneepads', 'Aegis', 'kneepads', 84);

-- Breaking Point (sort_order 85-90)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'Breaking Point – Mask', 'Breaking Point', 'mask', 85),
('armor_set_piece', 'Breaking Point – Chest', 'Breaking Point', 'chest', 86),
('armor_set_piece', 'Breaking Point – Holster', 'Breaking Point', 'holster', 87),
('armor_set_piece', 'Breaking Point – Backpack', 'Breaking Point', 'backpack', 88),
('armor_set_piece', 'Breaking Point – Gloves', 'Breaking Point', 'gloves', 89),
('armor_set_piece', 'Breaking Point – Kneepads', 'Breaking Point', 'kneepads', 90);

-- Cavalier (sort_order 91-96)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'Cavalier – Mask', 'Cavalier', 'mask', 91),
('armor_set_piece', 'Cavalier – Chest', 'Cavalier', 'chest', 92),
('armor_set_piece', 'Cavalier – Holster', 'Cavalier', 'holster', 93),
('armor_set_piece', 'Cavalier – Backpack', 'Cavalier', 'backpack', 94),
('armor_set_piece', 'Cavalier – Gloves', 'Cavalier', 'gloves', 95),
('armor_set_piece', 'Cavalier – Kneepads', 'Cavalier', 'kneepads', 96);

-- Exuro (sort_order 97-102)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'Exuro – Mask', 'Exuro', 'mask', 97),
('armor_set_piece', 'Exuro – Chest', 'Exuro', 'chest', 98),
('armor_set_piece', 'Exuro – Holster', 'Exuro', 'holster', 99),
('armor_set_piece', 'Exuro – Backpack', 'Exuro', 'backpack', 100),
('armor_set_piece', 'Exuro – Gloves', 'Exuro', 'gloves', 101),
('armor_set_piece', 'Exuro – Kneepads', 'Exuro', 'kneepads', 102);

-- Refactor (sort_order 103-108)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'Refactor – Mask', 'Refactor', 'mask', 103),
('armor_set_piece', 'Refactor – Chest', 'Refactor', 'chest', 104),
('armor_set_piece', 'Refactor – Holster', 'Refactor', 'holster', 105),
('armor_set_piece', 'Refactor – Backpack', 'Refactor', 'backpack', 106),
('armor_set_piece', 'Refactor – Gloves', 'Refactor', 'gloves', 107),
('armor_set_piece', 'Refactor – Kneepads', 'Refactor', 'kneepads', 108);

-- System Corruption (sort_order 109-114)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'System Corruption – Mask', 'System Corruption', 'mask', 109),
('armor_set_piece', 'System Corruption – Chest', 'System Corruption', 'chest', 110),
('armor_set_piece', 'System Corruption – Holster', 'System Corruption', 'holster', 111),
('armor_set_piece', 'System Corruption – Backpack', 'System Corruption', 'backpack', 112),
('armor_set_piece', 'System Corruption – Gloves', 'System Corruption', 'gloves', 113),
('armor_set_piece', 'System Corruption – Kneepads', 'System Corruption', 'kneepads', 114);

-- Tip of the Spear (sort_order 115-120)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'Tip of the Spear – Mask', 'Tip of the Spear', 'mask', 115),
('armor_set_piece', 'Tip of the Spear – Chest', 'Tip of the Spear', 'chest', 116),
('armor_set_piece', 'Tip of the Spear – Holster', 'Tip of the Spear', 'holster', 117),
('armor_set_piece', 'Tip of the Spear – Backpack', 'Tip of the Spear', 'backpack', 118),
('armor_set_piece', 'Tip of the Spear – Gloves', 'Tip of the Spear', 'gloves', 119),
('armor_set_piece', 'Tip of the Spear – Kneepads', 'Tip of the Spear', 'kneepads', 120);

-- True Patriot (sort_order 121-126)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'True Patriot – Mask', 'True Patriot', 'mask', 121),
('armor_set_piece', 'True Patriot – Chest', 'True Patriot', 'chest', 122),
('armor_set_piece', 'True Patriot – Holster', 'True Patriot', 'holster', 123),
('armor_set_piece', 'True Patriot – Backpack', 'True Patriot', 'backpack', 124),
('armor_set_piece', 'True Patriot – Gloves', 'True Patriot', 'gloves', 125),
('armor_set_piece', 'True Patriot – Kneepads', 'True Patriot', 'kneepads', 126);

-- Virtuoso (sort_order 127-132)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'Virtuoso – Mask', 'Virtuoso', 'mask', 127),
('armor_set_piece', 'Virtuoso – Chest', 'Virtuoso', 'chest', 128),
('armor_set_piece', 'Virtuoso – Holster', 'Virtuoso', 'holster', 129),
('armor_set_piece', 'Virtuoso – Backpack', 'Virtuoso', 'backpack', 130),
('armor_set_piece', 'Virtuoso – Gloves', 'Virtuoso', 'gloves', 131),
('armor_set_piece', 'Virtuoso – Kneepads', 'Virtuoso', 'kneepads', 132);

-- Tipping Scales (sort_order 133-138)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('armor_set_piece', 'Tipping Scales – Mask', 'Tipping Scales', 'mask', 133),
('armor_set_piece', 'Tipping Scales – Chest', 'Tipping Scales', 'chest', 134),
('armor_set_piece', 'Tipping Scales – Holster', 'Tipping Scales', 'holster', 135),
('armor_set_piece', 'Tipping Scales – Backpack', 'Tipping Scales', 'backpack', 136),
('armor_set_piece', 'Tipping Scales – Gloves', 'Tipping Scales', 'gloves', 137),
('armor_set_piece', 'Tipping Scales – Kneepads', 'Tipping Scales', 'kneepads', 138);

-- ============================================================================
-- SEED EXOTIC WEAPONS (33 items)
-- ============================================================================

-- Assault Rifles (sort_order 200-205)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('exotic_weapon', "St. Elmo's Engine", NULL, NULL, 200),
('exotic_weapon', 'Strega', NULL, NULL, 201),
('exotic_weapon', 'Capacitor', NULL, NULL, 202),
('exotic_weapon', 'Eagle Bearer', NULL, NULL, 203),
('exotic_weapon', 'Chameleon', NULL, NULL, 204),
('exotic_weapon', 'The Bighorn', NULL, NULL, 205);

-- Submachine Guns (sort_order 210-214)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('exotic_weapon', 'Ouroboros', NULL, NULL, 210),
('exotic_weapon', 'Oxpecker', NULL, NULL, 211),
('exotic_weapon', 'Lady Death', NULL, NULL, 212),
('exotic_weapon', 'Backfire', NULL, NULL, 213),
('exotic_weapon', 'The Chatterbox', NULL, NULL, 214);

-- Light Machine Guns (sort_order 220-224)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('exotic_weapon', 'Pestilence', NULL, NULL, 220),
('exotic_weapon', 'Bluescreen', NULL, NULL, 221),
('exotic_weapon', 'Bullet King', NULL, NULL, 222),
('exotic_weapon', 'Iron Lung', NULL, NULL, 223),
('exotic_weapon', 'Pakhan', NULL, NULL, 224);

-- Rifles (sort_order 230-234)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('exotic_weapon', 'Vindicator', NULL, NULL, 230),
('exotic_weapon', 'Doctor Home', NULL, NULL, 231),
('exotic_weapon', 'The Ravenous', NULL, NULL, 232),
('exotic_weapon', 'Diamondback', NULL, NULL, 233),
('exotic_weapon', 'Merciless', NULL, NULL, 234);

-- Shotguns (sort_order 240-243)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('exotic_weapon', 'Scorpio', NULL, NULL, 240),
('exotic_weapon', 'Overlord', NULL, NULL, 241),
('exotic_weapon', 'Sweet Dreams', NULL, NULL, 242),
('exotic_weapon', 'The Lullaby', NULL, NULL, 243);

-- Marksman Rifles (sort_order 250-253)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('exotic_weapon', 'Mantis', NULL, NULL, 250),
('exotic_weapon', 'Nemesis', NULL, NULL, 251),
('exotic_weapon', 'Dread Edict', NULL, NULL, 252),
('exotic_weapon', 'Sacrum Imperium', NULL, NULL, 253);

-- Pistols (sort_order 260-263)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('exotic_weapon', 'Regulus', NULL, NULL, 260),
('exotic_weapon', 'Liberty', NULL, NULL, 261),
('exotic_weapon', 'Busy Little Bee', NULL, NULL, 262),
('exotic_weapon', 'Mosquito', NULL, NULL, 263);

-- ============================================================================
-- SEED EXOTIC ARMOR (25 items)
-- ============================================================================

-- Masks (sort_order 300-304)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('exotic_armor', "Coyote's Mask", NULL, 'mask', 300),
('exotic_armor', 'Vile', NULL, 'mask', 301),
('exotic_armor', 'Catharsis', NULL, 'mask', 302),
('exotic_armor', 'The Catalyst', NULL, 'mask', 303),
('exotic_armor', 'Tinkerer', NULL, 'mask', 304);

-- Chest Pieces (sort_order 310-313)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('exotic_armor', 'Tardigrade Armor System', NULL, 'chest', 310),
('exotic_armor', 'Provocator', NULL, 'chest', 311),
('exotic_armor', "Ridgeway's Pride", NULL, 'chest', 312),
('exotic_armor', 'Collector', NULL, 'chest', 313);

-- Holsters (sort_order 320-325)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('exotic_armor', "Dodge City Gunslinger's Holster", NULL, 'holster', 320),
('exotic_armor', 'Waveform', NULL, 'holster', 321),
('exotic_armor', 'Imperial Dynasty', NULL, 'holster', 322),
('exotic_armor', 'Shocker Punch', NULL, 'holster', 323),
('exotic_armor', "Centurion's Scabbard", NULL, 'holster', 324),
('exotic_armor', 'Nimble Holster', NULL, 'holster', 325);

-- Backpacks (sort_order 330-333)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('exotic_armor', 'Memento', NULL, 'backpack', 330),
('exotic_armor', 'NinjaBike Messenger Backpack', NULL, 'backpack', 331),
('exotic_armor', "Acosta's Go-Bag", NULL, 'backpack', 332),
('exotic_armor', "Birdie's Quick Fix", NULL, 'backpack', 333);

-- Gloves (sort_order 340-342)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('exotic_armor', 'BTSU Datagloves', NULL, 'gloves', 340),
('exotic_armor', 'Bloody Knuckles', NULL, 'gloves', 341),
('exotic_armor', 'Rugged Gauntlets', NULL, 'gloves', 342);

-- Kneepads (sort_order 350-352)
INSERT INTO items (type, name, set_name, slot, sort_order) VALUES
('exotic_armor', "Sawyer's Kneepads", NULL, 'kneepads', 350),
('exotic_armor', 'Ninja Bike Messenger Kneepads', NULL, 'kneepads', 351),
('exotic_armor', "Acosta's Kneepads", NULL, 'kneepads', 352);

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check totals
SELECT 'Setup Complete!' as status;
SELECT type, COUNT(*) as count FROM items GROUP BY type ORDER BY type;
SELECT 'Expected: 138 armor_set_piece, 33 exotic_weapon, 25 exotic_armor (196 total)' as note;
