const { csvParser } = require('./csvParser');

class SearchEngine {
  constructor() {
    this.csvParser = csvParser;
  }

  search(filters) {
    // If query is not relevant, return empty results
    if (filters.isRelevant === false) {
      return [];
    }

    const allData = this.csvParser.getJoinedData();
    console.log('📊 Total data available:', allData.length);
    console.log('🎯 Applying EXACT filters:', filters);
    
    const results = allData.filter(property => {
      console.log(`\n🔍 Checking property: ${property.project.projectName}`);

      // STRICT City Filtering - ONLY Pune or Mumbai
      if (!this.passesCityFilter(property, filters)) {
        return false;
      }

      // EXACT BHK Matching - CRITICAL
      if (filters.bhk && !this.passesExactBHKFilter(property, filters.bhk)) {
        return false;
      }

      // STRICT Budget Filtering
      if (filters.maxPrice && !this.passesBudgetFilter(property, filters.maxPrice)) {
        return false;
      }

      // Status Filtering
      if (filters.status && !this.passesStatusFilter(property, filters.status)) {
        return false;
      }

      // Property Type Filtering
      if (filters.propertyType && !this.passesPropertyTypeFilter(property, filters.propertyType)) {
        return false;
      }

      console.log(`✅ Property PASSED all filters: ${property.project.projectName}`);
      return true;
    });

    console.log(`\n🎯 FINAL RESULTS: ${results.length} properties found`);
    
    // Log detailed results
    this.logDetailedResults(results);

    return results;
  }

  // EXACT City Filtering
  passesCityFilter(property, filters) {
    if (!property.address || !property.address.fullAddress) {
      console.log(`❌ No address data`);
      return false;
    }

    const address = property.address.fullAddress.toLowerCase();
    const hasPune = address.includes('pune');
    const hasMumbai = address.includes('mumbai');

    let cityMatch = false;

    if (filters.city === 'pune') {
      cityMatch = hasPune && !hasMumbai;
    } else if (filters.city === 'mumbai') {
      cityMatch = hasMumbai && !hasPune;
    } else if (filters.city === 'both') {
      cityMatch = hasPune || hasMumbai;
    } else {
      // No city filter - only show Pune/Mumbai properties
      cityMatch = hasPune || hasMumbai;
    }

    if (!cityMatch) {
      console.log(`❌ City filter failed: ${property.address.fullAddress}`);
    } else {
      console.log(`✅ City filter passed: ${property.address.fullAddress}`);
    }

    return cityMatch;
  }

  // EXACT BHK Matching - IMPROVED
  passesExactBHKFilter(property, targetBHK) {
    const hasExactBHK = property.configurations.some(config => {
      const type = (config.type || '').toLowerCase().replace(/\s+/g, '');
      const customBHK = (config.customBHK || '').toLowerCase().replace(/\s+/g, '');
      
      console.log(`   Checking BHK: Type="${type}", Custom="${customBHK}", Target="${targetBHK}bhk"`);
      
      // EXACT matching patterns for the specific BHK
      const exactMatches = this.generateExactBHKPatterns(targetBHK);
      
      // Check for exact match in both type and customBHK
      const typeMatch = exactMatches.some(pattern => 
        type === pattern.replace(/\s+/g, '')
      );
      
      const customMatch = exactMatches.some(pattern => 
        customBHK === pattern.replace(/\s+/g, '')
      );

      // Additional check for semantic matches in customBHK
      const semanticMatch = this.checkSemanticBHKMatch(customBHK, targetBHK);

      return typeMatch || customMatch || semanticMatch;
    });
    
    if (!hasExactBHK) {
      console.log(`❌ No EXACT BHK match found for ${targetBHK}BHK`);
    } else {
      console.log(`✅ EXACT BHK match found for ${targetBHK}BHK`);
    }
    
    return hasExactBHK;
  }

  // Generate exact BHK patterns for a specific number
  generateExactBHKPatterns(bhkNumber) {
    return [
      `${bhkNumber}bhk`,
      `${bhkNumber} bhk`,
      `bhk${bhkNumber}`,
      `${bhkNumber}bedroom`,
      `${bhkNumber} bedroom`,
      `${bhkNumber}bed`,
      `${bhkNumber} bed`,
      `${bhkNumber}room`,
      `${bhkNumber} room`,
      `${bhkNumber}rk`,
      `${bhkNumber} rk`,
      `${bhkNumber}b/h/k`,
      `${bhkNumber} b/h/k`
    ];
  }

  // Semantic BHK matching for edge cases
  checkSemanticBHKMatch(customBHK, targetBHK) {
    const semanticPatterns = {
      '1': [/1bhk/i, /1 bhk/i, /onebhk/i, /single room/i, /1rk/i, /1 rk/i],
      '2': [/2bhk/i, /2 bhk/i, /twobhk/i, /double room/i, /2rk/i, /2 rk/i],
      '3': [/3bhk/i, /3 bhk/i, /threebhk/i, /triple room/i, /3rk/i, /3 rk/i]
    };

    const patterns = semanticPatterns[targetBHK] || [];
    return patterns.some(pattern => pattern.test(customBHK));
  }

  // Budget Filtering
  passesBudgetFilter(property, maxPrice) {
    const hasAffordableVariant = property.variants.some(variant => {
      const price = parseFloat(variant.price) || 0;
      const isAffordable = price > 0 && price <= maxPrice;
      
      if (isAffordable) {
        console.log(`✅ Price match: ₹${price} <= ₹${maxPrice}`);
      } else {
        console.log(`❌ Price exceeds: ₹${price} > ₹${maxPrice}`);
      }
      
      return isAffordable;
    });
    
    if (!hasAffordableVariant) {
      console.log(`❌ No affordable variants found under ₹${maxPrice}`);
    }
    
    return hasAffordableVariant;
  }

