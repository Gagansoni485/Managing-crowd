const express = require('express');
const router = express.Router();
const {
  createEmergencyRequest,
  createGuestEmergency,
  getMyEmergencyRequests,
  getAllEmergencyRequests,
  updateEmergencyStatus,
} = require('../controllers/emergencyController');
const { protect } = require('../middlewares/authMiddleware');
const { adminOrVolunteer } = require('../middlewares/roleMiddleware');

// Public route for guest users (no auth required)
router.post('/guest', createGuestEmergency);

// Authenticated routes
router.use(protect);

router.post('/', createEmergencyRequest);
router.get('/my-requests', getMyEmergencyRequests);
router.get('/', adminOrVolunteer, getAllEmergencyRequests);
router.put('/:id', adminOrVolunteer, updateEmergencyStatus);

module.exports = router;
