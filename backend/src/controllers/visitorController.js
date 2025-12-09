const Token = require('../models/Token');
const Queue = require('../models/Queue');
const Temple = require('../models/Temple');
const { sendTokenConfirmation } = require('../services/notificationService');
const { isSameDayBooking, autoCreateQueueEntry } = require('../services/queueService');
const { generateQRCodeImage } = require('../utils/tokenGenerator');

// @desc    Get visitor tokens
// @route   GET /api/visitor/tokens
// @access  Private/Visitor
const getVisitorTokens = async (req, res) => {
  try {
    const tokens = await Token.find({ userId: req.user._id })
      .populate('templeId')
      .sort({ createdAt: -1 });
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new token booking
// @route   POST /api/visitor/tokens
// @access  Private/Visitor
const createTokenBooking = async (req, res) => {
  try {
    const { templeId, visitDate, timeSlot, numberOfVisitors } = req.body;

    // Validate time slot is not in the past
    const bookingDate = new Date(visitDate);
    const now = new Date();
    
    // Extract start time from timeSlot (format: "HH:MM-HH:MM" or "HH:MM")
    const timeSlotStart = timeSlot.split('-')[0].trim();
    const [hours, minutes] = timeSlotStart.split(':').map(Number);
    
    // Create booking datetime
    const bookingDateTime = new Date(bookingDate);
    bookingDateTime.setHours(hours, minutes, 0, 0);
    
    // Add 30 minute buffer - can't book slot starting in less than 30 mins
    const bufferTime = new Date(now.getTime() + 30 * 60000);
    
    if (bookingDateTime <= bufferTime) {
      return res.status(400).json({ 
        message: 'Cannot book a time slot that has already passed or starts in less than 30 minutes. Please select a future time slot.' 
      });
    }

    // Check temple capacity
    const temple = await Temple.findById(templeId);
    if (!temple) {
      return res.status(404).json({ message: 'Temple not found' });
    }

    // Check existing bookings for same slot
    const existingBookings = await Token.countDocuments({
      templeId,
      visitDate: bookingDate,
      timeSlot,
      status: 'active',
    });

    if (existingBookings >= temple.capacity) {
      return res.status(400).json({ message: 'Time slot is full. Please select another slot.' });
    }

    const token = await Token.create({
      userId: req.user._id,
      templeId,
      visitDate: bookingDate,
      timeSlot,
      numberOfVisitors,
      status: 'active',
    });

    await token.populate('userId', 'name email phone');
    await token.populate('templeId', 'name location');

    // Generate QR code for the token
    try {
      const qrCodeImage = await generateQRCodeImage({
        tokenNumber: token.tokenNumber,
        userId: token.userId._id,
        templeId: token.templeId,
        visitDate: token.visitDate,
        timeSlot: token.timeSlot,
        numberOfVisitors: token.numberOfVisitors
      });
      
      if (qrCodeImage) {
        token.qrCode = qrCodeImage;
        await token.save();
        console.log(`✅ QR code generated for token ${token.tokenNumber}`);
      }
    } catch (qrError) {
      console.error('⚠️ QR code generation failed:', qrError.message);
      // Don't fail the booking if QR generation fails
    }

    // Auto-create queue entry if same-day booking
    let queueEntry = null;
    if (isSameDayBooking(visitDate, timeSlot)) {
      queueEntry = await autoCreateQueueEntry(token, req.user._id);
      if (queueEntry) {
        console.log(`✅ Same-day booking - Auto-queued at position ${queueEntry.position}`);
      }
    } else {
      // Future booking - set pending status
      token.queueStatus = 'pending';
      await token.save();
      console.log(`📅 Future booking - Queue will activate on visit date`);
    }

    // Send SMS confirmation
    let smsResult;
    try {
      const smsData = {
        tokenNumber: token.tokenNumber,
        templeName: token.templeId?.name || 'Temple',
        visitDate: token.visitDate,
        timeSlot: token.timeSlot,
        numberOfVisitors: token.numberOfVisitors
      };
      
      // Add queue info to SMS if auto-queued
      if (queueEntry) {
        smsData.queuePosition = queueEntry.position;
        smsData.estimatedWait = queueEntry.estimatedWaitTime;
      }
      
      smsResult = await sendTokenConfirmation(req.user, smsData);
      
      if (smsResult.success) {
        console.log('✅ Booking SMS sent successfully to:', req.user.phone);
        console.log('   Message SID:', smsResult.messageSid);
        console.log('   Formatted Phone:', smsResult.phone);
      } else {
        console.error('⚠️ SMS sending failed:', smsResult.error);
        console.error('   Error code:', smsResult.code);
        console.error('   User phone:', req.user.phone);
      }
    } catch (smsError) {
      console.error('⚠️ SMS sending exception:', smsError.message);
      // Don't fail the booking if SMS fails
    }

    res.status(201).json({
      message: 'Booking successful!',
      token,
      queueEntry: queueEntry ? {
        position: queueEntry.position,
        estimatedWaitTime: queueEntry.estimatedWaitTime,
        autoQueued: true
      } : null,
      isToday: isSameDayBooking(visitDate, timeSlot)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get visitor queue position
// @route   GET /api/visitor/queue/:tokenId
// @access  Private/Visitor
const getQueuePosition = async (req, res) => {
  try {
    const queue = await Queue.findOne({ tokenId: req.params.tokenId });

    if (!queue) {
      return res.status(404).json({ message: 'Queue entry not found' });
    }

    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rejoin queue
// @route   POST /api/visitor/queue/rejoin
// @access  Private/Visitor
const rejoinQueue = async (req, res) => {
  try {
    const { tokenId } = req.body;

    const queue = await Queue.findOne({ tokenId });

    if (!queue) {
      return res.status(404).json({ message: 'Queue entry not found' });
    }

    queue.status = 'active';
    queue.rejoinedAt = Date.now();
    await queue.save();

    res.json({ message: 'Rejoined queue successfully', queue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVisitorTokens,
  createTokenBooking,
  getQueuePosition,
  rejoinQueue,
};
