# SEO Optimization Guide - Mụn Dừa Hoàng Hiếu

## 📋 Tóm tắt các tệp SEO được tạo

### 1. **robots.txt**
**Vị trí:** `/public/robots.txt`

Tệp này hướng dẫn các search engine crawlers (Googlebot, Bingbot, v.v.) về những trang nào cần index và những trang nào cần bỏ qua.

#### Nội dung chính:
```
✅ Cho phép indexing:
- / (trang chủ)
- /san-pham (sản phẩm)
- /gioi-thieu (giới thiệu)
- /lien-he (liên hệ)
- /search (tìm kiếm)
- /tin-tuc (tin tức)

❌ Không cho phép indexing:
- /admin/* (trang quản trị)
- /debug (trang debug)
- /api/* (API endpoints)
- /test-*, /demo-* (trang test/demo)
```

#### Sitemap URLs:
```
Sitemap: https://munduahoanghieu.com/sitemap.xml
Sitemap: https://www.munduahoanghieu.com/sitemap.xml
```

#### Crawler Delays:
- Googlebot: Crawl delay = 0 (không giới hạn)
- Bingbot: Crawl delay = 1 giây
- Các crawler khác: Crawl delay = 1 giây
- Request rate: 1 request/giây

---

### 2. **sitemap.xml**
**Vị trí:** `/public/sitemap.xml`

Tệp XML này liệt kê tất cả các URL công khai trên website cùng với metadata quan trọng.

#### URLs được include:

| URL | Mục đích | Changefreq | Priority |
|-----|----------|-----------|----------|
| / | Trang chủ | weekly | 1.0 |
| /san-pham | Danh mục sản phẩm | weekly | 0.9 |
| /gioi-thieu | Giới thiệu công ty | monthly | 0.8 |
| /lien-he | Trang liên hệ | monthly | 0.7 |
| /tin-tuc | Tin tức | weekly | 0.8 |
| /search | Trang tìm kiếm | weekly | 0.6 |
| /mun-dua-xu-ly | Chi tiết sản phẩm 1 | monthly | 0.8 |
| /vo-dua-cat-chip | Chi tiết sản phẩm 2 | monthly | 0.8 |
| /mun-dua-tho | Chi tiết sản phẩm 3 | monthly | 0.8 |
| /san-xuat-theo-yeu-cau | Chi tiết sản phẩm 4 | monthly | 0.8 |

#### Image Sitemap:
Sitemap cũng bao gồm các hình ảnh với URL và tiêu đề, giúp Google Images indexing.

---

## 🚀 Cách sử dụng

### Bước 1: Xác minh trên Google Search Console
1. Truy cập: https://search.google.com/search-console
2. Thêm property: `https://munduahoanghieu.com`
3. Xác minh quyền sở hữu (dùng file `robots.txt` hoặc DNS)
4. Vào **Sitemaps** → Thêm `sitemap.xml`

### Bước 2: Xác minh trên Bing Webmaster Tools
1. Truy cập: https://www.bing.com/webmasters
2. Thêm trang web của bạn
3. Upload `sitemap.xml`

### Bước 3: Kiểm tra robots.txt
```
Truy cập: https://munduahoanghieu.com/robots.txt
```

### Bước 4: Kiểm tra sitemap.xml
```
Truy cập: https://munduahoanghieu.com/sitemap.xml
```

---

## 📝 Cách cập nhật Sitemap

### Nếu bạn thêm trang mới:
1. Mở `/public/sitemap.xml`
2. Thêm phần tử `<url>` mới:
```xml
<url>
  <loc>https://munduahoanghieu.com/trang-moi</loc>
  <lastmod>2025-01-24</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```
3. Lưu và tiếp tục

### Nếu bạn thêm sản phẩm mới:
1. Cập nhật `/public/sitemap.xml` tương tự
2. Cập nhật `/public/robots.txt` nếu cần (tuỳ trường hợp)
3. Google sẽ tự động crawl trong vài ngày

