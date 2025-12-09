const express = require('express');
const router = express.Router();
const {
  getVisitorTokens,
  createTokenBooking,
  getQueuePosition,
  rejoinQueue,
} = require('../controllers/visitorController');
const { protect } = require('../middlewares/authMiddleware');
const { sendSMS } = require('../services/notificationService');

// Test SMS endpoint (for testing Twilio)
router.post('/test-sms', protect, async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    const result = await sendSMS(
      phoneNumber || req.user.phone,
      message || 'Test SMS from Shankara Temple System!'
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const { visitor } = require('../middlewares/roleMiddleware');

// Protect all routes
router.use(protect);

router.get('/tokens', getVisitorTokens);
router.post('/tokens', createTokenBooking);
router.get('/queue/:tokenId', getQueuePosition);
router.post('/queue/rejoin', rejoinQueue);

module.exports = router;
