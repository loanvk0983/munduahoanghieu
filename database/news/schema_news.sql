-- SQL Database for Mụn Dừa Hoàng Hiếu - News Module
-- Created based on mockNewsData structure from views/news.twig

-- ============================================
-- 1. CREATE NEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS news (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    excerpt VARCHAR(500),
    category VARCHAR(50) NOT NULL,
    category_name VARCHAR(100),
    date VARCHAR(20),
    views INT DEFAULT 0,
    cover VARCHAR(300),
    content LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_date (date),
    INDEX idx_views (views)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. CREATE NEWS_CATEGORIES TABLE (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS news_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    news_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
    UNIQUE KEY unique_news_category (news_id, category),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. CREATE NEWS_IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS news_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    news_id INT NOT NULL,
    image_url VARCHAR(300) NOT NULL,
    alt_text VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
    INDEX idx_news_id (news_id),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. CREATE NEWS_VIEWS TABLE (Track view history)
-- ============================================
CREATE TABLE IF NOT EXISTS news_views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    news_id INT NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_ip VARCHAR(50),
    user_agent VARCHAR(500),
    FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
    INDEX idx_news_id (news_id),
    INDEX idx_viewed_at (viewed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. CREATE NEWS_INTERACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS news_interactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    news_id INT NOT NULL,
    user_ip VARCHAR(50),
    is_useful BOOLEAN DEFAULT FALSE,
    is_saved BOOLEAN DEFAULT FALSE,
    shared_platform VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
    INDEX idx_news_id (news_id),
    INDEX idx_created_at (created_at),
    UNIQUE KEY unique_user_interaction (news_id, user_ip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. INSERT MOCK DATA INTO news TABLE
-- ============================================
INSERT INTO news (id, title, excerpt, category, category_name, date, views, cover, content) VALUES
(1, 'Làm thế nào để phân biệt mụn dừa đã xử lý và mụn dừa chưa xử lý', 
'Hướng dẫn chi tiết cách nhận biết mụn dừa đã qua xử lý để đảm bảo chất lượng cho cây trồng...', 
'techniques', 'Kỹ Thuật', '23/10/2025', 0, 
'/assets/image/News/1.1-Mun%20da%20xu%20ly.jpg', 
'<h3 class="text-3xl font-bold text-green-700 mb-6">Phân Biệt Mụn Dừa Xử Lý & Chưa Xử Lý</h3><p>Màu sắc, cảm quan và các chỉ số kỹ thuật là những yếu tố quan trọng để phân biệt mụn dừa đã xử lý và chưa xử lý...</p>'),

(2, 'Những tác dụng của xơ dừa đối với cây trồng', 
'Xơ dừa không chỉ giúp giữ ẩm mà còn cải thiện cấu trúc đất, tăng cường hệ vi sinh...', 
'benefits', 'Lợi Ích & Môi Trường', '22/10/2025', 980, 
'/assets/image/News/2.2-Tac%20dung%20cua%20xo%20dua.jpg', 
'<h2>Lợi ích nổi bật</h2><p>Xơ dừa giữ ẩm tốt, giúp bộ rễ không bị sốc nhiệt khi thời tiết thay đổi...</p>'),

(3, 'Một số lưu ý khi sử dụng mụn dừa', 
'Để tối ưu hiệu quả sử dụng mụn dừa, bạn cần chú ý đến độ ẩm, pH, và cách trộn phối...', 
'techniques', 'Kỹ Thuật', '21/10/2025', 1100, 
'/assets/image/News/3.1-Luu%20y.jpg', 
'<h2>Độ ẩm và thoát nước</h2><p>Luôn duy trì độ ẩm của mụn dừa khoảng 60-70%...</p>'),

(4, 'Mụn dừa là gì và tại sao được sử dụng trong trồng cây', 
'Tìm hiểu về nguồn gốc, đặc tính và ứng dụng của mụn dừa trong nông nghiệp hiện đại...', 
'knowledge', 'Kiến Thức Cơ Bản', '20/10/2025', 1450, 
'/assets/image/News/4-1-Mua%20dua%20co%20tac%20dung%20gi.jpg', 
'<h2>Nguồn gốc</h2><p>Mụn dừa được tách ra trong quá trình sơ chế vỏ dừa...</p>'),

(5, 'Những lợi ích của mụn dừa cho cây trồng và môi trường', 
'Mụn dừa không chỉ tốt cho cây trồng mà còn góp phần bảo vệ môi trường bền vững...', 
'benefits', 'Lợi Ích & Môi Trường', '19/10/2025', 890, 
'/assets/image/News/5-1-.jpg', 
'<h2>Lợi ích cho cây trồng</h2><p>Mụn dừa tạo môi trường thoáng khí, giàu hữu cơ...</p>');

-- ============================================
-- 7. INSERT INTO news_categories (Multi-category support)
-- ============================================
INSERT INTO news_categories (news_id, category) VALUES
(1, 'knowledge'),
(1, 'techniques'),
(2, 'benefits'),
(2, 'techniques'),
(3, 'knowledge'),
(3, 'techniques'),
(3, 'experience'),
(4, 'knowledge'),
(4, 'benefits'),
(5, 'benefits'),
(5, 'experience');

-- ============================================
-- 8. INSERT INTO news_images
-- ============================================
INSERT INTO news_images (news_id, image_url, alt_text, display_order) VALUES
(1, '/assets/image/News/1.1-Mun%20da%20xu%20ly.jpg', 'Mụn dừa đã xử lý', 1),
(1, '/assets/image/News/1.2-Mun%20chua%20xu%20ly.jpg', 'Mụn dừa chưa xử lý', 2),
(2, '/assets/image/News/2.2-Tac%20dung%20cua%20xo%20dua.jpg', 'Tác dụng xơ dừa', 1),
(3, '/assets/image/News/3.1-Luu%20y.jpg', 'Lưu ý sử dụng mụn dừa', 1),
(3, '/assets/image/News/3.2-Luu%20y.jpg', 'Lưu ý sử dụng - phần 2', 2),
(3, '/assets/image/News/3.3-Luu%20y.jpg', 'Lưu ý sử dụng - phần 3', 3),
(4, '/assets/image/News/4-1-Mua%20dua%20co%20tac%20dung%20gi.jpg', 'Mụn dừa là gì', 1),
(4, '/assets/image/News/4.2-Mua%20dua%20co%20tac%20dung%20gi.jpg', 'Ứng dụng mụn dừa', 2),
(5, '/assets/image/News/5-1-.jpg', 'Lợi ích mụn dừa', 1);

-- ============================================
-- 9. SAMPLE QUERIES
-- ============================================

-- Get all news with category filter
-- SELECT * FROM news WHERE category = 'techniques' ORDER BY date DESC;

-- Get news with all categories
-- SELECT n.*, GROUP_CONCAT(nc.category) as categories 
-- FROM news n
-- LEFT JOIN news_categories nc ON n.id = nc.news_id
-- GROUP BY n.id
-- ORDER BY n.date DESC;

-- Get news with all images
-- SELECT n.*, GROUP_CONCAT(ni.image_url ORDER BY ni.display_order SEPARATOR ',') as images
-- FROM news n
-- LEFT JOIN news_images ni ON n.id = ni.news_id
-- GROUP BY n.id
-- ORDER BY n.date DESC;

-- Update view count
-- UPDATE news SET views = views + 1 WHERE id = ?;

-- Get top viewed posts
-- SELECT * FROM news ORDER BY views DESC LIMIT 10;

-- Get useful posts (aggregated from interactions)
-- SELECT news_id, COUNT(*) as useful_count 
-- FROM news_interactions 
-- WHERE is_useful = TRUE 
-- GROUP BY news_id 
-- ORDER BY useful_count DESC;

-- ============================================
-- 10. OPTIONAL: CREATE FULL-TEXT INDEX (for search)
-- ============================================
-- ALTER TABLE news ADD FULLTEXT INDEX ft_search (title, excerpt, content);
-- SELECT * FROM news WHERE MATCH(title, excerpt, content) AGAINST('+dừa' IN BOOLEAN MODE);

-- ============================================
-- 11. OPTIONAL: CREATE VIEW FOR STATISTICS
-- ============================================
-- CREATE VIEW news_statistics AS
-- SELECT 
--     n.id,
--     n.title,
--     n.views,
--     (SELECT COUNT(*) FROM news_interactions WHERE news_id = n.id AND is_useful = TRUE) as useful_count,
--     (SELECT COUNT(*) FROM news_interactions WHERE news_id = n.id AND is_saved = TRUE) as saved_count,
--     (SELECT COUNT(*) FROM news_views WHERE news_id = n.id) as total_views
-- FROM news n;

