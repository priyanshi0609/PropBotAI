import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {/* Animated background */}
      <div className={`absolute inset-0 rounded-lg bg-blue-500 transition-all duration-300 transform ${
        isDark ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
      }`} />
      
      {/* Icons container */}
      <div className="relative flex items-center">
        {/* Sun icon */}
        <Sun className={`w-4 h-4 transition-all duration-300 ${
          isDark 
            ? 'transform scale-50 opacity-0 -rotate-90' 
            : 'transform scale-100 opacity-100 rotate-0'
        }`} />
        
        {/* Moon icon */}
        <Moon className={`absolute w-4 h-4 transition-all duration-300 ${
          isDark 
            ? 'transform scale-100 opacity-100 rotate-0' 
            : 'transform scale-50 opacity-0 rotate-90'
        }`} />
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 hidden group-hover:flex items-center justify-center w-full">
        <div className="relative">
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Switch to {isDark ? 'light' : 'dark'} theme
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
      </div>
    </button>
  );
}

export default ThemeToggle;