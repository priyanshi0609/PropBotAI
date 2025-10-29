class QueryParser {
  parse(query) {
    const cleanQuery = query.toLowerCase().trim();
    const filters = {};
    
    console.log('🔍 Parsing query:', cleanQuery);

    // Enhanced property intent detection
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

    // EXACT BHK Matching - FIXED LOGIC
    filters.bhk = this.extractExactBHK(cleanQuery);

    // City extraction
    filters.city = this.extractExactCity(cleanQuery);

    // Budget extraction
    const budget = this.extractExactBudget(cleanQuery);
    if (budget) filters.maxPrice = budget;

    // Status extraction
    filters.status = this.extractExactStatus(cleanQuery);

    // Property type extraction
    filters.propertyType = this.extractPropertyType(cleanQuery);

    console.log('🎯 Final filters:', filters);
    return filters;
  }

  // EXACT BHK extraction - CORRECTED VERSION
  extractExactBHK(query) {
    console.log('🛏️ Extracting BHK from:', query);
    
    // First, try to find exact BHK patterns
    const bhkPatterns = [
      // Pattern: "2 bhk", "3 bhk flat", "1 bhk apartment"
      /\b(\d)\s*bhk\b/i,
      
      // Pattern: "2bhk", "3bhk flat", "1bhk apartment"  
      /\b(\d)bhk\b/i,
      
      // Pattern: "2 bedroom", "3 bedroom flat"
      /\b(\d)\s*bedroom\b/i,
      
      // Pattern: "2 bed", "3 bed flat"
      /\b(\d)\s*bed\b/i,
      
      // Pattern: "2 b h k", "3 b.h.k"
      /\b(\d)\s*b\s*\.?\s*h\s*\.?\s*k\b/i,
      
      // Pattern: "2 b r", "3 b/r"
      /\b(\d)\s*b\s*\.?\s*r\b/i,
      
      // Pattern: "2 rk", "3 rk flat"
      /\b(\d)\s*rk\b/i,
    ];

    for (const pattern of bhkPatterns) {
      const match = query.match(pattern);
      if (match) {
        const bhk = match[1];
        if (['1', '2', '3'].includes(bhk)) {
          console.log(`✅ Found EXACT BHK with pattern ${pattern}: ${bhk}BHK`);
          return bhk;
        }
      }
    }

    // Handle word numbers: "one bhk", "two bhk", "three bhk"
    const wordPatterns = [
      /\b(one)\s*bhk\b/i,
      /\b(two)\s*bhk\b/i, 
      /\b(three)\s*bhk\b/i,
      /\b(one)\s*bedroom\b/i,
      /\b(two)\s*bedroom\b/i,
      /\b(three)\s*bedroom\b/i
    ];

    for (const pattern of wordPatterns) {
      const match = query.match(pattern);
      if (match) {
        const numberMap = { 'one': '1', 'two': '2', 'three': '3' };
        const bhk = numberMap[match[1].toLowerCase()];
        console.log(`✅ Found WORD BHK: ${bhk}BHK`);
        return bhk;
      }
    }

    // Handle positional patterns: "bhk 2", "bedroom 3"
    const positionalPatterns = [
      /bhk\s*(\d)\b/i,
      /bedroom\s*(\d)\b/i,
      /bed\s*(\d)\b/i,
      /rk\s*(\d)\b/i
    ];

    for (const pattern of positionalPatterns) {
      const match = query.match(pattern);
      if (match && ['1', '2', '3'].includes(match[1])) {
        console.log(`✅ Found POSITIONAL BHK: ${match[1]}BHK`);
        return match[1];
      }
    }

    // Handle standalone numbers in property context
    if (this.isPropertyQuery(query)) {
      const standaloneNumbers = query.match(/\b(1|2|3)\b/);
      if (standaloneNumbers) {
        const bhk = standaloneNumbers[1];
        console.log(`✅ Found STANDALONE BHK in property context: ${bhk}BHK`);
        return bhk;
      }
    }

    console.log('❌ No BHK found');
    return null;
  }

  // Helper to check if this is clearly a property query
  isPropertyQuery(query) {
    const propertyContext = [
      'flat', 'apartment', 'house', 'property', 'home',
      'pune', 'mumbai', 'lakh', 'cr', 'crore', 'budget',
      'ready', 'construction', 'possession'
    ];
    
    return propertyContext.some(context => query.includes(context));
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

  // EXACT Budget extraction
  extractExactBudget(query) {
    const budgetPatterns = [
      /(?:under|below|less than|upto|within|max|maximum)\s*₹?\s*(\d+(?:\.\d+)?)\s*(cr|lakh|lac|crore)\b/i,
      /₹?\s*(\d+(?:\.\d+)?)\s*(cr|lakh|lac|crore)\b/i,
      /budget\s*₹?\s*(\d+(?:\.\d+)?)\s*(cr|lakh|lac)/i,
      /\b(\d+(?:\.\d+)?)\s*(lakh|lac|cr|crore)\b/i,
    ];

    for (const pattern of budgetPatterns) {
      const match = query.match(pattern);
      if (match) {
        let amount = parseFloat(match[1]);
        let unit = match[2].toLowerCase();

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

    // Handle "under X" without explicit unit
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

  // Generate appropriate response for irrelevant queries
  getIrrelevantResponse(query, filters = {}) {
    if (filters.unsupportedCity) {
      return "I specialize only in properties in Pune and Mumbai. I cannot help with properties in other cities. Please search for properties in Pune or Mumbai.";
    }

    const responses = [
      "I'm an intelligent assistant specialized in properties in Pune and Mumbai. I have no expertise about your current question. Try asking me about flats, BHKs, or properties in these cities!",
      "I specialize exclusively in property search for Pune and Mumbai. I don't have knowledge about other topics. Ask me about 2BHK flats, properties under ₹1 Cr, or ready-to-move homes in these cities!",
      "My expertise is limited to properties in Pune and Mumbai. I can't help with other questions. Try: '3BHK in Pune under ₹1.2 Cr' or 'Ready flats in Mumbai'"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

const queryParser = new QueryParser();

module.exports = { QueryParser, queryParser };