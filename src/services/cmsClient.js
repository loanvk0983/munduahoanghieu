/**
 * CMS API Client - Website Service
 * Gọi CMS API để lấy dynamic content
 * Port: CMS runs on 4000, Website on 3000
 */

const axios = require('axios');

// CMS API base URL
const CMS_API_URL = process.env.CMS_API_URL || 'http://localhost:4000/api';

// Timeout configuration
const API_TIMEOUT = 5000; // 5 seconds

// Simple in-memory cache (60 seconds TTL)
const cache = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds

/**
 * Helper: Get from cache or fetch fresh data
 */
async function fetchWithCache(key, fetchFn) {
  const now = Date.now();
  const cached = cache.get(key);
  
  // Return cached if fresh
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    console.log(`⚡ Cache HIT: ${key}`);
    return cached.data;
  }
  
  // Fetch fresh data
  try {
    console.log(`🌐 Cache MISS: ${key} - Fetching from CMS...`);
    const data = await fetchFn();
    cache.set(key, { data, timestamp: now });
    return data;
  } catch (error) {
    console.error(`❌ Error fetching ${key}:`, error.message);
    
    // Return stale cache if available (fallback)
    if (cached) {
      console.warn(`⚠️ Using STALE cache for ${key}`);
      return cached.data;
    }
    
    throw error;
  }
}

/**
 * GET /api/public/home
 * Returns homepage data with caching
 */
async function getHome() {
  return fetchWithCache('home', async () => {
    const response = await axios.get(`${CMS_API_URL}/public/home`, {
      timeout: API_TIMEOUT,
      headers: { 'User-Agent': 'Website/1.0' }
    });
    
    if (!response.data.success) {
      throw new Error('Invalid API response');
    }
    
    return response.data.data;
  });
}

/**
 * GET /api/public/about
 * Returns about page data
 */
async function getAbout() {
  return fetchWithCache('about', async () => {
    const response = await axios.get(`${CMS_API_URL}/public/about`, {
      timeout: API_TIMEOUT
    });
    return response.data.data;
  });
}

/**
 * GET /api/public/products
 * Returns all products
 */
async function getProducts() {
  return fetchWithCache('products', async () => {
    const response = await axios.get(`${CMS_API_URL}/public/products`, {
      timeout: API_TIMEOUT
    });
    return response.data.data;
  });
}

/**
 * GET /api/public/news
 * Returns news posts (with pagination)
 */
async function getNews(page = 1, limit = 10) {
  const cacheKey = `news_${page}_${limit}`;
  return fetchWithCache(cacheKey, async () => {
    const response = await axios.get(`${CMS_API_URL}/public/news`, {
      params: { page, limit },
      timeout: API_TIMEOUT
    });
    return response.data.data;
  });
}

/**
 * GET /api/public/config
 * Returns global site configuration
 */
async function getConfig() {
  return fetchWithCache('config', async () => {
    const response = await axios.get(`${CMS_API_URL}/public/config`, {
      timeout: API_TIMEOUT
    });
    return response.data.data;
  });
}

/**
 * Health check - verify CMS is reachable
 */
async function healthCheck() {
  try {
    const response = await axios.get(`${CMS_API_URL}/health`, {
      timeout: 2000
    });
    return response.data.status === 'ok';
  } catch (error) {
    console.error('❌ CMS health check failed:', error.message);
    return false;
  }
}

/**
 * Clear all cache (for manual refresh)
 */
function clearCache() {
  cache.clear();
  console.log('🗑️ CMS client cache cleared');
}

/**
 * Get cache stats
 */
function getCacheStats() {
  const stats = {
    size: cache.size,
    keys: Array.from(cache.keys()),
    ttl: CACHE_TTL / 1000 + 's'
  };
  return stats;
}

module.exports = {
  getHome,
  getAbout,
  getProducts,
  getNews,
  getConfig,
  healthCheck,
  clearCache,
  getCacheStats
};
