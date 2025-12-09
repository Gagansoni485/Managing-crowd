const Queue = require('../models/Queue');
const { calculateWaitTime } = require('../services/queueService');

// Initialize queue socket handlers
const initializeQueueSocket = (io) => {
  const queueNamespace = io.of('/queue');

  queueNamespace.on('connection', (socket) => {
    console.log('Queue socket connected:', socket.id);

    // Join temple-specific room
    socket.on('join-temple', (templeId) => {
      socket.join(`temple-${templeId}`);
      console.log(`Socket ${socket.id} joined temple-${templeId}`);
    });

    // Leave temple room
    socket.on('leave-temple', (templeId) => {
      socket.leave(`temple-${templeId}`);
      console.log(`Socket ${socket.id} left temple-${templeId}`);
    });

    // Join user-specific room for personal queue updates
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`Socket ${socket.id} joined user-${userId}`);
    });

    // Get current queue status
    socket.on('get-queue-status', async (templeId) => {
      try {
        const queues = await Queue.find({ templeId, status: 'active' })
          .populate('userId', 'name')
          .populate('tokenId')
          .sort({ position: 1 });

        socket.emit('queue-status', queues);
      } catch (error) {
        socket.emit('error', { message: 'Error fetching queue status' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Queue socket disconnected:', socket.id);
    });
  });

  return queueNamespace;
};

// Emit queue update to all clients in temple room
const emitQueueUpdate = (io, templeId, queueData) => {
  io.of('/queue').to(`temple-${templeId}`).emit('queue-updated', queueData);
};

// Emit personal queue update to specific user
const emitPersonalQueueUpdate = (io, userId, queueData) => {
  io.of('/queue').to(`user-${userId}`).emit('personal-queue-update', queueData);
};

// Emit queue position change
const emitPositionChange = async (io, templeId, queueId) => {
  try {
    const queue = await Queue.findById(queueId)
      .populate('userId', 'name')
      .populate('tokenId');

    if (queue) {
      const waitTime = await calculateWaitTime(templeId, queue.position);
      
      // Update user's personal queue info
      emitPersonalQueueUpdate(io, queue.userId._id.toString(), {
        position: queue.position,
        estimatedWaitTime: waitTime,
        status: queue.status,
      });

      // Update temple queue display
      emitQueueUpdate(io, templeId, { updated: true });
    }
  } catch (error) {
    console.error('Error emitting position change:', error);
  }
};

module.exports = {
  initializeQueueSocket,
  emitQueueUpdate,
  emitPersonalQueueUpdate,
  emitPositionChange,
};
