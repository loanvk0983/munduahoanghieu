// ============ Simple Search Functionality ============
// Chỉ tìm trong: Bài viết, Mẹo canh tác, Danh mục
// Không quét toàn bộ DOM - Đơn giản, sạch sẽ, dễ maintain

let currentSearchQuery = '';

function performSearch() {
  const desktopInput = document.getElementById('search-input');
  const mobileInput = document.getElementById('search-input-mobile');
  
  // Debug: Log giá trị của cả 2 input
  console.log('desktopInput:', desktopInput);
  console.log('desktopInput value:', desktopInput?.value);
  console.log('mobileInput:', mobileInput);
  console.log('mobileInput value:', mobileInput?.value);
  
  const query = (desktopInput?.value || mobileInput?.value || '').trim().toLowerCase();
  console.log('Final query:', query);
  
  if (!query) {
    alert('Vui lòng nhập từ khóa tìm kiếm');
    return;
  }
  
  currentSearchQuery = query;
  console.log('🔍 Tìm kiếm:', query);
  
  // Tách từ khóa
  const keywords = query.split(/\s+/).filter(word => word.length > 0);
  
  // Kết quả tìm kiếm
  const searchResults = {
    posts: [],
    tips: [],
    categories: [],
    sections: []  // Thêm: Tìm sections/widgets trong sidebar
  };
  
  // 1. Tìm trong bài viết (title, excerpt, content)
  if (typeof mockNewsData !== 'undefined') {
    searchResults.posts = mockNewsData.filter(post => {
      const titleLower = post.title.toLowerCase();
      const excerptLower = post.excerpt.toLowerCase();
      const contentLower = post.content.toLowerCase();
      
      return keywords.every(keyword => {
        return titleLower.includes(keyword) || 
               excerptLower.includes(keyword) || 
               contentLower.includes(keyword);
      });
    });
  }
  
  // 2. Tìm trong mẹo canh tác
  if (typeof tips !== 'undefined') {
    searchResults.tips = tips.filter(tip => 
      keywords.some(keyword => tip.toLowerCase().includes(keyword))
    );
  }
  
  // 3. Tìm trong daily tips
  if (typeof dailyTips !== 'undefined') {
    const matchingDailyTips = dailyTips.filter(tip => 
      keywords.some(keyword => tip.toLowerCase().includes(keyword))
    );
    searchResults.tips = [...searchResults.tips, ...matchingDailyTips];
  }
  
  // 4. Tìm trong danh mục
  const categoryLabels = {
    knowledge: 'Kiến Thức Cơ Bản',
    techniques: 'Kỹ Thuật Canh Tác', 
    experience: 'Kinh Nghiệm Nông Dân',
    benefits: 'Lợi Ích & Môi Trường',
    other: 'Khác'
  };
  
  Object.entries(categoryLabels).forEach(([key, label]) => {
    if (keywords.some(keyword => label.toLowerCase().includes(keyword))) {
      searchResults.categories.push({ key, label });
    }
  });
  
  // 5. Tìm trong tiêu đề sections/widgets (sidebar)
  const sectionTitles = [
    { 
      title: 'Mẹo Canh Tác', 
      icon: '💡',
      description: 'Những mẹo hữu ích cho nông dân',
      keywords: ['mẹo', 'canh', 'tác', 'tips', 'hữu ích'],
      action: () => {
        const el = document.getElementById('tip-sidebar') || document.querySelector('.tip-card');
        if (el) {
          const header = document.querySelector('header');
          const headerHeight = header ? header.offsetHeight + 20 : 100; // Dynamic header height + padding
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({top: elementPosition - headerHeight, behavior: 'smooth'});
        }
      }
    },
    { 
      title: 'Góc Chia Sẻ', 
      icon: '📸',
      description: 'Hình ảnh kết quả từ khách hàng',
      keywords: ['góc', 'chia', 'sẻ', 'hình', 'ảnh', 'gallery', 'kết quả'],
      action: () => {
        const el = document.querySelector('.results-title') || document.querySelector('.results-card');
        if (el) {
          const header = document.querySelector('header');
          const headerHeight = header ? header.offsetHeight + 20 : 100;
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({top: elementPosition - headerHeight, behavior: 'smooth'});
        }
      }
    },
    { 
      title: 'Bài Viết Liên Quan', 
      icon: '📰',
      description: 'Các bài viết cùng chủ đề',
      keywords: ['bài', 'viết', 'liên', 'quan', 'related'],
      action: () => {
        const el = document.querySelector('.related-title') || document.querySelector('.related-card');
        if (el) {
          const header = document.querySelector('header');
          const headerHeight = header ? header.offsetHeight + 20 : 100;
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({top: elementPosition - headerHeight, behavior: 'smooth'});
        }
      }
    },
    { 
      title: 'Liên Hệ Nhanh', 
      icon: '📞',
      description: 'Chat Zalo hoặc gọi điện',
      keywords: ['liên', 'hệ', 'contact', 'zalo', 'chat', 'gọi', 'điện', 'phone'],
      action: () => {
        const el = document.querySelector('.contact-title') || document.querySelector('.contact-card');
        if (el) {
          const header = document.querySelector('header');
          const headerHeight = header ? header.offsetHeight + 20 : 100;
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({top: elementPosition - headerHeight, behavior: 'smooth'});
        }
      }
    },
    { 
      title: 'Quy Trình Sản Xuất', 
      icon: '🎬',
      description: 'Video quy trình chế biến mụn dừa',
      keywords: ['quy', 'trình', 'sản', 'xuất', 'video', 'chế', 'biến'],
      action: () => {
        const el = document.querySelector('.process-title') || document.querySelector('.process-card');
        if (el) {
          const header = document.querySelector('header');
          const headerHeight = header ? header.offsetHeight + 20 : 100;
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({top: elementPosition - headerHeight, behavior: 'smooth'});
        }
      }
    }
  ];
  
  sectionTitles.forEach(section => {
    // Tìm trong title hoặc trong keywords của section
    const titleMatch = keywords.some(keyword => section.title.toLowerCase().includes(keyword));
    const keywordMatch = keywords.some(keyword => 
      section.keywords.some(sectionKeyword => sectionKeyword.includes(keyword))
    );
    const descriptionMatch = keywords.some(keyword => section.description.toLowerCase().includes(keyword));
    
    if (titleMatch || keywordMatch || descriptionMatch) {
      searchResults.sections.push(section);
    }
  });
  
  console.log('✅ Kết quả:', searchResults);
  
  displaySearchResults(searchResults, query);
  
  // Scroll tới kết quả
  const newsListView = document.getElementById('news-list-view');
  if (newsListView) {
    newsListView.scrollIntoView({behavior: 'smooth', block: 'start'});
  }
}

