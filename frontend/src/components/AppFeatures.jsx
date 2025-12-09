import React, { useState } from 'react';
import '../styles/AppFeatures.css';

export default function AppFeatures() {
  const [selectedCard, setSelectedCard] = useState(null);

  const features = [
    {
      id: 1,
      title: "Virtual Queue Management",
      description: "Skip the long lines with our smart digital queue system. Get real-time updates on your position and estimated darshan time from anywhere.",
      image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?q=100&w=1920&auto=format&fit=crop",
      className: "feature-card-large"
    },
    {
      id: 2,
      title: "Smart Parking System",
      description: "Find and reserve parking spots before you arrive. Real-time availability updates ensure a hassle-free temple visit.",
      image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=100&w=1920&auto=format&fit=crop",
      className: "feature-card-small"
    },
    {
      id: 3,
      title: "Emergency Assistance",
      description: "Instant access to help during your temple visit. Connect with volunteers and temple authorities at the touch of a button.",
      image: "https://images.unsplash.com/photo-1584515933487-779824d29309?q=100&w=1920&auto=format&fit=crop",
      className: "feature-card-small"
    },
    {
      id: 4,
      title: "Temple Information Hub",
      description: "Explore detailed information about temple rituals, timings, special events, and sacred traditions all in one place.",
      image: "https://images.unsplash.com/photo-1548013146-72479768bada?q=100&w=1920&auto=format&fit=crop",
      className: "feature-card-large"
    }
  ];

  const handleCardClick = (card) => {
    setSelectedCard(selectedCard?.id === card.id ? null : card);
  };

  return (
    <section className="app-features-section" id="features-section">
      <div className="features-intro">
        <h2 className="features-main-title">App Features</h2>
        <p className="features-main-subtitle">
          Experience seamless temple visits with our comprehensive digital solutions
        </p>
      </div>

      <div className="features-layout-grid">
        {features.map((feature) => (
          <div
            key={feature.id}
            className={`feature-grid-card ${feature.className} ${
              selectedCard?.id === feature.id ? 'selected' : ''
            }`}
            onClick={() => handleCardClick(feature)}
          >
            <div className="feature-card-image-wrapper">
              <img
                src={feature.image}
                alt={feature.title}
                className="feature-card-image"
              />
              <div className="feature-card-overlay"></div>
            </div>

            <div className={`feature-card-content ${selectedCard?.id === feature.id ? 'expanded' : ''}`}>
              <h3 className="feature-card-title">{feature.title}</h3>
              <p className="feature-card-description">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedCard && (
        <div className="feature-modal-overlay" onClick={() => setSelectedCard(null)}></div>
      )}
    </section>
  );
}
