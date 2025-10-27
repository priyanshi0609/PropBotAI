import React from 'react';

const PropertyCard = ({ property }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'READY_TO_MOVE':
        return 'bg-green-100 text-green-800';
      case 'UNDER_CONSTRUCTION':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="property-card bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-800 truncate">
            {property.title}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(property.status)}`}>
            {property.status}
          </span>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>📍 {property.locality}</span>
            <span className="font-medium text-blue-600">{property.price}</span>
          </div>
          
          <div className="flex justify-between">
            <span>🏠 {property.bhk}</span>
            <span>📏 {property.carpetArea}</span>
          </div>
          
          <div className="flex justify-between">
            <span>🚻 {property.bathrooms} Bath</span>
            <span>🏢 {property.projectName}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          View Details
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;