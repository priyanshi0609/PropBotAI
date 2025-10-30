import React from 'react';
import { Bot } from 'lucide-react';

function TypingIndicator() {
  return (
    <div className="flex space-x-3 animate-pulse">
      <div className="flex-shrink-0 w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>
      
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3">
        <div className="flex space-x-1 items-center">
          <div 
            className="typing-dot bg-gray-400"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div 
            className="typing-dot bg-gray-400"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div 
            className="typing-dot bg-gray-400"
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          PropBot AI is searching for properties...
        </p>
      </div>
    </div>
  );
}

export default TypingIndicator;