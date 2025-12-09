import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tokenApi from '../api/tokenApi';

export default function VisitorDashboard() {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTokens();
  }, []);

  const fetchMyTokens = async () => {
    try {
      const data = await tokenApi.getVisitorTokens();
      setTokens(data);
      setLoading(false);
      
      // If no tokens, redirect to temple selection
      if (data.length === 0) {
        setTimeout(() => navigate('/temple-selection'), 1500);
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
      setLoading(false);
      // Redirect to temple selection on error (might not be logged in)
      setTimeout(() => navigate('/temple-selection'), 1500);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', minHeight: '100vh', background: '#0d1b2a', color: '#fff' }}>
        <h1 style={{ color: '#e2f382' }}>Loading your bookings...</h1>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', minHeight: '100vh', background: '#0d1b2a', color: '#fff' }}>
        <h1 style={{ color: '#e2f382' }}>No bookings yet</h1>
        <p style={{ color: '#c1d8c3' }}>Redirecting to temple selection...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#0d1b2a', color: '#fff' }}>
      <h1 style={{ color: '#e2f382', marginBottom: '30px' }}>My Bookings</h1>
      <div style={{ display: 'grid', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {tokens.map(token => (
          <div key={token._id} style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(226,243,130,0.3)'
          }}>
            <h3 style={{ color: '#e2f382' }}>Token: {token.tokenNumber}</h3>
            <p>Temple ID: {token.templeId}</p>
            <p>Date: {new Date(token.visitDate).toLocaleDateString()}</p>
            <p>Time Slot: {token.timeSlot}</p>
            <p>Visitors: {token.numberOfVisitors}</p>
            <p>Status: <span style={{
              color: token.status === 'active' ? '#10b981' : '#666'
            }}>{token.status.toUpperCase()}</span></p>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button 
          onClick={() => navigate('/temple-selection')}
          style={{
            padding: '12px 30px',
            background: '#e2f382',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          Book New Visit
        </button>
      </div>
    </div>
  );
}
