-- ============================================
-- DATABASE SCHEMA CHO TRANG CHỦ (HOMEPAGE)
-- Website: Mụn Dừa Hoàng Hiếu
-- Mục đích: Lưu trữ tất cả nội dung động của trang chủ
-- ============================================

-- Xóa bảng cũ nếu tồn tại (để test lại từ đầu)
DROP TABLE IF EXISTS homepage_gallery_items;
DROP TABLE IF EXISTS homepage_contact_buttons;
DROP TABLE IF EXISTS homepage_why_choose_items;
DROP TABLE IF EXISTS homepage_featured_products;
DROP TABLE IF EXISTS homepage_service_features;
DROP TABLE IF EXISTS homepage_banners;
DROP TABLE IF EXISTS homepage_settings;

-- ============================================
-- 1. BẢNG: homepage_banners (Banner slideshow đầu trang)
-- ============================================
CREATE TABLE homepage_banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(500) NOT NULL COMMENT 'Đường dẫn ảnh banner',
    title VARCHAR(200) NOT NULL COMMENT 'Tiêu đề lớn banner',
    subtitle VARCHAR(300) NULL COMMENT 'Phụ đề banner',
    button_text VARCHAR(100) NULL COMMENT 'Text nút CTA',
    button_link VARCHAR(500) NULL COMMENT 'Link nút CTA',
    button_color ENUM('orange', 'blue', 'green') DEFAULT 'green' COMMENT 'Màu nút: orange/blue/green',
    sort_order INT DEFAULT 0 COMMENT 'Thứ tự hiển thị (càng nhỏ càng trước)',
    active BOOLEAN DEFAULT TRUE COMMENT 'Banner có đang hiển thị không',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active_sort (active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Banner slideshow trang chủ';

-- ============================================
-- 2. BẢNG: homepage_service_features (Box "Tại sao chọn Hoàng Hiếu")
-- ============================================
CREATE TABLE homepage_service_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    icon VARCHAR(50) NOT NULL COMMENT 'Icon (emoji hoặc class)',
    title VARCHAR(200) NOT NULL COMMENT 'Tiêu đề tính năng',
    description TEXT NULL COMMENT 'Mô tả chi tiết',
    sort_order INT DEFAULT 0 COMMENT 'Thứ tự hiển thị',
    active BOOLEAN DEFAULT TRUE COMMENT 'Có hiển thị không',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active_sort (active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Các tính năng dịch vụ nổi bật (box xanh đầu trang)';

-- ============================================
-- 3. BẢNG: homepage_why_choose_items (4 lý do chọn Mụn Dừa Hoàng Hiếu)
-- ============================================
CREATE TABLE homepage_why_choose_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    icon VARCHAR(50) NOT NULL COMMENT 'Icon emoji (🏆, 💚, 💰, 🤝)',
    title VARCHAR(200) NOT NULL COMMENT 'Tiêu đề lý do',
    description TEXT NOT NULL COMMENT 'Mô tả chi tiết',
    background_color VARCHAR(50) DEFAULT 'bg-white' COMMENT 'Class Tailwind cho màu nền vòng tròn',
    text_color VARCHAR(50) DEFAULT 'text-white' COMMENT 'Class Tailwind cho màu chữ icon',
    sort_order INT DEFAULT 0 COMMENT 'Thứ tự hiển thị (1-4)',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active_sort (active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='4 lý do chọn Mụn Dừa Hoàng Hiếu (phần icon to màu)';

-- ============================================
-- 4. BẢNG: homepage_featured_products (Sản phẩm nổi bật)
-- ============================================
CREATE TABLE homepage_featured_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NULL COMMENT 'ID liên kết đến bảng products (nếu có)',
    name VARCHAR(200) NOT NULL COMMENT 'Tên sản phẩm',
    description TEXT NULL COMMENT 'Mô tả ngắn',
    image VARCHAR(500) NOT NULL COMMENT 'Ảnh sản phẩm',
    link VARCHAR(500) NULL COMMENT 'Link chi tiết sản phẩm',
    sort_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active_sort (active, sort_order),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Sản phẩm nổi bật hiển thị trên trang chủ';

-- ============================================
-- 5. BẢNG: homepage_gallery_items (Gallery hình ảnh)
-- ============================================
CREATE TABLE homepage_gallery_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(500) NOT NULL COMMENT 'Đường dẫn ảnh',
    alt VARCHAR(200) NULL COMMENT 'Alt text cho SEO',
    caption VARCHAR(300) NULL COMMENT 'Chú thích ảnh',
    gallery_type ENUM('products', 'results', 'process') DEFAULT 'products' COMMENT 'Loại gallery: sản phẩm/kết quả/quy trình',
    sort_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type_active_sort (gallery_type, active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Gallery hình ảnh (sản phẩm, kết quả, quy trình)';

-- ============================================
-- 6. BẢNG: homepage_contact_buttons (Nút liên hệ nhanh)
-- ============================================
CREATE TABLE homepage_contact_buttons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    icon VARCHAR(50) NOT NULL COMMENT 'Icon emoji (📞, 💬, 📧)',
    text VARCHAR(100) NOT NULL COMMENT 'Text hiển thị trên nút',
    link VARCHAR(500) NOT NULL COMMENT 'Link (tel:, mailto:, https://zalo.me/...)',
    button_color VARCHAR(50) DEFAULT 'bg-green-600' COMMENT 'Class Tailwind màu nền nút',
    hover_color VARCHAR(50) DEFAULT 'bg-green-700' COMMENT 'Class Tailwind màu hover',
    sort_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active_sort (active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Nút liên hệ nhanh ở footer trang chủ';

-- ============================================
-- 7. BẢNG: homepage_settings (Cài đặt nội dung trang chủ)
-- ============================================
CREATE TABLE homepage_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL COMMENT 'Key cài đặt (VD: service_highlight_title)',
    setting_value TEXT NULL COMMENT 'Giá trị text',
    setting_json JSON NULL COMMENT 'Giá trị JSON (cho object phức tạp)',
    description VARCHAR(500) NULL COMMENT 'Mô tả setting này dùng để làm gì',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cài đặt chung cho trang chủ (title, subtitle, intro text...)';

-- ============================================
-- INSERT DỮ LIỆU MẪU (Migrate từ JSON hiện tại)
-- ============================================

-- 1. Banners
INSERT INTO homepage_banners (image, title, subtitle, button_text, button_link, button_color, sort_order, active) VALUES
('/assets/image/banner/banner1.jpg', 'MỤN DỪA HOÀNG HIẾU', 'Giá thể sạch – Năng suất vượt trội', 'Khám phá sản phẩm', '/san-pham', 'green', 1, TRUE),
('/assets/image/banner/banner2.jpg', 'NÔNG NGHIỆP XANH', 'Sản phẩm thân thiện với môi trường', 'Tìm hiểu thêm', '/gioi-thieu', 'green', 2, TRUE),
('/assets/image/banner/banner3.jpg', 'CHẤT LƯỢNG ĐẢM BẢO', 'Cam kết 100% sản phẩm tự nhiên', 'Liên hệ ngay', '/lien-he', 'green', 3, TRUE);

-- 2. Service Features (Box highlight)
INSERT INTO homepage_service_features (icon, title, description, sort_order, active) VALUES
('✅', 'Sản phẩm đạt tiêu chuẩn chất lượng cao', 'pH ổn định, không mùi hôi', 1, TRUE),
('💰', 'Giá cả hợp túi tiền', 'Phù hợp với mọi quy mô nhà vườn', 2, TRUE),
('🚚', 'Giao hàng nhanh chóng', 'Hỗ trợ vận chuyển toàn quốc', 3, TRUE),
('💚', 'Tư vấn tận tình', 'Hỗ trợ kỹ thuật 24/7', 4, TRUE);

-- 3. Why Choose Us (4 lý do chọn)
INSERT INTO homepage_why_choose_items (icon, title, description, background_color, text_color, sort_order, active) VALUES
('🏆', 'Chất Lượng Đảm Bảo', '100% sản phẩm tự nhiên, quy trình xử lý được kiểm tra kỹ lưỡng.', 'bg-white', 'text-black', 1, TRUE),
('💚', 'Thân Thiện Môi Trường', 'Nguyên liệu tự nhiên, hoàn toàn không sử dụng hóa chất độc hại.', 'bg-green-600', 'text-white', 2, TRUE),
('💰', 'Giá Cả Hợp Lý', 'Giá gốc từ nhà sản xuất, không qua trung gian.', 'bg-orange-600', 'text-white', 3, TRUE),
('🤝', 'Đồng Hành Lâu Dài', 'Luôn đồng hành cùng nhà vườn, phát triển bền vững.', 'bg-blue-500', 'text-white', 4, TRUE);

-- 4. Featured Products
INSERT INTO homepage_featured_products (name, description, image, link, sort_order, active) VALUES
('Mụn dừa đã xử lý', 'Tỷ lệ xơ-mụn đáp ứng theo yêu cầu của bạn', '/assets/image/products/noi-bat/1-Mun dua xu ly.jpg', '/san-pham', 1, TRUE),
('Vỏ dừa cắt chip', 'Vỏ dừa được cắt thành từng miếng nhỏ, tiện lợi sử dụng', '/assets/image/products/noi-bat/2-Vo dua cat chip.jpg', '/san-pham', 2, TRUE),
('Mụn dừa thô', 'Nguyên liệu mụn dừa tự nhiên chưa qua xử lý', '/assets/image/products/noi-bat/3-Mun dua tho.jpg', '/san-pham', 3, TRUE),
('Sản xuất theo yêu cầu KH', 'Phối trộn theo tỷ lệ và yêu cầu cụ thể của khách hàng', '/assets/image/products/noi-bat/4-Theo yeu cau.jpg', '/san-pham', 4, TRUE);

-- 5. Gallery Items - Products
INSERT INTO homepage_gallery_items (image, alt, caption, gallery_type, sort_order, active) VALUES
('/assets/image/gallery/products/1-Xu ly.jpg', 'Mụn dừa xử lý', 'Mụn dừa xử lý chất lượng cao', 'products', 1, TRUE),
('/assets/image/gallery/products/2-Xu ly.jpg', 'Mụn dừa xử lý', 'Sản phẩm đạt tiêu chuẩn', 'products', 2, TRUE),
('/assets/image/gallery/products/3-Chip.jpg', 'Vỏ dừa cắt chip', 'Vỏ dừa cắt chip đồng đều', 'products', 3, TRUE),
('/assets/image/gallery/products/4-Chip.jpg', 'Vỏ dừa chip', 'Chip vỏ dừa tự nhiên', 'products', 4, TRUE),
('/assets/image/gallery/products/5-Mun tho.jpg', 'Mụn dừa thô', 'Mụn dừa thô nguyên chất', 'products', 5, TRUE),
('/assets/image/gallery/products/6-Mun tho.jpg', 'Mụn dừa thô', 'Nguyên liệu chất lượng', 'products', 6, TRUE),
('/assets/image/gallery/products/7-Theo yeu cau.jpg', 'Sản xuất theo yêu cầu', 'Phối trộn theo yêu cầu', 'products', 7, TRUE),
('/assets/image/gallery/products/8-Theo yeu cau.jpg', 'Theo yêu cầu', 'Tùy chỉnh linh hoạt', 'products', 8, TRUE);

-- 6. Gallery Items - Results
INSERT INTO homepage_gallery_items (image, alt, caption, gallery_type, sort_order, active) VALUES
('/assets/image/gallery/results/dưa lưới.png', 'Dưa lưới', 'Dưa lưới phát triển tốt', 'results', 1, TRUE),
('/assets/image/gallery/results/Cà chua.png', 'Cà chua', 'Cà chua trái to đều', 'results', 2, TRUE),
('/assets/image/gallery/results/ớt chuông.png', 'Ớt chuông', 'Ớt chuông năng suất cao', 'results', 3, TRUE),
('/assets/image/gallery/results/hoa lan.png', 'Hoa lan', 'Hoa lan nở đẹp', 'results', 4, TRUE),
('/assets/image/gallery/results/Dưa vàng.png', 'Dưa vàng', 'Dưa vàng chất lượng', 'results', 5, TRUE),
('/assets/image/gallery/results/cà chua 1.jpg', 'Cà chua', 'Vườn cà chua xanh tốt', 'results', 6, TRUE),
('/assets/image/gallery/results/dâu tây.png', 'Dâu tây', 'Dâu tây quả ngọt', 'results', 7, TRUE),
('/assets/image/gallery/results/lan tim.png', 'Lan tím', 'Lan tím nở rộ', 'results', 8, TRUE);

-- 7. Contact Buttons
INSERT INTO homepage_contact_buttons (icon, text, link, button_color, hover_color, sort_order, active) VALUES
('📞', 'Gọi ngay', 'tel:0984288512', 'bg-green-600', 'bg-green-700', 1, TRUE),
('💬', 'Chat Zalo', 'https://zalo.me/112949426040780264', 'bg-blue-600', 'bg-blue-700', 2, TRUE),
('📧', 'Email', 'mailto:munduahoanghieu.vn@gmail.com', 'bg-orange-600', 'bg-orange-700', 3, TRUE);

-- 8. Homepage Settings
INSERT INTO homepage_settings (setting_key, setting_value, setting_json, description) VALUES
('service_highlight_icon', '🌱', NULL, 'Icon cho box highlight service'),
('service_highlight_title', 'Hoàng Hiếu – Gieo chân thành, gặt niềm tin!', NULL, 'Tiêu đề box highlight'),
('service_highlight_description', 'Dù bạn là khách hàng lâu năm hay lần đầu ghé thăm, chúng tôi đều trân trọng như nhau. Hãy để Hoàng Hiếu là bạn đồng hành tin cậy trên hành trình nông nghiệp của bạn!', NULL, 'Mô tả box highlight'),
('featured_products_title', 'Sản Phẩm Nổi Bật', NULL, 'Tiêu đề section sản phẩm nổi bật'),
('featured_products_subtitle', 'Khám phá các sản phẩm mụn dừa chất lượng cao của chúng tôi', NULL, 'Phụ đề section sản phẩm nổi bật'),
('gallery_title', 'Hình Ảnh Sản Phẩm', NULL, 'Tiêu đề section gallery'),
('why_choose_title', 'Tại Sao Chọn Mụn Dừa Hoàng Hiếu?', NULL, 'Tiêu đề section why choose us'),
('contact_section_title', 'Liên Hệ Với Chúng Tôi', NULL, 'Tiêu đề section contact'),
('contact_section_subtitle', 'Chúng tôi luôn sẵn sàng hỗ trợ bạn', NULL, 'Phụ đề section contact');

-- ============================================
-- INDEXES BỔ SUNG ĐỂ TỐI ƯU QUERY
-- ============================================
-- Đã tạo sẵn trong CREATE TABLE

-- ============================================
-- KẾT THÚC SCHEMA TRANG CHỦ
-- ============================================
