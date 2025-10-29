class QueryParser {
  parse(query) {
    const cleanQuery = query.toLowerCase().trim();
    const filters = {};
    
    console.log('🔍 Parsing query:', cleanQuery);

    // Enhanced property intent detection with better coverage
    const propertyKeywords = [
      'bhk', 'flat', 'apartment', 'house', 'property', 'properties',
      'home', 'residential', 'commercial', 'buy', 'purchase', 'find',
      'search', 'looking', 'need', 'want', 'show', 'list', 'room',
      'residence', 'unit', 'accommodation', 'living space', 'plot',
      'villa', 'builder', 'construction', 'possession', 'sale',
      'rent', 'lease', 'investment', 'real estate', 'broker', 'agent'
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

    // Enhanced irrelevant query detection
    if (!hasPropertyIntent && !hasCityIntent && !hasBudgetIntent) {
      // Check for common non-property queries
      if (this.isClearlyNonPropertyQuery(cleanQuery)) {
        filters.isRelevant = false;
        filters.queryType = 'non-property';
        return filters;
      }
      
      // Check for greetings and casual conversation
      if (this.isCasualGreeting(cleanQuery)) {
        filters.isRelevant = false;
        filters.queryType = 'greeting';
        return filters;
      }
      
      // Check for technical/other questions
      if (this.isTechnicalQuery(cleanQuery)) {
        filters.isRelevant = false;
        filters.queryType = 'technical';
        return filters;
      }
    }

    filters.isRelevant = true;

    // EXACT BHK Matching - ULTRA ACCURATE LOGIC
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

  // Enhanced irrelevant query detection
  isClearlyNonPropertyQuery(query) {
    const nonPropertyPatterns = [
      /(weather|temperature|forecast)/i,
      /(news|headlines|update)/i,
      /(joke|funny|humor)/i,
      /(time|date|day)/i,
      /(calculate|math|addition)/i,
      /(movie|film|entertainment)/i,
      /(sport|game|player)/i,
      /(music|song|artist)/i,
      /(food|restaurant|recipe)/i,
      /(travel|tourist|hotel)/i,
      /(health|doctor|medical)/i,
      /(education|school|college)/i,
      /(politics|government|election)/i,
      /(technology|computer|software)/i,
      /(who is|what is|when is)/i,
      /(how to|why should|where can)/i
    ];
    
    return nonPropertyPatterns.some(pattern => pattern.test(query));
  }

  // Detect casual greetings and conversation
  isCasualGreeting(query) {
    const greetingPatterns = [
      /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/i,
      /^(how are you|how do you do|what's up|sup)/i,
      /^(thank you|thanks|appreciate)/i,
      /^(bye|goodbye|see you|farewell)/i,
      /^(yes|no|maybe|ok|okay)/i,
      /^(your name|who are you|what are you)/i
    ];
    
    return greetingPatterns.some(pattern => pattern.test(query));
  }

  // Detect technical or other non-property questions
  isTechnicalQuery(query) {
    const technicalPatterns = [
      /(how.*work|how.*built|how.*made)/i,
      /(what.*language|what.*technology)/i,
      /(api|endpoint|server|database)/i,
      /(code|programming|developer)/i,
      /(bug|error|issue|problem)/i,
      /(feature|update|upgrade)/i
    ];
    
    return technicalPatterns.some(pattern => pattern.test(query));
  }

  // ULTRA ACCURATE BHK extraction - FIXED ALL EDGE CASES
  extractExactBHK(query) {
    console.log('🛏️ Extracting BHK from:', query);
    
    // Remove common false positives and normalize the query
    const normalizedQuery = query
      .replace(/[.,]/g, ' ') // Replace punctuation with spaces
      .replace(/\s+/g, ' ') // Normalize multiple spaces
      .trim();

    console.log('📝 Normalized query:', normalizedQuery);

    // STRICT BHK patterns - only match when BHK is explicitly mentioned
    const strictBhkPatterns = [
      // Pattern: "2 bhk" (with word boundaries)
      /\b(\d)\s*bhk\b/i,
      
      // Pattern: "2bhk" (no space)
      /\b(\d)bhk\b/i,
      
      // Pattern: "2 bedroom" 
      /\b(\d)\s*bedroom\b/i,
      
      // Pattern: "2 bed" 
      /\b(\d)\s*bed\b/i,
      
      // Pattern: "2 b h k"
      /\b(\d)\s*b\s*h\s*k\b/i,
      
      // Pattern: "2 b r"
      /\b(\d)\s*b\s*r\b/i,
      
      // Pattern: "2 rk"
      /\b(\d)\s*rk\b/i,

      // Pattern: "2 b.h.k" or "2 b.h.k."
      /\b(\d)\s*b\s*\.\s*h\s*\.\s*k\b/i,

      // Pattern: "2 b/h/k" or "2 b/r"
      /\b(\d)\s*b\s*\/\s*[hr]\s*\/?\s*k?\b/i,

      // Pattern: "2 bhk flat" - ensure it's not part of another word
      /\b(\d)\s*bhk\s+(?:flat|apartment|house|property)\b/i,

      // Pattern: "flat with 2 bhk"
      /\b(?:flat|apartment|house|property)\s+(?:with|of)\s+(\d)\s*bhk\b/i,
    ];

    for (const pattern of strictBhkPatterns) {
      const match = normalizedQuery.match(pattern);
      if (match) {
        const bhk = match[1];
        if (['1', '2', '3'].includes(bhk)) {
          console.log(`✅ Found STRICT BHK with pattern: ${bhk}BHK`);
          return bhk;
        }
      }
    }

    // Handle word numbers with strict context
    const wordPatterns = [
      { pattern: /\b(one)\s*bhk\b/i, number: '1' },
      { pattern: /\b(two)\s*bhk\b/i, number: '2' },
      { pattern: /\b(three)\s*bhk\b/i, number: '3' },
      { pattern: /\b(one)\s*bedroom\b/i, number: '1' },
      { pattern: /\b(two)\s*bedroom\b/i, number: '2' },
      { pattern: /\b(three)\s*bedroom\b/i, number: '3' },
      { pattern: /\b(1)\s*bhk\b/i, number: '1' },
      { pattern: /\b(2)\s*bhk\b/i, number: '2' },
      { pattern: /\b(3)\s*bhk\b/i, number: '3' }
    ];

    for (const { pattern, number } of wordPatterns) {
      const match = normalizedQuery.match(pattern);
      if (match) {
        console.log(`✅ Found WORD BHK: ${number}BHK`);
        return number;
      }
    }

    // Handle positional patterns with context
    const positionalPatterns = [
      /bhk\s+(\d)\b/i,
      /bedroom\s+(\d)\b/i,
      /bed\s+(\d)\b/i,
      /rk\s+(\d)\b/i
    ];

    for (const pattern of positionalPatterns) {
      const match = normalizedQuery.match(pattern);
      if (match && ['1', '2', '3'].includes(match[1])) {
        // Verify this is in property context
        const context = normalizedQuery.substring(0, match.index);
        if (this.isPropertyContext(context)) {
          console.log(`✅ Found POSITIONAL BHK with context: ${match[1]}BHK`);
          return match[1];
        }
      }
    }

    // Handle "X BHK" at the beginning of query
    const startPattern = /^(\d)\s*bhk/i;
    const startMatch = normalizedQuery.match(startPattern);
    if (startMatch && ['1', '2', '3'].includes(startMatch[1])) {
      console.log(`✅ Found STARTING BHK: ${startMatch[1]}BHK`);
      return startMatch[1];
    }

    // Handle queries like "I want 2 bhk" with number before BHK context
    const wantPattern = /(?:want|need|looking for|searching for|find)\s+(\d)\s*(?:bhk|bedroom|bed)/i;
    const wantMatch = normalizedQuery.match(wantPattern);
    if (wantMatch && ['1', '2', '3'].includes(wantMatch[1])) {
      console.log(`✅ Found INTENT BHK: ${wantMatch[1]}BHK`);
      return wantMatch[1];
    }

    // Handle range queries like "2-3 bhk" - take the first number
    const rangePattern = /(\d)\s*[-–]\s*(\d)\s*bhk/i;
    const rangeMatch = normalizedQuery.match(rangePattern);
    if (rangeMatch && ['1', '2', '3'].includes(rangeMatch[1])) {
      console.log(`✅ Found RANGE BHK (taking first): ${rangeMatch[1]}BHK`);
      return rangeMatch[1];
    }

    // FINAL FALLBACK: Only extract standalone numbers in VERY clear property context
    if (this.isVeryClearPropertyQuery(normalizedQuery)) {
      const standalonePatterns = [
        /\b(\d)\s+(?:bhk|bedroom|bed|room)\b/i,
        /\b(?:bhk|bedroom|bed|room)\s+(\d)\b/i,
        /\b(\d)(?:\s*)?(?:bhk|bedroom|bed)\b/i
      ];

      for (const pattern of standalonePatterns) {
        const match = normalizedQuery.match(pattern);
        if (match && ['1', '2', '3'].includes(match[1])) {
          console.log(`✅ Found FALLBACK BHK: ${match[1]}BHK`);
          return match[1];
        }
      }
    }

    console.log('❌ No BHK found - query too ambiguous');
    return null;
  }

  // Strict property context check
  isPropertyContext(text) {
    const propertyIndicators = [
      'flat', 'apartment', 'house', 'property', 'home', 'residence',
      'pune', 'mumbai', 'buy', 'rent', 'looking', 'searching', 'want',
      'need', 'find', 'show', 'list'
    ];
    return propertyIndicators.some(indicator => 
      text.includes(indicator)
    );
  }

  // Very strict property query detection for fallback
  isVeryClearPropertyQuery(query) {
    const clearPropertyPatterns = [
      /(?:flat|apartment|house|property).*(?:\d\s*bhk|\d\s*bedroom)/i,
      /(?:\d\s*bhk|\d\s*bedroom).*(?:flat|apartment|house|property)/i,
      /(?:looking|searching|want|need).*(?:\d\s*bhk|\d\s*bedroom)/i,
      /(?:pune|mumbai).*(?:\d\s*bhk|\d\s*bedroom)/i,
      /(?:\d\s*bhk|\d\s*bedroom).*(?:pune|mumbai)/i
    ];

    return clearPropertyPatterns.some(pattern => pattern.test(query));
  }

  // Helper to check if this is clearly a property query
  isPropertyQuery(query) {
    const propertyContext = [
      'flat', 'apartment', 'house', 'property', 'home',
      'pune', 'mumbai', 'lakh', 'cr', 'crore', 'budget',
      'ready', 'construction', 'possession', 'buy', 'rent'
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
      'ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur',
      'noida', 'gurgaon', 'faridabad', 'ghaziabad', 'indore',
      'bhopal', 'nagpur', 'kochi', 'coimbatore', 'visakhapatnam'
    ];
    return unsupportedCities.some(city => query.includes(city));
  }

  // ADD THIS MISSING FUNCTION - FIXES THE ERROR
  shouldProcessQuery(filters) {
    return filters.isRelevant !== false;
  }

  // ENHANCED: Generate appropriate response for irrelevant queries
  getIrrelevantResponse(query, filters = {}) {
    if (filters.unsupportedCity) {
      const otherCityResponses = [
        "I specialize only in properties in Pune and Mumbai. While I can't help with properties in other cities, I'd be happy to assist you with finding the perfect home in Pune or Mumbai!",
        "My expertise is focused on the Pune and Mumbai property markets. I don't have information about other cities, but I can help you explore great options in Pune or Mumbai.",
        "I'm your dedicated assistant for Pune and Mumbai properties. For other cities, you might want to check local real estate portals. Meanwhile, I can show you some amazing properties in Pune or Mumbai!"
      ];
      return otherCityResponses[Math.floor(Math.random() * otherCityResponses.length)];
    }

    // Handle different types of irrelevant queries
    if (filters.queryType === 'greeting') {
      const greetingResponses = [
        "Hello! I'm your PropBot AI assistant specializing in Pune and Mumbai properties. How can I help you find your dream home today?",
        "Hi there! I'm here to help you discover the perfect property in Pune or Mumbai. What are you looking for?",
        "Welcome! I specialize in property search across Pune and Mumbai. Feel free to ask me about flats, budgets, or locations!"
      ];
      return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
    }

    if (filters.queryType === 'technical') {
      const technicalResponses = [
        "I'm focused on helping you find properties in Pune and Mumbai. For technical questions about how I work, please contact our support team!",
        "As a property search assistant, I specialize in finding homes in Pune and Mumbai. For technical inquiries, our engineering team would be happy to help!",
        "I'm here to assist with your property search in Pune and Mumbai. For technical details about the platform, please reach out to our support team."
      ];
      return technicalResponses[Math.floor(Math.random() * technicalResponses.length)];
    }

    // General irrelevant queries
    const generalResponses = [
      "I'm your intelligent property assistant for Pune and Mumbai! I specialize in helping you find flats, apartments, and homes in these cities. Try asking me about specific BHK requirements, budgets, or locations within Pune or Mumbai.",
      "I live and breathe Pune and Mumbai properties! While I don't have expertise in other topics, I'd love to help you find your dream home. Try: '2BHK under ₹80 Lakh in Pune' or 'Ready to move flats in Mumbai'.",
      "As your dedicated property search assistant for Pune and Mumbai, I'm here to help you find the perfect home. Ask me about BHK configurations, budgets, locations, or property status in these cities!",
      "I'm specialized in Pune and Mumbai real estate. Let me help you navigate the property market in these cities! You can ask about flats, budgets, locations, or specific requirements like '3BHK ready to move in Hinjewadi'.",
      "Welcome to your Pune-Mumbai property expert! I'm here to make your property search easy. Try queries like 'Properties under ₹1 Cr', '2BHK in Kharadi', or 'Ready to move apartments in Andheri'."
    ];
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }
}

// Create instance and export properly
const queryParser = new QueryParser();

module.exports = queryParser;