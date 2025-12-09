const express = require('express');
const router = express.Router();
const {
  verifyQRCode,
  getEntryLogs,
} = require('../controllers/guardController');
const { protect } = require('../middlewares/authMiddleware');

// Protect all routes
router.use(protect);

// QR verification endpoint
router.post('/verify-qr', verifyQRCode);

// Get today's entry logs
router.get('/entry-logs', getEntryLogs);

module.exports = router;
