const Queue = require('../models/Queue');
const EmergencyRequest = require('../models/EmergencyRequest');

// @desc    Get assigned queues
// @route   GET /api/volunteer/queues
// @access  Private/Volunteer
const getAssignedQueues = async (req, res) => {
  try {
    const queues = await Queue.find({ assignedVolunteer: req.user._id })
      .populate('tokenId')
      .sort({ createdAt: -1 });
    res.json(queues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update queue status
// @route   PUT /api/volunteer/queues/:id
// @access  Private/Volunteer
const updateQueueStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({ message: 'Queue entry not found' });
    }

    queue.status = status;
    await queue.save();

    res.json({ message: 'Queue status updated', queue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get emergency requests
// @route   GET /api/volunteer/emergencies
// @access  Private/Volunteer
const getEmergencyRequests = async (req, res) => {
  try {
    const emergencies = await EmergencyRequest.find({ status: 'pending' })
      .populate('userId')
      .sort({ createdAt: -1 });
    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Respond to emergency
// @route   PUT /api/volunteer/emergencies/:id
// @access  Private/Volunteer
const respondToEmergency = async (req, res) => {
  try {
    const { status, response } = req.body;
    const emergency = await EmergencyRequest.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({ message: 'Emergency request not found' });
    }

    emergency.status = status;
    emergency.respondedBy = req.user._id;
    emergency.response = response;
    emergency.respondedAt = Date.now();
    await emergency.save();

    res.json({ message: 'Emergency response sent', emergency });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAssignedQueues,
  updateQueueStatus,
  getEmergencyRequests,
  respondToEmergency,
};
