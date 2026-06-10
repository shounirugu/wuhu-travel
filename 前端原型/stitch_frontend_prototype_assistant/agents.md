# AGENTS.md — 芜湖旅游推荐平台

> 本文档是项目总览入口。新对话开始时，先读此文件了解全局，具体规范参见对应的详细文档。

---

## 项目一句话

芜湖一地旅游推荐平台：Vue 3 前端 + Express 后端 + MySQL + DeepSeek AI，最终部署到 Vercel + Railway 上线。

---

## 技术栈速查

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Vue 3 + Vite | Composition API |
| UI 库 | Element Plus | Vue 3 最成熟组件库 |
| 路由 | Vue Router 4 | — |
| HTTP | Axios | 封装 baseURL + 拦截器 |
| 后端 | Express.js | Node.js |
| 数据库驱动 | mysql2 | Promise API，参数化查询 |
| 数据库(开发) | 本地 MySQL | `wuhu_travel` |
| 数据库(生产) | PlanetScale | 免费 MySQL 云服务 |
| AI API | DeepSeek | openai 兼容接口，后端代理 |
| 前端部署 | Vercel | Git Push 自动部署 |
| 后端部署 | Railway | Git Push 自动部署 |

---

## 项目结构

```
travel-recommend/
├── client/                     # 前端 Vue 3 项目
│   ├── src/
│   │   ├── api/                # Axios 封装 + 接口函数
│   │   │   ├── index.js        # axios 实例（baseURL + 拦截器）
│   │   │   ├── categories.js   # 分类 API
│   │   │   ├── destinations.js # 目的地 API
│   │   │   └── ai.js           # AI 对话 API
│   │   ├── assets/styles/
│   │   │   └── global.css      # 全局样式
│   │   ├── components/
│   │   │   ├── NavBar.vue      # 全局导航栏
│   │   │   ├── DestinationCard.vue  # 景点卡片
│   │   │   └── AiChat.vue      # AI 悬浮聊天窗
│   │   ├── router/
│   │   │   └── index.js        # 路由表
│   │   ├── views/
│   │   │   ├── Home.vue        # 首页（轮播+分类+推荐）
│   │   │   ├── List.vue        # 列表页（筛选+搜索+分页）
│   │   │   └── Detail.vue      # 详情页
│   │   ├── App.vue
│   │   └── main.js
│   ├── .env.development        # 开发环境变量
│   ├── .env.production         # 生产环境变量
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                     # 后端 Express 项目
│   ├── db/
│   │   ├── index.js            # MySQL 连接池
│   │   └── schema.sql          # 建表 DDL
│   ├── middleware/
│   │   └── errorHandler.js     # 全局错误处理
│   ├── routes/
│   │   ├── categories.js       # 分类接口
│   │   ├── destinations.js     # 目的地接口
│   │   └── ai.js               # AI 代理接口
│   ├── seed.js                 # 种子数据脚本
│   ├── index.js                # Express 入口
│   ├── .env                    # 环境变量（不提交 Git）
│   └── package.json
├── docs/                       # 文档集
│   ├── AGENTS.md               # ← 当前文件
│   ├── 01-项目总纲.md
│   ├── 02-PRD-产品需求文档.md
│   ├── 03-系统架构说明.md
│   ├── 04-数据模型.md
│   ├── 05-API-Contract-接口契约.md
│   ├── 06-AI-Spec-AI功能规格.md
│   ├── 07-Prompt-Agent规则.md
│   ├── 08-Evaluation-输出评估标准.md
│   ├── 09-隐私安全边界.md
│   ├── 10-实现计划.md
│   ├── 11-网站设计规划.md
│   └── todo.md
├── .gitignore
└── README.md
```

---

## 文档索引

| 文档 | 一句话 | 何时查阅 |
|------|--------|----------|
| [01-项目总纲](./01-项目总纲.md) | 项目背景、目标用户、成功指标、技术选型理由 | 了解"为什么做这个项目" |
| [02-PRD](./02-PRD-产品需求文档.md) | 5 个页面功能详规、4 个用户场景、路由设计 | 开发具体页面时对照需求 |
| [03-系统架构](./03-系统架构说明.md) | 前后端架构图、组件树、数据流、部署架构 | 理解全局结构和模块关系 |
| [04-数据模型](./04-数据模型.md) | 2 张表的完整 DDL、索引设计、20 条种子数据 | 写 SQL 或 seed 脚本时对照 |
| [05-API Contract](./05-API-Contract-接口契约.md) | 6 个接口的请求/响应格式、错误码、CORS 配置 | 写后端路由或前端 API 调用时对照 |
| [06-AI Spec](./06-AI-Spec-AI功能规格.md) | 3 个 AI 能力的输入输出规格、降级策略、模型参数 | 开发 AI 功能时对照 |
| [07-Prompt 规则](./07-Prompt-Agent规则.md) | 完整 System Prompt、意图识别逻辑、注入防护 | 写 AI 代理层或调 Prompt 时对照 |
| [08-Evaluation](./08-Evaluation-输出评估标准.md) | 13 个 API + 12 个 UI + 10 个 AI 评估用例 | 开发完成后跑测试验收 |
| [09-隐私安全](./09-隐私安全边界.md) | SQL 防注入、CORS、XSS、API Key 管理 | 部署前检查安全项 |
| [10-实现计划](./10-实现计划.md) | 6 个里程碑、任务清单、验收标准、文件交付清单 | 开发排期和进度跟踪 |
| [11-网站设计规划](./11-网站设计规划.md) | 色彩系统、字体层级、页面布局、组件样式、全部动效规范 | 写 CSS / 调样式 / 加动画时对照 |
| [todo.md](./todo.md) | 14 步骤开发清单 + 注意事项速查表 + 完成记录模板 | 逐项打勾推进，跟踪开发进度 |

