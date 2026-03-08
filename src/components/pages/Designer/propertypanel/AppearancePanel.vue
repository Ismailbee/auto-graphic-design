<template>
  <div class="property-section">
    <div class="section-title">Appearance</div>
    <div class="property-grid">
      <div class="property-row" v-if="hasFill">
        <label>Fill</label>
        <input type="color" v-model="appearance.fill" @change="updateProperty('fill', appearance.fill)" />
      </div>
      <div class="property-row full-width" v-if="hasFill">
        <label>Opacity</label>
        <div class="range-with-value">
          <input type="range" v-model.number="appearance.opacity" @change="updateProperty('opacity', appearance.opacity)" min="0" max="1" step="0.01" />
          <span>{{ Math.round(appearance.opacity * 100) }}%</span>
        </div>
      </div>
      <div class="property-row" v-if="hasStroke">
        <label>Stroke</label>
        <input type="color" v-model="appearance.stroke" @change="updateProperty('stroke', appearance.stroke)" />
      </div>
      <div class="property-row" v-if="hasStroke">
        <label>Width</label>
        <input type="number" v-model.number="appearance.strokeWidth" @change="updateProperty('strokeWidth', appearance.strokeWidth)" min="0" max="20" />
      </div>
      <div class="property-row full-width" v-if="hasStroke">
        <label>Stroke Style</label>
        <select v-model="appearance.strokeDashArray" @change="updateStrokeDashArray">
          <option :value="[]">Solid</option>
          <option :value="[5, 5]">Dashed</option>
          <option :value="[2, 2]">Dotted</option>
          <option :value="[10, 5, 2, 5]">Dash-Dot</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  object: Object,
});

const emit = defineEmits(['update-property']);

const appearance = ref({ 
  fill: '#000000', 
  stroke: '#000000', 
  strokeWidth: 1, 
  opacity: 1,
  strokeDashArray: []
});

const hasFill = computed(() => props.object && 'fill' in props.object);
const hasStroke = computed(() => props.object && 'stroke' in props.object);

watch(() => props.object, (obj) => {
  if (!obj) return;
  if (hasFill.value) appearance.value.fill = typeof obj.fill === 'function' ? obj.fill() : obj.fill;
  if (hasStroke.value) {
    appearance.value.stroke = typeof obj.stroke === 'function' ? obj.stroke() : obj.stroke;
    appearance.value.strokeWidth = typeof obj.strokeWidth === 'function' ? obj.strokeWidth() : obj.strokeWidth;
    appearance.value.strokeDashArray = typeof obj.dash === 'function' ? obj.dash() : (obj.strokeDashArray || obj.dash || []);
  }
  appearance.value.opacity = typeof obj.opacity === 'function' ? obj.opacity() : obj.opacity;
}, { immediate: true, deep: true });

function updateProperty(prop, value) {
  emit('update-property', prop, value);
}

function updateStrokeDashArray() {
  emit('update-property', 'strokeDashArray', appearance.value.strokeDashArray);
}
</script>

<style scoped>
@import './propertyPanelStyles.css';
</style>
