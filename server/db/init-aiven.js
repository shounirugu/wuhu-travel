/**
 * Aiven MySQL 一键初始化脚本
 * 用法：
 *   1. 设置环境变量 DB_PASSWORD（方法见下方）
 *   2. 在项目根目录运行：node server/db/init-aiven.js
 *
 *   PowerShell: $env:DB_PASSWORD='你的Aiven密码'; node server/db/init-aiven.js
 *   CMD:        set DB_PASSWORD=你的Aiven密码 && node server/db/init-aiven.js
 *   Bash:       DB_PASSWORD='你的Aiven密码' node server/db/init-aiven.js
 *
 * 注意：此脚本会清空并重新创建所有表，仅用于初始化，不要在有数据时运行。
 */

const mysql = require('mysql2/promise');

// ⬇️ 从环境变量读取 Aiven 密码（在 Aiven 控制台 Reveal Password 获取）
// 运行前设置：$env:DB_PASSWORD='你的密码' (PowerShell)
const AIVEN_PASSWORD = process.env.DB_PASSWORD || '';

const config = {
  host: 'mysql-e440564-wuhu-travel.d.aivencloud.com',
  port: 22775,
  user: 'avnadmin',
  password: AIVEN_PASSWORD,
  database: 'defaultdb',
  ssl: { rejectUnauthorized: false },
  multipleStatements: true,
};

// schema SQL（适配 Aiven defaultdb，去掉 CREATE DATABASE / USE 语句）
const schemaSql = `
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
CREATE INDEX idx_rating ON destinations(rating);

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
`;

