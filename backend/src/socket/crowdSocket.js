const CrowdHeatmap = require('../models/CrowdHeatmap');

const initializeCrowdSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected to crowd heatmap socket:', socket.id);

    // Join crowd monitoring room
    socket.on('crowd:join', () => {
      socket.join('crowd-monitoring');
      console.log(`Socket ${socket.id} joined crowd monitoring room`);
    });

    // Leave crowd monitoring room
    socket.on('crowd:leave', () => {
      socket.leave('crowd-monitoring');
      console.log(`Socket ${socket.id} left crowd monitoring room`);
    });

    // Request latest heatmap data
    socket.on('crowd:request-latest', async () => {
      try {
        const latestHeatmap = await CrowdHeatmap.findOne()
          .sort({ timestamp: -1 })
          .limit(1);

        if (latestHeatmap) {
          socket.emit('crowd:heatmap-update', {
            id: latestHeatmap._id,
            timestamp: latestHeatmap.timestamp,
            overallPeopleCount: latestHeatmap.overallPeopleCount,
            overallRushStatus: latestHeatmap.overallRushStatus,
            zones: latestHeatmap.zones,
            frameWidth: latestHeatmap.frameWidth,
            frameHeight: latestHeatmap.frameHeight,
          });
        }
      } catch (error) {
        console.error('Error fetching latest heatmap:', error);
        socket.emit('crowd:error', { message: 'Failed to fetch heatmap data' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected from crowd socket:', socket.id);
    });
  });
};

module.exports = { initializeCrowdSocket };
