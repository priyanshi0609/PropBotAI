const express = require('express');
const { csvParser } = require('../utils/csvParser');
const { queryParser } = require('../utils/queryParser');
const { searchEngine } = require('../utils/searchEngine');

const router = express.Router();

// Initialize data loading
let dataLoaded = false;

const initializeData = async () => {
  try {
    console.log('🔄 Initializing CSV data...');
    await csvParser.loadAllData();
    dataLoaded = true;
    console.log('✅ Data initialization complete');
  } catch (error) {
    console.error('❌ Data initialization failed:', error);
  }
};

// Start data loading
initializeData();

router.post('/message', async (req, res) => {
  try {
    // Check if data is loaded
    if (!dataLoaded) {
      return res.status(503).json({
        success: false,
        error: 'Service initializing',
        message: 'Property data is still loading. Please try again in a few seconds.'
      });
    }

    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false,
        error: 'Message is required' 
      });
    }

    console.log('\n📨 ========================================');
    console.log('📨 Received message:', message);
    console.log('📨 ========================================\n');

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

    // Search properties with EXACT filtering
    const results = searchEngine.search(filters);
    console.log(`\n🎯 FINAL RESULTS: ${results.length} properties found\n`);
    
    // Generate summary
    const summary = searchEngine.generateSummary(results, filters);
    
    // Format property cards according to requirements
    const propertyCards = searchEngine.formatPropertyCards(results);

    res.json({
      success: true,
      summary,
      properties: propertyCards,
      filtersUsed: filters,
      resultsCount: results.length
    });

  } catch (error) {
    console.error('💥 Chat error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      summary: 'Sorry, I encountered an error while processing your request.'
    });
  }
});

// Test endpoint to verify the route is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Chat API is working!',
    dataLoaded: dataLoaded,
    timestamp: new Date().toISOString(),
    example: {
      method: 'POST',
      url: '/api/chat/message',
      body: {
        message: '2BHK in Pune under 80 Lakh'
      }
    }
  });
});

// Health check for chat route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Chat route is healthy',
    dataLoaded: dataLoaded,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;