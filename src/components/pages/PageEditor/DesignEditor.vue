<template>
  <ion-page>
    <!-- Top App Bar -->
    <ion-header class="bg-brown-100 backdrop-blur border-b border-white/10">
      <ion-toolbar class="min-h-[56px]">
        <ion-buttons slot="start" class="flex items-center gap-2">
          <div class="text-xl text-white">
            <font-awesome-icon :icon="faPalette" />
          </div>
          <ion-title class="font-montserrat font-extrabold text-xl bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent ml-1.5">
            Smart Graphic Design — Pro
          </ion-title>
        </ion-buttons>

        <!-- Top actions -->
        <div class="flex items-center gap-2" slot="end">
          <!-- File -->
          <ion-button fill="clear" size="small" @click="newDocument">
            <font-awesome-icon :icon="faFileAlt" class="mr-1 text-white" /> New
          </ion-button>
          <ion-button fill="clear" size="small" @click="saveProject">
            <font-awesome-icon :icon="faSave" class="mr-1 text-white" /> Save
          </ion-button>
          <ion-button fill="clear" size="small" @click="loadProject">
            <font-awesome-icon :icon="faDownload" class="mr-1 text-white" /> Load
          </ion-button>
          <ion-button color="primary" size="small" @click="exportPNG">
            <font-awesome-icon :icon="faDownload" class="mr-1 text-white" /> Export PNG
          </ion-button>
        </div>
      </ion-toolbar>

      <!-- Secondary bar: Edit / View -->
      <div class="flex items-center gap-2 px-3 py-2 bg-slate-900/60 border-t border-white/10">
        <!-- Undo/Redo -->
        <div class="flex gap-1 items-center">
          <button @click="undo" class="btn-ghost"><font-awesome-icon :icon="faUndo" class="mr-1 text-[10px]"/>Undo</button>
          <button @click="redo" class="btn-ghost"><font-awesome-icon :icon="faRedo" class="mr-1 text-[10px]"/>Redo</button>
        </div>

        <!-- Zoom -->
        <div class="flex items-center gap-2 ml-2">
          <button class="btn-ghost" @click="zoomOut">-</button>
          <div class="min-w-20 text-center text-xs text-white">{{ Math.round(zoom * 100) }}%</div>
          <button class="btn-ghost" @click="zoomIn">+</button>
          <button class="btn-ghost" @click="fitToScreen">Fit</button>
          <button class="btn-ghost" @click="resetZoom">Reset</button>
        </div>

        <!-- View toggles -->
        <div class="flex items-center gap-2 ml-2">
          <label class="view-toggle"><input type="checkbox" v-model="view.grid" @change="toggleGrid"/> Grid</label>
          <label class="view-toggle"><input type="checkbox" v-model="view.snap"/> Snap</label>
          <label class="view-toggle"><input type="checkbox" v-model="view.rulers"/> Rulers</label>
        </div>

        <!-- Page nav -->
        <div class="flex items-center gap-1 ml-auto">
          <ion-button fill="clear" @click="prevPage" class="w-6 h-6 rounded-md btn-ghost">
            <font-awesome-icon :icon="faChevronLeft" class="text-white text-xs" />
          </ion-button>
          <div class="text-xs text-slate-300">Page {{ currentPage }} / {{ pages.length }}</div>
          <ion-button fill="clear" @click="nextPage" class="w-6 h-6 rounded-md btn-ghost">
            <font-awesome-icon :icon="faChevronRight" class="text-white text-xs" />
          </ion-button>
          <button class="btn-ghost" @click="addPage"><font-awesome-icon :icon="faPlus" class="mr-1"/>Add</button>
          <button class="btn-danger" @click="deleteCurrentPage"><font-awesome-icon :icon="faTrashAlt" class="mr-1"/>Delete</button>
        </div>
      </div>
    </ion-header>

    <ion-content class="bg-gradient-to-br from-slate-800 to-slate-600">
      <div class="flex h-full">
        <!-- Left Sidebar: Tools / Pages / Layers -->
        <aside class="w-[300px] bg-primary border-r border-white/10 p-3 overflow-y-auto flex flex-col">
          <div class="tabs">
            <button class="tab" :class="{active: leftTab==='tools'}" @click="leftTab='tools'">Tools</button>
            <button class="tab" :class="{active: leftTab==='pages'}" @click="leftTab='pages'">Pages</button>
            <button class="tab" :class="{active: leftTab==='layers'}" @click="leftTab='layers'">Layers</button>
          </div>

          <div v-if="leftTab==='tools'" class="mt-3">
            <div class="text-xs uppercase text-slate-400 mb-2 tracking-wider">Design Tools</div>
            <div class="grid grid-cols-3 gap-2">
              <div v-for="tool in tools" :key="tool.id"
                   class="tool-tile"
                   :class="{'active': activeTool===tool.id}"
                   @click="selectTool(tool.id)">
                <font-awesome-icon :icon="tool.icon" class="text-lg text-white mb-1" />
                <div class="text-[11px] text-gray-200">{{ tool.name }}</div>
              </div>
            </div>

            <!-- Quick inserts -->
            <div class="mt-5 space-y-2">
              <button class="btn" @click="insertText">Add Heading</button>
              <button class="btn" @click="insertShape('rect')">Add Rectangle</button>
              <button class="btn" @click="insertShape('circle')">Add Circle</button>
              <button class="btn" @click="promptInsertImage">Add Image</button>
            </div>

            <!-- Document size -->
            <div class="panel mt-5">
              <div class="panel-title"><font-awesome-icon :icon="faRulerCombined" class="mr-2"/>Document</div>
              <div class="grid grid-cols-2 gap-2 mt-2">
                <label class="label">Width <input type="number" v-model.number="doc.width" class="input"/></label>
                <label class="label">Height <input type="number" v-model.number="doc.height" class="input"/></label>
              </div>
              <div class="flex gap-2 mt-2">
                <button class="btn-ghost" @click="applyDocSize">Apply</button>
                <button class="btn-ghost" @click="setPreset('a4')">A4</button>
                <button class="btn-ghost" @click="setPreset('ig')">IG Post</button>
              </div>
              <div class="mt-2">
                <label class="label">Background <input type="color" v-model="doc.bg" class="input-color"/></label>
              </div>
            </div>
          </div>

          <div v-else-if="leftTab==='pages'" class="mt-3 space-y-2">
            <div class="text-xs text-slate-400">Manage multiple pages</div>
            <div v-for="(p, idx) in pages" :key="p.id" class="page-item" :class="{active: currentPage-1===idx}" @click="goToPage(idx)">
              <div class="text-[11px] text-slate-300">Page {{ idx+1 }} — {{ p.width }}×{{ p.height }}</div>
            </div>
            <div class="flex gap-2 mt-2">
              <button class="btn" @click="addPage"><font-awesome-icon :icon="faPlus" class="mr-1"/>Add Page</button>
              <button class="btn-danger" @click="deleteCurrentPage"><font-awesome-icon :icon="faTrashAlt" class="mr-1"/>Delete</button>
            </div>
          </div>

          <div v-else class="mt-3">
            <div class="text-xs text-slate-400 mb-2">Layer stack (top → bottom)</div>
            <div v-for="(obj, i) in layerList" :key="obj.id || i" class="layer-row" @click="selectLayer(obj)">
              <div class="truncate text-[12px]">{{ layerLabel(obj) }}</div>
              <div class="flex items-center gap-1">
                <button class="chip" @click.stop="toggleLock(obj)">{{ obj.lockMovementX ? 'Locked' : 'Lock' }}</button>
                <button class="chip" @click.stop="toggleVisible(obj)">{{ obj.visible ? 'Hide' : 'Show' }}</button>
                <button class="chip" @click.stop="bringForward(obj)">Up</button>
                <button class="chip" @click.stop="sendBackward(obj)">Down</button>
              </div>
            </div>
          </div>
        </aside>

        <!-- Center: Canvas -->
        <section class="flex-1 relative overflow-hidden">
          <!-- Optional rulers -->
          <div v-if="view.rulers" class="absolute left-0 top-0 w-full h-full pointer-events-none">
            <div class="absolute top-0 left-[300px] right-[320px] h-6 bg-slate-900/60 border-b border-white/10 flex text-[10px] text-slate-300"></div>
            <div class="absolute top-0 bottom-0 left-[300px] w-6 bg-slate-900/60 border-r border-white/10"></div>
          </div>

          <div class="workspace">
            <div ref="canvasScroll" class="workspace-scroll">
              <div ref="canvasWrapper" class="canvas-wrapper">
                <canvas ref="canvasEl"></canvas>
              </div>
            </div>
          </div>
        </section>

        <!-- Right Sidebar: Properties -->
        <aside class="w-[320px] bg-slate-900/80 border-l border-white/10 p-3 overflow-y-auto">
          <div class="text-white text-sm font-semibold mb-2 flex items-center gap-2">
            <font-awesome-icon :icon="faRobot"/> Properties
          </div>

          <!-- Nothing selected -->
          <div v-if="!activeObject" class="text-xs text-slate-400">No object selected. Select an object to edit its properties.</div>

          <!-- Common -->
          <div v-else class="space-y-4">
            <div class="panel">
              <div class="panel-title">Position & Size</div>
              <div class="grid grid-cols-2 gap-2 mt-2">
                <label class="label">X <input type="number" class="input" v-model.number="ui.pos.x" @change="applyCommon"/></label>
                <label class="label">Y <input type="number" class="input" v-model.number="ui.pos.y" @change="applyCommon"/></label>
                <label class="label">W <input type="number" class="input" v-model.number="ui.size.w" @change="applyCommon"/></label>
                <label class="label">H <input type="number" class="input" v-model.number="ui.size.h" @change="applyCommon"/></label>
                <label class="label">Rotate <input type="number" class="input" v-model.number="ui.rotate" @change="applyCommon"/></label>
                <label class="label">Opacity <input type="range" min="0" max="1" step="0.01" v-model.number="ui.opacity" @input="applyCommon"/></label>
              </div>
              <div class="flex gap-2 mt-2">
                <button class="btn-ghost" @click="bringToFront">Front</button>
                <button class="btn-ghost" @click="sendToBack">Back</button>
                <button class="btn-ghost" @click="duplicateObject">Duplicate</button>
                <button class="btn-danger" @click="deleteObject">Delete</button>
              </div>
            </div>

            <!-- Text controls -->
            <div class="panel" v-if="isText">
              <div class="panel-title">Text</div>
              <textarea class="input-textarea" rows="3" v-model="ui.text.value" @input="applyText"></textarea>
              <div class="grid grid-cols-2 gap-2 mt-2">
                <label class="label">Font size <input type="number" class="input" v-model.number="ui.text.fontSize" @change="applyText"/></label>
                <label class="label">Line height <input type="number" step="0.1" class="input" v-model.number="ui.text.lineHeight" @change="applyText"/></label>
                <label class="label">Letter space <input type="number" step="0.1" class="input" v-model.number="ui.text.charSpacing" @change="applyText"/></label>
                <label class="label">Color <input type="color" class="input-color" v-model="ui.text.fill" @change="applyText"/></label>
              </div>
              <div class="flex gap-2 mt-2">
                <button class="chip" @click="toggleStyle('bold')">Bold</button>
                <button class="chip" @click="toggleStyle('italic')">Italic</button>
                <button class="chip" @click="toggleStyle('underline')">Underline</button>
                <button class="chip" @click="align('left')">Left</button>
                <button class="chip" @click="align('center')">Center</button>
                <button class="chip" @click="align('right')">Right</button>
              </div>
            </div>

            <!-- Shape controls -->
            <div class="panel" v-if="isShape">
              <div class="panel-title">Shape</div>
              <div class="grid grid-cols-2 gap-2 mt-2">
                <label class="label">Fill <input type="color" class="input-color" v-model="ui.shape.fill" @change="applyShape"/></label>
                <label class="label">Stroke <input type="color" class="input-color" v-model="ui.shape.stroke" @change="applyShape"/></label>
                <label class="label">Stroke W <input type="number" class="input" v-model.number="ui.shape.strokeWidth" @change="applyShape"/></label>
                <label class="label" v-if="ui.shape.rx!==undefined">Radius <input type="number" class="input" v-model.number="ui.shape.rx" @change="applyShape"/></label>
              </div>
            </div>

            <!-- Image controls -->
            <div class="panel" v-if="isImage">
              <div class="panel-title">Image</div>
              <div class="grid grid-cols-2 gap-2 mt-2">
                <label class="label">Opacity <input type="range" min="0" max="1" step="0.01" v-model.number="ui.opacity" @input="applyCommon"/></label>
                <button class="btn" @click="replaceImage">Replace…</button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
