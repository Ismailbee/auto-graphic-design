<template>
  <div class="category-selection-container">
    <div class="selection-title">Select a Sticker Category</div>
    <div class="category-grid">
      <div 
        v-for="category in categories" 
        :key="category.id"
        class="category-card"
        :style="{ background: category.gradient }"
        @click="$emit('select', category.id)"
      >
        <div class="category-icon">{{ category.icon }}</div>
        <div class="category-name">{{ category.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Types
export interface Category {
  id: string
  name: string
  icon: string
  gradient: string
}

// Props
defineProps<{
  categories: Category[]
}>()

// Emits
defineEmits<{
  (e: 'select', categoryId: string): void
}>()
</script>

<style scoped>
.category-selection-container {
  padding: 20px;
}

.selection-title {
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 480px) {
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.category-card:active {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.category-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.category-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
</style>
