# Division 2 Game Data: Armor Sets & Exotics

This document contains the complete catalog of Division 2 armor sets (gear sets) and exotic items for database seeding.

## Armor Sets (Gear Sets)

Each armor set consists of 6 pieces: **Mask, Chest, Holster, Backpack, Gloves, Kneepads**

### Complete List of Gear Sets (23 Total)

1. **Striker's Battlegear**
2. **Heartbreaker**
3. **Umbra Initiative**
4. **Hunter's Fury**
5. **Negotiator's Dilemma**
6. **Hotshot**
7. **Rigger**
8. **Eclipse Protocol**
9. **Future Initiative**
10. **Foundry Bulwark**
11. **Hard Wired**
12. **Ongoing Directive**
13. **Aces & Eights**
14. **Aegis**
15. **Breaking Point**
16. **Cavalier**
17. **Exuro** (Ortiz: Exuro)
18. **Refactor**
19. **System Corruption**
20. **Tip of the Spear**
21. **True Patriot**
22. **Virtuoso**
23. **Tipping Scales**

### Standard Slots Per Set

Each gear set has exactly 6 pieces:
- Mask
- Chest
- Holster
- Backpack
- Gloves
- Kneepads

**Total Armor Set Pieces:** 23 sets × 6 pieces = **138 items**

---

## Exotic Weapons

### Assault Rifles (6 Total)
1. St. Elmo's Engine
2. Strega
3. Capacitor
4. Eagle Bearer
5. Chameleon
6. The Bighorn

### Submachine Guns (5 Total)
1. Ouroboros
2. Oxpecker
3. Lady Death
4. Backfire
5. The Chatterbox

### Light Machine Guns (5 Total)
1. Pestilence
2. Bluescreen
3. Bullet King
4. Iron Lung
5. Pakhan

### Rifles (5 Total)
1. Vindicator
2. Doctor Home
3. The Ravenous
4. Diamondback
5. Merciless (Ruthless variant)

### Shotguns (4 Total)
1. Scorpio
2. Overlord
3. Sweet Dreams
4. The Lullaby

### Marksman Rifles (4 Total)
1. Mantis
2. Nemesis
3. Dread Edict
4. Sacrum Imperium

### Pistols (4 Total)
1. Regulus
2. Liberty
3. Busy Little Bee
4. Mosquito

**Total Exotic Weapons:** 6 + 5 + 5 + 5 + 4 + 4 + 4 = **33 items**

---

## Exotic Armor

### Masks (5 Total)
1. Coyote's Mask
2. Vile
3. Catharsis
4. The Catalyst
5. Tinkerer

### Chest Pieces (4 Total)
1. Tardigrade Armor System
2. Provocator
3. Ridgeway's Pride (General Ridgeway's Pride)
4. Collector

### Holsters (6 Total)
1. Dodge City Gunslinger's Holster
2. Waveform
3. Imperial Dynasty
4. Shocker Punch
5. Centurion's Scabbard
6. Nimble Holster

### Backpacks (4 Total)
1. Memento
2. NinjaBike Messenger Backpack
3. Acosta's Go-Bag
4. Birdie's Quick Fix (Birdie's Quick Fix Pack)

### Gloves (3 Total)
1. BTSU Datagloves
2. Bloody Knuckles
3. Rugged Gauntlets

### Kneepads (3 Total)
1. Sawyer's Kneepads
2. Ninja Bike Messenger Kneepads
3. Acosta's Kneepads

**Total Exotic Armor:** 5 + 4 + 6 + 4 + 3 + 3 = **25 items**

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Gear Sets | 23 sets |
| Armor Set Pieces | 138 pieces (23 sets × 6 slots) |
| Exotic Weapons | 33 items |
| Exotic Armor | 25 items |
| **Total Items** | **196 items** |

---

## Database Schema Mapping

### Items Table Structure (from PRD.md)

```sql
items:
- id (PK, int auto)
- type (enum: 'armor_set_piece', 'exotic_weapon', 'exotic_armor')
- name (varchar) - Display name
- set_name (varchar, nullable) - For armor set pieces only
- slot (enum nullable: 'mask', 'chest', 'holster', 'backpack', 'gloves', 'kneepads')
- sort_order (int)
- is_active (bool default true)
```

### Example Item Records

**Armor Set Piece:**
```
type: 'armor_set_piece'
name: "Striker's Battlegear – Mask"
set_name: "Striker's Battlegear"
slot: 'mask'
```

**Exotic Weapon:**
```
type: 'exotic_weapon'
name: "St. Elmo's Engine"
set_name: NULL
slot: NULL
```

**Exotic Armor:**
```
type: 'exotic_armor'
name: "Memento"
set_name: NULL
slot: 'backpack'
```

---

## Notes for Data Seeding

1. **Armor set pieces naming convention:** Use format "{Set Name} – {Slot}" (e.g., "Striker's Battlegear – Mask")
2. **Sort order suggestions:**
   - Armor sets: Group by set_name, then by slot order (mask, chest, holster, backpack, gloves, kneepads)
   - Exotics: Group by type (weapons by category, armor by slot)
3. **All items default to is_active = true**
4. **Future seasons:** When new gear sets or exotics are added, insert with new sort_order values
5. **Deprecated items:** Set is_active = false instead of deleting

---

## Brand Sets (Not Tracked in v1)

For reference, Division 2 also has 33 Brand Sets, but these are **out of scope** for v1 per [PRD.md](PRD.md). Brand sets include:
- Providence Defense
- Empress International
- Wyvern Wear
- Alps Summit Armaments
- China Light Industries
- And 28 others...

Brand sets are **NOT** included in the tracker at this time.
