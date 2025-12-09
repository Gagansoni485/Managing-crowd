import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authApi from '../api/authApi';
import tokenApi from '../api/tokenApi';
import '../styles/BookingConfirmation.css';

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { temple, date, timeSlot } = location.state || {};
  
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    numberOfVisitors: 1,
    notificationPreference: 'all'
  });
  
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!temple || !timeSlot) {
      navigate('/temple-selection');
    } else {
      // Pre-fill contact info if user is logged in
      const currentUser = authApi.getCurrentUser();
      if (currentUser) {
        setContactInfo(prev => ({
          ...prev,
          name: currentUser.name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || ''
        }));
      }
    }
  }, [temple, timeSlot, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    setError('');
    
    try {
      // Create token booking via API
      const response = await tokenApi.createTokenBooking({
        templeId: temple._id || temple.id,
        visitDate: date,
        timeSlot: `${timeSlot.startTime}-${timeSlot.endTime}`,
        numberOfVisitors: contactInfo.numberOfVisitors || 1,
      });

      // Calculate if booking is for today or future date
      const bookingDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      bookingDate.setHours(0, 0, 0, 0);
      
      const isToday = bookingDate.getTime() === today.getTime();
      const isFutureDate = bookingDate.getTime() > today.getTime();
      
      let queuePosition = 0;
      let estimatedWaitTime = 0;
      
      if (isToday) {
        // For today's booking, check current time vs slot time
        const now = new Date();
        const [slotHour, slotMinute] = timeSlot.startTime.split(':').map(Number);
        const slotTime = new Date();
        slotTime.setHours(slotHour, slotMinute, 0, 0);
        
        if (now < slotTime) {
          // Slot is in future today - calculate wait time
          estimatedWaitTime = Math.floor((slotTime - now) / (1000 * 60)); // minutes
          queuePosition = Math.floor(Math.random() * 20) + 1; // Small queue
        } else {
          // Slot time has passed or is now
          queuePosition = Math.floor(Math.random() * 10) + 1;
          estimatedWaitTime = queuePosition * 2; // 2 mins per person
        }
      } else if (isFutureDate) {
        // Future date booking - no immediate queue
        const daysUntil = Math.floor((bookingDate - today) / (1000 * 60 * 60 * 24));
        queuePosition = 0; // Not in queue yet
        estimatedWaitTime = 0; // Will join queue on booking date
      }

      const bookingData = {
        temple,
        date,
        timeSlot,
        contactInfo,
        token: response.token,
        queueEntry: response.queueEntry,
        isToday: response.isToday || isToday,
        visitors: contactInfo.numberOfVisitors
      };
      
      alert(response.message || 'Booking successful!');
      navigate('/virtual-token', { state: bookingData });
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
      setIsBooking(false);
    }
  };

  const generateTokenNumber = () => {
    const prefix = 'VT';
    const random = Math.floor(Math.random() * 900000) + 100000;
    return `${prefix}${random}`;
  };

  const generateBatchNumber = () => {
    const date = new Date();
    const batch = `B${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 100)}`;
    return batch;
  };

  const generateBookingId = () => {
    return 'BK' + Date.now() + Math.floor(Math.random() * 1000);
  };

  const formatTime12Hour = (time24) => {
    const [hour, minute] = time24.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  if (!temple || !timeSlot) return null;

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h1>Confirm Your Booking</h1>
        <p>Please review your booking details and provide contact information</p>
      </div>

      <div className="booking-content">
        {error && <div className="error-message">{error}</div>}
        
        <div className="booking-summary">
          <h2>Booking Summary</h2>
          
          <div className="summary-item">
            <span className="summary-label">Temple:</span>
            <span className="summary-value">{temple.name}</span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">Location:</span>
            <span className="summary-value">{temple.location}</span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">Date:</span>
            <span className="summary-value">
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">Time Slot:</span>
            <span className="summary-value">
              {formatTime12Hour(timeSlot.startTime)} - {formatTime12Hour(timeSlot.endTime)}
            </span>
          </div>
        </div>

        <div className="contact-form">
          <h2>Contact Information</h2>
          <p className="form-note">We'll send your virtual token and updates to:</p>
          
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={contactInfo.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={contactInfo.email}
              onChange={handleInputChange}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={contactInfo.phone}
              onChange={handleInputChange}
              placeholder="+91 XXXXX XXXXX"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="numberOfVisitors">Number of Visitors</label>
            <input
              type="number"
              id="numberOfVisitors"
              name="numberOfVisitors"
              value={contactInfo.numberOfVisitors}
              onChange={handleInputChange}
              min="1"
              max="10"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notificationPreference">Notification Preference</label>
            <select
              id="notificationPreference"
              name="notificationPreference"
              value={contactInfo.notificationPreference}
              onChange={handleInputChange}
            >
              <option value="all">SMS + Email + App</option>
              <option value="sms-email">SMS + Email</option>
              <option value="email-app">Email + App</option>
              <option value="sms">SMS Only</option>
              <option value="email">Email Only</option>
            </select>
          </div>

          <div className="notification-info">
            <h3>📱 What you'll receive:</h3>
            <ul>
              <li>✓ Virtual token with queue position</li>
              <li>✓ Estimated wait time</li>
              <li>✓ Real-time queue updates</li>
              <li>✓ Alert when your turn approaches</li>
              <li>✓ Digital receipt with batch number</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="booking-actions">
        <button onClick={() => navigate(-1)} className="btn-back" disabled={isBooking}>
          Back
        </button>
        <button
          onClick={handleConfirmBooking}
          className="btn-confirm"
          disabled={!contactInfo.name || !contactInfo.email || !contactInfo.phone || isBooking}
        >
          {isBooking ? (
            <span className="loading-spinner">⏳ Processing...</span>
          ) : (
            'Confirm & Get Virtual Token'
          )}
        </button>
      </div>
    </div>
  );
}
