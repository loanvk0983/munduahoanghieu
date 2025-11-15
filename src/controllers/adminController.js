const fs = require('fs').promises;
const path = require('path');
const { Parser } = require('json2csv');

const logsPath = path.join(__dirname, '../../models/logs.json');
const contentPath = path.join(__dirname, '../../models/content.json');
const productsPath = path.join(__dirname, '../../public/data/products.json');

// Helper: Read JSON file
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

// GET /admin/dashboard - Show dashboard
exports.dashboard = async (req, res) => {
  try {
    const logs = await readJSON(logsPath);
    const content = await readJSON(contentPath);
    const products = await readJSON(productsPath);
    
    // Calculate stats
    const stats = {
      logsCount: logs ? logs.logs.length : 0,
      productsCount: products ? products.products.length : 0,
      lastUpdate: content ? content.lastUpdated : null,
      recentLogs: logs ? logs.logs.slice(0, 10) : []
    };
    
    res.render('admin/dashboard', {
      title: 'Dashboard - Admin',
      stats,
      user: req.session.user
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Lỗi hệ thống');
  }
};

// GET /admin/logs - Show logs with filters
exports.viewLogs = async (req, res) => {
  try {
    const logs = await readJSON(logsPath);
    
    if (!logs) {
      return res.status(500).send('Không thể đọc logs');
    }
    
    let filteredLogs = [...logs.logs];
    
    // Filter by search query
    const search = req.query.search;
    if (search) {
      filteredLogs = filteredLogs.filter(log => 
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.details.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filter by date range
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    if (startDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= end
      );
    }
    
    res.render('admin/logs', {
      title: 'Quản lý Logs - Admin',
      logs: filteredLogs,
      search: search || '',
      startDate: startDate || '',
      endDate: endDate || ''
    });
  } catch (error) {
    console.error('View logs error:', error);
    res.status(500).send('Lỗi hệ thống');
  }
};

// GET /admin/logs/export - Export logs as CSV
exports.exportLogs = async (req, res) => {
  try {
    const logs = await readJSON(logsPath);
    
    if (!logs || !logs.logs.length) {
      return res.status(404).send('Không có logs để export');
    }
    
    const fields = ['id', 'timestamp', 'user', 'action', 'details', 'ip', 'userAgent'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(logs.logs);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=logs-${Date.now()}.csv`);
    res.send('\uFEFF' + csv); // UTF-8 BOM for Excel compatibility
  } catch (error) {
    console.error('Export logs error:', error);
    res.status(500).send('Lỗi export logs');
  }
};

// DELETE /admin/logs/clear - Clear all logs
exports.clearLogs = async (req, res) => {
  try {
    const logs = { logs: [] };
    await fs.writeFile(logsPath, JSON.stringify(logs, null, 2), 'utf8');
    res.json({ success: true, message: 'Đã xóa tất cả logs' });
  } catch (error) {
    console.error('Clear logs error:', error);
    res.status(500).json({ error: 'Lỗi xóa logs' });
  }
};
