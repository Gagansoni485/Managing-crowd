import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';
import { useLanguageContext } from '../context/LanguageContext';
import translations from '../config/translations';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguageContext();
  const t = translations[language]; // Get translations for current language

  const roles = [
    { name: language === 'hi' ? 'आगंतुक' : 'Visitor', path: '/login/visitor' },
    { name: language === 'hi' ? 'प्रशासक' : 'Admin', path: '/login/admin' },
    { name: language === 'hi' ? 'स्वयंसेवी' : 'Volunteer', path: '/login/volunteer' }
  ];

  const emergencyAction = {
    name: language === 'hi' ? 'आपातकालीन सहायता' : 'Emergency Help',
    path: '/emergency-help'
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleRoleClick = (path) => {
    navigate(path);
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <button 
        className={`hamburger-btn ${isOpen ? 'active' : ''}`} 
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>{language === 'hi' ? 'भूमिका चुनें' : 'Select Role'}</h2>
          <button className="close-btn" onClick={toggleSidebar}>×</button>
        </div>
        
        <div className="sidebar-content">
          {/* Language Toggle Button */}
          <button className="role-btn" onClick={toggleLanguage}>
            <span className="role-name">
              {language === 'en' ? 'हिंदी में देखें' : 'View in English'}
            </span>
          </button>
          
          <div className="sidebar-divider"></div>
          
          {/* Emergency Help Button - Highlighted */}
          <button
            className="role-btn emergency-btn"
            onClick={() => handleRoleClick(emergencyAction.path)}
          >
            <span className="role-name">{emergencyAction.name}</span>
          </button>

          <div className="sidebar-divider"></div>

          {/* Regular Role Buttons */}
          {roles.map((role) => (
            <button
              key={role.name}
              className="role-btn"
              onClick={() => handleRoleClick(role.path)}
            >
              <span className="role-name">{role.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
}