import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import queueApi from '../api/queueApi';

const SOCKET_URL = 'http://localhost:5000';

// Live LED-style display showing the current token being served
export default function QueueDisplay({ templeId }) {
  const [currentQueue, setCurrentQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!templeId) return;

    fetchQueue();

    // Connect to Socket.IO for real-time updates
    const socket = io(`${SOCKET_URL}/queue`);
    socket.emit('join-temple', templeId);

    socket.on('queue-updated', () => {
      fetchQueue();
    });

    return () => {
      socket.disconnect();
    };
  }, [templeId]);

  const fetchQueue = async () => {
    try {
      const data = await queueApi.getQueueByTemple(templeId);
      setCurrentQueue(data.slice(0, 5)); // Show top 5
      setLoading(false);
    } catch (error) {
      console.error('Error fetching queue:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading queue...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#0d1b2a', color: '#fff', borderRadius: '12px' }}>
      <h2 style={{ color: '#e2f382', marginBottom: '20px' }}>🎯 Now Serving</h2>
      {currentQueue.length === 0 ? (
        <p style={{ color: '#c1d8c3' }}>No active queue</p>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {currentQueue.map((item, index) => (
            <div key={item._id} style={{
              background: index === 0 ? 'rgba(226,243,130,0.2)' : 'rgba(255,255,255,0.05)',
              padding: '15px',
              borderRadius: '8px',
              border: index === 0 ? '2px solid #e2f382' : '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong style={{ color: '#e2f382', fontSize: '1.2rem' }}>
                  {index === 0 ? '🔔 ' : ''}Position {item.position}
                </strong>
                <p style={{ margin: '5px 0', color: '#c1d8c3' }}>
                  Token: {item.tokenId?.tokenNumber || 'N/A'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  background: item.status === 'active' ? '#10b981' : '#666',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.85rem'
                }}>
                  {item.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
