import React, { useState, useEffect } from 'react';
import { buildsAPI } from '@/services/api';
import BuildEditor from './BuildEditor';
import './BuildsSection.css';

const BuildsSection = ({ ownedItems, catalog }) => {
  const [userBuilds, setUserBuilds] = useState([]);
  const [publicBuilds, setPublicBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('my-builds'); // 'my-builds' or 'public'
  const [editingBuild, setEditingBuild] = useState(null); // null = list view, 'new' = new build, or build object
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    loadBuilds();
  }, []);

  const loadBuilds = async () => {
    try {
      setLoading(true);
      setError(null);
      const [userBuildsData, publicBuildsData] = await Promise.all([
        buildsAPI.getUserBuilds(),
        buildsAPI.getPublicBuilds(),
      ]);
      setUserBuilds(userBuildsData);
      setPublicBuilds(publicBuildsData);
    } catch (err) {
      console.error('Failed to load builds:', err);
      setError('Failed to load builds. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBuild = () => {
    setEditingBuild('new');
  };

  const handleEditBuild = (build) => {
    setEditingBuild(build);
  };

  const handleDeleteBuild = async (buildId) => {
    try {
      await buildsAPI.deleteBuild(buildId);
      setUserBuilds(prev => prev.filter(b => b.id !== buildId));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Failed to delete build:', err);
      alert('Failed to delete build. Please try again.');
    }
  };

  const handleDuplicateBuild = async (buildId) => {
    try {
      const newBuild = await buildsAPI.duplicateBuild(buildId);
      setUserBuilds(prev => [...prev, newBuild]);
    } catch (err) {
      console.error('Failed to duplicate build:', err);
      alert('Failed to duplicate build. Please try again.');
    }
  };

  const handleCopyPublicBuild = async (buildId) => {
    try {
      const newBuild = await buildsAPI.copyPublicBuild(buildId);
      setUserBuilds(prev => [...prev, newBuild]);
      alert('Build copied to your builds!');
    } catch (err) {
      console.error('Failed to copy build:', err);
      alert('Failed to copy build. Please try again.');
    }
  };

  const handleSaveBuild = async (buildData) => {
    try {
      if (editingBuild === 'new') {
        const newBuild = await buildsAPI.createBuild(buildData);
        setUserBuilds(prev => [...prev, newBuild]);
      } else {
        const updated = await buildsAPI.updateBuild(editingBuild.id, buildData);
        setUserBuilds(prev => prev.map(b => b.id === editingBuild.id ? updated : b));
      }
      setEditingBuild(null);
      loadBuilds(); // Refresh to get full build data
    } catch (err) {
      console.error('Failed to save build:', err);
      alert('Failed to save build. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingBuild(null);
  };

  // Calculate ownership status for a build
  const getOwnershipStatus = (build) => {
    if (!build.gear || !build.weapons) return { owned: 0, total: 0, status: 'unknown' };

    let owned = 0;
    let total = 0;

    // Check gear slots
    build.gear.forEach(gear => {
      if (gear.item_id) {
        total++;
        if (ownedItems.has(gear.item_id)) owned++;
      }
    });

    // Check weapon slots
    build.weapons.forEach(weapon => {
      if (weapon.item_id) {
        total++;
        if (ownedItems.has(weapon.item_id)) owned++;
      }
    });

    if (total === 0) return { owned: 0, total: 0, status: 'empty' };
    if (owned === total) return { owned, total, status: 'complete' };
    if (owned === 0) return { owned, total, status: 'missing' };
    return { owned, total, status: 'partial' };
  };

  if (editingBuild !== null) {
    return (
      <BuildEditor
        build={editingBuild === 'new' ? null : editingBuild}
        catalog={catalog}
        ownedItems={ownedItems}
        onSave={handleSaveBuild}
        onCancel={handleCancelEdit}
      />
    );
  }

  if (loading) {
    return (
      <div className="builds-section">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading builds...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="builds-section">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={loadBuilds} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="builds-section">
      <div className="builds-header">
        <nav className="builds-sub-nav">
          <button
            className={`sub-nav-tab ${activeSubTab === 'my-builds' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('my-builds')}
          >
            My Builds ({userBuilds.length})
          </button>
          <button
            className={`sub-nav-tab ${activeSubTab === 'public' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('public')}
          >
            Public Builds ({publicBuilds.length})
          </button>
        </nav>
        {activeSubTab === 'my-builds' && (
          <button className="create-build-btn" onClick={handleCreateBuild}>
            + New Build
          </button>
        )}
      </div>

      {activeSubTab === 'my-builds' && (
        <div className="builds-grid">
          {userBuilds.length === 0 ? (
            <div className="no-builds">
              <p>You haven't created any builds yet.</p>
              <button className="create-build-btn" onClick={handleCreateBuild}>
                Create Your First Build
              </button>
            </div>
          ) : (
            userBuilds.map(build => {
              const ownership = getOwnershipStatus(build);
              return (
                <div key={build.id} className={`build-card ${ownership.status}`}>
                  <div className="build-card-header">
                    <h3 className="build-name">{build.name}</h3>
                    {build.is_public && <span className="public-badge">Public</span>}
                  </div>
                  <div className="build-card-body">
                    {build.specialization_name && (
                      <p className="build-spec">Specialization: {build.specialization_name}</p>
                    )}
                    <div className={`ownership-indicator ${ownership.status}`}>
                      {ownership.total > 0 ? (
                        <span>{ownership.owned}/{ownership.total} items owned</span>
                      ) : (
                        <span>No items specified</span>
                      )}
                    </div>
                  </div>
                  <div className="build-card-actions">
                    <button className="action-btn edit" onClick={() => handleEditBuild(build)}>
                      Edit
                    </button>
                    <button className="action-btn duplicate" onClick={() => handleDuplicateBuild(build.id)}>
                      Duplicate
                    </button>
                    {confirmDelete === build.id ? (
                      <>
                        <button className="action-btn confirm-delete" onClick={() => handleDeleteBuild(build.id)}>
                          Confirm
                        </button>
                        <button className="action-btn cancel" onClick={() => setConfirmDelete(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button className="action-btn delete" onClick={() => setConfirmDelete(build.id)}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeSubTab === 'public' && (
        <div className="builds-grid">
          {publicBuilds.length === 0 ? (
            <div className="no-builds">
              <p>No public builds available yet.</p>
            </div>
          ) : (
            publicBuilds.map(build => {
              const ownership = getOwnershipStatus(build);
              return (
                <div key={build.id} className={`build-card public ${ownership.status}`}>
                  <div className="build-card-header">
                    <h3 className="build-name">{build.name}</h3>
                    <span className="author">by {build.author || 'Anonymous'}</span>
                  </div>
                  <div className="build-card-body">
                    {build.specialization_name && (
                      <p className="build-spec">Specialization: {build.specialization_name}</p>
                    )}
                    <div className={`ownership-indicator ${ownership.status}`}>
                      {ownership.total > 0 ? (
                        <span>{ownership.owned}/{ownership.total} items you own</span>
                      ) : (
                        <span>No items specified</span>
                      )}
                    </div>
                  </div>
                  <div className="build-card-actions">
                    <button className="action-btn copy" onClick={() => handleCopyPublicBuild(build.id)}>
                      Copy to My Builds
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default BuildsSection;
