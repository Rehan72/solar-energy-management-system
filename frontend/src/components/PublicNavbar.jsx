import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Menu, X, Zap, LogIn } from 'lucide-react';

export default function PublicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Solar Components', path: '/solar-installation' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 ${
        isScrolled 
          ? 'bg-solar-night/80 backdrop-blur-xl border-b border-solar-border shadow-2xl' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-solar-yellow rounded-xl shadow-solar-glow-yellow group-hover:scale-110 transition-transform duration-300">
            <Sun size={24} className="text-solar-dark" />
          </div>
          <span className="text-xl font-bold tracking-tight sun-glow-text hidden sm:block">
            SOLAR<span className="text-solar-yellow">EDGE</span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors duration-300 hover:text-solar-yellow ${
                isActive(link.path) ? 'text-solar-yellow' : 'text-solar-primary'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="h-4 w-px bg-solar-border mx-2"></div>

          <Link 
            to="/login" 
            className="text-sm font-medium text-solar-muted hover:text-solar-yellow transition-colors duration-300 flex items-center gap-2"
          >
            <LogIn size={16} />
            Login
          </Link>

          <Link 
            to="/register" 
            className="sun-button sun-button-sm"
          >
            Get Started
          </Link>
        </div>

        {/* MOBILE TOGGLE */}
        <button 
          className="md:hidden p-2 text-solar-primary hover:text-solar-yellow transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-solar-night/95 backdrop-blur-2xl border-b border-solar-border animate-fade-in md:hidden">
          <div className="flex flex-col p-6 gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-lg font-semibold ${
                  isActive(link.path) ? 'text-solar-yellow' : 'text-solar-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-solar-border" />
            <div className="flex flex-col gap-4">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-solar-muted font-medium"
              >
                <LogIn size={20} />
                Login to Dashboard
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="sun-button text-center w-full"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
