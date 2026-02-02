import React, { useState } from 'react';
import ItemCheckbox from './ItemCheckbox';
import './ExoticsSection.css';

const ExoticsSection = ({ exotics, ownedItems, onToggleOwnership }) => {
  const [activeTab, setActiveTab] = useState('weapons');

  // Separate weapons and armor
  const weapons = exotics.filter(item => item.type === 'exotic_weapon');
  const armor = exotics.filter(item => item.type === 'exotic_armor');

  const displayItems = activeTab === 'weapons' ? weapons : armor;

  // Group by category (for weapons) or slot (for armor)
  const groupedItems = displayItems.reduce((acc, item) => {
    let category;
    if (item.type === 'exotic_weapon') {
      // Determine weapon category based on sort_order ranges
      if (item.sort_order >= 200 && item.sort_order < 210) category = 'Assault Rifles';
      else if (item.sort_order >= 210 && item.sort_order < 220) category = 'SMGs';
      else if (item.sort_order >= 220 && item.sort_order < 230) category = 'LMGs';
      else if (item.sort_order >= 230 && item.sort_order < 240) category = 'Rifles';
      else if (item.sort_order >= 240 && item.sort_order < 250) category = 'Shotguns';
      else if (item.sort_order >= 250 && item.sort_order < 260) category = 'Marksman Rifles';
      else if (item.sort_order >= 260 && item.sort_order < 270) category = 'Pistols';
      else category = 'Other';
    } else {
      // For armor, capitalize slot
      category = item.slot.charAt(0).toUpperCase() + item.slot.slice(1);
    }

    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  // Sort categories in a logical order
  const categoryOrder = {
    // Weapons
    'Assault Rifles': 1,
    'SMGs': 2,
    'LMGs': 3,
    'Shotguns': 4,
    'Rifles': 5,
    'Marksman Rifles': 6,
    'Pistols': 7,
    // Armor
    'Mask': 8,
    'Chest': 9,
    'Holster': 10,
    'Backpack': 11,
    'Gloves': 12,
    'Kneepads': 13,
  };

  const sortedCategories = Object.entries(groupedItems).sort((a, b) => {
    return (categoryOrder[a[0]] || 99) - (categoryOrder[b[0]] || 99);
  });

  return (
    <div className="exotics-section">
      <div className="exotic-tabs">
        <button
          className={`tab-btn ${activeTab === 'weapons' ? 'active' : ''}`}
          onClick={() => setActiveTab('weapons')}
        >
          Weapons ({weapons.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'armor' ? 'active' : ''}`}
          onClick={() => setActiveTab('armor')}
        >
          Armor ({armor.length})
        </button>
      </div>

      <div className="exotics-table-container">
        <table className="exotics-table">
          <thead>
            <tr>
              <th className="category-col">Category</th>
              <th className="items-col">Items</th>
            </tr>
          </thead>
          <tbody>
            {sortedCategories.map(([category, items]) => (
              <tr key={category}>
                <td className="category-cell">
                  <span className="category-name">{category}</span>
                </td>
                <td className="items-cell">
                  <div className="items-row">
                    {[...items].sort((a, b) => a.name.localeCompare(b.name)).map((item, index) => (
                      <React.Fragment key={item.id}>
                        <div className="item-with-checkbox">
                          <span className="exotic-name">{item.name}</span>
                          <ItemCheckbox
                            item={item}
                            isOwned={ownedItems.has(item.id)}
                            onToggle={onToggleOwnership}
                          />
                        </div>
                        {index < items.length - 1 && <span className="item-separator">, </span>}
                      </React.Fragment>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExoticsSection;
