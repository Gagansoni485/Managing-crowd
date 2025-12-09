import React from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/HeroSection.css";
import { useLanguageContext } from '../context/LanguageContext';
import translations from '../config/translations';

export default function HeroSection() {
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const t = translations[language]; // Get translations for current language

  const handleStartJourney = () => {
    navigate('/login/visitor');
  };

  const handleNavClick = (path) => {
    // For now, scroll to sections or navigate to pages
    switch(path) {
      case 'about':
        // Scroll to about section
        document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'testimonials':
        // Scroll to testimonials section
        document.getElementById('testimonials-section')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'features':
        // Scroll to features section
        document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
        break;
      default:
        break;
    }
  };

  return (
    <section className="hero-section">
      {/* Background Image */}
      <img
        src="/home1.jpg"
        alt="Temple background"
        className="hero-bg"
      />

      {/* Overlay */}
      <div className="hero-overlay"></div>

      {/* Top Navigation */}
      <div className="hero-nav-wrapper">
        <div className="hero-nav">
          <div className="hero-logo">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
            <span className="logo-text">Temple Journey</span>
          </div>
          <div className="nav-links">
            <button className="nav-link active" onClick={() => handleNavClick('home')}>Home</button>
            <button className="nav-link" onClick={() => handleNavClick('about')}>About-us</button>
            <button className="nav-link" onClick={() => handleNavClick('testimonials')}>Testimonials</button>
            <button className="nav-link" onClick={() => handleNavClick('features')}>Feature</button>
          </div>
          <button className="btn-start-journey" onClick={handleStartJourney}>
            <span>{language === 'hi' ? 'अपनी यात्रा शुरू करें' : 'Start Your Journey'}</span>
            <svg className="arrow-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title-main">
            <span className="typewriter-line">{language === 'hi' ? 'के जादू की खोज करें' : 'Discover the Magic of'}</span>
            <br />
            <span className="typewriter-line typewriter-delay-1">{language === 'hi' ? 'मंदिरों: आपकी महान' : 'Temples:Your Great'}</span>
            <br />
            <span className="typewriter-line typewriter-delay-2">{language === 'hi' ? 'यात्रा प्रतीक्षा कर रही है' : 'Adventure Awaits'}</span>
          </h1>

          <p className="hero-description">
            {language === 'hi' 
              ? 'स्वर्णिम मंदिरों से लेकर उष्णकटिबंधीय समुद्र तटों तक — मंदिर की खोज करें'
              : 'From golden temples to tropical beaches — explore Temple\'s'}
            <br />
            {language === 'hi' 
              ? 'सुंदरता, संस्कृति और भोजन का अनुभव पहले कभी नहीं की तरह।' 
              : 'beauty, culture, and cuisine like never before.'}
          </p>
        </div>
      </div>
    </section>
  );
}