// import fabric from 'fabric';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faPalette, faSave, faDownload, faChevronLeft, faChevronRight, faPlus, faTrashAlt, faUndo, faRedo,
  faRulerCombined, faFileAlt, faRobot, faMousePointer, faTextHeight, faImage, faShapes
} from '@fortawesome/free-solid-svg-icons'

// register component
// eslint-disable-next-line vue/no-reserved-component-names
const components = { FontAwesomeIcon }

// ====== State ======
const canvasEl = ref(null)
const canvasWrapper = ref(null)
const canvasScroll = ref(null)
let canvas = null

const leftTab = ref('tools')
const activeTool = ref('select')
const zoom = ref(1)
const gridGroup = ref(null)

const doc = reactive({ width: 1080, height: 1350, bg: '#ffffff' })

const pages = reactive([])
const currentPage = ref(1)

const view = reactive({ grid: true, snap: true, rulers: false, gridSize: 20 })

const tools = [
  { id: 'select', name: 'Select', icon: faMousePointer },
  { id: 'text', name: 'Text', icon: faTextHeight },
  { id: 'image', name: 'Image', icon: faImage },
  { id: 'shape', name: 'Shapes', icon: faShapes }
]

// Active object UI mirrors
const activeObject = ref(null)
const ui = reactive({
  pos: { x: 0, y: 0 },
  size: { w: 0, h: 0 },
  rotate: 0,
  opacity: 1,
  text: { value: '', fontSize: 32, lineHeight: 1.2, charSpacing: 0, fill: '#111111' },
  shape: { fill: '#6366f1', stroke: '#111111', strokeWidth: 0, rx: 0 }
})

