const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, icon, sort_order FROM categories ORDER BY sort_order'
    );
    res.json({
      code: 200,
      message: 'success',
      data: rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
