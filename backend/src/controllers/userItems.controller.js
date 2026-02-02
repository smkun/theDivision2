// User Items Controller
// Handles user ownership tracking

const db = require('../config/database');

/**
 * GET /api/me/items
 * Returns all owned items for the authenticated user
 */
async function getOwnedItems(req, res) {
  try {
    const userId = req.userId;
    const connection = await db.getConnection();
    
    try {
      const [items] = await connection.query(
        `SELECT item_id, owned, updated_at 
         FROM user_items 
         WHERE user_id = ? AND owned = true`,
        [userId]
      );
      
      res.json(items);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching owned items:', error);
    res.status(500).json({ error: 'Failed to fetch owned items' });
  }
}

/**
 * PUT /api/me/items/:itemId
 * Updates ownership status for a specific item
 */
async function updateItemOwnership(req, res) {
  try {
    const userId = req.userId;
    const itemId = parseInt(req.params.itemId);
    const { owned } = req.body;
    
    if (typeof owned !== 'boolean') {
      return res.status(400).json({ error: 'owned must be a boolean' });
    }
    
    const connection = await db.getConnection();
    
    try {
      if (owned) {
        // Insert or update to owned
        await connection.query(
          `INSERT INTO user_items (user_id, item_id, owned) 
           VALUES (?, ?, true) 
           ON DUPLICATE KEY UPDATE owned = true, updated_at = CURRENT_TIMESTAMP`,
          [userId, itemId]
        );
      } else {
        // Delete the record (unowned items don't have records)
        await connection.query(
          'DELETE FROM user_items WHERE user_id = ? AND item_id = ?',
          [userId, itemId]
        );
      }
      
      res.json({ success: true, item_id: itemId, owned });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating item ownership:', error);
    res.status(500).json({ error: 'Failed to update item ownership' });
  }
}

module.exports = {
  getOwnedItems,
  updateItemOwnership
};
