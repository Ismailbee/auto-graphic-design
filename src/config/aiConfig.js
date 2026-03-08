/**
 * AI Configuration for SmartDesignPro
 * Set up your free AI API keys here
 */

export const AI_CONFIG = {
  // Hugging Face (Recommended - Free with good limits)
  HUGGING_FACE: {
    enabled: true,
    apiKey: '', // 👈 PASTE YOUR TOKEN HERE - Get free token from huggingface.co/settings/tokens
    baseUrl: 'https://api-inference.huggingface.co/models',
    models: {
      ner: 'dbmdz/bert-large-cased-finetuned-conll03-english', // Named Entity Recognition
      textGeneration: 'microsoft/DialoGPT-medium', // Text understanding
      alternativeNer: 'dslim/bert-base-NER' // Alternative NER model
    },
    rateLimit: {
      requestsPerMinute: 30,
      requestsPerHour: 1000
    }
  },

  // OpenAI API (Paid but very accurate - $5 free credits)
  OPENAI: {
    enabled: false, // Set to true if you have OpenAI API key
    apiKey: process.env.VITE_OPENAI_API_KEY || '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
    maxTokens: 150,
    temperature: 0.3
  },

  // Google Cloud Natural Language API (5,000 units/month free)
  GOOGLE_CLOUD: {
    enabled: false,
    apiKey: process.env.VITE_GOOGLE_CLOUD_API_KEY || '',
    baseUrl: 'https://language.googleapis.com/v1/documents:analyzeEntities'
  },

  // IBM Watson Natural Language Understanding (30,000 items/month free)
  IBM_WATSON: {
    enabled: false,
    apiKey: process.env.VITE_IBM_WATSON_API_KEY || '',
    instanceId: process.env.VITE_IBM_WATSON_INSTANCE_ID || '',
    baseUrl: 'https://api.us-south.natural-language-understanding.watson.cloud.ibm.com/instances'
  },

  // Fallback settings
  FALLBACK: {
    enabled: true, // Always keep true for reliability
    useRegexWhenAiFails: true,
    showAiStatus: true, // Show AI status in UI
    cacheResults: true, // Cache AI results for better performance
    cacheDurationMinutes: 30
  },

  // API request settings
  REQUEST: {
    timeoutMs: 10000, // 10 seconds timeout
    retryAttempts: 2,
    retryDelayMs: 1000
  }
};

// Helper function to check if any AI service is configured
export const isAiConfigured = () => {
  return AI_CONFIG.HUGGING_FACE.enabled && AI_CONFIG.HUGGING_FACE.apiKey ||
         AI_CONFIG.OPENAI.enabled && AI_CONFIG.OPENAI.apiKey ||
         AI_CONFIG.GOOGLE_CLOUD.enabled && AI_CONFIG.GOOGLE_CLOUD.apiKey ||
         AI_CONFIG.IBM_WATSON.enabled && AI_CONFIG.IBM_WATSON.apiKey;
};

// Get the primary AI service to use
export const getPrimaryAiService = () => {
  if (AI_CONFIG.HUGGING_FACE.enabled && AI_CONFIG.HUGGING_FACE.apiKey) return 'HUGGING_FACE';
  if (AI_CONFIG.OPENAI.enabled && AI_CONFIG.OPENAI.apiKey) return 'OPENAI';
  if (AI_CONFIG.GOOGLE_CLOUD.enabled && AI_CONFIG.GOOGLE_CLOUD.apiKey) return 'GOOGLE_CLOUD';
  if (AI_CONFIG.IBM_WATSON.enabled && AI_CONFIG.IBM_WATSON.apiKey) return 'IBM_WATSON';
  return 'FALLBACK';
};

export default AI_CONFIG;