const mongoose = require('mongoose');

const zoneDataSchema = new mongoose.Schema({
  zoneId: {
    type: String,
    required: true,
  },
  zoneName: {
    type: String,
    required: true,
  },
  peopleCount: {
    type: Number,
    required: true,
    default: 0,
  },
  density: {
    type: Number,
    required: true,
    default: 0,
  },
  heatmapGrid: {
    type: [[Number]],
    required: true,
  },
  alertLevel: {
    type: String,
    enum: ['normal', 'warning', 'high', 'critical'],
    default: 'normal',
  },
  boundingBoxes: [{
    x1: Number,
    y1: Number,
    x2: Number,
    y2: Number,
    trackId: Number,
  }],
});

const crowdHeatmapSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  overallPeopleCount: {
    type: Number,
    required: true,
    default: 0,
  },
  overallRushStatus: {
    type: String,
    enum: ['normal', 'moderate', 'high', 'critical'],
    default: 'normal',
  },
  zones: [zoneDataSchema],
  frameWidth: {
    type: Number,
    required: true,
  },
  frameHeight: {
    type: Number,
    required: true,
  },
  alertTriggered: {
    type: Boolean,
    default: false,
  },
  emergencyRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmergencyRequest',
  },
}, {
  timestamps: true,
});

// Index for faster queries
crowdHeatmapSchema.index({ timestamp: -1 });
crowdHeatmapSchema.index({ overallRushStatus: 1, timestamp: -1 });

// Auto-delete old records after 7 days
crowdHeatmapSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('CrowdHeatmap', crowdHeatmapSchema);
