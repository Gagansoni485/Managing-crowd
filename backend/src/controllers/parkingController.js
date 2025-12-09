const ParkingSlot = require('../models/ParkingSlot');

// @desc    Get all parking slots
// @route   GET /api/parking
// @access  Public
const getAllParkingSlots = async (req, res) => {
  try {
    const slots = await ParkingSlot.find({}).sort({ slotNumber: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available parking slots
// @route   GET /api/parking/available
// @access  Public
const getAvailableParkingSlots = async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ isOccupied: false }).sort({ slotNumber: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update parking slot status
// @route   PUT /api/parking/:id
// @access  Private/Admin
const updateParkingSlot = async (req, res) => {
  try {
    const { isOccupied, vehicleNumber } = req.body;
    const slot = await ParkingSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    slot.isOccupied = isOccupied;
    slot.vehicleNumber = vehicleNumber || null;
    slot.lastUpdated = Date.now();

    await slot.save();

    res.json({ message: 'Parking slot updated', slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create parking slot
// @route   POST /api/parking
// @access  Private/Admin
const createParkingSlot = async (req, res) => {
  try {
    const { slotNumber, zone, type } = req.body;

    const slotExists = await ParkingSlot.findOne({ slotNumber, zone });
    if (slotExists) {
      return res.status(400).json({ message: 'Parking slot already exists' });
    }

    const slot = await ParkingSlot.create({
      slotNumber,
      zone,
      type: type || 'regular',
      isOccupied: false,
    });

    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk update parking slots from computer vision
// @route   POST /api/parking/bulk-update
// @access  Private/System
const bulkUpdateParkingSlots = async (req, res) => {
  try {
    const { slots } = req.body; // Array of { slotNumber, isOccupied }

    const updates = slots.map(async (slotData) => {
      const slot = await ParkingSlot.findOne({ slotNumber: slotData.slotNumber });
      if (slot) {
        slot.isOccupied = slotData.isOccupied;
        slot.lastUpdated = Date.now();
        return slot.save();
      }
    });

    await Promise.all(updates);

    res.json({ message: 'Parking slots updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllParkingSlots,
  getAvailableParkingSlots,
  updateParkingSlot,
  createParkingSlot,
  bulkUpdateParkingSlots,
};
