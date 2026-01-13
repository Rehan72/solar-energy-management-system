import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, User, X, Columns2, SheetIcon, Users, User2Icon, OrigamiIcon, LogOut, Cpu, Zap, Activity, Inspect } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Calendar } from "lucide-react";
import { logout, getUserRole } from "../lib/auth";

function Navbar({ sidebarOpen, setSidebarOpen }) {
  const [isOpen, setIsOpen] = useState(true);
  const { pathname } = useLocation();
  const userRole = getUserRole();

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  // Menu for regular users (solar customers)
  const userMenu = [
    { name: "My Devices", path: "/devices", icon: <Cpu size={18} /> },
    { name: "Energy Analytics", path: "/energy-analytics", icon: <Zap size={18} /> },
    { name: "Profile", path: "/profile", icon: <User size={18} /> },
  ];

  // Menu for admins (platform administrators)
  const adminMenu = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={18} /> },
    { name: "Regions", path: "/regions", icon: <OrigamiIcon size={18} /> },
    { name: "Plants", path: "/plants", icon: <Zap size={18} /> },
    { name: "Devices", path: "/admin/devices", icon: <Cpu size={18} /> },
    { name: "Admins", path: "/admins", icon: <Users size={18} /> },
    { name: "Users", path: "/users", icon: <User2Icon size={18} /> },
    { name: "Reports", path: "/reports", icon: <SheetIcon size={18} /> },
    // { name: "Event", path: "/event", icon: <Calendar size={18} /> },
    { name: "Simulator", path: "/tool/simulator", icon: <Activity size={18} /> },
  ];

  // Menu for super admins (full system access)
  const superAdminMenu = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={18} /> },
    { name: "Regions", path: "/regions", icon: <OrigamiIcon size={18} /> },
    { name: "Plants", path: "/plants", icon: <Zap size={18} /> },
    { name: "All Devices", path: "/superadmin/all-devices", icon: <Cpu size={18} /> },
    { name: "Energy Analytics", path: "/superadmin/all-energy", icon: <Zap size={18} /> },
    { name: "Admins", path: "/admins", icon: <Users size={18} /> },
    { name: "Users", path: "/users", icon: <User2Icon size={18} /> },
    {name:"Installer",path:"/installers",icon:<Inspect size={18}/>},
    { name: "Reports", path: "/reports", icon: <SheetIcon size={18} /> },
    // { name: "Event", path: "/event", icon: <Calendar size={18} /> },
    { name: "Simulator", path: "/tool/simulator", icon: <Activity size={18} /> },
    { name: "Profile", path: "/superadmin/profile", icon: <User size={18} /> },
  ];

  // Build menu based on user role
  const getMenu = () => {
    if (userRole === "SUPER_ADMIN") return superAdminMenu;
    if (userRole === "ADMIN") return adminMenu;
    return userMenu;
  };

  const menu = getMenu();

  const handleLogout = () => {
    logout();
  };

  // Animation variants
  const sidebarVariants = {
    open: { width: 256 },
    closed: { width: 64 }
  };

  const textVariants = {
    open: {
      opacity: 1,
      width: "auto",
      transition: { delay: 0.1, duration: 0.2 }
    },
    closed: {
      opacity: 0,
      width: 0,
      transition: { duration: 0.15 }
    }
  };

  const iconVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
    active: { scale: 1.15 }
  };

  const collapseButtonVariants = {
    open: { rotate: 0 },
    closed: { rotate: 180 }
  };

  return (
    <>
      {/* Mobile backdrop with animation */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar with smooth width animation */}
      <motion.aside
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className={`fixed lg:static z-50 top-0 left-0 h-screen flex flex-col
          bg-solar-card/95 backdrop-blur-md text-solar-primary border-r border-solar-border shadow-xl
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between p-4 lg:hidden shrink-0">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-semibold text-solar-primary"
          >
            Menu
          </motion.h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg backdrop-blur-sm bg-solar-night/80 border border-solar-border shadow-md hover:shadow-lg hover:bg-solar-yellow/20 hover:text-solar-yellow transition-all duration-300 sun-button"
          >
            <X size={20} />
          </motion.button>
        </div>

        {/* Collapse Toggle Button */}
        <div className={`flex ${isOpen ? 'justify-end' : 'justify-center'} p-3 border-b border-solar-border shrink-0`}>
          <motion.button
            variants={collapseButtonVariants}
            initial={false}
            animate={isOpen ? "open" : "closed"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSidebar}
            className="p-2 rounded-lg backdrop-blur-sm bg-solar-night/80 border border-solar-border shadow-md hover:shadow-lg hover:bg-solar-yellow/20 hover:text-solar-yellow transition-all duration-300 sun-button"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Columns2 size={20} className="text-solar-muted" />
          </motion.button>
        </div>

        {/* Navigation Menu (Scrollable) */}
        <nav className="p-3 space-y-2 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {menu.map((item) => {
            // Check if current pathname matches or starts with the menu item path for nested routes
            let active = pathname === item.path || pathname.startsWith(item.path + '/');

            return (
              <motion.div
                key={item.path}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={item.path}
                  className={`flex items-center rounded-lg group relative backdrop-blur-sm overflow-hidden transition-all duration-300 ease-in-out ${active ? 'sun-button-active' : 'sun-button'
                    } ${isOpen ? 'gap-3 px-3 py-3' : 'justify-center p-3'
                    } ${active
                      ? 'text-solar-yellow'
                      : 'bg-solar-night/80 shadow-md border border-solar-border text-solar-muted hover:bg-solar-panel/20 hover:text-solar-primary hover:shadow-lg'
                    }`}
                  title={!isOpen ? item.name : ""}
                >
                  {/* Icon with animation */}
                  <motion.span
                    variants={iconVariants}
                    whileHover="hover"
                    whileTap="tap"
                    animate={active ? "active" : ""}
                    className="flex justify-center"
                  >
                    {item.icon}
                  </motion.span>

                  {/* Text with proper width animation */}
                  <motion.span
                    variants={textVariants}
                    initial={false}
                    animate={isOpen ? "open" : "closed"}
                    className={`whitespace-nowrap font-medium overflow-hidden ${active ? 'font-semibold' : ''
                      }`}
                  >
                    {item.name}
                  </motion.span>

                  {/* Active indicator for collapsed state */}
                  {!isOpen && active && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-solar-yellow rounded-full shadow-lg"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Logout Button (Fixed at bottom) */}
        <div className="p-3 border-t border-solar-border shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={`flex items-center w-full rounded-lg group relative backdrop-blur-sm overflow-hidden transition-all duration-300 ease-in-out sun-button ${isOpen ? 'gap-3 px-3 py-3' : 'justify-center p-3'
              } bg-solar-night/80 shadow-md border border-solar-border text-solar-muted hover:bg-red-500/20 hover:text-red-400 hover:shadow-lg`}
            title={!isOpen ? "Logout" : ""}
          >
            <motion.span
              variants={iconVariants}
              whileHover="hover"
              whileTap="tap"
              className="flex justify-center"
            >
              <LogOut size={18} />
            </motion.span>
            <motion.span
              variants={textVariants}
              initial={false}
              animate={isOpen ? "open" : "closed"}
              className="whitespace-nowrap font-medium overflow-hidden"
            >
              Logout
            </motion.span>
          </motion.button>
        </div>

      </motion.aside>
    </>
  );
}

export default Navbar;
