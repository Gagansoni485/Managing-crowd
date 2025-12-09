const Queue = require('../models/Queue');
const Token = require('../models/Token');

// Check if booking is for today and within active time window
const isSameDayBooking = (visitDate, timeSlot) => {
  const now = new Date();
  const bookingDate = new Date(visitDate);
  
  // Check if same day
  const isSameDay = bookingDate.toDateString() === now.toDateString();
  
  if (!isSameDay) return false;
  
  // Extract start time from slot (format: "HH:MM-HH:MM" or "HH:MM")
  const timeSlotStart = timeSlot.split('-')[0].trim();
  const [hours, minutes] = timeSlotStart.split(':').map(Number);
  
  const slotStartTime = new Date(bookingDate);
  slotStartTime.setHours(hours, minutes, 0, 0);
  
  // Slot hasn't passed yet
  return now < slotStartTime || (now.getHours() === hours && now.getMinutes() < minutes + 60);
};

// Auto-create queue entry for same-day bookings
const autoCreateQueueEntry = async (token, userId) => {
  try {
    // Check if already in queue
    const existingQueue = await Queue.findOne({ tokenId: token._id });
    if (existingQueue) {
      return existingQueue;
    }
    
    // Get current queue count for this temple
    const queueCount = await Queue.countDocuments({ 
      templeId: token.templeId, 
      status: 'active' 
    });
    
    const position = queueCount + 1;
    const waitTime = await calculateWaitTime(token.templeId, position);
    
    // Create queue entry
    const queue = await Queue.create({
      userId: userId,
      tokenId: token._id,
      templeId: token.templeId,
      position: position,
      status: 'active',
      estimatedWaitTime: waitTime,
    });
    
    // Update token with queue info
    token.queueStatus = 'in-queue';
    token.queuePosition = position;
    token.estimatedWaitTime = waitTime;
    token.autoQueued = true;
    await token.save();
    
    console.log(`✅ Auto-queued token ${token.tokenNumber} at position ${position}`);
    
    return queue;
  } catch (error) {
    console.error('Error auto-creating queue entry:', error);
    return null;
  }
};

// Calculate estimated wait time based on queue position
const calculateWaitTime = async (templeId, position) => {
  try {
    const avgTimePerPerson = 5; // minutes - can be configured per temple
    return position * avgTimePerPerson;
  } catch (error) {
    console.error('Error calculating wait time:', error);
    return null;
  }
};

// Auto-expire past bookings
const expirePastBookings = async () => {
  try {
    const now = new Date();
    
    // Find all active tokens with past dates
    const pastTokens = await Token.find({
      status: 'active',
      visitDate: { $lt: now }
    });
    
    // Update their status to expired
    if (pastTokens.length > 0) {
      await Token.updateMany(
        {
          status: 'active',
          visitDate: { $lt: now }
        },
        {
          $set: { status: 'expired' }
        }
      );
      console.log(`Expired ${pastTokens.length} past bookings`);
    }
    
    return pastTokens.length;
  } catch (error) {
    console.error('Error expiring past bookings:', error);
    return 0;
  }
};

// Update queue positions after someone leaves
const updateQueuePositions = async (templeId, removedPosition) => {
  try {
    await Queue.updateMany(
      { templeId, position: { $gt: removedPosition }, status: 'active' },
      { $inc: { position: -1 } }
    );
  } catch (error) {
    console.error('Error updating queue positions:', error);
  }
};

// Get current queue status for a temple
const getQueueStatus = async (templeId) => {
  try {
    const activeQueues = await Queue.find({ templeId, status: 'active' })
      .sort({ position: 1 })
      .populate('userId', 'name phone')
      .populate('tokenId');

    return {
      totalInQueue: activeQueues.length,
      queues: activeQueues,
    };
  } catch (error) {
    console.error('Error getting queue status:', error);
    return null;
  }
};

// Advance queue - mark current person as completed and move everyone up
const advanceQueue = async (templeId) => {
  try {
    const currentPerson = await Queue.findOne({ templeId, position: 1, status: 'active' });
    
    if (currentPerson) {
      currentPerson.status = 'completed';
      currentPerson.completedAt = Date.now();
      await currentPerson.save();
      
      await updateQueuePositions(templeId, 1);
    }
    
    return await getQueueStatus(templeId);
  } catch (error) {
    console.error('Error advancing queue:', error);
    return null;
  }
};

module.exports = {
  calculateWaitTime,
  updateQueuePositions,
  getQueueStatus,
  advanceQueue,
  expirePastBookings,
  isSameDayBooking,
  autoCreateQueueEntry,
};
