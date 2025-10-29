import React from 'react';

const Message = ({ text, isUser, timestamp }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
        {/* Avatar */}
        <div className={`shrink-0 w-6 h-6 rounded-sm flex items-center justify-center ${
          isUser 
            ? 'bg-green-500' 
            : 'bg-gray-300'
        }`}>
          {isUser ? (
            <span className="text-white text-xs font-medium">U</span>
          ) : (
            <span className="text-gray-600 text-xs font-medium">P</span>
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`rounded-lg px-3 py-2 ${
              isUser
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-900 border border-gray-200'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
          </div>
          
          {/* Timestamp */}
          <div className={`mt-1 text-xs ${isUser ? 'text-gray-500' : 'text-gray-400'} opacity-0 group-hover:opacity-100 transition-opacity`}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;