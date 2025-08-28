<template>
  <div class="property-section">
    <div class="section-title">Position & Size</div>
    <div class="property-grid">
      <div class="property-row">
        <label>X</label>
        <input type="number" v-model.number="position.left" @change="updateProperty('left', position.left)" />
      </div>
      <div class="property-row">
        <label>Y</label>
        <input type="number" v-model.number="position.top" @change="updateProperty('top', position.top)" />
      </div>
      <div class="property-row" v-if="hasWidth">
        <label>Width</label>
        <input type="number" v-model.number="size.width" @change="updateProperty('width', size.width)" />
      </div>
      <div class="property-row" v-if="hasHeight">
        <label>Height</label>
        <input type="number" v-model.number="size.height" @change="updateProperty('height', size.height)" />
      </div>
      <div class="property-row" v-if="hasRadius">
        <label>Radius</label>
        <input type="number" v-model.number="size.radius" @change="updateProperty('radius', size.radius)" />
      </div>
      <div class="property-row">
        <label>Rotation</label>
        <div class="range-with-value">
          <input type="range" v-model.number="rotation" @change="updateProperty('angle', rotation)" min="0" max="360" step="1" />
          <span>{{ rotation }}°</span>
        </div>
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

const position = ref({ left: 0, top: 0 });
const size = ref({ width: 0, height: 0, radius: 0 });
const rotation = ref(0);

const hasWidth = computed(() => props.object && 'width' in props.object);
const hasHeight = computed(() => props.object && 'height' in props.object);
const hasRadius = computed(() => props.object && 'radius' in props.object);

watch(() => props.object, (obj) => {
  if (!obj) return;
  // Position
  position.value.left = Math.round(typeof obj.x === 'function' ? obj.x() : (obj.x || 0));
  position.value.top = Math.round(typeof obj.y === 'function' ? obj.y() : (obj.y || 0));
  // Rotation
  rotation.value = Math.round(typeof obj.rotation === 'function' ? obj.rotation() : (obj.rotation || obj.angle || 0));

  // Dimensions: prefer Konva getters, fall back to manual calculations
  if (hasWidth.value) {
    const w = (typeof obj.width === 'function') ? (obj.width() * (obj.scaleX ? obj.scaleX() : 1)) : (obj.width || 0) * (obj.scaleX || 1);
    size.value.width = Math.round(w || 0);
  }
  if (hasHeight.value) {
    const h = (typeof obj.height === 'function') ? (obj.height() * (obj.scaleY ? obj.scaleY() : 1)) : (obj.height || 0) * (obj.scaleY || 1);
    size.value.height = Math.round(h || 0);
  }
  if (hasRadius.value) {
    const r = (typeof obj.radius === 'function') ? (obj.radius() * (obj.scaleX ? obj.scaleX() : 1)) : (obj.radius || 0) * (obj.scaleX || 1);
    size.value.radius = Math.round(r || 0);
  }
}, { immediate: true, deep: true });

function updateProperty(prop, value) {
  emit('update-property', prop, value);
}
</script>

<style scoped>
@import './propertyPanelStyles.css';
</style>
