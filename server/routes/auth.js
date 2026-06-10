const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')
const auth = require('../middleware/auth')

const router = express.Router()

// 生成 Token
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// POST /api/auth/register - 用户注册
router.post('/register', async (req, res, next) => {
  try {
    const { username, password, nickname } = req.body

    if (!username || !password || !nickname) {
      return res.status(400).json({ code: 400, message: '缺少必填字段' })
    }
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ code: 400, message: '用户名长度需为3-20位' })
    }
    if (password.length < 6 || password.length > 20) {
      return res.status(400).json({ code: 400, message: '密码长度需为6-20位' })
    }

    const [existing] = await db.execute('SELECT id FROM users WHERE username = ?', [username])
    if (existing.length > 0) {
      return res.status(409).json({ code: 409, message: '用户名已存在' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const [result] = await db.execute(
      'INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)',
      [username, hashedPassword, nickname]
    )

    const user = { id: result.insertId, username, nickname, avatar: null }
    const token = generateToken(user)

    res.json({ code: 200, message: '注册成功', data: { token, user } })
  } catch (error) {
    next(error)
  }
})

// POST /api/auth/login - 用户登录
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '缺少用户名或密码' })
    }

    const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username])
    if (users.length === 0) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' })
    }

    const user = users[0]
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' })
    }

    const token = generateToken({ id: user.id, username: user.username, nickname: user.nickname })
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: { id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar }
      }
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/auth/profile - 获取当前用户信息
router.get('/profile', auth, async (req, res, next) => {
  try {
    const [users] = await db.execute(
      'SELECT id, username, nickname, avatar, phone, created_at FROM users WHERE id = ?',
      [req.user.userId]
    )
    if (users.length === 0) {
      return res.status(404).json({ code: 404, message: '用户不存在' })
    }
    res.json({ code: 200, message: 'success', data: users[0] })
  } catch (error) {
    next(error)
  }
})

// GET /api/auth/stats - 当前用户统计数据
router.get('/stats', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId
    const [[{ favoritesCount }]] = await db.execute(
      'SELECT COUNT(*) as favoritesCount FROM favorites WHERE user_id = ?', [userId]
    )
    const [[{ reviewsCount }]] = await db.execute(
      'SELECT COUNT(*) as reviewsCount FROM reviews WHERE user_id = ?', [userId]
    )
    const [[{ createdAt }]] = await db.execute(
      'SELECT created_at as createdAt FROM users WHERE id = ?', [userId]
    )
    const travelDays = createdAt
      ? Math.max(1, Math.ceil((Date.now() - new Date(createdAt).getTime()) / 86400000))
      : 0
    res.json({ code: 200, message: 'success', data: { favoritesCount, reviewsCount, travelDays } })
  } catch (error) {
    next(error)
  }
})

// PUT /api/auth/profile - 更新用户信息
router.put('/profile', auth, async (req, res, next) => {
  try {
    const { nickname, avatar } = req.body
    const updates = []
    const values = []

    if (nickname) { updates.push('nickname = ?'); values.push(nickname) }
    if (avatar) { updates.push('avatar = ?'); values.push(avatar) }

    if (updates.length === 0) {
      return res.status(400).json({ code: 400, message: '无更新内容' })
    }

    values.push(req.user.userId)
    await db.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values)

    const [users] = await db.execute(
      'SELECT id, username, nickname, avatar FROM users WHERE id = ?',
      [req.user.userId]
    )
    res.json({ code: 200, message: '更新成功', data: users[0] })
  } catch (error) {
    next(error)
  }
})

// PUT /api/auth/password - 修改密码
router.put('/password', auth, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ code: 400, message: '缺少必填字段' })
    }
    if (newPassword.length < 6 || newPassword.length > 20) {
      return res.status(400).json({ code: 400, message: '新密码长度需为6-20位' })
    }

    const [users] = await db.execute('SELECT password FROM users WHERE id = ?', [req.user.userId])
    if (users.length === 0) {
      return res.status(404).json({ code: 404, message: '用户不存在' })
    }

    const isMatch = await bcrypt.compare(oldPassword, users[0].password)
    if (!isMatch) {
      return res.status(400).json({ code: 400, message: '当前密码错误' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.userId])

    res.json({ code: 200, message: '密码修改成功', data: null })
  } catch (error) {
    next(error)
  }
})

module.exports = router
