// Application constants
export const APP_CONFIG = {
  name: 'NoBrokerage AI',
  version: '1.0.0',
  description: 'Intelligent Property Search Assistant',
  supportedCities: ['Pune', 'Mumbai'],
  maxPrice: 100000000, // 10 Cr in rupees
  defaultChatExamples: [
    "2BHK in Pune under 80 Lakh",
    "3BHK flats in Mumbai under 1.2 Cr", 
    "Ready to move 1BHK in Pune",
    "Under construction properties in Mumbai",
    "Properties under 1 Cr with amenities"
  ]
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'NoBrokerage-theme',
  USER_PREFERENCES: 'NoBrokerage-user-prefs',
  CHAT_HISTORY: 'NoBrokerage-chat-history'
};

// API endpoints
export const API_ENDPOINTS = {
  CHAT: '/api/chat/message',
  HEALTH: '/health',
  TEST: '/api/chat/test'
};

// Property status colors
export const STATUS_COLORS = {
  'Ready': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  'Under Construction': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  'Unknown': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
};

// Amenity icons mapping (for future use)
export const AMENITY_ICONS = {
  'Parking': '🚗',
  'Lift': '🛗',
  'Security': '👮',
  'Garden': '🌳',
  'Gym': '💪',
  'Pool': '🏊',
  'Playground': '🎠'
};