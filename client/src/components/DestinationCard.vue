<template>
  <div class="dest-card" @click="$router.push(`/detail/${destination.id}`)">
    <div class="dest-card__image">
      <img :src="destination.image_url" :alt="destination.name" loading="lazy" @error="onError" />
      <div v-if="destination.is_featured" class="dest-card__badge">热门</div>
    </div>
    <div class="dest-card__body">
      <h3 class="dest-card__title">{{ destination.name }}</h3>
      <div class="dest-card__meta">
        <span class="dest-card__rating">
          <el-rate
            :model-value="Number(destination.rating)"
            disabled
            show-score
            :score-template="`${destination.rating}`"
            size="small"
          />
        </span>
        <span class="dest-card__category" :class="categoryClass">
          {{ destination.category_name }}
        </span>
      </div>
      <p class="dest-card__address">
        <el-icon><Location /></el-icon>
        {{ destination.address }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Location } from '@element-plus/icons-vue'

const props = defineProps({
  destination: {
    type: Object,
    required: true,
  },
})

const DEFAULT_IMG = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22600%22%3E%3Crect fill=%22%23157878%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22white%22 font-size=%2220%22 text-anchor=%22middle%22 dy=%22.35em%22%3E%E8%8A%9C%E6%B9%96%E6%97%85%E6%B8%B8%3C/text%3E%3C/svg%3E'

function onError(e) {
  e.target.src = DEFAULT_IMG
}

const categoryClass = computed(() => {
  const map = {
    '风景': 'cat--scenery',
    '项目': 'cat--activity',
    '小吃': 'cat--food',
    '打卡地': 'cat--photo',
  }
  return map[props.destination.category_name] || ''
})
</script>

<style scoped>
.dest-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.dest-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-card-hover);
}

.dest-card__image {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.dest-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.dest-card:hover .dest-card__image img {
  transform: scale(1.05);
}

.dest-card__badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: var(--color-cuisine);
  color: #fff;
  font-size: var(--text-xs);
  font-weight: 600;
  padding: 2px 10px;
  border-radius: var(--radius-sm);
}

.dest-card__body {
  padding: 16px;
}

.dest-card__title {
  font-size: var(--text-h3);
  font-weight: 600;
  color: var(--color-ink);
  margin-bottom: 8px;
}

.dest-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.dest-card__category {
  font-size: var(--text-xs);
  font-weight: 500;
  padding: 1px 8px;
  border-radius: var(--radius-sm);
}

.cat--scenery { background: rgba(61,139,95,0.1); color: var(--color-nature); }
.cat--activity { background: rgba(21,120,120,0.1); color: var(--color-primary); }
.cat--food { background: rgba(217,122,56,0.1); color: var(--color-cuisine); }
.cat--photo { background: rgba(123,94,167,0.1); color: var(--color-photo); }

.dest-card__address {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-caption);
  color: var(--color-ink-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
