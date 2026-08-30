import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PortalCards from './components/PortalCards';
import Workflow from './components/Workflow';
import Features from './components/Features';
import TrustSection from './components/TrustSection';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import UrlConfigModal from './components/UrlConfigModal';
import { navigateToPortal } from './config/portalLinks';

export default function App() {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    data: null
  });

  const handlePortalNavigation = (portalType) => {
    navigateToPortal(portalType, (missingData) => {
      setModalConfig({
        isOpen: true,
        data: missingData
      });
    });
  };

  const closeModal = () => {
    setModalConfig({
      isOpen: false,
      data: null
    });
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navigation Bar */}
      <Navbar onNavigatePortal={handlePortalNavigation} />

      {/* Main Content Area */}
      <main className="flex-1">
        <Hero onNavigatePortal={handlePortalNavigation} />
        <PortalCards onNavigatePortal={handlePortalNavigation} />
        <Workflow />
        <Features />
        <TrustSection />
        <FinalCTA onNavigatePortal={handlePortalNavigation} />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Configuration Error/Notice Modal */}
      <UrlConfigModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        configData={modalConfig.data}
      />
    </div>
  );
}
