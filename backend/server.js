const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chat');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
const corsOptions = {
  origin: [
    'https://propbotai-production.up.railway.app',
    'https://propbot-ai.vercel.app',
    'https://*.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests
app.options('*', cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log(`Origin: ${req.headers.origin}`);
  next();
});

// Routes
app.use('/api/chat', chatRoutes);

// Base /api/chat endpoint handler
app.get('/api/chat', (req, res) => {
  res.json({
    success: true,
    message: 'PropBot AI Chat API',
    available_endpoints: {
      message: 'POST /api/chat/message - Send chat messages',
      test: 'GET /api/chat/test - Test endpoint'
    },
    usage: 'Send POST requests to /api/chat/message with { "message": "your query" }',
    examples: [
      '2BHK in Pune under 80 Lakh',
      '3BHK flats in Mumbai under 1.2 Cr',
      'Ready to move 1BHK in Pune'
    ],
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PropBot AI API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    base_url: 'https://propbotai-production.up.railway.app'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'PropBot AI API',
    version: '1.0.0',
    description: 'Intelligent Property Search API for Pune and Mumbai',
    base_url: 'https://propbotai-production.up.railway.app',
    cors: {
      enabled: true,
      allowed_origins: [
        'https://propbotai-production.up.railway.app',
        'https://propbot-ai.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173'
      ]
    },
    endpoints: {
      root: '/',
      health: '/health',
      api_info: '/api',
      chat: '/api/chat/message',
      chat_base: '/api/chat',
      chat_test: '/api/chat/test',
      docs: '/api-docs'
    }
  });
});

// Swagger documentation
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'PropBot AI API',
    description: 'Intelligent Property Search API for Pune and Mumbai. This API processes natural language property search queries and returns matching properties with detailed information.',
    version: '1.0.0',
    contact: {
      name: 'API Support',
      email: 'support@propbot.ai'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'https://propbotai-production.up.railway.app',
      description: 'Production server'
    },
    {
      url: `http://localhost:${PORT}`,
      description: 'Development server'
    }
  ],
  paths: {
    '/api/chat/message': {
      post: {
        summary: 'Send a property search query',
        description: 'Process natural language property search queries and return matching properties from Pune and Mumbai with exact filtering for BHK, budget, location, and status.',
        tags: ['Chat'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: {
                    type: 'string',
                    example: '2BHK flats in Pune under 80 Lakh',
                    description: 'Natural language property search query. Supports BHK, budget, city, and status filters.'
                  }
                }
              },
              examples: {
                basicSearch: {
                  summary: 'Basic property search',
                  value: {
                    message: '2BHK in Pune under 80 Lakh'
                  }
                },
                readyToMove: {
                  summary: 'Ready to move properties',
                  value: {
                    message: 'Ready to move 3BHK in Mumbai under 1.2 Cr'
                  }
                },
                underConstruction: {
                  summary: 'Under construction properties',
                  value: {
                    message: 'Under construction 1BHK in Pune'
                  }
                },
                budgetOnly: {
                  summary: 'Budget only search',
                  value: {
                    message: 'Properties under 1 Cr in Mumbai'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Successful response with exact property matches',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    summary: {
                      type: 'string',
                      example: 'Found 3 2BHK properties in Pune under ₹80 Lakh. 2 are ready to move and 1 is under construction. Popular areas include Model Colony, Shivajinagar.',
                      description: 'AI-generated summary of search results'
                    },
                    properties: {
                      type: 'array',
                      description: 'List of matching properties with exact filters applied',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                            example: 'cmf5r6hv20005vxpt3yfnl2qp',
                            description: 'Unique property identifier'
                          },
                          title: {
                            type: 'string',
                            example: 'Pristine02',
                            description: 'Property title/name'
                          },
                          city: {
                            type: 'string',
                            example: 'Pune',
                            description: 'City where property is located'
                          },
                          locality: {
                            type: 'string',
                            example: 'Model Colony',
                            description: 'Locality/area within the city'
                          },
                          bhk: {
                            type: 'string',
                            example: '2BHK',
                            description: 'Exact BHK configuration'
                          },
                          price: {
                            type: 'string',
                            example: '₹80 L',
                            description: 'Formatted price (₹X Cr / ₹X L)'
                          },
                          projectName: {
                            type: 'string',
                            example: 'Pristine02',
                            description: 'Name of the project'
                          },
                          status: {
                            type: 'string',
                            example: 'Ready',
                            enum: ['Ready', 'Under Construction', 'Unknown'],
                            description: 'Possession status'
                          },
                          amenities: {
                            type: 'array',
                            items: {
                              type: 'string'
                            },
                            example: ['Parking', 'Lift', 'Security'],
                            description: 'Top 2-3 amenities'
                          },
                          ctaUrl: {
                            type: 'string',
                            example: '/project/pristine02-modelcolony-shivajinagar-pune-428955',
                            description: 'Call-to-action URL for property details'
                          },
                          carpetArea: {
                            type: 'string',
                            example: '188.73 sq.ft',
                            description: 'Carpet area of the property'
                          },
                          bathrooms: {
                            type: 'string',
                            example: '2',
                            description: 'Number of bathrooms'
                          }
                        }
                      }
                    },
                    filtersUsed: {
                      type: 'object',
                      description: 'Filters extracted from the query',
                      example: {
                        bhk: '2',
                        city: 'pune',
                        maxPrice: 8000000,
                        status: 'READY_TO_MOVE'
                      }
                    },
                    resultsCount: {
                      type: 'integer',
                      example: 3,
                      description: 'Number of properties found'
                    }
                  }
                },
                examples: {
                  success: {
                    summary: 'Successful property search',
                    value: {
                      success: true,
                      summary: 'Found 3 2BHK properties in Pune under ₹80 Lakh. 2 are ready to move and 1 is under construction. Popular areas include Model Colony, Shivajinagar.',
                      properties: [
                        {
                          id: 'cmf5r6hv20005vxpt3yfnl2qp',
                          title: 'Pristine02',
                          city: 'Pune',
                          locality: 'Model Colony',
                          bhk: '2BHK',
                          price: '₹80 L',
                          projectName: 'Pristine02',
                          status: 'Ready',
                          amenities: ['Parking', 'Lift', 'Security'],
                          ctaUrl: '/project/pristine02-modelcolony-shivajinagar-pune-428955',
                          carpetArea: '188.73 sq.ft',
                          bathrooms: '2'
                        }
                      ],
                      filtersUsed: {
                        bhk: '2',
                        city: 'pune',
                        maxPrice: 8000000
                      },
                      resultsCount: 3
                    }
                  },
                  noResults: {
                    summary: 'No properties found',
                    value: {
                      success: true,
                      summary: 'No 3BHK properties found in Mumbai under ₹60 Lakh. Try increasing your budget or checking different locations.',
                      properties: [],
                      filtersUsed: {
                        bhk: '3',
                        city: 'mumbai',
                        maxPrice: 6000000
                      },
                      resultsCount: 0
                    }
                  },
                  irrelevant: {
                    summary: 'Irrelevant query',
                    value: {
                      success: true,
                      summary: "I'm an intelligent assistant specialized in properties in Pune and Mumbai. I have no expertise about your current question. Try asking me about flats, BHKs, or properties in these cities!",
                      properties: [],
                      filtersUsed: {
                        isRelevant: false
                      },
                      resultsCount: 0,
                      isIrrelevant: true
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad request - message is required',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: false
                    },
                    error: {
                      type: 'string',
                      example: 'Message is required'
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: false
                    },
                    error: {
                      type: 'string',
                      example: 'Internal server error occurred'
                    },
                    summary: {
                      type: 'string',
                      example: 'Sorry, I encountered an error while processing your request.'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/health': {
      get: {
        summary: 'Health check',
        description: 'Check if the API is running properly and data is loaded',
        tags: ['Health'],
        responses: {
          '200': {
            description: 'API is healthy and ready',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'OK'
                    },
                    message: {
                      type: 'string',
                      example: 'PropBot AI API is running'
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time'
                    },
                    version: {
                      type: 'string',
                      example: '1.0.0'
                    },
                    environment: {
                      type: 'string',
                      example: 'production'
                    },
                    base_url: {
                      type: 'string',
                      example: 'https://propbotai-production.up.railway.app'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/chat/test': {
      get: {
        summary: 'Test chat endpoint',
        description: 'Verify that the chat route is working and check data loading status',
        tags: ['Chat'],
        responses: {
          '200': {
            description: 'Chat endpoint is working',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    message: {
                      type: 'string',
                      example: 'Chat API is working!'
                    },
                    dataLoaded: {
                      type: 'boolean',
                      example: true
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/chat': {
      get: {
        summary: 'Chat API information',
        description: 'Get information about available chat endpoints',
        tags: ['Chat'],
        responses: {
          '200': {
            description: 'Chat API information',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    message: {
                      type: 'string',
                      example: 'PropBot AI Chat API'
                    },
                    available_endpoints: {
                      type: 'object',
                      properties: {
                        message: {
                          type: 'string',
                          example: 'POST /api/chat/message - Send chat messages'
                        },
                        test: {
                          type: 'string',
                          example: 'GET /api/chat/test - Test endpoint'
                        }
                      }
                    },
                    usage: {
                      type: 'string',
                      example: 'Send POST requests to /api/chat/message with { "message": "your query" }'
                    },
                    examples: {
                      type: 'array',
                      items: {
                        type: 'string'
                      },
                      example: [
                        '2BHK in Pune under 80 Lakh',
                        '3BHK flats in Mumbai under 1.2 Cr',
                        'Ready to move 1BHK in Pune'
                      ]
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Chat',
      description: 'Property search chat endpoints with natural language processing'
    },
    {
      name: 'Health',
      description: 'API health and status endpoints'
    }
  ],
  components: {
    schemas: {
      Property: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique property identifier'
          },
          title: {
            type: 'string',
            description: 'Property title/name'
          },
          city: {
            type: 'string',
            enum: ['Pune', 'Mumbai'],
            description: 'City location'
          },
          locality: {
            type: 'string',
            description: 'Locality/area within city'
          },
          bhk: {
            type: 'string',
            description: 'BHK configuration (1BHK, 2BHK, 3BHK, etc.)'
          },
          price: {
            type: 'string',
            description: 'Formatted price in ₹ Cr or ₹ L'
          },
          projectName: {
            type: 'string',
            description: 'Project name'
          },
          status: {
            type: 'string',
            enum: ['Ready', 'Under Construction', 'Unknown'],
            description: 'Possession status'
          },
          amenities: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Top amenities'
          },
          ctaUrl: {
            type: 'string',
            description: 'URL for property details'
          },
          carpetArea: {
            type: 'string',
            description: 'Carpet area in sq.ft'
          },
          bathrooms: {
            type: 'string',
            description: 'Number of bathrooms'
          }
        }
      },
      Filters: {
        type: 'object',
        properties: {
          bhk: {
            type: 'string',
            description: 'Exact BHK filter applied'
          },
          city: {
            type: 'string',
            enum: ['pune', 'mumbai', 'both'],
            description: 'City filter applied'
          },
          maxPrice: {
            type: 'number',
            description: 'Maximum price filter in rupees'
          },
          status: {
            type: 'string',
            enum: ['READY_TO_MOVE', 'UNDER_CONSTRUCTION'],
            description: 'Property status filter'
          },
          propertyType: {
            type: 'string',
            enum: ['RESIDENTIAL', 'COMMERCIAL'],
            description: 'Property type filter'
          },
          isRelevant: {
            type: 'boolean',
            description: 'Whether query was relevant to property search'
          }
        }
      }
    }
  }
};

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "PropBot AI API Documentation",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true
  }
}));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 PropBot AI Backend is running!',
    description: 'Intelligent Property Search API for Pune and Mumbai',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    base_url: 'https://propbotai-production.up.railway.app',
    documentation: 'Visit https://propbotai-production.up.railway.app/api-docs for interactive API documentation',
    endpoints: {
      root: '/',
      health: '/health',
      api_info: '/api',
      chat: '/api/chat/message',
      chat_base: '/api/chat',
      chat_test: '/api/chat/test',
      swagger_ui: '/api-docs'
    },
    features: {
      natural_language_processing: 'Understands queries like "2BHK in Pune under 80 Lakh"',
      exact_filtering: 'Precise BHK, budget, and location matching',
      property_details: 'Complete property information with amenities',
      smart_summaries: 'AI-generated search result summaries'
    },
    examples: {
      chat_request: {
        method: 'POST',
        url: '/api/chat/message',
        body: {
          message: '2BHK flats in Pune under 80 Lakh'
        }
      },
      test_queries: [
        '3BHK in Mumbai under 1.2 Cr',
        'Ready to move 1BHK in Pune', 
        'Properties under 1 Cr',
        '2BHK apartments in Mumbai'
      ]
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'Something went wrong! Please try again later.',
    timestamp: new Date().toISOString(),
    base_url: 'https://propbotai-production.up.railway.app'
  });
});

