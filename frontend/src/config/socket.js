import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

// Queue socket connection
export const queueSocket = io(`${SOCKET_URL}/queue`, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

// Emergency socket connection
export const emergencySocket = io(`${SOCKET_URL}/emergency`, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

// Connect to queue socket
export const connectQueueSocket = (templeId, userId) => {
  if (!queueSocket.connected) {
    queueSocket.connect();
  }
  
  if (templeId) {
    queueSocket.emit('join-temple', templeId);
  }
  
  if (userId) {
    queueSocket.emit('join-user', userId);
  }
};

// Disconnect from queue socket
export const disconnectQueueSocket = (templeId) => {
  if (templeId) {
    queueSocket.emit('leave-temple', templeId);
  }
  queueSocket.disconnect();
};

// Connect to emergency socket
export const connectEmergencySocket = (isResponder, userId) => {
  if (!emergencySocket.connected) {
    emergencySocket.connect();
  }
  
  if (isResponder) {
    emergencySocket.emit('join-responders');
  }
  
  if (userId) {
    emergencySocket.emit('join-user', userId);
  }
};

// Disconnect from emergency socket
export const disconnectEmergencySocket = () => {
  emergencySocket.disconnect();
};

export default {
  queueSocket,
  emergencySocket,
  connectQueueSocket,
  disconnectQueueSocket,
  connectEmergencySocket,
  disconnectEmergencySocket,
};
