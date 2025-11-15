/**
 * Advanced Content Manager với Fallback System
 * Đảm bảo website luôn có nội dung, ngay cả khi markdown bị lỗi
 */
class SafeContentManager extends ContentManager {
    constructor() {
        super();
        this.fallbackData = {
            contact: {
                phone: "0984.288.512",
                email: "munduahoanghieu.vn@gmail.com", 
                address: "Ấp Hội An, Xã Đa Phước Hội, Huyện Mỏ Cày Nam, Tỉnh Bến Tre",
                title: "MỤN DỪA HOÀNG HIẾU",
                subtitle: "GIẢI PHÁP NÔNG NGHIỆP XANH"
            },
            products: [
                {
                    id: "mun-dua-xu-ly",
                    name: "Mụn dừa đã xử lý",
                    description: "Tỷ lệ xơ-mụn đáp ứng theo yêu cầu của bạn",
                    price: "Liên hệ",
                    category: "main"
                },
                {
                    id: "xo-dua-tu-nhien", 
                    name: "Xơ dừa tự nhiên",
                    description: "Xơ dừa nguyên chất, không pha trộn",
                    price: "Liên hệ",
                    category: "main"
                }
            ],
            testimonials: [
                {
                    id: "khach-hang-1",
                    name: "Chị Mai Lan",
                    location: "TP.HCM",
                    content: "Mụn dừa của bác Hiếu rất sạch và chất lượng. Cây lan của tôi phát triển rất tốt sau khi dùng.",
                    rating: 5,
                    product: "Xơ dừa tự nhiên"
                }
            ]
        };
        this.lastUpdateTime = null;
        this.updateStatus = 'ready';
    }

    /**
     * Safely load content với fallback
     */
    async safeLoadContent(type, ...args) {
        this.updateStatus = 'loading';
        
        try {
            // Thử load từ markdown trước
            let content = null;
            
            switch (type) {
                case 'contact':
                    content = await this.loadContactFromMarkdown();
                    break;
                case 'products':
                    content = await this.getProductsFromMarkdown(...args);
                    break;
                case 'testimonials':
                    content = await this.getTestimonialsFromMarkdown(...args);
                    break;
            }
            
            // Nếu markdown thành công
            if (content && this.isValidContent(content, type)) {
                this.lastUpdateTime = new Date();
                this.updateStatus = 'success';
                this.logUpdate(`✅ Loaded ${type} from markdown successfully`);
                return content;
            }
            
            // Fallback 1: Thử JSON
            this.logUpdate(`⚠️ Markdown failed, trying JSON for ${type}`);
            content = await this.loadFromJSON(type, ...args);
            
            if (content && this.isValidContent(content, type)) {
                this.updateStatus = 'json-fallback';
                this.logUpdate(`✅ Loaded ${type} from JSON fallback`);
                return content;
            }
            
            // Fallback 2: Sử dụng hardcoded data
            this.logUpdate(`⚠️ JSON failed, using hardcoded fallback for ${type}`);
            content = this.getHardcodedFallback(type);
            this.updateStatus = 'hardcoded-fallback';
            
            return content;
            
        } catch (error) {
            this.logUpdate(`❌ Error loading ${type}: ${error.message}`);
            this.updateStatus = 'error';
            
            // Luôn có fallback cuối cùng
            return this.getHardcodedFallback(type);
        }
    }

    /**
     * Load contact info từ markdown
     */
    async loadContactFromMarkdown() {
        if (!this.markdownParser) return null;
        
        const content = await this.loadMarkdownContent('trang-chu', 'raw');
        return content?.contact || null;
    }

    /**
     * Load từ JSON (fallback method)
     */
    async loadFromJSON(type, ...args) {
        switch (type) {
            case 'contact':
                const company = await this.getCompanyInfo();
                return company?.contact || null;
            case 'products':
                return await this.getProducts(...args);
            case 'testimonials':
                return await this.getTestimonials(...args);
            default:
                return null;
        }
    }

    /**
     * Kiểm tra content có hợp lệ không
     */
    isValidContent(content, type) {
        if (!content) return false;
        
        switch (type) {
            case 'contact':
                return content.phone || content.email || content.address;
            case 'products':
                return Array.isArray(content) && content.length > 0;
            case 'testimonials':
                return Array.isArray(content) && content.length > 0;
            default:
                return !!content;
        }
    }

    /**
     * Lấy hardcoded fallback data
     */
    getHardcodedFallback(type) {
        switch (type) {
            case 'contact':
                return this.fallbackData.contact;
            case 'products':
                return this.fallbackData.products;
            case 'testimonials':
                return this.fallbackData.testimonials;
            default:
                return null;
        }
    }

    /**
     * Cập nhật footer an toàn
     */
    async updateFooterSafely() {
        try {
            const contact = await this.safeLoadContent('contact');
            
            if (contact) {
                // Update phone
                if (contact.phone) {
                    const phoneElements = document.querySelectorAll('[data-contact="phone"]');
                    phoneElements.forEach(el => {
                        el.textContent = contact.phone;
                        if (el.tagName === 'A') {
                            el.href = `tel:${contact.phone.replace(/[\.\s\-]/g, '')}`;
                        }
                    });
                }

                // Update email  
                if (contact.email) {
                    const emailElements = document.querySelectorAll('[data-contact="email"]');
                    emailElements.forEach(el => {
                        el.textContent = contact.email;
                        if (el.tagName === 'A') {
                            el.href = `mailto:${contact.email}`;
                        }
                    });
                }

                // Update address
                if (contact.address) {
                    const addressElements = document.querySelectorAll('[data-contact="address"]');
                    addressElements.forEach(el => {
                        el.innerHTML = contact.address.replace(/,/g, ',<br>');
                    });
                }

                this.logUpdate(`✅ Footer updated successfully (${this.updateStatus})`);
                return true;
            }
            
            this.logUpdate(`❌ No valid contact data found`);
            return false;
            
        } catch (error) {
            this.logUpdate(`❌ Error updating footer: ${error.message}`);
            return false;
        }
    }

    /**
     * Get update status
     */
    getUpdateStatus() {
        return {
            status: this.updateStatus,
            lastUpdate: this.lastUpdateTime,
            message: this.getStatusMessage()
        };
    }

    /**
     * Get status message
     */
    getStatusMessage() {
        switch (this.updateStatus) {
            case 'success':
                return '✅ Content loaded from markdown';
            case 'json-fallback':
                return '⚠️ Using JSON fallback (markdown failed)';
            case 'hardcoded-fallback':
                return '🆘 Using hardcoded fallback (all sources failed)';
            case 'loading':
                return '🔄 Loading content...';
            case 'error':
                return '❌ Error occurred, using fallback';
            default:
                return '⏳ Ready to load';
        }
    }

    /**
     * Log update activity
     */
    logUpdate(message) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ${message}`);
        
        // Dispatch event for UI to listen
        window.dispatchEvent(new CustomEvent('contentUpdate', {
            detail: { message, timestamp, status: this.updateStatus }
        }));
    }

    /**
     * Force refresh với error recovery
     */
    async forceRefresh() {
        this.clearCache();
        this.cache.clear(); // Clear markdown cache too
        
        const results = await Promise.all([
            this.updateFooterSafely(),
            this.safeLoadContent('products'),
            this.safeLoadContent('testimonials')
        ]);
        
        this.logUpdate(`🔄 Force refresh completed - ${results.filter(r => r).length}/3 successful`);
        return results;
    }
}

// Export
window.SafeContentManager = SafeContentManager;