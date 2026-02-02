import React from 'react';
import ItemCheckbox from './ItemCheckbox';
import './ArmorSetsTable.css';

const SLOT_ORDER = ['mask', 'chest', 'holster', 'backpack', 'gloves', 'kneepads'];

// Helper function to get the image filename from set name
const getSetImagePath = (setName) => {
  // Map set names to their image filenames
  const nameToFile = {
    'Aces & Eights': 'Aces_%26_Eights.webp',
    'Aegis': 'Aegis.webp',
    'Breaking Point': 'Breaking_Point.webp',
    'Cavalier': 'Cavalier.webp',
    'Eclipse Protocol': 'Eclipse_Protocol.webp',
    'Exuro': 'Exuro.webp',
    'Foundry Bulwark': 'Foundry_Bulwark.webp',
    'Future Initiative': 'Future_Initiative.webp',
    'Hard Wired': 'Hard_Wire.webp',
    'Heartbreaker': 'Heartbreaker.webp',
    'Hotshot': 'Hotshot.webp',
    "Hunter's Fury": "Hunter%27s_Fury.webp",
    "Negotiator's Dilemma": "Negotiator%3Fs_Dilemma.webp",
    'Ongoing Directive': 'Ongoing_Directive.webp',
    'Refactor': 'Refactor.webp',
    'Rigger': 'Rigger_GS.webp',
    "Striker's Battlegear": "Striker%27s_Battlegear.webp",
    'System Corruption': 'System_Corruption.webp',
    'Tip of the Spear': 'Tip_Of_The_Speark.webp',
    'True Patriot': 'True_Patriot.webp',
    'Umbra Initiative': 'Umbra_Initiative.webp',
    'Virtuoso': 'Virtuoso.webp',
  };
  
  const filename = nameToFile[setName];
  return filename ? `/src/assets/armor-sets/${filename}` : null;
};

const ArmorSetsTable = ({ armorSets, ownedItems, onToggleOwnership }) => {
  // Convert armorSets object to sorted array (alphabetically by set name)
  const sortedSets = Object.entries(armorSets)
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
    <div className="armor-sets-table-container">
      <table className="armor-sets-table">
        <thead>
          <tr>
            <th className="set-name-col">Set Name</th>
            <th className="progress-col">Progress</th>
            {SLOT_ORDER.map(slot => (
              <th key={slot} className="slot-col">
                {slot.charAt(0).toUpperCase() + slot.slice(1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedSets.map(({ setName, piecesBySlot, ownedCount, progressPercent }) => {
            const imagePath = getSetImagePath(setName);
            return (
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
                  return (
                    <td key={slot} className="checkbox-cell">
                      {piece && (
                        <ItemCheckbox
                          item={piece}
                          isOwned={ownedItems.has(piece.id)}
                          onToggle={onToggleOwnership}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ArmorSetsTable;