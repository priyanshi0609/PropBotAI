import React from 'react';
import { Bot, User, CheckCircle, AlertCircle, MapPin, Home, Calendar } from 'lucide-react';
import PropertyCard from './PropertyCard';

function Message({ message }) {
  const isUser = message.type === 'user';
  const isError = message.isError;
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex space-x-4 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 pt-1">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-sm">
            <User className="w-4.5 h-4.5 text-white" strokeWidth={2} />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
            {isError ? (
              <AlertCircle className="w-4.5 h-4.5 text-white" strokeWidth={2} />
            ) : (
              <Bot className="w-4.5 h-4.5 text-white" strokeWidth={2} />
            )}
          </div>
        )}
      </div>
      
      {/* Message Content */}
      <div className={`flex-1 max-w-full ${isUser ? 'flex flex-col items-end' : ''}`}>
        {/* Message Bubble */}
        <div className={`inline-block max-w-full ${
          isUser 
            ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-2xl rounded-tr-md px-4 py-3' 
            : 'text-gray-800 dark:text-gray-200'
        }`}>
          <div className="whitespace-pre-wrap break-words leading-relaxed text-[15px]">
            {message.content}
          </div>
        </div>
        
        {/* Error Indicator */}
        {isError && !isUser && (
          <div className="flex items-center mt-3 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg px-3 py-2.5 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="font-medium">Unable to process request. Please try again.</span>
          </div>
        )}
        
        {/* Results Summary */}
        {message.resultsCount !== undefined && message.resultsCount > 0 && !isUser && (
          <div className="flex items-center mt-3 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2.5 border border-green-200 dark:border-green-800">
            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="font-medium">Found {message.resultsCount} matching {message.resultsCount === 1 ? 'property' : 'properties'}</span>
          </div>
        )}
        
        {/* Filters Used */}
        {message.filtersUsed && Object.keys(message.filtersUsed).length > 0 && !isUser && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.filtersUsed.bhk && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium">
                <Home className="w-3 h-3 mr-1.5" strokeWidth={2} />
                {message.filtersUsed.bhk} BHK
              </span>
            )}
            {message.filtersUsed.city && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                <MapPin className="w-3 h-3 mr-1.5" strokeWidth={2} />
                {message.filtersUsed.city}
              </span>
            )}
            {message.filtersUsed.maxPrice && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-medium">
                <span className="font-semibold">₹{(message.filtersUsed.maxPrice / 100000).toFixed(1)} L</span>
              </span>
            )}
            {message.filtersUsed.status && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-medium">
                <Calendar className="w-3 h-3 mr-1.5" strokeWidth={2} />
                {message.filtersUsed.status.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        )}
        
        {/* Property Cards */}
        {message.properties && message.properties.length > 0 && !isUser && (
          <div className="mt-4 space-y-3 w-full">
            {message.properties.map((property, index) => (
              <PropertyCard key={property.id || index} property={property} />
            ))}
            
            {message.resultsCount > message.properties.length && (
              <div className="text-center py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  ... and {message.resultsCount - message.properties.length} more {message.resultsCount - message.properties.length === 1 ? 'property' : 'properties'} available
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Timestamp */}
        <div className={`text-xs text-gray-400 dark:text-gray-500 mt-2 ${isUser ? 'text-right' : ''}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

export default Message;