import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import './AppHeader.css';

const AppHeader = ({ searchTerm, onSearchChange, showMissingOnly, onToggleMissing }) => {
  const { currentUser, signOut } = useAuth();

  return (
    <header className="app-header">
      <div className="header-top">
        <h1 className="app-title">Division 2 Gear Tracker</h1>
        <div className="user-section">
          <span className="user-email">{currentUser?.email}</span>
          <button onClick={signOut} className="sign-out-btn">Sign Out</button>
        </div>
      </div>
      
      <div className="header-controls">
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        
        <label className="toggle-missing">
          <input
            type="checkbox"
            checked={showMissingOnly}
            onChange={(e) => onToggleMissing(e.target.checked)}
          />
          <span>Show Missing Only</span>
        </label>
      </div>
    </header>
  );
};

export default AppHeader;
