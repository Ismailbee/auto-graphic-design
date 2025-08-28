import { ref, computed } from 'vue'

export function useDesignerState() {
  // Active tab/panel state
  const activePanel = ref('tools') // tools, elements, templates, uploads, text
  
  // Selected element state
  const selectedElement = ref(null)
  
  // UI state
  const sidebarCollapsed = ref(false)
  const propertyPanelOpen = ref(false)
  
  // Computed properties
  const isElementSelected = computed(() => !!selectedElement.value)
  
  // Methods
  function setActivePanel(panel) {
    activePanel.value = panel
  }
  
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  function togglePropertyPanel() {
    propertyPanelOpen.value = !propertyPanelOpen.value
  }
  
  function selectElement(element) {
    selectedElement.value = element
    propertyPanelOpen.value = true
  }
  
  function clearSelection() {
    selectedElement.value = null
  }
  
  return {
    // State
    activePanel,
    selectedElement,
    sidebarCollapsed,
    propertyPanelOpen,
    
    // Computed
    isElementSelected,
    
    // Methods
    setActivePanel,
    toggleSidebar,
    togglePropertyPanel,
    selectElement,
    clearSelection
  }
}
