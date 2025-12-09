const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  slotNumber: {
    type: String,
    required: true,
  },
  zone: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['regular', 'handicapped', 'vip', 'two-wheeler', 'four-wheeler'],
    default: 'regular',
  },
  isOccupied: {
    type: Boolean,
    default: false,
  },
  vehicleNumber: {
    type: String,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound index for unique slot in zone
parkingSlotSchema.index({ slotNumber: 1, zone: 1 }, { unique: true });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
