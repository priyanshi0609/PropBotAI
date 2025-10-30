import React from 'react';
import { MapPin, Home, Bath, Maximize2, Calendar, Star, ExternalLink, Heart, Share2, Sparkles } from 'lucide-react';

function PropertyCard({ property }) {
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    
    if (statusLower === 'ready' || statusLower === 'ready to move') {
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    }
    
    if (statusLower.includes('construction')) {
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    }
    
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  };

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    
    if (typeof price === 'string' && (price.includes('₹') || price.includes('L') || price.includes('Cr'))) {
      return price;
    }
    
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

  const handleLike = (e) => {
    e.stopPropagation();
    console.log('Liked property:', property.id);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    console.log('Share property:', property.id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight line-clamp-1 mb-1">
              {property.title || property.projectName || 'Premium Property'}
            </h3>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
              <span className="truncate">
                {property.locality && `${property.locality}, `}{property.city}
              </span>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleLike}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Like"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Price & Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPrice(property.price)}
          </div>
          {property.rating && (
            <div className="flex items-center text-sm font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-current mr-1" />
              {property.rating}
            </div>
          )}
        </div>
        
        {/* Property Details */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex flex-col items-center p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Home className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
            <span className="font-semibold text-gray-900 dark:text-white text-sm">{property.bhk || 'N/A'}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">BHK</span>
          </div>
          
          {property.bathrooms && (
            <div className="flex flex-col items-center p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Bath className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
              <span className="font-semibold text-gray-900 dark:text-white text-sm">{property.bathrooms}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Bath</span>
            </div>
          )}
          
          {property.carpetArea && (
            <div className="flex flex-col items-center p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Maximize2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
              <span className="font-semibold text-gray-900 dark:text-white text-[11px] leading-tight">{property.carpetArea}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Area</span>
            </div>
          )}
        </div>
        
        {/* Status */}
        {property.status && (
          <div className="flex items-center justify-between mb-4 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Status</span>
            </div>
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusColor(property.status)}`}>
              {property.status}
            </span>
          </div>
        )}
        
        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
              Amenities
            </div>
            <div className="flex flex-wrap gap-1.5">
              {property.amenities.slice(0, 4).map((amenity, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md text-xs">
                  +{property.amenities.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* CTA Button */}
        <button 
          onClick={handleViewDetails}
          disabled={!property.ctaUrl}
          className="w-full flex items-center justify-center space-x-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white dark:text-gray-900 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 text-sm"
        >
          <span>View Details</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default PropertyCard;