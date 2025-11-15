const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

const usersPath = path.join(__dirname, '../../models/users.json');
const logsPath = path.join(__dirname, '../../models/logs.json');

// Helper: Read JSON file
async function readJSON(filePath) {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

// Helper: Write JSON file
async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Helper: Log activity
async function logActivity(user, action, details, req) {
  try {
    const logs = await readJSON(logsPath);
    const newLog = {
      id: logs.logs.length + 1,
      timestamp: new Date().toISOString(),
      user: user || 'anonymous',
      action,
      details,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'Unknown'
    };
    logs.logs.unshift(newLog); // Add to beginning
    
    // Keep only last 1000 logs
    if (logs.logs.length > 1000) {
      logs.logs = logs.logs.slice(0, 1000);
    }
    
    await writeJSON(logsPath, logs);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// GET /admin/login - Show login form
exports.showLogin = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/admin/dashboard');
  }
  
  res.render('admin/login', {
    title: 'Đăng nhập Admin',
    error: req.query.error || null,
    message: req.query.message || null
  });
};

// POST /admin/login - Process login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      await logActivity(null, 'login_failed', 'Missing credentials', req);
      return res.redirect('/admin/login?error=Vui lòng nhập đầy đủ thông tin');
    }
    
    const users = await readJSON(usersPath);
    const user = users.users.find(u => u.username === username);
    
    if (!user) {
      await logActivity(username, 'login_failed', 'User not found', req);
      return res.redirect('/admin/login?error=Tên đăng nhập hoặc mật khẩu không đúng');
    }
    
    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const lockTimeRemaining = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
      await logActivity(username, 'login_failed', 'Account locked', req);
      return res.redirect(`/admin/login?error=Tài khoản bị khóa. Vui lòng thử lại sau ${lockTimeRemaining} phút`);
    }
    
    // Reset lock if time passed
    if (user.lockedUntil && new Date(user.lockedUntil) <= new Date()) {
      user.lockedUntil = null;
      user.failedAttempts = 0;
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      user.failedAttempts = (user.failedAttempts || 0) + 1;
      
      if (user.failedAttempts >= 5) {
        // Lock account for 30 minutes
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        await writeJSON(usersPath, users);
        await logActivity(username, 'account_locked', `Failed ${user.failedAttempts} times`, req);
        return res.redirect('/admin/login?error=Tài khoản đã bị khóa 30 phút do đăng nhập sai quá nhiều lần');
      }
      
      await writeJSON(usersPath, users);
      await logActivity(username, 'login_failed', `Failed attempt ${user.failedAttempts}/5`, req);
      return res.redirect(`/admin/login?error=Mật khẩu không đúng (${user.failedAttempts}/5 lần thử)`);
    }
    
    // Successful login
    user.failedAttempts = 0;
    user.lockedUntil = null;
    user.lastLogin = new Date().toISOString();
    await writeJSON(usersPath, users);
    
    // Create session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    await logActivity(username, 'login_success', 'User logged in successfully', req);
    res.redirect('/admin/dashboard');
    
  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/admin/login?error=Lỗi hệ thống, vui lòng thử lại');
  }
};

// GET /admin/logout - Logout
exports.logout = async (req, res) => {
  const username = req.session.user ? req.session.user.username : 'unknown';
  
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
  });
  
  await logActivity(username, 'logout', 'User logged out', req);
  res.redirect('/admin/login?message=Đăng xuất thành công');
};