const isText = computed(() => activeObject.value && activeObject.value.type === 'text')
const isImage = computed(() => activeObject.value && activeObject.value.type === 'image')
const isShape = computed(() => activeObject.value && ['rect','circle','triangle'].includes(activeObject.value.type))

const layerList = computed(() => (canvas ? canvas.getObjects().filter(o => !o.excludeFromExport) : []).slice().reverse())

// ====== Init ======
function createEmptyPage(width, height) {
  return { id: Date.now() + Math.random(), width, height, json: null, bg: doc.bg }
}

async function initFirst() {
  const p = createEmptyPage(doc.width, doc.height)
  pages.push(p)
  await nextTick()
  await mountPage(0)
}

async function mountPage(index) {
  if (canvas) { try { canvas.dispose() } catch(e){} }
  const el = canvasEl.value
  el.width = pages[index].width
  el.height = pages[index].height

  canvas = new fabric.Canvas(el, {
    preserveObjectStacking: true,
    backgroundColor: pages[index].bg || '#ffffff',
    selection: true
  })

  // Border frame (non-exporting)
  const frame = new fabric.Rect({
    left: 0, top: 0, width: el.width, height: el.height,
    fill: 'transparent', stroke: '#e5e7eb', strokeWidth: 1,
    selectable: false, evented: false, excludeFromExport: true
  })
  canvas.add(frame)

  // load saved JSON if any
  if (pages[index].json) {
    canvas.loadFromJSON(pages[index].json, () => {
      canvas.renderAll()
      ensureFrameOnTop()
    })
  }

  attachCanvasEvents()
  if (view.grid) drawGrid()
  await nextTick()
  fitToScreen()
}

