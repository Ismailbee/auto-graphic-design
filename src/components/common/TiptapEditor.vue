<template>
  <div class="tiptap-editor" :class="{ compact: isCompact }">
    <!-- Tiptap Editor Content -->
    <div class="editor-content">
      <editor-content 
        :editor="editor" 
        class="prose"
        :class="{ 'min-height': !isCompact }"
      />
    </div>
    
    <!-- Tiptap Toolbar -->
    <div class="editor-toolbar" v-if="showToolbar">
      <div class="toolbar-group">
        <button 
          @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }"
          class="toolbar-btn"
          title="Bold"
        >
          <i class="fas fa-bold"></i>
        </button>
        
        <button 
          @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }"
          class="toolbar-btn"
          title="Italic"
        >
          <i class="fas fa-italic"></i>
        </button>
        
        <button 
          @click="editor.chain().focus().toggleUnderline().run()"
          :class="{ 'is-active': editor.isActive('underline') }"
          class="toolbar-btn"
          title="Underline"
        >
          <i class="fas fa-underline"></i>
        </button>
        
        <button 
          @click="editor.chain().focus().toggleStrike().run()"
          :class="{ 'is-active': editor.isActive('strike') }"
          class="toolbar-btn"
          title="Strikethrough"
        >
          <i class="fas fa-strikethrough"></i>
        </button>
      </div>
      
      <div class="toolbar-separator"></div>
      
      <div class="toolbar-group">
        <button 
          @click="editor.chain().focus().setTextAlign('left').run()"
          :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
          class="toolbar-btn"
          title="Align Left"
        >
          <i class="fas fa-align-left"></i>
        </button>
        
        <button 
          @click="editor.chain().focus().setTextAlign('center').run()"
          :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
          class="toolbar-btn"
          title="Align Center"
        >
          <i class="fas fa-align-center"></i>
        </button>
        
        <button 
          @click="editor.chain().focus().setTextAlign('right').run()"
          :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
          class="toolbar-btn"
          title="Align Right"
        >
          <i class="fas fa-align-right"></i>
        </button>
        
        <button 
          @click="editor.chain().focus().setTextAlign('justify').run()"
          :class="{ 'is-active': editor.isActive({ textAlign: 'justify' }) }"
          class="toolbar-btn"
          title="Justify"
        >
          <i class="fas fa-align-justify"></i>
        </button>
      </div>
      
      <div class="toolbar-separator" v-if="!isCompact"></div>
      
      <div class="toolbar-group" v-if="!isCompact">
        <button 
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'is-active': editor.isActive('bulletList') }"
          class="toolbar-btn"
          title="Bullet List"
        >
          <i class="fas fa-list-ul"></i>
        </button>
        
        <button 
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="{ 'is-active': editor.isActive('orderedList') }"
          class="toolbar-btn"
          title="Numbered List"
        >
          <i class="fas fa-list-ol"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Start typing...'
  },
  isCompact: {
    type: Boolean,
    default: false
  },
  showToolbar: {
    type: Boolean,
    default: true
  },
  editable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'selectionUpdate'])

const editor = ref(null)

onMounted(() => {
  editor.value = new Editor({
    content: props.modelValue,
    editable: props.editable,
    extensions: [
      StarterKit.configure({
        heading: false, // Disable heading in compact mode
        blockquote: !props.isCompact,
        codeBlock: !props.isCompact,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        'data-placeholder': props.placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      emit('update:modelValue', editor.getHTML())
    },
    onFocus: ({ editor }) => {
      emit('focus', editor)
    },
    onBlur: ({ editor }) => {
      emit('blur', editor)
    },
    onSelectionUpdate: ({ editor }) => {
      emit('selectionUpdate', editor)
    }
  })
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

watch(() => props.modelValue, (value) => {
  if (editor.value && editor.value.getHTML() !== value) {
    editor.value.commands.setContent(value)
  }
})

watch(() => props.editable, (value) => {
  if (editor.value) {
    editor.value.setEditable(value)
  }
})

// Expose editor methods for parent components
defineExpose({
  getEditor: () => editor.value,
  focus: () => editor.value?.commands.focus(),
  blur: () => editor.value?.commands.blur(),
  selectAll: () => editor.value?.commands.selectAll(),
  getHTML: () => editor.value?.getHTML(),
  getText: () => editor.value?.getText(),
  isEmpty: () => editor.value?.isEmpty
})
</script>

<style scoped>
.tiptap-editor {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: white;
}

.tiptap-editor.compact {
  border: none;
  background-color: transparent;
}

.editor-content {
  position: relative;
}

.editor-content .min-height {
  min-height: 8rem;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  flex-wrap: wrap;
}

.tiptap-editor.compact .editor-toolbar {
  border-top: none;
  background-color: transparent;
  padding: 0.25rem;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.toolbar-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  color: #4b5563;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  color: #111827;
  background-color: #e5e7eb;
}

.toolbar-btn.is-active {
  background-color: #3b82f6;
  color: white;
}

.toolbar-separator {
  width: 1px;
  height: 1.5rem;
  background-color: #d1d5db;
  margin: 0 0.25rem;
}

/* Tiptap Editor Styles */
:deep(.ProseMirror) {
  padding: 0.75rem;
  outline: none;
  min-height: 100px;
}

:deep(.ProseMirror[data-placeholder]:empty::before) {
  content: attr(data-placeholder);
  color: #9ca3af;
  pointer-events: none;
}

:deep(.ProseMirror p) {
  margin-bottom: 0.5rem;
}

:deep(.ProseMirror ul, .ProseMirror ol) {
  margin-left: 1rem;
  margin-bottom: 0.5rem;
}

:deep(.ProseMirror li) {
  margin-bottom: 0.25rem;
}

:deep(.ProseMirror strong) {
  font-weight: bold;
}

:deep(.ProseMirror em) {
  font-style: italic;
}

:deep(.ProseMirror u) {
  text-decoration: underline;
}

:deep(.ProseMirror s) {
  text-decoration: line-through;
}

/* Compact mode styles */
.tiptap-editor.compact :deep(.ProseMirror) {
  padding: 0.25rem;
  font-size: 0.875rem;
  min-height: 60px;
}

.tiptap-editor.compact :deep(.ProseMirror p) {
  margin-bottom: 0.25rem;
}
</style>
