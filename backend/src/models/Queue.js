const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tokenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Token',
    required: true,
  },
  templeId: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'left', 'skipped'],
    default: 'active',
  },
  assignedVolunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  estimatedWaitTime: {
    type: Number, // in minutes
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  rejoinedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for faster queries
queueSchema.index({ templeId: 1, status: 1, position: 1 });

module.exports = mongoose.model('Queue', queueSchema);
