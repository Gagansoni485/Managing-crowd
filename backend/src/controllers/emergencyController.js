const EmergencyRequest = require('../models/EmergencyRequest');
const User = require('../models/User');
const { emitNewEmergencyAlert, emitEmergencyUpdate } = require('../socket/emergencySocket');

// @desc    Create guest emergency request (no auth required)
// @route   POST /api/emergency/guest
// @access  Public
const createGuestEmergency = async (req, res) => {
  try {
    const { type, description, location, name, phone } = req.body;

    // Create a guest user or find existing guest user
    let guestUser = await User.findOne({ email: 'guest@temple.com' });
    
    if (!guestUser) {
      guestUser = await User.create({
        name: 'Guest User',
        email: 'guest@temple.com',
        password: 'guestpassword123',
        phone: '+919999999999',
        role: 'visitor',
      });
    }

    const emergency = await EmergencyRequest.create({
      userId: guestUser._id,
      type: type || 'medical',
      description: `${name ? `Name: ${name}\n` : ''}Phone: ${phone}\n${description}`,
      location,
      status: 'pending',
    });

    // Populate user info for real-time notification
    await emergency.populate('userId', 'name email phone');

    // Emit socket event for real-time notification
    if (req.app && req.app.get('io')) {
      emitNewEmergencyAlert(req.app.get('io'), emergency);
    }

    res.status(201).json({
      success: true,
      message: 'Emergency request sent successfully',
      emergency,
    });
  } catch (error) {
    console.error('Guest emergency error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create emergency request
// @route   POST /api/emergency
// @access  Private
const createEmergencyRequest = async (req, res) => {
  try {
    const { type, description, location } = req.body;

    const emergency = await EmergencyRequest.create({
      userId: req.user._id,
      type,
      description,
      location,
      status: 'pending',
    });

    // Populate user info for real-time notification
    await emergency.populate('userId', 'name email phone');

    // Emit socket event for real-time notification
    emitNewEmergencyAlert(req.app.get('io'), emergency);

    res.status(201).json(emergency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's emergency requests
// @route   GET /api/emergency/my-requests
// @access  Private
const getMyEmergencyRequests = async (req, res) => {
  try {
    const emergencies = await EmergencyRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all emergency requests
// @route   GET /api/emergency
// @access  Private/Admin/Volunteer
const getAllEmergencyRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const emergencies = await EmergencyRequest.find(filter)
      .populate('userId', 'name email phone')
      .populate('respondedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update emergency status
// @route   PUT /api/emergency/:id
// @access  Private/Admin/Volunteer
const updateEmergencyStatus = async (req, res) => {
  try {
    const { status, response } = req.body;
    const emergency = await EmergencyRequest.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({ message: 'Emergency request not found' });
    }

    emergency.status = status;
    if (response) emergency.response = response;
    if (status !== 'pending') {
      emergency.respondedBy = req.user._id;
      emergency.respondedAt = Date.now();
    }

    await emergency.save();

    // Emit real-time update to user
    emitEmergencyUpdate(req.app.get('io'), emergency.userId.toString(), {
      status,
      response,
      message: `Emergency ${status}`,
    });

    res.json({ message: 'Emergency status updated', emergency });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGuestEmergency,
  createEmergencyRequest,
  getMyEmergencyRequests,
  getAllEmergencyRequests,
  updateEmergencyStatus,
};
