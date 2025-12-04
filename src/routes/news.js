const express = require('express');
const router = express.Router();
const NewsController = require('../controllers/newsController');

/**
 * GET /news - Get all news articles
 * Render news page with all articles from database
 */
router.get('/', async (req, res) => {
  try {
    // Fetch all news from database using NewsController
    const allNews = await NewsController.getAllNews();
    
    console.log('📰 NEWS FROM DATABASE:', JSON.stringify(allNews, null, 2));
    console.log(`📊 Total news items: ${allNews.length}`);

    // Get top 5 for quick news rotator
    const quickNews = allNews.slice(0, 5).map(news => ({
      id: news.id,
      title: news.title,
      date: news.date,
      views: news.views
    }));

    // Get top 3 for highlights
    const highlightNews = allNews.slice(0, 3);

    // Get top 10 for related posts
    const relatedNews = allNews.slice(0, 10);

    console.log(`✅ /news: Loaded ${allNews.length} news articles from database`);

    res.render('news', {
      currentPage: 'news',
      searchPlaceholder: 'Tìm kiếm...',
      // Pass objects directly to Twig for rendering
      quickNewsData: quickNews,
      allNewsData: allNews,
      highlightNews: highlightNews,
      relatedNews: relatedNews,
      // Stringify versions for JavaScript client
      quickNewsDataJson: JSON.stringify(quickNews),
      allNewsDataJson: JSON.stringify(allNews),
      highlightNewsJson: JSON.stringify(highlightNews),
      relatedNewsJson: JSON.stringify(relatedNews),
      newsCount: allNews.length,
      // SEO Data
      seo_title: 'Tin Tức Nông Nghiệp – Kỹ Thuật Trồng Cây – Mụn Dừa Hoàng Hiếu',
      seo_description: 'Cập nhật tin tức nông nghiệp mới nhất: kỹ thuật trồng cây, kinh nghiệm canh tác, hướng dẫn sử dụng giá thể mụn dừa, nông nghiệp sạch và bền vững. Chia sẻ kiến thức từ chuyên gia.',
      seo_keywords: 'tin tức nông nghiệp, kỹ thuật trồng cây, kinh nghiệm canh tác, nông nghiệp sạch, hướng dẫn mụn dừa, tin tức mụn dừa',
      current_url: 'https://munduahoanghieu.com/tin-tuc',
      og_image: 'https://munduahoanghieu.com/assets/image/banner/banner1.jpg'
    });

  } catch (error) {
    console.error('❌ Error in /news route:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    res.status(500).render('500', { 
      error: 'Không thể tải tin tức. ' + error.message 
    });
  }
});

/**
 * GET /news/:id - Get single news article by ID
 * Render single news detail page
 */
router.get('/:id', async (req, res) => {
  try {
    const newsId = parseInt(req.params.id);
    
    if (!newsId || isNaN(newsId)) {
      return res.status(400).render('404', { 
        error: 'ID tin tức không hợp lệ' 
      });
    }

    // Fetch news by ID
    const newsArticle = await NewsController.getNewsById(newsId);
    
    if (!newsArticle) {
      return res.status(404).render('404', { 
        error: 'Không tìm thấy tin tức' 
      });
    }

    // Get related news (same category, limit 5)
    const relatedNews = await NewsController.getAllNews(newsArticle.category);
    const filteredRelated = relatedNews
      .filter(n => n.id !== newsId)
      .slice(0, 5);

    console.log(`✅ /news/${newsId}: Loaded article "${newsArticle.title}"`);

    res.render('news-detail', {
      currentPage: 'news',
      searchPlaceholder: 'Tìm kiếm...',
      news: newsArticle,
      relatedNews: filteredRelated
    });

  } catch (error) {
    console.error('❌ Error in /news/:id route:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    res.status(500).render('500', { 
      error: 'Không thể tải tin tức. ' + error.message 
    });
  }
});

/**
 * POST /news/:newsId/view - Increment view count
 * API endpoint for tracking news views
 */
router.post('/:newsId/view', async (req, res) => {
  try {
    const newsId = parseInt(req.params.newsId);
    
    if (!newsId || isNaN(newsId)) {
      return res.status(400).json({ error: 'Invalid news ID' });
    }
    
    // Increment view count in database
    const newViews = await NewsController.incrementViews(newsId);
    
    console.log(`📊 View increment: News #${newsId} → ${newViews} views`);
    
    res.json({ 
      success: true, 
      newsId: newsId,
      views: newViews 
    });
    
  } catch (error) {
    console.error('❌ Error incrementing views:', error.message);
    res.status(500).json({ 
      error: 'Failed to increment view count',
      message: error.message
    });
  }
});

module.exports = router;
