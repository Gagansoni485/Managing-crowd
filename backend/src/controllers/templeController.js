const Temple = require('../models/Temple');

// @desc    Get all temples
// @route   GET /api/temples
// @access  Public
const getAllTemples = async (req, res) => {
  try {
    const temples = await Temple.find({ isActive: true });
    res.json(temples);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get temple by ID
// @route   GET /api/temples/:id
// @access  Public
const getTempleById = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);
    
    if (!temple) {
      return res.status(404).json({ message: 'Temple not found' });
    }

    res.json(temple);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create temple
// @route   POST /api/temples
// @access  Private/Admin
const createTemple = async (req, res) => {
  try {
    const temple = await Temple.create(req.body);
    res.status(201).json(temple);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update temple
// @route   PUT /api/temples/:id
// @access  Private/Admin
const updateTemple = async (req, res) => {
  try {
    const temple = await Temple.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!temple) {
      return res.status(404).json({ message: 'Temple not found' });
    }

    res.json(temple);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete temple
// @route   DELETE /api/temples/:id
// @access  Private/Admin
const deleteTemple = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);

    if (!temple) {
      return res.status(404).json({ message: 'Temple not found' });
    }

    temple.isActive = false;
    await temple.save();

    res.json({ message: 'Temple deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllTemples,
  getTempleById,
  createTemple,
  updateTemple,
  deleteTemple,
};
