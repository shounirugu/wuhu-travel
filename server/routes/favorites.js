const express = require('express')
const db = require('../db')
const auth = require('../middleware/auth')

const router = express.Router()

// GET /api/favorites/check/:id - 查询是否已收藏
router.get('/check/:id', auth, async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND destination_id = ?',
      [req.user.userId, req.params.id]
    )
    res.json({ code: 200, data: { favorited: rows.length > 0 } })
  } catch (error) {
    next(error)
  }
})

// POST /api/favorites/:id - 收藏景点
router.post('/:id', auth, async (req, res, next) => {
  try {
    const destinationId = req.params.id
    const userId = req.user.userId

    const [dest] = await db.execute('SELECT id FROM destinations WHERE id = ?', [destinationId])
    if (dest.length === 0) {
      return res.status(404).json({ code: 404, message: '景点不存在' })
    }

    const [existing] = await db.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND destination_id = ?',
      [userId, destinationId]
    )
    if (existing.length > 0) {
      return res.status(409).json({ code: 409, message: '已收藏' })
    }

    await db.execute(
      'INSERT INTO favorites (user_id, destination_id) VALUES (?, ?)',
      [userId, destinationId]
    )
    res.json({ code: 200, message: '收藏成功', data: null })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/favorites/:id - 取消收藏
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const destinationId = req.params.id
    const userId = req.user.userId

    const [result] = await db.execute(
      'DELETE FROM favorites WHERE user_id = ? AND destination_id = ?',
      [userId, destinationId]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '未收藏该景点' })
    }
    res.json({ code: 200, message: '取消收藏成功', data: null })
  } catch (error) {
    next(error)
  }
})

// GET /api/favorites - 我的收藏列表
router.get('/', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 10
    const offset = (page - 1) * pageSize

    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM favorites WHERE user_id = ?',
      [userId]
    )
    const total = countResult[0].total

    const [list] = await db.query(
      `SELECT f.id, f.destination_id, d.name, c.name as category_name,
              d.image_url, d.rating, d.address, f.created_at
       FROM favorites f
       JOIN destinations d ON f.destination_id = d.id
       JOIN categories c ON d.category_id = c.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, pageSize, offset]
    )

    res.json({
      code: 200,
      message: 'success',
      data: { list, total, page, pageSize }
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
