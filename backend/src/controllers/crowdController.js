const CrowdHeatmap = require('../models/CrowdHeatmap');
const EmergencyRequest = require('../models/EmergencyRequest');
const User = require('../models/User');

// Thresholds configuration
const THRESHOLDS = {
  zones: {
    entrance: { warning: 30, high: 45, critical: 60 },
    queue: { warning: 40, high: 60, critical: 80 },
    darshan: { warning: 50, high: 70, critical: 90 },
    parking: { warning: 20, high: 30, critical: 40 },
    default: { warning: 25, high: 40, critical: 55 },
  },
  density: {
    warning: 0.4,
    high: 0.6,
    critical: 0.8,
  },
  cooldownMinutes: 10, // Don't send multiple alerts within this time
};

// Store last alert time per zone
const lastAlertTime = {};

// Receive heatmap data from Python CV system
exports.receiveHeatmapData = async (req, res) => {
  try {
    const { timestamp, zones, frameWidth, frameHeight, overallPeopleCount } = req.body;

    if (!zones || !Array.isArray(zones)) {
      return res.status(400).json({ message: 'Invalid heatmap data format' });
    }

    // Calculate overall rush status
    const overallRushStatus = calculateOverallRushStatus(zones);

    // Create heatmap record
    const heatmapData = new CrowdHeatmap({
      timestamp: timestamp || new Date(),
      overallPeopleCount: overallPeopleCount || zones.reduce((sum, z) => sum + z.peopleCount, 0),
      overallRushStatus,
      zones,
      frameWidth,
      frameHeight,
      alertTriggered: false,
    });

    await heatmapData.save();

    // Check if alert should be triggered
    const alertsTriggered = [];
    for (const zone of zones) {
      const shouldAlert = await checkAlertThreshold(zone);
      if (shouldAlert) {
        const emergencyRequest = await createRushAlert(zone, heatmapData._id);
        alertsTriggered.push({
          zone: zone.zoneName,
          alertLevel: zone.alertLevel,
          emergencyRequestId: emergencyRequest._id,
        });
        heatmapData.alertTriggered = true;
        heatmapData.emergencyRequestId = emergencyRequest._id;
      }
    }

    if (alertsTriggered.length > 0) {
      await heatmapData.save();
      
      // Emit real-time alert via Socket.IO
      const io = req.app.get('io');
      io.emit('crowd:rush-alert', {
        heatmapId: heatmapData._id,
        alerts: alertsTriggered,
        timestamp: new Date(),
      });
    }

    // Emit real-time heatmap update to all connected clients
    const io = req.app.get('io');
    io.emit('crowd:heatmap-update', {
      id: heatmapData._id,
      timestamp: heatmapData.timestamp,
      overallPeopleCount: heatmapData.overallPeopleCount,
      overallRushStatus: heatmapData.overallRushStatus,
      zones: heatmapData.zones,
      frameWidth: heatmapData.frameWidth,
      frameHeight: heatmapData.frameHeight,
    });

    res.status(201).json({
      success: true,
      message: 'Heatmap data received',
      heatmapId: heatmapData._id,
      alertsTriggered: alertsTriggered.length,
    });

  } catch (error) {
    console.error('Error receiving heatmap data:', error);
    res.status(500).json({ message: 'Failed to process heatmap data', error: error.message });
  }
};

// Get current heatmap status
exports.getCurrentHeatmap = async (req, res) => {
  try {
    const latestHeatmap = await CrowdHeatmap.findOne()
      .sort({ timestamp: -1 })
      .limit(1);

    if (!latestHeatmap) {
      return res.status(404).json({ message: 'No heatmap data available' });
    }

    res.json({
      success: true,
      data: latestHeatmap,
    });

  } catch (error) {
    console.error('Error fetching current heatmap:', error);
    res.status(500).json({ message: 'Failed to fetch heatmap data', error: error.message });
  }
};

// Get heatmap history for a specific zone
exports.getHeatmapHistory = async (req, res) => {
  try {
    const { zoneId } = req.params;
    const { hours = 1 } = req.query;

    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const heatmaps = await CrowdHeatmap.find({
      timestamp: { $gte: startTime },
      'zones.zoneId': zoneId,
    })
      .sort({ timestamp: -1 })
      .select('timestamp zones overallPeopleCount overallRushStatus');

    const zoneHistory = heatmaps.map(h => {
      const zone = h.zones.find(z => z.zoneId === zoneId);
      return {
        timestamp: h.timestamp,
        peopleCount: zone ? zone.peopleCount : 0,
        density: zone ? zone.density : 0,
        alertLevel: zone ? zone.alertLevel : 'normal',
      };
    });

    res.json({
      success: true,
      zoneId,
      history: zoneHistory,
    });

  } catch (error) {
    console.error('Error fetching heatmap history:', error);
    res.status(500).json({ message: 'Failed to fetch history', error: error.message });
  }
};

