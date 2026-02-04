import React, { useState, useEffect } from 'react';
import { referenceAPI } from '@/services/api';
import './BuildEditor.css';

const GEAR_SLOTS = ['mask', 'chest', 'holster', 'backpack', 'gloves', 'kneepads'];
const WEAPON_SLOTS = ['primary', 'secondary', 'sidearm'];

const BuildEditor = ({ build, catalog, ownedItems, onSave, onCancel }) => {
  const [name, setName] = useState(build?.name || '');
  const [isPublic, setIsPublic] = useState(build?.is_public || false);
  const [specializationId, setSpecializationId] = useState(build?.specialization_id || '');
  const [skill1Id, setSkill1Id] = useState(build?.skill1_id || '');
  const [skill2Id, setSkill2Id] = useState(build?.skill2_id || '');
  const [notes, setNotes] = useState(build?.notes || '');

  const [gearSlots, setGearSlots] = useState(() => {
    const initial = {};
    GEAR_SLOTS.forEach(slot => {
      const existing = build?.gear?.find(g => g.slot === slot);
      initial[slot] = {
        item_id: existing?.item_id || '',
        item_name: existing?.item_name || '',
        core_attribute_id: existing?.core_attribute_id || '',
        minor_attribute1_id: existing?.minor_attribute1_id || '',
        minor_attribute2_id: existing?.minor_attribute2_id || '',
        mod_attribute_id: existing?.mod_attribute_id || '',
        talent_id: existing?.talent_id || '',
      };
    });
    return initial;
  });

  const [weaponSlots, setWeaponSlots] = useState(() => {
    const initial = {};
    WEAPON_SLOTS.forEach(slot => {
      const existing = build?.weapons?.find(w => w.slot === slot);
      initial[slot] = {
        item_id: existing?.item_id || '',
        item_name: existing?.item_name || '',
        talent_id: existing?.talent_id || '',
      };
    });
    return initial;
  });

  // Reference data
  const [attributes, setAttributes] = useState({});
  const [talents, setTalents] = useState({});
  const [skills, setSkills] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loadingRef, setLoadingRef] = useState(true);

  useEffect(() => {
    loadReferenceData();
  }, []);

  const loadReferenceData = async () => {
    try {
      const [attrData, talentData, skillData, specData] = await Promise.all([
        referenceAPI.getAttributes(),
        referenceAPI.getTalents(),
        referenceAPI.getSkills(),
        referenceAPI.getSpecializations(),
      ]);
      setAttributes(attrData);
      setTalents(talentData);
      setSkills(skillData);
      setSpecializations(specData);
    } catch (err) {
      console.error('Failed to load reference data:', err);
    } finally {
      setLoadingRef(false);
    }
  };

  // Get items from catalog filtered by slot
  const getGearOptions = (slot) => {
    return catalog.filter(item =>
      item.slot === slot &&
      ['armor_set_piece', 'exotic_armor', 'named_item', 'brand_piece'].includes(item.type)
    ).sort((a, b) => a.name.localeCompare(b.name));
  };

  const getWeaponOptions = () => {
    return catalog.filter(item =>
      ['exotic_weapon', 'named_weapon'].includes(item.type)
    ).sort((a, b) => a.name.localeCompare(b.name));
  };

  const updateGearSlot = (slot, field, value) => {
    setGearSlots(prev => ({
      ...prev,
      [slot]: { ...prev[slot], [field]: value }
    }));
  };

  const updateWeaponSlot = (slot, field, value) => {
    setWeaponSlots(prev => ({
      ...prev,
      [slot]: { ...prev[slot], [field]: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const buildData = {
      name,
      is_public: isPublic,
      specialization_id: specializationId || null,
      skill1_id: skill1Id || null,
      skill2_id: skill2Id || null,
      notes,
      gear: GEAR_SLOTS.map(slot => ({
        slot,
        ...gearSlots[slot],
        item_id: gearSlots[slot].item_id || null,
        item_name: gearSlots[slot].item_name || null,
        core_attribute_id: gearSlots[slot].core_attribute_id || null,
        minor_attribute1_id: gearSlots[slot].minor_attribute1_id || null,
        minor_attribute2_id: gearSlots[slot].minor_attribute2_id || null,
        mod_attribute_id: gearSlots[slot].mod_attribute_id || null,
        talent_id: gearSlots[slot].talent_id || null,
      })),
      weapons: WEAPON_SLOTS.map(slot => ({
        slot,
        ...weaponSlots[slot],
        item_id: weaponSlots[slot].item_id || null,
        item_name: weaponSlots[slot].item_name || null,
        talent_id: weaponSlots[slot].talent_id || null,
      })),
    };

    onSave(buildData);
  };

  const getOwnershipClass = (itemId) => {
    if (!itemId) return '';
    return ownedItems.has(parseInt(itemId)) ? 'owned' : 'not-owned';
  };

  if (loadingRef) {
    return (
      <div className="build-editor">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="build-editor">
      <form onSubmit={handleSubmit}>
        <div className="editor-header">
          <h2>{build ? 'Edit Build' : 'Create New Build'}</h2>
          <div className="header-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={!name.trim()}>
              Save Build
            </button>
          </div>
        </div>

        <div className="editor-section basic-info">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="build-name">Build Name *</label>
              <input
                id="build-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter build name..."
                required
              />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                Make this build public
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="specialization">Specialization</label>
              <select
                id="specialization"
                value={specializationId}
                onChange={(e) => setSpecializationId(e.target.value)}
              >
                <option value="">-- Select Specialization --</option>
                {specializations.map(spec => (
                  <option key={spec.id} value={spec.id}>{spec.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="skill1">Skill 1</label>
              <select
                id="skill1"
                value={skill1Id}
                onChange={(e) => setSkill1Id(e.target.value)}
              >
                <option value="">-- Select Skill --</option>
                {skills.map(skill => (
                  <option key={skill.id} value={skill.id}>{skill.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="skill2">Skill 2</label>
              <select
                id="skill2"
                value={skill2Id}
                onChange={(e) => setSkill2Id(e.target.value)}
              >
                <option value="">-- Select Skill --</option>
                {skills.map(skill => (
                  <option key={skill.id} value={skill.id}>{skill.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="editor-section gear-section">
          <h3>Gear</h3>
          <div className="gear-grid">
            {GEAR_SLOTS.map(slot => (
              <div key={slot} className={`gear-slot-card ${getOwnershipClass(gearSlots[slot].item_id)}`}>
                <h4>{slot.charAt(0).toUpperCase() + slot.slice(1)}</h4>

                <div className="form-group">
                  <label>Item</label>
                  <select
                    value={gearSlots[slot].item_id}
                    onChange={(e) => updateGearSlot(slot, 'item_id', e.target.value)}
                  >
                    <option value="">-- Select from catalog --</option>
                    {getGearOptions(slot).map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} {item.set_name ? `(${item.set_name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Or enter custom name</label>
                  <input
                    type="text"
                    value={gearSlots[slot].item_name}
                    onChange={(e) => updateGearSlot(slot, 'item_name', e.target.value)}
                    placeholder="Custom item name..."
                  />
                </div>

                <div className="form-group">
                  <label>Core Attribute</label>
                  <select
                    value={gearSlots[slot].core_attribute_id}
                    onChange={(e) => updateGearSlot(slot, 'core_attribute_id', e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {(attributes.core || []).map(attr => (
                      <option key={attr.id} value={attr.id}>{attr.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Minor Attribute 1</label>
                  <select
                    value={gearSlots[slot].minor_attribute1_id}
                    onChange={(e) => updateGearSlot(slot, 'minor_attribute1_id', e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {(attributes.minor || []).map(attr => (
                      <option key={attr.id} value={attr.id}>{attr.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Minor Attribute 2</label>
                  <select
                    value={gearSlots[slot].minor_attribute2_id}
                    onChange={(e) => updateGearSlot(slot, 'minor_attribute2_id', e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {(attributes.minor || []).map(attr => (
                      <option key={attr.id} value={attr.id}>{attr.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Mod</label>
                  <select
                    value={gearSlots[slot].mod_attribute_id}
                    onChange={(e) => updateGearSlot(slot, 'mod_attribute_id', e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {(attributes.mod || []).map(attr => (
                      <option key={attr.id} value={attr.id}>{attr.name}</option>
                    ))}
                  </select>
                </div>

                {(slot === 'chest' || slot === 'backpack') && (
                  <div className="form-group">
                    <label>Talent</label>
                    <select
                      value={gearSlots[slot].talent_id}
                      onChange={(e) => updateGearSlot(slot, 'talent_id', e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      {(talents[slot] || []).map(talent => (
                        <option key={talent.id} value={talent.id}>{talent.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="editor-section weapons-section">
          <h3>Weapons</h3>
          <div className="weapons-grid">
            {WEAPON_SLOTS.map(slot => (
              <div key={slot} className={`weapon-slot-card ${getOwnershipClass(weaponSlots[slot].item_id)}`}>
                <h4>{slot.charAt(0).toUpperCase() + slot.slice(1)}</h4>

                <div className="form-group">
                  <label>Weapon</label>
                  <select
                    value={weaponSlots[slot].item_id}
                    onChange={(e) => updateWeaponSlot(slot, 'item_id', e.target.value)}
                  >
                    <option value="">-- Select from catalog --</option>
                    {getWeaponOptions().map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Or enter custom name</label>
                  <input
                    type="text"
                    value={weaponSlots[slot].item_name}
                    onChange={(e) => updateWeaponSlot(slot, 'item_name', e.target.value)}
                    placeholder="Custom weapon name..."
                  />
                </div>

                <div className="form-group">
                  <label>Talent</label>
                  <select
                    value={weaponSlots[slot].talent_id}
                    onChange={(e) => updateWeaponSlot(slot, 'talent_id', e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {(talents.weapon || []).map(talent => (
                      <option key={talent.id} value={talent.id}>{talent.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="editor-section notes-section">
          <h3>Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this build..."
            rows={4}
          />
        </div>

        <div className="editor-footer">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="save-btn" disabled={!name.trim()}>
            Save Build
          </button>
        </div>
      </form>
    </div>
  );
};

export default BuildEditor;
