import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Navbar from "./Navbar";
import EnergyLayer from "./EnergyLayer";
import BackgroundLayer from "./BackgroundLayer";
import FloatingParticles from "./FloatingParticles";
import SunCanvas from "./SunCanvas";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative h-screen w-full font-sans bg-solar-bg overflow-hidden">
      {/* 🌌 Visual Background Layers */}
      <BackgroundLayer />
      <FloatingParticles />
      <SunCanvas />

      {/* 🔐 App Layout */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Header */}
        <header className="relative z-30 shrink-0">
          <Header setSidebarOpen={setSidebarOpen} />
        </header>

        {/* Main Section */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`
              relative z-20
              shrink-0
              transition-all duration-300
              ${sidebarOpen ? "w-64" : "w-0 md:w-64"}
            `}
          >
            <Navbar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
          </aside>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className="relative z-30 shrink-0 bg-solar-card/80 backdrop-blur-md border-t border-solar-border">
          <Footer />
        </footer>
      </div>
    </div>
  );
}

export default Layout;
