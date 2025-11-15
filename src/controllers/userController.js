const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const usersFile = path.join(__dirname, '../../models/users.json');
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
    
    // Write in { logs: [...] } format
    await fs.writeFile(logsFile, JSON.stringify({ logs }, null, 2));
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// Helper: Read users
async function readUsers() {
  const data = await fs.readFile(usersFile, 'utf8');
  const parsed = JSON.parse(data);
  // Handle both formats: { users: [...] } or [...]
  return parsed.users || parsed;
}

// Helper: Write users
async function writeUsers(users) {
  // Write in the format { users: [...] }
  await fs.writeFile(usersFile, JSON.stringify({ users }, null, 2));
}

// GET: List all users
exports.listUsers = async (req, res) => {
  try {
    const users = await readUsers();
    
    // Remove password hashes from response
    const safeUsers = users.map(u => ({
      username: u.username,
      role: u.role,
      createdAt: u.createdAt || 'N/A',
      failedAttempts: u.failedAttempts || 0,
      lockedUntil: u.lockedUntil
    }));
    
    res.render('admin/users', {
      currentPath: '/admin/users',
      user: req.session.user,
      users: safeUsers,
      csrfToken: req.csrfToken(),
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).send('Internal Server Error');
  }
};

// POST: Add new user
exports.addUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Validation
    if (!username || !password || !role) {
      return res.redirect('/admin/users?error=' + encodeURIComponent('Vui lòng điền đầy đủ thông tin'));
    }
    
    if (password.length < 6) {
      return res.redirect('/admin/users?error=' + encodeURIComponent('Mật khẩu phải có ít nhất 6 ký tự'));
    }
    
    const users = await readUsers();
    
    // Check if username exists
    if (users.find(u => u.username === username)) {
      return res.redirect('/admin/users?error=' + encodeURIComponent('Tên đăng nhập đã tồn tại'));
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Add new user
    const newUser = {
      username,
      password: hashedPassword,
      role: role || 'admin',
      createdAt: new Date().toISOString(),
      failedAttempts: 0,
      lockedUntil: null
    };
    
    users.push(newUser);
    await writeUsers(users);
    
    // Log activity
    await logActivity(req.session.user.username, 'user_created', `Created user: ${username}`, req);
    
    res.redirect('/admin/users?success=' + encodeURIComponent('Tạo tài khoản thành công'));
  } catch (error) {
    console.error('Error adding user:', error);
    res.redirect('/admin/users?error=' + encodeURIComponent('Lỗi khi tạo tài khoản'));
  }
};

// POST: Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { username } = req.body;
    
    // Prevent deleting yourself
    if (username === req.session.user.username) {
      return res.redirect('/admin/users?error=' + encodeURIComponent('Không thể xóa tài khoản đang đăng nhập'));
    }
    
    const users = await readUsers();
    const filteredUsers = users.filter(u => u.username !== username);
    
    if (users.length === filteredUsers.length) {
      return res.redirect('/admin/users?error=' + encodeURIComponent('Không tìm thấy tài khoản'));
    }
    
    await writeUsers(filteredUsers);
    
    // Log activity
    await logActivity(req.session.user.username, 'user_deleted', `Deleted user: ${username}`, req);
    
    res.redirect('/admin/users?success=' + encodeURIComponent('Xóa tài khoản thành công'));
  } catch (error) {
    console.error('Error deleting user:', error);
    res.redirect('/admin/users?error=' + encodeURIComponent('Lỗi khi xóa tài khoản'));
  }
};

// GET: Change password page
exports.showChangePassword = (req, res) => {
  res.render('admin/change-password', {
    currentPath: '/admin/change-password',
    user: req.session.user,
    csrfToken: req.csrfToken(),
    success: req.query.success,
    error: req.query.error
  });
};

// POST: Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.redirect('/admin/change-password?error=' + encodeURIComponent('Vui lòng điền đầy đủ thông tin'));
    }
    
    if (newPassword !== confirmPassword) {
      return res.redirect('/admin/change-password?error=' + encodeURIComponent('Mật khẩu mới không khớp'));
    }
    
    if (newPassword.length < 6) {
      return res.redirect('/admin/change-password?error=' + encodeURIComponent('Mật khẩu mới phải có ít nhất 6 ký tự'));
    }
    
    const users = await readUsers();
    const user = users.find(u => u.username === req.session.user.username);
    
    if (!user) {
      return res.redirect('/admin/change-password?error=' + encodeURIComponent('Không tìm thấy tài khoản'));
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.redirect('/admin/change-password?error=' + encodeURIComponent('Mật khẩu hiện tại không đúng'));
    }
    
    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.failedAttempts = 0;
    user.lockedUntil = null;
    
    await writeUsers(users);
    
    // Log activity
    await logActivity(req.session.user.username, 'password_changed', 'User changed their password', req);
    
    res.redirect('/admin/change-password?success=' + encodeURIComponent('Đổi mật khẩu thành công'));
  } catch (error) {
    console.error('Error changing password:', error);
    res.redirect('/admin/change-password?error=' + encodeURIComponent('Lỗi khi đổi mật khẩu'));
  }
};
