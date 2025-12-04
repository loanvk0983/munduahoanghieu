const db = require('../../lib/database');

class HomeController {
  /**
   * Get homepage data and render home.twig
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getHomepage(req, res) {
    try {
      // Initialize database connection
      await db.initializePool();

      // Fetch all homepage data from database
      const [banners, serviceFeatures, whyChooseItems, featuredProducts, galleryProducts, galleryResults, contactButtons, settings] = await Promise.all([
        // 1. Get active banners
        db.query(
          'SELECT * FROM homepage_banners WHERE active = TRUE ORDER BY sort_order ASC'
        ),
        
        // 2. Get service features
        db.query(
          'SELECT * FROM homepage_service_features WHERE active = TRUE ORDER BY sort_order ASC'
        ),
        
        // 3. Get why choose items (4 reasons)
        db.query(
          'SELECT * FROM homepage_why_choose_items WHERE active = TRUE ORDER BY sort_order ASC LIMIT 4'
        ),
        
        // 4. Get featured products
        db.query(
          'SELECT * FROM homepage_featured_products WHERE active = TRUE ORDER BY sort_order ASC'
        ),
        
        // 5. Get gallery - products
        db.query(
          'SELECT * FROM homepage_gallery_items WHERE gallery_type = "products" AND active = TRUE ORDER BY sort_order ASC'
        ),
        
        // 6. Get gallery - results
        db.query(
          'SELECT * FROM homepage_gallery_items WHERE gallery_type = "results" AND active = TRUE ORDER BY sort_order ASC'
        ),
        
        // 7. Get contact buttons
        db.query(
          'SELECT * FROM homepage_contact_buttons WHERE active = TRUE ORDER BY sort_order ASC'
        ),
        
        // 8. Get all settings
        db.query(
          'SELECT setting_key, setting_value FROM homepage_settings'
        )
      ]);

      // Convert settings array to object for easier access
      const settingsObj = {};
      settings.forEach(s => {
        settingsObj[s.setting_key] = s.setting_value;
      });

      // Prepare data for template
      const content = {
        banners: banners,
        services: {
          highlight: {
            icon: settingsObj.service_highlight_icon || '🌱',
            title: settingsObj.service_highlight_title || 'Hoàng Hiếu – Gieo chân thành, gặt niềm tin!',
            description: settingsObj.service_highlight_description || 'Dù bạn là khách hàng lâu năm hay lần đầu ghé thăm, chúng tôi đều trân trọng như nhau.'
          },
          features: serviceFeatures
        },
        whyChooseUs: {
          title: settingsObj.why_choose_title || 'Tại Sao Chọn Mụn Dừa Hoàng Hiếu?',
          reasons: whyChooseItems
        },
        featuredProducts: featuredProducts,
        gallery: {
          products: galleryProducts,
          results: galleryResults
        },
        contactSection: {
          title: settingsObj.contact_section_title || 'Liên Hệ Với Chúng Tôi',
          subtitle: settingsObj.contact_section_subtitle || 'Chúng tôi luôn sẵn sàng hỗ trợ bạn',
          buttons: contactButtons
        }
      };

      console.log('✅ Homepage data loaded from database');
      console.log(`📊 Banners: ${banners.length}, Features: ${serviceFeatures.length}, Products: ${featuredProducts.length}`);

      // Render home template with data
      res.render('home', {
        currentPage: 'home',
        searchPlaceholder: 'Tìm kiếm...',
        content: content,
        // SEO Data
        seo_title: 'Mụn Dừa Hoàng Hiếu – Giá Thể Sạch – Năng Suất Vượt Trội',
        seo_description: 'Mụn Dừa Hoàng Hiếu cung cấp giá thể mụn dừa xử lý sạch, EC thấp, pH chuẩn từ Bến Tre. Giải pháp nông nghiệp xanh, đồng hành cùng phát triển bền vững cho dưa lưới, dâu tây, ớt chuông, lan và nhiều loại cây trồng.',
        seo_keywords: 'mụn dừa, mụn dừa xử lý, giá thể sạch, giá thể mụn dừa, mụn dừa Bến Tre, nông nghiệp sạch, giá thể trồng cây, xơ dừa, vỏ dừa',
        current_url: 'https://munduahoanghieu.com/',
        og_image: 'https://munduahoanghieu.com/assets/image/banner/banner1.jpg',
        config: {
          company: {
            name: 'Mụn Dừa Hoàng Hiếu',
            phone: '0984.288.512',
            email: 'munduahoanghieu.vn@gmail.com'
          }
        },
        siteUrl: 'https://munduahoanghieu.com',
        currentPath: req.path
      });

    } catch (error) {
      console.error('❌ Error loading homepage data:', error.message);
      console.error('Stack:', error.stack);
      
      // Return 500 error page
      res.status(500).render('500', {
        error: 'Không thể tải nội dung trang chủ. ' + error.message
      });
    }
  }
}

module.exports = HomeController;
