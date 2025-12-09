import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import emergencyApi from '../api/emergencyApi';
import '../styles/EmergencyHelp.css';
import { useLanguageContext } from '../context/LanguageContext';
import translations from '../config/translations';

export default function EmergencyHelp() {
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const t = translations[language]; // Get translations for current language

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    description: ''
  });
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }
        if (finalTranscript) {
          setFormData(prev => ({
            ...prev,
            description: prev.description + finalTranscript
          }));
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [language]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleVoiceInput = () => {
    if (!recognition) {
      alert(language === 'hi' 
        ? 'आपके ब्राउज़र में वाणी पहचान समर्थित नहीं है। कृपया क्रोम या एज का उपयोग करें।' 
        : 'Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleCallMedicalTeam = async () => {
    if (!formData.phone) {
      alert(t.enterPhone);
      return;
    }

    if (!formData.location) {
      alert(t.selectLocationError);
      return;
    }

    if (!formData.description) {
      alert(t.describeEmergencyError);
      return;
    }

    try {
      // Submit emergency request to backend
      await emergencyApi.createEmergencyRequest({
        type: 'medical', // Can be changed based on emergency type selector
        description: formData.description,
        location: formData.location,
        phone: formData.phone,
        name: formData.name || (language === 'hi' ? 'अनाम' : 'Anonymous'),
      });

      alert(`${t.emergencyAlertSent}

${t.yourDetails}
${t.phoneNumber}: ${formData.phone}
${t.selectLocation}: ${formData.location}

${t.helpOnWay}`);

      // Reset form
      setFormData({
        name: '',
        phone: '',
        location: '',
        description: ''
      });

      // Optionally navigate back
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error submitting emergency request:', error);
      alert(t.emergencyFailed);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCallMedicalTeam();
  };

  const locations = [
    t.mainTempleEntrance,
    t.prayerHall,
    t.courtyard,
    t.parkingArea,
    t.foodCourt,
    t.restroomArea,
    t.garden,
    t.administrativeOffice,
    t.other
  ];

  return (
    <div className="emergency-container">
      <div className="emergency-header">
        <button onClick={() => navigate('/')} className="back-btn">
          {t.back}
        </button>
        <div className="emergency-badge">{t.guestUser}</div>
      </div>

      <div className="emergency-card">
        <div className="emergency-icon">
          <span className="pulse-icon">🚨</span>
        </div>
        
        <h1 className="emergency-title">{t.emergencyHelp}</h1>
        <p className="emergency-subtitle">{t.quickAccess}</p>

        <form onSubmit={handleSubmit} className="emergency-form">
          <div className="form-group">
            <label htmlFor="name">
              {t.enterName} <span className="optional">({t.optional})</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={t.enterName}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              {t.phoneNumber} <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder={t.phoneNumber}
              className="form-input"
              required
              pattern="[0-9]{10}"
              title={t.phoneValidation}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">
              {t.selectLocation} <span className="required">*</span>
            </label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">{t.chooseLocation}</option>
              {locations.map((loc, index) => (
                <option key={index} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              {t.describeEmergency} <span className="required">*</span>
            </label>
            <div className="textarea-wrapper">
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t.describeEmergencyPlaceholder}
                className="form-textarea"
                rows="5"
                required
              />
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`voice-btn ${isListening ? 'listening' : ''}`}
                title={isListening ? t.voiceInputStop : t.voiceInputStart}
              >
                {isListening ? (
                  <>
                    <span className="mic-icon recording">🎤</span>
                    <span className="recording-indicator">{t.recording}</span>
                  </>
                ) : (
                  <>
                    <span className="mic-icon">🎤</span>
                    <span>{t.voiceInput}</span>
                  </>
                )}
              </button>
            </div>
            <p className="voice-hint">{t.tapMicrophone}</p>
          </div>

          <button type="submit" className="call-medical-btn">
            {t.callMedicalTeam}
          </button>

          <div className="emergency-benefits">
            <div className="benefit-item">
              <span className="check-icon">✅</span>
              <span>{t.noLoginRequired}</span>
            </div>
            <div className="benefit-item">
              <span className="check-icon">✅</span>
              <span>{t.savesLives}</span>
            </div>
          </div>
        </form>
      </div>

      <div className="emergency-info">
        <p className="info-text">
          {t.medicalTeamAvailable}
        </p>
      </div>
    </div>
  );
}