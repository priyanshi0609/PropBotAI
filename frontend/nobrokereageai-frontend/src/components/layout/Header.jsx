import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Bot, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';

function Header() {
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null); // 🔹 reference for outside click detection

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const getAuthProvider = () => {
    if (!currentUser) return '';
    const providers = currentUser.providerData || [];
    if (providers.some(provider => provider.providerId === 'google.com')) return 'Google';
    if (providers.some(provider => provider.providerId === 'password')) return 'Email';
    return 'Unknown';
  };

  const getUserInitial = () => {
    return (
      currentUser?.displayName?.[0]?.toUpperCase() ||
      currentUser?.email?.[0]?.toUpperCase() ||
      'U'
    );
  };

  const getUserDisplayName = () => {
    return (
      currentUser?.displayName ||
      currentUser?.email?.split('@')[0] ||
      'User'
    );
  };

  // 🔹 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              NoBrokerage AI
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {/* <ThemeToggle /> */}

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {getUserInitial()}
                  </span>
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getUserDisplayName()}
                  </p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-base font-semibold text-white">
                          {getUserInitial()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {currentUser?.email}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Signed in with {getAuthProvider()}
                      </p>
                    </div>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4">
            <div className="flex items-center space-x-3 mb-4 px-2">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 rounded-full flex items-center justify-center">
                <span className="text-base font-semibold text-white">
                  {getUserInitial()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {currentUser?.email}
                </p>
                <div className="mt-1 inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {getAuthProvider()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1 px-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
