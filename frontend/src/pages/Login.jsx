import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import authApi from '../api/authApi';
import '../styles/Auth.css';

export default function Login() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login({
        email: formData.email,
        password: formData.password,
      });

      // Show success message
      alert('Login successful! Welcome back.');
      
      // Redirect based on role
      if (response.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.role === 'volunteer') {
        navigate('/volunteer/panel');
      } else {
        navigate('/visitor/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleTitle = () => {
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Left Side - Welcome */}
        <div className="auth-welcome">
          <h1>Welcome</h1>
          <p>Join Our Magical Platform, Explore a New Experience</p>
          <Link to={`/register/${role}`} className="auth-switch-btn">
            REGISTER
          </Link>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="auth-form-section">
          <h2>Sign In</h2>
          <p className="auth-role-text">Login as {getRoleTitle()}</p>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>

          <div className="auth-back-link">
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