// Get analytics/statistics
exports.getAnalytics = async (req, res) => {
  try {
    const { period = 'today' } = req.query;

    let startTime;
    if (period === 'today') {
      startTime = new Date();
      startTime.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    const heatmaps = await CrowdHeatmap.find({
      timestamp: { $gte: startTime },
    }).sort({ timestamp: 1 });

    // Calculate peak times
    const peakPeopleCount = Math.max(...heatmaps.map(h => h.overallPeopleCount));
    const peakTime = heatmaps.find(h => h.overallPeopleCount === peakPeopleCount);

    // Calculate average by hour
    const hourlyAverages = {};
    heatmaps.forEach(h => {
      const hour = new Date(h.timestamp).getHours();
      if (!hourlyAverages[hour]) {
        hourlyAverages[hour] = { total: 0, count: 0 };
      }
      hourlyAverages[hour].total += h.overallPeopleCount;
      hourlyAverages[hour].count += 1;
    });

    const avgByHour = Object.keys(hourlyAverages).map(hour => ({
      hour: parseInt(hour),
      average: Math.round(hourlyAverages[hour].total / hourlyAverages[hour].count),
    }));

    res.json({
      success: true,
      analytics: {
        period,
        totalRecords: heatmaps.length,
        peakPeopleCount,
        peakTime: peakTime ? peakTime.timestamp : null,
        averageByHour: avgByHour,
        currentStatus: heatmaps.length > 0 ? heatmaps[heatmaps.length - 1].overallRushStatus : 'normal',
      },
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

// Configure thresholds (admin only)
exports.configureThresholds = async (req, res) => {
  try {
    const { zoneId, warning, high, critical } = req.body;

    // Update thresholds in memory (in production, store in DB)
    if (!THRESHOLDS.zones[zoneId]) {
      THRESHOLDS.zones[zoneId] = {};
    }

    THRESHOLDS.zones[zoneId] = { warning, high, critical };

    res.json({
      success: true,
      message: 'Thresholds updated successfully',
      thresholds: THRESHOLDS.zones[zoneId],
    });

  } catch (error) {
    console.error('Error configuring thresholds:', error);
    res.status(500).json({ message: 'Failed to configure thresholds', error: error.message });
  }
};

// Helper function to calculate overall rush status
function calculateOverallRushStatus(zones) {
  const criticalZones = zones.filter(z => z.alertLevel === 'critical').length;
  const highZones = zones.filter(z => z.alertLevel === 'high').length;
  const warningZones = zones.filter(z => z.alertLevel === 'warning').length;

  if (criticalZones > 0) return 'critical';
  if (highZones > 0) return 'high';
  if (warningZones > 0) return 'moderate';
  return 'normal';
}

// Helper function to check if alert should be triggered
async function checkAlertThreshold(zone) {
  const { zoneId, alertLevel, peopleCount } = zone;

  // Only trigger for high or critical levels
  if (alertLevel !== 'high' && alertLevel !== 'critical') {
    return false;
  }

  // Check cooldown period
  const now = Date.now();
  const lastAlert = lastAlertTime[zoneId];
  const cooldownMs = THRESHOLDS.cooldownMinutes * 60 * 1000;

  if (lastAlert && (now - lastAlert) < cooldownMs) {
    return false; // Still in cooldown period
  }

  // Update last alert time
  lastAlertTime[zoneId] = now;
  return true;
}

// Helper function to create rush alert as emergency request
async function createRushAlert(zone, heatmapId) {
  try {
    // Find admin user to assign
    const admin = await User.findOne({ role: 'admin' });

    const emergencyRequest = new EmergencyRequest({
      userId: admin ? admin._id : null,
      type: 'security', // Using existing enum
      description: `CROWD RUSH ALERT: ${zone.zoneName} zone has reached ${zone.alertLevel} density with ${zone.peopleCount} people detected.`,
      location: zone.zoneName,
      status: 'pending',
      priority: zone.alertLevel === 'critical' ? 'critical' : 'high',
    });

    await emergencyRequest.save();
    return emergencyRequest;

  } catch (error) {
    console.error('Error creating rush alert:', error);
    throw error;
  }
}

module.exports = exports;
