import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-start">
      <div className="flex max-w-[85%] items-start space-x-3">
        {/* Avatar */}
        <div className="shrink-0 w-6 h-6 rounded-sm bg-gray-300 flex items-center justify-center">
          <span className="text-gray-600 text-xs font-medium">P</span>
        </div>

        {/* Loading Content */}
        <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-gray-500">Searching properties...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;