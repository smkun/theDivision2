import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { catalogAPI, userItemsAPI, setAuthToken } from '@/services/api';
import AppHeader from './AppHeader';
import ArmorSetsTable from './ArmorSetsTable';
import BrandSetsTable from './BrandSetsTable';
import ExoticsSection from './ExoticsSection';
import NamedItemsSection from './NamedItemsSection';
import BuildsSection from './BuildsSection';
import './MainApp.css';

const MainApp = () => {
  const { getIdToken } = useAuth();
  
  const [catalog, setCatalog] = useState([]);
  const [ownedItems, setOwnedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('armor-sets');

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

  // Group brand pieces by brand name
  const brandSets = catalog
    .filter(item => item.type === 'brand_piece')
    .reduce((acc, item) => {
      if (!acc[item.set_name]) {
        acc[item.set_name] = [];
      }
      acc[item.set_name].push(item);
      return acc;
    }, {});

  // Get named items (gear + weapons) - gear items shown within brand sets
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
      <AppHeader />

      <main className="app-content">
        <nav className="main-nav">
          <button
            className={`nav-tab ${activeTab === 'armor-sets' ? 'active' : ''}`}
            onClick={() => setActiveTab('armor-sets')}
          >
            Gear Sets
          </button>
          <button
            className={`nav-tab ${activeTab === 'brand-sets' ? 'active' : ''}`}
            onClick={() => setActiveTab('brand-sets')}
          >
            Brand Sets
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
            Named Weapons
          </button>
          <button
            className={`nav-tab ${activeTab === 'builds' ? 'active' : ''}`}
            onClick={() => setActiveTab('builds')}
          >
            My Builds
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

        {activeTab === 'brand-sets' && (
          <section className="brand-sets-section">
            <BrandSetsTable
              brandSets={brandSets}
              namedItems={namedItems}
              ownedItems={ownedItems}
              onToggleOwnership={handleToggleOwnership}
            />
          </section>
        )}

        {activeTab === 'exotics' && (
          <ExoticsSection
            exotics={exotics}
            ownedItems={ownedItems}
            onToggleOwnership={handleToggleOwnership}
          />
        )}

        {activeTab === 'named' && (
          <NamedItemsSection
            namedWeapons={namedWeapons}
            ownedItems={ownedItems}
            onToggleOwnership={handleToggleOwnership}
          />
        )}

        {activeTab === 'builds' && (
          <BuildsSection
            ownedItems={ownedItems}
            catalog={catalog}
          />
        )}
      </main>
    </div>
  );
};

export default MainApp;
