<template>
  <div class="property-section">
    <div class="section-title">Advanced</div>
    <div class="property-grid">
      <div class="property-row full-width">
        <label>Shadow</label>
        <div class="shadow-toggle">
          <button @click="toggleShadow" :class="{ active: hasShadow }" class="toggle-button">
            <i class="fas fa-moon"></i> 
            {{ hasShadow ? 'On' : 'Off' }}
          </button>
        </div>
      </div>
      
      <template v-if="hasShadow">
        <div class="property-row">
          <label>Color</label>
          <input type="color" v-model="shadow.color" @change="updateShadow" />
        </div>
        <div class="property-row">
          <label>Blur</label>
          <input type="number" v-model.number="shadow.blur" @change="updateShadow" min="0" max="50" />
        </div>
        <div class="property-row">
          <label>Offset X</label>
          <input type="number" v-model.number="shadow.offsetX" @change="updateShadow" min="-50" max="50" />
        </div>
        <div class="property-row">
          <label>Offset Y</label>
          <input type="number" v-model.number="shadow.offsetY" @change="updateShadow" min="-50" max="50" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  object: Object,
});

const emit = defineEmits(['toggle-shadow', 'update-shadow']);

const shadow = ref({
  color: 'rgba(0,0,0,0.5)',
  offsetX: 5,
  offsetY: 5,
  blur: 10
});
const hasShadow = ref(false);

watch(() => props.object, (obj) => {
  if (obj && obj.shadow) {
    shadow.value.color = obj.shadow.color;
    shadow.value.offsetX = obj.shadow.offsetX;
    shadow.value.offsetY = obj.shadow.offsetY;
    shadow.value.blur = obj.shadow.blur;
    hasShadow.value = true;
  } else {
    hasShadow.value = false;
  }
}, { immediate: true, deep: true });

function toggleShadow() {
  emit('toggle-shadow');
}

function updateShadow() {
  emit('update-shadow', { ...shadow.value });
}
</script>

<style scoped>
@import './propertyPanelStyles.css';

.shadow-toggle {
  display: flex;
  justify-content: flex-start;
}
</style>