function ensureFrameOnTop(){
  const objs = canvas.getObjects()
  const frame = objs.find(o => o.excludeFromExport)
  if (frame) frame.bringToFront()
}

function attachCanvasEvents(){
  canvas.on('selection:created', syncActive)
  canvas.on('selection:updated', syncActive)
  canvas.on('selection:cleared', () => { activeObject.value = null })
  canvas.on('object:modified', () => savePageState())
  canvas.on('object:added', () => savePageState())
  canvas.on('object:moving', e => {
    if (!view.snap) return
    const obj = e.target
    const g = view.gridSize
    obj.set({
      left: Math.round(obj.left / g) * g,
      top: Math.round(obj.top / g) * g
    })
  })
}

function syncActive(){
  const obj = canvas.getActiveObject()
  if (!obj) { activeObject.value = null; return }
  activeObject.value = obj

  ui.pos.x = Math.round(obj.left || 0)
  ui.pos.y = Math.round(obj.top || 0)
  ui.size.w = Math.round(obj.width * obj.scaleX)
  ui.size.h = Math.round(obj.height * obj.scaleY)
  ui.rotate = Math.round(obj.angle || 0)
  ui.opacity = obj.opacity ?? 1

  if (obj.type === 'text'){
    ui.text.value = obj.text || ''
    ui.text.fontSize = obj.fontSize || 32
    ui.text.lineHeight = obj.lineHeight || 1.2
    ui.text.charSpacing = (obj.charSpacing || 0)
    ui.text.fill = obj.fill || '#111111'
  }
  if (['rect','triangle','circle'].includes(obj.type)){
    ui.shape.fill = obj.fill || '#6366f1'
    ui.shape.stroke = obj.stroke || '#111111'
    ui.shape.strokeWidth = obj.strokeWidth || 0
    if (obj.type==='rect') ui.shape.rx = obj.rx || 0
  }
}

