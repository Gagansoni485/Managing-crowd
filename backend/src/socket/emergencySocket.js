const EmergencyRequest = require('../models/EmergencyRequest');

// Initialize emergency socket handlers
const initializeEmergencySocket = (io) => {
  const emergencyNamespace = io.of('/emergency');

  emergencyNamespace.on('connection', (socket) => {
    console.log('Emergency socket connected:', socket.id);

    // Join volunteer/admin room to receive emergency alerts
    socket.on('join-responders', () => {
      socket.join('emergency-responders');
      console.log(`Socket ${socket.id} joined emergency responders`);
    });

    // Join user room to receive updates on their emergency
    socket.on('join-user', (userId) => {
      socket.join(`emergency-user-${userId}`);
      console.log(`Socket ${socket.id} joined emergency-user-${userId}`);
    });

    // Get pending emergencies
    socket.on('get-pending-emergencies', async () => {
      try {
        const emergencies = await EmergencyRequest.find({ status: 'pending' })
          .populate('userId', 'name phone')
          .sort({ priority: 1, createdAt: -1 });

        socket.emit('pending-emergencies', emergencies);
      } catch (error) {
        socket.emit('error', { message: 'Error fetching emergencies' });
      }
    });

    // Volunteer/admin acknowledges emergency
    socket.on('acknowledge-emergency', async (emergencyId) => {
      try {
        const emergency = await EmergencyRequest.findById(emergencyId);
        if (emergency) {
          emergency.status = 'in-progress';
          await emergency.save();

          // Notify user that help is on the way
          emitEmergencyUpdate(io, emergency.userId.toString(), {
            status: 'in-progress',
            message: 'Help is on the way!',
          });

          // Update all responders
          emitNewEmergencyAlert(io, { updated: true });
        }
      } catch (error) {
        socket.emit('error', { message: 'Error acknowledging emergency' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Emergency socket disconnected:', socket.id);
    });
  });

  return emergencyNamespace;
};

// Emit new emergency alert to all volunteers/admins
const emitNewEmergencyAlert = (io, emergencyData) => {
  io.of('/emergency').to('emergency-responders').emit('new-emergency', emergencyData);
};

// Emit emergency update to specific user
const emitEmergencyUpdate = (io, userId, updateData) => {
  io.of('/emergency').to(`emergency-user-${userId}`).emit('emergency-update', updateData);
};

// Emit emergency resolved notification
const emitEmergencyResolved = (io, userId, emergencyId) => {
  io.of('/emergency').to(`emergency-user-${userId}`).emit('emergency-resolved', {
    emergencyId,
    message: 'Your emergency has been resolved',
  });

  // Update responders
  emitNewEmergencyAlert(io, { updated: true });
};

module.exports = {
  initializeEmergencySocket,
  emitNewEmergencyAlert,
  emitEmergencyUpdate,
  emitEmergencyResolved,
};
