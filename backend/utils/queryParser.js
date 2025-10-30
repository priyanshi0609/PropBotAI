class QueryParser {
  constructor() {
    // Supported BHK configurations from your CSV
    this.supportedBHKs = ['1', '2', '3', '4', '5', '4.5', '1rk'];
    this.supportedBHKTypes = ['1BHK', '2BHK', '3BHK', '4BHK', '5BHK', '4.5BHK', '1RK'];
    
    // Extended BHK mappings for different formats
    this.bhkMappings = {
      '1': ['1', '1bhk', 'one', 'single', '1 bhk', '1 bedroom', '1bedroom', '1bed'],
      '2': ['2', '2bhk', 'two', 'double', '2 bhk', '2 bedroom', '2bedroom', '2bed'],
      '3': ['3', '3bhk', 'three', 'triple', '3 bhk', '3 bedroom', '3bedroom', '3bed'],
      '4': ['4', '4bhk', 'four', '4 bhk', '4 bedroom', '4bedroom', '4bed'],
      '5': ['5', '5bhk', 'five', '5 bhk', '5 bedroom', '5bedroom', '5bed'],
      '4.5': ['4.5', '4.5bhk', 'four point five', '4.5 bhk', '4.5bedroom'],
      '1RK': ['1rk', '1 rk', 'rk', 'room kitchen', '1roomkitchen']
    };
    
    this.supportedCities = ['pune', 'mumbai'];
    
    this.localityMappings = {
      'poon': 'pune',
      'poona': 'pune',
      'bombay': 'mumbai',
      'it park': 'hinjewadi',
      'magarpatta city': 'magarpatta',
      'kalyani nagr': 'kalyani nagar',
      'koregaon pk': 'koregaon park'
    };
  }

  parse(query) {
    const cleanQuery = query.toLowerCase().trim();
    const filters = {};
    
    console.log('🔍 Parsing query:', cleanQuery);

    // Apply fuzzy matching for typos
    const normalizedQuery = this.applyFuzzyMatching(cleanQuery);

    // Enhanced property intent detection
    const hasPropertyIntent = this.hasPropertyIntent(normalizedQuery);
    const hasCityIntent = this.extractCityIntent(normalizedQuery);
    const hasBudgetIntent = this.extractBudgetIntent(normalizedQuery);
    const hasBHKIntent = this.hasBHKIntent(normalizedQuery);

    // Edge case: If query mentions specific cities outside Pune/Mumbai
    if (this.hasUnsupportedCities(normalizedQuery)) {
      filters.isRelevant = false;
      filters.unsupportedCity = true;
      filters.detectedCity = this.extractUnsupportedCity(normalizedQuery);
      return filters;
    }

    // Check for clearly irrelevant queries
    if (this.isClearlyIrrelevantQuery(normalizedQuery)) {
      filters.isRelevant = false;
      filters.queryType = 'irrelevant';
      return filters;
    }

    // **FIX: Check for invalid BHK numbers (0, negative, etc.)**
    const extractedBHK = this.extractExactBHK(normalizedQuery);
    if (extractedBHK && this.isInvalidBHK(extractedBHK)) {
      filters.isRelevant = false;
      filters.invalidBHK = extractedBHK;
      filters.availableBHKs = this.getAvailableBHKsForDisplay();
      return filters;
    }

    // **FIX: Check for BHK numbers that don't exist in database**
    if (extractedBHK && !this.isSupportedBHK(extractedBHK)) {
      filters.isRelevant = false;
      filters.unsupportedBHK = extractedBHK;
      filters.availableBHKs = this.getAvailableBHKsForDisplay();
      return filters;
    }

    // **FIX: Check for ambiguous budget (missing units) - STRICTER CHECK**
    const ambiguousBudget = this.extractAmbiguousBudget(normalizedQuery);
    if (ambiguousBudget && this.shouldRejectAmbiguousBudget(normalizedQuery, ambiguousBudget)) {
      filters.isRelevant = false;
      filters.ambiguousBudget = ambiguousBudget;
      filters.needsBudgetClarification = true;
      return filters;
    }

    // Check for ambiguous BHK ranges
    const bhkRange = this.extractBHKRange(normalizedQuery);
    if (bhkRange && bhkRange.isRange) {
      // Validate all BHKs in range are supported
      const unsupportedInRange = bhkRange.values.filter(bhk => !this.isSupportedBHK(bhk));
      if (unsupportedInRange.length > 0) {
        filters.isRelevant = false;
        filters.unsupportedBHK = unsupportedInRange[0];
        filters.availableBHKs = this.getAvailableBHKsForDisplay();
        return filters;
      }
      filters.bhkRange = bhkRange;
      filters.hasMultipleBHK = true;
    }

    // Check if query is too vague
    if (this.isTooVagueQuery(normalizedQuery, hasPropertyIntent, hasBHKIntent, hasBudgetIntent)) {
      filters.isRelevant = false;
      filters.vagueQuery = true;
      filters.missingFilters = this.identifyMissingFilters(normalizedQuery, hasPropertyIntent, hasBHKIntent, hasBudgetIntent);
      return filters;
    }

    // Handle multiple queries in one message
    if (this.hasMultipleQueries(normalizedQuery)) {
      filters.isRelevant = false;
      filters.multipleQueries = true;
      return filters;
    }

    filters.isRelevant = true;

    // EXACT BHK Matching - Handle single BHK and ranges
    if (bhkRange && bhkRange.isRange) {
      filters.bhk = bhkRange.values[0];
      filters.bhkRange = bhkRange;
    } else {
      filters.bhk = extractedBHK;
    }

    // City extraction with multiple city support
    filters.city = this.extractExactCity(normalizedQuery);

    // **FIX: Budget extraction - ONLY extract when explicit unit exists**
    const budget = this.extractExactBudget(normalizedQuery);
    if (budget) {
      filters.maxPrice = budget;
    } else {
      // **FIX: Don't extract ambiguous budgets for execution**
      filters.maxPrice = null;
    }

    // Status extraction
    filters.status = this.extractExactStatus(normalizedQuery);

    // Property type extraction
    filters.propertyType = this.extractPropertyType(normalizedQuery);

    // Extract localities for better matching
    filters.localities = this.extractLocalities(normalizedQuery);

    // Handle OR conditions in query
    filters.orConditions = this.extractOrConditions(normalizedQuery);

    console.log('🎯 Final filters:', filters);
    return filters;
  }

  // **FIXED: Enhanced BHK extraction with better case handling**
  extractExactBHK(query) {
    console.log('🛏️ Extracting BHK from:', query);

    // **FIX: Extract ranges first**
    const range = this.extractBHKRange(query);
    if (range) {
      console.log(`✅ Found BHK range: ${range.values.join('-')}BHK`);
      return range.values[0]; // Return first BHK for initial filtering
    }

    const bhkPatterns = [
      // **FIXED: More comprehensive patterns with case-insensitive matching**
      /\b(\d(?:\.\d)?)\s*bhk\b/i,
      /\b(\d(?:\.\d)?)bhk\b/i,
      /\b(\d(?:\.\d)?)\s*bedroom\b/i,
      /\b(\d(?:\.\d)?)\s*bed\s*room\b/i,
      /\b(\d(?:\.\d)?)\s*bed\b/i,
      /\b(\d)\s*rk\b/i,
      /\b(\d)rk\b/i,
      /\broom\s*kitchen\b/i,
      // **NEW: Handle cases like "3 BHK", "3BHK", "3 bhk" etc.**
      /\b(\d)\s*b\s*h\s*k\b/i,
      /\b(\d)\s*b\s*h\s*k\b/i,
    ];

    for (const pattern of bhkPatterns) {
      const match = query.match(pattern);
      if (match) {
        let bhk = match[1];
        
        // **FIX: Handle 1RK specifically**
        if (query.includes('rk') || query.includes('room kitchen')) {
          console.log(`✅ Found 1RK`);
          return '1rk';
        }

        // **FIX: Validate the extracted BHK is supported**
        if (this.isSupportedBHK(bhk)) {
          console.log(`✅ Found valid BHK: ${bhk}BHK`);
          return bhk;
        } else {
          console.log(`❌ Extracted BHK ${bhk} is not supported`);
        }
      }
    }

    // **NEW: Try direct BHK mapping for common patterns**
    for (const [supportedBHK, variations] of Object.entries(this.bhkMappings)) {
      for (const variation of variations) {
        const pattern = new RegExp(`\\b${variation}\\b`, 'i');
        if (pattern.test(query)) {
          console.log(`✅ Found BHK via mapping: ${supportedBHK}BHK`);
          return supportedBHK;
        }
      }
    }

    console.log('❌ No valid BHK found');
    return null;
  }

  // **FIXED: Enhanced BHK range extraction**
  extractBHKRange(query) {
    const rangePatterns = [
      // **FIX: More specific range patterns with better word boundaries**
      /\b(\d)\s*(?:-|to|–)\s*(\d)\s*bhk\b/i,
      /\b(\d)\s*(?:\/|or)\s*(\d)\s*bhk\b/i,
      /\b(\d)\s*bhk\s*(?:or|\/)\s*(\d)\s*bhk\b/i,
      /\b(\d)\s*(?:-|to|–)\s*(\d)\s*bedroom\b/i,
    ];

    for (const pattern of rangePatterns) {
      const match = query.match(pattern);
      if (match) {
        const bhks = [match[1], match[2]].filter(bhk => 
          this.isSupportedBHK(bhk)
        );
        
        if (bhks.length >= 2) {
          console.log(`✅ Found valid BHK range: ${bhks.join('-')}BHK`);
          return {
            isRange: true,
            values: bhks,
            originalText: match[0]
          };
        }
      }
    }

    return null;
  }

  // Apply fuzzy matching for typos
  applyFuzzyMatching(query) {
    let normalized = query;
    
    Object.keys(this.localityMappings).forEach(typo => {
      const regex = new RegExp(`\\b${typo}\\b`, 'gi');
      normalized = normalized.replace(regex, this.localityMappings[typo]);
    });

    // **FIXED: Better BHK normalization**
    normalized = normalized
      .replace(/\b(bhk|bh|bk|b h k|BHK|Bhk)\b/gi, 'bhk')
      .replace(/\b(bedroom|bedrm|bed room|bed|bedrooms)\b/gi, 'bedroom')
      .replace(/\b(crore|cr|cror)\b/gi, 'cr')
      .replace(/\b(lakh|lac|lacks)\b/gi, 'lakh')
      .replace(/\b(rk|r k|room kitchen)\b/gi, 'rk');

    if (normalized !== query) {
      console.log('🔧 Applied fuzzy matching:', query, '→', normalized);
    }

    return normalized;
  }

  // Check if BHK is supported in database
  isSupportedBHK(bhk) {
    // **FIXED: Better BHK validation**
    const normalizedBHK = bhk.toString().toLowerCase();
    return this.supportedBHKs.includes(normalizedBHK) || 
           this.supportedBHKTypes.map(t => t.toLowerCase()).includes(normalizedBHK);
  }

  // **NEW: Check for invalid BHK numbers (0, negative, etc.)**
  isInvalidBHK(bhk) {
    // Reject 0, negative numbers, and very large numbers
    if (bhk === '0' || bhk === '-1' || bhk === '00' || parseInt(bhk) > 10) {
      return true;
    }
    return false;
  }

  // **NEW: Stricter check for ambiguous budgets**
  shouldRejectAmbiguousBudget(query, ambiguousBudget) {
    const { amount } = ambiguousBudget;
    
    // If amount is too small (like "under 1") without context, reject it
    if (amount < 5 && !query.includes('cr') && !query.includes('crore')) {
      return true;
    }
    
    // If amount is a single digit without clear context, reject it
    if (amount < 10 && !this.hasClearBudgetContext(query)) {
      return true;
    }
    
    return false;
  }

  // **NEW: Check if query has clear budget context**
  hasClearBudgetContext(query) {
    const budgetKeywords = ['budget', 'price', 'cost', 'worth', 'value', 'amount'];
    return budgetKeywords.some(keyword => query.includes(keyword));
  }

  // Get available BHKs for display in error messages
  getAvailableBHKsForDisplay() {
    return ['1BHK', '2BHK', '3BHK', '4BHK', '5BHK', '4.5BHK', '1RK'];
  }

  // Enhanced property intent detection
  hasPropertyIntent(query) {
    const propertyKeywords = [
      'bhk', 'flat', 'apartment', 'house', 'property', 'properties',
      'home', 'residential', 'commercial', 'buy', 'purchase', 'find',
      'search', 'looking', 'need', 'want', 'show', 'list', 'room',
      'residence', 'unit', 'accommodation', 'living space', 'plot',
      'villa', 'builder', 'construction', 'possession', 'sale',
      'rent', 'lease', 'investment', 'real estate'
    ];

    return propertyKeywords.some(keyword => query.includes(keyword)) ||
           this.hasSemanticPropertyIntent(query);
  }

  hasSemanticPropertyIntent(query) {
    const semanticPatterns = [
      /(?:looking|searching|finding|want|need).*(?:place|stay|live|reside)/i,
      /(?:new|my|our|their).*(?:home|house|flat|apartment)/i,
      /(?:shift|move|relocate).*(?:pune|mumbai)/i,
      /(?:invest|investment).*(?:property|real.estate)/i
    ];
    
    return semanticPatterns.some(pattern => pattern.test(query));
  }

  // Check for BHK intent
  hasBHKIntent(query) {
    const bhkPatterns = [
      /\b(\d)\s*bhk\b/i,
      /\b(\d)bhk\b/i,
      /\b(\d)\s*bedroom\b/i,
      /\b(\d)\s*bed\b/i,
      /\b(\d)\s*room\b/i,
      /\b(\d)\s*rk\b/i
    ];
    
    return bhkPatterns.some(pattern => query.match(pattern));
  }

  // Enhanced irrelevant query detection
  isClearlyIrrelevantQuery(query) {
    const irrelevantPatterns = [
      /(joke|funny|humor|weather|temperature|forecast)/i,
      /(news|headlines|update|time|date|day)/i,
      /(calculate|math|addition|who is|what is|when is)/i,
      /(how.*work|how.*built|how.*made|api|endpoint)/i,
      /(movie|film|entertainment|sport|game|player)/i,
      /(music|song|artist|food|restaurant|recipe)/i,
      /(travel|tourist|hotel|health|doctor|medical)/i,
      /(education|school|college|politics|government)/i,
      /^(hi|hello|hey|greetings)/i,
      /^(how are you|what's up|sup|good morning)/i
    ];

    return irrelevantPatterns.some(pattern => pattern.test(query));
  }

  // Extract unsupported city for better error messages
  extractUnsupportedCity(query) {
    const unsupportedCities = [
      'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata',
      'ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur',
      'noida', 'gurgaon', 'faridabad', 'ghaziabad', 'indore',
      'bhopal', 'nagpur', 'kochi', 'coimbatore', 'visakhapatnam'
    ];

    return unsupportedCities.find(city => query.includes(city)) || 'unknown';
  }

  // Check for unsupported cities
  hasUnsupportedCities(query) {
    const unsupportedCities = [
      'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata',
      'ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur',
      'noida', 'gurgaon', 'faridabad', 'ghaziabad', 'indore',
      'bhopal', 'nagpur', 'kochi', 'coimbatore', 'visakhapatnam'
    ];
    return unsupportedCities.some(city => query.includes(city));
  }

  // Extract ambiguous budgets (missing units)
  extractAmbiguousBudget(query) {
    const ambiguousPatterns = [
      /(?:under|below|less than|upto|budget)\s*₹?\s*(\d+(?:\.\d+)?)(?:\s*(?:lakh|lac|cr|crore))?\b/i,
      /(?:around|about|approximately)\s*₹?\s*(\d+(?:\.\d+)?)(?:\s*(?:lakh|lac|cr|crore))?\b/i
    ];

    for (const pattern of ambiguousPatterns) {
      const match = query.match(pattern);
      if (match && !query.match(/(lakh|lac|cr|crore)/i)) {
        const amount = parseFloat(match[1]);
        
        let likelyUnit = 'lakh';
        let suggestedAmount = amount;
        
        if (amount < 10) {
          likelyUnit = 'cr';
          suggestedAmount = amount * 100;
        } else if (amount > 100) {
          likelyUnit = 'lakh';
        }

        return {
          amount: amount,
          likelyUnit: likelyUnit,
          suggestedMaxPrice: likelyUnit === 'cr' ? amount * 10000000 : amount * 100000,
          needsClarification: true
        };
      }
    }

    return null;
  }

  // **FIXED: STRICT Budget extraction - ONLY with explicit units**
  extractExactBudget(query) {
    console.log('💰 Extracting budget from:', query);
    
    const budgetPatterns = [
      // **FIX: Require explicit units for ALL patterns**
      /(?:under|below|less than|upto|within|max|maximum)\s*₹?\s*(\d+(?:\.\d+)?)\s*(lakh|lac|cr|crore)\b/i,
      /₹?\s*(\d+(?:\.\d+)?)\s*(lakh|lac|cr|crore)\b/i,
      /budget\s*₹?\s*(\d+(?:\.\d+)?)\s*(lakh|lac|cr|crore)\b/i,
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

    console.log('❌ No valid budget found (missing explicit unit)');
    return null;
  }

  // Extract localities from query
  extractLocalities(query) {
    const commonLocalities = [
      'hinjewadi', 'wakad', 'kharadi', 'viman nagar', 'baner', 'aundh',
      'koregaon park', 'kalyani nagar', 'model colony', 'shivajinagar',
      'hadapsar', 'magarpatta', 'yerwada', 'katraj', 'dadar', 'bandra',
      'andheri', 'powai', 'chembur', 'ghatkopar', 'lower parel', 'worli'
    ];

    return commonLocalities.filter(locality => 
      query.includes(locality)
    );
  }

  // Extract OR conditions from query
  extractOrConditions(query) {
    const orPatterns = [
      /(\w+)\s+or\s+(\w+)/gi,
      /(\w+)\s*\/\s*(\w+)/gi
    ];

    const conditions = {};

    orPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(query)) !== null) {
        const [fullMatch, option1, option2] = match;
        
        if (this.supportedCities.includes(option1) && this.supportedCities.includes(option2)) {
          conditions.cities = [option1, option2];
        }
        
        if (this.supportedBHKs.includes(option1) && this.supportedBHKs.includes(option2)) {
          conditions.bhks = [option1, option2];
        }
      }
    });

    return Object.keys(conditions).length > 0 ? conditions : null;
  }

  // Identify missing filters for vague queries
  identifyMissingFilters(query, hasPropertyIntent, hasBHKIntent, hasBudgetIntent) {
    const missing = [];

    if (!hasBHKIntent) missing.push('BHK configuration');
    if (!hasBudgetIntent) missing.push('budget range');
    if (!this.extractExactCity(query)) missing.push('city/location');

    return missing;
  }

  // Detect multiple queries in one message
  hasMultipleQueries(query) {
    const multipleQueryIndicators = [
      /(?:and|&)\s*(?:2|3)bhk/i,
      /pune\s+(?:and|&)\s+mumbai/i,
      /show\s+.*\s+and\s+.*/i
    ];

    return multipleQueryIndicators.some(pattern => pattern.test(query));
  }

  // Check if query is too vague
  isTooVagueQuery(query, hasPropertyIntent, hasBHKIntent, hasBudgetIntent) {
    const hasOnlyCity = (query.includes('pune') || query.includes('mumbai')) && 
                       !hasPropertyIntent && !hasBHKIntent && !hasBudgetIntent;
    
    const onlySingleNumber = /^\d+$/.test(query.trim());
    
    const locationOnly = this.isLocationOnlyQuery(query);
    
    return hasOnlyCity || onlySingleNumber || locationOnly;
  }

  // Check if query contains only location names
  isLocationOnlyQuery(query) {
    const locationKeywords = [
      'pune', 'mumbai', 'hinjewadi', 'wakad', 'kharadi', 'viman nagar',
      'baner', 'aundh', 'koregaon park', 'kalyani nagar', 'model colony',
      'shivajinagar', 'hadapsar', 'magarpatta', 'yerwada', 'katraj',
      'dadar', 'bandra', 'andheri', 'powai', 'chembur', 'ghatkopar'
    ];
    
    const words = query.split(/\s+/);
    const hasLocation = words.some(word => locationKeywords.includes(word));
    const hasOnlyLocation = words.every(word => 
      locationKeywords.includes(word) || 
      ['in', 'at', 'near', 'around', 'location', 'area'].includes(word)
    );
    
    return hasLocation && hasOnlyLocation;
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

  // Method to handle BHK range searches
  shouldExpandBHKSearch(filters) {
    return filters.hasMultipleBHK && filters.bhkRange;
  }

  // Get all BHKs to search for
  getBHKsToSearch(filters) {
    if (filters.bhkRange && filters.bhkRange.isRange) {
      return filters.bhkRange.values;
    }
    return filters.bhk ? [filters.bhk] : [];
  }

  // ENHANCED: Generate appropriate response for all edge cases
  getIrrelevantResponse(query, filters = {}) {
    // Invalid BHK numbers (0, negative, etc.)
    if (filters.invalidBHK) {
      const availableBHKs = this.getAvailableBHKsForDisplay();
      return `I only handle properties with ${availableBHKs.join(', ')} configurations. ${filters.invalidBHK}BHK is not a valid configuration. Please search for available BHK types.`;
    }

    // Unsupported BHK numbers
    if (filters.unsupportedBHK) {
      const availableBHKs = filters.availableBHKs || this.getAvailableBHKsForDisplay();
      return `I only handle properties with ${availableBHKs.join(', ')} configurations. ${filters.unsupportedBHK}BHK is not available in our database. Please search for available BHK types.`;
    }

    // Unsupported cities
    if (filters.unsupportedCity) {
      return `I specialize only in properties in Pune and Mumbai. I don't have information about properties in ${filters.detectedCity}. Would you like to search for properties in Pune or Mumbai instead?`;
    }

    // Ambiguous budget
    if (filters.needsBudgetClarification && filters.ambiguousBudget) {
      const { amount, likelyUnit } = filters.ambiguousBudget;
      return `I see you mentioned a budget of ${amount}, but you didn't specify the unit. Did you mean ${amount} ${likelyUnit}? Please specify the unit (Lakh or Cr) for accurate results, like "under ${amount} ${likelyUnit}".`;
    }

    // Vague queries with specific guidance
    if (filters.vagueQuery) {
      const missing = filters.missingFilters || [];
      const availableBHKs = this.getAvailableBHKsForDisplay();
      
      if (missing.length > 0) {
        return `To help you find the perfect property, I need more details about ${missing.join(' and ')}. Try something like: "2BHK flats in Pune under 80 Lakh" or "Ready to move 3BHK in Mumbai". Available BHKs: ${availableBHKs.join(', ')}`;
      }
      
      return `I'd love to help you find properties! Available configurations: ${availableBHKs.join(', ')}. Try: "2BHK flats in Pune under 80 Lakh" or "Ready to move 3BHK in Mumbai".`;
    }

    // Multiple queries
    if (filters.multipleQueries) {
      const availableBHKs = this.getAvailableBHKsForDisplay();
      return `I can handle one search at a time to give you the best results. Available BHKs: ${availableBHKs.join(', ')}. Please try one search query, like '2BHK in Pune' or '3BHK in Mumbai under 1.2 Cr'.`;
    }

    // Clearly irrelevant queries
    if (filters.queryType === 'irrelevant') {
      const availableBHKs = this.getAvailableBHKsForDisplay();
      const irrelevantResponses = [
        `I'm your specialized property assistant for Pune and Mumbai! Available BHKs: ${availableBHKs.join(', ')}. I'm here to help you find your dream home.`,
        `I live and breathe Pune and Mumbai properties! Available configurations: ${availableBHKs.join(', ')}. Try: '2BHK under ₹80 Lakh' or 'Ready to move flats in Mumbai'.`,
        `As your dedicated property search assistant, I'm focused on helping you find homes in Pune and Mumbai. Available BHKs: ${availableBHKs.join(', ')}.`
      ];
      return irrelevantResponses[Math.floor(Math.random() * irrelevantResponses.length)];
    }

    // General fallback
    const availableBHKs = this.getAvailableBHKsForDisplay();
    return `I'm here to help you find properties in Pune and Mumbai. Available BHK configurations: ${availableBHKs.join(', ')}. Please ask me about available flats, BHK configurations, budgets, or locations!`;
  }

  shouldProcessQuery(filters) {
    return filters.isRelevant !== false;
  }
}

// Create instance and export properly
const queryParser = new QueryParser();
module.exports = queryParser;