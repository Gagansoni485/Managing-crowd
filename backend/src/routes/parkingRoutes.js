const express = require('express');
const router = express.Router();
const {
  getAllParkingSlots,
  getAvailableParkingSlots,
  updateParkingSlot,
  createParkingSlot,
  bulkUpdateParkingSlots,
} = require('../controllers/parkingController');
const { protect } = require('../middlewares/authMiddleware');
const { admin } = require('../middlewares/roleMiddleware');

// Public routes
router.get('/', getAllParkingSlots);
router.get('/available', getAvailableParkingSlots);

// Protected routes - Admin only
router.post('/', protect, admin, createParkingSlot);
router.put('/:id', protect, admin, updateParkingSlot);

// System route for computer vision updates
router.post('/bulk-update', bulkUpdateParkingSlots);

module.exports = router;
