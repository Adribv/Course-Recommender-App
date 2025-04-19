import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Menu, X, Compass, User, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/signin');
    setIsOpen(false);
  };

  // Only show navbar if user is logged in
  if (!currentUser && !['/signin', '/signup', '/'].includes(location.pathname)) {
    return null;
  }

  const navLinkClass = ({ isActive }) =>
    `group relative px-3 py-2 flex !text-decoration-none !no-underline items-center text-sm font-medium transition-colors ${
      isActive
        ? 'text-violet-400'
        : 'text-gray-300 hover:text-white'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center text-decoration-none no-underline gap-2 py-3 px-4 text-sm font-medium transition-colors ${
      isActive
        ? 'text-violet-400'
        : 'text-gray-300 hover:text-white'
    }`;

  const underlineAnimation = {
    initial: { width: 0 },
    animate: { width: '100%' },
    exit: { width: 0 },
    transition: { duration: 0.2 }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
      className={`${
        scrolled
          ? 'bg-gray-900/95 backdrop-blur-md shadow-lg'
          : 'bg-gray-900'
      } fixed w-full z-50 transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <motion.div 
            className="flex-shrink-0 flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span onClick={() => navigate(currentUser ? '/dashboard' : '/')} className="cursor-pointer">
              <motion.span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-blue-500 text-transparent bg-clip-text">
                CourseCompass
              </motion.span>
            </span>
          </motion.div>

          {/* Desktop Nav Links */}
          {currentUser && (
            <div className="hidden md:block ">
              <div className="ml-10 flex items-center space-x-4 ">
                <NavLink to="/dashboard" className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-1.5">
                        <Home size={18} />
                        <span className=''>Dashboard</span>
                      </span>
                      {isActive && (
                        <motion.span
                          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-400 to-blue-500"
                          {...underlineAnimation}
                        />
                      )}
                    </>
                  )}
                </NavLink>

                <NavLink to="/recommended-courses" className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-1.5">
                        <Compass size={18} />
                        <span>Courses</span>
                      </span>
                      {isActive && (
                        <motion.span
                          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-400 to-blue-500"
                          {...underlineAnimation}
                        />
                      )}
                    </>
                  )}
                </NavLink>

                <NavLink to="/profile-setup" className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-1.5">
                        <User size={18} />
                        <span>Profile</span>
                      </span>
                      {isActive && (
                        <motion.span
                          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-400 to-blue-500"
                          {...underlineAnimation}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </div>
            </div>
          )}

          {/* User Section */}
          <div className="hidden md:block">
            {currentUser ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-md hover:from-red-600 hover:to-pink-700 transition-all"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </motion.button>
            ) : (
              !['/signin', '/signup'].includes(location.pathname) && (
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/signin')}
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Sign In
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/signup')}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-blue-600 rounded-md hover:from-violet-600 hover:to-blue-700 transition-colors"
                  >
                    Sign Up
                  </motion.button>
                </div>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="mr-2 flex md:hidden">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-gray-900/95 backdrop-blur-md"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-800">
            {currentUser ? (
              <>
                <NavLink 
                  to="/dashboard" 
                  className={mobileNavLinkClass}
                  onClick={() => setIsOpen(false)}
                >
                  <Home size={18} />
                  Dashboard
                </NavLink>
                <NavLink 
                  to="/recommended-courses" 
                  className={mobileNavLinkClass}
                  onClick={() => setIsOpen(false)}
                >
                  <Compass size={18} />
                  Recommended Courses
                </NavLink>
                <NavLink 
                  to="/profile-setup" 
                  className={mobileNavLinkClass}
                  onClick={() => setIsOpen(false)}
                >
                  <User size={18} />
                  Profile
                </NavLink>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 py-3 px-4 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <NavLink 
                  to="/signin" 
                  className={mobileNavLinkClass}
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </NavLink>
                <NavLink 
                  to="/signup" 
                  className={mobileNavLinkClass}
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;