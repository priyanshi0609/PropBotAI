import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-start mb-1">
      <div className="flex max-w-4xl items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-600 text-sm font-medium">P</span>
        </div>

        {/* Loading Content */}
        <div className="bg-gray-100 rounded-2xl px-4 py-3 rounded-bl-md">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-gray-500">Searching properties...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;