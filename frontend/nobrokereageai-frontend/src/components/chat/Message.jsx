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

  const getMessageStyles = () => {
    if (isUser) {
      return 'bg-blue-500 text-white rounded-2xl rounded-tr-none';
    }
    
    if (isError) {
      return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800 rounded-2xl rounded-tl-none';
    }
    
    return 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-none';
  };

  const getIcon = () => {
    if (isUser) {
      return <User className="w-4 h-4 text-white" />;
    }
    
    if (isError) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    
    return <Bot className="w-4 h-4 text-white" />;
  };

  const getIconBackground = () => {
    if (isUser) {
      return 'bg-blue-500';
    }
    
    if (isError) {
      return 'bg-red-500';
    }
    
    return 'bg-gray-500';
  };

  return (
    <div className={`flex space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getIconBackground()}`}>
        {getIcon()}
      </div>
      
      {/* Message Content */}
      <div className={`flex-1 max-w-4xl ${isUser ? 'text-right' : ''}`}>
        {/* Message Bubble */}
        <div className={`inline-block max-w-full ${getMessageStyles()} px-4 py-3 mb-1`}>
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
          
          {/* Error Indicator */}
          {isError && (
            <div className="flex items-center mt-2 text-sm">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              <span>Please try again</span>
            </div>
          )}
          
          {/* Results Summary */}
          {message.resultsCount !== undefined && (
            <div className="flex items-center mt-2 text-sm opacity-80">
              <CheckCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              <span>Found {message.resultsCount} properties</span>
            </div>
          )}
        </div>
        
        {/* Filters Used */}
        {message.filtersUsed && Object.keys(message.filtersUsed).length > 0 && (
          <div className={`flex flex-wrap gap-2 mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {message.filtersUsed.bhk && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                <Home className="w-3 h-3 mr-1" />
                {message.filtersUsed.bhk} BHK
              </span>
            )}
            {message.filtersUsed.city && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                <MapPin className="w-3 h-3 mr-1" />
                {message.filtersUsed.city}
              </span>
            )}
            {message.filtersUsed.maxPrice && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                ₹{(message.filtersUsed.maxPrice / 100000).toFixed(1)} L
              </span>
            )}
            {message.filtersUsed.status && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                <Calendar className="w-3 h-3 mr-1" />
                {message.filtersUsed.status.replace('_', ' ')}
              </span>
            )}
          </div>
        )}
        
        {/* Property Cards */}
        {message.properties && message.properties.length > 0 && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {message.properties.map((property, index) => (
                <PropertyCard key={property.id || index} property={property} />
              ))}
            </div>
            
            {message.resultsCount > message.properties.length && (
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ... and {message.resultsCount - message.properties.length} more properties
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Timestamp */}
        <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isUser ? 'text-right' : ''}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

export default Message;