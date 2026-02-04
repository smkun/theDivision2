// Reference Data Controller
// Handles requests for attributes, talents, skills, specializations

const db = require('../config/database');

/**
 * GET /api/attributes
 * Returns all attributes grouped by type
 */
async function getAttributes(req, res) {
  try {
    const connection = await db.getConnection();

    try {
      const [rows] = await connection.query(
        `SELECT id, name, type FROM attributes ORDER BY type, name`
      );

      // Group by type
      const grouped = rows.reduce((acc, attr) => {
        if (!acc[attr.type]) {
          acc[attr.type] = [];
        }
        acc[attr.type].push({ id: attr.id, name: attr.name });
        return acc;
      }, {});

      res.json(grouped);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching attributes:', error);
    res.status(500).json({ error: 'Failed to fetch attributes' });
  }
}

/**
 * GET /api/talents
 * Returns all talents grouped by slot_type
 */
async function getTalents(req, res) {
  try {
    const connection = await db.getConnection();

    try {
      const [rows] = await connection.query(
        `SELECT id, name, slot_type FROM talents ORDER BY slot_type, name`
      );

      // Group by slot_type
      const grouped = rows.reduce((acc, talent) => {
        if (!acc[talent.slot_type]) {
          acc[talent.slot_type] = [];
        }
        acc[talent.slot_type].push({ id: talent.id, name: talent.name });
        return acc;
      }, {});

      res.json(grouped);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching talents:', error);
    res.status(500).json({ error: 'Failed to fetch talents' });
  }
}

/**
 * GET /api/skills
 * Returns all skills
 */
async function getSkills(req, res) {
  try {
    const connection = await db.getConnection();

    try {
      const [rows] = await connection.query(
        `SELECT id, name FROM skills ORDER BY name`
      );

      res.json(rows);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
}

/**
 * GET /api/specializations
 * Returns all specializations
 */
async function getSpecializations(req, res) {
  try {
    const connection = await db.getConnection();

    try {
      const [rows] = await connection.query(
        `SELECT id, name FROM specializations ORDER BY name`
      );

      res.json(rows);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching specializations:', error);
    res.status(500).json({ error: 'Failed to fetch specializations' });
  }
}

module.exports = {
  getAttributes,
  getTalents,
  getSkills,
  getSpecializations
};
