import React, { useState } from 'react';
import ItemCheckbox from './ItemCheckbox';
import './ArmorSetCard.css';

const SLOT_ORDER = ['mask', 'chest', 'holster', 'backpack', 'gloves', 'kneepads'];

const ArmorSetCard = ({ setName, pieces, ownedItems, onToggleOwnership }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Sort pieces by slot order
  const sortedPieces = [...pieces].sort((a, b) => {
    return SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot);
  });

  const ownedCount = pieces.filter(p => ownedItems.has(p.id)).length;
  const totalCount = pieces.length;
  const progressPercent = (ownedCount / totalCount) * 100;

  return (
    <div className="armor-set-card">
      <div 
        className="set-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="set-info">
          <h3 className="set-name">{setName}</h3>
          <span className="set-progress">{ownedCount}/{totalCount}</span>
        </div>
        
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        <button className="expand-btn" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="set-pieces">
          {sortedPieces.map((piece) => (
            <div key={piece.id} className="piece-row">
              <ItemCheckbox
                item={piece}
                isOwned={ownedItems.has(piece.id)}
                onToggle={onToggleOwnership}
              />
              <span className="piece-name">{piece.slot}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArmorSetCard;
