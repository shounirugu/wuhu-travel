const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wuhu_travel',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

const seedData = [
  // === 风景（category_id = 1）===
  { name: '镜湖公园', category_id: 1, description: '镜湖公园位于芜湖市中心，是芜湖最著名的城市公园之一。湖水清澈如镜，湖畔绿树成荫，是市民休闲散步的好去处。园内有陶塘、烟雨墩等景点，春天樱花盛开时节尤其美丽。', image_url: '/images/jinghu-park.jpg', gallery: ['/images/jinghu-park/galleries/1.jpg','/images/jinghu-park/galleries/2.jpg','/images/jinghu-park/galleries/3.jpg','/images/jinghu-park/galleries/4.jpg'], rating: 4.5, address: '镜湖区北京西路', tips: '建议清晨或傍晚前往，光线最好；公园免费开放；附近有停车场', is_featured: 1, latitude: 31.332645, longitude: 118.361234 },
  { name: '赭山公园', category_id: 1, description: '赭山公园是芜湖市区最大的山体公园，因山体呈赭红色而得名。登顶可俯瞰芜湖全城和长江美景，园内植被茂密，有"城市绿肺"之称。', image_url: '/images/zheshan-park.jpg', gallery: ['/images/zheshan-park/galleries/1.jpg','/images/zheshan-park/galleries/2.jpg','/images/zheshan-park/galleries/3.jpg','/images/zheshan-park/galleries/4.jpg'], rating: 4.3, address: '镜湖区赭山中路', tips: '登山步道约30分钟可达山顶，建议穿运动鞋；山顶有观景台，适合拍照', is_featured: 1, latitude: 31.351580, longitude: 118.378920 },
  { name: '汀棠公园', category_id: 1, description: '汀棠公园以水景闻名，湖面开阔，荷花盛开季节景色尤美。园内有古建筑群和长廊，是市民休闲和摄影爱好者的热门去处。', image_url: '/images/tingtang-park.jpg', gallery: ['/images/tingtang-park/galleries/1.jpg','/images/tingtang-park/galleries/2.jpg','/images/tingtang-park/galleries/3.jpg','/images/tingtang-park/galleries/4.jpg'], rating: 4.2, address: '鸠江区汀棠路', tips: '夏季荷花盛开时最美，建议清晨前往；园内有茶馆可歇脚', is_featured: 0, latitude: 31.382450, longitude: 118.395670 },
  { name: '滨江公园', category_id: 1, description: '滨江公园沿长江而建，是芜湖观赏长江风景的最佳地点。傍晚时分，江风徐徐，落日余晖洒在江面上格外美丽。公园内有健身步道和观景平台。', image_url: '/images/binjiang-park.jpg', gallery: ['/images/binjiang-park/galleries/1.jpg','/images/binjiang-park/galleries/2.jpg','/images/binjiang-park/galleries/3.jpg','/images/binjiang-park/galleries/4.jpg'], rating: 4.4, address: '镜湖区沿河路', tips: '傍晚看日落最佳，江边风大建议带外套；沿江步道约3公里', is_featured: 1, latitude: 31.328900, longitude: 118.358900 },
  { name: '雕塑公园', category_id: 1, description: '雕塑公园是芜湖市独特的文化艺术公园，园内陈列着来自国内外艺术家的数十件雕塑作品。将艺术与自然完美融合，适合文艺青年和家庭游客。', image_url: '/images/diaosu-park.jpg', gallery: ['/images/diaosu-park/galleries/1.jpg','/images/diaosu-park/galleries/2.jpg','/images/diaosu-park/galleries/3.jpg','/images/diaosu-park/galleries/4.jpg'], rating: 4.1, address: '鸠江区神山路', tips: '适合拍照打卡，建议预留1-2小时游览；园区较大，注意防晒', is_featured: 0, latitude: 31.395600, longitude: 118.382300 },

  // === 项目（category_id = 2）===
  { name: '芜湖博物馆', category_id: 2, description: '芜湖博物馆是展示芜湖历史文化的综合性博物馆，馆藏文物涵盖芜湖从史前到近现代的各个历史时期。设有铁画艺术、青铜器、陶瓷等常设展厅，是了解芜湖深厚历史底蕴的最佳场所。', image_url: '/images/wuhu-museum.jpg', gallery: ['/images/wuhu-museum/galleries/1.jpg','/images/wuhu-museum/galleries/2.jpg','/images/wuhu-museum/galleries/3.jpg','/images/wuhu-museum/galleries/4.jpg'], rating: 4.5, address: '镜湖区神山路', tips: '免费参观，需提前通过官方公众号预约；周一闭馆', is_featured: 1, latitude: 31.347800, longitude: 118.373600 },
  { name: '芜湖海洋公园', category_id: 2, description: '芜湖海洋公园是皖南地区规模较大的海洋主题公园，汇聚了来自全球各地的海洋生物。设有海豚表演、企鹅馆、鲨鱼馆、水母展区等特色区域，是亲子家庭的热门打卡地。', image_url: '/images/ocean-park.jpg', gallery: ['/images/ocean-park/galleries/1.jpg','/images/ocean-park/galleries/2.jpg','/images/ocean-park/galleries/3.jpg','/images/ocean-park/galleries/4.jpg'], rating: 4.4, address: '鸠江区银湖北路', tips: '海豚表演每天有固定场次，建议提前查询时间', is_featured: 0, latitude: 31.362100, longitude: 118.352800 },
  { name: '大浦乡村世界', category_id: 2, description: '大浦乡村世界是芜湖郊外的生态休闲农业旅游区，集采摘体验、农耕文化展示、田园观光于一体。游客可亲手采摘时令蔬果、体验农耕乐趣，是亲子游和周末放松的理想目的地。', image_url: '/images/dapu-world.jpg', gallery: ['/images/dapu-world/galleries/1.jpg','/images/dapu-world/galleries/2.jpg','/images/dapu-world/galleries/3.jpg','/images/dapu-world/galleries/4.jpg'], rating: 4.2, address: '南陵县大浦乡', tips: '建议提前查询当季可采摘的品种；自驾前往较为方便', is_featured: 0, latitude: 30.913400, longitude: 118.354200 },
  { name: '芜湖科技馆', category_id: 2, description: '芜湖科技馆是集科普教育和互动体验于一体的现代化科技馆。设有机器人展区、航空航天展区、VR体验区等，是亲子家庭的热门选择。', image_url: '/images/science-museum.jpg', gallery: ['/images/science-museum/galleries/1.jpg','/images/science-museum/galleries/2.jpg','/images/science-museum/galleries/3.jpg','/images/science-museum/galleries/4.jpg'], rating: 4.3, address: '镜湖区银湖北路', tips: '需提前通过公众号预约；周一闭馆', is_featured: 0, latitude: 31.365400, longitude: 118.356700 },
  { name: '松鼠小镇', category_id: 2, description: '松鼠小镇是以三只松鼠品牌IP打造的休闲娱乐小镇，集美食、购物、娱乐于一体。充满童趣的建筑风格和丰富的互动体验吸引了大量年轻游客。', image_url: '/images/squirrel-town.jpg', gallery: ['/images/squirrel-town/galleries/1.jpg','/images/squirrel-town/galleries/2.jpg','/images/squirrel-town/galleries/3.jpg','/images/squirrel-town/galleries/4.jpg'], rating: 4.5, address: '弋江区长江南路', tips: '适合拍照打卡和亲子游玩；节假日人流量大', is_featured: 1, latitude: 31.318900, longitude: 118.345600 },

  // === 小吃（category_id = 3）===
  { name: '耿福兴虾籽面', category_id: 3, description: '芜湖百年老字号，虾籽面是招牌中的招牌。精选长江虾籽，配以手工细面，汤头鲜美浓郁。每一碗都是对芜湖传统美食文化的传承，是来芜湖必打卡的美食地标。', image_url: '/images/gengfuxing.jpg', gallery: ['/images/gengfuxing/galleries/1.jpg','/images/gengfuxing/galleries/2.jpg','/images/gengfuxing/galleries/3.jpg','/images/gengfuxing/galleries/4.jpg'], rating: 4.8, address: '镜湖区凤凰美食街', tips: '早点去，晚了虾籽面会卖完；推荐搭配小笼汤包一起品尝', is_featured: 1, latitude: 31.341200, longitude: 118.367800 },
  { name: '小笼汤包', category_id: 3, description: '芜湖小笼汤包皮薄馅大、汤汁丰富，一口咬下去满嘴鲜香。采用传统手工制作工艺，馅料选用上等猪肉配以秘制调料，是芜湖早餐的经典之选。', image_url: '/images/xiaolongbao.jpg', gallery: ['/images/xiaolongbao/galleries/1.jpg','/images/xiaolongbao/galleries/2.jpg','/images/xiaolongbao/galleries/3.jpg','/images/xiaolongbao/galleries/4.jpg'], rating: 4.7, address: '镜湖区中和路', tips: '吃小笼包先咬一小口，吹凉后再吸汤汁；蘸醋更美味', is_featured: 1, latitude: 31.338900, longitude: 118.364500 },
  { name: '渣肉蒸饭', category_id: 3, description: '渣肉蒸饭是芜湖特色早餐，将米粉与腌制入味的五花肉一起蒸制，米粉吸收了肉汁的香味，口感软糯鲜香。是芜湖人的早餐记忆，也是游客必尝的地方美食。', image_url: '/images/zharou-rice.jpg', gallery: ['/images/zharou-rice/galleries/1.jpg','/images/zharou-rice/galleries/2.jpg','/images/zharou-rice/galleries/3.jpg','/images/zharou-rice/galleries/4.jpg'], rating: 4.5, address: '镜湖区二街', tips: '建议上午10点前去吃，口味最佳；配一碗豆浆更地道', is_featured: 0, latitude: 31.335600, longitude: 118.361200 },
  { name: '红皮鸭子', category_id: 3, description: '红皮鸭子是芜湖传统名菜，选用优质麻鸭经过腌制、晾晒、烤制等多道工序制成。外皮红亮酥脆，肉质鲜嫩多汁，是芜湖宴席上不可或缺的硬菜。', image_url: '/images/hongpi-duck.jpg', gallery: ['/images/hongpi-duck/galleries/1.jpg','/images/hongpi-duck/galleries/2.jpg','/images/hongpi-duck/galleries/3.jpg','/images/hongpi-duck/galleries/4.jpg'], rating: 4.6, address: '镜湖区黄山西路', tips: '可整只购买或按斤称重；建议趁热吃口感最佳', is_featured: 0, latitude: 31.332300, longitude: 118.357800 },
  { name: '四季春小吃', category_id: 3, description: '四季春是芜湖老牌小吃店，汇聚了芜湖各种传统小吃。从酥烧饼到桂花糖藕，从牛肉面到赤豆酒酿，一站式品尝芜湖味道。是了解芜湖饮食文化的必去之地。', image_url: '/images/sijichun.jpg', gallery: ['/images/sijichun/galleries/1.jpg','/images/sijichun/galleries/2.jpg','/images/sijichun/galleries/3.jpg','/images/sijichun/galleries/4.jpg'], rating: 4.4, address: '镜湖区中山路步行街', tips: '选择多样，建议每样少点、多点几样品尝；赤豆酒酿是特色甜品必点', is_featured: 1, latitude: 31.329000, longitude: 118.354500 },

  // === 打卡地（category_id = 4）===
  { name: '鸠兹古镇', category_id: 4, description: '鸠兹古镇是芜湖标志性文旅项目，以徽派建筑为特色，集文化体验、美食餐饮、夜景灯光于一体。青砖黛瓦、小桥流水，再现了千年古镇的繁华景象。', image_url: '/images/jiuzi-ancient.jpg', gallery: ['/images/jiuzi-ancient/galleries/1.jpg','/images/jiuzi-ancient/galleries/2.jpg','/images/jiuzi-ancient/galleries/3.jpg','/images/jiuzi-ancient/galleries/4.jpg'], rating: 4.5, address: '鸠江区徽州路', tips: '建议傍晚前往，夜景灯光非常适合拍照', is_featured: 1, latitude: 31.405600, longitude: 118.398900 },
  { name: '芜湖古城', category_id: 4, description: '芜湖古城保留了大量明清时期的建筑和街巷格局，是芜湖历史文化的活化石。漫步在青石板路上，感受千年古城的人文底蕴，每一条巷子都有讲不完的故事。', image_url: '/images/wuhu-oldtown.jpg', gallery: ['/images/wuhu-oldtown/galleries/1.jpg','/images/wuhu-oldtown/galleries/2.jpg','/images/wuhu-oldtown/galleries/3.jpg','/images/wuhu-oldtown/galleries/4.jpg'], rating: 4.6, address: '镜湖区环城北路', tips: '适合慢慢逛，不要赶时间；古城内有很多文创小店', is_featured: 1, latitude: 31.348900, longitude: 118.375600 },
  { name: '中江塔', category_id: 4, description: '中江塔是芜湖地标性古建筑，始建于明代，历经数百年风雨仍巍峨屹立。塔身古朴典雅，登塔可远眺长江和城市风光，是摄影爱好者的热门机位。', image_url: '/images/zhongjiang-tower.jpg', gallery: ['/images/zhongjiang-tower/galleries/1.jpg','/images/zhongjiang-tower/galleries/2.jpg','/images/zhongjiang-tower/galleries/3.jpg','/images/zhongjiang-tower/galleries/4.jpg'], rating: 4.3, address: '镜湖区沿河路', tips: '塔内楼梯较窄，注意安全；最佳拍摄点在江对岸', is_featured: 0, latitude: 31.331200, longitude: 118.362300 },
  { name: '雨耕山', category_id: 4, description: '雨耕山是芜湖新兴的文化创意园区，由老厂房改造而成。充满艺术气息的街道、独立咖啡馆、设计师店铺和街头艺术，是文艺青年的聚集地。', image_url: '/images/yugengshan.jpg', gallery: ['/images/yugengshan/galleries/1.jpg','/images/yugengshan/galleries/2.jpg','/images/yugengshan/galleries/3.jpg','/images/yugengshan/galleries/4.jpg'], rating: 4.2, address: '镜湖区长江中路', tips: '适合下午茶和拍照，咖啡馆选择多；周末有创意市集', is_featured: 0, latitude: 31.327800, longitude: 118.358900 },
  { name: '滨江步道', category_id: 4, description: '滨江步道是芜湖沿江打造的城市景观带，全长数公里。沿途可欣赏长江风光、城市天际线和多个景观节点。是市民散步、跑步、骑行的热门路线。', image_url: '/images/binjiang-walkway.jpg', gallery: ['/images/binjiang-walkway/galleries/1.jpg','/images/binjiang-walkway/galleries/2.jpg','/images/binjiang-walkway/galleries/3.jpg','/images/binjiang-walkway/galleries/4.jpg'], rating: 4.4, address: '镜湖区滨江路', tips: '建议傍晚时分前往，江景和晚霞交相辉映', is_featured: 1, latitude: 31.324500, longitude: 118.355600 },
];