function savePageState(){
  const idx = currentPage.value - 1
  pages[idx].json = canvas.toJSON(['excludeFromExport'])
}

// ====== Tools ======
function selectTool(id){ activeTool.value = id }

function insertText(){
  const t = new fabric.Text('Your Heading', {
    left: 100, top: 100, fontFamily: 'Poppins', fontSize: 48,
    fill: '#111111'
  })
  canvas.add(t).setActiveObject(t)
  canvas.renderAll(); syncActive();
}

function insertShape(type){
  let obj
  if (type==='rect') obj = new fabric.Rect({ left: 120, top: 120, width: 240, height: 140, fill: '#6366f1', rx: 8 })
  if (type==='circle') obj = new fabric.Circle({ left: 160, top: 160, radius: 80, fill: '#22c55e' })
  if (type==='triangle') obj = new fabric.Triangle({ left: 200, top: 160, width: 160, height: 140, fill: '#f59e0b' })
  if (!obj) return
  canvas.add(obj).setActiveObject(obj)
  canvas.renderAll(); syncActive();
}

function promptInsertImage(){
  const inp = document.createElement('input')
  inp.type = 'file'; inp.accept = 'image/*'
  inp.onchange = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      fabric.Image.fromURL(reader.result, img => {
        img.set({ left: 100, top: 100, angle: 0 })
        // scale image to fit width 400
        const scale = 400 / img.width
        img.scale(scale)
        canvas.add(img).setActiveObject(img)
        canvas.renderAll(); syncActive();
      })
    }
    reader.readAsDataURL(file)
  }
  inp.click()
}

// ====== Properties apply ======
function applyCommon(){
  const o = activeObject.value; if (!o) return
  o.set({
    left: ui.pos.x, top: ui.pos.y,
    scaleX: ui.size.w / o.width, scaleY: ui.size.h / o.height,
    angle: ui.rotate, opacity: ui.opacity
  })
  o.setCoords(); canvas.renderAll(); savePageState();
}

function bringToFront(){ const o = activeObject.value; if (o){ o.bringToFront(); canvas.renderAll(); savePageState(); } }
function sendToBack(){ const o = activeObject.value; if (o){ o.sendToBack(); ensureFrameOnTop(); canvas.renderAll(); savePageState(); } }
function duplicateObject(){ const o = activeObject.value; if (!o) return; o.clone(cl=>{ cl.set({ left: (o.left||0)+20, top: (o.top||0)+20 }); canvas.add(cl); canvas.setActiveObject(cl); canvas.renderAll(); savePageState(); }) }
function deleteObject(){ const o = activeObject.value; if (!o) return; canvas.remove(o); activeObject.value=null; canvas.renderAll(); savePageState(); }

function applyText(){
  const o = activeObject.value; if (!o || o.type!=='text') return
  o.set({ text: ui.text.value, fontSize: ui.text.fontSize, lineHeight: ui.text.lineHeight, charSpacing: ui.text.charSpacing, fill: ui.text.fill })
  canvas.renderAll(); savePageState();
}

function toggleStyle(kind){
  const o = activeObject.value; if (!o || o.type!=='text') return
  if (kind==='bold') o.set({ fontWeight: o.fontWeight==='bold' ? 'normal' : 'bold' })
  if (kind==='italic') o.set({ fontStyle: o.fontStyle==='italic' ? 'normal' : 'italic' })
  if (kind==='underline') o.set({ underline: !o.underline })
  canvas.renderAll(); savePageState();
}

function align(which){
  const o = activeObject.value; if (!o || o.type!=='text') return
  o.set({ textAlign: which })
  canvas.renderAll(); savePageState();
}

