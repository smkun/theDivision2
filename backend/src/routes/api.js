// API Routes
// Defines all API endpoints

const express = require('express');
const router = express.Router();

const { verifyFirebaseToken } = require('../middleware/auth');
const catalogController = require('../controllers/catalog.controller');
const userItemsController = require('../controllers/userItems.controller');

// Public routes (no auth required)
router.get('/catalog', catalogController.getCatalog);

// Protected routes (auth required)
router.get('/me/items', verifyFirebaseToken, userItemsController.getOwnedItems);
router.put('/me/items/:itemId', verifyFirebaseToken, userItemsController.updateItemOwnership);

module.exports = router;
