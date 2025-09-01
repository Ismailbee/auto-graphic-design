<template>
  <div class="templates-panel">
    <div class="panel-header">
      <h3>Templates</h3>
      <div class="header-actions">
        <button @click="showCreateDialog = true" class="btn-secondary">
          <i class="fas fa-plus"></i>
          Create
        </button>
        <button @click="refreshTemplates" class="btn-icon">
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
    </div>
    
    <!-- Search and Filter -->
    <div class="search-section">
      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search templates..."
          class="search-input"
        />
      </div>
      
      <div class="category-filters">
        <button 
          v-for="category in categories" 
          :key="category.id"
          @click="selectedCategory = category.id"
          :class="['category-btn', { active: selectedCategory === category.id }]"
        >
          {{ category.name }}
          <span class="count">{{ category.count }}</span>
        </button>
      </div>
    </div>
    
    <!-- Popular Templates -->
    <div v-if="!searchQuery && selectedCategory === 'all'" class="popular-section">
      <h4>Popular Templates</h4>
      <div class="templates-grid horizontal">
        <div 
          v-for="template in popularTemplates" 
          :key="template.id"
          class="template-card small"
          @click="applyTemplate(template.id)"
        >
          <div class="template-preview">
            <img :src="template.thumbnail" :alt="template.name" />
            <div class="template-overlay">
              <button class="preview-btn">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
          <div class="template-info">
            <h5>{{ template.name }}</h5>
            <span class="template-size">{{ template.size.width }}×{{ template.size.height }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- All Templates -->
    <div class="templates-section">
      <div class="section-header">
        <h4>{{ sectionTitle }}</h4>
        <div class="view-options">
          <button 
            @click="viewMode = 'grid'" 
            :class="['view-btn', { active: viewMode === 'grid' }]"
          >
            <i class="fas fa-th"></i>
          </button>
          <button 
            @click="viewMode = 'list'" 
            :class="['view-btn', { active: viewMode === 'list' }]"
          >
            <i class="fas fa-list"></i>
          </button>
        </div>
      </div>
      
      <div :class="['templates-grid', viewMode]">
        <div 
          v-for="template in filteredTemplates" 
          :key="template.id"
          :class="['template-card', { 'list-item': viewMode === 'list' }]"
          @click="selectTemplate(template)"
        >
          <div class="template-preview">
            <img :src="template.thumbnail" :alt="template.name" />
            <div class="template-overlay">
              <button class="preview-btn" @click.stop="previewTemplate(template)">
                <i class="fas fa-eye"></i>
              </button>
              <button class="apply-btn" @click.stop="applyTemplate(template.id)">
                <i class="fas fa-plus"></i>
              </button>
              <button 
                v-if="template.isCustom" 
                class="delete-btn" 
                @click.stop="deleteTemplate(template.id)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <div class="template-info">
            <h5>{{ template.name }}</h5>
            <div class="template-meta">
              <span class="template-category">{{ template.category }}</span>
              <span class="template-size">{{ template.size.width }}×{{ template.size.height }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="filteredTemplates.length === 0" class="empty-state">
        <i class="fas fa-search"></i>
        <h4>No templates found</h4>
        <p>Try adjusting your search or category filter</p>
      </div>
    </div>
    
    <!-- Create Template Dialog -->
    <div v-if="showCreateDialog" class="dialog-overlay" @click="showCreateDialog = false">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>Create Template</h3>
          <button @click="showCreateDialog = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="dialog-body">
          <div class="form-group">
            <label>Template Name</label>
            <input 
              type="text" 
              v-model="newTemplateName" 
              placeholder="Enter template name..."
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label>Category</label>
            <select v-model="newTemplateCategory" class="form-select">
              <option value="custom">Custom</option>
              <option value="social">Social Media</option>
              <option value="business">Business</option>
              <option value="print">Print</option>
              <option value="presentation">Presentation</option>
              <option value="branding">Branding</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Description (Optional)</label>
            <textarea 
              v-model="newTemplateDescription" 
              placeholder="Describe this template..."
              class="form-textarea"
            ></textarea>
          </div>
        </div>
        
        <div class="dialog-footer">
          <button @click="showCreateDialog = false" class="btn-secondary">
            Cancel
          </button>
          <button @click="createTemplate" class="btn-primary" :disabled="!newTemplateName">
            Create Template
          </button>
        </div>
      </div>
    </div>
    
    <!-- Preview Dialog -->
    <div v-if="previewTemplate" class="preview-overlay" @click="closePreview">
      <div class="preview-dialog" @click.stop>
        <div class="preview-header">
          <h3>{{ selectedTemplate?.name }}</h3>
          <button @click="closePreview" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="preview-content">
          <img :src="selectedTemplate?.thumbnail" :alt="selectedTemplate?.name" />
        </div>
        
        <div class="preview-footer">
          <div class="template-details">
            <span class="size">{{ selectedTemplate?.size.width }}×{{ selectedTemplate?.size.height }}</span>
            <span class="category">{{ selectedTemplate?.category }}</span>
          </div>
          <button @click="applyTemplate(selectedTemplate?.id)" class="btn-primary">
            Use Template
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTemplates } from '../../../composables/useTemplates';
import { useNotification } from '../../../composables/useNotification';

const { 
  templates, 
  categories, 
  popularTemplates, 
  getTemplatesByCategory, 
  applyTemplate: applyTemplateAction,
  createCustomTemplate,
  deleteCustomTemplate
} = useTemplates();

const { showSuccess, showError } = useNotification();

// State
const searchQuery = ref('');
const selectedCategory = ref('all');
const viewMode = ref('grid');
const showCreateDialog = ref(false);
const selectedTemplate = ref(null);

// Form state
const newTemplateName = ref('');
const newTemplateCategory = ref('custom');
const newTemplateDescription = ref('');

// Add "All" category to the beginning
const allCategories = computed(() => [
  { id: 'all', name: 'All', count: templates.value.length },
  ...categories.value
]);

const sectionTitle = computed(() => {
  if (searchQuery.value) {
    return `Search results for "${searchQuery.value}"`;
  }
  
  const category = allCategories.value.find(c => c.id === selectedCategory.value);
  return category ? `${category.name} Templates` : 'All Templates';
});

const filteredTemplates = computed(() => {
  let result = getTemplatesByCategory(selectedCategory.value);
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(template => 
      template.name.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query)
    );
  }
  
  return result;
});