---

## 🔧 Cách cập nhật robots.txt

### Chặn một đường dẫn mới:
```
Disallow: /trang-can-an-toan
```

### Cho phép crawl một đường dẫn cụ thể:
```
Allow: /trang-can-an-toan/public-page
```

### Cài đặt Crawl-delay cho crawler cụ thể:
```
User-agent: Bingbot
Crawl-delay: 2
```

---

## 📊 SEO Best Practices đã áp dụng

✅ **Canonical URLs**: Mỗi trang có URL canonical để tránh duplicate content
✅ **Robots.txt**: Hướng dẫn crawlers indexing đúng trang
✅ **Sitemap.xml**: Giúp search engines tìm tất cả URLs nhanh hơn
✅ **Image Sitemap**: Bao gồm ảnh để tối ưu hóa Google Images
✅ **Proper Priority**: Trang chủ (1.0), trang quan trọng (0.9), trang phụ (0.6-0.7)
✅ **Changefreq**: Giúp crawlers biết cập nhật trang bao lâu một lần

---

## 🎯 Khuyến nghị SEO bổ sung

### 1. **Meta Tags** (Cần thêm vào layout.twig)
```html
<meta name="description" content="Mô tả trang (150 ký tự)">
<meta name="keywords" content="từ khóa 1, từ khóa 2, từ khóa 3">
<meta name="author" content="Mụn Dừa Hoàng Hiếu">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta property="og:title" content="Tiêu đề Open Graph">
<meta property="og:description" content="Mô tả Open Graph">
<meta property="og:image" content="https://munduahoanghieu.com/assets/image/logo.svg">
<meta property="og:url" content="https://munduahoanghieu.com/">
```

### 2. **Structured Data** (Schema.org)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Mụn Dừa Hoàng Hiếu",
  "url": "https://munduahoanghieu.com",
  "logo": "https://munduahoanghieu.com/assets/image/logo.svg",
  "description": "Giải pháp nông nghiệp xanh - Mụn dừa chất lượng cao từ Bến Tre",
  "sameAs": [
    "https://www.facebook.com/munduahoanghieu",
    "https://www.instagram.com/munduahoanghieu"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "0984.288.512",
    "contactType": "Customer Service"
  }
}
</script>
```

### 3. **Internal Linking**
- Liên kết các trang liên quan (sản phẩm → giới thiệu → liên hệ)
- Sử dụng anchor text mô tả (không phải "click here")

### 4. **Mobile Optimization**
- Đảm bảo responsive design ✓ (đã có)
- Kiểm tra tốc độ tải: https://pagespeed.web.dev

### 5. **Content SEO**
- Sử dụng heading (H1, H2, H3) đúng cách
- Viết nội dung tự nhiên với từ khóa liên quan
- Tối thiểu 300 ký tự cho mỗi trang

---

## 📈 Monitoring & Analytics

### Công cụ SEO miễn phí:
1. **Google Search Console**: https://search.google.com/search-console
2. **Google Analytics**: https://analytics.google.com
3. **Bing Webmaster Tools**: https://www.bing.com/webmasters
4. **Google PageSpeed Insights**: https://pagespeed.web.dev
5. **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly

---

## ✅ Checklist hoàn tất

- [x] Tạo robots.txt
- [x] Tạo sitemap.xml
- [x] Thêm middleware serve robots.txt & sitemap.xml
- [x] Thêm canonical URL headers
- [ ] Thêm meta tags vào layout.twig
- [ ] Thêm structured data (schema.org)
- [ ] Xác minh trên Google Search Console
- [ ] Xác minh trên Bing Webmaster Tools
- [ ] Kiểm tra mobile-friendly
- [ ] Tối ưu tốc độ tải trang
- [ ] Thêm Google Analytics (nếu chưa)

---

**Lần cập nhật cuối:** 24/01/2025
**Tác giả:** GitHub Copilot
