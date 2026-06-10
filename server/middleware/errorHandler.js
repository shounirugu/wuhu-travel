const errorHandler = (err, req, res, _next) => {
  console.error(`[${new Date().toISOString()}]`, err.message);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({ code: 400, message: '数据重复', data: null });
  }
  if (err.code === 'ER_PARSE_ERROR') {
    return res.status(400).json({ code: 400, message: 'SQL 语法错误', data: null });
  }

  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({
    code: 500,
    message: isProd ? '服务器内部错误' : (err.message || '服务器内部错误'),
    data: null,
  });
};

module.exports = errorHandler;
