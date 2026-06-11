/**
 * Aiven MySQL 图片路径迁移脚本
 * 用途：将 Aiven 数据库中的 image_url 从 Unsplash 外链改为本地路径，
 *       并补上 gallery_images 图集路径。
 *
 * 用法：$env:DB_PASSWORD='你的Aiven密码'; node server/db/update-images.js
 */

const mysql = require('mysql2/promise');

const DB_PASSWORD = process.env.DB_PASSWORD || '';

const config = {
  host: 'mysql-e440564-wuhu-travel.d.aivencloud.com',
  port: 22775,
  user: 'avnadmin',
  password: DB_PASSWORD,
  database: 'defaultdb',
  ssl: { rejectUnauthorized: false },
};

// 景点别名 → 文件 slug 映射表
const nameToSlug = {
  '镜湖公园': 'jinghu-park',
  '赭山公园': 'zheshan-park',
  '汀棠公园': 'tingtang-park',
  '滨江公园': 'binjiang-park',
  '雕塑公园': 'diaosu-park',
  '芜湖博物馆': 'wuhu-museum',
  '芜湖海洋公园': 'ocean-park',
  '大浦乡村世界': 'dapu-world',
  '芜湖科技馆': 'science-museum',
  '松鼠小镇': 'squirrel-town',
  '耿福兴虾籽面': 'gengfuxing',
  '小笼汤包': 'xiaolongbao',
  '渣肉蒸饭': 'zharou-rice',
  '红皮鸭子': 'hongpi-duck',
  '四季春小吃': 'sijichun',
  '鸠兹古镇': 'jiuzi-ancient',
  '芜湖古城': 'wuhu-oldtown',
  '中江塔': 'zhongjiang-tower',
  '雨耕山': 'yugengshan',
  '滨江步道': 'binjiang-walkway',
};

async function main() {
  if (!DB_PASSWORD) {
    console.error('❌ 请先设置环境变量 DB_PASSWORD');
    console.error('   PowerShell: $env:DB_PASSWORD="你的密码"');
    process.exit(1);
  }

  console.log('🔌 连接 Aiven MySQL...');
  const conn = await mysql.createConnection(config);
  console.log('✅ 连接成功！\n');

  try {
    // 读取所有目的地
    const [rows] = await conn.execute(
      'SELECT id, name, image_url, gallery_images FROM destinations ORDER BY id'
    );
    console.log(`📋 找到 ${rows.length} 条目的地记录\n`);

    let updated = 0;

    for (const row of rows) {
      const slug = nameToSlug[row.name];
      if (!slug) {
        console.log(`  ⚠️  跳过「${row.name}」(未找到映射)`);
        continue;
      }

      const localImage = `/images/${slug}.jpg`;
      const localGallery = [
        `/images/${slug}/galleries/1.jpg`,
        `/images/${slug}/galleries/2.jpg`,
        `/images/${slug}/galleries/3.jpg`,
        `/images/${slug}/galleries/4.jpg`,
      ];
      const galleryJson = JSON.stringify(localGallery);

      await conn.execute(
        'UPDATE destinations SET image_url = ?, gallery_images = ? WHERE id = ?',
        [localImage, galleryJson, row.id]
      );

      console.log(`  ✅ ${row.name.padEnd(8)}  ${slug}`);
      console.log(`     image_url:      ${localImage}`);
      console.log(`     gallery_images:  ${galleryJson.slice(0, 60)}...`);
      updated++;
    }

    console.log(`\n🎉 迁移完成！共更新 ${updated} 条记录`);
    console.log('   提示：请确认 Vercel 前端项目的 VITE_API_BASE_URL 指向后端域名');
    console.log('   本地图片路径会从前端域名加载（如 /images/jinghu-park.jpg）');

  } catch (err) {
    console.error('❌ 迁移失败：', err.message);
  } finally {
    await conn.end();
  }
}

main();
