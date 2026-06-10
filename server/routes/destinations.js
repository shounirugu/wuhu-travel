const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    let { category_id, q, page, pageSize } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    pageSize = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 9));
    const offset = (page - 1) * pageSize;

    let whereClauses = [];
    let params = [];

    if (category_id) {
      const catId = parseInt(category_id, 10);
      if (isNaN(catId) || catId < 1) {
        return res.status(400).json({
          code: 400,
          message: '参数错误：category_id 必须为正整数',
          data: null,
        });
      }
      whereClauses.push('d.category_id = ?');
      params.push(catId);
    }

    if (q && q.trim()) {
      whereClauses.push('d.name LIKE ?');
      params.push(`%${q.trim()}%`);
    }

    const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const countSQL = `SELECT COUNT(*) AS total FROM destinations d ${whereSQL}`;
    const [countResult] = await db.execute(countSQL, params);
    const total = Number(countResult[0].total);

    const listSQL = `
      SELECT d.id, d.name, d.category_id, c.name AS category_name,
             d.description, d.image_url, d.gallery_images, d.rating, d.address, d.tips, d.is_featured,
             d.latitude, d.longitude
      FROM destinations d
      JOIN categories c ON d.category_id = c.id
      ${whereSQL}
      ORDER BY d.is_featured DESC, d.rating DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `;
    const [list] = await db.execute(listSQL, params);

    res.json({
      code: 200,
      message: 'success',
      data: {
        list,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/featured', async (req, res, next) => {
  try {
    const [rows] = await db.execute(`
      SELECT d.id, d.name, d.category_id, c.name AS category_name,
             d.description, d.image_url, d.gallery_images, d.rating, d.address, d.tips, d.is_featured,
             d.latitude, d.longitude
      FROM destinations d
      JOIN categories c ON d.category_id = c.id
      WHERE d.is_featured = 1
      ORDER BY d.rating DESC
      LIMIT 6
    `);
    res.json({
      code: 200,
      message: 'success',
      data: rows,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 1) {
      return res.status(400).json({
        code: 400,
        message: '参数错误：id 必须为正整数',
        data: null,
      });
    }

    const [rows] = await db.execute(`
      SELECT d.id, d.name, d.category_id, c.name AS category_name,
             d.description, d.image_url, d.gallery_images, d.rating, d.address, d.tips,
             d.is_featured, d.created_at,
             d.latitude, d.longitude
      FROM destinations d
      JOIN categories c ON d.category_id = c.id
      WHERE d.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '该目的地不存在',
        data: null,
      });
    }

    res.json({
      code: 200,
      message: 'success',
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
