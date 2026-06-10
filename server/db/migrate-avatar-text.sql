-- 将 users 表的 avatar 字段从 VARCHAR(500) 改为 TEXT，以支持 Base64 头像存储
ALTER TABLE users MODIFY COLUMN avatar TEXT DEFAULT NULL COMMENT '头像（Base64编码存储）';
