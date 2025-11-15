// Content Management System for Static Website
class ContentManager {
  constructor() {
    this.cache = {};
    this.baseUrl = '/data/';
    this.markdownParser = new MarkdownParser();
    this.contentBaseUrl = '/content/';
  }

  // Load JSON data with caching
  async loadData(filename) {
    if (this.cache[filename]) {
      return this.cache[filename];
    }

    try {
      const response = await fetch(`${this.baseUrl}${filename}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.cache[filename] = data;
      return data;
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      return null;
    }
  }

  // Get banners for slideshow
  async getBanners() {
    const data = await this.loadData('banners');
    return data?.banners?.filter(banner => banner.active) || [];
  }

  // Get products
  async getProducts(category = null) {
    const data = await this.loadData('products');
    let products = data?.products || [];
    
    if (category) {
      products = products.filter(product => product.category === category);
    }
    
    return products;
  }

  // Get testimonials
  async getTestimonials(limit = null) {
    const data = await this.loadData('testimonials');
    let testimonials = data?.testimonials || [];
    
    if (limit) {
      testimonials = testimonials.slice(0, limit);
    }
    
    return testimonials;
  }

  // Get company info
  async getCompanyInfo() {
    const data = await this.loadData('company');
    return data?.company || {};
  }

  // Load markdown content and convert to appropriate format
  async loadMarkdownContent(filename, type = 'raw') {
    const cacheKey = `md_${filename}_${type}`;
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      const filePath = `${this.contentBaseUrl}data/${filename}.md`;
      const parsedContent = await this.markdownParser.loadMarkdownFile(filePath);
      
      if (!parsedContent) return null;

      let result;
      switch (type) {
        case 'products':
          result = this.markdownParser.convertToProducts(parsedContent);
          break;
        case 'testimonials':
          result = this.markdownParser.convertToTestimonials(parsedContent);
          break;
        default:
          result = parsedContent;
      }

      this.cache[cacheKey] = result;
      return result;
    } catch (error) {
      console.error(`Error loading markdown content ${filename}:`, error);
      return null;
    }
  }

  // Get products from markdown (with fallback to JSON)
  async getProductsFromMarkdown(category = null) {
    const markdownProducts = await this.loadMarkdownContent('san-pham', 'products');
    
    if (markdownProducts && markdownProducts.length > 0) {
      return category ? 
        markdownProducts.filter(p => p.category === category) : 
        markdownProducts;
    }

    // Fallback to JSON if markdown fails
    return this.getProducts(category);
  }

  // Get testimonials from markdown (with fallback to JSON)
  async getTestimonialsFromMarkdown(limit = null) {
    const markdownTestimonials = await this.loadMarkdownContent('chung-thuc-khach-hang', 'testimonials');
    
    if (markdownTestimonials && markdownTestimonials.length > 0) {
      return limit ? markdownTestimonials.slice(0, limit) : markdownTestimonials;
    }

    // Fallback to JSON if markdown fails
    return this.getTestimonials(limit);
  }

  // Get page content
  async getPageContent(page) {
    const data = await this.loadData('pages');
    return data?.[page] || {};
  }

  // Render banner slideshow
  async renderBanners(containerId) {
    const banners = await this.getBanners();
    const container = document.getElementById(containerId);
    
    if (!container || !banners.length) return;

    // Update existing slideshow data
    if (window.slides) {
      window.slides = banners.map(banner => ({
        image: banner.image,
        title: banner.title,
        subtitle: banner.subtitle
      }));
      
      // Update current slide if slideshow is already running
      if (window.updateSlide) {
        window.updateSlide();
      }
    }
  }

  // Render products section
  async renderProducts(containerId, category = null, limit = null) {
    const products = await this.getProducts(category);
    const container = document.getElementById(containerId);
    
    if (!container) return;

    let displayProducts = products;
    if (limit) {
      displayProducts = products.slice(0, limit);
    }

    const html = displayProducts.map(product => `
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <div class="flex items-center mb-4">
          <div class="bg-green-600 text-white p-3 rounded-full mr-4">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-green-700">${product.name}</h3>
        </div>
        <p class="text-gray-600 mb-4">${product.description}</p>
        <ul class="space-y-2 mb-4">
          ${product.features.map(feature => `
            <li class="flex items-center text-gray-700">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              ${feature}
            </li>
          `).join('')}
        </ul>
        <div class="flex justify-between items-center">
          <span class="text-lg font-bold text-orange-600">${product.price}</span>
          <button onclick="contactForProduct('${product.name}')" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-300">
            Liên hệ
          </button>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  // Render testimonials
  async renderTestimonials(containerId, limit = 4) {
    const testimonials = await this.getTestimonials(limit);
    const container = document.getElementById(containerId);
    
    if (!container) return;

    const html = testimonials.map(testimonial => `
      <div class="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
        <div class="flex items-center mb-6">
          <div class="${testimonial.avatar_color} text-white w-16 h-16 rounded-full flex items-center justify-center mr-5">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div>
            <h4 class="text-xl font-bold text-gray-800 mb-1">${testimonial.name} - ${testimonial.location}</h4>
            <div class="text-yellow-500 text-lg">${'⭐'.repeat(testimonial.rating)}</div>
          </div>
        </div>
        <p class="text-gray-700 text-lg italic leading-relaxed">
          "${testimonial.content}"
        </p>
        <div class="mt-4 text-sm text-gray-500">
          Cây trồng: ${testimonial.crop} • Sử dụng: ${testimonial.usage_duration}
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  // Update footer with company info
  async updateFooter() {
    const company = await this.getCompanyInfo();
    
    // Update company name elements
    const companyNames = document.querySelectorAll('[data-company-name]');
    companyNames.forEach(el => el.textContent = company.name || 'MỤN DỪA HOÀNG HIẾU');

    // Update tagline elements  
    const taglines = document.querySelectorAll('[data-company-tagline]');
    taglines.forEach(el => el.textContent = company.tagline || 'Giá thể sạch - Năng suất vượt trội');

    // Update contact info
    const phones = document.querySelectorAll('[data-company-phone]');
    phones.forEach(el => {
      el.textContent = `Hotline: ${company.contact?.phone || '0984288512'}`;
      el.href = `tel:${company.contact?.phone || '0984288512'}`;
    });

    const emails = document.querySelectorAll('[data-company-email]');
    emails.forEach(el => {
      el.textContent = company.contact?.email || 'munduahoanghieu.vn@gmail.com';
    });

    // Update social media links
    if (company.social_media) {
      const socialLinks = {
        facebook: document.querySelector('[data-social-facebook]'),
        zalo: document.querySelector('[data-social-zalo]'), 
        whatsapp: document.querySelector('[data-social-whatsapp]'),
        youtube: document.querySelector('[data-social-youtube]')
      };

      Object.keys(socialLinks).forEach(key => {
        const link = socialLinks[key];
        if (link && company.social_media[key]) {
          link.href = company.social_media[key].url;
          link.title = company.social_media[key].name;
        }
      });
    }
  }
}

// Global contact functions
function contactForProduct(productName) {
  const subject = encodeURIComponent(`Tư vấn sản phẩm: ${productName}`);
  const body = encodeURIComponent(`Xin chào Mụn Dừa Hoàng Hiếu,\n\nTôi muốn tư vấn về sản phẩm: ${productName}\n\nVui lòng liên hệ lại với tôi.\n\nCảm ơn!`);
  const mailtoLink = `mailto:munduahoanghieu.vn@gmail.com?subject=${subject}&body=${body}`;
  window.location.href = mailtoLink;
}

// Initialize content manager
const contentManager = new ContentManager();

// Auto-load content when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Update footer with company info
  contentManager.updateFooter();
  
  // Load banners if slideshow exists
  if (document.getElementById('banner-slideshow')) {
    contentManager.renderBanners('banner-slideshow');
  }
  
  // Load products if container exists
  if (document.getElementById('products-container')) {
    contentManager.renderProducts('products-container', null, 4);
  }
  
  // Load testimonials if container exists  
  if (document.getElementById('testimonials-container')) {
    contentManager.renderTestimonials('testimonials-container', 4);
  }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentManager;
}