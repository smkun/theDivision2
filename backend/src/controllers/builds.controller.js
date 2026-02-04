// Builds Controller
// Handles CRUD operations for user builds

const db = require('../config/database');

/**
 * GET /api/me/builds
 * Returns all builds for the authenticated user (summary only)
 */
async function getUserBuilds(req, res) {
  try {
    const connection = await db.getConnection();

    try {
      const [builds] = await connection.query(
        `SELECT b.id, b.name, b.is_public, b.created_at, b.updated_at,
                s.name as specialization_name
         FROM builds b
         LEFT JOIN specializations s ON b.specialization_id = s.id
         WHERE b.user_id = ?
         ORDER BY b.updated_at DESC`,
        [req.userId]
      );

      res.json(builds);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching user builds:', error);
    res.status(500).json({ error: 'Failed to fetch builds' });
  }
}

/**
 * GET /api/me/builds/:id
 * Returns full details of a specific build owned by the user
 */
async function getBuildById(req, res) {
  try {
    const connection = await db.getConnection();

    try {
      // Get build
      const [builds] = await connection.query(
        `SELECT b.*, s.name as specialization_name,
                sk1.name as skill_1_name, sk2.name as skill_2_name
         FROM builds b
         LEFT JOIN specializations s ON b.specialization_id = s.id
         LEFT JOIN skills sk1 ON b.skill_1_id = sk1.id
         LEFT JOIN skills sk2 ON b.skill_2_id = sk2.id
         WHERE b.id = ? AND b.user_id = ?`,
        [req.params.id, req.userId]
      );

      if (builds.length === 0) {
        return res.status(404).json({ error: 'Build not found' });
      }

      const build = builds[0];

      // Get gear slots
      const [gear] = await connection.query(
        `SELECT bg.*,
                i.name as catalog_item_name,
                ca.name as core_attr_name,
                m1.name as minor_1_name,
                m2.name as minor_2_name,
                mod.name as mod_name,
                t.name as talent_name
         FROM build_gear bg
         LEFT JOIN items i ON bg.item_id = i.id
         LEFT JOIN attributes ca ON bg.core_attr_id = ca.id
         LEFT JOIN attributes m1 ON bg.minor_1_id = m1.id
         LEFT JOIN attributes m2 ON bg.minor_2_id = m2.id
         LEFT JOIN attributes mod ON bg.mod_id = mod.id
         LEFT JOIN talents t ON bg.talent_id = t.id
         WHERE bg.build_id = ?`,
        [build.id]
      );

      // Get weapon slots
      const [weapons] = await connection.query(
        `SELECT bw.*,
                i.name as catalog_item_name,
                t.name as talent_name
         FROM build_weapons bw
         LEFT JOIN items i ON bw.item_id = i.id
         LEFT JOIN talents t ON bw.talent_id = t.id
         WHERE bw.build_id = ?`,
        [build.id]
      );

      build.gear = gear;
      build.weapons = weapons;

      res.json(build);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching build:', error);
    res.status(500).json({ error: 'Failed to fetch build' });
  }
}

/**
 * POST /api/me/builds
 * Creates a new build for the authenticated user
 */
async function createBuild(req, res) {
  const { name, specialization_id, skill_1_id, skill_2_id, notes, is_public, gear, weapons } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Build name is required' });
  }

  try {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Insert build
      const [result] = await connection.query(
        `INSERT INTO builds (user_id, name, specialization_id, skill_1_id, skill_2_id, notes, is_public)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.userId, name, specialization_id || null, skill_1_id || null, skill_2_id || null, notes || null, is_public || false]
      );

      const buildId = result.insertId;

      // Insert gear slots
      if (gear && Array.isArray(gear)) {
        for (const slot of gear) {
          await connection.query(
            `INSERT INTO build_gear (build_id, slot, item_name, item_id, core_attr_id, minor_1_id, minor_2_id, mod_id, talent_id, owned_override)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [buildId, slot.slot, slot.item_name || null, slot.item_id || null, slot.core_attr_id || null, slot.minor_1_id || null, slot.minor_2_id || null, slot.mod_id || null, slot.talent_id || null, slot.owned_override || null]
          );
        }
      }

      // Insert weapon slots
      if (weapons && Array.isArray(weapons)) {
        for (const slot of weapons) {
          await connection.query(
            `INSERT INTO build_weapons (build_id, slot, weapon_name, item_id, talent_id, owned_override)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [buildId, slot.slot, slot.weapon_name || null, slot.item_id || null, slot.talent_id || null, slot.owned_override || null]
          );
        }
      }

      await connection.commit();

      res.status(201).json({ id: buildId, message: 'Build created successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating build:', error);
    res.status(500).json({ error: 'Failed to create build' });
  }
}

/**
 * PUT /api/me/builds/:id
 * Updates an existing build owned by the user
 */
async function updateBuild(req, res) {
  const { name, specialization_id, skill_1_id, skill_2_id, notes, is_public, gear, weapons } = req.body;

  try {
    const connection = await db.getConnection();

    try {
      // Verify ownership
      const [existing] = await connection.query(
        `SELECT id FROM builds WHERE id = ? AND user_id = ?`,
        [req.params.id, req.userId]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: 'Build not found' });
      }

      await connection.beginTransaction();

      // Update build
      await connection.query(
        `UPDATE builds SET name = ?, specialization_id = ?, skill_1_id = ?, skill_2_id = ?, notes = ?, is_public = ?
         WHERE id = ?`,
        [name, specialization_id || null, skill_1_id || null, skill_2_id || null, notes || null, is_public || false, req.params.id]
      );

      // Delete and re-insert gear slots
      await connection.query(`DELETE FROM build_gear WHERE build_id = ?`, [req.params.id]);
      if (gear && Array.isArray(gear)) {
        for (const slot of gear) {
          await connection.query(
            `INSERT INTO build_gear (build_id, slot, item_name, item_id, core_attr_id, minor_1_id, minor_2_id, mod_id, talent_id, owned_override)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.params.id, slot.slot, slot.item_name || null, slot.item_id || null, slot.core_attr_id || null, slot.minor_1_id || null, slot.minor_2_id || null, slot.mod_id || null, slot.talent_id || null, slot.owned_override || null]
          );
        }
      }

      // Delete and re-insert weapon slots
      await connection.query(`DELETE FROM build_weapons WHERE build_id = ?`, [req.params.id]);
      if (weapons && Array.isArray(weapons)) {
        for (const slot of weapons) {
          await connection.query(
            `INSERT INTO build_weapons (build_id, slot, weapon_name, item_id, talent_id, owned_override)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.params.id, slot.slot, slot.weapon_name || null, slot.item_id || null, slot.talent_id || null, slot.owned_override || null]
          );
        }
      }

      await connection.commit();

      res.json({ message: 'Build updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating build:', error);
    res.status(500).json({ error: 'Failed to update build' });
  }
}

/**
 * DELETE /api/me/builds/:id
 * Deletes a build owned by the user
 */
async function deleteBuild(req, res) {
  try {
    const connection = await db.getConnection();

    try {
      const [result] = await connection.query(
        `DELETE FROM builds WHERE id = ? AND user_id = ?`,
        [req.params.id, req.userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Build not found' });
      }

      res.json({ message: 'Build deleted successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting build:', error);
    res.status(500).json({ error: 'Failed to delete build' });
  }
}

/**
 * POST /api/me/builds/:id/duplicate
 * Creates a copy of an existing build with a new name
 */
async function duplicateBuild(req, res) {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'New build name is required' });
  }

  try {
    const connection = await db.getConnection();

    try {
      // Get original build
      const [builds] = await connection.query(
        `SELECT * FROM builds WHERE id = ? AND user_id = ?`,
        [req.params.id, req.userId]
      );

      if (builds.length === 0) {
        return res.status(404).json({ error: 'Build not found' });
      }

      const original = builds[0];

      await connection.beginTransaction();

      // Create new build
      const [result] = await connection.query(
        `INSERT INTO builds (user_id, name, specialization_id, skill_1_id, skill_2_id, notes, is_public)
         VALUES (?, ?, ?, ?, ?, ?, false)`,
        [req.userId, name, original.specialization_id, original.skill_1_id, original.skill_2_id, original.notes]
      );

      const newBuildId = result.insertId;

      // Copy gear slots
      await connection.query(
        `INSERT INTO build_gear (build_id, slot, item_name, item_id, core_attr_id, minor_1_id, minor_2_id, mod_id, talent_id, owned_override)
         SELECT ?, slot, item_name, item_id, core_attr_id, minor_1_id, minor_2_id, mod_id, talent_id, owned_override
         FROM build_gear WHERE build_id = ?`,
        [newBuildId, req.params.id]
      );

      // Copy weapon slots
      await connection.query(
        `INSERT INTO build_weapons (build_id, slot, weapon_name, item_id, talent_id, owned_override)
         SELECT ?, slot, weapon_name, item_id, talent_id, owned_override
         FROM build_weapons WHERE build_id = ?`,
        [newBuildId, req.params.id]
      );

      await connection.commit();

      res.status(201).json({ id: newBuildId, message: 'Build duplicated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error duplicating build:', error);
    res.status(500).json({ error: 'Failed to duplicate build' });
  }
}

/**
 * GET /api/builds/public
 * Returns all public builds (summary only)
 */
async function getPublicBuilds(req, res) {
  try {
    const connection = await db.getConnection();

    try {
      const [builds] = await connection.query(
        `SELECT b.id, b.name, b.created_at, b.updated_at,
                u.email as author_email,
                s.name as specialization_name
         FROM builds b
         JOIN users u ON b.user_id = u.id
         LEFT JOIN specializations s ON b.specialization_id = s.id
         WHERE b.is_public = true
         ORDER BY b.updated_at DESC`
      );

      // Mask email for privacy (show first part only)
      builds.forEach(build => {
        if (build.author_email) {
          const [name] = build.author_email.split('@');
          build.author = name.substring(0, 3) + '***';
          delete build.author_email;
        }
      });

      res.json(builds);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching public builds:', error);
    res.status(500).json({ error: 'Failed to fetch public builds' });
  }
}

/**
 * GET /api/builds/public/:id
 * Returns full details of a public build
 */
async function getPublicBuildById(req, res) {
  try {
    const connection = await db.getConnection();

    try {
      // Get build
      const [builds] = await connection.query(
        `SELECT b.*, u.email as author_email,
                s.name as specialization_name,
                sk1.name as skill_1_name, sk2.name as skill_2_name
         FROM builds b
         JOIN users u ON b.user_id = u.id
         LEFT JOIN specializations s ON b.specialization_id = s.id
         LEFT JOIN skills sk1 ON b.skill_1_id = sk1.id
         LEFT JOIN skills sk2 ON b.skill_2_id = sk2.id
         WHERE b.id = ? AND b.is_public = true`,
        [req.params.id]
      );

      if (builds.length === 0) {
        return res.status(404).json({ error: 'Build not found' });
      }

      const build = builds[0];

      // Mask email
      if (build.author_email) {
        const [name] = build.author_email.split('@');
        build.author = name.substring(0, 3) + '***';
        delete build.author_email;
      }

      // Get gear slots
      const [gear] = await connection.query(
        `SELECT bg.slot, bg.item_name, bg.item_id, bg.owned_override,
                i.name as catalog_item_name,
                ca.name as core_attr_name,
                m1.name as minor_1_name,
                m2.name as minor_2_name,
                mod.name as mod_name,
                t.name as talent_name
         FROM build_gear bg
         LEFT JOIN items i ON bg.item_id = i.id
         LEFT JOIN attributes ca ON bg.core_attr_id = ca.id
         LEFT JOIN attributes m1 ON bg.minor_1_id = m1.id
         LEFT JOIN attributes m2 ON bg.minor_2_id = m2.id
         LEFT JOIN attributes mod ON bg.mod_id = mod.id
         LEFT JOIN talents t ON bg.talent_id = t.id
         WHERE bg.build_id = ?`,
        [build.id]
      );

      // Get weapon slots
      const [weapons] = await connection.query(
        `SELECT bw.slot, bw.weapon_name, bw.item_id, bw.owned_override,
                i.name as catalog_item_name,
                t.name as talent_name
         FROM build_weapons bw
         LEFT JOIN items i ON bw.item_id = i.id
         LEFT JOIN talents t ON bw.talent_id = t.id
         WHERE bw.build_id = ?`,
        [build.id]
      );

      // Remove internal IDs from response
      delete build.user_id;

      build.gear = gear;
      build.weapons = weapons;

      res.json(build);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching public build:', error);
    res.status(500).json({ error: 'Failed to fetch build' });
  }
}

/**
 * POST /api/builds/public/:id/copy
 * Copies a public build to the authenticated user's builds
 */
async function copyPublicBuild(req, res) {
  try {
    const connection = await db.getConnection();

    try {
      // Get original public build
      const [builds] = await connection.query(
        `SELECT * FROM builds WHERE id = ? AND is_public = true`,
        [req.params.id]
      );

      if (builds.length === 0) {
        return res.status(404).json({ error: 'Public build not found' });
      }

      const original = builds[0];

      await connection.beginTransaction();

      // Create new build for current user
      const newName = `${original.name} (Copy)`;
      const [result] = await connection.query(
        `INSERT INTO builds (user_id, name, specialization_id, skill_1_id, skill_2_id, notes, is_public)
         VALUES (?, ?, ?, ?, ?, ?, false)`,
        [req.userId, newName, original.specialization_id, original.skill_1_id, original.skill_2_id, original.notes]
      );

      const newBuildId = result.insertId;

      // Copy gear slots
      await connection.query(
        `INSERT INTO build_gear (build_id, slot, item_name, item_id, core_attr_id, minor_1_id, minor_2_id, mod_id, talent_id, owned_override)
         SELECT ?, slot, item_name, item_id, core_attr_id, minor_1_id, minor_2_id, mod_id, talent_id, NULL
         FROM build_gear WHERE build_id = ?`,
        [newBuildId, req.params.id]
      );

      // Copy weapon slots
      await connection.query(
        `INSERT INTO build_weapons (build_id, slot, weapon_name, item_id, talent_id, owned_override)
         SELECT ?, slot, weapon_name, item_id, talent_id, NULL
         FROM build_weapons WHERE build_id = ?`,
        [newBuildId, req.params.id]
      );

      await connection.commit();

      res.status(201).json({ id: newBuildId, message: 'Build copied successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error copying public build:', error);
    res.status(500).json({ error: 'Failed to copy build' });
  }
}

module.exports = {
  getUserBuilds,
  getBuildById,
  createBuild,
  updateBuild,
  deleteBuild,
  duplicateBuild,
  getPublicBuilds,
  getPublicBuildById,
  copyPublicBuild
};
