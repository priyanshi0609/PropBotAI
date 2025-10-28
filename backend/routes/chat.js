import express from 'express';
import { csvParser } from '../utils/csvParser.js';
import { queryParser } from '../utils/queryParser.js';
import { searchEngine } from '../utils/searchEngine.js';

const router = express.Router();

// Initialize data loading
csvParser.loadAllData().catch(console.error);

router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Parse user query
    const filters = queryParser.parse(message);
    
    // Search properties
    const results = searchEngine.search(filters);
    
    // Generate summary
    const summary = searchEngine.generateSummary(results, filters);
    
    // Format property cards
    const propertyCards = searchEngine.formatPropertyCards(results);

    res.json({
      success: true,
      summary,
      properties: propertyCards,
      filtersUsed: filters,
      resultsCount: results.length
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      summary: 'Sorry, I encountered an error while processing your request.'
    });
  }
});

export default router;