class QueryParser {
  parse(query) {
    const cleanQuery = query.toLowerCase().trim();
    const filters = {};
    
    console.log('🔍 Parsing query:', cleanQuery);

    // Enhanced property intent detection with semantic understanding
    const propertyKeywords = [
      'bhk', 'flat', 'apartment', 'house', 'property', 'properties',
      'home', 'residential', 'commercial', 'buy', 'purchase', 'find',
      'search', 'looking', 'need', 'want', 'show', 'list', 'room',
      'residence', 'unit', 'accommodation', 'living space'
    ];

    const hasPropertyIntent = propertyKeywords.some(keyword => 
      cleanQuery.includes(keyword)
    ) || this.hasSemanticPropertyIntent(cleanQuery);

    const hasCityIntent = this.extractCityIntent(cleanQuery);
    const hasBudgetIntent = this.extractBudgetIntent(cleanQuery);

    // Edge case: If query mentions specific cities outside Pune/Mumbai
    if (this.hasUnsupportedCities(cleanQuery)) {
      filters.isRelevant = false;
      filters.unsupportedCity = true;
      return filters;
    }

    // If no clear property intent and no city/budget, mark as irrelevant
    if (!hasPropertyIntent && !hasCityIntent && !hasBudgetIntent) {
      filters.isRelevant = false;
      return filters;
    }

    filters.isRelevant = true;

    // EXACT BHK Matching with edge cases
    filters.bhk = this.extractExactBHK(cleanQuery);

    // City extraction with edge cases
    filters.city = this.extractExactCity(cleanQuery);

    // Budget extraction with edge cases
    const budget = this.extractExactBudget(cleanQuery);
    if (budget) filters.maxPrice = budget;

    // Status extraction
    filters.status = this.extractExactStatus(cleanQuery);

    // Property type extraction
    filters.propertyType = this.extractPropertyType(cleanQuery);

    console.log('🎯 Final filters:', filters);
    return filters;
  }

  // Semantic property intent detection
  hasSemanticPropertyIntent(query) {
    const semanticPatterns = [
      /(?:looking|searching|finding|want|need).*(?:place|stay|live|reside)/i,
      /(?:new|my|our|their).*(?:home|house|flat|apartment)/i,
      /(?:shift|move|relocate).*(?:pune|mumbai)/i,
      /(?:invest|investment).*(?:property|real.estate)/i
    ];
    
    return semanticPatterns.some(pattern => pattern.test(query));
  }

  // EXACT BHK extraction with all edge cases
  extractExactBHK(query) {
    const bhkPatterns = [
      // Standard patterns
      /\b(\d)\s*bhk\b/i,
      /\b(\d)bhk\b/i,
      /\b(\d)\s*bedroom\b/i,
      /\b(\d)\s*bed\s*room\b/i,
      /\b(\d)\s*bed\b/i,
      /bhk\s*(\d)\b/i,
      /\b(\d)\s*b\.?h\.?k\b/i,
      
      // Edge cases
      /\b(one|two|three)\s*bhk\b/i,
      /\b(1|2|3)\s*room\b/i,
      /\b(1|2|3)\s*rk\b/i,
      /\b(1|2|3)\s*b\/?r\b/i,
      /\b(1|2|3)\s*b\s*&?\s*h\s*&?\s*k\b/i,
    ];

    for (const pattern of bhkPatterns) {
      const match = query.match(pattern);
      if (match) {
        let bhk = match[1];
        
        // Handle word numbers
        if (isNaN(bhk)) {
          const numberMap = { 'one': '1', 'two': '2', 'three': '3' };
          bhk = numberMap[bhk.toLowerCase()] || bhk;
        }
        
        // Validate it's 1, 2, or 3
        if (['1', '2', '3'].includes(bhk)) {
          console.log(`✅ Found EXACT BHK: ${bhk}BHK`);
          return bhk;
        }
      }
    }

    // Check for BHK in different positions
    const positionalPatterns = [
      /(\d)(?:\s*)?(?:bhk|bedroom|bed)/i,
      /(?:bhk|bedroom|bed)(?:\s*)?(\d)/i
    ];

    for (const pattern of positionalPatterns) {
      const match = query.match(pattern);
      if (match && ['1', '2', '3'].includes(match[1])) {
        console.log(`✅ Found EXACT BHK (positional): ${match[1]}BHK`);
        return match[1];
      }
    }

    return null;
  }

  // City intent detection
  extractCityIntent(query) {
    return query.includes('pune') || query.includes('mumbai') || 
           query.includes('punekar') || query.includes('mumbaikar');
  }

  // EXACT City extraction
  extractExactCity(query) {
    const hasPune = query.includes('pune');
    const hasMumbai = query.includes('mumbai');

    if (hasPune && !hasMumbai) {
      console.log(`📍 Found city: Pune`);
      return 'pune';
    } else if (hasMumbai && !hasPune) {
      console.log(`📍 Found city: Mumbai`);
      return 'mumbai';
    } else if (hasPune && hasMumbai) {
      console.log(`📍 Found cities: Both Pune and Mumbai`);
      return 'both';
    }
    return null;
  }