---

## 开发顺序

```
M1 (0.5h)          M2 (1h)         M3 (1.5h)       M4 (1h)          M5 (0.5h)        M6 (0.5h)
数据库搭建  ──→  后端 API  ──→   前端页面   ──→  AI 集成   ──→  联调测试  ──→  部署上线
├─建表              ├─categories    ├─项目初始化     ├─DeepSeek 注册    ├─前后端联调      ├─PlanetScale
├─种子数据          ├─destinations  ├─首页           ├─/api/ai/chat    ├─流程走通        ├─Railway
└─连接池            ├─featured      ├─列表页         ├─/api/ai/plan    └─Bug 修复        ├─Vercel
                    └─错误处理      ├─详情页         ├─AiChat.vue                      └─README
                                    └─公共组件       └─降级处理
```

**依赖关系**：M2 依赖 M1（需要数据库）；M3 依赖 M2（需要 API）；M4 与 M3 可部分并行；M5 依赖 M3+M4；M6 依赖 M5。

详细任务清单见 [10-实现计划.md](./10-实现计划.md)。

---

## 快速启动

### 1. 环境准备

```bash
# 确保已安装
node -v    # >= 18
mysql -V   # 本地 MySQL 服务运行中
git --version
```

### 2. 数据库初始化

```bash
cd server
mysql -u root -p < db/schema.sql    # 建库建表
node seed.js                         # 填充 20 条种子数据
```

### 3. 后端启动

```bash
cd server
cp .env.example .env    # 编辑 .env 填入本地 MySQL 密码
npm install
npm run dev              # 监听 http://localhost:3000
```

### 4. 前端启动

```bash
cd client
npm install
npm run dev              # 监听 http://localhost:5173
```

### 5. 验证

```bash
curl http://localhost:3000/api/categories    # 应返回 4 个分类
# 浏览器访问 http://localhost:5173
```

---

## 关键约定

### 代码风格

- **前端**：Vue 3 Composition API (`<script setup>`)，Element Plus 组件用 `El` 前缀
- **后端**：路由按资源拆分（`routes/categories.js`、`routes/destinations.js`、`routes/ai.js`）
- **命名**：文件名 PascalCase（组件）、kebab-case（其他）、camelCase（JS 变量）
- **SQL**：所有查询使用 `db.execute(sql, [params])` 参数化查询，禁止字符串拼接

### 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

错误码：200 成功 / 400 参数错误 / 404 不存在 / 500 服务器错误 / 503 AI 不可用

详见 [05-API-Contract](./05-API-Contract-接口契约.md)

### 安全底线

- `.env` 不提交 Git（已在 `.gitignore`）
- DeepSeek API Key 只在后端使用，前端不可见
- SQL 只用参数化查询，禁止拼接
- CORS 白名单限制（本地 `localhost:5173` + 生产 Vercel 域名）

详见 [09-隐私安全边界](./09-隐私安全边界.md)

---

## 环境变量清单

### 后端 `server/.env`

```env
DB_HOST=localhost             # 本地开发 → 生产改 PlanetScale 地址
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=wuhu_travel
DB_PORT=3306
DEEPSEEK_API_KEY=sk-xxxxxxxx
PORT=3000
```

### 前端 `client/.env.development`

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 前端 `client/.env.production`

```env
VITE_API_BASE_URL=https://xxx.railway.app/api    # 部署后替换为真实 Railway 地址
```

---

## 部署速查

| 步骤 | 平台 | 操作 |
|------|------|------|
| 1 | GitHub | 推送所有代码 |
| 2 | PlanetScale | 创建数据库，执行 `schema.sql` + `seed.js` |
| 3 | Railway | 新建项目 → 关联 GitHub → 设置环境变量 → 自动部署 |
| 4 | Vercel | 新建项目 → 关联 GitHub → 设置 `VITE_API_BASE_URL` → 自动部署 |
| 5 | 浏览器 | 访问 `xxx.vercel.app` 验证 |

---

## 当前状态

- [x] 技术方案确认
- [x] 10 份文档生成完毕
- [ ] M1: 数据库搭建
- [ ] M2: 后端 API 开发
- [ ] M3: 前端页面开发
- [ ] M4: AI 功能集成
- [ ] M5: 联调测试
- [ ] M6: 部署上线

---

> 下次新对话，我只需要读这个文件。
