-- Division 2 Gear Tracker - Database Schema
-- MySQL/MariaDB compatible

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
