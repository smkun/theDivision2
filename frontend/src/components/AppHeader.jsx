import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import './AppHeader.css';

const AppHeader = () => {
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
    </header>
  );
};

export default AppHeader;
