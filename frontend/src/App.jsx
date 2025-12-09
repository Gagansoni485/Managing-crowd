import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import VolunteerPanel from './components/VolunteerPanel.jsx';
import VisitorDashboard from './pages/VisitorDashboard.jsx';
import TempleSelection from './pages/TempleSelection.jsx';
import TimeSlotSelection from './pages/TimeSlotSelection.jsx';
import BookingConfirmation from './pages/BookingConfirmation.jsx';
import VirtualToken from './pages/VirtualToken.jsx';
import EmergencyHelp from './pages/EmergencyHelp.jsx';
import CrowdHeatmap from './components/CrowdHeatmap.jsx';
import GuardScanner from './pages/GuardScanner.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login/:role" element={<Login />} />
          <Route path="/register/:role" element={<Register />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/volunteer/panel" element={<VolunteerPanel />} />
          <Route path="/visitor/dashboard" element={<VisitorDashboard />} />
          <Route path="/temple-selection" element={<TempleSelection />} />
          <Route path="/time-slot-selection" element={<TimeSlotSelection />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/virtual-token" element={<VirtualToken />} />
          <Route path="/emergency-help" element={<EmergencyHelp />} />
          <Route path="/crowd-heatmap" element={<CrowdHeatmap />} />
          <Route path="/guard/scanner" element={<GuardScanner />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App