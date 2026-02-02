import React, { useState } from 'react';
import './ItemCheckbox.css';

const ItemCheckbox = ({ item, isOwned, onToggle }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = async () => {
    const newOwnedState = !isOwned;
    setIsUpdating(true);
    setError(null);

    try {
      await onToggle(item.id, newOwnedState);
    } catch (err) {
      setError('Failed to update');
      console.error('Failed to update item:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="item-checkbox-container">
      <label className={`item-checkbox ${isUpdating ? 'updating' : ''}`}>
        <input
          type="checkbox"
          checked={isOwned}
          onChange={handleChange}
          disabled={isUpdating}
        />
        <span className="checkbox-custom" />
      </label>
      {error && <span className="checkbox-error" title={error}>⚠</span>}
    </div>
  );
};

export default ItemCheckbox;
