const express = require('express');
const router = express.Router();
const {
  getAssignedQueues,
  updateQueueStatus,
  getEmergencyRequests,
  respondToEmergency,
} = require('../controllers/volunteerController');
const { protect } = require('../middlewares/authMiddleware');
const { volunteer } = require('../middlewares/roleMiddleware');

// Protect all routes and restrict to volunteer
router.use(protect);
router.use(volunteer);

router.get('/queues', getAssignedQueues);
router.put('/queues/:id', updateQueueStatus);
router.get('/emergencies', getEmergencyRequests);
router.put('/emergencies/:id', respondToEmergency);

module.exports = router;
