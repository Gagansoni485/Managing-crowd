import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import authApi from '../api/authApi';
import '../styles/Auth.css';

export default function Register() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    staffRole: '', // For volunteer/staff registration
    profileImage: '' // Cloudinary URL
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async () => {
    if (!imageFile) return null;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', 'ml_default'); // Unsigned preset

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dpkabaw9i/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      
      console.log('Cloudinary response:', data);
      
      if (!response.ok) {
        console.error('Cloudinary error:', data);
        throw new Error(data.error?.message || 'Image upload failed');
      }
      
      setUploadingImage(false);
      console.log('Image uploaded successfully:', data.secure_url);
      return data.secure_url;
    } catch (error) {
      setUploadingImage(false);
      console.error('Upload error:', error);
      throw new Error('Image upload failed: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    // Validate staff role for volunteer registration
    if (role === 'volunteer' && !formData.staffRole) {
      setError('Please select your staff role');
      return;
    }

    // Validate profile image for visitor registration
    if (role === 'visitor' && !imageFile) {
      setError('Please upload a profile image');
      return;
    }

    setLoading(true);

    try {
      // Upload image to Cloudinary if visitor
      let profileImageUrl = null;
      if (role === 'visitor' && imageFile) {
        console.log('Starting image upload...');
        profileImageUrl = await uploadImageToCloudinary();
        console.log('Image URL received:', profileImageUrl);
      }

      console.log('Registering user with data:', {
        name: formData.name,
        email: formData.email,
        phone: formData.phoneNumber,
        role: role || 'visitor',
        profileImage: profileImageUrl,
      });

      await authApi.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phoneNumber,
        password: formData.password,
        role: role || 'visitor',
        staffRole: role === 'volunteer' ? formData.staffRole : null,
        profileImage: profileImageUrl,
      });

      // Show success message
      alert('Registration successful! You can now login.');
      
      // Redirect to login after successful registration
      navigate(`/login/${role}`);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleTitle = () => {
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        {/* Left Side - Welcome */}
        <div className="auth-welcome">
          <h1>Welcome</h1>
          <p>Join Our Magical Platform, Explore a New Experience</p>
          <Link to={`/login/${role}`} className="auth-switch-btn">
            LOGIN
          </Link>
        </div>

        {/* Right Side - Register Form */}
        <div className="auth-form-section">
          <h2>Register</h2>
          <p className="auth-role-text">Register as {getRoleTitle()}</p>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Profile Image Upload for Visitors */}
            {role === 'visitor' && (
              <div className="form-group">
                <label htmlFor="profileImage">Profile Image *</label>
                <input
                  type="file"
                  id="profileImage"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="form-file-input"
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Profile preview" />
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

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
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </div>

            {/* Staff Role Dropdown for Volunteer Registration */}
            {role === 'volunteer' && (
              <div className="form-group">
                <label htmlFor="staffRole">Staff Role *</label>
                <select
                  id="staffRole"
                  name="staffRole"
                  value={formData.staffRole}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="">Select your role...</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="guard">Guard</option>
                  <option value="medical">Medical Staff</option>
                  <option value="security">Security</option>
                  <option value="first-aid">First Aid</option>
                  <option value="cleaning">Cleaning Staff</option>
                  <option value="information-desk">Information Desk</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading || uploadingImage}>
              {uploadingImage ? 'UPLOADING IMAGE...' : loading ? 'REGISTERING...' : 'REGISTER'}
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
