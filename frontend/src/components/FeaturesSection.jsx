import React, { useState } from "react";
import "../styles/FeaturesSection.css";

export default function FeaturesSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const stats = [
    { value: "50+", label: "Sacred Temples" },
    { value: "25k+", label: "Happy Devotees" },
    { value: "15+", label: "Years Of Service" },
    { value: "100+", label: "Divine Experiences" },
  ];

  const testimonials = [
    {
      quote: "The spiritual journey organized by Temple Journey was life-changing. The attention to detail and deep respect for traditions made every moment sacred.",
      name: "Priya Sharma",
      designation: "Devotee from Mumbai",
      src: "/people1.jpg",
    },
    {
      quote: "An unforgettable experience visiting ancient temples. The guidance and arrangements were perfect, allowing us to focus on our spiritual connection.",
      name: "Rajesh Kumar",
      designation: "Pilgrim from Delhi",
      src: "/people2.jpg",
    },
    {
      quote: "Temple Journey made our family pilgrimage seamless and deeply meaningful. Their knowledge of rituals and sacred sites is unmatched.",
      name: "Anjali Patel",
      designation: "Visitor from Ahmedabad",
      src: "/people3.jpeg",
    },
    {
      quote: "The peaceful temple visits and well-organized darshan experiences brought immense spiritual fulfillment to our entire group.",
      name: "Vikram Singh",
      designation: "Group Leader from Jaipur",
      src: "/people.jpg",
    },
  ];

  const handleNext = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <>
      {/* About Us Section */}
      <section className="about-section" id="about-section">
        <div className="about-header">
          <h2 className="about-page-title">About Us</h2>
          <div className="breadcrumb">
            <span className="breadcrumb-link">Home</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">About Us</span>
          </div>
        </div>

        <div className="about-content-wrapper">
          <div className="about-story-section">
            <div className="story-text">
              <div className="story-badge">OUR STORY</div>
              <h3 className="story-title">
                Your Vision Our Expertise Your Success Get Noticed Generate
                <span className="highlight-text"> Divine Blessings.</span>
              </h3>
            </div>

            <div className="story-images">
              <div className="story-image-card">
                <img src="/about.jpg" alt="Temple Experience 1" className="story-img" />
                <div className="image-badge">Sacred Journeys</div>
              </div>
              <div className="story-image-card">
                <img src="/about1.webp" alt="Temple Experience 2" className="story-img" />
                <div className="image-badge">Divine Grace</div>
              </div>
            </div>
          </div>

          <div className="about-main-image">
            <img src="/about2.png" alt="Our Temple Community" className="main-story-img" />
          </div>

          <div className="about-description">
            <p className="description-text">
              At Temple Journey, we're passionate about helping you experience the heart and soul of divine temples.
              With deep spiritual knowledge and a love for sacred traditions, we curate unforgettable spiritual experiences—
              from serene temple visits and vibrant festivals to ancient rituals and peaceful meditation trails.
              Whether you're a first time visitor or a seasoned devotee, our mission is to make your spiritual journey authentic,
              seamless, and truly memorable.
            </p>
          </div>

          <div className="about-stats">
            {stats.map((stat, index) => (
              <div className="stat-item" key={index}>
                <h4 className="stat-value">{stat.value}</h4>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section" id="testimonials-section">
        <div className="testimonials-header">
          <h2 className="testimonials-title">Devotee Experiences</h2>
          <p className="testimonials-subtitle">
            Hear from those who found peace and spirituality through their temple journeys
          </p>
        </div>

        <div className="testimonials-container">
          <div className="testimonials-images">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`testimonial-image-wrapper ${
                  index === activeTestimonial ? 'active' : ''
                } ${index < activeTestimonial ? 'past' : ''} ${index > activeTestimonial ? 'future' : ''}`}
                style={{ zIndex: index === activeTestimonial ? 10 : testimonials.length - Math.abs(index - activeTestimonial) }}
              >
                <img
                  src={testimonial.src}
                  alt={testimonial.name}
                  className="testimonial-img"
                />
              </div>
            ))}
          </div>

          <div className="testimonials-content">
            <div className="testimonial-text">
              <h3 className="testimonial-name">{testimonials[activeTestimonial].name}</h3>
              <p className="testimonial-designation">{testimonials[activeTestimonial].designation}</p>
              <p className="testimonial-quote">
                {testimonials[activeTestimonial].quote.split(' ').map((word, index) => (
                  <span key={index} className="quote-word" style={{ animationDelay: `${index * 0.03}s` }}>
                    {word}{' '}
                  </span>
                ))}
              </p>
            </div>

            <div className="testimonial-controls">
              <button className="control-btn" onClick={handlePrev} aria-label="Previous testimonial">
                <svg viewBox="0 0 24 24" fill="currentColor" className="control-icon">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
              </button>
              <button className="control-btn" onClick={handleNext} aria-label="Next testimonial">
                <svg viewBox="0 0 24 24" fill="currentColor" className="control-icon">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
