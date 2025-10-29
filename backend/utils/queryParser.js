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
      'search', 'looking', 'need', 'want', 'show', 'list'
    ];

    const hasPropertyIntent = propertyKeywords.some(keyword => 
      cleanQuery.includes(keyword)
    );

    const hasCityIntent = cleanQuery.includes('pune') || cleanQuery.includes('mumbai');
    const hasBudgetIntent = cleanQuery.includes('₹') || cleanQuery.includes('under') || 
                          cleanQuery.includes('lakh') || cleanQuery.includes('cr') || 
                          cleanQuery.includes('crore') || cleanQuery.match(/\d+\s*(lakh|cr|crore)/i);

    // If no clear property intent and no city/budget, mark as irrelevant
    if (!hasPropertyIntent && !hasCityIntent && !hasBudgetIntent) {
      filters.isRelevant = false;
      return filters;
    }

    filters.isRelevant = true;

    // Extract BHK with exact matching
    const bhkPatterns = [
      /(\d+(?:\.\d+)?)\s*bhk\b/i,
      /(\d+(?:\.\d+)?)\s*bedroom\b/i,
      /(\d+(?:\.\d+)?)\s*bed\b/i,
      /bhk\s*(\d+(?:\.\d+)?)/i,
      /\b(\d+(?:\.\d+)?)\s*bhk/i
    ];

    for (const pattern of bhkPatterns) {
      const match = cleanQuery.match(pattern);
      if (match) {
        filters.bhk = match[1];
        console.log(`Found BHK: ${filters.bhk}`);
        break;
      }
    }

    // Extract city with exact matching
    if (cleanQuery.includes('pune') && !cleanQuery.includes('mumbai')) {
      filters.city = 'pune';
    } else if (cleanQuery.includes('mumbai') && !cleanQuery.includes('pune')) {
      filters.city = 'mumbai';
    } else if (cleanQuery.includes('pune') && cleanQuery.includes('mumbai')) {
      filters.city = 'both'; // Handle both cities case
    }

    // Extract budget with better patterns
    const budgetPatterns = [
      /(?:under|below|less than|upto|within)\s*₹?\s*(\d+(?:\.\d+)?)\s*(cr|lakh|lac|crore|lak)\b/i,
      /₹?\s*(\d+(?:\.\d+)?)\s*(cr|lakh|lac|crore)\b/i,
      /(\d+(?:\.\d+)?)\s*(lakh|lac)\s*(?:and|\/|or)\s*above/i,
      /budget\s*₹?\s*(\d+(?:\.\d+)?)\s*(cr|lakh|lac)/i,
      /\b(\d+(?:\.\d+)?)\s*(lakh|lac|cr|crore)\b/i
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
        console.log(`Found budget: ${amount} ${unit} -> ${filters.maxPrice}`);
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
               cleanQuery.includes('apartment') || cleanQuery.includes('house')) {
      filters.propertyType = 'RESIDENTIAL';
    }

    console.log('Final filters:', filters);
    return filters;
  }

  // Helper to check if query should be processed
  shouldProcessQuery(filters) {
    return filters.isRelevant !== false;
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