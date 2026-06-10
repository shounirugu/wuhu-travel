<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <h3>Wuhu Travel</h3>
        <p>&copy; 2026 芜湖旅游推荐平台</p>
      </div>
      <div class="footer__links">
        <a href="#">关于我们</a>
        <a href="#">联系我们</a>
        <a href="#">隐私政策</a>
        <a href="#">服务条款</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  border-top: 1px solid #DFE3E6;
  background: #F6F8F8;
  padding: 80px 24px;
}

.footer__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
}

.footer__brand h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1A2430;
  margin-bottom: 8px;
}

.footer__brand p {
  font-size: 15px;
  color: #556270;
  max-width: 300px;
}

.footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 48px;
}

.footer__links a {
  font-size: 15px;
  color: #556270;
  text-decoration: none;
  transition: color 0.2s;
}

.footer__links a:hover {
  color: #157878;
}

@media (max-width: 1024px) {
  .footer__inner {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .footer__links {
    justify-content: center;
  }
}
</style>
