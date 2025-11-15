/**
 * Markdown Content Loader
 * Tự động load và update nội dung từ markdown files
 */
class MarkdownContentLoader {
    constructor() {
        this.cache = new Map();
        this.contentBaseUrl = '/content/';
        this.updateInterval = 30000; // 30 giây
        // Holds the interval id when auto-refresh is started so it can be stopped
        this._autoRefreshId = null;
    }

    /**
     * Load page content từ markdown
     */
    async loadPageContent(pageName) {
        try {
            const response = await fetch(`${this.contentBaseUrl}pages/${pageName}.md`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const markdown = await response.text();
            const content = this.parsePageMarkdown(markdown);
            
            // Cache content
            this.cache.set(pageName, content);
            
            return content;
        } catch (error) {
            console.error(`Error loading page content ${pageName}:`, error);
            return null;
        }
    }

    /**
     * Parse markdown thành page content object
     */
    parsePageMarkdown(markdown) {
        const lines = markdown.split('\n');
        const content = {
            title: '',
            sections: {},
            contact: {},
            products: [],
            features: []
        };
        
        let currentSection = '';
        let currentSubsection = '';
        
        for (let line of lines) {
            line = line.trim();
            if (!line) continue;
            
            // H1 - Page title
            if (line.startsWith('# ')) {
                content.title = line.substring(2).trim();
            }
            // H2 - Main sections
            else if (line.startsWith('## ')) {
                currentSection = line.substring(3).trim();
                content.sections[currentSection] = {
                    title: currentSection,
                    content: '',
                    items: []
                };
                currentSubsection = '';
            }
            // Bold text **text**
            else if (line.includes('**') && line.includes(':')) {
                const [key, value] = line.split(':').map(s => s.trim());
                const cleanKey = key.replace(/\*/g, '').toLowerCase();
                const cleanValue = value.replace(/\*/g, '');
                
                // Extract contact info
                if (cleanKey.includes('hotline') || cleanKey.includes('điện thoại')) {
                    content.contact.phone = cleanValue;
                } else if (cleanKey.includes('email')) {
                    content.contact.email = cleanValue;
                } else if (cleanKey.includes('địa chỉ')) {
                    content.contact.address = cleanValue;
                } else if (cleanKey.includes('tiêu đề')) {
                    content.contact.title = cleanValue;
                } else if (cleanKey.includes('phụ đề')) {
                    content.contact.subtitle = cleanValue;
                } else if (cleanKey.includes('slogan')) {
                    content.contact.slogan = cleanValue;
                }
                
                // Add to current section
                if (currentSection && content.sections[currentSection]) {
                    content.sections[currentSection].items.push({
                        key: cleanKey,
                        value: cleanValue
                    });
                }
            }
            // List items
            else if (line.startsWith('- ') || line.startsWith('✅ ')) {
                const item = line.replace(/^[-✅]\s*/, '').trim();
                if (currentSection && content.sections[currentSection]) {
                    content.sections[currentSection].items.push({
                        type: 'list',
                        text: item
                    });
                }
                
                // Add to products or features
                if (currentSection && currentSection.toLowerCase().includes('sản phẩm')) {
                    content.products.push(item);
                } else if (currentSection && currentSection.toLowerCase().includes('cam kết')) {
                    content.features.push(item);
                }
            }
            // Emoji lines (contact info)
            else if (line.match(/^[📞📧📍]/)) {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    const key = parts[0].trim().replace(/[📞📧📍\*]/g, '').toLowerCase();
                    const value = parts.slice(1).join(':').trim().replace(/\*/g, '');
                    
                    if (key.includes('hotline') || key.includes('điện thoại')) {
                        content.contact.phone = value;
                    } else if (key.includes('email')) {
                        content.contact.email = value;
                    } else if (key.includes('địa chỉ')) {
                        content.contact.address = value;
                    }
                }
            }
            // Regular text
            else {
                if (currentSection && content.sections[currentSection]) {
                    if (content.sections[currentSection].content) {
                        content.sections[currentSection].content += ' ' + line;
                    } else {
                        content.sections[currentSection].content = line;
                    }
                }
            }
        }
        
        return content;
    }

    /**
     * Update footer với thông tin liên hệ từ markdown
     */
    async updateFooterFromMarkdown() {
        try {
            const content = await this.loadPageContent('trang-chu');
            if (!content || !content.contact) return false;
            
            // Update phone number
            if (content.contact.phone) {
                const phoneElements = document.querySelectorAll('[data-contact="phone"]');
                phoneElements.forEach(el => {
                    el.textContent = content.contact.phone;
                    if (el.tagName === 'A') {
                        el.href = `tel:${content.contact.phone.replace(/\./g, '')}`;
                    }
                });
            }
            
            // Update email
            if (content.contact.email) {
                const emailElements = document.querySelectorAll('[data-contact="email"]');
                emailElements.forEach(el => {
                    el.textContent = content.contact.email;
                    if (el.tagName === 'A') {
                        el.href = `mailto:${content.contact.email}`;
                    }
                });
            }
            
            // Update address
            if (content.contact.address) {
                const addressElements = document.querySelectorAll('[data-contact="address"]');
                addressElements.forEach(el => {
                    el.textContent = content.contact.address;
                });
            }
            
            console.log('✅ Footer updated from markdown:', content.contact);
            return true;
        } catch (error) {
            console.error('❌ Error updating footer from markdown:', error);
            return false;
        }
    }

    /**
     * Start auto-refresh
     */
    startAutoRefresh() {
        // Clear existing interval if any
        if (this._autoRefreshId) {
            clearInterval(this._autoRefreshId);
            this._autoRefreshId = null;
        }

        this._autoRefreshId = setInterval(() => {
            this.updateFooterFromMarkdown();
        }, this.updateInterval);

        console.log('🔄 Auto-refresh started (30s interval)');
    }

    /**
     * Manual refresh
     */
    async refresh() {
        this.cache.clear();
        await this.updateFooterFromMarkdown();
        console.log('🔄 Manual refresh completed');
    }

    /**
     * Stop auto-refresh if it is running
     */
    stopAutoRefresh() {
        if (this._autoRefreshId) {
            clearInterval(this._autoRefreshId);
            this._autoRefreshId = null;
            console.log('❌ Auto-refresh stopped');
        }
    }

    /**
     * Get cached content
     */
    getCachedContent(pageName) {
        return this.cache.get(pageName);
    }
}

// Export
window.MarkdownContentLoader = MarkdownContentLoader;