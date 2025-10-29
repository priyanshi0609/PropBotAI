import React from 'react';

const PropertyCard = ({ property }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'READY_TO_MOVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'UNDER_CONSTRUCTION':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="property-card bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 text-base leading-tight pr-2">
            {property.title}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(property.status)}`}>
            {property.status.replace(/_/g, ' ')}
          </span>
        </div>
        
        {/* Location */}
        <div className="mb-3">
          <p className="text-sm text-gray-600 flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {property.locality}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div className="space-y-1">
            <div className="text-gray-600">Configuration</div>
            <div className="font-medium text-gray-900">{property.bhk}</div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-600">Area</div>
            <div className="font-medium text-gray-900">{property.carpetArea}</div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-600">Bathrooms</div>
            <div className="font-medium text-gray-900">{property.bathrooms}</div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-600">Price</div>
            <div className="font-medium text-blue-600">{property.price}</div>
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Amenities</div>
          <div className="flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-200"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-gray-50 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium border border-gray-200">
          View Property Details
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;