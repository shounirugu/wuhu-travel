const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

// AI rate limit: 20 requests per 15 minutes per IP
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: 'AI 请求过于频繁，请 15 分钟后再试' },
});

const SYSTEM_PROMPT = `你是芜湖旅游推荐助手。你热情、专业，熟悉芜湖的风景名胜、特色美食、休闲项目和网红打卡地。

## 核心职责
1. 根据用户需求推荐芜湖的旅游目的地
2. 提供景点的详细介绍、评分、地址
3. 回答关于芜湖旅游的各种问题
4. 为用户规划旅游路线

## 注意事项
- 始终使用中文回复
- 回复要简洁、友好、有条理
- 推荐景点时附带评分、地址等关键信息
- 如果用户问超出芜湖旅游范围的问题，礼貌引导回旅游话题

## 数据库中的目的地信息（供参考）
{destinations_context}`;

async function buildContext() {
  try {
    const [rows] = await db.execute(`
      SELECT d.name, d.rating, d.address, d.description, c.name AS category_name
      FROM destinations d
      JOIN categories c ON d.category_id = c.id
      ORDER BY d.rating DESC
    `);
    return rows.map(r =>
      `- [${r.category_name}] ${r.name} ⭐${r.rating} | ${r.address} | ${r.description.substring(0, 80)}...`
    ).join('\n');
  } catch {
    return '暂无目的地数据';
  }
}

function buildMessages(systemPrompt, history, userMessage) {
  const messages = [{ role: 'system', content: systemPrompt }];

  if (history && Array.isArray(history)) {
    const recentHistory = history.slice(-20);
    for (const msg of recentHistory) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
  }

  messages.push({ role: 'user', content: userMessage });
  return messages;
}

router.post('/chat', aiLimiter, async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ code: 400, message: 'message 不能为空', data: null });
    }
    if (message.length > 500) {
      return res.status(400).json({ code: 400, message: 'message 不能超过 500 字符', data: null });
    }

    if (!DEEPSEEK_API_KEY) {
      return res.status(503).json({
        code: 503,
        message: 'AI 服务未配置',
        data: {
          reply: '抱歉，AI 助手尚未配置。您可以浏览网站探索芜湖好去处！\n\n🌄 风景：镜湖公园 ⭐4.5\n🎢 项目：方特欢乐世界 ⭐4.7\n🍜 小吃：耿福兴虾籽面 ⭐4.8\n📸 打卡：鸠兹古镇 ⭐4.5',
        },
      });
    }

    const context = await buildContext();
    const systemPrompt = SYSTEM_PROMPT.replace('{destinations_context}', context);
    const messages = buildMessages(systemPrompt, history, message.trim());

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const result = await response.json();
      const reply = result.choices?.[0]?.message?.content || '抱歉，我没有理解您的问题。';

      res.json({
        code: 200,
        message: 'success',
        data: {
          reply,
          model: 'deepseek-chat',
          usage: result.usage,
        },
      });
    } catch (fetchErr) {
      clearTimeout(timeout);
      throw fetchErr;
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(503).json({
        code: 503,
        message: 'AI 服务响应超时',
        data: {
          reply: '抱歉，AI 助手响应超时。以下是芜湖热门推荐：\n\n🌄 风景：镜湖公园 ⭐4.5\n🎢 项目：方特欢乐世界 ⭐4.7\n🍜 小吃：耿福兴虾籽面 ⭐4.8\n📸 打卡：鸠兹古镇 ⭐4.5\n\n您可以浏览网站探索更多芜湖好去处！',
        },
      });
    }
    next(err);
  }
});

router.post('/plan', aiLimiter, async (req, res, next) => {
  try {
    const { days, people, style } = req.body;

    if (!days || ![1, 2].includes(Number(days))) {
      return res.status(400).json({ code: 400, message: 'days 必须为 1 或 2', data: null });
    }

    if (!DEEPSEEK_API_KEY) {
      return res.status(503).json({
        code: 503,
        message: 'AI 服务未配置',
        data: { reply: '抱歉，AI 路线规划功能尚未配置。请先配置 DeepSeek API Key。' },
      });
    }

    const context = await buildContext();
    const peopleText = people ? `，${people}` : '';
    const styleText = style ? `，风格偏好：${style}` : '';
    const userMessage = `请为我规划一份${days}日芜湖旅游路线${peopleText}${styleText}。包含具体的时间安排、景点推荐和餐饮建议。`;

    const systemPrompt = SYSTEM_PROMPT.replace('{destinations_context}', context);
    const messages = buildMessages(systemPrompt, [], userMessage);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
          max_tokens: 1500,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const result = await response.json();
      const plan = result.choices?.[0]?.message?.content || '抱歉，无法生成路线规划。';

      res.json({
        code: 200,
        message: 'success',
        data: { plan },
      });
    } catch (fetchErr) {
      clearTimeout(timeout);
      throw fetchErr;
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(503).json({
        code: 503,
        message: 'AI 服务响应超时',
        data: { reply: '抱歉，路线规划超时，请稍后再试。' },
      });
    }
    next(err);
  }
});

// POST /api/ai/history - 保存AI对话
router.post('/history', auth, async (req, res, next) => {
  try {
    const { session_id, role, content } = req.body
    if (!session_id || !role || !content) {
      return res.status(400).json({ code: 400, message: '缺少必填字段' })
    }
    await db.execute(
      'INSERT INTO ai_history (user_id, session_id, role, content) VALUES (?, ?, ?, ?)',
      [req.user.userId, session_id, role, content]
    )
    res.json({ code: 200, message: '保存成功', data: null })
  } catch (error) {
    next(error)
  }
})

// GET /api/ai/history - 我的AI历史
router.get('/history', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId
    const sessionId = req.query.session_id
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 20

    if (sessionId) {
      const [list] = await db.execute(
        'SELECT id, role, content, created_at FROM ai_history WHERE user_id = ? AND session_id = ? ORDER BY created_at ASC',
        [userId, sessionId]
      )
      res.json({ code: 200, message: 'success', data: { list, total: list.length } })
    } else {
      const [sessions] = await db.query(
        `SELECT session_id, 
                SUBSTRING_INDEX(GROUP_CONCAT(content ORDER BY created_at SEPARATOR ''), '\n', 1) as last_message,
                COUNT(*) as message_count,
                MIN(created_at) as created_at
         FROM ai_history WHERE user_id = ?
         GROUP BY session_id
         ORDER BY MAX(created_at) DESC
         LIMIT ? OFFSET ?`,
        [userId, pageSize, (page - 1) * pageSize]
      )
      res.json({ code: 200, message: 'success', data: { sessions, total: sessions.length } })
    }
  } catch (error) {
    next(error)
  }
})

module.exports = router;
