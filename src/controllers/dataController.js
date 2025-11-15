const fs = require('fs').promises;
const path = require('path');

// File paths
const productsFile = path.join(__dirname, '../../public/data/products.json');
const bannersFile = path.join(__dirname, '../../public/data/banners.json');
const testimonialsFile = path.join(__dirname, '../../public/data/testimonials.json');
const logsFile = path.join(__dirname, '../../models/logs.json');

// Helper: Log activity
async function logActivity(user, action, details, req) {
  try {
    const data = await fs.readFile(logsFile, 'utf8');
    const parsed = JSON.parse(data);
    const logs = parsed.logs || parsed;
    
    const newLog = {
      id: logs.length + 1,
      timestamp: new Date().toISOString(),
      user: user,
      action: action,
      details: details,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    logs.push(newLog);
    
    await fs.writeFile(logsFile, JSON.stringify({ logs }, null, 2));
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// Helper: Read JSON file
async function readJsonFile(filePath) {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

// Helper: Write JSON file
async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ============ Main Data Management Page ============

// GET: Show data management page
exports.showDataManagement = async (req, res) => {
  try {
    const products = await readJsonFile(productsFile);
    const banners = await readJsonFile(bannersFile);
    const testimonials = await readJsonFile(testimonialsFile);
    
    res.render('admin/data', {
      currentPath: '/admin/data',
      user: req.session.user,
      products: products.products || [],
      banners: banners.banners || [],
      testimonials: testimonials.testimonials || [],
      csrfToken: req.csrfToken(),
      success: req.query.success,
      error: req.query.error,
      tab: req.query.tab || 'products'
    });
  } catch (error) {
    console.error('Error loading data:', error);
    res.status(500).send('Internal Server Error');
  }
};

// ============ Products Management ============

// POST: Add new product
exports.addProduct = async (req, res) => {
  try {
    const { name, description, features, price, category, image } = req.body;
    
    const data = await readJsonFile(productsFile);
    const products = data.products || [];
    
    // Parse features (comma-separated or JSON array)
    let parsedFeatures = [];
    if (typeof features === 'string') {
      parsedFeatures = features.split(',').map(f => f.trim()).filter(f => f);
    } else if (Array.isArray(features)) {
      parsedFeatures = features;
    }
    
    const newProduct = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      name,
      description,
      features: parsedFeatures,
      price: price || 'Liên hệ',
      category: category || 'main',
      image: image || '/assets/image/products/default.jpg'
    };
    
    products.push(newProduct);
    await writeJsonFile(productsFile, { products });
    
    await logActivity(req.session.user.username, 'product_added', `Added product: ${name}`, req);
    
    res.redirect('/admin/data?tab=products&success=' + encodeURIComponent('Thêm sản phẩm thành công'));
  } catch (error) {
    console.error('Error adding product:', error);
    res.redirect('/admin/data?tab=products&error=' + encodeURIComponent('Lỗi khi thêm sản phẩm'));
  }
};

// POST: Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id, name, description, features, price, category, image } = req.body;
    
    const data = await readJsonFile(productsFile);
    const products = data.products || [];
    
    const productIndex = products.findIndex(p => p.id === parseInt(id));
    if (productIndex === -1) {
      return res.redirect('/admin/data?tab=products&error=' + encodeURIComponent('Không tìm thấy sản phẩm'));
    }
    
    // Parse features
    let parsedFeatures = [];
    if (typeof features === 'string') {
      parsedFeatures = features.split(',').map(f => f.trim()).filter(f => f);
    } else if (Array.isArray(features)) {
      parsedFeatures = features;
    }
    
    products[productIndex] = {
      ...products[productIndex],
      name,
      description,
      features: parsedFeatures,
      price: price || 'Liên hệ',
      category: category || 'main',
      image: image || products[productIndex].image
    };
    
    await writeJsonFile(productsFile, { products });
    
    await logActivity(req.session.user.username, 'product_updated', `Updated product: ${name}`, req);
    
    res.redirect('/admin/data?tab=products&success=' + encodeURIComponent('Cập nhật sản phẩm thành công'));
  } catch (error) {
    console.error('Error updating product:', error);
    res.redirect('/admin/data?tab=products&error=' + encodeURIComponent('Lỗi khi cập nhật sản phẩm'));
  }
};

// POST: Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;
    
    const data = await readJsonFile(productsFile);
    let products = data.products || [];
    
    const product = products.find(p => p.id === parseInt(id));
    if (!product) {
      return res.redirect('/admin/data?tab=products&error=' + encodeURIComponent('Không tìm thấy sản phẩm'));
    }
    
    products = products.filter(p => p.id !== parseInt(id));
    await writeJsonFile(productsFile, { products });
    
    await logActivity(req.session.user.username, 'product_deleted', `Deleted product: ${product.name}`, req);
    
    res.redirect('/admin/data?tab=products&success=' + encodeURIComponent('Xóa sản phẩm thành công'));
  } catch (error) {
    console.error('Error deleting product:', error);
    res.redirect('/admin/data?tab=products&error=' + encodeURIComponent('Lỗi khi xóa sản phẩm'));
  }
};

// ============ Banners Management ============

// POST: Add new banner
exports.addBanner = async (req, res) => {
  try {
    const { image, title, subtitle, active } = req.body;
    
    const data = await readJsonFile(bannersFile);
    const banners = data.banners || [];
    
    const newBanner = {
      id: banners.length > 0 ? Math.max(...banners.map(b => b.id)) + 1 : 1,
      image: image || '/assets/image/banner/default.jpg',
      title,
      subtitle,
      active: active === 'true' || active === true
    };
    
    banners.push(newBanner);
    await writeJsonFile(bannersFile, { banners });
    
    await logActivity(req.session.user.username, 'banner_added', `Added banner: ${title}`, req);
    
    res.redirect('/admin/data?tab=banners&success=' + encodeURIComponent('Thêm banner thành công'));
  } catch (error) {
    console.error('Error adding banner:', error);
    res.redirect('/admin/data?tab=banners&error=' + encodeURIComponent('Lỗi khi thêm banner'));
  }
};

