/**
 * News Controller
 * Handles all news-related database queries and operations
 */

const db = require('../../lib/database');

class NewsController {
  /**
   * Get all news with optional category filter
   */
  static async getAllNews(category = null) {
    try {
      let query = `
        SELECT 
          n.id,
          n.title,
          n.excerpt,
          n.category,
          n.category_name as categoryName,
          n.date,
          n.views,
          n.cover,
          n.content,
          GROUP_CONCAT(DISTINCT nc.category) as categories
        FROM news n
        LEFT JOIN news_categories nc ON n.id = nc.news_id
      `;

      const params = [];

      if (category && category !== 'all') {
        // Filter by primary category or secondary categories
        query += ` WHERE n.category = ?`;
        params.push(category);
      }

      query += ` GROUP BY n.id ORDER BY STR_TO_DATE(n.date, '%d/%m/%Y') DESC`;

      const news = await db.query(query, params);

      return news.map(item => ({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        category: item.category,
        categoryName: item.categoryName,
        categories: item.categories ? item.categories.split(',') : [item.category],
        date: item.date,
        views: item.views || 0,
        cover: item.cover,
        content: item.content
      }));
    } catch (error) {
      console.error('❌ Error fetching all news:', error.message);
      throw error;
    }
  }

  /**
   * Get single news article by ID
   */
  static async getNewsById(newsId) {
    try {
      const query = `
        SELECT 
          n.id,
          n.title,
          n.excerpt,
          n.category,
          n.category_name as categoryName,
          n.date,
          n.views,
          n.cover,
          n.content,
          GROUP_CONCAT(DISTINCT nc.category) as categories
        FROM news n
        LEFT JOIN news_categories nc ON n.id = nc.news_id
        WHERE n.id = ?
        GROUP BY n.id
      `;

      const result = await db.query(query, [newsId]);

      if (!result || result.length === 0) {
        return null;
      }

      const item = result[0];

      return {
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        category: item.category,
        categoryName: item.categoryName,
        categories: item.categories ? item.categories.split(',') : [item.category],
        date: item.date,
        views: item.views || 0,
        cover: item.cover,
        content: item.content
      };
    } catch (error) {
      console.error('❌ Error fetching news by ID:', error.message);
      throw error;
    }
  }

  /**
   * Get news images for a specific article
   */
  static async getNewsImages(newsId) {
    try {
      const query = `
        SELECT image_url, alt_text, display_order
        FROM news_images
        WHERE news_id = ?
        ORDER BY display_order ASC
      `;

      return await db.query(query, [newsId]);
    } catch (error) {
      console.error('❌ Error fetching news images:', error.message);
      throw error;
    }
  }

  /**
   * Get top N news by views
   */
  static async getTopNewsByViews(limit = 10) {
    try {
      const query = `
        SELECT 
          n.id,
          n.title,
          n.excerpt,
          n.category,
          n.category_name as categoryName,
          n.date,
          n.views,
          n.cover
        FROM news n
        ORDER BY n.views DESC
        LIMIT ?
      `;

      const news = await db.query(query, [limit]);

      return news.map(item => ({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        category: item.category,
        categoryName: item.categoryName,
        date: item.date,
        views: item.views || 0,
        cover: item.cover
      }));
    } catch (error) {
      console.error('❌ Error fetching top news:', error.message);
      throw error;
    }
  }

  /**
   * Get recent news
   */
  static async getRecentNews(limit = 5) {
    try {
      const query = `
        SELECT 
          n.id,
          n.title,
          n.excerpt,
          n.category,
          n.category_name as categoryName,
          n.date,
          n.views,
          n.cover
        FROM news n
        ORDER BY STR_TO_DATE(n.date, '%d/%m/%Y') DESC
        LIMIT ?
      `;

      const news = await db.query(query, [limit]);

      return news.map(item => ({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        category: item.category,
        categoryName: item.categoryName,
        date: item.date,
        views: item.views || 0,
        cover: item.cover
      }));
    } catch (error) {
      console.error('❌ Error fetching recent news:', error.message);
      throw error;
    }
  }

  /**
   * Search news by keyword
   */
  static async searchNews(keyword) {
    try {
      const query = `
        SELECT 
          n.id,
          n.title,
          n.excerpt,
          n.category,
          n.category_name as categoryName,
          n.date,
          n.views,
          n.cover
        FROM news n
        WHERE n.title LIKE ? 
          OR n.excerpt LIKE ? 
          OR n.content LIKE ?
        ORDER BY n.views DESC
      `;

      const searchTerm = `%${keyword}%`;
      const news = await db.query(query, [searchTerm, searchTerm, searchTerm]);

      return news.map(item => ({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        category: item.category,
        categoryName: item.categoryName,
        date: item.date,
        views: item.views || 0,
        cover: item.cover
      }));
    } catch (error) {
      console.error('❌ Error searching news:', error.message);
      throw error;
    }
  }

  /**
   * Increment view count for a news article
   */
  static async incrementViews(newsId) {
    try {
      // Use raw SQL to increment views
      await db.query('UPDATE news SET views = views + 1 WHERE id = ?', [newsId]);

      // Also log the view
      await db.insert('news_views', {
        news_id: newsId,
        user_ip: '0.0.0.0', // Would be req.ip in actual controller
        user_agent: 'Node.js'
      });

      const result = await db.queryOne('SELECT views FROM news WHERE id = ?', [newsId]);
      return result.views;
    } catch (error) {
      console.error('❌ Error incrementing views:', error.message);
      throw error;
    }
  }

  /**
   * Get statistics about news
   */
  static async getStatistics() {
    try {
      const totalNews = await db.queryOne('SELECT COUNT(*) as count FROM news');
      const totalViews = await db.queryOne('SELECT SUM(views) as total FROM news');
      const avgViews = await db.queryOne('SELECT AVG(views) as avg FROM news');
      const categories = await db.query('SELECT COUNT(DISTINCT category) as count FROM news_categories');

      return {
        totalArticles: totalNews.count,
        totalViews: totalViews.total || 0,
        averageViews: Math.round(avgViews.avg || 0),
        totalCategories: categories[0].count
      };
    } catch (error) {
      console.error('❌ Error fetching statistics:', error.message);
      throw error;
    }
  }

  /**
   * Get news grouped by category
   */
  static async getNewsByCategories() {
    try {
      const query = `
        SELECT 
          n.category,
          n.category_name as categoryName,
          COUNT(*) as count,
          SUM(n.views) as totalViews
        FROM news n
        GROUP BY n.category
        ORDER BY count DESC
      `;

      return await db.query(query);
    } catch (error) {
      console.error('❌ Error fetching news by categories:', error.message);
      throw error;
    }
  }
}

module.exports = NewsController;
