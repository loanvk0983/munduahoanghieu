// Utility functions for the application
function greet(name) {
  if (!name) return 'Xin chào!';
  return `Xin chào, ${name}! Chúc bạn một ngày tốt lành.`;
}

module.exports = { greet };
