class SearchEngine {
  constructor(csvParser) {
    this.csvParser = csvParser;
  }

  search(filters) {
    // If query is not relevant, return empty results
    if (filters.isRelevant === false) {
      return [];
    }

    const allData = this.csvParser.getJoinedData();
    console.log('Total data available:', allData.length);
    console.log('Applying filters:', filters);
    
    const results = allData.filter(property => {
      // Filter by city - STRICT requirement
      if (filters.city && filters.city !== 'both') {
        if (!property.address || !property.address.fullAddress) {
          return false;
        }
        const address = property.address.fullAddress.toLowerCase();
        if (!address.includes(filters.city.toLowerCase())) {
          return false;
        }
      } else if (!filters.city) {
        // If no city specified, only show properties from Pune/Mumbai
        if (!property.address || !property.address.fullAddress) {
          return false;
        }
        const address = property.address.fullAddress.toLowerCase();
        if (!address.includes('pune') && !address.includes('mumbai')) {
          return false;
        }
      }

      // Filter by BHK - EXACT matching
      if (filters.bhk) {
        const hasMatchingBHK = property.configurations.some(config => {
          const type = (config.type || '').toLowerCase();
          const customBHK = (config.customBHK || '').toLowerCase();
          const targetBHK = filters.bhk.toLowerCase();
          
          // Exact BHK matching patterns
          const exactPatterns = [
            `${targetBHK}bhk`,
            `${targetBHK} bhk`,
            `bhk ${targetBHK}`,
            `${targetBHK} bedroom`,
            `${targetBHK} bed`
          ];

          return exactPatterns.some(pattern => 
            type.includes(pattern) || customBHK.includes(pattern)
          ) || 
          // Handle cases like "2BHK" in customBHK field
          customBHK === `${targetBHK}bhk` ||
          customBHK === `${targetBHK} bhk` ||
          // Handle numeric matching in type field
          type === `${targetBHK}bhk` ||
          type === `${targetBHK} bhk`;
        });
        
        if (!hasMatchingBHK) {
          console.log(`No matching BHK found for ${filters.bhk}`);
          return false;
        }
      }

      // Filter by price
      if (filters.maxPrice) {
        const hasAffordableVariant = property.variants.some(variant => {
          const price = parseFloat(variant.price) || 0;
          return price > 0 && price <= filters.maxPrice;
        });
        if (!hasAffordableVariant) return false;
      }

      // Filter by status
      if (filters.status && property.project.status !== filters.status) {
        return false;
      }

      // Filter by property type
      if (filters.propertyType && property.project.projectType !== filters.propertyType) {
        return false;
      }

      return true;
    });

    console.log('Filtered results:', results.length);
    return results;
  }

  generateSummary(results, filters) {
    // Handle irrelevant queries
    if (filters.isRelevant === false) {
      return "I specialize in property search for Pune and Mumbai. Try asking about flats, BHK requirements, or budget constraints!";
    }

    if (results.length === 0) {
      const city = filters.city && filters.city !== 'both' ? `in ${filters.city.charAt(0).toUpperCase() + filters.city.slice(1)}` : 'in Pune or Mumbai';
      const bhk = filters.bhk ? `${filters.bhk} BHK ` : '';
      const price = filters.maxPrice ? `under ₹${(filters.maxPrice / 10000000).toFixed(1)} Cr` : '';
      const status = filters.status ? `that are ${filters.status.replace(/_/g, ' ').toLowerCase()}` : '';
      
      let message = `No ${bhk}properties found ${city} ${price} ${status}.`;
      
      // Suggest alternatives
      if (filters.city && filters.maxPrice) {
        message += " Try increasing your budget or checking different locations.";
      } else if (filters.bhk && filters.maxPrice) {
        message += " Consider looking for smaller units or different areas.";
      } else {
        message += " Try adjusting your filters or search criteria.";
      }
      
      return message;
    }

    const city = filters.city && filters.city !== 'both' ? `in ${filters.city.charAt(0).toUpperCase() + filters.city.slice(1)}` : 'in Pune and Mumbai';
    const bhk = filters.bhk ? `${filters.bhk} BHK ` : '';
    const price = filters.maxPrice ? `under ₹${(filters.maxPrice / 10000000).toFixed(1)} Cr` : 'across various budgets';
    const status = filters.status ? `that are ${filters.status.replace(/_/g, ' ').toLowerCase()}` : '';
    
    const readyCount = results.filter(r => r.project.status === 'READY_TO_MOVE').length;
    const underConstructionCount = results.filter(r => r.project.status === 'UNDER_CONSTRUCTION').length;
    
    const localities = [...new Set(results.map(r => 
      r.address ? (r.address.landmark || this.extractLocality(r.address.fullAddress) || 'Various locations') : 'Various locations'
    ))].slice(0, 3);

    let summary = `Found ${results.length} ${bhk}properties ${city} ${price} ${status}. `;
    
    if (readyCount > 0 && underConstructionCount > 0) {
      summary += `${readyCount} are ready to move and ${underConstructionCount} are under construction. `;
    } else if (readyCount > 0) {
      summary += `All ${readyCount} properties are ready to move. `;
    } else if (underConstructionCount > 0) {
      summary += `All ${underConstructionCount} properties are under construction. `;
    }

    if (localities.length > 0) {
      summary += `Popular areas include ${localities.join(', ')}.`;
    }

    return summary;
  }

  formatPropertyCards(results) {
    if (results.length === 0) {
      return [];
    }

    return results.slice(0, 10).map(property => {
      const variant = property.variants[0];
      const config = property.configurations[0];
      
      const price = variant?.price ? 
        `₹${(parseFloat(variant.price) / 10000000).toFixed(2)} Cr` : 'Price on request';
      
      // Extract amenities from variant data
      const amenities = [];
      if (variant?.lift === 'true') amenities.push('Lift');
      if (variant?.balcony && parseInt(variant.balcony) > 0) amenities.push('Balcony');
      if (variant?.furnishedType && variant.furnishedType !== 'UNFURNISHED') {
        amenities.push(variant.furnishedType.toLowerCase());
      }
      if (amenities.length === 0) {
        amenities.push('Parking', 'Security');
      }

      return {
        id: property.project.id,
        title: property.project.projectName || 'Property',
        city: property.address ? this.extractCity(property.address.fullAddress) : 'Unknown',
        locality: property.address?.landmark || this.extractLocality(property.address?.fullAddress) || 'Various locations',
        bhk: config?.type || config?.customBHK || 'N/A',
        price: price,
        projectName: property.project.projectName,
        status: property.project.status?.replace(/_/g, ' ') || 'Unknown',
        amenities: amenities.slice(0, 3),
        slug: property.project.slug || property.project.id,
        carpetArea: variant?.carpetArea ? `${variant.carpetArea} sq.ft` : 'N/A',
        bathrooms: variant?.bathrooms || 'N/A'
      };
    });
  }

  extractCity(fullAddress) {
    if (!fullAddress) return 'Unknown';
    const address = fullAddress.toLowerCase();
    if (address.includes('pune')) return 'Pune';
    if (address.includes('mumbai')) return 'Mumbai';
    return fullAddress.split(',').pop()?.trim() || 'Unknown';
  }

  extractLocality(fullAddress) {
    if (!fullAddress) return 'Various locations';
    const parts = fullAddress.split(',');
    return parts.length > 1 ? parts[1].trim() : parts[0].trim();
  }
}

const searchEngine = new SearchEngine(require('./csvParser').csvParser);

module.exports = { SearchEngine, searchEngine };