  // Status Filtering
  passesStatusFilter(property, status) {
    const statusMatch = property.project.status === status;
    
    if (!statusMatch) {
      console.log(`❌ Status filter failed: ${property.project.status} != ${status}`);
    } else {
      console.log(`✅ Status filter passed: ${property.project.status}`);
    }
    
    return statusMatch;
  }

  // Property Type Filtering
  passesPropertyTypeFilter(property, propertyType) {
    const typeMatch = property.project.projectType === propertyType;
    
    if (!typeMatch) {
      console.log(`❌ Property type filter failed: ${property.project.projectType} != ${propertyType}`);
    } else {
      console.log(`✅ Property type filter passed: ${property.project.projectType}`);
    }
    
    return typeMatch;
  }

  // Log detailed results
  logDetailedResults(results) {
    if (results.length > 0) {
      console.log('\n📋 MATCHING PROPERTIES:');
      results.forEach((result, index) => {
        const config = result.configurations[0];
        const variant = result.variants[0];
        const price = variant?.price ? `₹${(parseFloat(variant.price) / 100000).toFixed(0)}L` : 'N/A';
        console.log(`  ${index + 1}. ${result.project.projectName} | ${config.type} | ${price} | ${result.project.status}`);
      });
    } else {
      console.log('\n❌ NO PROPERTIES FOUND matching the exact criteria');
    }
  }

  generateSummary(results, filters) {
    // Handle irrelevant queries
    if (filters.isRelevant === false) {
      if (filters.unsupportedCity) {
        return "I specialize only in properties in Pune and Mumbai. I cannot help with properties in other cities. Please search for properties in Pune or Mumbai.";
      }
      return "I specialize in property search for Pune and Mumbai. Try asking about flats, BHK requirements, or budget constraints!";
    }

    if (results.length === 0) {
      const city = filters.city && filters.city !== 'both' ? 
        `in ${filters.city.charAt(0).toUpperCase() + filters.city.slice(1)}` : 'in Pune or Mumbai';
      const bhk = filters.bhk ? `${filters.bhk} BHK ` : '';
      const price = filters.maxPrice ? 
        `under ₹${filters.maxPrice >= 10000000 ? (filters.maxPrice / 10000000).toFixed(1) + ' Cr' : (filters.maxPrice / 100000).toFixed(0) + ' Lakh'}` : '';
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

    const city = filters.city && filters.city !== 'both' ? 
      `in ${filters.city.charAt(0).toUpperCase() + filters.city.slice(1)}` : 'in Pune and Mumbai';
    const bhk = filters.bhk ? `${filters.bhk} BHK ` : '';
    const price = filters.maxPrice ? 
      `under ₹${filters.maxPrice >= 10000000 ? (filters.maxPrice / 10000000).toFixed(1) + ' Cr' : (filters.maxPrice / 100000).toFixed(0) + ' Lakh'}` : 'across various budgets';
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
      
      // Format price properly
      let priceFormatted = 'Price on request';
      if (variant?.price) {
        const priceNum = parseFloat(variant.price);
        if (priceNum >= 10000000) {
          priceFormatted = `₹${(priceNum / 10000000).toFixed(2)} Cr`;
        } else {
          priceFormatted = `₹${(priceNum / 100000).toFixed(0)} L`;
        }
      }

      // Extract amenities
      const amenities = this.extractAmenities(variant);

      return {
        id: property.project.id,
        title: property.project.projectName || 'Property',
        city: property.address ? this.extractCity(property.address.fullAddress) : 'Unknown',
        locality: property.address?.landmark || this.extractLocality(property.address?.fullAddress) || 'Various locations',
        bhk: config?.type || config?.customBHK || 'N/A',
        price: priceFormatted,
        projectName: property.project.projectName,
        status: property.project.status === 'READY_TO_MOVE' ? 'Ready' : 
                property.project.status === 'UNDER_CONSTRUCTION' ? 'Under Construction' : 'Unknown',
        amenities: amenities.slice(0, 3),
        ctaUrl: `/project/${property.project.slug || property.project.id}`,
        carpetArea: variant?.carpetArea ? `${variant.carpetArea} sq.ft` : 'N/A',
        bathrooms: variant?.bathrooms || 'N/A'
      };
    });
  }

  extractAmenities(variant) {
    const amenities = [];
    if (variant?.lift === 'true') amenities.push('Lift');
    if (variant?.balcony && parseInt(variant.balcony) > 0) amenities.push('Balcony');
    if (variant?.furnishedType && variant.furnishedType !== 'UNFURNISHED') {
      amenities.push(variant.furnishedType.charAt(0) + variant.furnishedType.slice(1).toLowerCase());
    }
    if (variant?.parkingType) amenities.push('Parking');
    if (amenities.length === 0) {
      amenities.push('Parking', 'Security');
    }
    return amenities;
  }

  extractCity(fullAddress) {
    if (!fullAddress) return 'Unknown';
    const address = fullAddress.toLowerCase();
    if (address.includes('pune')) return 'Pune';
    if (address.includes('mumbai')) return 'Mumbai';
    return 'Unknown';
  }

  extractLocality(fullAddress) {
    if (!fullAddress) return 'Various locations';
    const parts = fullAddress.split(',');
    return parts.length > 1 ? parts[1].trim() : parts[0].trim();
  }
}

const searchEngine = new SearchEngine();

module.exports = { SearchEngine, searchEngine };