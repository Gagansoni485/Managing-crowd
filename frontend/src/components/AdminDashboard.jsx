import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import emergencyApi from '../api/emergencyApi';
import adminApi from '../api/adminApi';
import templeApi from '../api/templeApi';
import '../styles/dashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock real-time data (in production, this would come from backend/WebSocket)
  const [crowdData, setCrowdData] = useState({
    entryGate: { count: 145, density: 75, status: 'moderate' },
    mainHall: { count: 320, density: 85, status: 'high' },
    exitGate: { count: 98, density: 45, status: 'low' },
    parking: { count: 67, density: 60, status: 'moderate' },
    foodCourt: { count: 52, density: 40, status: 'low' },
    courtyard: { count: 180, density: 70, status: 'moderate' }
  });

  const [liveStats, setLiveStats] = useState({
    totalEntry: 1247,
    totalExit: 1089,
    currentInside: 158,
    parkingAvailable: 45,
    totalParkingSlots: 200
  });

  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [loadingEmergencies, setLoadingEmergencies] = useState(false);

  // Temple Bookings State
  const [temples, setTemples] = useState([]);
  const [selectedTemple, setSelectedTemple] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Fetch emergency alerts from backend
  useEffect(() => {
    if (activeTab === 'emergency') {
      fetchEmergencies();
    } else if (activeTab === 'tickets') {
      fetchTemplesAndBookings();
    } else if (activeTab === 'staff') {
      fetchStaff();
    }
  }, [activeTab]);

  const fetchStaff = async () => {
    try {
      setLoadingStaff(true);
      const data = await adminApi.getAllStaff();
      setStaffData(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleAssignTask = (staff) => {
    setSelectedStaff(staff);
    setShowTaskForm(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.assignTaskToStaff(selectedStaff._id, taskForm);
      alert('Task assigned successfully!');
      setShowTaskForm(false);
      setTaskForm({ task: '', priority: 'medium', zone: '' });
      fetchStaff(); // Refresh staff list
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Failed to assign task');
    }
  };

  const fetchTemplesAndBookings = async () => {
    try {
      setLoadingBookings(true);
      const [templesData, bookingsData] = await Promise.all([
        templeApi.getAllTemples(),
        adminApi.getAllBookings()
      ]);
      setTemples(templesData);
      setAllBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching temples/bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleTempleSelect = (temple) => {
    setSelectedTemple(temple);
    const templeBookings = allBookings.filter(
      booking => booking.templeId === (temple._id || temple.id)
    );
    
    // Separate present and future bookings
    const now = new Date();
    const categorized = {
      present: [],
      future: []
    };
    
    templeBookings.forEach(booking => {
      const bookingDate = new Date(booking.visitDate);
      if (bookingDate.toDateString() === now.toDateString()) {
        categorized.present.push(booking);
      } else if (bookingDate > now) {
        categorized.future.push(booking);
      }
    });
    
    setFilteredBookings(categorized);
  };

  const fetchEmergencies = async () => {
    try {
      setLoadingEmergencies(true);
      const data = await emergencyApi.getAllEmergencies();
      setEmergencyAlerts(data.map(em => ({
        id: em._id,
        type: em.type,
        name: em.userId?.name || 'Anonymous',
        phone: em.userId?.phone || 'Not provided',
        location: em.location,
        description: em.description,
        time: getTimeAgo(new Date(em.createdAt)),
        status: em.status
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

  const [slotSettings, setSlotSettings] = useState({
    morningSlot: { time: '6:00 AM - 9:00 AM', capacity: 500, booked: 432, status: 'open' },
    midMorningSlot: { time: '9:00 AM - 12:00 PM', capacity: 600, booked: 578, status: 'open' },
    afternoonSlot: { time: '12:00 PM - 3:00 PM', capacity: 550, booked: 489, status: 'open' },
    eveningSlot: { time: '3:00 PM - 6:00 PM', capacity: 700, booked: 654, status: 'open' },
    nightSlot: { time: '6:00 PM - 9:00 PM', capacity: 500, booked: 123, status: 'open' }
  });

  const [staffData, setStaffData] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    task: '',
    priority: 'medium',
    zone: ''
  });

  const [announcements, setAnnouncements] = useState([
    { id: 1, message: 'Evening aarti will start at 7 PM', time: '30 mins ago' },
    { id: 2, message: 'Parking lot B is now full. Please use lot A', time: '1 hour ago' }
  ]);

  const [automationRules, setAutomationRules] = useState([
    { id: 1, rule: 'If Entry Gate crowd > 80%, stop new entries for 10 mins', active: true },
    { id: 2, rule: 'If medical emergency reported, auto alert first-aid team', active: true },
    { id: 3, rule: 'If parking > 90%, show "Full" on website', active: true }
  ]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random crowd changes
      setCrowdData(prev => ({
        ...prev,
        mainHall: {
          ...prev.mainHall,
          count: prev.mainHall.count + Math.floor(Math.random() * 10 - 5)
        }
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getDensityColor = (density) => {
    if (density >= 80) return '#dc2626'; // Red
    if (density >= 50) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  const getStatusBadge = (status) => {
    const colors = {
      low: '#10b981',
      moderate: '#f59e0b',
      high: '#dc2626'
    };
    return colors[status] || '#6b7280';
  };

  const handleEmergencyAction = async (alertId, action) => {
    try {
      await emergencyApi.updateEmergencyStatus(alertId, {
        status: action === 'assigned' ? 'in-progress' : action,
        response: `Status updated to ${action}`,
      });
      
      setEmergencyAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId ? { ...alert, status: action } : alert
        )
      );
      
      alert(`Emergency ${action === 'assigned' ? 'team assigned' : action}!`);
    } catch (error) {
      console.error('Error updating emergency:', error);
      alert('Failed to update emergency status');
    }
  };

  const toggleSlotStatus = (slotKey) => {
    setSlotSettings(prev => ({
      ...prev,
      [slotKey]: {
        ...prev[slotKey],
        status: prev[slotKey].status === 'open' ? 'closed' : 'open'
      }
    }));
  };

  const toggleAutomationRule = (ruleId) => {
    setAutomationRules(prev =>
      prev.map(rule =>
        rule.id === ruleId ? { ...rule, active: !rule.active } : rule
      )
    );
  };

  const sendAnnouncement = () => {
    const message = prompt('Enter announcement message:');
    if (message) {
      setAnnouncements(prev => [
        { id: Date.now(), message, time: 'Just now' },
        ...prev
      ]);
      alert('Announcement sent to all visitors!');
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="header-left">
          <h1>🏛️ Admin Control Center</h1>
          <p className="subtitle">Complete Temple Management & Monitoring System</p>
        </div>
        <div className="header-right">
          <div className="live-time">
            <span className="live-indicator">🔴 LIVE</span>
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
          <button onClick={() => navigate('/')} className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button className={activeTab === 'dashboard' ? 'tab active' : 'tab'} onClick={() => setActiveTab('dashboard')}>📊 Live Dashboard</button>
        <button className={activeTab === 'heatmap' ? 'tab active' : 'tab'} onClick={() => navigate('/crowd-heatmap')}>🎯 Heatmap</button>
        <button className={activeTab === 'tickets' ? 'tab active' : 'tab'} onClick={() => setActiveTab('tickets')}>🎟️ Ticketing</button>
        <button className={activeTab === 'emergency' ? 'tab active' : 'tab'} onClick={() => setActiveTab('emergency')}>🚨 Emergency</button>
        <button className={activeTab === 'communication' ? 'tab active' : 'tab'} onClick={() => setActiveTab('communication')}>📢 Communication</button>
        <button className={activeTab === 'parking' ? 'tab active' : 'tab'} onClick={() => setActiveTab('parking')}>🚗 Parking</button>
        <button className={activeTab === 'staff' ? 'tab active' : 'tab'} onClick={() => setActiveTab('staff')}>👥 Staff</button>
        <button className={activeTab === 'analytics' ? 'tab active' : 'tab'} onClick={() => setActiveTab('analytics')}>📈 Analytics</button>
        <button className={activeTab === 'automation' ? 'tab active' : 'tab'} onClick={() => setActiveTab('automation')}>⚙️ Automation</button>
      </div>

      {/* Main Content Area */}
      <div className="admin-content">
        {/* LIVE CROWD DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            <h2>👥 Live Crowd Dashboard</h2>
            
            {/* Quick Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📥</div>
                <div className="stat-info">
                  <h3>Total Entry</h3>
                  <p className="stat-number">{liveStats.totalEntry}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📤</div>
                <div className="stat-info">
                  <h3>Total Exit</h3>
                  <p className="stat-number">{liveStats.totalExit}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👤</div>
                <div className="stat-info">
                  <h3>Currently Inside</h3>
                  <p className="stat-number">{liveStats.currentInside}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🅿️</div>
                <div className="stat-info">
                  <h3>Parking Available</h3>
                  <p className="stat-number">{liveStats.parkingAvailable}/{liveStats.totalParkingSlots}</p>
                </div>
              </div>
            </div>

            {/* Crowd Density Heatmap */}
            <div className="section-card">
              <h3>📍 Live Location Map - Crowd Density</h3>
              <div className="crowd-grid">
                {Object.entries(crowdData).map(([key, data]) => (
                  <div key={key} className="crowd-zone" style={{ borderColor: getDensityColor(data.density) }}>
                    <div className="zone-header">
                      <h4>{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                      <span className="density-badge" style={{ background: getStatusBadge(data.status) }}>
                        {data.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="zone-stats">
                      <p className="zone-count">👥 {data.count} people</p>
                      <div className="density-bar">
                        <div className="density-fill" style={{ width: `${data.density}%`, background: getDensityColor(data.density) }}></div>
                      </div>
                      <p className="density-text">{data.density}% Full</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CCTV Feed Section */}
            <div className="section-card">
              <h3>🎥 CCTV Feed - AI Crowd Analysis</h3>
              <div className="cctv-grid">
                <div className="cctv-feed">
                  <div className="feed-placeholder">📹 Entry Gate</div>
                  <p>AI Count: 145 persons</p>
                </div>
                <div className="cctv-feed">
                  <div className="feed-placeholder">📹 Main Hall</div>
                  <p>AI Count: 320 persons</p>
                </div>
                <div className="cctv-feed">
                  <div className="feed-placeholder">📹 Exit Gate</div>
                  <p>AI Count: 98 persons</p>
                </div>
                <div className="cctv-feed">
                  <div className="feed-placeholder">📹 Parking</div>
                  <p>AI Count: 67 vehicles</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TICKETING & QUEUE MANAGEMENT */}
        {activeTab === 'tickets' && (
          <div className="tickets-section">
            <h2>🎟️ Ticketing & Queue Management</h2>
            
            {/* Temple List */}
            {!selectedTemple ? (
              <div className="section-card">
                <h3>📍 Select Temple to View Bookings</h3>
                {loadingBookings ? (
                  <p className="loading-text">Loading temples...</p>
                ) : (
                  <div className="temple-list-grid">
                    {temples.map(temple => {
                      const templeBookings = allBookings.filter(
                        b => b.templeId === (temple._id || temple.id)
                      );
                      const todayBookings = templeBookings.filter(
                        b => new Date(b.visitDate).toDateString() === new Date().toDateString()
                      );
                      const futureBookings = templeBookings.filter(
                        b => new Date(b.visitDate) > new Date()
                      );
                      
                      return (
                        <div 
                          key={temple._id || temple.id}
                          className="temple-booking-card"
                          onClick={() => handleTempleSelect(temple)}
                        >
                          <h4>{temple.name}</h4>
                          <p className="temple-location">📍 {temple.location}</p>
                          <div className="booking-stats">
                            <div className="stat">
                              <span className="stat-number">{todayBookings.length}</span>
                              <span className="stat-label">Today</span>
                            </div>
                            <div className="stat">
                              <span className="stat-number">{futureBookings.length}</span>
                              <span className="stat-label">Future</span>
                            </div>
                            <div className="stat">
                              <span className="stat-number">{templeBookings.length}</span>
                              <span className="stat-label">Total</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Back Button */}
                <button 
                  onClick={() => setSelectedTemple(null)}
                  className="btn-back-temple"
                >
                  ← Back to Temples
                </button>

                <div className="selected-temple-header">
                  <h3>📍 {selectedTemple.name}</h3>
                  <p>{selectedTemple.location}</p>
                </div>

                {/* Present Bookings */}
                <div className="section-card">
                  <h3>📅 Today's Bookings ({filteredBookings.present?.length || 0})</h3>
                  {filteredBookings.present?.length === 0 ? (
                    <p className="no-bookings">No bookings for today</p>
                  ) : (
                    <>
                      <div className="booking-summary">
                        <div className="summary-stat">
                          <span className="summary-icon">👥</span>
                          <div>
                            <strong>{filteredBookings.present.reduce((sum, b) => sum + (b.numberOfVisitors || 1), 0)}</strong>
                            <p>Total Visitors</p>
                          </div>
                        </div>
                      </div>
                      
                      <table className="bookings-table">
                        <thead>
                          <tr>
                            <th>Booking ID</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Time Slot</th>
                            <th>Visitors</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBookings.present.map(booking => (
                            <tr key={booking._id}>
                              <td><strong>{booking.tokenNumber || booking._id.slice(-6)}</strong></td>
                              <td>{booking.userId?.name || 'N/A'}</td>
                              <td>{booking.userId?.phone || 'N/A'}</td>
                              <td>{booking.timeSlot}</td>
                              <td className="text-center">{booking.numberOfVisitors || 1}</td>
                              <td>
                                <span className={`status-badge ${booking.status}`}>
                                  {booking.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>

                {/* Future Bookings */}
                <div className="section-card">
                  <h3>📆 Future Bookings ({filteredBookings.future?.length || 0})</h3>
                  {filteredBookings.future?.length === 0 ? (
                    <p className="no-bookings">No future bookings</p>
                  ) : (
                    <>
                      <div className="booking-summary">
                        <div className="summary-stat">
                          <span className="summary-icon">👥</span>
                          <div>
                            <strong>{filteredBookings.future.reduce((sum, b) => sum + (b.numberOfVisitors || 1), 0)}</strong>
                            <p>Expected Visitors</p>
                          </div>
                        </div>
                      </div>
                      
                      <table className="bookings-table">
                        <thead>
                          <tr>
                            <th>Booking ID</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Visit Date</th>
                            <th>Time Slot</th>
                            <th>Visitors</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBookings.future.map(booking => (
                            <tr key={booking._id}>
                              <td><strong>{booking.tokenNumber || booking._id.slice(-6)}</strong></td>
                              <td>{booking.userId?.name || 'N/A'}</td>
                              <td>{booking.userId?.phone || 'N/A'}</td>
                              <td>{new Date(booking.visitDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}</td>
                              <td>{booking.timeSlot}</td>
                              <td className="text-center">{booking.numberOfVisitors || 1}</td>
                              <td>
                                <span className={`status-badge ${booking.status}`}>
                                  {booking.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* EMERGENCY CONTROL */}
        {activeTab === 'emergency' && (
          <div className="emergency-section">
            <h2>🚨 Emergency Control & Response Center</h2>
            
            <div className="emergency-alerts">
              <h3>Active Emergency Alerts</h3>
              {loadingEmergencies ? (
                <p className="loading-text">Loading emergencies...</p>
              ) : emergencyAlerts.length === 0 ? (
                <p className="no-emergencies">No active emergencies</p>
              ) : (
                emergencyAlerts.map(alert => (
                <div key={alert.id} className={`alert-card ${alert.status}`}>
                  <div className="alert-header">
                    <span className={`alert-type ${alert.type}`}>
                      {alert.type === 'medical' && '🏥'}
                      {alert.type === 'lost' && '👶'}
                      {alert.type === 'panic' && '⚠️'}
                      {' '}{alert.type.toUpperCase()}
                    </span>
                    <span className="alert-time">{alert.time}</span>
                  </div>
                  <div className="alert-details">
                    <p><strong>Name:</strong> {alert.name}</p>
                    <p><strong>Phone:</strong> {alert.phone}</p>
                    <p><strong>Location:</strong> 📍 {alert.location}</p>
                    <p><strong>Description:</strong> {alert.description}</p>
                  </div>
                  <div className="alert-actions">
                    {alert.status === 'pending' && (
                      <>
                        <button className="action-btn call" onClick={() => window.open(`tel:${alert.phone}`)}>📞 Call Now</button>
                        <button className="action-btn assign" onClick={() => handleEmergencyAction(alert.id, 'assigned')}>👨‍⚕️ Assign Team</button>
                      </>
                    )}
                    {alert.status === 'assigned' && (
                      <button className="action-btn resolve" onClick={() => handleEmergencyAction(alert.id, 'resolved')}>✅ Mark Resolved</button>
                    )}
                    {alert.status === 'resolved' && (
                      <span className="resolved-badge">✅ Resolved</span>
                    )}
                  </div>
                </div>
              ))
              )}
            </div>
          </div>
        )}

        {/* COMMUNICATION HUB */}
        {activeTab === 'communication' && (
          <div className="communication-section">
            <h2>📢 Communication Hub</h2>
            
            <div className="section-card">
              <h3>📣 Broadcast Announcements</h3>
              <button className="broadcast-btn" onClick={sendAnnouncement}>➕ Send New Announcement</button>
              
              <div className="announcements-list">
                <h4>Recent Announcements</h4>
                {announcements.map(ann => (
                  <div key={ann.id} className="announcement-item">
                    <p>{ann.message}</p>
                    <span className="time">{ann.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card">
              <h3>🗣️ Staff Communication Panel</h3>
              <div className="chat-placeholder">
                <p>💬 Real-time chat interface for guards and volunteers</p>
                <div className="chat-messages">
                  <div className="chat-msg"><strong>Guard Suresh:</strong> Entry gate clear</div>
                  <div className="chat-msg"><strong>Volunteer Meera:</strong> Need assistance at main hall</div>
                  <div className="chat-msg you"><strong>You:</strong> Medical team dispatched</div>
                </div>
                <div className="chat-input">
                  <input type="text" placeholder="Type message..." />
                  <button>Send</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PARKING & TRAFFIC */}
        {activeTab === 'parking' && (
          <div className="parking-section">
            <h2>🚗 Parking & Traffic Management</h2>
            
            <div className="stats-grid">
              <div className="stat-card">
                <h3>🅿️ Total Parking Slots</h3>
                <p className="stat-number">200</p>
              </div>
              <div className="stat-card">
                <h3>✅ Available Slots</h3>
                <p className="stat-number">{liveStats.parkingAvailable}</p>
              </div>
              <div className="stat-card">
                <h3>🚗 Occupied</h3>
                <p className="stat-number">{liveStats.totalParkingSlots - liveStats.parkingAvailable}</p>
              </div>
              <div className="stat-card">
                <h3>📊 Occupancy Rate</h3>
                <p className="stat-number">{Math.round(((liveStats.totalParkingSlots - liveStats.parkingAvailable) / liveStats.totalParkingSlots) * 100)}%</p>
              </div>
            </div>

            <div className="section-card">
              <h3>🚦 Traffic Status</h3>
              <div className="traffic-zones">
                <div className="traffic-item">
                  <span>Main Road</span>
                  <span className="traffic-status low">🟢 Clear</span>
                </div>
                <div className="traffic-item">
                  <span>Temple Entrance</span>
                  <span className="traffic-status moderate">🟡 Moderate</span>
                </div>
                <div className="traffic-item">
                  <span>Exit Road</span>
                  <span className="traffic-status low">🟢 Clear</span>
                </div>
              </div>
            </div>

            <div className="section-card">
              <h3>🚍 Shuttle Bus Monitoring</h3>
              <div className="shuttle-list">
                <div className="shuttle-item">Bus #1 - Currently at: Main Gate</div>
                <div className="shuttle-item">Bus #2 - Currently at: Parking Lot B</div>
                <div className="shuttle-item">Bus #3 - Currently at: Temple Entrance</div>
              </div>
            </div>
          </div>
        )}

        {/* STAFF MANAGEMENT */}
        {activeTab === 'staff' && (
          <div className="staff-section">
            <h2>👥 Staff Management</h2>
            
            <div className="section-card">
              <h3>👮 Active Staff Tracking</h3>
              {loadingStaff ? (
                <p className="loading-text">Loading staff...</p>
              ) : staffData.length === 0 ? (
                <p className="no-staff">No staff registered yet</p>
              ) : (
                <div className="staff-grid">
                  {staffData.map(staff => (
                    <div key={staff._id} className="staff-card">
                      <div className="staff-header">
                        <h4>{staff.name}</h4>
                        <span className={`staff-status ${staff.isActive ? 'active' : 'inactive'}`}>
                          {staff.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                      <p className="staff-role">🎯 {staff.staffRole || staff.role}</p>
                      <p className="staff-contact">📞 {staff.phone}</p>
                      <p className="staff-email">📧 {staff.email}</p>
                      
                      {staff.assignedTasks && staff.assignedTasks.length > 0 && (
                        <div className="staff-tasks-summary">
                          <strong>Assigned Tasks: {staff.assignedTasks.length}</strong>
                          <div className="task-status-counts">
                            <span className="pending">
                              Pending: {staff.assignedTasks.filter(t => t.status === 'pending').length}
                            </span>
                            <span className="in-progress">
                              In Progress: {staff.assignedTasks.filter(t => t.status === 'in-progress').length}
                            </span>
                            <span className="completed">
                              Completed: {staff.assignedTasks.filter(t => t.status === 'completed').length}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <button 
                        className="assign-task-btn"
                        onClick={() => handleAssignTask(staff)}
                      >
                        ➕ Assign New Task
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Task Assignment Form Modal */}
            {showTaskForm && (
              <div className="modal-overlay" onClick={() => setShowTaskForm(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h3>Assign Task to {selectedStaff?.name}</h3>
                  <form onSubmit={handleTaskSubmit}>
                    <div className="form-group">
                      <label>Task Description *</label>
                      <textarea
                        value={taskForm.task}
                        onChange={(e) => setTaskForm({ ...taskForm, task: e.target.value })}
                        placeholder="Enter task details..."
                        required
                        rows="4"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Priority *</label>
                      <select
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Zone/Location</label>
                      <input
                        type="text"
                        value={taskForm.zone}
                        onChange={(e) => setTaskForm({ ...taskForm, zone: e.target.value })}
                        placeholder="e.g., Main Hall, Entry Gate"
                      />
                    </div>
                    
                    <div className="modal-actions">
                      <button type="button" onClick={() => setShowTaskForm(false)} className="btn-cancel">
                        Cancel
                      </button>
                      <button type="submit" className="btn-submit">
                        Assign Task
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS & REPORTS */}
        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2>📈 Analytics & Reports</h2>
            
            <div className="stats-grid">
              <div className="stat-card">
                <h3>📊 Today's Visitors</h3>
                <p className="stat-number">1,247</p>
                <p className="stat-change positive">↗ +12% from yesterday</p>
              </div>
              <div className="stat-card">
                <h3>⏰ Peak Hour</h3>
                <p className="stat-number">9-11 AM</p>
                <p className="stat-detail">Highest crowd time</p>
              </div>
              <div className="stat-card">
                <h3>⏳ Avg Wait Time</h3>
                <p className="stat-number">18 mins</p>
                <p className="stat-change negative">↘ -5 mins from last week</p>
              </div>
              <div className="stat-card">
                <h3>🚨 Emergencies Today</h3>
                <p className="stat-number">3</p>
                <p className="stat-detail">All resolved</p>
              </div>
            </div>

            <div className="section-card">
              <h3>📅 Weekly Visitor Trend</h3>
              <div className="chart-placeholder">
                <div className="bar-chart">
                  <div className="bar" style={{height: '60%'}}><span>Mon<br/>856</span></div>
                  <div className="bar" style={{height: '75%'}}><span>Tue<br/>1024</span></div>
                  <div className="bar" style={{height: '90%'}}><span>Wed<br/>1247</span></div>
                  <div className="bar" style={{height: '70%'}}><span>Thu<br/>945</span></div>
                  <div className="bar" style={{height: '85%'}}><span>Fri<br/>1156</span></div>
                  <div className="bar" style={{height: '100%'}}><span>Sat<br/>1432</span></div>
                  <div className="bar" style={{height: '95%'}}><span>Sun<br/>1298</span></div>
                </div>
              </div>
            </div>

            <div className="section-card">
              <h3>📥 Download Reports</h3>
              <div className="report-buttons">
                <button className="report-btn">📄 Daily Report</button>
                <button className="report-btn">📄 Weekly Summary</button>
                <button className="report-btn">📄 Monthly Analytics</button>
                <button className="report-btn">📄 Emergency Logs</button>
              </div>
            </div>
          </div>
        )}

        {/* AUTOMATION RULES */}
        {activeTab === 'automation' && (
          <div className="automation-section">
            <h2>⚙️ Automation Rules</h2>
            
            <div className="section-card">
              <h3>🤖 Active Automation Rules</h3>
              <button className="add-rule-btn">➕ Add New Rule</button>
              
              <div className="rules-list">
                {automationRules.map(rule => (
                  <div key={rule.id} className="rule-item">
                    <div className="rule-content">
                      <p>{rule.rule}</p>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={rule.active}
                        onChange={() => toggleAutomationRule(rule.id)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card">
              <h3>📊 Automation Logs</h3>
              <div className="logs-list">
                <div className="log-item">✅ Auto-alert sent to medical team - 10:45 AM</div>
                <div className="log-item">🚧 Entry gate paused due to high crowd - 11:20 AM</div>
                <div className="log-item">✅ Parking status updated on website - 12:05 PM</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
