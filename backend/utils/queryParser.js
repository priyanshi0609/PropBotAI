import nlp from 'compromise';
import compromiseNumbers from 'compromise-numbers';
nlp.extend(compromiseNumbers);

export class QueryParser {
  parse(query) {
    const doc = nlp(query.toLowerCase());
    const filters = {};

    // Extract BHK
    const bhkMatch = query.match(/(\d+(?:\.\d+)?)\s*BHK/i) || query.match(/(\d+(?:\.\d+)?)\s*bhk/i);
    if (bhkMatch) {
      filters.bhk = bhkMatch[1];
    }

    // Extract city
    const cities = ['pune', 'mumbai'];
    const cityMatch = cities.find(city => query.toLowerCase().includes(city));
    if (cityMatch) {
      filters.city = cityMatch;
    }

    // Extract budget
    const budgetMatch = query.match(/(?:under|below|less than|upto|under)\s*₹?\s*(\d+(?:\.\d+)?)\s*(cr|lakh|lac|crore)/i) ||
                       query.match(/₹?\s*(\d+(?:\.\d+)?)\s*(cr|lakh|lac|crore)/i);
    
    if (budgetMatch) {
      const amount = parseFloat(budgetMatch[1]);
      const unit = budgetMatch[2].toLowerCase();
      filters.maxPrice = unit.includes('cr') ? amount * 10000000 : amount * 100000;
    }

    // Extract property type
    if (query.includes('flat') || query.includes('apartment')) {
      filters.propertyType = 'RESIDENTIAL';
    }

    // Extract status
    if (query.includes('ready') || query.includes('possession')) {
      filters.status = 'READY_TO_MOVE';
    } else if (query.includes('under construction')) {
      filters.status = 'UNDER_CONSTRUCTION';
    }

    return filters;
  }
}

export const queryParser = new QueryParser();