function applyShape(){
  const o = activeObject.value; if (!o || !['rect','triangle','circle'].includes(o.type)) return
  o.set({ fill: ui.shape.fill, stroke: ui.shape.stroke, strokeWidth: ui.shape.strokeWidth })
  if (o.type==='rect') o.set({ rx: ui.shape.rx, ry: ui.shape.rx })
  canvas.renderAll(); savePageState();
}

// ====== Layers ======
function layerLabel(o){ return `${o.type}${o.text ? ': ' + o.text.slice(0,12) : ''}` }
function selectLayer(o){ canvas.setActiveObject(o); canvas.renderAll(); syncActive() }
function toggleLock(o){ const locked = !o.lockMovementX; o.lockMovementX = locked; o.lockMovementY = locked; o.selectable = !locked; canvas.renderAll() }
function toggleVisible(o){ o.visible = !o.visible; canvas.renderAll() }
function bringForward(o){ o.bringForward(); ensureFrameOnTop(); canvas.renderAll(); }
function sendBackward(o){ o.sendBackwards(); ensureFrameOnTop(); canvas.renderAll(); }

// ====== View / Grid / Zoom ======
function drawGrid(){
  clearGrid()
  const g = view.gridSize
  const lines = []
  for (let i = g; i < canvas.width; i += g){
    lines.push(new fabric.Line([i,0,i,canvas.height], { stroke: '#e5e7eb', strokeWidth: 1, selectable: false, evented: false, excludeFromExport: true }))
  }
  for (let j = g; j < canvas.height; j += g){
    lines.push(new fabric.Line([0,j,canvas.width,j], { stroke: '#e5e7eb', strokeWidth: 1, selectable: false, evented: false, excludeFromExport: true }))
  }
  const grp = new fabric.Group(lines, { selectable: false, evented: false, excludeFromExport: true })
  gridGroup.value = grp
  canvas.add(grp)
  ensureFrameOnTop()
}
function clearGrid(){ if (gridGroup.value){ canvas.remove(gridGroup.value); gridGroup.value = null; } }
function toggleGrid(){ view.grid ? drawGrid() : clearGrid() }

function zoomIn(){ setZoom(zoom.value * 1.1) }
function zoomOut(){ setZoom(zoom.value / 1.1) }
function resetZoom(){ setZoom(1) }
function setZoom(z){
  z = Math.min(Math.max(z, 0.1), 4)
  zoom.value = z
  const center = new fabric.Point(canvas.width/2, canvas.height/2)
  canvas.zoomToPoint(center, z)
  centerCanvasInScroll()
}

function fitToScreen(){
  // fit canvas into wrapper area
  const wrapper = canvasWrapper.value
  const pad = 40
  const scaleX = (wrapper.clientWidth - pad) / canvas.width
  const scaleY = (wrapper.clientHeight - pad) / canvas.height
  const s = Math.min(scaleX, scaleY)
  setZoom(s)
}

function centerCanvasInScroll(){
  // center the canvas visually within scroll area
  const sc = canvasScroll.value
  if (!sc) return
  sc.scrollLeft = (canvasEl.value.width * zoom.value - sc.clientWidth) / 2
  sc.scrollTop  = (canvasEl.value.height * zoom.value - sc.clientHeight) / 2
}

// ====== Document ======
function setPreset(which){
  if (which==='a4'){ doc.width = 2480; doc.height = 3508 } // @300dpi
  if (which==='ig'){ doc.width = 1080; doc.height = 1080 }
}
function applyDocSize(){ resizeActiveCanvas(doc.width, doc.height) }

function resizeActiveCanvas(w,h){
  const json = canvas.toJSON(['excludeFromExport'])
  const idx = currentPage.value - 1
  pages[idx].width = w; pages[idx].height = h
  pages[idx].bg = doc.bg
  pages[idx].json = json
  nextTick().then(()=> mountPage(idx))
}

// ====== Pages ======
async function addPage(){
  const p = createEmptyPage(doc.width, doc.height)
  pages.push(p)
  currentPage.value = pages.length
  await nextTick(); await mountPage(currentPage.value - 1)
}
function goToPage(i){
  pages[currentPage.value - 1].json = canvas.toJSON(['excludeFromExport'])
  currentPage.value = i + 1
  mountPage(i)
}
function deleteCurrentPage(){
  if (pages.length===1){ // reset
    pages[0] = createEmptyPage(doc.width, doc.height)
    return mountPage(0)
  }
  pages.splice(currentPage.value-1, 1)
  if (currentPage.value > pages.length) currentPage.value = pages.length
  mountPage(currentPage.value - 1)
}
function prevPage(){ if (currentPage.value>1) goToPage(currentPage.value-2) }
function nextPage(){ if (currentPage.value<pages.length) goToPage(currentPage.value) }

