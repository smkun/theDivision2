import React, { useState } from 'react';
import ItemCheckbox from './ItemCheckbox';
import './NamedItemsSection.css';

const WEAPON_CATEGORIES = [
  { key: 'assault_rifles', label: 'Assault Rifles', min: 500, max: 519 },
  { key: 'smgs', label: 'SMGs', min: 520, max: 530 },
  { key: 'lmgs', label: 'LMGs', min: 531, max: 543 },
  { key: 'shotguns', label: 'Shotguns', min: 556, max: 568 },
  { key: 'marksman_rifles', label: 'Marksman Rifles', min: 569, max: 580 },
  { key: 'rifles', label: 'Rifles', min: 544, max: 555 },
  { key: 'pistols', label: 'Pistols', min: 581, max: 599 },
];

const NamedItemsSection = ({ namedWeapons, ownedItems, onToggleOwnership }) => {
  const [activeWeaponCat, setActiveWeaponCat] = useState('assault_rifles');

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

  const currentItems = (weaponsByCat[activeWeaponCat] || []).sort((a, b) => a.name.localeCompare(b.name));
  const currentProgress = getProgress(currentItems);

  return (
    <div className="named-items-section">
      <div className="named-slot-tabs">
        {WEAPON_CATEGORIES.map(({ key, label }) => {
          const items = weaponsByCat[key] || [];
          const progress = getProgress(items);
          return (
            <button
              key={key}
              className={`slot-tab-btn ${activeWeaponCat === key ? 'active' : ''}`}
              onClick={() => setActiveWeaponCat(key)}
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
