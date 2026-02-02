import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { catalogAPI, userItemsAPI, setAuthToken } from '@/services/api';
import AppHeader from './AppHeader';
import ArmorSetsTable from './ArmorSetsTable';
import ExoticsSection from './ExoticsSection';
import NamedItemsSection from './NamedItemsSection';
import './MainApp.css';

const MainApp = () => {
  const { getIdToken } = useAuth();
  
  const [catalog, setCatalog] = useState([]);
  const [ownedItems, setOwnedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('armor-sets'); // 'armor-sets', 'exotics', or 'named'

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get and set auth token
      const token = await getIdToken();
      setAuthToken(token);

      // Load catalog and owned items in parallel
      const [catalogData, ownedData] = await Promise.all([
        catalogAPI.getAll(),
        userItemsAPI.getOwned(),
      ]);

      setCatalog(catalogData);
      setOwnedItems(new Set(ownedData.map(item => item.item_id)));
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOwnership = async (itemId, owned) => {
    // Optimistic update
    setOwnedItems(prev => {
      const newSet = new Set(prev);
      if (owned) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });

    try {
      await userItemsAPI.updateOwnership(itemId, owned);
    } catch (err) {
      // Revert on error
      setOwnedItems(prev => {
        const newSet = new Set(prev);
        if (owned) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        return newSet;
      });
      throw err;
    }
  };

  // Filter items based on search and missing toggle
  const filterItems = (items) => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMissing = !showMissingOnly || !ownedItems.has(item.id);
      return matchesSearch && matchesMissing;
    });
  };

  // Group armor set pieces by set name
  const armorSets = catalog
    .filter(item => item.type === 'armor_set_piece')
    .reduce((acc, item) => {
      if (!acc[item.set_name]) {
        acc[item.set_name] = [];
      }
      acc[item.set_name].push(item);
      return acc;
    }, {});

  // Get exotics (weapons + armor)
  const exotics = catalog.filter(item =>
    item.type === 'exotic_weapon' || item.type === 'exotic_armor'
  );

  // Get named items (gear + weapons)
  const namedItems = catalog.filter(item => item.type === 'named_item');
  const namedWeapons = catalog.filter(item => item.type === 'named_weapon');

  if (loading) {
    return (
      <div className="main-app">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading your gear tracker...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-app">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={loadData} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-app">
      <AppHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showMissingOnly={showMissingOnly}
        onToggleMissing={setShowMissingOnly}
      />

      <main className="app-content">
        <nav className="main-nav">
          <button
            className={`nav-tab ${activeTab === 'armor-sets' ? 'active' : ''}`}
            onClick={() => setActiveTab('armor-sets')}
          >
            Armor Sets
          </button>
          <button
            className={`nav-tab ${activeTab === 'exotics' ? 'active' : ''}`}
            onClick={() => setActiveTab('exotics')}
          >
            Exotics
          </button>
          <button
            className={`nav-tab ${activeTab === 'named' ? 'active' : ''}`}
            onClick={() => setActiveTab('named')}
          >
            Named Items
          </button>
        </nav>

        {activeTab === 'armor-sets' && (
          <section className="armor-sets-section">
            <ArmorSetsTable
              armorSets={armorSets}
              ownedItems={ownedItems}
              onToggleOwnership={handleToggleOwnership}
            />
          </section>
        )}

        {activeTab === 'exotics' && (
          <ExoticsSection
            exotics={filterItems(exotics)}
            ownedItems={ownedItems}
            onToggleOwnership={handleToggleOwnership}
          />
        )}

        {activeTab === 'named' && (
          <NamedItemsSection
            namedItems={filterItems(namedItems)}
            namedWeapons={filterItems(namedWeapons)}
            ownedItems={ownedItems}
            onToggleOwnership={handleToggleOwnership}
          />
        )}
      </main>
    </div>
  );
};

export default MainApp;
