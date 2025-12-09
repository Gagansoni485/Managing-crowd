const express = require('express');
const router = express.Router();
const crowdController = require('../controllers/crowdController');
const { protect } = require('../middlewares/authMiddleware');

// Public route for CV system to send data
router.post('/heatmap', crowdController.receiveHeatmapData);

// Protected routes for frontend
router.get('/current', crowdController.getCurrentHeatmap);
router.get('/history/:zoneId', crowdController.getHeatmapHistory);
router.get('/analytics', crowdController.getAnalytics);

// Admin only
router.post('/configure-thresholds', protect, crowdController.configureThresholds);

module.exports = router;
