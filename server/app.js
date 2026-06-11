const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const categoriesRouter = require('./routes/categories');
const destinationsRouter = require('./routes/destinations');
const statsRouter = require('./routes/stats');
const aiRouter = require('./routes/ai');
const authRouter = require('./routes/auth');
const favoritesRouter = require('./routes/favorites');
const reviewsRouter = require('./routes/reviews');
const geocodeRouter = require('./routes/geocode');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// Global rate limit: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: '请求过于频繁，请稍后再试' },
});
app.use(generalLimiter);

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.json({ code: 200, message: '芜湖旅游推荐平台 API' });
});

app.use('/api/categories', categoriesRouter);
app.use('/api/destinations', destinationsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/auth', authRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/geocode', geocodeRouter);

app.use(errorHandler);

module.exports = app;