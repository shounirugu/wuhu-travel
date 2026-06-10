-- 芜湖旅游推荐平台 - 数据库建表 DDL
-- 数据库: wuhu_travel | 字符集: utf8mb4 | 引擎: InnoDB

CREATE DATABASE IF NOT EXISTS wuhu_travel
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE wuhu_travel;

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(50)  NOT NULL COMMENT '分类名称',
  icon       VARCHAR(50)  NOT NULL COMMENT 'Element Plus 图标名称',
  sort_order INT          NOT NULL DEFAULT 0 COMMENT '排序权重，越小越靠前',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='旅游分类表';

-- 目的地/推荐表
CREATE TABLE IF NOT EXISTS destinations (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL COMMENT '目的地名称',
  category_id INT          NOT NULL COMMENT '所属分类ID',
  description TEXT         NOT NULL COMMENT '详细介绍',
  image_url   VARCHAR(500) NOT NULL COMMENT '展示图片URL',
  gallery_images JSON       DEFAULT NULL COMMENT '精选图集URL数组',
  rating      DECIMAL(2,1) NOT NULL DEFAULT 4.0 COMMENT '评分 1.0-5.0',
  address     VARCHAR(200) NOT NULL COMMENT '地址',
  tips        TEXT                  COMMENT '游玩小贴士',
  is_featured TINYINT(1)  NOT NULL DEFAULT 0 COMMENT '是否首页推荐 0-否 1-是',
  latitude     DECIMAL(10,7)       COMMENT '纬度',
  longitude    DECIMAL(10,7)       COMMENT '经度',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='旅游推荐目的地表';

-- 索引
CREATE INDEX idx_category_id ON destinations(category_id);
CREATE INDEX idx_featured ON destinations(is_featured);
CREATE INDEX idx_rating ON destinations(rating DESC);
CREATE FULLTEXT INDEX idx_name_search ON destinations(name);

-- ========================================
-- M7: 用户系统新增表
-- ========================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE COMMENT '用户名（登录用）',
  password    VARCHAR(255) NOT NULL COMMENT 'bcrypt加密密码',
  nickname    VARCHAR(50)  NOT NULL COMMENT '昵称（显示用）',
  avatar      TEXT         DEFAULT NULL COMMENT '头像（Base64编码存储）',
  phone       VARCHAR(20)  DEFAULT NULL UNIQUE COMMENT '手机号（可选绑定）',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL COMMENT '用户ID',
  destination_id  INT NOT NULL COMMENT '景点ID',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_destination (user_id, destination_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏表';

-- 评论表
CREATE TABLE IF NOT EXISTS reviews (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL COMMENT '用户ID',
  destination_id  INT NOT NULL COMMENT '景点ID',
  rating          DECIMAL(2,1) NOT NULL COMMENT '用户评分 1.0-5.0',
  content         TEXT NOT NULL COMMENT '评论内容',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_destination (destination_id),
  INDEX idx_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户评论表';

-- AI对话历史表
CREATE TABLE IF NOT EXISTS ai_history (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL COMMENT '用户ID',
  session_id  VARCHAR(50) NOT NULL COMMENT '对话会话ID',
  role        ENUM('user', 'assistant') NOT NULL COMMENT '角色：user或assistant',
  content     TEXT NOT NULL COMMENT '消息内容',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_session (user_id, session_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI对话历史表';
