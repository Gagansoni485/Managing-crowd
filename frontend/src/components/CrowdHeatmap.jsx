import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import '../styles/CrowdHeatmap.css';

const SOCKET_URL = 'http://localhost:5000';

export default function CrowdHeatmap() {
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to crowd heatmap socket');
      setIsConnected(true);
      newSocket.emit('crowd:join');
      newSocket.emit('crowd:request-latest');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from crowd heatmap socket');
      setIsConnected(false);
    });

    newSocket.on('crowd:heatmap-update', (data) => {
      console.log('Heatmap update received:', data);
      setHeatmapData(data);
    });

    newSocket.on('crowd:rush-alert', (data) => {
      console.log('Rush alert received:', data);
      setAlerts(prev => [data, ...prev.slice(0, 4)]); // Keep last 5 alerts
      
      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification('🚨 Crowd Rush Alert!', {
          body: `Alert in ${data.alerts.length} zone(s)`,
          icon: '/alert-icon.png'
        });
      }
    });

    return () => {
      newSocket.emit('crowd:leave');
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (heatmapData && canvasRef.current) {
      renderHeatmap();
    }
  }, [heatmapData]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const renderHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas || !heatmapData) return;

    const ctx = canvas.getContext('2d');
    const { zones, frameWidth, frameHeight } = heatmapData;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scale factors
    const scaleX = canvas.width / frameWidth;
    const scaleY = canvas.height / frameHeight;

    // Draw each zone
    zones.forEach(zone => {
      const { zoneId, zoneName, peopleCount, alertLevel, boundingBoxes } = zone;

      // Determine zone coordinates (you can customize this based on actual zones)
      let zoneRect;
      if (zoneId === 'entrance') {
        zoneRect = { x: 0, y: 0, width: canvas.width / 3, height: canvas.height / 2 };
      } else if (zoneId === 'queue') {
        zoneRect = { x: canvas.width / 3, y: 0, width: canvas.width / 3, height: canvas.height };
      } else if (zoneId === 'darshan') {
        zoneRect = { x: 2 * canvas.width / 3, y: 0, width: canvas.width / 3, height: canvas.height / 2 };
      } else if (zoneId === 'exit') {
        zoneRect = { x: 2 * canvas.width / 3, y: canvas.height / 2, width: canvas.width / 3, height: canvas.height / 2 };
      } else {
        return;
      }

      // Draw zone background with alert color
      const alertColors = {
        normal: 'rgba(0, 255, 0, 0.1)',
        warning: 'rgba(255, 255, 0, 0.2)',
        high: 'rgba(255, 165, 0, 0.3)',
        critical: 'rgba(255, 0, 0, 0.4)'
      };

      ctx.fillStyle = alertColors[alertLevel] || alertColors.normal;
      ctx.fillRect(zoneRect.x, zoneRect.y, zoneRect.width, zoneRect.height);

      // Draw zone border
      const borderColors = {
        normal: '#00ff00',
        warning: '#ffff00',
        high: '#ffa500',
        critical: '#ff0000'
      };

      ctx.strokeStyle = borderColors[alertLevel] || '#ffffff';
      ctx.lineWidth = alertLevel === 'critical' ? 4 : 2;
      ctx.strokeRect(zoneRect.x, zoneRect.y, zoneRect.width, zoneRect.height);

      // Draw zone label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(zoneName.toUpperCase(), zoneRect.x + 10, zoneRect.y + 30);

      // Draw people count
      ctx.font = '16px Arial';
      ctx.fillText(`👥 ${peopleCount} people`, zoneRect.x + 10, zoneRect.y + 55);

      // Draw alert indicator
      if (alertLevel !== 'normal') {
        ctx.beginPath();
        ctx.arc(zoneRect.x + 20, zoneRect.y + 75, 8, 0, 2 * Math.PI);
        ctx.fillStyle = borderColors[alertLevel];
        ctx.fill();
        
        // Pulsing effect for critical
        if (alertLevel === 'critical') {
          const pulse = Math.sin(Date.now() / 200) * 3 + 8;
          ctx.beginPath();
          ctx.arc(zoneRect.x + 20, zoneRect.y + 75, pulse, 0, 2 * Math.PI);
          ctx.strokeStyle = borderColors[alertLevel];
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Draw bounding boxes for detected people
      if (boundingBoxes && boundingBoxes.length > 0) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1;
        boundingBoxes.slice(0, 10).forEach(bbox => { // Limit to 10 for performance
          const x1 = bbox.x1 * scaleX;
          const y1 = bbox.y1 * scaleY;
          const width = (bbox.x2 - bbox.x1) * scaleX;
          const height = (bbox.y2 - bbox.y1) * scaleY;
          ctx.strokeRect(x1, y1, width, height);
        });
      }
    });

    // Draw timestamp
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    const timestamp = new Date(heatmapData.timestamp).toLocaleTimeString();
    ctx.fillText(`Updated: ${timestamp}`, 10, canvas.height - 10);
  };

  const getAlertLevelColor = (level) => {
    const colors = {
      normal: '#10b981',
      warning: '#fbbf24',
      high: '#f97316',
      critical: '#ef4444'
    };
    return colors[level] || '#6b7280';
  };

  const getAlertLevelIcon = (level) => {
    const icons = {
      normal: '✓',
      warning: '⚠️',
      high: '🔶',
      critical: '🚨'
    };
    return icons[level] || '•';
  };

  const dismissAlert = (index) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="crowd-heatmap-container">
      {/* Header */}
      <div className="heatmap-header">
        <h2>🎯 Real-Time Crowd Density Monitor</h2>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? 'Live' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="heatmap-content">
        {/* Canvas Display */}
        <div className="heatmap-canvas-section">
          <canvas ref={canvasRef} className="heatmap-canvas"></canvas>
          
          {!heatmapData && (
            <div className="no-data-overlay">
              <div className="spinner"></div>
              <p>Waiting for heatmap data...</p>
              <p className="hint">Make sure the Python CV script is running</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="heatmap-sidebar">
          {/* Overall Stats */}
          {heatmapData && (
            <div className="stats-card">
              <h3>Overall Statistics</h3>
              <div className="stat-item">
                <span className="stat-label">Total People:</span>
                <span className="stat-value">{heatmapData.overallPeopleCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Status:</span>
                <span className={`status-badge ${heatmapData.overallRushStatus}`}>
                  {heatmapData.overallRushStatus.toUpperCase()}
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${heatmapData.overallRushStatus}`}
                  style={{ width: `${Math.min((heatmapData.overallPeopleCount / 300) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Zone Details */}
          {heatmapData && (
            <div className="zones-card">
              <h3>Zone Status</h3>
              {heatmapData.zones.map((zone, index) => (
                <div key={index} className="zone-item">
                  <div className="zone-header">
                    <span className="zone-icon">{getAlertLevelIcon(zone.alertLevel)}</span>
                    <span className="zone-name">{zone.zoneName}</span>
                  </div>
                  <div className="zone-stats">
                    <span className="zone-count">👥 {zone.peopleCount}</span>
                    <span 
                      className="zone-alert-badge"
                      style={{ backgroundColor: getAlertLevelColor(zone.alertLevel) }}
                    >
                      {zone.alertLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active Alerts */}
          <div className="alerts-card">
            <h3>🚨 Active Alerts</h3>
            {alerts.length === 0 ? (
              <p className="no-alerts">No active alerts</p>
            ) : (
              alerts.map((alert, index) => (
                <div key={index} className="alert-item">
                  <button 
                    className="dismiss-btn"
                    onClick={() => dismissAlert(index)}
                  >
                    ×
                  </button>
                  <div className="alert-content">
                    <p className="alert-zones">
                      {alert.alerts.map(a => a.zone).join(', ')}
                    </p>
                    <p className="alert-time">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Legend */}
          <div className="legend-card">
            <h3>Alert Levels</h3>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
                <span>Normal (&lt;60%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#fbbf24' }}></span>
                <span>Warning (60-75%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#f97316' }}></span>
                <span>High (75-90%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
                <span>Critical (&gt;90%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
