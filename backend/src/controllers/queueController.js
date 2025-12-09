const Queue = require('../models/Queue');
const Token = require('../models/Token');
const { emitQueueUpdate, emitPersonalQueueUpdate } = require('../socket/queueSocket');

// @desc    Get all queues
// @route   GET /api/queue
// @access  Private
const getAllQueues = async (req, res) => {
  try {
    const queues = await Queue.find({})
      .populate('tokenId')
      .populate('userId')
      .sort({ position: 1 });
    res.json(queues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get queue by temple
// @route   GET /api/queue/temple/:templeId
// @access  Public
const getQueueByTemple = async (req, res) => {
  try {
    const queues = await Queue.find({ templeId: req.params.templeId, status: 'active' })
      .populate('tokenId')
      .sort({ position: 1 });
    res.json(queues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join queue
// @route   POST /api/queue/join
// @access  Private
const joinQueue = async (req, res) => {
  try {
    const { tokenId, templeId } = req.body;

    // Get current queue count
    const queueCount = await Queue.countDocuments({ templeId, status: 'active' });

    const queue = await Queue.create({
      userId: req.user._id,
      tokenId,
      templeId,
      position: queueCount + 1,
      status: 'active',
    });

    // Populate for socket emission
    await queue.populate(['userId', 'tokenId']);

    // Emit real-time update
    emitQueueUpdate(req.app.get('io'), templeId, queue);

    res.status(201).json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update queue position
// @route   PUT /api/queue/:id/position
// @access  Private/Admin
const updateQueuePosition = async (req, res) => {
  try {
    const { position } = req.body;
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({ message: 'Queue entry not found' });
    }

    queue.position = position;
    await queue.save();

    // Emit real-time position update
    emitPersonalQueueUpdate(req.app.get('io'), queue.userId.toString(), {
      position,
      queueId: queue._id,
    });

    emitQueueUpdate(req.app.get('io'), queue.templeId, { updated: true });

    res.json({ message: 'Queue position updated', queue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave queue
// @route   DELETE /api/queue/:id
// @access  Private
const leaveQueue = async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({ message: 'Queue entry not found' });
    }

    queue.status = 'left';
    await queue.save();

    res.json({ message: 'Left queue successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllQueues,
  getQueueByTemple,
  joinQueue,
  updateQueuePosition,
  leaveQueue,
};
