<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content" :class="{ 'dark-theme': canvasStore.workspaceTheme === 'dark' }">
      <div class="modal-header">
        <h3>Projects</h3>
        <div class="actions">
          <button class="primary" @click="saveAs"><i class="fas fa-save"></i> Save As</button>
          <button class="ghost" @click="refresh"><i class="fas fa-rotate"></i></button>
          <button class="ghost" @click="close"><i class="fas fa-times"></i></button>
        </div>
      </div>
      <div class="modal-body">
        <div class="toolbar">
          <div class="search">
            <i class="fas fa-search"></i>
            <input v-model="query" placeholder="Search projects" />
          </div>
          <label class="auto">
            <input type="checkbox" v-model="autosave" @change="toggleAutosave" /> Autosave
          </label>
        </div>

        <div v-if="!filtered.length" class="empty">
          <i class="fas fa-folder-open"></i>
          <p>No saved projects yet. Use "Save As" to create one.</p>
        </div>
        <div v-else class="list">
          <div v-for="item in filtered" :key="item.key" class="row">
            <div class="meta">
              <div class="name" :title="item.name">{{ item.name }}</div>
              <div class="date">Updated {{ formatDate(item.updatedAt) }}</div>
              <div class="key">{{ item.key }}</div>
            </div>
            <div class="row-actions">
              <button class="ghost" title="Load" @click="load(item)"><i class="fas fa-folder-open"></i></button>
              <button class="ghost" title="Rename" @click="rename(item)"><i class="fas fa-i-cursor"></i></button>
              <button class="ghost danger" title="Delete" @click="remove(item)"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCanvasStore } from '../../../../stores/canvas-konva'
import { useNotification } from '../../../../composables/useNotification'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const canvasStore = useCanvasStore()
const { showSuccess, showError, showInfo } = useNotification()

const items = ref([])
const query = ref('')
const autosave = ref(canvasStore.isAutosaveEnabled)

const filtered = computed(() => {
  if (!query.value) return items.value
  const q = query.value.toLowerCase()
  return items.value.filter(i => (i.name||'').toLowerCase().includes(q) || (i.key||'').toLowerCase().includes(q))
})

function refresh() {
  try {
    items.value = canvasStore.listLocalProjects().sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  } catch (e) { console.warn(e) }
}

function close() { emit('close') }

function slugify(s) {
  return (s||'').toString().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,50)
}

function saveAs() {
  const name = prompt('Project name:', canvasStore.projectName || 'Untitled Design')
  if (!name) return
  canvasStore.setProjectName(name)
  const key = `agd-${slugify(name)}-${Date.now()}`
  canvasStore.saveToLocalStorage(key)
  showSuccess('Project saved')
  refresh()
}

function load(item) {
  canvasStore.loadFromLocalStorage(item.key)
  showSuccess('Project loaded')
  emit('close')
}

function rename(item) {
  const name = prompt('Rename project:', item.name)
  if (!name || name === item.name) return
  try {
    const idxKey = 'agd-projects-index'
    const index = JSON.parse(localStorage.getItem(idxKey) || '[]')
    const entry = index.find(x => x.key === item.key)
    if (entry) { entry.name = name; entry.updatedAt = new Date().toISOString(); localStorage.setItem(idxKey, JSON.stringify(index)) }
    showSuccess('Project renamed')
    refresh()
  } catch (e) { showError('Rename failed') }
}

function remove(item) {
  if (!confirm('Delete this project? This cannot be undone.')) return
  canvasStore.deleteLocalProject(item.key)
  showInfo('Project deleted')
  refresh()
}

function toggleAutosave() {
  canvasStore.isAutosaveEnabled = autosave.value
}

onMounted(refresh)
</script>

<style scoped>
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;z-index:1002}
.modal-content{background:#fff;border-radius:16px;width:720px;max-width:95%;max-height:90vh;overflow:auto;box-shadow:0 20px 40px rgba(0,0,0,.2);animation:scaleIn .2s ease}
@keyframes scaleIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
.dark-theme.modal-content{background:#2d3748;color:#f9fafb}
.modal-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #e5e7eb}
.dark-theme .modal-header{border-bottom-color:#374151}
.modal-header h3{margin:0;font-weight:700}
.actions{display:flex;gap:8px}
.actions .ghost{background:transparent;border:1px solid #e5e7eb;border-radius:8px;padding:8px 10px}
.dark-theme .actions .ghost{border-color:#374151;color:#e5e7eb}
.actions .primary{background:#4f46e5;color:#fff;border:0;border-radius:8px;padding:8px 12px}
.modal-body{padding:16px}
.toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:12px}
.search{flex:1;position:relative}
.search i{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#9ca3af}
.search input{width:100%;padding:8px 10px 8px 30px;border:1px solid #e5e7eb;border-radius:8px}
.auto{display:flex;align-items:center;gap:8px;color:#6b7280}
.list{display:flex;flex-direction:column;gap:10px}
.row{display:flex;justify-content:space-between;align-items:center;border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;background:#fafafa}
.dark-theme .row{border-color:#374151;background:#1f2937}
.meta{min-width:0}
.name{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:420px}
.date{font-size:12px;color:#6b7280}
.key{font-size:11px;color:#9ca3af}
.row-actions{display:flex;gap:8px}
.row-actions .ghost{background:transparent;border:1px solid #e5e7eb;border-radius:8px;width:36px;height:36px;display:flex;align-items:center;justify-content:center}
.row-actions .danger{color:#ef4444}
.empty{border:2px dashed #e5e7eb;border-radius:12px;padding:24px;text-align:center;color:#6b7280}
.empty i{font-size:36px;margin-bottom:8px}
</style>