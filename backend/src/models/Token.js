const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  templeId: {
    type: String,
    required: true,
  },
  tokenNumber: {
    type: String,
    unique: true,
  },
  visitDate: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  numberOfVisitors: {
    type: Number,
    default: 1,
    min: 1,
  },
  status: {
    type: String,
    enum: ['active', 'used', 'expired', 'cancelled'],
    default: 'active',
  },
  qrCode: {
    type: String,
  },
  // Auto-queue fields
  queueStatus: {
    type: String,
    enum: ['pending', 'in-queue', 'completed', 'expired', null],
    default: null,
  },
  queuePosition: {
    type: Number,
    default: null,
  },
  estimatedWaitTime: {
    type: Number, // in minutes
    default: null,
  },
  autoQueued: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Generate unique token number before saving
tokenSchema.pre('save', async function(next) {
  if (!this.tokenNumber) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.tokenNumber = `TKN${date}${random}`;
  }
  next();
});

module.exports = mongoose.model('Token', tokenSchema);
