const mongoose = require('mongoose');

const templeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  capacity: {
    type: Number,
    default: 100,
  },
  timings: {
    opening: {
      type: String,
      default: '06:00',
    },
    closing: {
      type: String,
      default: '20:00',
    },
  },
  timeSlots: [{
    slot: String,
    capacity: Number,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Temple', templeSchema);