// 种子数据
const seedData = [
  // === 风景（category_id = 1）===
  { name: '镜湖公园', category_id: 1, description: '镜湖公园位于芜湖市中心，是芜湖最著名的城市公园之一。湖水清澈如镜，湖畔绿树成荫，是市民休闲散步的好去处。园内有陶塘、烟雨墩等景点，春天樱花盛开时节尤其美丽。', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', rating: 4.5, address: '镜湖区北京西路', tips: '建议清晨或傍晚前往，光线最好；公园免费开放；附近有停车场', is_featured: 1, latitude: 31.332645, longitude: 118.361234 },
  { name: '赭山公园', category_id: 1, description: '赭山公园是芜湖市区最大的山体公园，因山体呈赭红色而得名。登顶可俯瞰芜湖全城和长江美景，园内植被茂密，有"城市绿肺"之称。', image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', rating: 4.3, address: '镜湖区赭山中路', tips: '登山步道约30分钟可达山顶，建议穿运动鞋；山顶有观景台，适合拍照', is_featured: 1, latitude: 31.351580, longitude: 118.378920 },
  { name: '汀棠公园', category_id: 1, description: '汀棠公园以水景闻名，湖面开阔，荷花盛开季节景色尤美。园内有古建筑群和长廊，是市民休闲和摄影爱好者的热门去处。', image_url: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800', rating: 4.2, address: '鸠江区汀棠路', tips: '夏季荷花盛开时最美，建议清晨前往；园内有茶馆可歇脚', is_featured: 0, latitude: 31.382450, longitude: 118.395670 },
  { name: '滨江公园', category_id: 1, description: '滨江公园沿长江而建，是芜湖观赏长江风景的最佳地点。傍晚时分，江风徐徐，落日余晖洒在江面上格外美丽。公园内有健身步道和观景平台。', image_url: 'https://images.unsplash.com/photo-1518173946687-a1e4e3e6a4e0?w=800', rating: 4.4, address: '镜湖区沿河路', tips: '傍晚看日落最佳，江边风大建议带外套；沿江步道约3公里', is_featured: 1, latitude: 31.328900, longitude: 118.358900 },
  { name: '雕塑公园', category_id: 1, description: '雕塑公园是芜湖市独特的文化艺术公园，园内陈列着来自国内外艺术家的数十件雕塑作品。将艺术与自然完美融合，适合文艺青年和家庭游客。', image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', rating: 4.1, address: '鸠江区神山路', tips: '适合拍照打卡，建议预留1-2小时游览；园区较大，注意防晒', is_featured: 0, latitude: 31.395600, longitude: 118.382300 },

  // === 项目（category_id = 2）===
  { name: '芜湖博物馆', category_id: 2, description: '芜湖博物馆是展示芜湖历史文化的综合性博物馆，馆藏文物涵盖芜湖从史前到近现代的各个历史时期。设有铁画艺术、青铜器、陶瓷等常设展厅，是了解芜湖深厚历史底蕴的最佳场所。', image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800', rating: 4.5, address: '镜湖区神山路', tips: '免费参观，需提前通过官方公众号预约；周一闭馆；参观时间约1.5-2小时', is_featured: 1, latitude: 31.347800, longitude: 118.373600 },
  { name: '芜湖海洋公园', category_id: 2, description: '芜湖海洋公园是皖南地区规模较大的海洋主题公园，汇聚了来自全球各地的海洋生物。设有海豚表演、企鹅馆、鲨鱼馆、水母展区等特色区域，是亲子家庭的热门打卡地。', image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', rating: 4.4, address: '鸠江区银湖北路', tips: '海豚表演每天有固定场次，建议提前查询时间；亲子游推荐购买套票', is_featured: 0, latitude: 31.362100, longitude: 118.352800 },
  { name: '大浦乡村世界', category_id: 2, description: '大浦乡村世界是芜湖郊外的生态休闲农业旅游区，集采摘体验、农耕文化展示、田园观光于一体。游客可亲手采摘时令蔬果，感受远离城市喧嚣的田园生活。', image_url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800', rating: 4.2, address: '南陵县大浦乡', tips: '建议提前查询当季可采摘的品种；自驾前往较为方便；适合全家出游', is_featured: 0, latitude: 30.913400, longitude: 118.354200 },
  { name: '芜湖科技馆', category_id: 2, description: '芜湖科技馆是集科普教育和互动体验于一体的现代化科技馆。设有机器人展区、航空航天展区、VR体验区等，是亲子家庭的热门选择。', image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800', rating: 4.3, address: '镜湖区银湖北路', tips: '需提前通过公众号预约；周一闭馆；VR体验项目火爆，建议早上先去排队', is_featured: 0, latitude: 31.365400, longitude: 118.356700 },
  { name: '松鼠小镇', category_id: 2, description: '松鼠小镇是以三只松鼠品牌IP打造的休闲娱乐小镇，集美食、购物、娱乐于一体。充满童趣的建筑风格和丰富的互动体验吸引了大量年轻游客。', image_url: 'https://images.unsplash.com/photo-1558603668-6570496b66f8?w=800', rating: 4.5, address: '弋江区长江南路', tips: '适合拍照打卡和亲子游玩；松鼠主题周边商品值得购买；节假日人流量大', is_featured: 1, latitude: 31.318900, longitude: 118.345600 },

  // === 小吃（category_id = 3）===
  { name: '耿福兴虾籽面', category_id: 3, description: '芜湖百年老字号，虾籽面是招牌中的招牌。精选长江虾籽，配以手工细面，汤头鲜美浓郁。每一碗都是对芜湖传统美食文化的传承，是来芜湖必打卡的美食地标。', image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800', rating: 4.8, address: '镜湖区凤凰美食街', tips: '早点去，晚了虾籽面会卖完；推荐搭配小笼汤包一起品尝；人均30-50元', is_featured: 1, latitude: 31.341200, longitude: 118.367800 },
  { name: '小笼汤包', category_id: 3, description: '芜湖小笼汤包皮薄馅大、汤汁丰富，一口咬下去满嘴鲜香。采用传统手工制作工艺，馅料选用上等猪肉配以秘制调料，是芜湖早餐的经典之选。', image_url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800', rating: 4.7, address: '镜湖区中和路', tips: '吃小笼包先咬一小口，吹凉后再吸汤汁；蘸醋更美味；早餐时段人最多', is_featured: 1, latitude: 31.338900, longitude: 118.364500 },
  { name: '渣肉蒸饭', category_id: 3, description: '渣肉蒸饭是芜湖特色早餐，将米粉与腌制入味的五花肉一起蒸制，米粉吸收了肉汁的香味，口感软糯鲜香。是芜湖人的早餐记忆，也是游客必尝的地方美食。', image_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800', rating: 4.5, address: '镜湖区二街', tips: '建议上午10点前去吃，口味最佳；可加辣或不辣；配一碗豆浆更地道', is_featured: 0, latitude: 31.335600, longitude: 118.361200 },
  { name: '红皮鸭子', category_id: 3, description: '红皮鸭子是芜湖传统名菜，选用优质麻鸭经过腌制、晾晒、烤制等多道工序制成。外皮红亮酥脆，肉质鲜嫩多汁，是芜湖宴席上不可或缺的硬菜。', image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', rating: 4.6, address: '镜湖区黄山西路', tips: '可整只购买或按斤称重；建议趁热吃口感最佳；附近有真空包装可做伴手礼', is_featured: 0, latitude: 31.332300, longitude: 118.357800 },
  { name: '四季春小吃', category_id: 3, description: '四季春是芜湖老牌小吃店，汇聚了芜湖各种传统小吃。从酥烧饼到桂花糖藕，从牛肉面到赤豆酒酿，一站式品尝芜湖味道。是了解芜湖饮食文化的必去之地。', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', rating: 4.4, address: '镜湖区中山路步行街', tips: '选择多样，建议每样少点、多点几样品尝；赤豆酒酿是特色甜品必点', is_featured: 1, latitude: 31.329000, longitude: 118.354500 },

  // === 打卡地（category_id = 4）===
  { name: '鸠兹古镇', category_id: 4, description: '鸠兹古镇是芜湖标志性文旅项目，以徽派建筑为特色，集文化体验、美食餐饮、夜景灯光于一体。青砖黛瓦、小桥流水，再现了千年古镇的繁华景象。', image_url: 'https://images.unsplash.com/photo-1529154036614-a60975f5c760?w=800', rating: 4.5, address: '鸠江区徽州路', tips: '建议傍晚前往，夜景灯光非常适合拍照；古镇内有美食街；门票可通过官方公众号预约', is_featured: 1, latitude: 31.405600, longitude: 118.398900 },
  { name: '芜湖古城', category_id: 4, description: '芜湖古城保留了大量明清时期的建筑和街巷格局，是芜湖历史文化的活化石。漫步在青石板路上，感受千年古城的人文底蕴，每一条巷子都有讲不完的故事。', image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800', rating: 4.6, address: '镜湖区环城北路', tips: '适合慢慢逛，不要赶时间；古城内有很多文创小店；周末有民俗表演', is_featured: 1, latitude: 31.348900, longitude: 118.375600 },
  { name: '中江塔', category_id: 4, description: '中江塔是芜湖地标性古建筑，始建于明代，历经数百年风雨仍巍峨屹立。塔身古朴典雅，登塔可远眺长江和城市风光，是摄影爱好者的热门机位。', image_url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800', rating: 4.3, address: '镜湖区沿河路', tips: '塔内楼梯较窄，注意安全；最佳拍摄点在江对岸；傍晚金色光线拍照效果最佳', is_featured: 0, latitude: 31.331200, longitude: 118.362300 },
  { name: '雨耕山', category_id: 4, description: '雨耕山是芜湖新兴的文化创意园区，由老厂房改造而成。充满艺术气息的街道、独立咖啡馆、设计师店铺和街头艺术，是文艺青年的聚集地。', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800', rating: 4.2, address: '镜湖区长江中路', tips: '适合下午茶和拍照，咖啡馆选择多；周末有创意市集；停车位有限建议公交出行', is_featured: 0, latitude: 31.327800, longitude: 118.358900 },
  { name: '滨江步道', category_id: 4, description: '滨江步道是芜湖沿江打造的城市景观带，全长数公里。沿途可欣赏长江风光、城市天际线和多个景观节点。是市民散步、跑步、骑行的热门路线，也是打卡芜湖江景的最佳地点。', image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', rating: 4.4, address: '镜湖区滨江路', tips: '建议傍晚时分前往，江景和晚霞交相辉映；步道全程约5公里，可分段游玩；沿途有休息区和公厕', is_featured: 1, latitude: 31.324500, longitude: 118.355600 },
];

const categories = [
  { name: '风景', icon: 'Sunset', sort_order: 1 },
  { name: '项目', icon: 'Football', sort_order: 2 },
  { name: '小吃', icon: 'Food', sort_order: 3 },
  { name: '打卡地', icon: 'Camera', sort_order: 4 },
];

async function main() {
  if (AIVEN_PASSWORD === 'YOUR_AIVEN_PASSWORD_HERE') {
    console.error('❌ 请先在脚本顶部填入 AIVEN_PASSWORD！');
    process.exit(1);
  }

  console.log('🔌 连接 Aiven MySQL...');
  const conn = await mysql.createConnection(config);
  console.log('✅ 连接成功！');

  try {
    // 禁用外键检查，清空旧数据
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');

    // 删除旧表（如果存在），保证重新创建
    const tables = ['ai_history', 'reviews', 'favorites', 'users', 'destinations', 'categories'];
    for (const t of tables) {
      await conn.execute(`DROP TABLE IF EXISTS \`${t}\``);
      console.log(`🗑️  DROP TABLE ${t}`);
    }

    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');

    // 逐条执行建表语句
    console.log('\n📋 开始建表...');
    const statements = schemaSql
      .split(';')
      .map(s => s.split('\n').filter(line => !line.trim().startsWith('--')).join('\n').trim())
      .filter(s => s.length > 0);

    for (const sql of statements) {
      if (sql.trim()) {
        await conn.execute(sql);
      }
    }
    console.log('✅ 所有表创建完成！');

    // 插入分类
    console.log('\n📂 插入分类数据...');
    for (const cat of categories) {
      await conn.execute(
        'INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)',
        [cat.name, cat.icon, cat.sort_order]
      );
    }
    console.log(`✅ 插入 ${categories.length} 个分类`);

    // 插入景点
    console.log('\n🏞️  插入景点数据...');
    for (const dest of seedData) {
      await conn.execute(
        `INSERT INTO destinations (name, category_id, description, image_url, rating, address, tips, is_featured, latitude, longitude)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [dest.name, dest.category_id, dest.description, dest.image_url, dest.rating, dest.address, dest.tips, dest.is_featured, dest.latitude, dest.longitude]
      );
    }
    console.log(`✅ 插入 ${seedData.length} 个景点`);

    // 验证
    const [rows] = await conn.execute('SELECT COUNT(*) AS cnt FROM destinations');
    console.log(`\n🎉 数据库初始化完成！destinations 表共 ${rows[0].cnt} 条记录`);

    const [tables2] = await conn.execute('SHOW TABLES');
    console.log('📊 当前所有表：', tables2.map(r => Object.values(r)[0]).join(', '));

  } catch (err) {
    console.error('❌ 初始化失败：', err.message);
    console.error(err);
  } finally {
    await conn.end();
  }
}

main();