function handleSearchKeyPress(event) {
  if (event.key === 'Enter') {
    performSearch();
  }
}

function displaySearchResults(searchResults, query) {
  const newsListView = document.getElementById('news-list-view');
  const newsSectionTitle = document.getElementById('news-section-title');
  const newsListGrid = document.getElementById('news-list-grid');
  
  if (!newsListView || !newsListGrid) return;
  
  const totalResults = searchResults.posts.length + searchResults.tips.length + 
                      searchResults.categories.length + searchResults.sections.length;
  
  // Hiển thị header tìm kiếm
  newsSectionTitle.innerHTML = `
    <div class="search-results">
      <div class="search-header">
        <h2 class="search-title">🔍 Kết Quả Tìm Kiếm</h2>
        <p class="search-count">
          Tìm thấy <strong>${totalResults}</strong> kết quả cho: 
          <span class="search-keyword">"${query}"</span>
        </p>
        <button class="search-clear-btn" onclick="clearSearch()">
          <span>✕</span>
          <span>Xóa tìm kiếm</span>
        </button>
      </div>
    </div>
  `;
  
  if (totalResults === 0) {
    newsListGrid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <p class="no-results-text">Không tìm thấy kết quả nào</p>
        <p class="no-results-hint">Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả</p>
      </div>
    `;
    return;
  }
  
  let resultsHTML = '';
  
  // Hiển thị sections/widgets nếu có
  if (searchResults.sections.length > 0) {
    resultsHTML += `
      <div style="background: linear-gradient(135deg, #fef3c7, #fef9e7); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; border: 2px solid #f59e0b;">
        <h3 style="font-size: 1.3rem; font-weight: 700; color: #92400e; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>🎯</span> Các Mục Trong Trang
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
          ${searchResults.sections.map(section => `
            <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: transform 0.2s; cursor: pointer;" 
                 onclick="(${section.action.toString()})()"
                 onmouseover="this.style.transform='translateY(-4px)'" 
                 onmouseout="this.style.transform='translateY(0)'">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <span style="font-size: 2.5rem;">${section.icon}</span>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: 700; color: #15803d; font-size: 1.2rem; line-height: 1.3;">${highlightText(section.title, query)}</div>
                  <div style="font-size: 0.9rem; color: #6b7280; margin-top: 0.25rem;">${section.description}</div>
                </div>
              </div>
              <button style="background: #16a34a; color: white; padding: 0.6rem 1.2rem; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; width: 100%; margin-top: 0.5rem; transition: background 0.2s;" onmouseover="this.style.background='#15803d'" onmouseout="this.style.background='#16a34a'">
                👉 Xem ${section.title}
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // Hiển thị danh mục nếu có
  if (searchResults.categories.length > 0) {
    resultsHTML += `
      <div style="background: #fff; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h3 style="font-size: 1.2rem; font-weight: 700; color: #15803d; margin-bottom: 1rem;">📂 Danh Mục</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
          ${searchResults.categories.map(cat => `
            <button onclick="filterByCategory('${cat.key}')" style="padding: 0.75rem 1.5rem; background: #dcfce7; border: 2px solid #16a34a; border-radius: 8px; cursor: pointer; font-weight: 600; color: #166534; transition: all 0.2s;" onmouseover="this.style.background='#16a34a'; this.style.color='white'" onmouseout="this.style.background='#dcfce7'; this.style.color='#166534'">
              ${cat.label}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // Hiển thị mẹo nếu có
  if (searchResults.tips.length > 0) {
    resultsHTML += `
      <div style="background: #fffbeb; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; border-left: 4px solid #f59e0b;">
        <h3 style="font-size: 1.2rem; font-weight: 700; color: #92400e; margin-bottom: 1rem;">💡 Mẹo Hữu Ích</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${searchResults.tips.slice(0, 5).map(tip => `
            <li style="padding: 0.75rem; margin-bottom: 0.5rem; background: white; border-radius: 6px; color: #374151; line-height: 1.6;">
              ${highlightText(tip, query)}
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }
  
  newsListGrid.innerHTML = resultsHTML;
  
  // Hiển thị bài viết nếu có
  if (searchResults.posts.length > 0) {
    newsListGrid.innerHTML += `
      <div style="margin-top: 2rem;">
        <h3 style="font-size: 1.3rem; font-weight: 700; color: #15803d; margin-bottom: 1.5rem;">📰 Bài Viết (${searchResults.posts.length})</h3>
        ${searchResults.posts.map(post => `
          <div class="news-list-card" onclick="showPostDetailNew(${post.id})" style="margin-bottom: 1.5rem;">
            <img src="${post.cover}" alt="${post.title}" class="news-list-card-img" onerror="this.src='/assets/image/placeholder.jpg'">
            <div class="news-list-card-content">
              <h3 class="news-list-card-title">${highlightText(post.title, query)}</h3>
              <p class="news-list-card-excerpt">${highlightText(post.excerpt, query)}</p>
              <div class="news-list-card-meta">
                <span>📅 ${post.date}</span>
                <span>👁️ ${post.views} lượt xem</span>
                <span>📁 ${post.categoryName}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

function highlightText(text, query) {
  if (!query) return text;
  const keywords = query.split(/\s+/).filter(word => word.length > 0);
  let result = text;
  keywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    result = result.replace(regex, '<mark style="background-color: #fef08a; padding: 0 2px; border-radius: 2px;">$1</mark>');
  });
  return result;
}

function clearSearch() {
  currentSearchQuery = '';
  const desktopInput = document.getElementById('search-input');
  const mobileInput = document.getElementById('search-input-mobile');
  if (desktopInput) desktopInput.value = '';
  if (mobileInput) mobileInput.value = '';
  
  // Reset về hiển thị tất cả bài viết
  if (typeof filterByCategory === 'function') {
    filterByCategory('all');
  }
}
