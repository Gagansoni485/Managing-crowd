const User = require('../models/User');
const Queue = require('../models/Queue');
const Token = require('../models/Token');
const EmergencyRequest = require('../models/EmergencyRequest');
const Temple = require('../models/Temple');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVisitors = await User.countDocuments({ role: 'visitor' });
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
    const totalTokens = await Token.countDocuments();
    const activeTokens = await Token.countDocuments({ status: 'active' });
    const activeQueues = await Queue.countDocuments({ status: 'active' });
    const pendingEmergencies = await EmergencyRequest.countDocuments({ status: 'pending' });
    const totalTemples = await Temple.countDocuments({ isActive: true });

    // Get recent bookings (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentBookings = await Token.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    res.json({
      totalUsers,
      totalVisitors,
      totalVolunteers,
      totalTokens,
      activeTokens,
      activeQueues,
      pendingEmergencies,
      totalTemples,
      recentBookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign volunteer to queue
// @route   PUT /api/admin/queues/:id/assign
// @access  Private/Admin
const assignVolunteerToQueue = async (req, res) => {
  try {
    const { volunteerId } = req.body;
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({ message: 'Queue entry not found' });
    }

    // Verify volunteer exists
    const volunteer = await User.findOne({ _id: volunteerId, role: 'volunteer' });
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    queue.assignedVolunteer = volunteerId;
    await queue.save();

    await queue.populate(['assignedVolunteer', 'userId', 'tokenId']);

    res.json({ message: 'Volunteer assigned successfully', queue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const { period = '7' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Bookings over time
    const bookingsByDate = await Token.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Emergency requests by type
    const emergenciesByType = await EmergencyRequest.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    // Queue completion rate
    const completedQueues = await Queue.countDocuments({
      status: 'completed',
      createdAt: { $gte: daysAgo },
    });
    const totalQueues = await Queue.countDocuments({
      createdAt: { $gte: daysAgo },
    });

    res.json({
      bookingsByDate,
      emergenciesByType,
      queueCompletionRate: totalQueues > 0 ? (completedQueues / totalQueues) * 100 : 0,
      totalBookings: bookingsByDate.reduce((sum, day) => sum + day.count, 0),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings/tokens
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Token.find({})
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all staff members
// @route   GET /api/admin/staff
// @access  Private/Admin
const getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({
      role: { $in: ['volunteer', 'staff', 'guard', 'medical'] }
    }).select('-password').sort({ createdAt: -1 });
    
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign task to staff
// @route   POST /api/admin/staff/:id/assign-task
// @access  Private/Admin
const assignTaskToStaff = async (req, res) => {
  try {
    const { task, priority, zone } = req.body;
    const staff = await User.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Add task to staff's assignedTasks
    staff.assignedTasks.push({
      task,
      priority: priority || 'medium',
      status: 'pending',
      assignedBy: req.user._id,
      assignedAt: new Date(),
      zone: zone || null,
    });

    await staff.save();

    res.json({
      message: 'Task assigned successfully',
      staff: {
        _id: staff._id,
        name: staff.name,
        assignedTasks: staff.assignedTasks,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getDashboardStats,
  updateUserRole,
  assignVolunteerToQueue,
  getAnalytics,
  getAllBookings,
  getAllStaff,
  assignTaskToStaff,
};
