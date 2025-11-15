// Authentication middleware
exports.requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/admin/login?error=Vui lòng đăng nhập');
};

// CSRF Protection using double submit cookie
exports.csrfProtection = (req, res, next) => {
  if (req.method === 'GET') {
    // Generate CSRF token for GET requests
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // Client needs to read this
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });
    res.locals.csrfToken = token;
    
    // Add csrfToken() function to req for consistency with other CSRF libraries
    req.csrfToken = function() {
      return token;
    };
    
    console.log('CSRF token generated:', token.substring(0, 10) + '...');
    return next();
  }
  
  // Verify CSRF token for POST/PUT/DELETE requests
  const tokenFromCookie = req.cookies['XSRF-TOKEN'];
  const tokenFromBody = req.body._csrf || req.headers['x-csrf-token'];
  
  console.log('CSRF verification - Cookie:', tokenFromCookie ? tokenFromCookie.substring(0, 10) + '...' : 'none');
  console.log('CSRF verification - Body:', tokenFromBody ? tokenFromBody.substring(0, 10) + '...' : 'none');
  
  if (!tokenFromCookie || !tokenFromBody || tokenFromCookie !== tokenFromBody) {
    console.error('CSRF token mismatch!');
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  console.log('CSRF token valid');
  next();
};

// Add user data to all admin views
exports.addUserToViews = (req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.currentPath = req.path;
  next();
};
