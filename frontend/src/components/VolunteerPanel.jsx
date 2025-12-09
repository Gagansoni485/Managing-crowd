import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import emergencyApi from '../api/emergencyApi';
import authApi from '../api/authApi';
import '../styles/VolunteerPanel.css';

export default function VolunteerPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [volunteerName, setVolunteerName] = useState('Volunteer - Meera Sharma');
  const [location, setLocation] = useState({ zone: 'Main Hall', lat: 21.2514, lng: 81.6296 });

  // Task Management - Fetch from logged-in user
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Load current user and their tasks
    const user = authApi.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setTasks(user.assignedTasks || []);
      setVolunteerName(user.name);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'emergency') {
      fetchEmergencies();
    } else if (activeTab === 'tasks') {
      // Reload user data to get latest tasks
      const user = authApi.getCurrentUser();
      if (user && user.assignedTasks) {
        setTasks(user.assignedTasks);
      }
    }
  }, [activeTab]);

  // Zone Status
  const [zoneStatus, setZoneStatus] = useState([
    { zone: 'Entry Gate', status: 'moderate', crowdLevel: 65, volunteers: 3 },
    { zone: 'Main Hall', status: 'high', crowdLevel: 85, volunteers: 5 },
    { zone: 'Exit Gate', status: 'clear', crowdLevel: 30, volunteers: 2 },
    { zone: 'Parking Area', status: 'moderate', crowdLevel: 55, volunteers: 2 },
    { zone: 'Food Court', status: 'clear', crowdLevel: 40, volunteers: 2 },
    { zone: 'Courtyard', status: 'moderate', crowdLevel: 70, volunteers: 4 }
  ]);

  // Emergency Alerts - Fetch from backend
  const [emergencyReports, setEmergencyReports] = useState([]);
  const [loadingEmergencies, setLoadingEmergencies] = useState(false);

  useEffect(() => {
    if (activeTab === 'emergency') {
      fetchEmergencies();
    }
  }, [activeTab]);

  const fetchEmergencies = async () => {
    try {
      setLoadingEmergencies(true);
      const data = await emergencyApi.getAllEmergencies();
      setEmergencyReports(data.map(em => ({
        id: em._id,
        type: em.type,
        location: em.location,
        description: em.description,
        time: getTimeAgo(new Date(em.createdAt)),
        status: em.status === 'pending' || em.status === 'in-progress' ? 'active' : 'resolved'
      })));
    } catch (error) {
      console.error('Error fetching emergencies:', error);
    } finally {
      setLoadingEmergencies(false);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Chat Messages
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Admin', message: 'All volunteers report to main hall', time: '10:15 AM', type: 'broadcast' },
    { id: 2, sender: 'Security Team', message: 'Need assistance at parking area', time: '10:20 AM', type: 'request' },
    { id: 3, sender: 'You', message: 'On my way to main hall', time: '10:25 AM', type: 'reply' }
  ]);

  // Visitor Assistance Requests
  const [assistanceRequests, setAssistanceRequests] = useState([
    { id: 1, name: 'Ramesh Kumar', type: 'slot-check', phone: '9876543210', details: 'Check booking for 2 PM slot', status: 'pending' },
    { id: 2, name: 'Priya Singh', type: 'navigation', phone: '8765432109', details: 'Need directions to main temple', status: 'pending' },
    { id: 3, name: 'Elderly Woman', type: 'priority', phone: '7654321098', details: 'Wheelchair assistance needed', status: 'in-progress' }
  ]);

  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [emergencyType, setEmergencyType] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showLocationShare, setShowLocationShare] = useState(false);

  // Update time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTaskAction = (taskId, action) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, status: action } : task
      )
    );
  };

  const updateZoneStatus = (zone, newStatus) => {
    setZoneStatus(prev =>
      prev.map(z =>
        z.zone === zone ? { ...z, status: newStatus } : z
      )
    );
    alert(`Zone "${zone}" marked as ${newStatus}`);
  };

  const reportEmergency = (type) => {
    setEmergencyType(type);
    setShowEmergencyForm(true);
  };

  const submitEmergencyReport = () => {
    const description = prompt('Describe the emergency:');
    if (description) {
      const newEmergency = {
        id: Date.now(),
        type: emergencyType,
        location: location.zone,
        description,
        time: 'Just now',
        status: 'active'
      };
      setEmergencyReports(prev => [newEmergency, ...prev]);
      alert('Emergency reported to control room!');
      setShowEmergencyForm(false);
    }
  };

  const shareLocation = () => {
    setShowLocationShare(true);
    alert(`Location shared: ${location.zone}\nCoordinates: ${location.lat}, ${location.lng}`);
    setTimeout(() => setShowLocationShare(false), 3000);
  };

  const handleAssistanceRequest = (requestId, action) => {
    setAssistanceRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, status: action } : req
      )
    );
  };

  const sendChatMessage = () => {
    const message = prompt('Enter your message:');
    if (message) {
      const newMessage = {
        id: Date.now(),
        sender: 'You',
        message,
        time: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'reply'
      };
      setChatMessages(prev => [...prev, newMessage]);
    }
  };

  const requestSupport = () => {
    const reason = prompt('Reason for requesting support:');
    if (reason) {
      alert(`Support request sent to admin: ${reason}`);
    }
  };

  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      alert('Voice recording started...');
    } else {
      alert('Voice note sent to control room!');
    }
  };

  const uploadPhoto = () => {
    alert('Photo upload feature activated. In production, this would open camera/gallery.');
  };

  return (
    <div className="volunteer-dashboard">
      {/* Header */}
      <div className="volunteer-header">
        <div className="header-left">
          <h1>⭐ Volunteer Dashboard</h1>
          <p className="volunteer-name">{volunteerName}</p>
          <p className="current-zone">📍 Current Zone: {location.zone}</p>
        </div>
        <div className="header-right">
          <div className="live-time">
            <span className="live-dot">🔴 LIVE</span>
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
          <button onClick={shareLocation} className="location-btn">
            {showLocationShare ? '✅ Location Shared!' : '📍 Share Location'}
          </button>
          <button onClick={() => navigate('/')} className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Quick Actions - Emergency Buttons */}
      <div className="quick-actions">
        <h3>🚨 Emergency Quick Actions</h3>
        <div className="emergency-buttons">
          <button onClick={() => reportEmergency('medical')} className="emergency-btn medical">
            🏥 Medical Emergency
          </button>
          <button onClick={() => reportEmergency('lost-child')} className="emergency-btn lost">
            👶 Lost Child
          </button>
          <button onClick={() => reportEmergency('stampede')} className="emergency-btn stampede">
            ⚠️ Stampede Risk
          </button>
          <button onClick={() => reportEmergency('suspicious')} className="emergency-btn suspicious">
            🔍 Suspicious Activity
          </button>
          <button onClick={toggleVoiceRecording} className={`emergency-btn voice ${isRecording ? 'recording' : ''}`}>
            {isRecording ? '⏹️ Stop Recording' : '🎤 Voice Note'}
          </button>
          <button onClick={uploadPhoto} className="emergency-btn photo">
            📸 Upload Photo
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="volunteer-tabs">
        <button className={activeTab === 'tasks' ? 'tab active' : 'tab'} onClick={() => setActiveTab('tasks')}>
          ✅ My Tasks
        </button>
        <button className={activeTab === 'zones' ? 'tab active' : 'tab'} onClick={() => setActiveTab('zones')}>
          🧭 Zone Map
        </button>
        <button className={activeTab === 'emergency' ? 'tab active' : 'tab'} onClick={() => setActiveTab('emergency')}>
          🚨 Emergencies
        </button>
        <button className={activeTab === 'communication' ? 'tab active' : 'tab'} onClick={() => setActiveTab('communication')}>
          💬 Communication
        </button>
        <button className={activeTab === 'assistance' ? 'tab active' : 'tab'} onClick={() => setActiveTab('assistance')}>
          🎫 Visitor Support
        </button>
      </div>

      {/* Main Content */}
      <div className="volunteer-content">
        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="tasks-section">
            <div className="section-header">
              <h2>📋 Assigned Tasks & Duties</h2>
              <button onClick={requestSupport} className="support-btn">🆘 Request Support</button>
            </div>

            <div className="tasks-grid">
              {tasks.length === 0 ? (
                <p className="no-tasks">No tasks assigned yet</p>
              ) : (
                tasks.map((task, index) => (
                  <div key={task._id || index} className={`task-card ${task.status} priority-${task.priority}`}>
                    <div className="task-header">
                      <span className={`priority-badge ${task.priority}`}>
                        {task.priority === 'urgent' && '🔴'}
                        {task.priority === 'high' && '🟠'}
                        {task.priority === 'medium' && '🟡'}
                        {' '}{task.priority?.toUpperCase()}
                      </span>
                      <span className="task-time">
                        {task.assignedAt ? new Date(task.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <h3>{task.task}</h3>
                    {task.zone && <p className="task-zone">📍 Zone: {task.zone}</p>}
                    <div className="task-actions">
                      {task.status === 'pending' && (
                        <>
                          <button onClick={() => handleTaskAction(index, 'in-progress')} className="btn-start">
                            ▶️ Start Task
                          </button>
                          <button onClick={() => handleTaskAction(index, 'completed')} className="btn-skip">
                            ⏭️ Skip
                          </button>
                        </>
                      )}
                      {task.status === 'in-progress' && (
                        <button onClick={() => handleTaskAction(index, 'completed')} className="btn-complete">
                          ✅ Mark Complete
                        </button>
                      )}
                      {task.status === 'completed' && (
                        <span className="completed-badge">✅ Completed</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ZONES TAB */}
        {activeTab === 'zones' && (
          <div className="zones-section">
            <h2>🧭 Temple Zone Map & Crowd Density</h2>
            
            <div className="zone-map-container">
              <div className="map-placeholder">
                <h3>🗺️ Interactive Temple Map</h3>
                <p>Live crowd density visualization</p>
                <div className="map-grid">
                  {zoneStatus.map((zone, idx) => (
                    <div key={idx} className={`map-zone ${zone.status}`}>
                      <strong>{zone.zone}</strong>
                      <p>{zone.crowdLevel}% Full</p>
                      <p>👥 {zone.volunteers} volunteers</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="zone-controls">
              <h3>🎛️ Zone Status Controls</h3>
              <div className="zones-list">
                {zoneStatus.map((zone, idx) => (
                  <div key={idx} className="zone-item">
                    <div className="zone-info">
                      <h4>{zone.zone}</h4>
                      <div className="crowd-bar">
                        <div className="crowd-fill" style={{ width: `${zone.crowdLevel}%`, background: zone.crowdLevel > 80 ? '#dc2626' : zone.crowdLevel > 50 ? '#f59e0b' : '#10b981' }}></div>
                      </div>
                      <p>{zone.crowdLevel}% Capacity</p>
                    </div>
                    <div className="zone-actions">
                      <button onClick={() => updateZoneStatus(zone.zone, 'clear')} className="status-btn clear">🟢 Clear</button>
                      <button onClick={() => updateZoneStatus(zone.zone, 'moderate')} className="status-btn moderate">🟡 Moderate</button>
                      <button onClick={() => updateZoneStatus(zone.zone, 'high')} className="status-btn high">🔴 Crowded</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="navigation-help">
              <h3>🧭 Quick Navigation Routes</h3>
              <div className="route-cards">
                <div className="route-card">
                  <h4>♿ Accessible Route</h4>
                  <p>For elderly & disabled visitors</p>
                  <button className="route-btn">📍 View Route</button>
                </div>
                <div className="route-card">
                  <h4>🚨 Emergency Exit</h4>
                  <p>Fastest exit routes</p>
                  <button className="route-btn">📍 View Route</button>
                </div>
                <div className="route-card">
                  <h4>🏥 Medical Center</h4>
                  <p>First aid & medical room</p>
                  <button className="route-btn">📍 View Route</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EMERGENCY TAB */}
        {activeTab === 'emergency' && (
          <div className="emergency-section">
            <h2>🚨 Emergency Reports & Alerts</h2>

            <div className="emergency-list">
              <h3>Active Emergency Reports</h3>
              {emergencyReports.map(report => (
                <div key={report.id} className={`emergency-card ${report.status}`}>
                  <div className="emergency-header">
                    <span className={`emergency-type ${report.type}`}>
                      {report.type === 'medical' && '🏥'}
                      {report.type === 'lost-child' && '👶'}
                      {report.type === 'stampede' && '⚠️'}
                      {report.type === 'suspicious' && '🔍'}
                      {' '}{report.type.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className="emergency-time">{report.time}</span>
                  </div>
                  <p><strong>Location:</strong> 📍 {report.location}</p>
                  <p><strong>Details:</strong> {report.description}</p>
                  <div className="emergency-status">
                    <span className={`status-indicator ${report.status}`}>
                      {report.status === 'active' ? '🔴 ACTIVE' : '✅ RESOLVED'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {showEmergencyForm && (
              <div className="emergency-form-overlay">
                <div className="emergency-form">
                  <h3>Report {emergencyType.replace('-', ' ')} Emergency</h3>
                  <button onClick={submitEmergencyReport} className="submit-btn">📤 Submit Report</button>
                  <button onClick={() => setShowEmergencyForm(false)} className="cancel-btn">❌ Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* COMMUNICATION TAB */}
        {activeTab === 'communication' && (
          <div className="communication-section">
            <h2>💬 Real-Time Team Communication</h2>

            <div className="chat-container">
              <div className="chat-messages">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`chat-message ${msg.type} ${msg.sender === 'You' ? 'own' : ''}`}>
                    <div className="message-header">
                      <strong>{msg.sender}</strong>
                      <span className="message-time">{msg.time}</span>
                    </div>
                    <p>{msg.message}</p>
                    {msg.type === 'broadcast' && <span className="broadcast-badge">📢 BROADCAST</span>}
                  </div>
                ))}
              </div>
              <div className="chat-input-area">
                <button onClick={sendChatMessage} className="send-message-btn">💬 Send Message</button>
                <button onClick={toggleVoiceRecording} className={`voice-message-btn ${isRecording ? 'recording' : ''}`}>
                  {isRecording ? '⏹️ Stop' : '🎤 Push-to-Talk'}
                </button>
                <button onClick={shareLocation} className="share-location-btn">📍 Share Location</button>
              </div>
            </div>

            <div className="team-status">
              <h3>👥 Team Status</h3>
              <div className="team-members">
                <div className="team-member online">
                  <span className="status-dot">🟢</span>
                  <span>Admin - Control Room</span>
                </div>
                <div className="team-member online">
                  <span className="status-dot">🟢</span>
                  <span>Security - Main Gate</span>
                </div>
                <div className="team-member online">
                  <span className="status-dot">🟢</span>
                  <span>Volunteer - Entry Point</span>
                </div>
                <div className="team-member busy">
                  <span className="status-dot">🟡</span>
                  <span>Medical Team (Busy)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISITOR ASSISTANCE TAB */}
        {activeTab === 'assistance' && (
          <div className="assistance-section">
            <h2>🎫 Visitor Support & Assistance</h2>

            <div className="assistance-requests">
              <h3>Active Assistance Requests</h3>
              {assistanceRequests.map(request => (
                <div key={request.id} className={`assistance-card ${request.status}`}>
                  <div className="request-header">
                    <h4>{request.name}</h4>
                    <span className={`request-type ${request.type}`}>
                      {request.type === 'slot-check' && '🎫'}
                      {request.type === 'navigation' && '🧭'}
                      {request.type === 'priority' && '⭐'}
                      {' '}{request.type.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p>📞 {request.phone}</p>
                  <p>{request.details}</p>
                  <div className="request-actions">
                    {request.status === 'pending' && (
                      <>
                        <button onClick={() => handleAssistanceRequest(request.id, 'in-progress')} className="btn-accept">
                          ✅ Accept
                        </button>
                        <button onClick={() => window.open(`tel:${request.phone}`)} className="btn-call">
                          📞 Call
                        </button>
                      </>
                    )}
                    {request.status === 'in-progress' && (
                      <button onClick={() => handleAssistanceRequest(request.id, 'completed')} className="btn-resolve">
                        ✅ Mark Resolved
                      </button>
                    )}
                    {request.status === 'completed' && (
                      <span className="resolved-badge">✅ Resolved</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="support-tools">
              <h3>🛠️ Support Tools</h3>
              <div className="tools-grid">
                <div className="tool-card">
                  <h4>🎫 Slot Booking Checker</h4>
                  <p>Check visitor booking status</p>
                  <button className="tool-btn">Open Tool</button>
                </div>
                <div className="tool-card">
                  <h4>🗺️ Temple Navigation</h4>
                  <p>Guide visitors to locations</p>
                  <button className="tool-btn">Open Map</button>
                </div>
                <div className="tool-card">
                  <h4>♿ Priority Assistance</h4>
                  <p>Fast-track for special needs</p>
                  <button className="tool-btn">Activate</button>
                </div>
                <div className="tool-card">
                  <h4>🏥 Medical Routing</h4>
                  <p>Direct to medical center</p>
                  <button className="tool-btn">Show Route</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
