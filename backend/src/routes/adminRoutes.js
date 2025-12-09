const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getDashboardStats,
  updateUserRole,
  assignVolunteerToQueue,
  getAnalytics,
  getAllBookings,
  getAllStaff,
  assignTaskToStaff,
} = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { admin } = require('../middlewares/roleMiddleware');

// Protect all routes and restrict to admin
router.use(protect);
router.use(admin);

router.get('/users', getAllUsers);
router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/bookings', getAllBookings);
router.get('/staff', getAllStaff);
router.post('/staff/:id/assign-task', assignTaskToStaff);
router.put('/users/:id/role', updateUserRole);
router.put('/queues/:id/assign', assignVolunteerToQueue);

module.exports = router;
