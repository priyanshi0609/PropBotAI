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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-3">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 text-sm leading-tight pr-2">
            {property.title}
          </h3>
          <span className={`text-xs px-1.5 py-0.5 rounded border ${getStatusColor(property.status)}`}>
            {property.status.replace(/_/g, ' ')}
          </span>
        </div>
        
        {/* Location */}
        <div className="mb-2">
          <p className="text-xs text-gray-600 flex items-center">
            <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {property.locality}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
          <div>
            <div className="text-gray-500">Type</div>
            <div className="font-medium text-gray-900">{property.bhk}</div>
          </div>
          <div>
            <div className="text-gray-500">Area</div>
            <div className="font-medium text-gray-900">{property.carpetArea}</div>
          </div>
          <div>
            <div className="text-gray-500">Bath</div>
            <div className="font-medium text-gray-900">{property.bathrooms}</div>
          </div>
          <div>
            <div className="text-gray-500">Price</div>
            <div className="font-medium text-green-600">{property.price}</div>
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {property.amenities.slice(0, 2).map((amenity, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-gray-50 text-gray-700 py-1.5 rounded text-xs font-medium border border-gray-200 hover:bg-gray-100 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;