// POST: Update banner
exports.updateBanner = async (req, res) => {
  try {
    const { id, image, title, subtitle, active } = req.body;
    
    const data = await readJsonFile(bannersFile);
    const banners = data.banners || [];
    
    const bannerIndex = banners.findIndex(b => b.id === parseInt(id));
    if (bannerIndex === -1) {
      return res.redirect('/admin/data?tab=banners&error=' + encodeURIComponent('Không tìm thấy banner'));
    }
    
    banners[bannerIndex] = {
      ...banners[bannerIndex],
      image: image || banners[bannerIndex].image,
      title,
      subtitle,
      active: active === 'true' || active === true
    };
    
    await writeJsonFile(bannersFile, { banners });
    
    await logActivity(req.session.user.username, 'banner_updated', `Updated banner: ${title}`, req);
    
    res.redirect('/admin/data?tab=banners&success=' + encodeURIComponent('Cập nhật banner thành công'));
  } catch (error) {
    console.error('Error updating banner:', error);
    res.redirect('/admin/data?tab=banners&error=' + encodeURIComponent('Lỗi khi cập nhật banner'));
  }
};

// POST: Delete banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.body;
    
    const data = await readJsonFile(bannersFile);
    let banners = data.banners || [];
    
    const banner = banners.find(b => b.id === parseInt(id));
    if (!banner) {
      return res.redirect('/admin/data?tab=banners&error=' + encodeURIComponent('Không tìm thấy banner'));
    }
    
    banners = banners.filter(b => b.id !== parseInt(id));
    await writeJsonFile(bannersFile, { banners });
    
    await logActivity(req.session.user.username, 'banner_deleted', `Deleted banner: ${banner.title}`, req);
    
    res.redirect('/admin/data?tab=banners&success=' + encodeURIComponent('Xóa banner thành công'));
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.redirect('/admin/data?tab=banners&error=' + encodeURIComponent('Lỗi khi xóa banner'));
  }
};

// ============ Testimonials Management ============

// POST: Add new testimonial
exports.addTestimonial = async (req, res) => {
  try {
    const { name, location, rating, content, crop, usage_duration, avatar_color } = req.body;
    
    const data = await readJsonFile(testimonialsFile);
    const testimonials = data.testimonials || [];
    
    const newTestimonial = {
      id: testimonials.length > 0 ? Math.max(...testimonials.map(t => t.id)) + 1 : 1,
      name,
      location,
      rating: parseInt(rating) || 5,
      content,
      crop,
      usage_duration,
      avatar_color: avatar_color || 'bg-green-600'
    };
    
    testimonials.push(newTestimonial);
    await writeJsonFile(testimonialsFile, { testimonials });
    
    await logActivity(req.session.user.username, 'testimonial_added', `Added testimonial from: ${name}`, req);
    
    res.redirect('/admin/data?tab=testimonials&success=' + encodeURIComponent('Thêm đánh giá thành công'));
  } catch (error) {
    console.error('Error adding testimonial:', error);
    res.redirect('/admin/data?tab=testimonials&error=' + encodeURIComponent('Lỗi khi thêm đánh giá'));
  }
};

// POST: Update testimonial
exports.updateTestimonial = async (req, res) => {
  try {
    const { id, name, location, rating, content, crop, usage_duration, avatar_color } = req.body;
    
    const data = await readJsonFile(testimonialsFile);
    const testimonials = data.testimonials || [];
    
    const testimonialIndex = testimonials.findIndex(t => t.id === parseInt(id));
    if (testimonialIndex === -1) {
      return res.redirect('/admin/data?tab=testimonials&error=' + encodeURIComponent('Không tìm thấy đánh giá'));
    }
    
    testimonials[testimonialIndex] = {
      ...testimonials[testimonialIndex],
      name,
      location,
      rating: parseInt(rating) || 5,
      content,
      crop,
      usage_duration,
      avatar_color: avatar_color || testimonials[testimonialIndex].avatar_color
    };
    
    await writeJsonFile(testimonialsFile, { testimonials });
    
    await logActivity(req.session.user.username, 'testimonial_updated', `Updated testimonial from: ${name}`, req);
    
    res.redirect('/admin/data?tab=testimonials&success=' + encodeURIComponent('Cập nhật đánh giá thành công'));
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.redirect('/admin/data?tab=testimonials&error=' + encodeURIComponent('Lỗi khi cập nhật đánh giá'));
  }
};

// POST: Delete testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.body;
    
    const data = await readJsonFile(testimonialsFile);
    let testimonials = data.testimonials || [];
    
    const testimonial = testimonials.find(t => t.id === parseInt(id));
    if (!testimonial) {
      return res.redirect('/admin/data?tab=testimonials&error=' + encodeURIComponent('Không tìm thấy đánh giá'));
    }
    
    testimonials = testimonials.filter(t => t.id !== parseInt(id));
    await writeJsonFile(testimonialsFile, { testimonials });
    
    await logActivity(req.session.user.username, 'testimonial_deleted', `Deleted testimonial from: ${testimonial.name}`, req);
    
    res.redirect('/admin/data?tab=testimonials&success=' + encodeURIComponent('Xóa đánh giá thành công'));
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.redirect('/admin/data?tab=testimonials&error=' + encodeURIComponent('Lỗi khi xóa đánh giá'));
  }
};