  // Budget intent detection
  extractBudgetIntent(query) {
    return query.includes('₹') || query.includes('under') || 
           query.includes('below') || query.includes('less than') ||
           query.includes('lakh') || query.includes('lac') || 
           query.includes('cr') || query.includes('crore') ||
           query.match(/\d+\s*(lakh|lac|cr|crore)/i) ||
           query.match(/(?:budget|price|cost).*\d+/i);
  }

  // EXACT Budget extraction with edge cases
  extractExactBudget(query) {
    const budgetPatterns = [
      // Standard patterns
      /(?:under|below|less than|upto|within|max|maximum)\s*₹?\s*(\d+(?:\.\d+)?)\s*(cr|lakh|lac|crore)\b/i,
      /₹?\s*(\d+(?:\.\d+)?)\s*(cr|lakh|lac|crore)\b/i,
      /budget\s*₹?\s*(\d+(?:\.\d+)?)\s*(cr|lakh|lac)/i,
      /\b(\d+(?:\.\d+)?)\s*(lakh|lac|cr|crore)\b/i,
      
      // Edge cases
      /(?:around|about|approximately)\s*₹?\s*(\d+)\s*(lakh|lac|cr)/i,
      /(\d+)\s*(?:to|\-)\s*(\d+)\s*(lakh|lac)/i,
      /(?:price|cost)\s*:?\s*₹?\s*(\d+)\s*(lakh|lac)/i,
    ];

    for (const pattern of budgetPatterns) {
      const match = query.match(pattern);
      if (match) {
        let amount = parseFloat(match[1]);
        let unit = match[2].toLowerCase();

        // Handle range (take the upper limit)
        if (match[3] && match[4]) {
          amount = parseFloat(match[3]); // Take the higher number in range
          unit = match[4].toLowerCase();
        }

        if (unit.includes('cr') || unit.includes('crore')) {
          const maxPrice = Math.floor(amount * 10000000);
          console.log(`💰 Found budget: ${amount} ${unit} -> ₹${maxPrice}`);
          return maxPrice;
        } else if (unit.includes('lakh') || unit.includes('lac')) {
          const maxPrice = Math.floor(amount * 100000);
          console.log(`💰 Found budget: ${amount} ${unit} -> ₹${maxPrice}`);
          return maxPrice;
        }
      }
    }

    // Handle "under X" without explicit unit (assume lakhs)
    const underPattern = /under\s*₹?\s*(\d+(?:\.\d+)?)(?:\s*(?:lakh|lac|cr|crore))?\b/i;
    const underMatch = query.match(underPattern);
    if (underMatch) {
      const amount = parseFloat(underMatch[1]);
      // If amount is less than 10, assume crores, else assume lakhs
      const maxPrice = amount < 10 ? Math.floor(amount * 10000000) : Math.floor(amount * 100000);
      console.log(`💰 Found budget (implied unit): ${amount} -> ₹${maxPrice}`);
      return maxPrice;
    }

    return null;
  }

  // Status extraction
  extractExactStatus(query) {
    if (query.match(/\b(ready|possession|move in|rtm|ready to move|immediate possession)\b/i)) {
      console.log(`🏠 Found status: Ready to Move`);
      return 'READY_TO_MOVE';
    } else if (query.match(/\b(under construction|ongoing|construction|new launch|upcoming)\b/i)) {
      console.log(`🏗️ Found status: Under Construction`);
      return 'UNDER_CONSTRUCTION';
    }
    return null;
  }

  // Property type extraction
  extractPropertyType(query) {
    if (query.match(/\b(commercial|office|shop|retail|business)\b/i)) {
      return 'COMMERCIAL';
    } else if (query.match(/\b(residential|flat|apartment|house|home)\b/i)) {
      return 'RESIDENTIAL';
    }
    return null;
  }

  // Check for unsupported cities
  hasUnsupportedCities(query) {
    const unsupportedCities = [
      'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata',
      'ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur'
    ];
    return unsupportedCities.some(city => query.includes(city));
  }

  // Helper to check if query should be processed
  shouldProcessQuery(filters) {
    return filters.isRelevant !== false;
  }

  // Generate appropriate response for irrelevant queries
  getIrrelevantResponse(query, filters = {}) {
    if (filters.unsupportedCity) {
      return "I specialize only in properties in Pune and Mumbai. I cannot help with properties in other cities. Please search for properties in Pune or Mumbai.";
    }

    const responses = [
      "I'm an intelligent assistant specialized in properties in Pune and Mumbai. I have no expertise about your current question. Try asking me about flats, BHKs, or properties in these cities!",
      "I specialize exclusively in property search for Pune and Mumbai. I don't have knowledge about other topics. Ask me about 2BHK flats, properties under ₹1 Cr, or ready-to-move homes in these cities!",
      "My expertise is limited to properties in Pune and Mumbai. I can't help with other questions. Try: '3BHK in Pune under ₹1.2 Cr' or 'Ready flats in Mumbai'",
      "I'm designed specifically for property search in Pune and Mumbai. I have no expertise about your question. Looking for properties? I can help you find flats and apartments in these cities!"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

const queryParser = new QueryParser();

module.exports = { QueryParser, queryParser };