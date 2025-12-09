import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import templeApi from '../api/templeApi';
import '../styles/TempleSelection.css';

export default function TempleSelection() {
  const navigate = useNavigate();
  const [selectedTemple, setSelectedTemple] = useState(null);
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTemples();
  }, []);

  const fetchTemples = async () => {
    try {
      setLoading(true);
      const data = await templeApi.getAllTemples();
      setTemples(data);
    } catch (err) {
      setError('Failed to load temples. Please try again.');
      console.error('Error fetching temples:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter temples based on search query
  const filteredTemples = temples.filter((temple) =>
    temple.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    temple.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTempleSelect = (temple) => {
    setSelectedTemple(temple);
  };

  const handleProceed = () => {
    if (selectedTemple) {
      navigate('/time-slot-selection', { state: { temple: selectedTemple } });
    }
  };

  if (loading) {
    return (
      <div className="temple-selection-container">
        <div className="loading-message">Loading temples...</div>
      </div>
    );
  }

  return (
    <div className="temple-selection-container">
      <div className="temple-selection-header">
        <h1>Select Your Temple</h1>
        <p>Choose the temple you wish to visit</p>
        
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search temples by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="temple-search-input"
          />
          {searchQuery && (
            <button 
              className="clear-search" 
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
        
        {filteredTemples.length > 0 && (
          <p className="results-count">
            {filteredTemples.length} temple{filteredTemples.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {filteredTemples.length === 0 ? (
        <div className="no-results">
          <p>No temples found matching "{searchQuery}"</p>
          <button onClick={() => setSearchQuery('')} className="btn-back">
            Clear Search
          </button>
        </div>
      ) : (
        <div className="temples-grid">
          {filteredTemples.map((temple) => (
            <div
              key={temple._id || temple.id}
              className={`temple-card ${selectedTemple?._id === temple._id ? 'selected' : ''}`}
              onClick={() => handleTempleSelect(temple)}
            >
              <div className="temple-image-wrapper">
                <img 
                  src={temple.imageUrl || temple.image || 'https://via.placeholder.com/400x300?text=Temple'} 
                  alt={temple.name} 
                  className="temple-image" 
                />
                <div className="capacity-badge">
                  Capacity: {temple.capacity}
                </div>
              </div>
              
              <div className="temple-info">
                <h3>{temple.name}</h3>
                <p className="temple-location">📍 {temple.location}</p>
                <p className="temple-description">
                  {temple.description || 'Sacred place of worship'}
                </p>
                
                <div className="temple-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🕐</span>
                    <span>{temple.timings?.opening} - {temple.timings?.closing}</span>
                  </div>
                </div>
              </div>

              {selectedTemple?._id === temple._id && (
                <div className="selected-indicator">✓</div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="selection-actions">
        <button onClick={() => navigate('/')} className="btn-back">
          Back to Home
        </button>
        <button 
          onClick={handleProceed} 
          className="btn-proceed"
          disabled={!selectedTemple}
        >
          Proceed to Time Slot Selection
        </button>
      </div>
    </div>
  );
}
