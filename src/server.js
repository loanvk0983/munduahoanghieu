const express = require('express');
const path = require('path');
const fs = require('fs');
const twig = require('twig');
const session = require('express-session');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const { greet } = require('./utils');

twig.cache(false); // Tắt cache trong quá trình phát triển

// ============ Security Middleware ============
// Disable CSP completely to allow inline event handlers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
}));

// Add headers to prevent caching of CSP
app.use((req, res, next) => {
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('Content-Security-Policy-Report-Only');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// ============ Body Parser & Cookie Parser ============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ============ Session Management ============
app.use(session({
  secret: process.env.SESSION_SECRET || 'munduahoanghieu-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Cấu hình Twig
app.set('view engine', 'twig');
app.set('views', path.join(__dirname, '../views'));

// Middleware để serve static files từ thư mục public
app.use(express.static(path.join(__dirname, '../public')));

// ============ Admin Routes ============
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

// ============ Content Loader (Static JSON) ============
// NEW ARCHITECTURE: Load directly from public/data/content.json
// This file is auto-exported by CMS after each save
const CONTENT_PATH = path.join(__dirname, '../public/data/content.json');

function loadContent() {
  try {
    if (!fs.existsSync(CONTENT_PATH)) {
      console.warn('⚠️ content.json not found, trying shared/content.json...');
      const fallbackPath = path.join(__dirname, '../shared/content.json');
      if (fs.existsSync(fallbackPath)) {
        return JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
      }
      throw new Error('No content.json found');
    }
    
    const data = fs.readFileSync(CONTENT_PATH, 'utf-8');
    const content = JSON.parse(data);
    
    console.log('✅ Content loaded from:', CONTENT_PATH);
    if (content._metadata) {
      console.log('📦 Export timestamp:', content._metadata.exportedAt);
      console.log('📦 Source:', content._metadata.source);
    }
    
    return content;
  } catch (error) {
    console.error('❌ Error loading content:', error.message);
    throw error;
  }
}

// ============ Public Routes (Static Content) ============
app.get('/', async (req, res) => {
  try {
    // Load data from exported JSON (no API calls!)
    const content = loadContent();
    console.log('CONTENT:', content);
    res.render('home', {
      currentPage: 'home',
      searchPlaceholder: 'Tìm kiếm...',
      content: content,
      config: { company: content.contact || {} },
      siteUrl: content.contact?.website || 'https://munduahoanghieu.com',
      currentPath: req.path
    });
  } catch (error) {
    console.error('❌ Error loading home page:', error.message);
    res.status(500).render('500', { 
      error: 'Không thể tải nội dung trang chủ' 
    });
  }
});

app.get('/gioi-thieu', (req, res) => {
  res.render('about', {
    currentPage: 'about',
    philosophy: {
      title: 'Triết Lý Của Chúng Tôi',
      quote: 'Kinh doanh không chỉ là bán sản phẩm, mà còn là gửi gắm sự chân thành'
    }
  });
});

app.get('/san-pham', (req, res) => {
  const productData = {
    currentPage: 'products',
    heroTitle: 'Sản Phẩm Mụn Dừa Chất Lượng Cao',
    heroSubtitle: 'Giải pháp toàn diện cho nông nghiệp hiện đại với mụn dừa xử lý sạch, an toàn',
    products: [
      { key: 'processed', name: 'Mụn Dừa Xử Lý' },
      { key: 'chips', name: 'Vỏ Dừa Cắt Chip' },
      { key: 'raw', name: 'Mụn Dừa Thô' },
      { key: 'custom', name: 'Sản Xuất Theo Yêu Cầu' }
    ],
    productScript: `
      // Product gallery data
      const productGalleries = {
        processed: [
          {src: '/assets/image/products/mun-dua-xu-ly/Mụn xử lý 1.jpg', alt: 'Mụn dừa xử lý chất lượng cao'},
          {src: '/assets/image/products/mun-dua-xu-ly/Mụn xử lý 2.jpg', alt: 'Mụn dừa kích thước đồng đều'},
          {src: '/assets/image/products/mun-dua-xu-ly/Mụn xử lý 3.jpg', alt: 'Mụn dừa khử muối hoàn toàn'}
        ],
        chips: [
          {src: '/assets/image/products/vo-dua-cat-chip/Vỏ dừa cắt chip 1.jpg', alt: 'Vỏ dừa cắt chip tự nhiên'},
          {src: '/assets/image/products/vo-dua-cat-chip/Vỏ dừa cắt chip 2.jpg', alt: 'Chip dừa phủ gốc cây'},
          {src: '/assets/image/products/vo-dua-cat-chip/Vỏ dừa cắt chip 3.jpg', alt: 'Chip dừa trang trí sân vườn'}
        ],
        raw: [
          {src: '/assets/image/products/mun-dua-tho/Mụn dừa thô 1.jpg', alt: 'Mụn dừa thô nguyên liệu'},
          {src: '/assets/image/products/mun-dua-tho/Mụn dừa thô 2.jpg', alt: 'Mụn dừa thô giá tiết kiệm'},
          {src: '/assets/image/products/mun-dua-tho/Mụn dừa thô 3.jpg', alt: 'Mụn dừa thô pha trộn'}
        ],
        custom: [
          {src: '/assets/image/products/san-xuat-theo-yeu-cau/custom-1.jpg', alt: 'Sản xuất theo yêu cầu'},
          {src: '/assets/image/products/san-xuat-theo-yeu-cau/custom-2.jpg', alt: 'Tùy chỉnh kích thước hạt'},
          {src: '/assets/image/products/san-xuat-theo-yeu-cau/custom-3.jpg', alt: 'Đóng gói theo quy cách riêng'}
        ]
      };
      // Add remaining JavaScript from san-pham.html
      // ... (rest of the JavaScript code)
    `
  };
  
  res.render('products', productData);
});

app.get('/tin-tuc', (req, res) => {
  // Try to load quick news from public data so client doesn't always need to fetch
  let quickNews = [];
  try {
    const file = path.join(__dirname, '../public/data/news-quick.json');
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf8');
      const parsed = JSON.parse(raw);
      quickNews = parsed.quickNews || [];
    }
  } catch (err) {
    console.warn('Could not read news-quick.json for server-side render:', err && err.message ? err.message : err);
  }

  res.render('news', {
    currentPage: 'news',
    searchPlaceholder: 'Tìm kiếm...',
    // Inject JSON-encoded quick news for client bootstrap
    quickNewsData: JSON.stringify(quickNews)
  });
});

app.get('/lien-he', (req, res) => {
  res.render('contact', {
    currentPage: 'contact',
    searchPlaceholder: 'Tìm kiếm...'
  });
});

app.get('/contact', (req, res) => {
  res.render('contact', {
    currentPage: 'contact',
    searchPlaceholder: 'Tìm kiếm...'
  });
});

// ============ Search Route ============
app.get('/search', (req, res) => {
  try {
    const keyword = (req.query.q || '').trim();
    
    if (!keyword) {
      return res.render('search', {
        currentPage: 'search',
        keyword: '',
        results: [],
        resultsByType: { products: [], pages: [], total: 0 },
        error: 'Vui lòng nhập từ khóa tìm kiếm'
      });
    }

    // Content data - CHỈ bao gồm nội dung từ các trang THỰC TẾ có trên website
    const allContent = {
      products: [
        {
          name: 'Mụn Dừa Xử Lý',
          description: 'Giá thể sạch, tơi xốp và dễ sử dụng – phù hợp cho trồng lan, bon sai, dâu tây, dưa lưới và nhiều loại cây trồng khác',
          image: '/assets/image/products/mun-dua-xu-ly/1-Nguyên liệu mụn dừa xử lý.jpg',
          url: '/san-pham#processed',
          tags: ['mụn dừa', 'xử lý', 'sạch', 'tơi xốp', 'nông nghiệp', 'canh tác', 'lan', 'bon sai', 'dua luoi', 'dâu tây']
        },
        {
          name: 'Vỏ Dừa Cắt Chip',
          description: 'Giá thể trồng cây sạch cho nông nghiệp hiện đại, kích thước 1–3cm hoặc theo yêu cầu. Phủ bề mặt, giữ ẩm, phòng sâu bệnh cho cây trồng',
          image: '/assets/image/products/vo-dua-cat-chip/1-Nguyên liệu vỏ dừa cắt chip.jpg',
          url: '/san-pham#chips',
          tags: ['vỏ dừa', 'cắt chip', 'chip', 'cắt', 'vo dua', 'giữ ẩm', 'phủ bề mặt', 'nông nghiệp', 'phong sau benh', 'trang trí', 'cây cảnh']
        },
        {
          name: 'Mụn Dừa Thô',
          description: 'Nguyên liệu thô, giá cả phải chăng, phân hủy tự nhiên. Thích hợp cho mô hình trồng trọt quy mô lớn',
          image: '/assets/image/products/mun-dua-tho/1-Nguyên liệu mụn dừa thô.jpg',
          url: '/san-pham#raw',
          tags: ['mụn dừa', 'thô', 'giá rẻ', 'quy mô lớn', 'nông nghiệp', 'nguyên liệu']
        },
        {
          name: 'Sản Xuất Theo Yêu Cầu',
          description: 'Tùy chỉnh sản phẩm mụn dừa theo nhu cầu nông nghiệp của khách hàng. Tỷ lệ trộn mụn/xơ linh hoạt từ 95/5 đến 50/50, kích thước và độ ẩm theo yêu cầu.',
          image: '/assets/image/products/san-xuat-theo-yeu-cau/1-NL sản xuất theo yêu cầu.jpg',
          url: '/san-pham#custom',
          tags: ['tùy chỉnh', 'theo yêu cầu', 'linh hoạt', 'nông nghiệp', 'đặt hàng', 'mụn dừa', 'sản xuất', 'tỷ lệ trộn', 'custom']
        }
      ],
      pages: [
        {
          title: 'Trang Chủ - Mụn Dừa Hoàng Hiếu',
          description: 'Giải pháp nông nghiệp xanh - Đồng hành cùng phát triển bền vững. Từ quê hương xứ dừa Bến Tre, chúng tôi chọn lọc những nguyên liệu tự nhiên để tạo nên các dòng giá thể mụn dừa sạch, tơi xốp và dễ sử dụng.',
          image: '/assets/image/banner/banner1.jpg',
          url: '/',
          tags: ['trang chủ', 'nông nghiệp', 'xanh', 'bền vững', 'giải pháp', 'môi trường', 'phát triển', 'tự nhiên', 'sạch', 'bến tre']
        },
        {
          title: 'Giới Thiệu - Mụn Dừa Hoàng Hiếu',
          description: 'Chúng tôi cung cấp sản phẩm mụn dừa chất lượng cao từ Bến Tre, hỗ trợ nông dân phát triển nông nghiệp bền vững. Triết lý: Kinh doanh không chỉ là bán sản phẩm, mà còn là gửi gắm sự chân thành.',
          image: '/assets/image/logo.svg',
          url: '/gioi-thieu',
          tags: ['giới thiệu', 'về chúng tôi', 'bến tre', 'xứ dừa', 'chất lượng', 'nông nghiệp', 'bền vững', 'triết lý', 'chân thành']
        },
        {
          title: 'Sản Phẩm - Mụn Dừa Hoàng Hiếu',
          description: 'Danh mục sản phẩm: Mụn Dừa Xử Lý, Vỏ Dừa Cắt Chip, Mụn Dừa Thô, Sản Xuất Theo Yêu Cầu. Quy trình sản xuất chất lượng cao.',
          image: '/assets/image/products/mun-dua-xu-ly/1-Nguyên liệu mụn dừa xử lý.jpg',
          url: '/san-pham',
          tags: ['sản phẩm', 'danh mục', 'mụn dừa', 'vỏ dừa', 'chip', 'quy trình', 'sản xuất']
        },
        {
          title: 'Liên Hệ - Mụn Dừa Hoàng Hiếu',
          description: 'Liên hệ với chúng tôi để được tư vấn miễn phí về sản phẩm mụn dừa phù hợp với nhu cầu canh tác của bạn. Địa chỉ: Ấp Hội An, Xã Đa Phước Hội, Huyện Mỏ Cày Nam, Tỉnh Bến Tre. Hotline: 0984.288.512',
          image: '/assets/image/Footer/Face.png',
          url: '/lien-he',
          tags: ['liên hệ', 'tư vấn', 'hỗ trợ', 'miễn phí', 'địa chỉ', 'bến tre', 'hotline', 'điện thoại']
        }
      ]
    };

    // Search function - strict matching (TẤT CẢ từ phải có)
    // Normalize Unicode (remove diacritics) to make searches robust for Vietnamese input
    const normalize = (s) => {
      if (!s) return '';
      return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
              .replace(/\s+/g, ' ').trim().toLowerCase();
    };

    const searchKeyword = keyword;
    const searchKeywordNorm = normalize(searchKeyword);
    const keywords = searchKeywordNorm.split(/\s+/).filter(k => k.length > 0); // Split thành từng từ (normalized)

    const searchInText = (text) => {
      if (!text) return false;
      const textNorm = normalize(text);

      // Tìm cụm từ đầy đủ trước (normalized)
      const hasFullPhrase = textNorm.includes(searchKeywordNorm);

      // Nếu không có cụm từ, kiểm tra TẤT CẢ các từ đều phải có (normalized)
      const hasAllKeywords = keywords.length > 0 && keywords.every(kw => textNorm.includes(kw));

      return hasFullPhrase || hasAllKeywords;
    };

    const results = {
      products: [],
      pages: [],
      total: 0
    };

    // Filter products
    results.products = allContent.products.filter(item => {
      const matchName = searchInText(item.name);
      const matchDesc = searchInText(item.description);
      const matchTags = item.tags && item.tags.some(tag => searchInText(tag));
      
      return matchName || matchDesc || matchTags;
    }).map(item => ({ ...item, type: 'product' }));

    // Filter pages (chỉ các trang thực tế: trang chủ, giới thiệu, sản phẩm, liên hệ)
    if (allContent.pages) {
      results.pages = allContent.pages.filter(item =>
        searchInText(item.title) ||
        searchInText(item.description) ||
        (item.tags && item.tags.some(tag => searchInText(tag)))
      ).map(item => ({ ...item, type: 'page' }));
    }

    results.total = results.products.length + results.pages.length;

    // Combine all results
    const allResults = [...results.products, ...results.pages];

    res.render('search', {
      currentPage: 'search',
      keyword,
      results: allResults,
      resultsByType: results,
      searchKeyword: searchKeyword
    });

  } catch (error) {
    console.error('Search error:', error);
    res.render('search', {
      currentPage: 'search',
      keyword: req.query.q || '',
      results: [],
      resultsByType: { products: [], pages: [], total: 0 },
      error: 'Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.'
    });
  }
});

// Individual product pages - same hero content, different sidebar focus
app.get('/mun-dua-xu-ly', (req, res) => {
  res.render('products', {
    currentPage: 'products',
    productFocus: 'processed',
    heroTitle: 'Sản Phẩm Mụn Dừa Chất Lượng Cao',
    heroSubtitle: 'Giải pháp toàn diện cho nông nghiệp hiện đại với mụn dừa xử lý sạch, an toàn'
  });
});

app.get('/vo-dua-cat-chip', (req, res) => {
  res.render('products', {
    currentPage: 'products',
    productFocus: 'chips',
    heroTitle: 'Sản Phẩm Mụn Dừa Chất Lượng Cao',
    heroSubtitle: 'Giải pháp toàn diện cho nông nghiệp hiện đại với mụn dừa xử lý sạch, an toàn'
  });
});

app.get('/mun-dua-tho', (req, res) => {
  res.render('products', {
    currentPage: 'products',
    productFocus: 'raw',
    heroTitle: 'Sản Phẩm Mụn Dừa Chất Lượng Cao',
    heroSubtitle: 'Giải pháp toàn diện cho nông nghiệp hiện đại với mụn dừa xử lý sạch, an toàn'
  });
});

app.get('/san-xuat-theo-yeu-cau', (req, res) => {
  res.render('products', {
    currentPage: 'products',
    productFocus: 'custom',
    heroTitle: 'Sản Phẩm Mụn Dừa Chất Lượng Cao',
    heroSubtitle: 'Giải pháp toàn diện cho nông nghiệp hiện đại với mụn dừa xử lý sạch, an toàn'
  });
});

// Test markdown integration
app.get('/test-markdown', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/test-markdown.html'));
});

// Demo markdown auto-update
app.get('/demo-markdown-update', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/demo-markdown-update.html'));
});

// Hướng dẫn cập nhật nội dung
app.get('/huong-dan-cap-nhat', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/huong-dan-cap-nhat.html'));
});

// Force update content
app.get('/force-update', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/force-update.html'));
});

// Clear cache page
app.get('/clear-cache', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/clear-cache.html'));
});

// Serve markdown files
app.use('/content', express.static(path.join(__dirname, '../content')));

app.get('/demo-json', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/demo-json.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get('/debug', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/debug.html'));
});

// Khởi động server
app.listen(PORT, () => {
  console.log(greet('Khách')); 
  console.log(`Server đang chạy trên:`);
  console.log(`- Local: http://localhost:${PORT}`);
  console.log(`- Network: http://172.16.0.2:${PORT}`);
  console.log(`- Network: http://10.30.3.71:${PORT}`);
  console.log(`\n🖥️  Test trên Chrome DevTools:`);
  console.log(`📱 F12 → Toggle Device Toolbar → Chọn iPhone/Android`);
});