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
  console.log(user,"user");
  

  return (
    <header className="border-b border-solar-border/50 sticky top-0 z-30 backdrop-blur-sm bg-linear-to-r from-solar-bg/90 via-solar-bg/50 to-transparent transition-all duration-300">
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
                className={`
                  flex items-center space-x-2 p-1.5 rounded-2xl transition-all duration-300
                  ${showDropdown 
                    ? "bg-solar-yellow/20 ring-2 ring-solar-yellow/50" 
                    : "bg-solar-night/30 hover:bg-solar-night/50 border border-solar-yellow/30"}
                `}
              >
                <div className="relative">
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt="Profile"
                      className="w-8 h-8 rounded-xl object-cover border border-solar-yellow/30"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-linear-to-br from-solar-yellow to-solar-orange rounded-xl flex items-center justify-center shadow-solar-glow-yellow/30">
                      <span className="text-solar-dark text-xs font-bold leading-none">
                        {user.first_name?.charAt(0) || user.last_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-solar-success rounded-full border-2 border-solar-bg" />
                </div>
                
                <div className="hidden md:flex flex-col items-start pr-2">
                  <span className="text-sm font-semibold text-solar-primary leading-tight">
                    {user.first_name || 'Solar'} {user.last_name || 'User'}
                  </span>
                  <span className="text-[10px] text-solar-muted uppercase tracking-wider font-bold">
                    {user.role?.replace('_', ' ') || 'Member'}
                  </span>
                </div>
                
                <svg 
                  className={`w-4 h-4 text-solar-muted transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showDropdown && (
                <>
                  {/* Backdrop for closing */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowDropdown(false)}
                  />
                  
                  <div className="
                    absolute right-0 mt-3 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-200
                    bg-solar-surface/95 dark:bg-solar-night/95 backdrop-blur-xl
                    rounded-2xl overflow-hidden border border-solar-border/50 shadow-2xl
                  ">
                    {/* User Info Header */}
                    <div className="px-5 py-4 bg-linear-to-br from-solar-yellow/5 to-transparent border-b border-solar-border/50">
                      <div className="flex items-center space-x-3 mb-1">
                         <div className="w-10 h-10 bg-solar-yellow/10 rounded-xl flex items-center justify-center text-solar-yellow">
                           <UserIcon size={20} />
                         </div>
                         <div className="flex flex-col">
                           <p className="text-sm font-bold text-solar-primary leading-none mb-1">
                             {user.first_name} {user.last_name}
                           </p>
                           <p className="text-xs text-solar-muted truncate max-w-[140px]">
                             {user.email}
                           </p>
                         </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2 space-y-1">
                      <button className="
                        w-full flex items-center px-4 py-2.5 text-sm rounded-xl
                        text-solar-primary hover:bg-solar-yellow/10 hover:text-solar-yellow
                        transition-all duration-200 group
                      ">
                        <UserIcon size={18} className="mr-3 text-solar-muted group-hover:text-solar-yellow transition-colors" />
                        My Profile
                      </button>
                      
                      <button className="
                        w-full flex items-center px-4 py-2.5 text-sm rounded-xl
                        text-solar-primary hover:bg-solar-yellow/10 hover:text-solar-yellow
                        transition-all duration-200 group
                      ">
                        <Settings size={18} className="mr-3 text-solar-muted group-hover:text-solar-yellow transition-colors" />
                        Account Settings
                      </button>
                    </div>

                    {/* Logout Footer */}
                    <div className="p-2 pt-0 border-t border-solar-border/30 mt-1">
                      <button
                        onClick={handleLogout}
                        className="
                          w-full flex items-center px-4 py-2.5 text-sm rounded-xl
                          text-red-500 hover:bg-red-500/10 transition-all duration-200 group
                        "
                      >
                        <LogOut size={18} className="mr-3 opacity-70 group-hover:opacity-100" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
