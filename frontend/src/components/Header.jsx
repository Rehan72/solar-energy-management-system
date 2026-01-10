import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';
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
    <header className="bg-solar-card/80 backdrop-blur-md border-b border-solar-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-solar-muted hover:text-solar-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-solar-yellow sun-button p-2 rounded-lg"
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
            {/* <button className="text-solar-muted hover:text-solar-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-solar-yellow sun-button p-2 rounded-lg">
              <span className="sr-only">View notifications</span>
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
                  d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21c4.411 0 8-4.03 8-9s-3.589-9-8-9-8 4.03-8 9a9.06 9.06 0 001.832 5.683L4 21l4.868-8.317z"
                />
              </svg>
            </button> */}

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solar-yellow sun-button p-1"
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
                <div className="absolute right-0 mt-2 w-48 bg-[#ffffff] rounded-lg shadow-lg border border-solar-border py-1 z-50">
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
                    className="w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 sun-button"
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
