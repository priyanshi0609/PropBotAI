const nlp = require('compromise');
const compromiseNumbers = require('compromise-numbers');
nlp.extend(compromiseNumbers);

class QueryParser {
  parse(query) {
    const cleanQuery = query.toLowerCase().trim();
    const filters = {};
    
    console.log('Parsing query:', cleanQuery);

    // Check if query is relevant to property search
    const propertyKeywords = [
      'bhk', 'flat', 'apartment', 'house', 'property', 'properties',
      'home', 'residential', 'commercial', 'buy', 'purchase', 'find',
      'search', 'looking', 'need', 'want'
    ];

    const hasPropertyIntent = propertyKeywords.some(keyword => 
      cleanQuery.includes(keyword)
    );

    const hasCityIntent = cleanQuery.includes('pune') || cleanQuery.includes('mumbai');
    const hasBudgetIntent = cleanQuery.includes('₹') || cleanQuery.includes('under') || 
                          cleanQuery.includes('lakh') || cleanQuery.includes('cr') || 
                          cleanQuery.includes('crore');

    // If no clear property intent and no city/budget, mark as irrelevant
    if (!hasPropertyIntent && !hasCityIntent && !hasBudgetIntent) {
      filters.isRelevant = false;
      return filters;
    }

    filters.isRelevant = true;

    // Extract BHK with better pattern matching
    const bhkPatterns = [
      /(\d+(?:\.\d+)?)\s*bhk/i,
      /(\d+(?:\.\d+)?)\s*bedroom/i,
      /(\d+(?:\.\d+)?)\s*bed/i,
      /bhk\s*(\d+(?:\.\d+)?)/i
    ];

    for (const pattern of bhkPatterns) {
      const match = cleanQuery.match(pattern);
      if (match) {
        filters.bhk = match[1];
        break;
      }
    }

    // Extract city with better matching
    if (cleanQuery.includes('pune')) {
      filters.city = 'pune';
    } else if (cleanQuery.includes('mumbai')) {
      filters.city = 'mumbai';
    }

    // Extract budget with better patterns
    const budgetPatterns = [
      /(?:under|below|less than|upto|within)\s*₹?\s*(\d+(?:\.\d+)?)\s*(cr|lakh|lac|crore|lak)/i,
      /₹?\s*(\d+(?:\.\d+)?)\s*(cr|lakh|lac|crore)/i,
      /(\d+(?:\.\d+)?)\s*(lakh|lac)\s*(?:and|\/|or)\s*above/i,
      /budget\s*₹?\s*(\d+(?:\.\d+)?)\s*(cr|lakh|lac)/i
    ];

    for (const pattern of budgetPatterns) {
      const match = cleanQuery.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        
        if (unit.includes('cr') || unit.includes('crore')) {
          filters.maxPrice = amount * 10000000;
        } else if (unit.includes('lakh') || unit.includes('lac')) {
          filters.maxPrice = amount * 100000;
        }
        break;
      }
    }

    // Extract property status
    if (cleanQuery.includes('ready') || cleanQuery.includes('possession') || 
        cleanQuery.includes('move in') || cleanQuery.includes('rtm')) {
      filters.status = 'READY_TO_MOVE';
    } else if (cleanQuery.includes('under construction') || cleanQuery.includes('ongoing')) {
      filters.status = 'UNDER_CONSTRUCTION';
    }

    // Extract property type
    if (cleanQuery.includes('commercial') || cleanQuery.includes('office') || 
        cleanQuery.includes('shop')) {
      filters.propertyType = 'COMMERCIAL';
    } else if (cleanQuery.includes('residential') || cleanQuery.includes('flat') || 
               cleanQuery.includes('apartment')) {
      filters.propertyType = 'RESIDENTIAL';
    }

    console.log('Final filters:', filters);
    return filters;
  }

  // Helper to check if query should be processed
  shouldProcessQuery(filters) {
    return filters.isRelevant !== false && 
           (filters.city || filters.bhk || filters.maxPrice || filters.status);
  }

  // Generate appropriate response for irrelevant queries
getIrrelevantResponse(query) {
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