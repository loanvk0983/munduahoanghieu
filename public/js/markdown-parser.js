/**
 * Markdown Content Parser
 * Chuyển đổi nội dung markdown thành JSON để sử dụng với ContentManager
 */
class MarkdownParser {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Parse markdown content thành cấu trúc JSON
     */
    parseMarkdown(markdown) {
        const lines = markdown.split('\n');
        const result = {
            sections: [],
            metadata: {}
        };
        
        let currentSection = null;
        let currentSubsection = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines
            if (!line) continue;
            
            // H1 - Main sections
            if (line.startsWith('# ')) {
                if (currentSection) {
                    result.sections.push(currentSection);
                }
                currentSection = {
                    title: line.substring(2).trim(),
                    type: 'section',
                    content: [],
                    subsections: []
                };
                currentSubsection = null;
            }
            // H2 - Subsections
            else if (line.startsWith('## ')) {
                if (currentSection) {
                    if (currentSubsection) {
                        currentSection.subsections.push(currentSubsection);
                    }
                    currentSubsection = {
                        title: line.substring(3).trim(),
                        type: 'subsection',
                        content: [],
                        items: []
                    };
                }
            }
            // H3 - Sub-subsections
            else if (line.startsWith('### ')) {
                const target = currentSubsection || currentSection;
                if (target) {
                    target.items = target.items || [];
                    target.items.push({
                        title: line.substring(4).trim(),
                        type: 'item',
                        content: []
                    });
                }
            }
            // List items
            else if (line.startsWith('- ') || line.startsWith('* ')) {
                const content = line.substring(2).trim();
                const target = currentSubsection || currentSection;
                if (target) {
                    target.content.push({
                        type: 'list-item',
                        text: content
                    });
                }
            }
            // Numbered list
            else if (/^\d+\.\s/.test(line)) {
                const content = line.replace(/^\d+\.\s/, '').trim();
                const target = currentSubsection || currentSection;
                if (target) {
                    target.content.push({
                        type: 'numbered-item',
                        text: content
                    });
                }
            }
            // Bold text **text**
            else if (line.includes('**')) {
                const content = this.parseBoldText(line);
                const target = currentSubsection || currentSection;
                if (target) {
                    target.content.push({
                        type: 'text',
                        text: content.text,
                        bold: content.bold
                    });
                }
            }
            // Horizontal rule
            else if (line.startsWith('---')) {
                const target = currentSubsection || currentSection;
                if (target) {
                    target.content.push({
                        type: 'separator'
                    });
                }
            }
            // Regular text
            else {
                const target = currentSubsection || currentSection;
                if (target) {
                    target.content.push({
                        type: 'text',
                        text: line
                    });
                }
            }
        }
        
        // Add last section
        if (currentSection) {
            if (currentSubsection) {
                currentSection.subsections.push(currentSubsection);
            }
            result.sections.push(currentSection);
        }
        
        return result;
    }

    /**
     * Parse bold text
     */
    parseBoldText(text) {
        const parts = text.split('**');
        let result = '';
        let bold = [];
        
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                result += parts[i];
            } else {
                bold.push(parts[i]);
                result += parts[i];
            }
        }
        
        return { text: result.replace(/\*\*/g, ''), bold };
    }

    /**
     * Load và parse markdown file
     */
    async loadMarkdownFile(filePath) {
        try {
            // Check cache first
            if (this.cache.has(filePath)) {
                return this.cache.get(filePath);
            }

            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const markdown = await response.text();
            const parsed = this.parseMarkdown(markdown);
            
            // Cache result
            this.cache.set(filePath, parsed);
            
            return parsed;
        } catch (error) {
            console.error('Error loading markdown file:', error);
            return null;
        }
    }

    /**
     * Chuyển đổi parsed content thành product format
     */
    convertToProducts(parsedContent) {
        const products = [];
        
        parsedContent.sections.forEach(section => {
            if (section.title.includes('Sản phẩm') || section.subsections.length > 0) {
                section.subsections.forEach(subsection => {
                    const product = {
                        id: this.generateId(subsection.title),
                        name: subsection.title,
                        category: 'main',
                        description: '',
                        features: [],
                        price: 'Liên hệ',
                        image: '/assets/image/products/default.jpg'
                    };
                    
                    subsection.content.forEach(item => {
                        if (item.type === 'text' && item.text.includes('Mô tả')) {
                            product.description = item.text.replace('**Mô tả**: ', '');
                        } else if (item.type === 'list-item') {
                            product.features.push(item.text);
                        } else if (item.text && item.text.includes('Giá')) {
                            product.price = item.text.replace('**Giá**: ', '');
                        } else if (item.text && item.text.includes('Ảnh')) {
                            product.image = item.text.replace('**Ảnh**: ', '');
                        }
                    });
                    
                    products.push(product);
                });
            }
        });
        
        return products;
    }

    /**
     * Chuyển đổi parsed content thành testimonial format
     */
    convertToTestimonials(parsedContent) {
        const testimonials = [];
        
        parsedContent.sections.forEach(section => {
            if (section.title.includes('Chứng thực') || section.subsections.length > 0) {
                section.subsections.forEach(subsection => {
                    const testimonial = {
                        id: this.generateId(subsection.title),
                        name: '',
                        location: '',
                        content: '',
                        rating: 5,
                        product: '',
                        date: ''
                    };
                    
                    subsection.content.forEach(item => {
                        if (item.text && item.text.includes('Tên')) {
                            testimonial.name = item.text.replace('**Tên**: ', '');
                        } else if (item.text && item.text.includes('Địa chỉ')) {
                            testimonial.location = item.text.replace('**Địa chỉ**: ', '');
                        } else if (item.text && item.text.includes('Nội dung')) {
                            testimonial.content = item.text.replace('**Nội dung**: ', '').replace(/"/g, '');
                        } else if (item.text && item.text.includes('Sản phẩm sử dụng')) {
                            testimonial.product = item.text.replace('**Sản phẩm sử dụng**: ', '');
                        } else if (item.text && item.text.includes('Thời gian')) {
                            testimonial.date = item.text.replace('**Thời gian**: ', '');
                        }
                    });
                    
                    testimonials.push(testimonial);
                });
            }
        });
        
        return testimonials;
    }

    /**
     * Generate unique ID from text
     */
    generateId(text) {
        return text.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 20);
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
}

// Export for use
window.MarkdownParser = MarkdownParser;