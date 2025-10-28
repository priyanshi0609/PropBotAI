export class SearchEngine {
  constructor(csvParser) {
    this.csvParser = csvParser;
  }

  search(filters) {
    const allData = this.csvParser.getJoinedData();
    
    return allData.filter(property => {
      // Filter by city
      if (filters.city && property.address) {
        const address = property.address.fullAddress || '';
        if (!address.toLowerCase().includes(filters.city.toLowerCase())) {
          return false;
        }
      }

      // Filter by BHK
      if (filters.bhk) {
        const hasMatchingBHK = property.configurations.some(config => {
          const type = config.type || config.customBHK || '';
          return type.includes(filters.bhk) || config.customBHK === filters.bhk + 'BHK';
        });
        if (!hasMatchingBHK) return false;
      }

      // Filter by price
      if (filters.maxPrice) {
        const hasAffordableVariant = property.variants.some(variant => {
          const price = parseFloat(variant.price) || 0;
          return price <= filters.maxPrice;
        });
        if (!hasAffordableVariant) return false;
      }

      // Filter by status
      if (filters.status && property.project.status !== filters.status) {
        return false;
      }

      return true;
    });
  }

  generateSummary(results, filters) {
    if (results.length === 0) {
      const city = filters.city ? `in ${filters.city.charAt(0).toUpperCase() + filters.city.slice(1)}` : '';
      const bhk = filters.bhk ? `${filters.bhk} BHK ` : '';
      const price = filters.maxPrice ? `under ₹${(filters.maxPrice / 10000000).toFixed(1)} Cr` : '';
      
      return `No ${bhk}properties found ${city} ${price}. Try adjusting your filters.`;
    }

    const city = filters.city ? `in ${filters.city.charAt(0).toUpperCase() + filters.city.slice(1)}` : 'across cities';
    const bhk = filters.bhk ? `${filters.bhk} BHK ` : '';
    const price = filters.maxPrice ? `under ₹${(filters.maxPrice / 10000000).toFixed(1)} Cr` : 'across various budgets';
    
    const readyCount = results.filter(r => r.project.status === 'READY_TO_MOVE').length;
    const underConstructionCount = results.filter(r => r.project.status === 'UNDER_CONSTRUCTION').length;
    
    const localities = [...new Set(results.map(r => 
      r.address ? (r.address.landmark || 'Various locations') : 'Various locations'
    ))].slice(0, 3);

    return `Found ${results.length} ${bhk}properties ${city} ${price}. ${readyCount} are ready to move and ${underConstructionCount} are under construction. Top locations include ${localities.join(', ')}.`;
  }

  formatPropertyCards(results) {
    return results.slice(0, 10).map(property => {
      const variant = property.variants[0]; // Take first variant for display
      const config = property.configurations[0];
      
      return {
        id: property.project.id,
        title: property.project.projectName || 'Property',
        city: property.address ? (property.address.fullAddress?.split(',').pop()?.trim() || 'Unknown') : 'Unknown',
        locality: property.address?.landmark || 'Various locations',
        bhk: config?.type || config?.customBHK || 'N/A',
        price: variant?.price ? `₹${(variant.price / 10000000).toFixed(2)} Cr` : 'Price on request',
        projectName: property.project.projectName,
        status: property.project.status?.replace(/_/g, ' ') || 'Unknown',
        amenities: ['Parking', 'Lift', 'Security'], // Default amenities
        slug: property.project.slug || property.project.id,
        carpetArea: variant?.carpetArea ? `${variant.carpetArea} sq.ft` : 'N/A',
        bathrooms: variant?.bathrooms || 'N/A'
      };
    });
  }
}

export const searchEngine = new SearchEngine();