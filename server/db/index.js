const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wuhu_travel',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  // Aiven 云数据库需要 SSL，本地开发时设 DB_SSL=false 可跳过
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
});

module.exports = pool;
