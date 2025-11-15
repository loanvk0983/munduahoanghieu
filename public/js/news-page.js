// news-page.js (extracted from views/news.twig)

// Server should inject window.__QUICK_NEWS__ if available. Also server may inject __NEWS_DATA__ if desired.

// News Database (keep as-is; consider moving this to public/data/news.json in future)
const newsData = [
  {
    id: 1,
    title: "Làm Thế Nào Phân Biệt Mụn Dừa Đã Xử Lý Và Chưa Xử Lý",
    category: "Kỹ Thuật",
    categoryKey: "techniques",
    date: "19/10/2025",
    thumbnail: "/assets/image/News/1.1-Mun da xu ly.jpg",
    excerpt: "Hướng dẫn chi tiết cách nhận biết mụn dừa đã xử lý và chưa xử lý qua màu sắc, cảm quan và các chỉ số định lượng.",
    featured: true,
    readTime: "5 phút đọc",
    tags: ["Kiến thức", "Phân biệt", "Chất lượng"],
    content: `
      <h3 class="text-3xl font-bold text-green-700 mb-6">Phân Biệt Mụn Dừa Xử Lý & Chưa Xử Lý</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 shadow-lg">
          <div class="text-center mb-4">
            <span class="inline-block px-4 py-2 bg-orange-600 text-white rounded-full font-bold text-lg">✅ Mụn Đã Xử Lý</span>
          </div>
          <img src="/assets/image/News/1.1-Mun da xu ly.jpg" alt="Mụn đã xử lý" class="w-full rounded-lg shadow-md mb-4 hover:scale-105 transition-transform duration-300">
          <div class="space-y-3 text-gray-800">
            <div class="flex items-start gap-3">
              <span class="text-2xl">🎨</span>
              <div>
                <strong class="text-orange-700">Màu sắc:</strong> NÂU ĐỎ đặc trưng
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-2xl">👋</span>
              <div>
                <strong class="text-orange-700">Cảm quan:</strong> MỀM MỊN, ẨM ƯỚT
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-2xl">💧</span>
              <div>
                <strong class="text-orange-700">Giữ nước:</strong> Ngâm nước có màu NHẠT/TRONG SUỐT
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 shadow-lg">
          <div class="text-center mb-4">
            <span class="inline-block px-4 py-2 bg-yellow-600 text-white rounded-full font-bold text-lg">⚠️ Mụn Chưa Xử Lý</span>
          </div>
          <img src="/assets/image/News/1.2-Mun chua xu ly.jpg" alt="Mụn chưa xử lý" class="w-full rounded-lg shadow-md mb-4 hover:scale-105 transition-transform duration-300">
          <div class="space-y-3 text-gray-800">
            <div class="flex items-start gap-3">
              <span class="text-2xl">🎨</span>
              <div>
                <strong class="text-yellow-700">Màu sắc:</strong> VÀNG NHẠT
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-2xl">👋</span>
              <div>
                <strong class="text-yellow-700">Cảm quan:</strong> CỨNG, KHÔ RÁO
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-2xl">💧</span>
              <div>
                <strong class="text-yellow-700">Giữ nước:</strong> Ngâm nước có màu NÂU SẬM
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
        <h4 class="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
          <span class="text-2xl">🔬</span> Kiểm Tra Định Lượng (Độ Chính Xác Cao)
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-lg shadow">
            <div class="text-center mb-2 text-3xl">💦</div>
            <h5 class="font-semibold text-center mb-2">Độ Ẩm</h5>
            <p class="text-sm text-center">
              <span class="text-green-600 font-bold">Xử lý: 70-80%</span><br>
              <span class="text-gray-600">Chưa xử lý: 45-55%</span>
            </p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow">
            <div class="text-center mb-2 text-3xl">⚡</div>
            <h5 class="font-semibold text-center mb-2">Độ Dẫn Điện</h5>
            <p class="text-sm text-center">
              <span class="text-green-600 font-bold">Xử lý: ≤ 0.5</span><br>
              <span class="text-gray-600">Chưa xử lý: > 2.5</span>
            </p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow">
            <div class="text-center mb-2 text-3xl">🧪</div>
            <h5 class="font-semibold text-center mb-2">Độ pH</h5>
            <p class="text-sm text-center">
              <span class="text-green-600 font-bold">Xử lý: 6-7</span><br>
              <span class="text-gray-600">Chưa xử lý: 5.5-6.5</span>
            </p>
          </div>
        </div>
      </div>

      <div class="bg-green-50 rounded-lg p-6">
        <p class="text-lg text-gray-700 leading-relaxed">
          <strong class="text-green-700">💡 Lưu ý:</strong> Việc phân biệt đúng loại mụn dừa giúp bạn lựa chọn sản phẩm phù hợp 
          cho từng loại cây trồng, đảm bảo hiệu quả canh tác tốt nhất và tránh gây hại cho cây.
        </p>
      </div>
    `
  },
  {
    id: 2,
    title: "Những Tác Dụng Của Xơ Dừa Đối Với Cây Trồng",
    category: "Kinh Nghiệm",
    categoryKey: "experience",
    date: "18/10/2025",
    thumbnail: "/assets/image/News/2.2-Tac dung cua xo dua.jpg",
    excerpt: "Xơ dừa là vật liệu trồng cây thân thiện môi trường, giúp cây phát triển khỏe mạnh và tiết kiệm nước tưới.",
    featured: true,
    readTime: "4 phút đọc",
    tags: ["Xơ dừa", "Lợi ích", "Cây trồng"],
    content: `<h3 class="text-2xl font-bold text-green-700 mb-4">Lợi Ích Của Xơ Dừa</h3><p>Xơ dừa giúp giữ ẩm, thoáng khí và phát triển rễ mạnh mẽ.</p>`
  },
  {
    id: 3,
    title: "Lưu Ý Khi Sử Dụng Mụn Dừa Trồng Cây",
    category: "Kỹ Thuật",
    categoryKey: "techniques",
    date: "17/10/2025",
    thumbnail: "/assets/image/News/3.1-Luu y.jpg",
    excerpt: "Hướng dẫn cách sử dụng mụn dừa đúng cách để đạt hiệu quả tốt nhất cho cây trồng.",
    featured: false,
    readTime: "3 phút đọc",
    tags: ["Hướng dẫn", "Kỹ thuật"],
    content: `<h3 class="text-2xl font-bold text-green-700 mb-4">Cách Sử Dụng Mụn Dừa</h3><p>Ngâm nước trước khi sử dụng, trộn với đất hoặc sử dụng riêng.</p>`
  },
  {
    id: 4,
    title: "Mụn Dừa Là Gì Và Tại Sao Dùng Trong Trồng Cây",
    category: "Môi Trường",
    categoryKey: "environment",
    date: "16/10/2025",
    thumbnail: "/assets/image/News/4-1-Mua dua co tac dung gi.jpg",
    excerpt: "Giải thích về nguồn gốc, thành phần và lý do mụn dừa trở thành vật liệu trồng cây phổ biến.",
    featured: false,
    readTime: "6 phút đọc",
    tags: ["Giới thiệu", "Môi trường"],
    content: `<h3 class="text-2xl font-bold text-green-700 mb-4">Nguồn Gốc Mụn Dừa</h3><p>Mụn dừa được làm từ lớp xơ giữa vỏ dừa, là phụ phẩm tự nhiên tái chế.</p>`
  },
  {
    id: 5,
    title: "Lợi Ích Của Mụn Dừa Cho Cây Trồng Và Môi Trường",
    category: "Môi Trường",
    categoryKey: "environment",
    date: "15/10/2025",
    thumbnail: "/assets/image/News/5-1-.jpg",
    excerpt: "Tổng hợp những lợi ích vượt trội của mụn dừa so với các loại vật liệu trồng cây truyền thống.",
    featured: false,
    readTime: "5 phút đọc",
    tags: ["Lợi ích", "So sánh"],
    content: `<h3 class="text-2xl font-bold text-green-700 mb-4">Ưu Điểm Vượt Trội</h3><p>Mụn dừa bền vững, giảm phát thải CO2 và có thể tái sử dụng nhiều lần.</p>`
  },
  {
    id: 6,
    title: "Kinh Nghiệm Chọn Mua Mụn Dừa Chất Lượng",
    category: "Góc Chia Sẻ",
    categoryKey: "sharing",
    date: "14/10/2025",
    thumbnail: "/assets/image/News/1.1-Mun da xu ly.jpg",
    excerpt: "Bí quyết nhận biết và lựa chọn mụn dừa tốt nhất từ người có kinh nghiệm.",
    featured: false,
    readTime: "4 phút đọc",
    tags: ["Mua sắm", "Kinh nghiệm"],
    content: `<h3 class="text-2xl font-bold text-green-700 mb-4">Cách Chọn Mụn Dừa Tốt</h3><p>Chọn mụn có màu đồng đều, không mùi lạ, độ ẩm vừa phải.</p>`
  }
];

