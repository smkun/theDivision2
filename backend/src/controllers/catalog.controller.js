// Catalog Controller
// Handles requests for the items catalog

const db = require('../config/database');

/**
 * GET /api/catalog
 * Returns all active items from the catalog
 */
async function getCatalog(req, res) {
  try {
    const connection = await db.getConnection();
    
    try {
      const [items] = await connection.query(
        `SELECT id, type, name, set_name, slot, sort_order 
         FROM items 
         WHERE is_active = true 
         ORDER BY sort_order ASC`
      );
      
      res.json(items);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching catalog:', error);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
}

module.exports = {
  getCatalog
};
