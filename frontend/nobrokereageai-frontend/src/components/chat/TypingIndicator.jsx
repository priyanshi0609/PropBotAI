import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

function TypingIndicator() {
  return (
    <div className="flex space-x-3 px-4 py-2 animate-pulse">
      <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-700 shadow-lg">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      
      <div className="message-bubble-bot rounded-2xl rounded-tl-md px-5 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <div 
              className="typing-dot w-2 h-2 bg-blue-500 rounded-full"
              style={{ animationDelay: '0ms' }}
            ></div>
            <div 
              className="typing-dot w-2 h-2 bg-blue-500 rounded-full"
              style={{ animationDelay: '150ms' }}
            ></div>
            <div 
              className="typing-dot w-2 h-2 bg-blue-500 rounded-full"
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
            <span className="font-medium">Searching properties...</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Analyzing your requirements across thousands of properties
        </p>
      </div>
    </div>
  );
}

export default TypingIndicator;