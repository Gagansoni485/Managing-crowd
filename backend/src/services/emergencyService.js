const EmergencyRequest = require('../models/EmergencyRequest');

// Determine priority based on emergency type and keywords
const determinePriority = (type, description) => {
  const criticalKeywords = ['severe', 'critical', 'urgent', 'life-threatening', 'unconscious'];
  const highKeywords = ['injury', 'pain', 'bleeding', 'help needed'];
  
  const lowerDesc = description.toLowerCase();
  
  if (type === 'medical' || criticalKeywords.some(keyword => lowerDesc.includes(keyword))) {
    return 'critical';
  }
  
  if (highKeywords.some(keyword => lowerDesc.includes(keyword))) {
    return 'high';
  }
  
  return 'medium';
};

// Get pending emergencies sorted by priority
const getPendingEmergencies = async () => {
  try {
    const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
    
    const emergencies = await EmergencyRequest.find({ status: 'pending' })
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });
    
    // Sort by priority
    emergencies.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    return emergencies;
  } catch (error) {
    console.error('Error getting pending emergencies:', error);
    return [];
  }
};

// Assign emergency to volunteer
const assignEmergency = async (emergencyId, volunteerId) => {
  try {
    const emergency = await EmergencyRequest.findById(emergencyId);
    
    if (!emergency) {
      return null;
    }
    
    emergency.status = 'in-progress';
    emergency.respondedBy = volunteerId;
    emergency.respondedAt = Date.now();
    await emergency.save();
    
    return emergency;
  } catch (error) {
    console.error('Error assigning emergency:', error);
    return null;
  }
};

// Get emergency statistics
const getEmergencyStats = async () => {
  try {
    const total = await EmergencyRequest.countDocuments();
    const pending = await EmergencyRequest.countDocuments({ status: 'pending' });
    const inProgress = await EmergencyRequest.countDocuments({ status: 'in-progress' });
    const resolved = await EmergencyRequest.countDocuments({ status: 'resolved' });
    
    return {
      total,
      pending,
      inProgress,
      resolved,
    };
  } catch (error) {
    console.error('Error getting emergency stats:', error);
    return null;
  }
};

module.exports = {
  determinePriority,
  getPendingEmergencies,
  assignEmergency,
  getEmergencyStats,
};
