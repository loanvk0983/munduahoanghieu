const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Controllers
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const contentController = require('../controllers/contentController');
const userController = require('../controllers/userController');
const dataController = require('../controllers/dataController');

// Middleware
const { requireAuth, csrfProtection, addUserToViews } = require('../middleware/auth');

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per windowMs
  message: 'Quá nhiều lần đăng nhập, vui lòng thử lại sau 15 phút',
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for other admin routes
const adminLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
  standardHeaders: true,
  legacyHeaders: false
});

// ============ Public Routes (Login/Logout) ============

// Login page
router.get('/login', authController.showLogin);

// Login form submission
router.post('/login',
  loginLimiter,
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.redirect('/admin/login?error=Vui lòng nhập đầy đủ thông tin');
    }
    next();
  },
  authController.login
);

// Logout
router.get('/logout', authController.logout);

// ============ Protected Admin Routes ============

// Apply middleware to all routes below
router.use(requireAuth);
router.use(adminLimiter);
router.use(csrfProtection);
router.use(addUserToViews);

// Dashboard
router.get('/dashboard', adminController.dashboard);

// Content Management
router.get('/content', contentController.showContent);
router.post('/content',
  body('siteName').trim().notEmpty(),
  body('slogan').trim().notEmpty(),
  body('email').isEmail(),
  body('phone').trim().notEmpty(),
  contentController.updateContent
);

// Logs Management
router.get('/logs', adminController.viewLogs);
router.get('/logs/export', adminController.exportLogs);
router.delete('/logs/clear', adminController.clearLogs);

// User Management
router.get('/users', userController.listUsers);
router.post('/users/add',
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  userController.addUser
);
router.post('/users/delete',
  body('username').trim().notEmpty(),
  userController.deleteUser
);

// Change Password
router.get('/change-password', userController.showChangePassword);
router.post('/change-password',
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  body('confirmPassword').notEmpty(),
  userController.changePassword
);

// Placeholder routes (to be implemented)
router.get('/images', (req, res) => {
  res.render('admin/placeholder', {
    title: 'Quản lý Hình ảnh',
    message: 'Tính năng đang phát triển'
  });
});

// Banner Management Routes
router.get('/banners', contentController.showBanners);
router.post('/banners/add',
  body('image').trim().notEmpty().withMessage('Đường dẫn hình ảnh không được để trống'),
  body('title').trim().notEmpty().withMessage('Tiêu đề không được để trống'),
  body('subtitle').trim().notEmpty().withMessage('Phụ đề không được để trống'),
  body('buttonText').trim().notEmpty().withMessage('Text nút không được để trống'),
  body('buttonLink').trim().notEmpty().withMessage('Link nút không được để trống'),
  contentController.addBanner
);
router.post('/banners/update',
  body('bannerId').isInt().withMessage('ID không hợp lệ'),
  body('image').trim().notEmpty().withMessage('Đường dẫn hình ảnh không được để trống'),
  body('title').trim().notEmpty().withMessage('Tiêu đề không được để trống'),
  contentController.updateBanner
);
router.post('/banners/delete',
  body('bannerId').isInt().withMessage('ID không hợp lệ'),
  contentController.deleteBanner
);

// Data Management
router.get('/data', dataController.showDataManagement);

// Products routes
router.post('/data/products/add',
  body('name').trim().notEmpty().withMessage('Tên sản phẩm không được để trống'),
  body('description').trim().notEmpty().withMessage('Mô tả không được để trống'),
  dataController.addProduct
);
router.post('/data/products/update',
  body('id').isInt().withMessage('ID không hợp lệ'),
  body('name').trim().notEmpty().withMessage('Tên sản phẩm không được để trống'),
  body('description').trim().notEmpty().withMessage('Mô tả không được để trống'),
  dataController.updateProduct
);
router.post('/data/products/delete',
  body('id').isInt().withMessage('ID không hợp lệ'),
  dataController.deleteProduct
);

// Banners routes
router.post('/data/banners/add',
  body('image').trim().notEmpty().withMessage('Đường dẫn hình ảnh không được để trống'),
  body('title').trim().notEmpty().withMessage('Tiêu đề không được để trống'),
  dataController.addBanner
);
router.post('/data/banners/update',
  body('id').isInt().withMessage('ID không hợp lệ'),
  body('image').trim().notEmpty().withMessage('Đường dẫn hình ảnh không được để trống'),
  body('title').trim().notEmpty().withMessage('Tiêu đề không được để trống'),
  dataController.updateBanner
);
router.post('/data/banners/delete',
  body('id').isInt().withMessage('ID không hợp lệ'),
  dataController.deleteBanner
);

// Testimonials routes
router.post('/data/testimonials/add',
  body('name').trim().notEmpty().withMessage('Tên khách hàng không được để trống'),
  body('location').trim().notEmpty().withMessage('Địa điểm không được để trống'),
  body('content').trim().notEmpty().withMessage('Nội dung đánh giá không được để trống'),
  dataController.addTestimonial
);
router.post('/data/testimonials/update',
  body('id').isInt().withMessage('ID không hợp lệ'),
  body('name').trim().notEmpty().withMessage('Tên khách hàng không được để trống'),
  body('location').trim().notEmpty().withMessage('Địa điểm không được để trống'),
  body('content').trim().notEmpty().withMessage('Nội dung đánh giá không được để trống'),
  dataController.updateTestimonial
);
router.post('/data/testimonials/delete',
  body('id').isInt().withMessage('ID không hợp lệ'),
  dataController.deleteTestimonial
);

module.exports = router;