async function applyTemplate(templateId) {
  try {
    const success = await applyTemplateAction(templateId);
    if (success) {
      showSuccess('Template applied successfully!');
    } else {
      showError('Failed to apply template');
    }
  } catch (error) {
    console.error('Error applying template:', error);
    showError('Error applying template');
  }
}

function selectTemplate(template) {
  selectedTemplate.value = template;
}

function previewTemplate(template) {
  selectedTemplate.value = template;
}

function closePreview() {
  selectedTemplate.value = null;
}

async function createTemplate() {
  if (!newTemplateName.value.trim()) return;
  
  try {
    const template = createCustomTemplate(
      newTemplateName.value.trim(),
      newTemplateCategory.value
    );
    
    if (template) {
      showSuccess('Template created successfully!');
      resetCreateForm();
      showCreateDialog.value = false;
    } else {
      showError('Failed to create template');
    }
  } catch (error) {
    console.error('Error creating template:', error);
    showError('Error creating template');
  }
}

function resetCreateForm() {
  newTemplateName.value = '';
  newTemplateCategory.value = 'custom';
  newTemplateDescription.value = '';
}

function deleteTemplate(templateId) {
  if (confirm('Are you sure you want to delete this template?')) {
    try {
      deleteCustomTemplate(templateId);
      showSuccess('Template deleted successfully!');
    } catch (error) {
      console.error('Error deleting template:', error);
      showError('Error deleting template');
    }
  }
}

function refreshTemplates() {
  // Refresh templates (placeholder for future implementation)
  showSuccess('Templates refreshed');
}
</script>

<style scoped>
.templates-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: white;
  color: #4f46e5;
  border: 1px solid #4f46e5;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #4f46e5;
  color: white;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f3f4f6;
  color: #4f46e5;
}

.search-section {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.search-bar {
  position: relative;
  margin-bottom: 12px;
}

.search-bar i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #4f46e5;
}

.category-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover,
.category-btn.active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
}

.category-btn:not(.active) .count {
  background: #f3f4f6;
  color: #6b7280;
}

.popular-section {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.popular-section h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #1f2937;
}

.templates-section {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
}

.view-options {
  display: flex;
  gap: 4px;
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover,
.view-btn.active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.templates-grid {
  display: grid;
  gap: 12px;
}

.templates-grid.grid {
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}

.templates-grid.horizontal {
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}

.templates-grid.list {
  grid-template-columns: 1fr;
}

.template-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.template-card.small .template-preview {
  height: 80px;
}

.template-card.list-item {
  display: flex;
  align-items: center;
  padding: 8px;
}

.template-card.list-item .template-preview {
  width: 80px;
  height: 60px;
  flex-shrink: 0;
  margin-right: 12px;
}

.template-preview {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.template-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.template-card:hover .template-overlay {
  opacity: 1;
}

.preview-btn,
.apply-btn,
.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: white;
  border: none;
  border-radius: 50%;
  color: #4f46e5;
  cursor: pointer;
  transition: all 0.2s;
}

.apply-btn {
  background: #4f46e5;
  color: white;
}

.delete-btn {
  background: #ef4444;
  color: white;
}

.preview-btn:hover,
.apply-btn:hover,
.delete-btn:hover {
  transform: scale(1.1);
}

.template-info {
  padding: 12px;
}

.template-card.list-item .template-info {
  padding: 0;
  flex: 1;
}

.template-info h5 {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1f2937;
}

.template-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #6b7280;
}

.template-size {
  font-family: monospace;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h4 {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #1f2937;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

/* Dialog Styles */
.dialog-overlay,
.preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog,
.preview-dialog {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.preview-dialog {
  max-width: 600px;
}

.dialog-header,
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-header h3,
.preview-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: 50%;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.dialog-body {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #4f46e5;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.dialog-footer,
.preview-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.dialog-footer {
  justify-content: flex-end;
  gap: 8px;
}

.btn-primary {
  padding: 8px 16px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #4338ca;
}

.btn-primary:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.preview-content {
  padding: 16px;
  text-align: center;
}

.preview-content img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.template-details {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #6b7280;
}
</style>
