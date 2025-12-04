const express = require('express');
const path = require('path');
const fs = require('fs');
const twig = require('twig');
const session = require('express-session');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

// Load environment variables from config
const config = require('../config/environment');
const db = require('../lib/database');

const app = express();
const PORT = config.PORT;
const { greet } = require('./utils');

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
// console.log(config.SESSION_SECRET, config.SECURE_COOKIES, config.SAME_SITE, config.SESSION_MAX_AGE);
// app.use(session({
//   secret: config.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     httpOnly: true,
//     secure: config.SECURE_COOKIES, // HTTPS only in production
//     sameSite: config.SAME_SITE,
//     maxAge: config.SESSION_MAX_AGE
//   }
// }));

// Cấu hình Twig
app.set('view engine', 'twig');
app.set('views', path.join(__dirname, '../views'));

// Middleware để serve static files từ thư mục public
app.use(express.static(path.join(__dirname, '../public')));

// ============ SEO Middleware ============
// Serve robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, '../public/robots.txt'));
});

// Serve sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(__dirname, '../public/sitemap.xml'));
});

// Add SEO meta headers
app.use((req, res, next) => {
  // Set canonical URL
  res.setHeader('Link', `<${req.protocol}://${req.get('host')}${req.originalUrl}>; rel="canonical"`);
  next();
});

// ============ Routes ============
const adminRoutes = require('./routes/admin');
const homeRoutes = require('./routes/home');
const newsRoutes = require('./routes/news');