async function seed() {
  try {
    // 插入分类
    const categories = [
      { name: '风景', icon: 'Sunny', sort_order: 1 },
      { name: '项目', icon: 'Bicycle', sort_order: 2 },
      { name: '小吃', icon: 'KnifeFork', sort_order: 3 },
      { name: '打卡地', icon: 'Camera', sort_order: 4 },
    ];

    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
    await pool.execute('TRUNCATE TABLE destinations');
    await pool.execute('TRUNCATE TABLE categories');
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

    for (const cat of categories) {
      await pool.execute(
        'INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)',
        [cat.name, cat.icon, cat.sort_order]
      );
    }
    console.log('分类数据已插入 (4 条)');

    // 插入目的地
    for (const dest of seedData) {
      await pool.execute(
        `INSERT INTO destinations (name, category_id, description, image_url, gallery_images, rating, address, tips, is_featured, latitude, longitude)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [dest.name, dest.category_id, dest.description, dest.image_url, JSON.stringify(dest.gallery), dest.rating, dest.address, dest.tips, dest.is_featured, dest.latitude, dest.longitude]
      );
    }
    console.log(`目的地数据已插入 (${seedData.length} 条)`);

    // 验证
    const [rows] = await pool.execute('SELECT COUNT(*) AS count FROM destinations');
    console.log(`验证：destinations 表共 ${rows[0].count} 条记录`);
  } catch (err) {
    console.error('种子数据插入失败:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
