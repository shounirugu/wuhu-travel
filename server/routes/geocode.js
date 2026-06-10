const express = require('express')
const axios = require('axios')
const auth = require('../middleware/auth')
const rateLimit = require('express-rate-limit')

const router = express.Router()

const geocodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: '地理编码请求过于频繁' },
})

// GET /api/geocode?address=xxx - 地理编码
router.get('/', auth, geocodeLimiter, async (req, res) => {
  const { address } = req.query
  if (!address) {
    return res.status(400).json({ code: 400, message: '缺少 address 参数' })
  }

  try {
    const response = await axios.get('https://restapi.amap.com/v3/geocode/geo', {
      params: {
        key: process.env.AMAP_KEY,
        address: address,
        city: '芜湖'
      }
    })

    if (response.data.status === '1' && response.data.geocodes.length > 0) {
      const [lng, lat] = response.data.geocodes[0].location.split(',')
      res.json({
        code: 200,
        message: 'success',
        data: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          formatted_address: response.data.geocodes[0].formatted_address
        }
      })
    } else {
      res.status(404).json({ code: 404, message: '地址未找到' })
    }
  } catch (error) {
    console.error('地理编码失败:', error)
    res.status(500).json({ code: 500, message: '地理编码服务异常' })
  }
})

module.exports = router
