import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import { logout } from '../lib/auth';
import { notify } from '../lib/toast';
import { LogOut, User as UserIcon, Settings } from 'lucide-react';

function Header({ setSidebarOpen }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    notify.success('Logged out successfully');
    logout();
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <header className="solar-glass border-b border-solar-border sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-solar-muted hover:text-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow p-2 rounded-xl transition-colors duration-300"
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold sun-glow-text">
              Solar Energy Management
            </h1>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <div className="z-30">
              <ThemeToggle />
            </div>

            {/* Notifications */}
            <NotificationBell />

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-solar-yellow p-1 bg-solar-night/50 hover:bg-solar-night transition-all duration-300"
              >
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={`${user.first_name || 'User'}'s profile`}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-solar-yellow rounded-full flex items-center justify-center">
                    <span className="text-solar-dark text-sm font-medium">
                      {user.first_name?.charAt(0) || user.last_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <span className="ml-2 text-solar-primary hidden md:block font-medium">
                  {user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.first_name || user.last_name || 'User'}
                </span>
              </button>

              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-56 solar-glass rounded-2xl py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-solar-border">
                    <p className="text-sm font-medium text-solar-primary">
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.first_name || user.last_name || 'User'}
                    </p>
                    <p className="text-xs text-solar-muted">{user.email || ''}</p>
                  </div>
                  <button className="w-full flex items-center px-4 py-2 text-sm text-solar-primary hover:bg-solar-panel/10 sun-button">
                    <UserIcon size={16} className="mr-2" />
                    Profile
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-sm text-solar-primary hover:bg-solar-panel/10 sun-button">
                    <Settings size={16} className="mr-2" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-solar-danger hover:bg-solar-danger/10 sun-button"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
