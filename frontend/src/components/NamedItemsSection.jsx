import React, { useState } from 'react';
import ItemCheckbox from './ItemCheckbox';
import './NamedItemsSection.css';

const GEAR_SLOTS = [
  { key: 'mask', label: 'Mask' },
  { key: 'chest', label: 'Chest' },
  { key: 'holster', label: 'Holster' },
  { key: 'backpack', label: 'Backpack' },
  { key: 'gloves', label: 'Gloves' },
  { key: 'kneepads', label: 'Kneepads' },
];

const WEAPON_CATEGORIES = [
  { key: 'assault_rifles', label: 'Assault Rifles', min: 500, max: 519 },
  { key: 'smgs', label: 'SMGs', min: 520, max: 529 },
  { key: 'lmgs', label: 'LMGs', min: 530, max: 539 },
  { key: 'shotguns', label: 'Shotguns', min: 550, max: 559 },
  { key: 'rifles', label: 'Rifles', min: 540, max: 549 },
  { key: 'marksman_rifles', label: 'Marksman Rifles', min: 560, max: 569 },
  { key: 'pistols', label: 'Pistols', min: 570, max: 579 },
];

const NamedItemsSection = ({ namedItems, namedWeapons, ownedItems, onToggleOwnership }) => {
  const [activeView, setActiveView] = useState('weapons');
  const [activeGearSlot, setActiveGearSlot] = useState('mask');
  const [activeWeaponCat, setActiveWeaponCat] = useState('assault_rifles');

  // --- GEAR: group by slot ---
  const gearBySlot = namedItems.reduce((acc, item) => {
    const slot = item.slot || 'other';
    if (!acc[slot]) acc[slot] = [];
    acc[slot].push(item);
    return acc;
  }, {});

  // --- WEAPONS: group by sort_order range ---
  const weaponsByCat = WEAPON_CATEGORIES.reduce((acc, cat) => {
    acc[cat.key] = namedWeapons.filter(
      w => w.sort_order >= cat.min && w.sort_order <= cat.max
    );
    return acc;
  }, {});

  const getProgress = (items) => {
    const owned = items.filter(item => ownedItems.has(item.id)).length;
    return { owned, total: items.length };
  };

  // Determine current list and progress
  let currentItems, currentProgress, subTabs, activeSubTab, setActiveSubTab;

  if (activeView === 'gear') {
    subTabs = GEAR_SLOTS;
    activeSubTab = activeGearSlot;
    setActiveSubTab = setActiveGearSlot;
    currentItems = (gearBySlot[activeGearSlot] || []).sort((a, b) => a.name.localeCompare(b.name));
    currentProgress = getProgress(currentItems);
  } else {
    subTabs = WEAPON_CATEGORIES;
    activeSubTab = activeWeaponCat;
    setActiveSubTab = setActiveWeaponCat;
    currentItems = (weaponsByCat[activeWeaponCat] || []).sort((a, b) => a.name.localeCompare(b.name));
    currentProgress = getProgress(currentItems);
  }

  return (
    <div className="named-items-section">
      <div className="named-top-tabs">
        <button
          className={`named-top-tab ${activeView === 'weapons' ? 'active' : ''}`}
          onClick={() => setActiveView('weapons')}
        >
          Weapons ({namedWeapons.length})
        </button>
        <button
          className={`named-top-tab ${activeView === 'gear' ? 'active' : ''}`}
          onClick={() => setActiveView('gear')}
        >
          Gear ({namedItems.length})
        </button>
      </div>

      <div className="named-slot-tabs">
        {subTabs.map(({ key, label }) => {
          const items = activeView === 'gear' ? (gearBySlot[key] || []) : (weaponsByCat[key] || []);
          const progress = getProgress(items);
          return (
            <button
              key={key}
              className={`slot-tab-btn ${activeSubTab === key ? 'active' : ''}`}
              onClick={() => setActiveSubTab(key)}
            >
              {label}
              <span className="slot-count">({progress.owned}/{progress.total})</span>
            </button>
          );
        })}
      </div>

      <div className="named-items-progress-bar">
        <div className="named-progress-fill" style={{
          width: currentProgress.total > 0
            ? `${(currentProgress.owned / currentProgress.total) * 100}%`
            : '0%'
        }} />
        <span className="named-progress-text">
          {currentProgress.owned} / {currentProgress.total} collected
        </span>
      </div>

      <div className="named-items-list">
        {currentItems.map(item => (
          <div key={item.id} className="named-item-row">
            <span className="named-item-name">{item.name}</span>
            <ItemCheckbox
              item={item}
              isOwned={ownedItems.has(item.id)}
              onToggle={onToggleOwnership}
            />
          </div>
        ))}
        {currentItems.length === 0 && (
          <div className="named-items-empty">No items found for this category.</div>
        )}
      </div>
    </div>
  );
};

export default NamedItemsSection;
