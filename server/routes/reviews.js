const express = require('express')
const db = require('../db')
const auth = require('../middleware/auth')

const router = express.Router()

// POST /api/reviews/:id - 发表评论
router.post('/:id', auth, async (req, res, next) => {
  try {
    const destinationId = req.params.id
    const userId = req.user.userId
    const { rating, content } = req.body

    if (!rating || !content) {
      return res.status(400).json({ code: 400, message: '缺少评分或评论内容' })
    }
    if (rating < 1.0 || rating > 5.0) {
      return res.status(400).json({ code: 400, message: '评分需在1.0-5.0之间' })
    }

    const [dest] = await db.execute('SELECT id FROM destinations WHERE id = ?', [destinationId])
    if (dest.length === 0) {
      return res.status(404).json({ code: 404, message: '景点不存在' })
    }

    const [result] = await db.execute(
      'INSERT INTO reviews (user_id, destination_id, rating, content) VALUES (?, ?, ?, ?)',
      [userId, destinationId, rating, content]
    )

    // 更新景点平均评分
    const [avgResult] = await db.execute(
      'SELECT ROUND(AVG(rating), 1) as avgRating FROM reviews WHERE destination_id = ?',
      [destinationId]
    )
    if (avgResult[0].avgRating) {
      await db.execute('UPDATE destinations SET rating = ? WHERE id = ?',
        [avgResult[0].avgRating, destinationId])
    }

    res.json({
      code: 200,
      message: '评论成功',
      data: {
        id: result.insertId,
        rating,
        content,
        created_at: new Date().toISOString()
      }
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/reviews/mine - 当前用户的评论列表
router.get('/mine', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 10
    const offset = (page - 1) * pageSize

    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM reviews WHERE user_id = ?',
      [userId]
    )
    const total = countResult[0].total

    const [list] = await db.query(
      `SELECT r.id, r.rating, r.content, r.created_at,
              d.id as destination_id, d.name as destination_name, d.image_url
       FROM reviews r
       JOIN destinations d ON r.destination_id = d.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC
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

// GET /api/reviews/:id - 景点评论列表
router.get('/:id', async (req, res, next) => {
  try {
    const destinationId = req.params.id
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 10
    const offset = (page - 1) * pageSize

    const [dest] = await db.execute('SELECT id FROM destinations WHERE id = ?', [destinationId])
    if (dest.length === 0) {
      return res.status(404).json({ code: 404, message: '景点不存在' })
    }

    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM reviews WHERE destination_id = ?',
      [destinationId]
    )
    const total = countResult[0].total

    const [list] = await db.query(
      `SELECT r.id, r.user_id, u.nickname, u.avatar, r.rating, r.content, r.created_at
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.destination_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [destinationId, pageSize, offset]
    )

    const [avgResult] = await db.execute(
      'SELECT ROUND(AVG(rating), 1) as avgRating FROM reviews WHERE destination_id = ?',
      [destinationId]
    )

    res.json({
      code: 200,
      message: 'success',
      data: {
        list,
        total,
        page,
        pageSize,
        avgRating: avgResult[0].avgRating || 0
      }
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
