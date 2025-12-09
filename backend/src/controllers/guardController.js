const Token = require('../models/Token');
const User = require('../models/User');

// @desc    Verify QR code at temple entrance
// @route   POST /api/guard/verify-qr
// @access  Private/Guard
const verifyQRCode = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({ 
        success: false,
        message: 'QR data is required' 
      });
    }

    // Parse QR data
    let tokenData;
    try {
      tokenData = JSON.parse(qrData);
    } catch (parseError) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid QR code format' 
      });
    }

    const { tokenNumber, userId, templeId, visitDate, timeSlot } = tokenData;

    // Find token in database
    const token = await Token.findOne({ tokenNumber })
      .populate('userId', 'name email phone profileImage')
      .populate('templeId', 'name');

    if (!token) {
      return res.status(404).json({ 
        success: false,
        message: 'Token not found',
        action: 'DENY'
      });
    }

    // Verify token matches QR data
    if (token.userId._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Token user mismatch',
        action: 'DENY'
      });
    }

    // Check if token is already used
    if (token.status === 'used') {
      return res.status(400).json({ 
        success: false,
        message: 'Token already used',
        action: 'DENY',
        details: 'This token has already been scanned for entry'
      });
    }

    // Check if token is expired or cancelled
    if (token.status === 'expired' || token.status === 'cancelled') {
      return res.status(400).json({ 
        success: false,
        message: `Token is ${token.status}`,
        action: 'DENY'
      });
    }

    // Validate booking date is today
    const bookingDate = new Date(token.visitDate);
    const today = new Date();
    bookingDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (bookingDate.getTime() !== today.getTime()) {
      const dateStr = bookingDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      return res.status(400).json({ 
        success: false,
        message: `Booking is for ${dateStr}, not today`,
        action: 'DENY',
        bookingDate: dateStr
      });
    }

    // Validate time slot - Entry allowed: 30 min before slot → 1 hour after slot start
    const now = new Date();
    const [slotStart] = token.timeSlot.split('-');
    const [hours, minutes] = slotStart.trim().split(':').map(Number);
    
    const slotStartTime = new Date();
    slotStartTime.setHours(hours, minutes, 0, 0);
    
    const earliestEntry = new Date(slotStartTime.getTime() - 30 * 60000); // 30 min before
    const latestEntry = new Date(slotStartTime.getTime() + 60 * 60000);   // 1 hour after
    
    if (now < earliestEntry || now > latestEntry) {
      const entryWindow = `${earliestEntry.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })} - ${latestEntry.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
      
      return res.status(400).json({ 
        success: false,
        message: `Entry only allowed between ${entryWindow}`,
        action: 'DENY',
        entryWindow,
        currentTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      });
    }

    // All validations passed - Mark token as used
    token.status = 'used';
    await token.save();

    // Log entry
    console.log(`✅ Entry granted: ${token.userId.name} | Token: ${tokenNumber}`);

    res.json({
      success: true,
      message: 'Entry granted',
      action: 'GRANT',
      visitor: {
        name: token.userId.name,
        email: token.userId.email,
        phone: token.userId.phone,
        profileImage: token.userId.profileImage
      },
      booking: {
        tokenNumber: token.tokenNumber,
        temple: token.templeId?.name || templeId,
        timeSlot: token.timeSlot,
        numberOfVisitors: token.numberOfVisitors,
        visitDate: token.visitDate
      }
    });

  } catch (error) {
    console.error('QR verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error verifying QR code',
      action: 'DENY',
      error: error.message 
    });
  }
};

// @desc    Get entry logs for today
// @route   GET /api/guard/entry-logs
// @access  Private/Guard
const getEntryLogs = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const usedTokens = await Token.find({
      status: 'used',
      visitDate: {
        $gte: today,
        $lt: tomorrow
      }
    })
    .populate('userId', 'name email phone')
    .populate('templeId', 'name')
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: usedTokens.length,
      entries: usedTokens.map(token => ({
        tokenNumber: token.tokenNumber,
        visitorName: token.userId?.name,
        temple: token.templeId?.name || token.templeId,
        timeSlot: token.timeSlot,
        numberOfVisitors: token.numberOfVisitors,
        entryTime: token.updatedAt
      }))
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = {
  verifyQRCode,
  getEntryLogs,
};