// ====== File IO ======
function exportPNG(){
  // hide grid for export
  const wasGrid = view.grid
  clearGrid()
  const data = canvas.toDataURL({ format: 'png', multiplier: 2 })
  if (wasGrid && view.grid) drawGrid()
  const a = document.createElement('a'); a.href = data; a.download = `design-page-${currentPage.value}.png`; a.click()
}
function saveProject(){
  pages[currentPage.value - 1].json = canvas.toJSON(['excludeFromExport'])
  const blob = new Blob([JSON.stringify(pages)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'design-project.json'; a.click(); URL.revokeObjectURL(url)
}
function loadProject(){
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json'
  inp.onchange = async e => {
    const file = e.target.files[0]; if (!file) return
    const text = await file.text()
    const arr = JSON.parse(text)
    pages.splice(0, pages.length, ...arr)
    currentPage.value = 1
    await nextTick(); await mountPage(0)
  }
  inp.click()
}
function newDocument(){
  pages.splice(0, pages.length, createEmptyPage(doc.width, doc.height))
  currentPage.value = 1
  nextTick().then(()=> mountPage(0))
}

// ====== Image helpers ======
function replaceImage(){
  const o = activeObject.value; if (!o || o.type!=='image') return
  const inp = document.createElement('input'); inp.type='file'; inp.accept='image/*'
  inp.onchange = e => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      fabric.Image.fromURL(reader.result, img => {
        o.setElement(img.getElement())
        canvas.renderAll(); savePageState();
      })
    }
    reader.readAsDataURL(file)
  }
  inp.click()
}

// ====== Lifecycle ======
onMounted(async ()=>{
  await initFirst()
})
</script>

<style scoped>
/* utility buttons */
.btn { @apply bg-primary text-gray-200 rounded-md px-3 py-2 text-xs; }
.btn-ghost { @apply bg-primary text-gray-200 rounded-md px-2 py-1 text-xs border border-white/10; }
.btn-danger { @apply bg-red-600 text-white rounded-md px-3 py-2 text-xs; }
.chip { @apply bg-primary text-gray-200 rounded-md px-2 py-1 text-[11px] border border-white/10; }
.label { @apply text-[11px] text-slate-300 flex flex-col gap-1; }
.input { @apply bg-white text-slate-900 rounded-md px-2 py-1 text-xs border border-slate-200; }
.input-color { @apply w-8 h-8 p-0 border-0 rounded-md; }
.input-textarea { @apply w-full bg-white text-slate-900 rounded-md px-2 py-2 text-xs border border-slate-200; }

/* left tabs */
.tabs { @apply grid grid-cols-3 bg-primary rounded-lg p-1; }
.tab { @apply text-xs text-slate-300 py-1 rounded-md; }
.tab.active { @apply bg-primary text-white; }

.tool-tile { @apply bg-primary rounded-md p-2 text-center cursor-pointer transition-all border border-transparent hover:bg-slate-700/70 hover:border-indigo-500/50; }
.tool-tile.active { @apply bg-slate-700/80 border border-indigo-500; }

.panel { @apply bg-primary rounded-lg p-3 text-white; }
.panel-title { @apply text-xs uppercase tracking-wider text-slate-300; }

.page-item { @apply bg-primary rounded-md px-2 py-2 border border-transparent hover:border-indigo-500/50 cursor-pointer; }
.page-item.active { @apply border-indigo-500; }

.layer-row { @apply flex items-center justify-between bg-primary rounded-md px-2 py-1 mb-2; }

.view-toggle { @apply text-[11px] text-slate-300 flex items-center gap-1; }

/* workspace */
.workspace { @apply h-full w-full flex items-center justify-center p-4; }
.workspace-scroll { @apply relative w-full h-[calc(100vh-150px)] overflow-auto bg-[radial-gradient(circle,rgba(30,41,59,0.4)_0%,rgba(15,23,42,0.6)_100%)] rounded-md border border-white/10; }
.canvas-wrapper { @apply inline-block m-auto relative; }

/* canvas look */
canvas { background: white; box-shadow: 0 8px 24px rgba(0,0,0,.25); border-radius: 4px; }
</style>
