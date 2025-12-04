require('dotenv').config();

// Determine which environment file to load
const env = process.env.NODE_ENV || 'development';
require('dotenv').config({ path: `.env.${env}` });

// Export all environment variables
module.exports = {
  // Server
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Session
  SESSION_SECRET: process.env.SESSION_SECRET || 'munduahoanghieu-secret-key-change-in-production',
  SESSION_MAX_AGE: process.env.SESSION_MAX_AGE || 24 * 60 * 60 * 1000, // 24 hours
  
  // Database/Content
  CONTENT_PATH: process.env.CONTENT_PATH || 'public/data/content.json',
  NEWS_PATH: process.env.NEWS_PATH || 'public/data/news-quick.json',
  
  // API
  CMS_API_URL: process.env.CMS_API_URL || 'http://localhost:3000',
  API_TIMEOUT: process.env.API_TIMEOUT || 5000,
  
  // Company Info
  COMPANY_NAME: process.env.COMPANY_NAME || 'Mụn Dừa Hoàng Hiếu',
  COMPANY_PHONE: process.env.COMPANY_PHONE || '0984.288.512',
  COMPANY_ADDRESS: process.env.COMPANY_ADDRESS || 'Ấp Hội An, Xã Đa Phước Hội, Huyện Mỏ Cày Nam, Tỉnh Bến Tre',
  COMPANY_WEBSITE: process.env.COMPANY_WEBSITE || 'https://munduahoanghieu.com',
  COMPANY_EMAIL: process.env.COMPANY_EMAIL || 'contact@munduahoanghieu.com',
  
  // Features
  ENABLE_CACHE: process.env.ENABLE_CACHE === 'true',
  ENABLE_COMPRESSION: process.env.ENABLE_COMPRESSION === 'true',
  ENABLE_HELMET: process.env.ENABLE_HELMET === 'true',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Security
  SECURE_COOKIES: process.env.SECURE_COOKIES === 'true',
  SAME_SITE: process.env.SAME_SITE || 'strict',
  
  // MySQL Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT) || 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'munduahoanghieu',
  DB_POOL_LIMIT: parseInt(process.env.DB_POOL_LIMIT) || 10,
  DB_TIMEZONE: process.env.DB_TIMEZONE || '+00:00',
  
  // Check if running in production
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test'
};
