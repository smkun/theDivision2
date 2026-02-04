import React from 'react';
import ItemCheckbox from './ItemCheckbox';
import './BrandSetsTable.css';

const SLOT_ORDER = ['mask', 'chest', 'holster', 'backpack', 'gloves', 'kneepads'];

const BrandSetsTable = ({ brandSets, namedItems = [], ownedItems, onToggleOwnership }) => {
  // Create a map of brand+slot -> named item for quick lookup
  const namedItemsByBrandSlot = {};
  namedItems.forEach(item => {
    if (item.set_name && item.slot) {
      const key = `${item.set_name}:${item.slot}`;
      if (!namedItemsByBrandSlot[key]) {
        namedItemsByBrandSlot[key] = [];
      }
      namedItemsByBrandSlot[key].push(item);
    }
  });

  // Convert brandSets object to sorted array (alphabetically by brand name)
  const sortedSets = Object.entries(brandSets)
    .map(([setName, pieces]) => {
      // Create a map of slot -> piece for quick lookup
      const piecesBySlot = {};
      pieces.forEach(piece => {
        piecesBySlot[piece.slot] = piece;
      });

      const ownedCount = pieces.filter(p => ownedItems.has(p.id)).length;
      const progressPercent = (ownedCount / 6) * 100;

      return {
        setName,
        pieces,
        piecesBySlot,
        ownedCount,
        progressPercent
      };
    })
    .sort((a, b) => a.setName.localeCompare(b.setName));

  return (
    <div className="brand-sets-table-container">
      <table className="brand-sets-table">
        <thead>
          <tr>
            <th className="set-name-col">Brand</th>
            <th className="progress-col">Progress</th>
            {SLOT_ORDER.map(slot => (
              <th key={slot} className="slot-col">
                {slot.charAt(0).toUpperCase() + slot.slice(1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedSets.map(({ setName, piecesBySlot, ownedCount, progressPercent }) => (
            <tr key={setName}>
              <td className="set-name-cell">
                <span className="set-name">{setName}</span>
              </td>
              <td className="progress-cell">
                <div className="progress-wrapper">
                  <span className="progress-text">{ownedCount}/6</span>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </td>
              {SLOT_ORDER.map(slot => {
                const piece = piecesBySlot[slot];
                const namedForSlot = namedItemsByBrandSlot[`${setName}:${slot}`] || [];
                return (
                  <td key={slot} className="checkbox-cell">
                    {piece && (
                      <div className="slot-content">
                        {/* Generic brand piece on top */}
                        <div className="generic-piece-row">
                          <ItemCheckbox
                            item={piece}
                            isOwned={ownedItems.has(piece.id)}
                            onToggle={onToggleOwnership}
                          />
                          {namedForSlot.length > 0 && (
                            <span className="generic-label">Generic</span>
                          )}
                        </div>
                        {/* Named items below */}
                        {namedForSlot.map(namedItem => (
                          <div key={namedItem.id} className="named-item-row">
                            <ItemCheckbox
                              item={namedItem}
                              isOwned={ownedItems.has(namedItem.id)}
                              onToggle={onToggleOwnership}
                            />
                            <span className="named-item-name">{namedItem.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BrandSetsTable;
