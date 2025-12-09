import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../styles/VirtualToken.css';

const SOCKET_URL = 'http://localhost:5000';

export default function VirtualToken() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state;
  
  const [currentPosition, setCurrentPosition] = useState(bookingData?.queueEntry?.position || 0);
  const [estimatedTime, setEstimatedTime] = useState(bookingData?.queueEntry?.estimatedWaitTime || 0);
  const [notificationSent, setNotificationSent] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isFutureBooking, setIsFutureBooking] = useState(!bookingData?.isToday);
  const [daysUntilVisit, setDaysUntilVisit] = useState(0);
  const [autoQueued, setAutoQueued] = useState(bookingData?.queueEntry?.autoQueued || false);

  useEffect(() => {
    if (!bookingData) {
      navigate('/temple-selection');
      return;
    }

    // Check if booking is for future date
    const bookingDate = new Date(bookingData.token?.visitDate || bookingData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((bookingDate - today) / (1000 * 60 * 60 * 24));
    setDaysUntilVisit(daysDiff);
    
    // Check if auto-queued (means it's today's booking)
    const isToday = bookingData.isToday || bookingData.queueEntry?.autoQueued || daysDiff === 0;
    setIsFutureBooking(!isToday);

    // Only setup queue updates for today's bookings
    if (isToday) {
      // Connect to Socket.IO for real-time queue updates
      const newSocket = io(`${SOCKET_URL}/queue`);
      setSocket(newSocket);

      // Join temple-specific room
      const templeId = bookingData.token?.templeId || bookingData.temple?._id || bookingData.temple?.id;
      if (templeId) {
        newSocket.emit('join-temple', templeId);
      }

      // Join user-specific room
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser._id) {
        newSocket.emit('join-user', currentUser._id);
      }

      // Listen for queue updates
      newSocket.on('queue-updated', (data) => {
        console.log('Queue updated:', data);
        // Refresh queue position
      });

      // Listen for personal queue updates
      newSocket.on('personal-queue-update', (data) => {
        console.log('Personal queue update:', data);
        setCurrentPosition(data.position);
        if (data.estimatedWaitTime !== undefined) {
          setEstimatedTime(data.estimatedWaitTime);
        }
        if (data.position <= 3) {
          setNotificationSent(true);
        }
      });

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }
  }, [bookingData, navigate]);

  const formatTime12Hour = (time24) => {
    const [hour, minute] = time24.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  const handleDownloadReceipt = () => {
    window.print();
  };

  const handleShareToken = () => {
    const shareText = `Virtual Token: ${bookingData.tokenNumber}\nTemple: ${bookingData.temple.name}\nPosition: ${currentPosition}\nEstimated Wait: ${estimatedTime} mins`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Virtual Queue Token',
        text: shareText,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Token details copied to clipboard!');
    }
  };

  if (!bookingData) return null;

  return (
    <div className="virtual-token-container">
      {/* Success Animation */}
      <div className="success-animation">
        <div className="checkmark-circle">
          <div className="checkmark">✓</div>
        </div>
        <h1>Booking Confirmed!</h1>
        <p>Your virtual token has been issued</p>
      </div>

      <div className="token-content">
        {/* Digital Token Card */}
        <div className="token-card">
          <div className="token-header">
            <h2>Virtual Queue Token</h2>
            <div className="visitor-name-badge">
              👤 {bookingData.token?.userId?.name || bookingData.contactInfo?.name || 'Visitor'}
            </div>
            <div className="token-number">{bookingData.token?.tokenNumber || bookingData.tokenNumber}</div>
            {autoQueued && (
              <div className="auto-queue-badge">
                ✅ Auto-Queued
              </div>
            )}
          </div>

          <div className="qr-code-section">
            {bookingData.token?.qrCode ? (
              <div className="qr-code-real">
                <img src={bookingData.token.qrCode} alt="QR Code" className="qr-image" />
              </div>
            ) : (
              <div className="qr-placeholder">
                <svg viewBox="0 0 100 100" className="qr-svg">
                  <rect x="10" y="10" width="15" height="15" fill="#000"/>
                  <rect x="30" y="10" width="5" height="5" fill="#000"/>
                  <rect x="40" y="10" width="10" height="10" fill="#000"/>
                  <rect x="55" y="10" width="5" height="5" fill="#000"/>
                  <rect x="65" y="10" width="15" height="15" fill="#000"/>
                  <rect x="10" y="30" width="5" height="5" fill="#000"/>
                  <rect x="20" y="30" width="5" height="5" fill="#000"/>
                  <rect x="30" y="30" width="10" height="10" fill="#000"/>
                  <rect x="45" y="35" width="10" height="5" fill="#000"/>
                  <rect x="60" y="30" width="5" height="5" fill="#000"/>
                  <rect x="70" y="30" width="5" height="5" fill="#000"/>
                  <rect x="10" y="45" width="10" height="10" fill="#000"/>
                  <rect x="25" y="45" width="5" height="5" fill="#000"/>
                  <rect x="35" y="45" width="15" height="15" fill="#000"/>
                  <rect x="55" y="45" width="5" height="5" fill="#000"/>
                  <rect x="65" y="45" width="10" height="10" fill="#000"/>
                  <rect x="10" y="60" width="5" height="5" fill="#000"/>
                  <rect x="20" y="60" width="10" height="10" fill="#000"/>
                  <rect x="35" y="65" width="5" height="5" fill="#000"/>
                  <rect x="45" y="60" width="10" height="10" fill="#000"/>
                  <rect x="60" y="60" width="5" height="5" fill="#000"/>
                  <rect x="70" y="60" width="5" height="5" fill="#000"/>
                  <rect x="10" y="75" width="15" height="15" fill="#000"/>
                  <rect x="30" y="75" width="5" height="5" fill="#000"/>
                  <rect x="40" y="75" width="10" height="10" fill="#000"/>
                  <rect x="55" y="75" width="5" height="5" fill="#000"/>
                  <rect x="65" y="75" width="15" height="15" fill="#000"/>
                </svg>
              </div>
            )}
            <p className="qr-instruction">Scan at temple entrance</p>
          </div>

          <div className="token-details">
            <div className="detail-row">
              <span className="detail-label">Token Number:</span>
              <span className="detail-value">{bookingData.token?.tokenNumber || bookingData.tokenNumber}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Temple:</span>
              <span className="detail-value">{bookingData.temple?.name || 'Temple'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date:</span>
              <span className="detail-value">
                {new Date(bookingData.token?.visitDate || bookingData.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Time Slot:</span>
              <span className="detail-value">
                {bookingData.token?.timeSlot || `${formatTime12Hour(bookingData.timeSlot?.startTime)} - ${formatTime12Hour(bookingData.timeSlot?.endTime)}`}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Visitors:</span>
              <span className="detail-value">{bookingData.token?.numberOfVisitors || bookingData.visitors || 1}</span>
            </div>
          </div>
        </div>

        {/* Queue Status */}
        <div className="queue-status">
          <h2>🎯 Queue Status</h2>
          
          {isFutureBooking ? (
            <div className="future-booking-notice">
              <div className="future-icon">📅</div>
              <h3>Future Booking Confirmed</h3>
              <p className="future-date">
                Your visit is scheduled for <strong>{daysUntilVisit} day{daysUntilVisit !== 1 ? 's' : ''}</strong> from now
              </p>
              <p className="future-message">
                You will be <strong>automatically added to the queue</strong> on your visit date at your scheduled time slot.
              </p>
              <div className="future-reminder">
                <span className="reminder-icon">🔔</span>
                <p>No need to manually join - we'll handle it for you!</p>
              </div>
            </div>
          ) : currentPosition === 0 ? (
            <div className="future-booking-notice">
              <div className="future-icon">✅</div>
              <h3>Ready for Your Visit</h3>
              <p className="future-message">
                Your booking is for <strong>today</strong>. Please arrive at the temple.
              </p>
            </div>
          ) : (
            <>
              {autoQueued && (
                <div className="auto-queue-notice">
                  <span className="auto-icon">⚡</span>
                  <p>You were automatically added to the queue when you booked!</p>
                </div>
              )}
              
              <div className="position-display">
                <div className="position-circle">
                  <span className="position-number">{currentPosition}</span>
                  <span className="position-label">in queue</span>
                </div>
                <div className="position-explanation">
                  {currentPosition === 1 ? (
                    <p className="your-turn">🎉 It's your turn! Please proceed to entrance</p>
                  ) : currentPosition === 2 ? (
                    <p className="next-up">⚡ You're next! Get ready</p>
                  ) : (
                    <p className="waiting">⏳ {currentPosition - 1} {currentPosition - 1 === 1 ? 'person' : 'people'} ahead of you</p>
                  )}
                </div>
                <div className="position-info">
                  <p>Estimated wait time: ~{estimatedTime} minutes</p>
                  <p className="queue-note">Queue moves as visitors complete their visit</p>
                </div>
              </div>

              <div className="wait-time">
                <span className="wait-icon">⏱️</span>
                <div className="wait-info">
                  <span className="wait-label">Estimated Wait Time</span>
                  <span className="wait-value">{estimatedTime} minutes</span>
                </div>
              </div>

              {notificationSent && (
                <div className="notification-alert">
                  <span className="alert-icon">🔔</span>
                  <div className="alert-content">
                    <strong>Your turn is coming!</strong>
                    <p>Please proceed to the temple entrance</p>
                  </div>
                </div>
              )}

              <div className="queue-benefits">
                <h3>✨ While You Wait</h3>
                <ul>
                  <li>Move freely around the temple premises</li>
                  <li>Visit nearby shops and facilities</li>
                  <li>Relax in designated waiting areas</li>
                  <li>Real-time updates sent to your phone</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Notification Channels */}
        <div className="notification-channels">
          <h3>📱 Notifications Sent To:</h3>
          <div className="channels-list">
            {bookingData.contactInfo.notificationPreference.includes('sms') && (
              <div className="channel-item">
                <span className="channel-icon">💬</span>
                <span>SMS: {bookingData.contactInfo.phone}</span>
              </div>
            )}
            {bookingData.contactInfo.notificationPreference.includes('email') && (
              <div className="channel-item">
                <span className="channel-icon">📧</span>
                <span>Email: {bookingData.contactInfo.email}</span>
              </div>
            )}
            {bookingData.contactInfo.notificationPreference.includes('app') && (
              <div className="channel-item">
                <span className="channel-icon">📱</span>
                <span>Mobile App</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="token-actions">
        <button onClick={handleDownloadReceipt} className="btn-download">
          📄 Download Receipt
        </button>
        <button onClick={handleShareToken} className="btn-share">
          🔗 Share Token
        </button>
        <button onClick={() => navigate('/')} className="btn-home">
          🏠 Back to Home
        </button>
      </div>
    </div>
  );
}
