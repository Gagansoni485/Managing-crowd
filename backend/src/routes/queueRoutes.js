const express = require('express');
const router = express.Router();
const {
  getAllQueues,
  getQueueByTemple,
  joinQueue,
  updateQueuePosition,
  leaveQueue,
} = require('../controllers/queueController');
const { protect } = require('../middlewares/authMiddleware');
const { admin } = require('../middlewares/roleMiddleware');

// Public routes
router.get('/temple/:templeId', getQueueByTemple);

// Protected routes
router.use(protect);
router.get('/', getAllQueues);
router.post('/join', joinQueue);
router.delete('/:id', leaveQueue);

// Admin only
router.put('/:id/position', admin, updateQueuePosition);

module.exports = router;