// 404 handler - This should be LAST
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Route ${req.originalUrl} does not exist`,
    base_url: 'https://propbotai-production.up.railway.app',
    available_endpoints: {
      root: '/',
      health: '/health',
      api_info: '/api',
      chat: '/api/chat/message',
      chat_base: '/api/chat',
      chat_test: '/api/chat/test',
      docs: '/api-docs'
    },
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✨ ========================================`);
  console.log(`   🚀 PropBot AI API Server Started`);
  console.log(`   📍 Port: ${PORT}`);
  console.log(`   🌐 Environment: Production`);
  console.log(`   🔗 Public URL: https://propbotai-production.up.railway.app`);
  console.log(`   🔧 CORS: Enabled for production origins`);
  console.log(`✨ ========================================\n`);
  
  console.log(`📚 API Documentation:`);
  console.log(`   🔗 https://propbotai-production.up.railway.app/api-docs\n`);
  
  console.log(`🔍 Test Endpoints:`);
  console.log(`   ✅ Health Check: https://propbotai-production.up.railway.app/health`);
  console.log(`   💬 Chat Base: https://propbotai-production.up.railway.app/api/chat`);
  console.log(`   💬 Chat Test: https://propbotai-production.up.railway.app/api/chat/test`);
  console.log(`   🏠 API Info: https://propbotai-production.up.railway.app/api\n`);
  
  console.log(`💡 Example Queries for Testing:`);
  console.log(`   🏠 "2BHK in Pune under 80 Lakh"`);
  console.log(`   🏢 "3BHK flats in Mumbai under 1.2 Cr"`);
  console.log(`   ✅ "Ready to move 1BHK in Pune"`);
  console.log(`   🏗️ "Under construction properties in Mumbai"`);
  console.log(`   💰 "Properties under 1 Cr"\n`);
  
  console.log(`⚡ Usage Examples:`);
  console.log(`   curl -X POST https://propbotai-production.up.railway.app/api/chat/message \\`);
  console.log(`        -H "Content-Type: application/json" \\`);
  console.log(`        -d '{"message": "2BHK in Pune under 80 Lakh"}'\n`);
  
  console.log(`🔧 Features:`);
  console.log(`   ✅ Exact BHK matching (no cross-BHK results)`);
  console.log(`   ✅ Strict budget filtering`);
  console.log(`   ✅ Accurate location detection`);
  console.log(`   ✅ Smart status filtering`);
  console.log(`   ✅ Complete property details\n`);
});

module.exports = app;