// Quick Tips Data
const quickTips = [
  { icon: "💧", title: "Giữ ẩm tốt", tip: "Mụn dừa giữ ẩm gấp 8-10 lần đất thường" },
  { icon: "🌱", title: "Thoáng khí", tip: "Tạo độ tơi xốp, rễ cây phát triển mạnh" },
  { icon: "♻️", title: "Tái sử dụng", tip: "Dùng 18-24 tháng, sau đó làm phân hữu cơ" },
  { icon: "💰", title: "Tiết kiệm", tip: "Giảm 40-50% lượng nước tưới" },
  { icon: "🌿", title: "pH lý tưởng", tip: "pH 6-7, phù hợp hầu hết cây trồng" }
];

// Utility: show toast (single definition)
function showNotification(message, type = 'info') {
  const old = document.getElementById('toastNotification'); if (old) old.remove();
  const colors = { success: 'bg-green-600', info: 'bg-blue-600', warning: 'bg-orange-600', error: 'bg-red-600' };
  const toast = document.createElement('div'); toast.id = 'toastNotification';
  toast.className = `fixed top-24 right-4 ${colors[type]||colors.info} text-white px-6 py-3 rounded-lg shadow-xl z-50`;
  toast.innerHTML = `<span style="font-weight:700;margin-right:8px">✔</span><span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

function renderNewsCards(items = newsData) {
  const container = document.getElementById('allNewsContainer') || document.getElementById('newsContainer') || document.getElementById('allNews');
  if (!container) return;
  container.innerHTML = (items||[]).map(n => `
    <div class="news-card" onclick="showPostDetail(${n.id})">
      <img src="${n.thumbnail||'/assets/image/News/placeholder.png'}" alt="${n.title}" class="news-card-image">
      <div class="news-card-content"><h3 class="news-card-title">${n.title}</h3><p class="news-card-description">${n.excerpt||''}</p></div>
    </div>
  `).join('');
}

function renderRelatedPostsList(items = []) { const c = document.getElementById('relatedPostsList'); if (!c) return; if (!items.length) { c.innerHTML = '<p class="text-gray-500 text-sm">Không có bài viết</p>'; return; } c.innerHTML = items.map(n => `<div class="related-post-item" onclick="showPostDetail(${n.id})"><div class="related-post-title">${n.title}</div><div class="related-post-date">📅 ${n.date||''}</div></div>`).join(''); }

function showPostDetail(id) { const post = newsData.find(x=>x.id===id); if(!post) return; const view = document.getElementById('postDetailView'); const content = document.getElementById('postDetailContent'); if(!view||!content) return; document.getElementById('allNewsContainer').style.display='none'; view.style.display='block'; content.innerHTML = `<div class="mb-6"><span style="font-weight:700;">${post.category||''}</span> <span style="margin-left:8px;color:#6b7280;">📅 ${post.date||''}</span></div>${post.content||''}`; view.scrollIntoView({behavior:'smooth'}); }

function closeDetailView() { const view = document.getElementById('postDetailView'); const container = document.getElementById('allNewsContainer'); if(view) view.style.display='none'; if(container) container.style.display='grid'; }

function initBannerSlider(){ if(typeof Swiper==='undefined') return; try{ new Swiper('.swiper-hero', { loop:true, speed:800, effect:'fade', autoplay:{delay:5000,disableOnInteraction:false,pauseOnMouseEnter:true}, navigation:{nextEl:'.swiper-button-next',prevEl:'.swiper-button-prev'}, pagination:{el:'.swiper-pagination',clickable:true}, keyboard:{enabled:true} }); }catch(e){console.warn('Swiper init failed',e);} }

function initQuickNewsRotator() {
  const el = document.getElementById('quickNews');
  if(!el) return;
  let list = window.__QUICK_NEWS__||[];
  if(!list.length){ el.textContent='Chưa có tin nhanh'; return; }
  let idx=-1; 
  const next = ()=>{ 
    idx=(idx+1)%list.length; 
    el.classList.add('quick-fade-out');
    setTimeout(()=>{
      el.textContent = list[idx]; 
      el.classList.remove('quick-fade-out');
      el.classList.add('quick-fade-in');
      setTimeout(()=>el.classList.remove('quick-fade-in'), 220);
    }, 220);
  }; 
  next(); 
  setInterval(next,4000);
}

document.addEventListener('DOMContentLoaded', ()=>{
  initBannerSlider(); renderNewsCards(); renderRelatedPostsList(newsData.slice(0,4)); initQuickNewsRotator();
  const closeBtn = document.getElementById('closeDetailBtn'); if(closeBtn) closeBtn.addEventListener('click', closeDetailView);
  document.querySelectorAll('.category-tag').forEach(t => t.addEventListener('click', ()=>{ document.querySelectorAll('.category-tag').forEach(x=>x.classList.remove('active')); t.classList.add('active'); const cat = t.getAttribute('data-category'); if(cat==='all'){ renderNewsCards(); renderRelatedPostsList(newsData.slice(0,4)); } else { const filtered = newsData.filter(n=> (n.categoryKey||'').toLowerCase()===cat || (n.category||'').toLowerCase().includes(cat)); renderNewsCards(filtered); renderRelatedPostsList(filtered.slice(0,4)); } }));
});

// The rest of helper functions (renderNewsList, updateOGMetaTags, share functions, etc.) can be appended here if desired.
