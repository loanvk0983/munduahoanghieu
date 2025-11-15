const fs = require('fs').promises;
const path = require('path');

// Single source of truth: public/data/content.json
const publicContentPath = path.join(__dirname, '../../public/data/content.json');

// Helper: Read JSON file
async function readJSON(filePath) {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

// Helper: Write JSON file
async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Helper: Log action
async function logAction(user, action, details) {
  try {
    const logsPath = path.join(__dirname, '../../models/logs.json');
    const logs = await readJSON(logsPath);
    
    logs.logs.push({
      timestamp: new Date().toISOString(),
      user: user,
      action: action,
      details: details,
      ip: 'system'
    });
    
    await writeJSON(logsPath, logs);
  } catch (error) {
    console.error('Logging error:', error);
  }
}

// GET /admin/content - Show content edit form
exports.showContent = async (req, res) => {
  try {
    const content = await readJSON(publicContentPath);
    
    res.render('admin/content', {
      title: 'Quản lý Nội dung - Admin',
      content,
      success: req.query.success || null
    });
  } catch (error) {
    console.error('Show content error:', error);
    res.status(500).send('Lỗi đọc nội dung');
  }
};

// POST /admin/content - Update content
exports.updateContent = async (req, res) => {
  try {
    const {
      siteName,
      slogan,
      description,
      keywords,
      email,
      phone,
      address,
      workHours,
      facebook,
      zalo,
      youtube,
      whatsapp
    } = req.body;
    
    const content = await readJSON(publicContentPath);
    
    // Update site info
    content.site.name = siteName || content.site.name;
    content.site.slogan = slogan || content.site.slogan;
    content.site.description = description || content.site.description;
    content.site.keywords = keywords || content.site.keywords;
    
    // Update contact info
    content.contact.email = email || content.contact.email;
    content.contact.phone = phone || content.contact.phone;
    content.contact.address = address || content.contact.address;
    content.contact.workHours = workHours || content.contact.workHours;
    
    // Update social links
    content.contact.facebook = facebook || content.contact.facebook;
    content.contact.zalo = zalo || content.contact.zalo;
    content.contact.youtube = youtube || content.contact.youtube;
    content.contact.whatsapp = whatsapp || content.contact.whatsapp;
    
    // Update timestamp
    content.lastUpdated = new Date().toISOString();
    
    await writeJSON(publicContentPath, content);
    
    // Log action
    await logAction(req.session.username, 'content_update', 'Cập nhật thông tin website');
    
    res.redirect('/admin/content?success=Cập nhật nội dung thành công');
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).send('Lỗi cập nhật nội dung');
  }
};

// ============ BANNER MANAGEMENT ============

// GET /admin/banners - Show banner management page
exports.showBanners = async (req, res) => {
  try {
    const content = await readJSON(publicContentPath);
    
    res.render('admin/edit-banner', {
      title: 'Quản lý Banner - Admin',
      banners: content.banners || [],
      message: req.query.message ? {
        type: req.query.type || 'success',
        text: req.query.message
      } : null,
      csrfToken: req.csrfToken()
    });
  } catch (error) {
    console.error('Show banners error:', error);
    res.status(500).send('Lỗi đọc dữ liệu banner');
  }
};

// POST /admin/banners/add - Add new banner
exports.addBanner = async (req, res) => {
  try {
    const { image, title, subtitle, buttonText, buttonLink, buttonColor } = req.body;
    
    // Validate required fields
    if (!image || !title || !subtitle || !buttonText || !buttonLink) {
      return res.redirect('/admin/banners?type=error&message=Vui lòng điền đầy đủ thông tin');
    }
    
    const content = await readJSON(publicContentPath);
    
    // Find max ID
    const maxId = content.banners.reduce((max, b) => Math.max(max, b.id), 0);
    
    // Create new banner
    const newBanner = {
      id: maxId + 1,
      image: image.trim(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      buttonText: buttonText.trim(),
      buttonLink: buttonLink.trim(),
      buttonColor: buttonColor || 'green',
      active: true
    };
    
    content.banners.push(newBanner);
    await writeJSON(publicContentPath, content);
    
    // Log action
    await logAction(req.session.username, 'banner_add', `Thêm banner: ${title}`);
    
    res.redirect('/admin/banners?type=success&message=Thêm banner thành công');
  } catch (error) {
    console.error('Add banner error:', error);
    res.redirect('/admin/banners?type=error&message=Lỗi thêm banner');
  }
};

// POST /admin/banners/update - Update existing banner
exports.updateBanner = async (req, res) => {
  try {
    const { bannerId, image, title, subtitle, buttonText, buttonLink, buttonColor, active } = req.body;
    
    if (!bannerId) {
      return res.redirect('/admin/banners?type=error&message=Không tìm thấy banner');
    }
    
    const content = await readJSON(publicContentPath);
    const bannerIndex = content.banners.findIndex(b => b.id == bannerId);
    
    if (bannerIndex === -1) {
      return res.redirect('/admin/banners?type=error&message=Không tìm thấy banner');
    }
    
    // Update banner
    content.banners[bannerIndex] = {
      ...content.banners[bannerIndex],
      image: image.trim(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      buttonText: buttonText.trim(),
      buttonLink: buttonLink.trim(),
      buttonColor: buttonColor || 'green',
      active: active === 'true'
    };
    
    await writeJSON(publicContentPath, content);
    
    // Log action
    await logAction(req.session.username, 'banner_update', `Cập nhật banner: ${title}`);
    
    res.redirect('/admin/banners?type=success&message=Cập nhật banner thành công');
  } catch (error) {
    console.error('Update banner error:', error);
    res.redirect('/admin/banners?type=error&message=Lỗi cập nhật banner');
  }
};

// POST /admin/banners/delete - Delete banner
exports.deleteBanner = async (req, res) => {
  try {
    const { bannerId } = req.body;
    
    if (!bannerId) {
      return res.redirect('/admin/banners?type=error&message=Không tìm thấy banner');
    }
    
    const content = await readJSON(publicContentPath);
    const bannerIndex = content.banners.findIndex(b => b.id == bannerId);
    
    if (bannerIndex === -1) {
      return res.redirect('/admin/banners?type=error&message=Không tìm thấy banner');
    }
    
    const deletedBanner = content.banners[bannerIndex];
    content.banners.splice(bannerIndex, 1);
    
    await writeJSON(publicContentPath, content);
    
    // Log action
    await logAction(req.session.username, 'banner_delete', `Xóa banner: ${deletedBanner.title}`);
    
    res.redirect('/admin/banners?type=success&message=Xóa banner thành công');
  } catch (error) {
    console.error('Delete banner error:', error);
    res.redirect('/admin/banners?type=error&message=Lỗi xóa banner');
  }
};
