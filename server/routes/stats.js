const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const [[overview]] = await db.execute(`
      SELECT
        COUNT(*) AS totalDestinations,
        ROUND(AVG(rating), 1) AS avgRating,
        (SELECT COUNT(*) FROM categories) AS totalCategories
      FROM destinations
    `);

    const [categoryDistribution] = await db.execute(`
      SELECT c.id AS categoryId, c.name AS categoryName, COUNT(d.id) AS count
      FROM categories c
      LEFT JOIN destinations d ON c.id = d.category_id
      GROUP BY c.id, c.name
      ORDER BY c.sort_order
    `);

    const [topRatedDestinations] = await db.execute(`
      SELECT d.id, d.name, d.rating, c.name AS categoryName
      FROM destinations d
      JOIN categories c ON d.category_id = c.id
      ORDER BY d.rating DESC
      LIMIT 10
    `);

    res.json({
      code: 200,
      message: 'success',
      data: { overview, categoryDistribution, topRatedDestinations },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
