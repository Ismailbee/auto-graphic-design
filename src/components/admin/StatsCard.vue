<template>
  <div class="stats-card" :class="colorClass">
    <div class="stats-icon">
      <ion-icon :icon="icon" size="large"></ion-icon>
    </div>
    <div class="stats-content">
      <h3 class="stats-value">{{ value }}</h3>
      <p class="stats-label">{{ label }}</p>
      <p v-if="change" class="stats-change" :class="changeClass">
        <ion-icon :icon="changeIcon" size="small"></ion-icon>
        {{ change }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonIcon } from '@ionic/vue'
import { trendingUpOutline, trendingDownOutline } from 'ionicons/icons'

interface Props {
  icon: string
  value: string | number
  label: string
  change?: string
  color?: 'primary' | 'success' | 'warning' | 'danger'
  trend?: 'up' | 'down'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  trend: 'up'
})

const colorClass = computed(() => `stats-card-${props.color}`)
const changeClass = computed(() => props.trend === 'up' ? 'change-up' : 'change-down')
const changeIcon = computed(() => props.trend === 'up' ? trendingUpOutline : trendingDownOutline)
</script>

<style scoped>
.stats-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stats-card-primary .stats-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stats-card-success .stats-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.stats-card-warning .stats-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.stats-card-danger .stats-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.stats-content {
  flex: 1;
}

.stats-value {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #1f2937;
}

.stats-label {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.stats-change {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.change-up {
  color: #10b981;
}

.change-down {
  color: #ef4444;
}
</style>