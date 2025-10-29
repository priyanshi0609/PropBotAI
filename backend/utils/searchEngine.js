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
      console.log(`\n🔍 Checking property: ${property.project?.projectName || 'Unknown'}`);

      // STRICT City Filtering - ONLY Pune or Mumbai
      if (!this.passesCityFilter(property, filters)) {
        return false;
      }

      // EXACT BHK Matching - PRIMARY CONFIGURATION ONLY
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

      console.log(`✅ Property PASSED all filters: ${property.project?.projectName || 'Unknown'}`);
      return true;
    });

    console.log(`\n🎯 FINAL RESULTS: ${results.length} properties found`);
    
    // Log detailed results
    this.logDetailedResults(results, filters);

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

  // EXACT BHK Matching - PRIMARY CONFIGURATION ONLY
  passesExactBHKFilter(property, targetBHK) {
    if (!property.configurations || property.configurations.length === 0) {
      console.log(`❌ No configuration data found`);
      return false;
    }

    // Use only the primary (first) configuration
    const primaryConfig = property.configurations[0];
    const type = (primaryConfig.type || '').toLowerCase().trim();
    const customBHK = (primaryConfig.customBHK || '').toLowerCase().trim();
    
    console.log(`   Primary BHK: Type="${type}", Custom="${customBHK}", Target="${targetBHK}bhk"`);
    
    // Generate patterns for exact matching
    const patterns = this.generateExactBHKPatterns(targetBHK);
    
    // Check for exact match in type
    const typeMatch = patterns.some(pattern => {
      const cleanPattern = pattern.replace(/\s+/g, '');
      return type === cleanPattern || type.includes(pattern);
    });
    
    // Check for exact match in customBHK
    const customMatch = patterns.some(pattern => {
      const cleanPattern = pattern.replace(/\s+/g, '');
      return customBHK === cleanPattern || customBHK.includes(pattern);
    });

    // Additional semantic matching for edge cases
    const semanticMatch = this.checkSemanticBHKMatch(type, targetBHK) || 
                         this.checkSemanticBHKMatch(customBHK, targetBHK);

    const hasExactBHK = typeMatch || customMatch || semanticMatch;
    
    if (!hasExactBHK) {
      console.log(`❌ Primary config BHK doesn't match target ${targetBHK}BHK`);
    } else {
      console.log(`✅ Primary config BHK matches target ${targetBHK}BHK`);
    }
    
    return hasExactBHK;
  }

  // Generate exact BHK patterns for a specific number
  generateExactBHKPatterns(bhkNumber) {
    return [
      `${bhkNumber} bhk`,
      `${bhkNumber}bhk`,
      `bhk ${bhkNumber}`,
      `bhk${bhkNumber}`,
      `${bhkNumber} bedroom`,
      `${bhkNumber}bedroom`,
      `bedroom ${bhkNumber}`,
      `${bhkNumber} bed`,
      `${bhkNumber}bed`,
      `bed ${bhkNumber}`,
      `${bhkNumber} room`,
      `${bhkNumber}room`,
      `room ${bhkNumber}`,
      `${bhkNumber} rk`,
      `${bhkNumber}rk`,
      `rk ${bhkNumber}`
    ];
  }

  // Semantic BHK matching for edge cases
  checkSemanticBHKMatch(bhkString, targetBHK) {
    if (!bhkString) return false;

    const semanticPatterns = {
      '1': [
        /^1$/,
        /one/i,
        /single/i,
        /1\s*rk/i,
        /1rk/i,
        /1\s*room/i,
        /1room/i
      ],
      '2': [
        /^2$/,
        /two/i,
        /double/i,
        /2\s*rk/i,
        /2rk/i,
        /2\s*room/i,
        /2room/i
      ],
      '3': [
        /^3$/,
        /three/i,
        /triple/i,
        /3\s*rk/i,
        /3rk/i,
        /3\s*room/i,
        /3room/i
      ]
    };

    const patterns = semanticPatterns[targetBHK] || [];
    return patterns.some(pattern => pattern.test(bhkString));
  }

  // Budget Filtering
  passesBudgetFilter(property, maxPrice) {
    if (!property.variants || property.variants.length === 0) {
      console.log(`❌ No variants found for price check`);
      return false;
    }

    const hasAffordableVariant = property.variants.some(variant => {
      const price = this.parsePrice(variant.price);
      const isAffordable = price > 0 && price <= maxPrice;
      
      if (isAffordable) {
        console.log(`✅ Price match: ₹${this.formatPrice(price)} <= ₹${this.formatPrice(maxPrice)}`);
      } else {
        console.log(`❌ Price exceeds: ₹${this.formatPrice(price)} > ₹${this.formatPrice(maxPrice)}`);
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
    
    // Handle crore format: "2.5 Cr" -> 25000000
    if (price.includes('Cr') || price.includes('cr') || price.includes('CR')) {
      const croreMatch = price.match(/(\d+(?:\.\d+)?)\s*Cr?/i);
      if (croreMatch) {
        return Math.floor(parseFloat(croreMatch[1]) * 10000000);
      }
    }
    
    // Handle lakh format: "80 L" -> 800000
    if (price.includes('L') || price.includes('l') || price.includes('Lac') || price.includes('lac')) {
      const lakhMatch = price.match(/(\d+(?:\.\d+)?)\s*L?/i);
      if (lakhMatch) {
        return Math.floor(parseFloat(lakhMatch[1]) * 100000);
      }
    }
    
    // Handle plain numbers (assume rupees)
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
    const propertyStatus = property.project?.status;
    if (!propertyStatus) {
      console.log(`❌ No status data found`);
      return false;
    }

    const statusMatch = propertyStatus === status;
    
    if (!statusMatch) {
      console.log(`❌ Status filter failed: ${propertyStatus} != ${status}`);
    } else {
      console.log(`✅ Status filter passed: ${propertyStatus}`);
    }
    
    return statusMatch;
  }

  // Property Type Filtering
  passesPropertyTypeFilter(property, propertyType) {
    const projectType = property.project?.projectType;
    if (!projectType) {
      console.log(`❌ No project type data found`);
      return false;
    }

    const typeMatch = projectType === propertyType;
    
    if (!typeMatch) {
      console.log(`❌ Property type filter failed: ${projectType} != ${propertyType}`);
    } else {
      console.log(`✅ Property type filter passed: ${projectType}`);
    }
    
    return typeMatch;
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
      
      // Show filter summary
      console.log(`\n🎯 FILTER SUMMARY:`);
      console.log(`   BHK: ${filters.bhk ? filters.bhk + 'BHK' : 'Any'}`);
      console.log(`   City: ${filters.city ? filters.city.charAt(0).toUpperCase() + filters.city.slice(1) : 'Pune/Mumbai'}`);
      console.log(`   Max Price: ${filters.maxPrice ? '₹' + this.formatPrice(filters.maxPrice) : 'Any'}`);
      console.log(`   Status: ${filters.status ? filters.status.replace(/_/g, ' ') : 'Any'}`);
    } else {
      console.log('\n❌ NO PROPERTIES FOUND matching the exact criteria');
      
      // Show why no results
      console.log(`\n🔍 NO RESULTS ANALYSIS:`);
      console.log(`   BHK Filter: ${filters.bhk ? 'Strict ' + filters.bhk + 'BHK matching' : 'No BHK filter'}`);
      console.log(`   City Filter: ${filters.city ? filters.city.charAt(0).toUpperCase() + filters.city.slice(1) : 'Pune/Mumbai only'}`);
      console.log(`   Budget Filter: ${filters.maxPrice ? 'Under ₹' + this.formatPrice(filters.maxPrice) : 'No budget limit'}`);
      console.log(`   Try: Adjusting filters or searching with different criteria`);
    }
  }

  generateSummary(results, filters) {
    // Handle irrelevant queries
    if (filters.isRelevant === false) {
      if (filters.unsupportedCity) {
        return "I specialize only in properties in Pune and Mumbai. I cannot help with properties in other cities. Please search for properties in Pune or Mumbai.";
      }
      return "I'm an intelligent assistant specialized in properties in Pune and Mumbai. I have no expertise about your current question. Try asking me about flats, BHKs, or properties in these cities!";
    }

    if (results.length === 0) {
      const city = filters.city && filters.city !== 'both' ? 
        `in ${filters.city.charAt(0).toUpperCase() + filters.city.slice(1)}` : 'in Pune or Mumbai';
      const bhk = filters.bhk ? `${filters.bhk} BHK ` : '';
      const price = filters.maxPrice ? 
        `under ₹${this.formatPrice(filters.maxPrice)}` : '';
      const status = filters.status ? `that are ${filters.status.replace(/_/g, ' ').toLowerCase()}` : '';
      
      let message = `No ${bhk}properties found ${city} ${price} ${status}.`.replace(/\s+/g, ' ').trim();
      
      // Suggest alternatives
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

  formatPropertyCards(results) {
    if (results.length === 0) {
      return [];
    }

    return results.slice(0, 10).map(property => {
      const variant = property.variants?.[0];
      const config = property.configurations?.[0];
      
      // Format price properly
      let priceFormatted = 'Price on request';
      if (variant?.price) {
        const priceNum = this.parsePrice(variant.price);
        priceFormatted = `₹${this.formatPrice(priceNum)}`;
      }

      // Extract amenities
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

  extractLocality(fullAddress) {
    if (!fullAddress) return 'Various locations';
    const parts = fullAddress.split(',');
    return parts.length > 1 ? parts[1].trim() : parts[0].trim();
  }

  // Utility method to debug property data
  debugProperty(property) {
    console.log('\n🔧 PROPERTY DEBUG INFO:');
    console.log('Project:', property.project?.projectName);
    console.log('Configurations:', property.configurations?.map(c => ({
      type: c.type,
      customBHK: c.customBHK
    })));
    console.log('Variants:', property.variants?.map(v => ({
      price: v.price,
      carpetArea: v.carpetArea
    })));
    console.log('Address:', property.address?.fullAddress);
    console.log('Status:', property.project?.status);
  }
}

const searchEngine = new SearchEngine();

module.exports = { SearchEngine, searchEngine };