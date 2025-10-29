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
    
    let results = [];
    
    // Handle BHK ranges
    if (filters.shouldExpandBHKSearch && filters.bhkRange) {
      results = this.searchWithBHKRange(allData, filters);
    } else {
      results = allData.filter(property => this.passesAllFilters(property, filters));
    }

    // Handle no results with smart fallbacks
    if (results.length === 0) {
      results = this.handleNoResults(allData, filters);
    }

    // Remove duplicates and handle too many results
    results = this.postProcessResults(results, filters);

    console.log(`\n🎯 FINAL RESULTS: ${results.length} properties found`);
    this.logDetailedResults(results, filters);

    return results;
  }

  // Handle BHK range searches
  searchWithBHKRange(allData, filters) {
    const bhksToSearch = this.getBHKsToSearch(filters);
    const allResults = [];

    bhksToSearch.forEach(bhk => {
      const singleBHKFilters = { ...filters, bhk };
      const singleResults = allData.filter(property => 
        this.passesAllFilters(property, singleBHKFilters)
      );
      allResults.push(...singleResults);
    });

    return this.removeDuplicates(allResults);
  }

  // Get all BHKs to search for
  getBHKsToSearch(filters) {
    if (filters.bhkRange && filters.bhkRange.isRange) {
      return filters.bhkRange.values;
    }
    return filters.bhk ? [filters.bhk] : [];
  }

  // Main filter checking
  passesAllFilters(property, filters) {
    return this.passesCityFilter(property, filters) &&
           this.passesExactBHKFilter(property, filters.bhk) &&
           this.passesBudgetFilter(property, filters.maxPrice) &&
           this.passesStatusFilter(property, filters.status) &&
           this.passesPropertyTypeFilter(property, filters.propertyType);
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
      cityMatch = hasPune || hasMumbai;
    }

    if (!cityMatch) {
      console.log(`❌ City filter failed: ${property.address.fullAddress}`);
    }

    return cityMatch;
  }

  // ENHANCED BHK matching for all supported types
  passesExactBHKFilter(property, targetBHK) {
    if (!targetBHK) return true; // No BHK filter
    
    if (!property.configurations || property.configurations.length === 0) {
      console.log(`❌ No configuration data found`);
      return false;
    }

    const primaryConfig = property.configurations[0];
    const type = (primaryConfig.type || '').toLowerCase().trim();
    const customBHK = (primaryConfig.customBHK || '').toLowerCase().trim();
    
    console.log(`   Primary BHK: Type="${type}", Custom="${customBHK}", Target="${targetBHK}"`);
    
    const matches = this.doesBHKMatch(type, customBHK, targetBHK);
    
    if (!matches) {
      console.log(`❌ BHK doesn't match: ${type}/${customBHK} != ${targetBHK}`);
    } else {
      console.log(`✅ BHK matches: ${type}/${customBHK} == ${targetBHK}`);
    }
    
    return matches;
  }

  // Enhanced BHK matching logic
  doesBHKMatch(type, customBHK, targetBHK) {
    // Handle 1RK
    if (targetBHK === '1RK') {
      return type.includes('1rk') || customBHK.includes('1rk') || 
             type.includes('rk') || customBHK.includes('rk');
    }

    // Handle 4.5BHK
    if (targetBHK === '4.5') {
      return type.includes('4.5') || customBHK.includes('4.5');
    }

    // Standard BHK matching
    const patterns = {
      '1': ['1bhk', '1 bhk', '1bedroom', '1 bedroom'],
      '2': ['2bhk', '2 bhk', '2bedroom', '2 bedroom'],
      '3': ['3bhk', '3 bhk', '3bedroom', '3 bedroom'],
      '4': ['4bhk', '4 bhk', '4bedroom', '4 bedroom'],
      '5': ['5bhk', '5 bhk', '5bedroom', '5 bedroom']
    };

    const targetPatterns = patterns[targetBHK] || [`${targetBHK}bhk`];
    
    return targetPatterns.some(pattern => 
      type.includes(pattern) || customBHK.includes(pattern)
    );
  }

  // Budget Filtering
  passesBudgetFilter(property, maxPrice) {
    if (!maxPrice) return true; // No budget filter
    
    if (!property.variants || property.variants.length === 0) {
      console.log(`❌ No variants found for price check`);
      return false;
    }

    const hasAffordableVariant = property.variants.some(variant => {
      const price = this.parsePrice(variant.price);
      const isAffordable = price > 0 && price <= maxPrice;
      
      if (isAffordable) {
        console.log(`✅ Price match: ₹${this.formatPrice(price)} <= ₹${this.formatPrice(maxPrice)}`);
      }
      
      return isAffordable;
    });
    
    if (!hasAffordableVariant) {
      console.log(`❌ No affordable variants found under ₹${this.formatPrice(maxPrice)}`);
    }
    
    return hasAffordableVariant;
  }

  // Parse price to number
  parsePrice(priceString) {
    if (!priceString) return 0;
    
    const price = priceString.toString().trim();
    
    if (price.includes('Cr') || price.includes('cr') || price.includes('CR')) {
      const croreMatch = price.match(/(\d+(?:\.\d+)?)\s*Cr?/i);
      if (croreMatch) {
        return Math.floor(parseFloat(croreMatch[1]) * 10000000);
      }
    }
    
    if (price.includes('L') || price.includes('l') || price.includes('Lac') || price.includes('lac')) {
      const lakhMatch = price.match(/(\d+(?:\.\d+)?)\s*L?/i);
      if (lakhMatch) {
        return Math.floor(parseFloat(lakhMatch[1]) * 100000);
      }
    }
    
    const numberMatch = price.match(/(\d+(?:\.\d+)?)/);
    if (numberMatch) {
      return Math.floor(parseFloat(numberMatch[1]));
    }
    
    return 0;
  }

  // Format price for display
  formatPrice(price) {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `${(price / 100000).toFixed(0)} L`;
    } else {
      return `${price}`;
    }
  }

  // Status Filtering
  passesStatusFilter(property, status) {
    if (!status) return true; // No status filter
    
    const propertyStatus = property.project?.status;
    if (!propertyStatus) {
      console.log(`❌ No status data found`);
      return false;
    }

    const statusMatch = propertyStatus === status;
    
    if (!statusMatch) {
      console.log(`❌ Status filter failed: ${propertyStatus} != ${status}`);
    }
    
    return statusMatch;
  }

  // Property Type Filtering
  passesPropertyTypeFilter(property, propertyType) {
    if (!propertyType) return true; // No property type filter
    
    const projectType = property.project?.projectType;
    if (!projectType) {
      console.log(`❌ No project type data found`);
      return false;
    }

    const typeMatch = projectType === propertyType;
    
    if (!typeMatch) {
      console.log(`❌ Property type filter failed: ${projectType} != ${propertyType}`);
    }
    
    return typeMatch;
  }

  // Handle no results with smart fallbacks
  handleNoResults(allData, originalFilters) {
    const fallbackStrategies = [
      this.tryRelaxBHKFilter.bind(this),
      this.tryRelaxBudgetFilter.bind(this),
      this.tryRelaxCityFilter.bind(this),
      this.tryRemoveStatusFilter.bind(this)
    ];

    for (const strategy of fallbackStrategies) {
      const relaxedResults = strategy(allData, originalFilters);
      if (relaxedResults.length > 0) {
        console.log(`🔄 Found ${relaxedResults.length} results with relaxed filters`);
        return relaxedResults;
      }
    }

    return [];
  }

  tryRelaxBHKFilter(allData, filters) {
    const relaxedFilters = { ...filters };
    delete relaxedFilters.bhk;
    delete relaxedFilters.bhkRange;
    return allData.filter(property => this.passesAllFilters(property, relaxedFilters));
  }

  tryRelaxBudgetFilter(allData, filters) {
    const relaxedFilters = { ...filters };
    delete relaxedFilters.maxPrice;
    return allData.filter(property => this.passesAllFilters(property, relaxedFilters));
  }

  tryRelaxCityFilter(allData, filters) {
    const relaxedFilters = { ...filters };
    delete relaxedFilters.city;
    return allData.filter(property => this.passesAllFilters(property, relaxedFilters));
  }

  tryRemoveStatusFilter(allData, filters) {
    const relaxedFilters = { ...filters };
    delete relaxedFilters.status;
    return allData.filter(property => this.passesAllFilters(property, relaxedFilters));
  }

  // Remove duplicate properties
  removeDuplicates(results) {
    const seen = new Set();
    return results.filter(property => {
      const identifier = property.project?.id || property.project?.projectName;
      if (seen.has(identifier)) {
        return false;
      }
      seen.add(identifier);
      return true;
    });
  }

  // Handle too many results
  postProcessResults(results, filters) {
    if (results.length > 50) {
      console.log(`📊 Too many results (${results.length}), limiting to top 50`);
      results = results.slice(0, 50);
    }

    results.sort((a, b) => this.calculateRelevanceScore(a, b, filters));

    return results;
  }

  calculateRelevanceScore(a, b, filters) {
    // Simple relevance scoring - you can enhance this
    return 0;
  }

  // Log detailed results
  logDetailedResults(results, filters) {
    if (results.length > 0) {
      console.log('\n📋 MATCHING PROPERTIES:');
      results.forEach((result, index) => {
        const primaryConfig = result.configurations?.[0];
        const variant = result.variants?.[0];
        const price = variant?.price ? this.formatPrice(this.parsePrice(variant.price)) : 'N/A';
        const bhk = primaryConfig?.type || primaryConfig?.customBHK || 'N/A';
        const status = result.project?.status || 'Unknown';
        
        console.log(`  ${index + 1}. ${result.project?.projectName || 'Unknown'} | ${bhk} | ${price} | ${status}`);
      });
    } else {
      console.log('\n❌ NO PROPERTIES FOUND matching the exact criteria');
    }
  }

  generateSummary(results, filters) {
    if (results.length === 0) {
      const city = filters.city && filters.city !== 'both' ? 
        `in ${filters.city.charAt(0).toUpperCase() + filters.city.slice(1)}` : 'in Pune or Mumbai';
      const bhk = filters.bhk ? `${filters.bhk} BHK ` : '';
      const price = filters.maxPrice ? 
        `under ₹${this.formatPrice(filters.maxPrice)}` : '';
      const status = filters.status ? `that are ${filters.status.replace(/_/g, ' ').toLowerCase()}` : '';
      
      let message = `No ${bhk}properties found ${city} ${price} ${status}.`.replace(/\s+/g, ' ').trim();
      
      if (filters.city && filters.maxPrice) {
        message += " Try increasing your budget or checking different locations.";
      } else if (filters.bhk && filters.maxPrice) {
        message += " Consider looking for smaller units or different areas.";
      } else if (filters.bhk) {
        message += " Try searching without BHK filter to see all available properties.";
      } else {
        message += " Try adjusting your search criteria.";
      }
      
      return message;
    }

    const city = filters.city && filters.city !== 'both' ? 
      `in ${filters.city.charAt(0).toUpperCase() + filters.city.slice(1)}` : 'in Pune and Mumbai';
    const bhk = filters.bhk ? `${filters.bhk} BHK ` : '';
    const price = filters.maxPrice ? 
      `under ₹${this.formatPrice(filters.maxPrice)}` : 'across various budgets';
    const status = filters.status ? `that are ${filters.status.replace(/_/g, ' ').toLowerCase()}` : '';
    
    const readyCount = results.filter(r => r.project?.status === 'READY_TO_MOVE').length;
    const underConstructionCount = results.filter(r => r.project?.status === 'UNDER_CONSTRUCTION').length;
    
    const localities = [...new Set(results.map(r => 
      r.address ? (r.address.landmark || this.extractLocality(r.address.fullAddress) || 'Various locations') : 'Various locations'
    ))].slice(0, 3);

    let summary = `Found ${results.length} ${bhk}properties ${city} ${price} ${status}. `.replace(/\s+/g, ' ').trim();
    
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

  extractLocality(fullAddress) {
    if (!fullAddress) return 'Various locations';
    const parts = fullAddress.split(',');
    return parts.length > 1 ? parts[1].trim() : parts[0].trim();
  }

  formatPropertyCards(results) {
    if (results.length === 0) {
      return [];
    }

    return results.slice(0, 10).map(property => {
      const variant = property.variants?.[0];
      const config = property.configurations?.[0];
      
      let priceFormatted = 'Price on request';
      if (variant?.price) {
        const priceNum = this.parsePrice(variant.price);
        priceFormatted = `₹${this.formatPrice(priceNum)}`;
      }

      const amenities = this.extractAmenities(variant);

      return {
        id: property.project?.id || Math.random().toString(36).substr(2, 9),
        title: property.project?.projectName || 'Property',
        city: property.address ? this.extractCity(property.address.fullAddress) : 'Unknown',
        locality: property.address?.landmark || this.extractLocality(property.address?.fullAddress) || 'Various locations',
        bhk: config?.type || config?.customBHK || 'N/A',
        price: priceFormatted,
        projectName: property.project?.projectName || 'Unknown',
        status: property.project?.status === 'READY_TO_MOVE' ? 'Ready' : 
                property.project?.status === 'UNDER_CONSTRUCTION' ? 'Under Construction' : 'Unknown',
        amenities: amenities.slice(0, 3),
        ctaUrl: `/project/${property.project?.slug || property.project?.id || 'unknown'}`,
        carpetArea: variant?.carpetArea ? `${variant.carpetArea} sq.ft` : 'N/A',
        bathrooms: variant?.bathrooms || 'N/A'
      };
    });
  }

  extractAmenities(variant) {
    if (!variant) return ['Parking', 'Security'];
    
    const amenities = [];
    if (variant.lift === 'true') amenities.push('Lift');
    if (variant.balcony && parseInt(variant.balcony) > 0) amenities.push('Balcony');
    if (variant.furnishedType && variant.furnishedType !== 'UNFURNISHED') {
      amenities.push(variant.furnishedType.charAt(0) + variant.furnishedType.slice(1).toLowerCase());
    }
    if (variant.parkingType) amenities.push('Parking');
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
}

const searchEngine = new SearchEngine();
module.exports = { SearchEngine, searchEngine };