const express = require('express');
const { csvParser } = require('../utils/csvParser');
const { queryParser } = require('../utils/queryParser');
const { searchEngine } = require('../utils/searchEngine');

const router = express.Router();

// Initialize data loading
csvParser.loadAllData().catch(console.error);

router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Received message:', message);

    // Parse user query
    const filters = queryParser.parse(message);
    
    // Check if query is relevant
    if (!queryParser.shouldProcessQuery(filters)) {
      return res.json({
        success: true,
        summary: queryParser.getIrrelevantResponse(message),
        properties: [],
        filtersUsed: filters,
        resultsCount: 0,
        isIrrelevant: true
      });
    }

    // Search properties
    const results = searchEngine.search(filters);
    console.log('Search results:', results.length);
    
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
      error: error.message,
      summary: 'Sorry, I encountered an error while processing your request.'
    });
  }
});

module.exports = router;