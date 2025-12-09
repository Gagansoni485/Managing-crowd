import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import templeApi from '../api/templeApi';
import '../styles/TimeSlotSelection.css';

export default function TimeSlotSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const temple = location.state?.temple;
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [alternateSlots, setAlternateSlots] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!temple) {
      navigate('/temple-selection');
    } else {
      loadTempleSlots();
    }
  }, [temple, navigate, selectedDate]); // Add selectedDate to dependencies

  const isSlotPassed = (slotStartTime, slotDate) => {
    const now = new Date();
    const selectedDateObj = new Date(slotDate);
    
    // If selected date is in the past, slot is passed
    if (selectedDateObj.toDateString() < now.toDateString()) {
      return true;
    }
    
    // If selected date is today, check the time
    if (selectedDateObj.toDateString() === now.toDateString()) {
      const [hours, minutes] = slotStartTime.split(':').map(Number);
      const slotTime = new Date();
      slotTime.setHours(hours, minutes, 0, 0);
      
      // Add 30 minute buffer - can't book slot starting in less than 30 mins
      const bufferTime = new Date(now.getTime() + 30 * 60000);
      return slotTime <= bufferTime;
    }
    
    // Future dates are always available
    return false;
  };

  const loadTempleSlots = async () => {
    try {
      setLoading(true);
      // If temple has predefined slots, use them
      if (temple.timeSlots && temple.timeSlots.length > 0) {
        const formattedSlots = temple.timeSlots.map(slot => {
          const [startTime, endTime] = slot.slot.split('-');
          const isPassed = isSlotPassed(startTime.trim(), selectedDate);
          const slotsLeft = slot.capacity - Math.floor(Math.random() * slot.capacity);
          const available = !isPassed && slotsLeft > 0;
          
          return {
            id: slot.slot,
            startTime: startTime.trim(),
            endTime: endTime.trim(),
            capacity: slot.capacity,
            available,
            slotsLeft,
            isPassed,
            recommended: available && slotsLeft > slot.capacity * 0.5
          };
        });
        setTimeSlots(formattedSlots);
      } else {
        // Generate default slots based on temple timings
        setTimeSlots(generateTimeSlotsFromTemple(temple));
      }
    } catch (error) {
      console.error('Error loading slots:', error);
      setTimeSlots(generateTimeSlotsFromTemple(temple));
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlotsFromTemple = (templeData) => {
    const slots = [];
    const opening = templeData.timings?.opening || '06:00';
    const closing = templeData.timings?.closing || '20:00';
    const [startHour] = opening.split(':').map(Number);
    const [endHour] = closing.split(':').map(Number);
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endHour24 = minute === 30 ? hour + 1 : hour;
        const endMinute = minute === 30 ? '00' : '30';
        const endTime = `${endHour24.toString().padStart(2, '0')}:${endMinute}`;
        
        const capacity = templeData.capacity || 100;
        const booked = Math.floor(Math.random() * capacity * 0.8);
        const slotsLeft = capacity - booked;
        const isPassed = isSlotPassed(time, selectedDate);
        const available = !isPassed && slotsLeft > 0;
        
        slots.push({
          id: `${time}-${endTime}`,
          startTime: time,
          endTime: endTime,
          capacity: capacity,
          available: available,
          slotsLeft: slotsLeft,
          isPassed,
          recommended: available && slotsLeft > capacity * 0.5
        });
      }
    }
    return slots;
  };

  const handleSlotSelect = (slot) => {
    if (slot.available) {
      setSelectedSlot(slot);
      setAlternateSlots([]);
    } else {
      // Find alternate slots
      const alternates = timeSlots
        .filter(s => s.available && s.recommended)
        .slice(0, 3);
      setAlternateSlots(alternates);
      setSelectedSlot(null);
    }
  };

  const handleProceedToBooking = () => {
    if (selectedSlot) {
      navigate('/booking-confirmation', {
        state: {
          temple: temple,
          date: selectedDate,
          timeSlot: selectedSlot
        }
      });
    }
  };

  const formatTime12Hour = (time24) => {
    const [hour, minute] = time24.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  if (!temple) return null;

  return (
    <div className="timeslot-container">
      <div className="timeslot-header">
        <h1>Select Time Slot</h1>
        <div className="selected-temple-info">
          <h3>{temple.name}</h3>
          <p>📍 {temple.location}</p>
        </div>
      </div>

      <div className="timeslot-content">
        {/* Date Selection */}
        <div className="date-selection">
          <label htmlFor="visit-date">Select Date:</label>
          <input
            type="date"
            id="visit-date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Legend */}
        <div className="slot-legend">
          <div className="legend-item">
            <span className="legend-dot available"></span>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot recommended"></span>
            <span>Recommended</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot full"></span>
            <span>Full</span>
          </div>
        </div>

        {/* Time Slots Grid */}
        <div className="timeslots-grid">
          {timeSlots.map((slot) => (
            <div
              key={slot.id}
              className={`timeslot-card ${
                slot.available ? 'available' : 'full'
              } ${slot.recommended ? 'recommended' : ''} ${
                selectedSlot?.id === slot.id ? 'selected' : ''
              } ${slot.isPassed ? 'passed' : ''}`}
              onClick={() => handleSlotSelect(slot)}
              style={{ cursor: slot.isPassed ? 'not-allowed' : 'pointer' }}
            >
              <div className="slot-time">
                {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
              </div>
              <div className="slot-info">
                {slot.isPassed ? (
                  <span className="passed-badge">⏰ Time Passed</span>
                ) : slot.available ? (
                  <>
                    <span className="slots-left">{slot.slotsLeft} slots left</span>
                    {slot.recommended && <span className="recommended-badge">✨ Best Time</span>}
                  </>
                ) : (
                  <span className="full-badge">FULL</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Alternate Slots Suggestion */}
        {alternateSlots.length > 0 && (
          <div className="alternate-slots">
            <h3>⚠️ Selected slot is full. Try these alternatives:</h3>
            <div className="alternate-slots-grid">
              {alternateSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="alternate-slot-card"
                  onClick={() => {
                    setSelectedSlot(slot);
                    setAlternateSlots([]);
                  }}
                >
                  <div className="slot-time">
                    {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                  </div>
                  <div className="slot-info">
                    <span className="slots-left">{slot.slotsLeft} slots available</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Slot Info */}
        {selectedSlot && (
          <div className="selected-slot-info">
            <h3>✓ Selected Slot</h3>
            <p>
              <strong>{formatTime12Hour(selectedSlot.startTime)} - {formatTime12Hour(selectedSlot.endTime)}</strong>
            </p>
            <p>Date: {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="timeslot-actions">
          <button onClick={() => navigate('/temple-selection')} className="btn-back">
            Back to Temples
          </button>
          <button
            onClick={handleProceedToBooking}
            className="btn-proceed"
            disabled={!selectedSlot}
          >
            Proceed to Booking
          </button>
        </div>
      </div>
    </div>
  );
}
