import React from 'react';
import { MapPin, Home, Bath, Square, Calendar, Star, ExternalLink } from 'lucide-react';

function PropertyCard({ property }) {
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    
    if (statusLower === 'ready' || statusLower === 'ready to move') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    }
    
    if (statusLower.includes('construction')) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    }
    
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const formatPrice = (price) => {
    if (!price) return 'Price not available';
    
    // If price is already formatted, return as is
    if (typeof price === 'string' && (price.includes('₹') || price.includes('L') || price.includes('Cr'))) {
      return price;
    }
    
    // If price is a number, format it
    const priceNum = typeof price === 'string' ? parseFloat(price) : price;
    if (priceNum >= 10000000) {
      return `₹${(priceNum / 10000000).toFixed(2)} Cr`;
    } else {
      return `₹${(priceNum / 100000).toFixed(1)} L`;
    }
  };

  const handleViewDetails = () => {
    if (property.ctaUrl) {
      window.open(property.ctaUrl, '_blank');
    }
  };

  return (
    <div className="property-card group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {property.title || property.projectName || 'Property'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {property.projectName && property.projectName !== property.title ? property.projectName : ''}
          </p>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(property.price)}
          </div>
          {property.rating && (
            <div className="flex items-center justify-end text-sm text-yellow-600 dark:text-yellow-400 mt-1">
              <Star className="w-3 h-3 fill-current mr-1" />
              {property.rating}
            </div>
          )}
        </div>
      </div>
      
      {/* Location */}
      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
        <span className="truncate">
          {property.locality && `${property.locality}, `}{property.city}
        </span>
      </div>
      
      {/* Property Details */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Home className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">{property.bhk || 'N/A'}</span>
        </div>
        
        {property.bathrooms && (
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Bath className="w-4 h-4 mr-1 flex-shrink-0" />
            <span>{property.bathrooms} Bath</span>
          </div>
        )}
        
        {property.carpetArea && (
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Square className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{property.carpetArea}</span>
          </div>
        )}
      </div>
      
      {/* Status */}
      {property.status && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
            Status:
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
            {property.status}
          </span>
        </div>
      )}
      
      {/* Amenities */}
      {property.amenities && property.amenities.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Top Amenities:</p>
          <div className="flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Additional Features */}
      {property.features && property.features.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Features:</p>
          <div className="flex flex-wrap gap-1">
            {property.features.slice(0, 2).map((feature, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* CTA Button */}
      <button 
        onClick={handleViewDetails}
        disabled={!property.ctaUrl}
        className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-all duration-200 group/btn"
      >
        <span>View Details</span>
        <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}

export default PropertyCard;