app.use('/admin', adminRoutes);
app.use('/', homeRoutes);
app.use('/tin-tuc', newsRoutes);

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
app.get('/gioi-thieu', (req, res) => {
  res.render('about', {
    currentPage: 'about',
    philosophy: {
      title: 'Triết Lý Của Chúng Tôi',
      quote: 'Kinh doanh không chỉ là bán sản phẩm, mà còn là gửi gắm sự chân thành'
    },
    // SEO Data
    seo_title: 'Giới Thiệu – Mụn Dừa Hoàng Hiếu – Niềm Tin Là Giá Trị Cốt Lõi',
    seo_description: 'Cơ sở sản xuất Mụn Dừa Hoàng Hiếu từ Bến Tre – Lấy niềm tin và sự hài lòng của khách hàng làm kim chỉ nam. Sản phẩm uy tín, chất lượng cao, giá cả hợp lý, dịch vụ tận tâm.',
    seo_keywords: 'giới thiệu mụn dừa hoàng hiếu, cơ sở sản xuất mụn dừa, mụn dừa Bến Tre, uy tín chất lượng, triết lý kinh doanh',
    current_url: 'https://munduahoanghieu.com/gioi-thieu',
    og_image: 'https://munduahoanghieu.com/assets/image/logo.svg'
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
    // SEO Data
    seo_title: 'Sản Phẩm – Mụn Dừa Xử Lý – Vỏ Dừa Cắt Chip – Giá Thể Sạch',
    seo_description: 'Danh mục sản phẩm mụn dừa chất lượng cao: Mụn Dừa Xử Lý (tơi xốp, EC thấp), Vỏ Dừa Cắt Chip (phủ bề mặt, giữ ẩm), Mụn Dừa Thô (giá rẻ), Sản Xuất Theo Yêu Cầu (tùy chỉnh linh hoạt).',
    seo_keywords: 'mụn dừa xử lý, vỏ dừa cắt chip, mụn dừa thô, giá thể mụn dừa, sản phẩm mụn dừa, mụn dừa chất lượng cao',
    current_url: 'https://munduahoanghieu.com/san-pham',
    og_image: 'https://munduahoanghieu.com/assets/image/products/mun-dua-xu-ly/1-Nguyên liệu mụn dừa xử lý.jpg',
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

app.get('/lien-he', (req, res) => {
  res.render('contact', {
    currentPage: 'contact',
    searchPlaceholder: 'Tìm kiếm...',
    // SEO Data
    seo_title: 'Liên Hệ – Mụn Dừa Hoàng Hiếu – Tư Vấn Miễn Phí – Hotline: 0984.288.512',
    seo_description: 'Liên hệ Mụn Dừa Hoàng Hiếu để được tư vấn miễn phí về sản phẩm mụn dừa. Địa chỉ: Ấp Hội An, Xã Đa Phước Hội, Huyện Mỏ Cày Nam, Tỉnh Bến Tre. Hotline: 0984.288.512',
    seo_keywords: 'liên hệ mụn dừa hoàng hiếu, tư vấn mụn dừa, hotline mụn dừa, địa chỉ mua mụn dừa Bến Tre, liên hệ giá thể',
    current_url: 'https://munduahoanghieu.com/lien-he',
    og_image: 'https://munduahoanghieu.com/assets/image/Footer/Face.png'
  });
});

app.get('/contact', (req, res) => {
  res.render('contact', {
    currentPage: 'contact',
    searchPlaceholder: 'Tìm kiếm...',
    // SEO Data
    seo_title: 'Liên Hệ – Mụn Dừa Hoàng Hiếu – Tư Vấn Miễn Phí – Hotline: 0984.288.512',
    seo_description: 'Liên hệ Mụn Dừa Hoàng Hiếu để được tư vấn miễn phí về sản phẩm mụn dừa. Địa chỉ: Ấp Hội An, Xã Đa Phước Hội, Huyện Mỏ Cày Nam, Tỉnh Bến Tre. Hotline: 0984.288.512',
    seo_keywords: 'liên hệ mụn dừa hoàng hiếu, tư vấn mụn dừa, hotline mụn dừa, địa chỉ mua mụn dừa Bến Tre, liên hệ giá thể',
    current_url: 'https://munduahoanghieu.com/lien-he',
    og_image: 'https://munduahoanghieu.com/assets/image/Footer/Face.png'
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
    heroSubtitle: 'Giải pháp toàn diện cho nông nghiệp hiện đại với mụn dừa xử lý sạch, an toàn',
    // SEO Data
    seo_title: 'Mụn Dừa Xử Lý – Giá Thể Sạch, Tơi Xốp – EC Thấp, pH Chuẩn',
    seo_description: 'Mụn Dừa Xử Lý chất lượng cao – giá thể sạch, tơi xốp, EC thấp, pH chuẩn. Phù hợp trồng lan, bon sai, dâu tây, dưa lưới và nhiều loại cây trồng. Không tannin, khử muối hoàn toàn.',
    seo_keywords: 'mụn dừa xử lý, giá thể mụn dừa sạch, mụn dừa EC thấp, giá thể trồng lan, giá thể dưa lưới, mụn dừa không tannin',
    current_url: 'https://munduahoanghieu.com/mun-dua-xu-ly',
    og_image: 'https://munduahoanghieu.com/assets/image/products/mun-dua-xu-ly/1-Nguyên liệu mụn dừa xử lý.jpg'
  });
});

app.get('/vo-dua-cat-chip', (req, res) => {
  res.render('products', {
    currentPage: 'products',
    productFocus: 'chips',
    heroTitle: 'Sản Phẩm Mụn Dừa Chất Lượng Cao',
    heroSubtitle: 'Giải pháp toàn diện cho nông nghiệp hiện đại với mụn dừa xử lý sạch, an toàn',
    // SEO Data
    seo_title: 'Vỏ Dừa Cắt Chip – Phủ Bề Mặt – Giữ Ẩm – Phòng Sâu Bệnh',
    seo_description: 'Vỏ Dừa Cắt Chip kích thước 1-3cm – giá thể trồng cây sạch. Phủ bề mặt, giữ ẩm tốt, phòng sâu bệnh, trang trí cây cảnh. Phù hợp nông nghiệp hiện đại và làm vườn.',
    seo_keywords: 'vỏ dừa cắt chip, chip dừa, giá thể phủ bề mặt, vỏ dừa giữ ẩm, chip dừa trang trí, vỏ dừa phòng sâu bệnh',
    current_url: 'https://munduahoanghieu.com/vo-dua-cat-chip',
    og_image: 'https://munduahoanghieu.com/assets/image/products/vo-dua-cat-chip/1-Nguyên liệu vỏ dừa cắt chip.jpg'
  });
});

app.get('/mun-dua-tho', (req, res) => {
  res.render('products', {
    currentPage: 'products',
    productFocus: 'raw',
    heroTitle: 'Sản Phẩm Mụn Dừa Chất Lượng Cao',
    heroSubtitle: 'Giải pháp toàn diện cho nông nghiệp hiện đại với mụn dừa xử lý sạch, an toàn',
    // SEO Data
    seo_title: 'Mụn Dừa Thô – Nguyên Liệu Giá Rẻ – Quy Mô Lớn – Phân Hủy Tự Nhiên',
    seo_description: 'Mụn Dừa Thô nguyên liệu, giá cả phải chăng, phân hủy tự nhiên. Thích hợp cho mô hình trồng trọt quy mô lớn, nông nghiệp công nghệ cao, cải tạo đất.',
    seo_keywords: 'mụn dừa thô, mụn dừa giá rẻ, nguyên liệu mụn dừa, mụn dừa quy mô lớn, giá thể rẻ, mụn dừa nông nghiệp',
    current_url: 'https://munduahoanghieu.com/mun-dua-tho',
    og_image: 'https://munduahoanghieu.com/assets/image/products/mun-dua-tho/1-Nguyên liệu mụn dừa thô.jpg'
  });
});

app.get('/san-xuat-theo-yeu-cau', (req, res) => {
  res.render('products', {
    currentPage: 'products',
    productFocus: 'custom',
    heroTitle: 'Sản Phẩm Mụn Dừa Chất Lượng Cao',
    heroSubtitle: 'Giải pháp toàn diện cho nông nghiệp hiện đại với mụn dừa xử lý sạch, an toàn',
    // SEO Data
    seo_title: 'Sản Xuất Theo Yêu Cầu – Tùy Chỉnh Mụn Dừa – Tỷ Lệ Trộn Linh Hoạt',
    seo_description: 'Sản xuất mụn dừa theo yêu cầu khách hàng. Tỷ lệ trộn mụn/xơ linh hoạt từ 95/5 đến 50/50, kích thước và độ ẩm tùy chỉnh. Đáp ứng mọi nhu cầu nông nghiệp đặc biệt.',
    seo_keywords: 'sản xuất mụn dừa theo yêu cầu, mụn dừa tùy chỉnh, đặt hàng mụn dừa, tỷ lệ trộn mụn xơ, mụn dừa custom',
    current_url: 'https://munduahoanghieu.com/san-xuat-theo-yeu-cau',
    og_image: 'https://munduahoanghieu.com/assets/image/products/san-xuat-theo-yeu-cau/1-NL sản xuất theo yêu cầu.jpg'
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