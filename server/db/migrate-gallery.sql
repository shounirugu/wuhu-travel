-- 为 destinations 表新增 gallery_images 字段（精选图集 JSON 数组）
-- 执行: mysql -u root -p wuhu_travel < server/db/migrate-gallery.sql

ALTER TABLE destinations
  ADD COLUMN gallery_images JSON DEFAULT NULL COMMENT '精选图集URL数组' AFTER image_url;
