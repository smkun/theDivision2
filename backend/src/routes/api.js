// API Routes
// Defines all API endpoints

const express = require('express');
const router = express.Router();

const { verifyFirebaseToken } = require('../middleware/auth');
const catalogController = require('../controllers/catalog.controller');
const userItemsController = require('../controllers/userItems.controller');
const referenceController = require('../controllers/reference.controller');
const buildsController = require('../controllers/builds.controller');

// Public routes (no auth required)
router.get('/catalog', catalogController.getCatalog);

// Reference data routes (public, no auth required)
router.get('/attributes', referenceController.getAttributes);
router.get('/talents', referenceController.getTalents);
router.get('/skills', referenceController.getSkills);
router.get('/specializations', referenceController.getSpecializations);

// Public builds routes
router.get('/builds/public', buildsController.getPublicBuilds);
router.get('/builds/public/:id', buildsController.getPublicBuildById);

// Protected routes (auth required)
router.get('/me/items', verifyFirebaseToken, userItemsController.getOwnedItems);
router.put('/me/items/:itemId', verifyFirebaseToken, userItemsController.updateItemOwnership);

// User builds routes (auth required)
router.get('/me/builds', verifyFirebaseToken, buildsController.getUserBuilds);
router.get('/me/builds/:id', verifyFirebaseToken, buildsController.getBuildById);
router.post('/me/builds', verifyFirebaseToken, buildsController.createBuild);
router.put('/me/builds/:id', verifyFirebaseToken, buildsController.updateBuild);
router.delete('/me/builds/:id', verifyFirebaseToken, buildsController.deleteBuild);
router.post('/me/builds/:id/duplicate', verifyFirebaseToken, buildsController.duplicateBuild);

// Copy public build (auth required)
router.post('/builds/public/:id/copy', verifyFirebaseToken, buildsController.copyPublicBuild);

module.exports = router;
