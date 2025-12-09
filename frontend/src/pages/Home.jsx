import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import AppFeatures from '../components/AppFeatures';
import Sidebar from '../components/Sidebar';
//import HeroSection from '../components/HeroSectionClean';

// Landing page with quick links to registration and queue display
export default function Home() {
  return (
    <main>
      <Sidebar />
      <HeroSection />
      <FeaturesSection />
      <AppFeatures />
    </main>
  );
}