<template>
  <!-- eslint-disable vue/no-deprecated-slot-attribute -->
  <ion-page class="imposition-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" @click="goBack" class="back-arrow-btn">
            <ion-icon :icon="arrowBackOutline" class="back-arrow-icon"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Smart Imposition Studio</ion-title>
        <ion-buttons slot="end" style="display: none;">
          <ion-button fill="clear" color="primary" :disabled="!canReset" @click="resetForm">
            <ion-icon slot="start" :icon="refreshOutline"></ion-icon>
            Reset
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      
    </ion-header>
    <!-- Navigation Header with Imposition Options -->
    <div class="imposition-nav-toolbar">
      <div class="imposition-nav">
        <!-- Mobile Hamburger Menu -->
        <div class="mobile-hamburger-container">
          <button class="hamburger-btn" @click="toggleMobileMenu">
            <ion-icon :icon="menuOutline"></ion-icon>
          </button>
        </div>

        <!-- Desktop Navigation Items -->
        <div class="desktop-nav-items">
          <!-- Imposition Type -->
          <div class="nav-item dropdown" @mouseenter="openDropdown('type')" @mouseleave="closeDropdown">
            <button class="nav-button" :class="{ 'active': selectedType !== null && selectedType !== '' && selectedType !== 'merge' && selectedType !== 'convert' }" @click.stop="toggleDropdown('type')">
              <ion-icon :icon="gridOutline"></ion-icon>
              <span>{{ selectedTypeLabel }}</span>
              <ion-icon :icon="chevronDownOutline" class="chevron"></ion-icon>
            </button>
            <div v-if="activeDropdown === 'type'" class="dropdown-bridge"></div>
            <div v-if="activeDropdown === 'type'" class="dropdown-menu" @click.stop>
              <button
                v-for="option in impositionTypes"
                :key="option.value"
                class="dropdown-item"
                :class="{ active: selectedType === option.value }"
                :title="option.description"
                @click="selectType(option.value)"
              >
                <strong>{{ option.label }}</strong>
              </button>
            </div>
          </div>

          <!-- Merge PDFs Button -->
          <div class="nav-item">
            <button 
              class="nav-button" 
              :class="{ 'active': selectedType === 'merge' }"
              @click="selectType('merge')"
            >
              <ion-icon :icon="documentAttachOutline"></ion-icon>
              <span>Merge PDFs</span>
            </button>
          </div>

          <!-- Convert to PDF Button -->
          <div class="nav-item">
            <button 
              class="nav-button" 
              :class="{ 'active': selectedType === 'convert' }"
              @click="selectType('convert')"
            >
              <ion-icon :icon="swapHorizontalOutline"></ion-icon>
              <span>Convert to PDF</span>
            </button>
          </div>

          <!-- Export Button -->
          <div class="nav-item dropdown" ref="exportButton" @mouseenter="openDropdown('export')" @mouseleave="closeDropdown">
            <button class="nav-button desktop-only-dropdown" :class="{ 'active': exportFormat !== null }" @click.stop="toggleDropdown('export')">
              <ion-icon :icon="downloadOutline"></ion-icon>
              <span>{{ exportFormatLabel }}</span>
              <ion-icon :icon="chevronDownOutline" class="chevron"></ion-icon>
            </button>
            <div v-if="activeDropdown === 'export'" class="dropdown-bridge"></div>
            <div v-if="activeDropdown === 'export'" class="dropdown-menu export-dropdown" @click.stop>
              <div class="dropdown-item" @click="selectExportFormat('jpeg'); closeDropdown()">
                <span>PDF to JPEG</span>
                <ion-icon v-if="exportFormat === 'jpeg'" :icon="checkmarkCircleOutline" color="primary"></ion-icon>
              </div>
              <div class="dropdown-item" @click="selectExportFormat('png'); closeDropdown()">
                <span>PDF to PNG</span>
                <ion-icon v-if="exportFormat === 'png'" :icon="checkmarkCircleOutline" color="primary"></ion-icon>
              </div>
              <div class="dropdown-item" @click="selectExportFormat('doc'); closeDropdown()">
                <span>PDF to Doc</span>
                <ion-icon v-if="exportFormat === 'doc'" :icon="checkmarkCircleOutline" color="primary"></ion-icon>
              </div>
            </div>
          </div>

          <!-- Options -->
          <div class="nav-item dropdown" ref="optionsButton" :class="{ 'disabled-dropdown': isMergePDFsSelected }" @mouseenter="!isMergePDFsSelected && openDropdown('options')" @mouseleave="closeDropdown">
            <button class="nav-button" :disabled="isMergePDFsSelected" @click.stop="!isMergePDFsSelected && toggleDropdown('options')">
              <ion-icon :icon="optionsOutline"></ion-icon>
              <span>Options</span>
              <ion-icon :icon="chevronDownOutline" class="chevron"></ion-icon>
            </button>
          </div>

          <!-- Rotation -->
          <div class="nav-item dropdown" :class="{ 'disabled-dropdown': isMergePDFsSelected }" @mouseenter="!isMergePDFsSelected && openDropdown('rotation')" @mouseleave="closeDropdown">
            <button class="nav-button" :disabled="isMergePDFsSelected" @click.stop="!isMergePDFsSelected && toggleDropdown('rotation')">
              <ion-icon :icon="reloadOutline"></ion-icon>
              <span>Rotation</span>
              <ion-icon :icon="chevronDownOutline" class="chevron"></ion-icon>
            </button>
            <div v-if="activeDropdown === 'rotation'" class="dropdown-bridge"></div>
            <div v-if="activeDropdown === 'rotation'" class="dropdown-menu" @click.stop>
              <label class="dropdown-item toggle-item" @click="selectRotation(0)">
                <span>0°</span>
                <ion-toggle
                  :checked="rotationAngle === 0"
                  color="primary"
                  @ion-change="(e) => { if (e.detail.checked) selectRotation(0); }"
                  @click.stop
                ></ion-toggle>
              </label>
              <label class="dropdown-item toggle-item" @click="selectRotation(180, 'top')">
                <span>Top 180°</span>
                <ion-toggle
                  :checked="rotationAngle === 180 && rotationType === 'top'"
                  color="primary"
                  @ion-change="(e) => { if (e.detail.checked) selectRotation(180, 'top'); }"
                  @click.stop
                ></ion-toggle>
              </label>
              <label class="dropdown-item toggle-item" @click="selectRotation(180, 'bottom')">
                <span>Bottom 180°</span>
                <ion-toggle
                  :checked="rotationAngle === 180 && rotationType === 'bottom'"
                  color="primary"
                  @ion-change="(e) => { if (e.detail.checked) selectRotation(180, 'bottom'); }"
                  @click.stop
                ></ion-toggle>
              </label>
            </div>
          </div>
        </div>

        <!-- Generate Button -->
        <ion-button
          class="generate-btn"
          color="primary"
          :disabled="!canSubmit"
          @click="submitImposition"
        >
          <ion-spinner v-if="isSubmitting" slot="start"></ion-spinner>
          <ion-icon v-else slot="start" :icon="documentOutline"></ion-icon>
          <span v-if="selectedType === 'merge' || selectedType === 'convert' || exportFormat !== null">Convert File</span>
          <span v-else>Generate PDF</span>
        </ion-button>

        <!-- Mobile Back Button (only visible on mobile after generation) -->
        <ion-button
          class="mobile-back-btn"
          color="primary"
          v-if="previewUrl"
          @click="backToUpload()"
        >
          <ion-icon slot="start" :icon="arrowBackOutline"></ion-icon>
          <span>Back to Upload Files</span>
        </ion-button>
      </div>

      <!-- Mobile Menu Overlay -->
      <div v-if="showMobileMenu" class="mobile-menu-overlay" @click="closeMobileMenu">
        <div class="mobile-menu" @click.stop>
          <div class="mobile-menu-header">
            <h3>Menu</h3>
            <button class="close-btn" @click="closeMobileMenu">
              <ion-icon :icon="closeOutline"></ion-icon>
            </button>
          </div>
          <div class="mobile-menu-items">
            <!-- Imposition Type -->
            <div class="mobile-menu-item">
              <button class="mobile-menu-button" :class="{ 'active': selectedType !== null && selectedType !== '' && selectedType !== 'merge' && selectedType !== 'convert' }" @click="toggleDropdown('type')">
                <ion-icon :icon="gridOutline"></ion-icon>
                <span>{{ selectedTypeLabel }}</span>
                <ion-icon :icon="chevronDownOutline" class="chevron" :class="{ 'rotated': activeDropdown === 'type' }"></ion-icon>
              </button>
              <div v-if="activeDropdown === 'type'" class="mobile-submenu">
                <button
                  v-for="option in impositionTypes"
                  :key="option.value"
                  class="mobile-submenu-item"
                  :class="{ active: selectedType === option.value }"
                  @click="selectType(option.value); closeMobileMenu()"
                >
                  <strong>{{ option.label }}</strong>
                  <small>{{ option.description }}</small>
                </button>
              </div>
            </div>

            <!-- Merge PDFs -->
            <div class="mobile-menu-item">
              <button 
                class="mobile-menu-button" 
                :class="{ 'active': selectedType === 'merge' }"
                @click="selectType('merge'); closeMobileMenu()"
              >
                <ion-icon :icon="documentAttachOutline"></ion-icon>
                <span>Merge PDFs</span>
              </button>
            </div>

            <!-- Convert to PDF -->
            <div class="mobile-menu-item">
              <button 
                class="mobile-menu-button" 
                :class="{ 'active': selectedType === 'convert' }"
                @click="selectType('convert'); closeMobileMenu()"
              >
                <ion-icon :icon="swapHorizontalOutline"></ion-icon>
                <span>Convert to PDF</span>
              </button>
            </div>

            <!-- Export -->
            <div class="mobile-menu-item">
              <button class="mobile-menu-button" :class="{ 'active': exportFormat !== null }" @click="toggleDropdown('export')">
                <ion-icon :icon="downloadOutline"></ion-icon>
                <span>{{ exportFormatLabel }}</span>
                <ion-icon :icon="chevronDownOutline" class="chevron" :class="{ 'rotated': activeDropdown === 'export' }"></ion-icon>
              </button>
              <div v-if="activeDropdown === 'export'" class="mobile-submenu">
                <div class="mobile-submenu-item" @click="selectExportFormat('jpeg'); closeMobileMenu()">
                  <span>PDF to JPEG</span>
                  <ion-icon v-if="exportFormat === 'jpeg'" :icon="checkmarkCircleOutline" color="primary"></ion-icon>
                </div>
                <div class="mobile-submenu-item" @click="selectExportFormat('png'); closeMobileMenu()">
                  <span>PDF to PNG</span>
                  <ion-icon v-if="exportFormat === 'png'" :icon="checkmarkCircleOutline" color="primary"></ion-icon>
                </div>
                <div class="mobile-submenu-item" @click="selectExportFormat('doc'); closeMobileMenu()">
                  <span>PDF to Doc</span>
                  <ion-icon v-if="exportFormat === 'doc'" :icon="checkmarkCircleOutline" color="primary"></ion-icon>
                </div>
              </div>
            </div>

            <!-- Options -->
            <div class="mobile-menu-item" :class="{ 'disabled': isMergePDFsSelected }">
              <button class="mobile-menu-button" :disabled="isMergePDFsSelected" @click="!isMergePDFsSelected && toggleDropdown('options')">
                <ion-icon :icon="optionsOutline"></ion-icon>
                <span>Options</span>
                <ion-icon :icon="chevronDownOutline" class="chevron" :class="{ 'rotated': activeDropdown === 'options' }"></ion-icon>
              </button>
              <div v-if="activeDropdown === 'options'" class="mobile-submenu">
                <label class="mobile-submenu-item toggle-item" :class="{ 'disabled-item': isMergePDFsSelected }" @click="!isMergePDFsSelected && (addBlankPages = !addBlankPages)">
                  <span>Blank page padding</span>
                  <ion-toggle
                    v-model="addBlankPages"
                    color="primary"
                    :disabled="isMergePDFsSelected"
                    @click.stop
                  ></ion-toggle>
                </label>
                <label class="mobile-submenu-item toggle-item" :class="{ 'disabled-item': isMergePDFsSelected }" @click="!isMergePDFsSelected && (addCropMarks = !addCropMarks)">
                  <span>Crop marks</span>
                  <ion-toggle
                    v-model="addCropMarks"
                    color="primary"
                    :disabled="isMergePDFsSelected"
                    @click.stop
                  ></ion-toggle>
                </label>
              </div>
            </div>

            <!-- Rotation -->
            <div class="mobile-menu-item" :class="{ 'disabled': isMergePDFsSelected }">
              <button class="mobile-menu-button" :disabled="isMergePDFsSelected" @click="!isMergePDFsSelected && toggleDropdown('rotation')">
                <ion-icon :icon="reloadOutline"></ion-icon>
                <span>Rotation</span>
                <ion-icon :icon="chevronDownOutline" class="chevron" :class="{ 'rotated': activeDropdown === 'rotation' }"></ion-icon>
              </button>
              <div v-if="activeDropdown === 'rotation'" class="mobile-submenu">
                <label class="mobile-submenu-item toggle-item" @click="selectRotation(0)">
                  <span>0°</span>
                  <ion-toggle
                    :checked="rotationAngle === 0"
                    color="primary"
                    @ion-change="(e) => { if (e.detail.checked) selectRotation(0); }"
                    @click.stop
                  ></ion-toggle>
                </label>
                <label class="mobile-submenu-item toggle-item" @click="selectRotation(180, 'top')">
                  <span>Top 180°</span>
                  <ion-toggle
                    :checked="rotationAngle === 180 && rotationType === 'top'"
                    color="primary"
                    @ion-change="(e) => { if (e.detail.checked) selectRotation(180, 'top'); }"
                    @click.stop
                  ></ion-toggle>
                </label>
                <label class="mobile-submenu-item toggle-item" @click="selectRotation(180, 'bottom')">
                  <span>Bottom 180°</span>
                  <ion-toggle
                    :checked="rotationAngle === 180 && rotationType === 'bottom'"
                    color="primary"
                    @ion-change="(e) => { if (e.detail.checked) selectRotation(180, 'bottom'); }"
                    @click.stop
                  ></ion-toggle>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <ion-content fullscreen class="imposition-content">
      <div class="main-container">
        <div class="split-layout">
          <!-- Left Panel: Upload -->
          <div class="panel left-panel" :class="{ 'hide-on-mobile': isSubmitting || previewUrl }">
            <div class="panel-header">
              <div class="header-icon">
                <ion-icon :icon="cloudUploadOutline"></ion-icon>
              </div>
              <div class="header-content">
                <h2>Upload Files</h2>
                <p>Drag & drop or click to upload your PDFs and images</p>
              </div>
            </div>
            <div class="panel-body">
              <div
                class="drop-zone-modern"
                :class="{ dragging: isDragging, 'has-files': files.length > 0 }"
                @dragover.prevent="onDragOver"
                @dragleave="onDragLeave"
                @drop.prevent="onDrop"
              >
                  <!-- Upload Interface (shown when no files) -->
                  <div v-if="files.length === 0" class="upload-interface">
                    <div class="upload-icon-wrapper">
                      <div class="upload-icon-bg"></div>
                      <div class="upload-icon-orbit">
                        <div class="orbit-dot orbit-dot-1"></div>
                        <div class="orbit-dot orbit-dot-2"></div>
                        <div class="orbit-dot orbit-dot-3"></div>
                      </div>
                      <ion-icon :icon="cloudUploadOutline" class="upload-icon"></ion-icon>
                    </div>
                    <div class="upload-text">
                      <h3>Drag & Drop Files Here</h3>
                      <p class="upload-hint">Max <strong>500MB</strong> per file • Multiple files supported</p>
                    </div>
                    <div class="upload-actions">
                      <ion-button fill="solid" color="primary" @click="openFilePicker" class="browse-btn">
                        <ion-icon :icon="folderOpenOutline" slot="start"></ion-icon>
                        Upload Files
                      </ion-button>
                      <div class="drag-indicator">
                        <div class="drag-arrow">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L8 6h3v6h2V6h3l-4-4zm0 20l4-4h-3v-6h-2v6H8l4 4z"/>
                          </svg>
                        </div>
                        <span>or drag files here</span>
                      </div>
                    </div>
                    <div class="supported-formats">
                      <div class="format-group">
                        <span class="format-title">Images</span>
                        <div class="format-badges">
                          <span class="format-badge image">JPEG</span>
                          <span class="format-badge image">PNG</span>
                          <span class="format-badge image">GIF</span>
                          <span class="format-badge image">WEBP</span>
                          <span class="format-badge image">BMP</span>
                          <span class="format-badge image">TIFF</span>
                        </div>
                      </div>
                      <div class="format-group">
                        <span class="format-title">Documents</span>
                        <div class="format-badges">
                          <span class="format-badge document">PDF</span>
                          <span class="format-badge document">DOCX</span>
                          <span class="format-badge document">TXT</span>
                        </div>
                      </div>
                      <div class="format-group">
                        <span class="format-title">Office (Coming Soon)</span>
                        <div class="format-badges">
                          <span class="format-badge document" style="opacity: 0.5;">PPTX</span>
                          <span class="format-badge document" style="opacity: 0.5;">XLSX</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- File Preview Interface (shown when files exist) -->
                  <div v-else class="file-preview-interface">
                    <div class="file-header">
                      <div class="file-count">
                        <span class="count-number">{{ files.length }}</span>
                        <span class="count-label">file{{ files.length > 1 ? 's' : '' }} ready</span>
                      </div>
                      <div class="header-actions">
                        <ion-button fill="outline" size="small" color="primary" @click="openFilePicker" class="add-more-btn">
                          <ion-icon :icon="addOutline" slot="start"></ion-icon>
                          Add More
                        </ion-button>
                      </div>
                    </div>
                    
                    <div class="file-items-grid">
                      <div 
                        v-for="(file, index) in files" 
                        :key="index"
                        class="file-card"
                        draggable="true"
                        @dragstart="onFileDragStart($event, index)"
                        @dragover.prevent="onFileDragOver($event, index)"
                        @dragenter.prevent="onFileDragEnter($event, index)"
                        @dragleave="onFileDragLeave($event, index)"
                        @drop.prevent="onFileDrop($event, index)"
                        @dragend="onFileDragEnd"
                        :class="{ 'dragging-file': draggedFileIndex === index, 'drag-over': dragOverFileIndex === index }"
                      >
                        <div class="file-card-header">
                          <div class="file-index">{{ index + 1 }}</div>
                          <div class="drag-handle" v-if="files.length > 1">
                            <ion-icon :icon="reorderThreeOutline"></ion-icon>
                          </div>
                          <div style="flex: 1;"></div>
                          <ion-button 
                            fill="clear" 
                            size="small" 
                            color="danger"
                            @click="removeFile(index)"
                            class="remove-btn-compact"
                          >
                            <ion-icon :icon="trashOutline"></ion-icon>
                          </ion-button>
                        </div>
                        
                        <div class="file-preview-area">
                          <div v-if="filePreviews[index]?.type === 'image'" class="image-preview">
                            <img :src="filePreviews[index].url" :alt="file.name" />
                            <div class="file-type-badge image">IMAGE</div>
                          </div>
                          <div v-if="filePreviews[index]?.type === 'image'" class="image-label">Image Document</div>
                          <div v-else-if="file.type === 'application/pdf'" class="pdf-preview">
                            <div class="pdf-icon-large">
                              <ion-icon :icon="documentTextOutline"></ion-icon>
                              <div class="file-type-badge pdf">PDF</div>
                            </div>
                            <div class="pdf-info">
                              <div class="pdf-pages">PDF Document</div>
                            </div>
                          </div>
                          <div v-else class="document-preview">
                            <div class="document-icon" :class="getFileTypeClass(file.type)">
                              <ion-icon :icon="documentTextOutline"></ion-icon>
                            </div>
                            <div class="file-type-badge" :class="getFileTypeClass(file.type)">{{ getShortFileType(file.type) }}</div>
                            <div class="document-info">
                              <div class="document-label">{{ getDocumentTypeName(file.type) }}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div class="file-card-footer" :class="getFileTypeClass(file.type)">
                          <div class="file-name" :title="file.name">{{ file.name }}</div>
                          <div class="file-size">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <input
                    ref="fileInput"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.tiff,.bmp,.webp,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,image/*"
                    hidden
                    @change="onFileChange"
                  />
                </div>
                
                <!-- Success/Error Messages -->
                <div v-if="fileError" class="message error-message">
                  <div class="message-icon">
                    <ion-icon :icon="alertCircleOutline"></ion-icon>
                  </div>
                  <div class="message-content">{{ fileError }}</div>
                </div>
            </div>
          </div>

          <!-- Right Panel: Preview & Download -->
          <div class="panel right-panel" :class="{ 'show-mobile': isSubmitting || previewUrl }">
            <div class="panel-header">
              <div class="header-icon">
                <ion-icon :icon="documentTextOutline"></ion-icon>
              </div>
              <div class="header-content">
                <h2>Preview & Download</h2>
                <p>View your generated imposition and download the result</p>
              </div>
            </div>
            <div class="panel-body">
                <div v-if="isSubmitting" class="status processing">
                  <div class="processing-animation">
                    <div class="processing-circle">
                      <div class="processing-dot processing-dot-1"></div>
                      <div class="processing-dot processing-dot-2"></div>
                      <div class="processing-dot processing-dot-3"></div>
                      <div class="processing-dot processing-dot-4"></div>
                    </div>
                    <div class="processing-files">
                      <div class="file-icon processing-file-1">
                        <ion-icon :icon="documentTextOutline"></ion-icon>
                      </div>
                      <div class="file-icon processing-file-2">
                        <ion-icon :icon="imageOutline"></ion-icon>
                      </div>
                      <div class="processing-arrow">
                        <div class="arrow-part arrow-1"></div>
                        <div class="arrow-part arrow-2"></div>
                        <div class="arrow-part arrow-3"></div>
                      </div>
                      <div class="output-icon">
                        <ion-icon :icon="documentOutline"></ion-icon>
                      </div>
                    </div>
                  </div>
                  <div class="status-content">
                    <h3>Processing Your Files</h3>
                    <p class="processing-text">Generating your PDF imposition...</p>
                    <div class="processing-stages">
                      <div class="stage-item active">
                        <div class="stage-dot"></div>
                        <span>Reading files</span>
                      </div>
                      <div class="stage-item">
                        <div class="stage-dot"></div>
                        <span>Optimizing layout</span>
                      </div>
                      <div class="stage-item">
                        <div class="stage-dot"></div>
                        <span>Generating PDF</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else-if="errorMessage" class="status error">
                  <ion-icon :icon="warningOutline"></ion-icon>
                  <div class="status-content">
                    <h3>Generation Failed</h3>
                    <p>{{ errorMessage }}</p>
                  </div>
                </div>

                <div v-else-if="previewUrl" class="preview-container">
                  <div class="preview-header">
                    <div class="preview-title-container">
                      <h4>{{ previewType === 'image' ? 'Generated Image Preview' : previewType === 'doc' ? 'Document Generated' : 'Generated PDF Preview' }}</h4>
                      <span class="preview-subtitle" style="color: #10b981;">✓ Preview Ready</span>
                    </div>
                    <div class="preview-actions">
                      <ion-button 
                        v-if="previewType !== 'doc'"
                        fill="solid" 
                        size="small" 
                        color="success"
                        class="preview-action-btn"
                        @click="openPreview"
                      >
                        <ion-icon :icon="openOutline" slot="start"></ion-icon>
                        Open
                      </ion-button>
                      <ion-button 
                        v-if="downloadUrl"
                        fill="solid" 
                        size="small" 
                        class="preview-action-btn"
                        @click="downloadFile"
                      >
                        <ion-icon :icon="downloadOutline" slot="start"></ion-icon>
                        Download
                      </ion-button>
                    </div>
                  </div>
                  <div class="preview-frame" style="border: 3px solid green;">
                    <!-- PDF Preview -->
                    <iframe 
                      v-if="previewType === 'pdf'"
                      :src="previewUrl" 
                      title="Generated PDF Preview" 
                      class="preview-iframe"
                      style="display: block; min-height: 600px;"
                      @load="() => console.log('✅ PDF iframe loaded')"
                      @error="(e) => console.error('❌ PDF iframe error:', e)"
                    ></iframe>
                    
                    <!-- Image Preview -->
                    <div v-else-if="previewType === 'image'" class="image-preview-large">
                      <div class="preview-image-wrapper">
                        <img :src="previewUrl" alt="Generated Image" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />
                      </div>
                      <div class="preview-overlay-badge">
                        <ion-icon :icon="imagesOutline"></ion-icon>
                        <span>{{ exportFormat === 'jpeg' ? 'JPEG' : 'PNG' }} Image</span>
                      </div>
                    </div>
                    
                    <!-- DOC File Preview Placeholder -->
                    <div v-else-if="previewType === 'doc'" class="file-preview-placeholder">
                      <div class="placeholder-icon-wrapper">
                        <ion-icon :icon="documentTextOutline" style="font-size: 64px;"></ion-icon>
                      </div>
                      <h4 style="margin: 16px 0 8px;">Word Document Generated</h4>
                      <p class="placeholder-description">The document has been converted to Word format (RTF).</p>
                      <p class="placeholder-description">Click the Download button above to save the file.</p>
                      <div class="file-size-badge" style="margin-top: 16px;">
                        <ion-icon :icon="documentOutline"></ion-icon>
                        <span>RTF Document</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else-if="files.length > 0" class="file-preview-container">
                  <div class="preview-header">
                    <div class="file-info-inline">
                      <div class="file-name-display">
                        <ion-icon :icon="documentTextOutline" class="file-icon-small"></ion-icon>
                        <span>{{ files[currentFileIndex]?.name }}</span>
                      </div>
                      <div class="file-meta">
                        <span class="meta-item">{{ (files[currentFileIndex]?.size / 1024 / 1024).toFixed(2) }} MB</span>
                        <span class="meta-divider">•</span>
                        <span class="meta-item">{{ getShortFileType(files[currentFileIndex]?.type) }}</span>
                      </div>
                    </div>
                    <div class="preview-actions">
                      <ion-button 
                        v-if="files.length > 1"
                        fill="clear" 
                        size="small"
                        class="nav-btn"
                        :disabled="currentFileIndex === 0"
                        @click="previousFile"
                      >
                        <ion-icon :icon="chevronBackOutline"></ion-icon>
                      </ion-button>
                      <div class="file-badge" v-if="files.length > 1">
                        <span class="current">{{ currentFileIndex + 1 }}</span>
                        <span class="separator">/</span>
                        <span class="total">{{ files.length }}</span>
                      </div>
                      <ion-button 
                        v-if="files.length > 1"
                        fill="clear" 
                        size="small"
                        class="nav-btn"
                        :disabled="currentFileIndex === files.length - 1"
                        @click="nextFile"
                      >
                        <ion-icon :icon="chevronForwardOutline"></ion-icon>
                      </ion-button>
                      <ion-button 
                        v-if="currentFilePreview"
                        fill="clear" 
                        size="small" 
                        class="preview-action-btn"
                        @click="openCurrentFilePreview"
                      >
                        <ion-icon :icon="openOutline" slot="start"></ion-icon>
                        Open
                      </ion-button>
                    </div>
                  </div>
                  
                  <!-- Preview Frame -->
                  <div class="preview-frame">
                    <div class="preview-container">
                      <div v-if="currentFilePreview?.type === 'image'" class="image-preview-large">
                        <div class="preview-image-wrapper">
                          <img :src="currentFilePreview.url" :alt="files[currentFileIndex]?.name" />
                        </div>
                        <div class="preview-overlay-badge">
                          <ion-icon :icon="imagesOutline"></ion-icon>
                          <span>Image Preview</span>
                        </div>
                      </div>
                      <div v-else-if="currentFilePreview?.type === 'pdf'" class="pdf-preview-container">
                        <iframe 
                          :src="currentFilePreview.url" 
                          title="PDF Preview" 
                          class="preview-iframe"
                        ></iframe>
                      </div>
                      <div v-else class="file-preview-placeholder">
                        <div class="placeholder-icon-wrapper">
                          <ion-icon :icon="documentOutline"></ion-icon>
                        </div>
                        <h4>{{ getShortFileType(files[currentFileIndex]?.type) }} File</h4>
                        <p class="placeholder-description">Preview not available for this file type</p>
                        <div class="file-size-badge">
                          <ion-icon :icon="serverOutline"></ion-icon>
                          <span>{{ (files[currentFileIndex]?.size / 1024 / 1024).toFixed(2) }} MB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="empty-state">
                  <ion-icon :icon="documentOutline"></ion-icon>
                  <h3>No files uploaded</h3>
                  <p>Upload files above to see the preview here, then generate an imposition.</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- Page Count Dialog -->
    <ion-alert
      :is-open="showPageCountDialog"
      header="Set Sheet Count"
      :message="`How many sheets do you want for ${impositionTypes.find(t => t.value === pendingImpositionType)?.label || 'this imposition'}?`"
      :buttons="[
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'confirm',
        },
      ]"
      :inputs="[
        {
          name: 'pageCount',
          type: 'number',
          placeholder: 'Enter number of sheets (1-10)',
          min: 1,
          max: 10,
        },
      ]"
      @didDismiss="handleDialogDismiss"
    ></ion-alert>

    <!-- Options Dropdown (Teleported outside parent container) -->
    <Teleport to="body">
      <div v-if="activeDropdown === 'options'" class="dropdown-menu options-dropdown-teleport" :style="optionsDropdownStyle" @click.stop @mouseenter="openDropdown('options')" @mouseleave="closeDropdown">
        <!-- Other Options -->
        <label class="dropdown-item toggle-item" :class="{ 'disabled-item': isMergePDFsSelected }" style="padding: 10px 12px;" @mouseenter="closeSubmenuImmediately">
          <span style="min-width: 130px;">Blank page padding</span>
          <ion-toggle
            v-model="addBlankPages"
            color="primary"
            :disabled="isMergePDFsSelected"
          ></ion-toggle>
        </label>
        <label class="dropdown-item toggle-item" :class="{ 'disabled-item': isMergePDFsSelected }" style="padding: 10px 12px;" @mouseenter="closeSubmenuImmediately">
          <span style="min-width: 130px;">Crop marks</span>
          <ion-toggle
            v-model="addCropMarks"
            color="primary"
            :disabled="isMergePDFsSelected"
          ></ion-toggle>
        </label>
      </div>
    </Teleport>

  </ion-page>
</template>

<script setup>
import { onBeforeUnmount, ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonNote,
  IonToggle,
  IonSpinner,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel,
  IonInput,
  IonAlert,
} from '@ionic/vue';
import { backendApi } from '@/services/api/backendApi.js';
import {
  cloudUploadOutline,
  documentOutline,
  downloadOutline,
  refreshOutline,
  warningOutline,
  gridOutline,
  documentTextOutline,
  documentAttachOutline,
  checkmarkCircleOutline,
  reorderThreeOutline,
  phonePortraitOutline,
  copyOutline,
  optionsOutline,
  chevronDownOutline,
  closeOutline,
  openOutline,
  chevronBackOutline,
  chevronForwardOutline,
  reloadOutline,
  folderOpenOutline,
  addOutline,
  trashOutline,
  alertCircleOutline,
  imageOutline,
  imagesOutline,
  swapHorizontalOutline,
  menuOutline,
  arrowBackOutline,
} from 'ionicons/icons';

// Page count dialog state
const showPageCountDialog = ref(false);
const pendingImpositionType = ref(null);
const requestedPageCount = ref('');

// Router instance
const router = useRouter();

const impositionTypes = [
  {
    value: 'booklet',
    label: 'Booklet',
    description: 'Arrange spreads for saddle-stitch booklets',
  },
  {
    value: '2up',
    label: '2-Up',
    description: 'Place two pages per sheet for duplex printing',
  },
  {
    value: '2-side',
    label: '2-side',
    description: 'Front and back pages arranged for double-sided print.',
  },
  {
    value: 'tent-card',
    label: 'Tent-Card',
    description: 'A sheet printed on both sides, folded to stand like a tent.',
  },
  {
    value: 'tri-fold-brochure',
    label: 'Tri-Fold Brochure',
    description: 'Sheet divided into 3 panels and folded.',
  },
  {
    value: 'tri-fold-pamphlet',
    label: 'Tri-Fold Pamphlet',
    description: 'Standard tri-fold with specific panel arrangement.',
  },
  {
    value: '4up',
    label: '4-Up',
    description: 'Impose four mini pages per sheet',
  },
  {
    value: 'side-fold-card',
    label: 'Side-Fold Card',
    description: 'Fold on the long edge.',
  },
  {
    value: '8-up-perfect-bound-sheetwise',
    label: '8-up Perfect Bound Sheetwise',
    description: 'Eight pages imposed sheetwise for perfect binding.',
  },
  {
    value: '8-up-perfect-bound-work-turn',
    label: '8-up Perfect Bound Work & Turn',
    description: 'Print, turn on same grip, print again.',
  },
  {
    value: '8-up-perfect-bound-work-tumble',
    label: '8-up Perfect Bound Work & Tumble',
    description: 'Print, flip head-to-tail, print again.',
  },
  {
    value: '8-up-center-stitch-sheetwise',
    label: '8-up Center Stitch Sheetwise',
    description: 'Eight pages imposed sheetwise for center stitching.',
  },
  {
    value: '8-up-center-stitch-work-turn',
    label: '8-up Center Stitch Work & Turn',
    description: 'Center stitch with work & turn printing.',
  },
  {
    value: '8-up-center-stitch-work-tumble',
    label: '8-up Center Stitch Work & Tumble',
    description: 'Center stitch with work & tumble printing.',
  },
  {
    value: 'signature',
    label: 'Signature Imposition',
    description: 'Create printer signatures (4, 8, 16, or 32-page folded sections).',
  },
];

const pageSizes = [
  { value: 'auto', label: 'Auto (fit to content)' },
  { value: 'A4', label: 'A4 (210 × 297 mm)' },
  { value: 'A3', label: 'A3 (297 × 420 mm)' },
  { value: 'A2', label: 'A2 (420 × 594 mm)' },
  { value: 'A1', label: 'A1 (594 × 841 mm)' },
  { value: 'A0', label: 'A0 (841 × 1189 mm)' },
];

const fileInput = ref(null);
const file = ref(null); // Keep for backward compatibility
const files = ref([]); // New: array of files
const filePreviews = ref([]); // Stores preview URLs for all files
const draggedFileIndex = ref(null); // Track which file is being dragged
const dragOverFileIndex = ref(null); // Track which position is being hovered
const currentFileIndex = ref(0); // Current file being previewed
const isDragging = ref(false);
const fileError = ref('');
const successMessage = ref('');
const errorMessage = ref('');
const isSubmitting = ref(false);
const previewUrl = ref('');
const downloadUrl = ref('');
const processingTime = ref(0);
const previewType = ref('pdf'); // 'pdf', 'image', 'doc'
const previewFileType = ref(''); // Specific mime type

const selectedType = ref('booklet');
const pageSizeValue = ref('auto');
const orientation = ref('portrait');
const autoDetectOrientation = ref(true);
const duplex = ref('long-edge');
const addBlankPages = ref(false);
const rotationAngle = ref(0); // New: rotation control for imposition
const rotationType = ref(null); // 'top', 'bottom', or null
const addCropMarks = ref(false);
const customSizeEnabled = ref(false);
const customWidth = ref('');
const customHeight = ref('');

// Dropdown navigation state
const activeDropdown = ref(null);
const expandedOptionSection = ref(null);
const optionsButton = ref(null);
const sizeButton = ref(null);
const orientationButton = ref(null);
const exportButton = ref(null);

// Export format state
const exportFormat = ref(null); // null, 'jpeg', or 'png'

// Mobile hamburger menu state
const showMobileMenu = ref(false);

// Computed style for positioning the teleported dropdown
const optionsDropdownStyle = computed(() => {
  if (!optionsButton.value) return {};
  const rect = optionsButton.value.getBoundingClientRect();
  return {
    position: 'fixed',
    top: `${rect.bottom + 8}px`,
    left: `${rect.left}px`,
    zIndex: 99999
  };
});

// Computed style for Export dropdown
const exportDropdownStyle = computed(() => {
  if (!exportButton.value) return {};
  const rect = exportButton.value.getBoundingClientRect();
  return {
    position: 'fixed',
    top: `${rect.bottom + 8}px`,
    left: `${rect.left}px`,
    zIndex: 99999
  };
});

// Computed style for Size submenu
const sizeSubmenuStyle = computed(() => {
  if (!sizeButton.value) return {};
  const rect = sizeButton.value.getBoundingClientRect();
  return {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.right + 9}px`,
    zIndex: 100000
  };
});

// Computed style for Orientation submenu
const orientationSubmenuStyle = computed(() => {
  if (!orientationButton.value) return {};
  const rect = orientationButton.value.getBoundingClientRect();
  return {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.right + 9}px`,
    zIndex: 100000
  };
});

const validationWarning = ref('');

const canSubmit = computed(() => files.value.length > 0 && !isSubmitting.value && !validationWarning.value);
const canReset = computed(() => files.value.length > 0 || previewUrl.value || downloadUrl.value || successMessage.value || errorMessage.value);

// Computed labels for navigation
const selectedTypeLabel = computed(() => {
  const selected = impositionTypes.find(t => t.value === selectedType.value);
  return selected ? selected.label : 'Select Type';
});

const exportFormatLabel = computed(() => {
  switch (exportFormat.value) {
    case 'jpeg': return 'PDF to JPEG';
    case 'png': return 'PDF to PNG';
    case 'doc': return 'PDF to Doc';
    default: return 'Convert from PDF';
  }
});

const pageSizeLabel = computed(() => {
  if (customSizeEnabled.value) {
    return 'Custom Size';
  }
  const selected = pageSizes.find(s => s.value === pageSizeValue.value);
  return selected ? selected.label.split('(')[0].trim() : 'Select Size';
});

const duplexLabel = computed(() => {
  const labels = {
    'long-edge': 'Long-edge',
    'short-edge': 'Short-edge',
    'simplex': 'Single-sided'
  };
  return labels[duplex.value] || 'Duplex';
});

const rotationLabel = computed(() => {
  switch (rotationAngle.value) {
    case 0: return 'No rotation';
    case 90: return '90°';
    case 180: return '180°';
    case 270: return '270°';
    default: return `${rotationAngle.value}°`;
  }
});

// Check if Merge PDFs or Convert is selected, or any export format is selected (to disable options and rotation)
const isMergePDFsSelected = computed(() => {
  return selectedType.value === 'merge' || selectedType.value === 'convert' || exportFormat.value !== null;
});

// Computed property for current file preview
const currentFilePreview = computed(() => {
  if (files.value.length === 0 || currentFileIndex.value >= filePreviews.value.length) {
    return null;
  }
  return filePreviews.value[currentFileIndex.value];
});

// Navigation function
function goBack() {
  router.push('/home'); // Navigate to home page
}

function createPreview(selectedFile) {
  if (selectedFile.type.startsWith('image/')) {
    return {
      type: 'image',
      url: URL.createObjectURL(selectedFile),
    };
  }

  if (selectedFile.type === 'application/pdf') {
    return {
      type: 'pdf',
      url: URL.createObjectURL(selectedFile),
    };
  }

  return {
    type: 'generic',
    url: '',
  };
}

function revokePreview(preview) {
  if (preview?.url) {
    URL.revokeObjectURL(preview.url);
  }
}

function clearPreviews() {
  filePreviews.value.forEach(revokePreview);
  filePreviews.value = [];
}

watch(customSizeEnabled, (enabled) => {
  if (enabled) {
    validationWarning.value = validateCustomSize();
  } else {
    customWidth.value = '';
    customHeight.value = '';
    validationWarning.value = '';
  }
});

watch([customWidth, customHeight], () => {
  if (customSizeEnabled.value) {
    validationWarning.value = validateCustomSize();
  }
});

watch(autoDetectOrientation, (enabled) => {
  if (enabled && files.value.length > 0) {
    detectOrientation(files.value[0]);
  }
});

watch(orientation, (_newVal, _oldVal) => {
  // Orientation changed - no action needed
});

// Dropdown navigation methods
let hoverTimeout = null;

function openDropdown(dropdown) {
  if (hoverTimeout) clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(() => {
    activeDropdown.value = dropdown;
  }, 150);
}

function closeDropdown() {
  if (hoverTimeout) clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(() => {
    activeDropdown.value = null;
    expandedOptionSection.value = null;
  }, 300);
}

function toggleDropdown(dropdown) {
  if (activeDropdown.value === dropdown) {
    activeDropdown.value = null;
    expandedOptionSection.value = null;
  } else {
    activeDropdown.value = dropdown;
    expandedOptionSection.value = null;
  }
}

function toggleOptionSection(section) {
  if (expandedOptionSection.value === section) {
    expandedOptionSection.value = null;
  } else {
    expandedOptionSection.value = section;
  }
}

let submenuTimeout = null;

function openSubmenu(section) {
  if (submenuTimeout) clearTimeout(submenuTimeout);
  expandedOptionSection.value = section;
}

function delayedCloseSubmenu() {
  if (submenuTimeout) clearTimeout(submenuTimeout);
  submenuTimeout = setTimeout(() => {
    expandedOptionSection.value = null;
  }, 200);
}

function closeSubmenuImmediately() {
  if (submenuTimeout) clearTimeout(submenuTimeout);
  expandedOptionSection.value = null;
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value;
}

function closeMobileMenu() {
  showMobileMenu.value = false;
}

// Toggle export format (mutually exclusive)
function selectExportFormat(format) {
  exportFormat.value = format;
  
  // Reset all other selections when export format is selected
  selectedType.value = null;
  rotationAngle.value = 0;
  rotationType.value = null;
  addBlankPages.value = false;
  addCropMarks.value = false;
  customSizeEnabled.value = false;
  autoDetectOrientation.value = true;
  
  // Close dropdown after selection
  activeDropdown.value = null;
}

function keepSubmenuOpen() {
  if (submenuTimeout) clearTimeout(submenuTimeout);
  if (hoverTimeout) clearTimeout(hoverTimeout);
}

function closeSubmenu() {
  if (submenuTimeout) clearTimeout(submenuTimeout);
  submenuTimeout = setTimeout(() => {
    expandedOptionSection.value = null;
    // After submenu closes, also close the main Options dropdown
    if (hoverTimeout) clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
      activeDropdown.value = null;
    }, 100);
  }, 300);
}

function selectType(value) {
  // Reset export format when any type is selected
  exportFormat.value = null;
  
  // Only show page count dialog for signature imposition
  if (value === 'signature') {
    pendingImpositionType.value = value;
    showPageCountDialog.value = true;
  } else {
    selectedType.value = value;
    
    // For convert type, accept image files
    if (value === 'convert') {
      console.log('Convert to PDF mode activated - accepting image files');
    }
  }
}

function confirmPageCount() {
  selectedType.value = pendingImpositionType.value;
  showPageCountDialog.value = false;
  
  // Store the page count for use during PDF generation
  if (requestedPageCount.value) {
    console.log(`Imposition type: ${selectedType.value}, Requested pages: ${requestedPageCount.value}`);
  }
}

function handleDialogDismiss(e) {
  console.log('🔔 Dialog dismissed:', e.detail);
  if (e.detail.role === 'confirm' && e.detail.data?.values?.pageCount) {
    const sheetCount = parseInt(e.detail.data.values.pageCount);
    // Validate sheet count (1-10)
    if (sheetCount < 1 || sheetCount > 10) {
      console.log('❌ Invalid sheet count:', sheetCount);
      cancelPageCount();
      return;
    }
    // Convert sheets to pages (1 sheet = 4 pages)
    const pageCount = sheetCount * 4;
    requestedPageCount.value = String(pageCount);
    console.log(`✅ Set ${sheetCount} sheet(s) = ${pageCount} pages`);
    confirmPageCount();
  } else {
    console.log('❌ Dialog cancelled or no value');
    cancelPageCount();
  }
}

function cancelPageCount() {
  showPageCountDialog.value = false;
  requestedPageCount.value = '';
  pendingImpositionType.value = null;
}

// Helper function to get short file type names
function getShortFileType(mimeType) {
  if (!mimeType) return 'FILE';
  
  const typeMap = {
    'application/pdf': 'PDF',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
    'application/vnd.ms-powerpoint': 'PPT',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    'application/vnd.ms-excel': 'XLS',
    'text/plain': 'TXT',
    'image/jpeg': 'JPG',
    'image/jpg': 'JPG',
    'image/png': 'PNG',
    'image/gif': 'GIF',
    'image/tiff': 'TIFF',
    'image/bmp': 'BMP',
    'image/webp': 'WEBP'
  };
  
  return typeMap[mimeType.toLowerCase()] || mimeType.split('/')[1]?.toUpperCase() || 'FILE';
}

// Helper function to get CSS class based on file type
function getFileTypeClass(mimeType) {
  if (!mimeType) return 'document';
  
  const lowerType = mimeType.toLowerCase();
  
  if (lowerType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return 'docx';
  } else if (lowerType === 'application/msword') {
    return 'doc';
  } else if (lowerType === 'application/pdf') {
    return 'pdf';
  } else if (lowerType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    return 'pptx';
  } else if (lowerType === 'application/vnd.ms-powerpoint') {
    return 'ppt';
  } else if (lowerType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    return 'xlsx';
  } else if (lowerType === 'application/vnd.ms-excel') {
    return 'xls';
  } else if (lowerType === 'text/plain') {
    return 'txt';
  } else if (lowerType.startsWith('image/')) {
    return 'image';
  }
  
  return 'document';
}

// Helper function to get document type name
function getDocumentTypeName(mimeType) {
  if (!mimeType) return 'Document';
  
  const lowerType = mimeType.toLowerCase();
  
  if (lowerType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return 'Word Document';
  } else if (lowerType === 'application/msword') {
    return 'Word Document';
  } else if (lowerType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    return 'PowerPoint Presentation';
  } else if (lowerType === 'application/vnd.ms-powerpoint') {
    return 'PowerPoint Presentation';
  } else if (lowerType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    return 'Excel Spreadsheet';
  } else if (lowerType === 'application/vnd.ms-excel') {
    return 'Excel Spreadsheet';
  } else if (lowerType === 'text/plain') {
    return 'Text File';
  }
  
  return 'Document';
}

function selectPaperSize(value) {
  pageSizeValue.value = value;
  customSizeEnabled.value = false;
}

function selectOrientation(value) {
  orientation.value = value;
  autoDetectOrientation.value = false;
}

function selectDuplex(value) {
  duplex.value = value;
}

function selectRotation(value, type = null) {
  rotationAngle.value = value;
  rotationType.value = type;
}

function openFilePicker() {
  fileInput.value?.click();
}

function onDragOver() {
  isDragging.value = true;
}

function onDragLeave() {
  isDragging.value = false;
}

function onDrop(event) {
  isDragging.value = false;
  if (event.dataTransfer?.files?.length) {
    const droppedFiles = Array.from(event.dataTransfer.files);
    addFiles(droppedFiles);
  }
}

function onFileChange(event) {
  const target = event.target;
  if (target?.files?.length) {
    const selectedFiles = Array.from(target.files);
    addFiles(selectedFiles);
    target.value = '';
  }
}

function addFiles(newFiles) {
  fileError.value = '';
  successMessage.value = '';
  errorMessage.value = '';

  const validFiles = [];
  const errors = [];

  for (const selectedFile of newFiles) {
    // Check file size (500 MB limit)
    if (selectedFile.size > 500 * 1024 * 1024) {
      errors.push(`${selectedFile.name}: exceeds 500 MB limit`);
      continue;
    }

    // Check file type
    const allowed = [
      'application/pdf', 
      'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/tiff', 'image/bmp', 'image/webp',
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/plain'
    ];
    if (!allowed.includes(selectedFile.type.toLowerCase())) {
      errors.push(`${selectedFile.name}: unsupported file type`);
      continue;
    }

    validFiles.push(selectedFile);
  }

  if (errors.length > 0) {
    fileError.value = errors.join(', ');
  }

  if (validFiles.length > 0) {
    // If this is the first upload, reset current file index
    if (files.value.length === 0) {
      currentFileIndex.value = 0;
    }
    
    validFiles.forEach((validFile) => {
      files.value.push(validFile);
      filePreviews.value.push(createPreview(validFile));
    });

    file.value = files.value[0]; // Set first file for backward compatibility
    successMessage.value = `${validFiles.length} file(s) added successfully. Total: ${files.value.length} file(s)`;

    // Auto-detect orientation from first file if enabled
    if (autoDetectOrientation.value && files.value.length > 0) {
      detectOrientation(files.value[0]);
    }
  }
}

// File reordering functions
function onFileDragStart(event, index) {
  draggedFileIndex.value = index;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/html', event.target.innerHTML);
  // Add a subtle opacity to the dragged item
  setTimeout(() => {
    event.target.style.opacity = '0.5';
  }, 0);
}

function onFileDragOver(event, index) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

function onFileDragEnter(event, index) {
  if (draggedFileIndex.value !== null && draggedFileIndex.value !== index) {
    dragOverFileIndex.value = index;
  }
}

function onFileDragLeave(event, index) {
  // Only clear if we're leaving the actual element (not a child)
  if (event.target.classList.contains('file-item-compact')) {
    dragOverFileIndex.value = null;
  }
}

function onFileDrop(event, dropIndex) {
  event.preventDefault();
  const dragIndex = draggedFileIndex.value;
  
  if (dragIndex !== null && dragIndex !== dropIndex) {
    // Reorder files array
    const draggedFile = files.value[dragIndex];
    const draggedPreview = filePreviews.value[dragIndex];
    
    // Remove from old position
    files.value.splice(dragIndex, 1);
    filePreviews.value.splice(dragIndex, 1);
    
    // Insert at new position
    files.value.splice(dropIndex, 0, draggedFile);
    filePreviews.value.splice(dropIndex, 0, draggedPreview);
    
    successMessage.value = `File order updated successfully`;
    setTimeout(() => {
      successMessage.value = '';
    }, 2000);
  }
  
  dragOverFileIndex.value = null;
}

function onFileDragEnd(event) {
  event.target.style.opacity = '1';
  draggedFileIndex.value = null;
  dragOverFileIndex.value = null;
}

function removeFile(index) {
  if (index >= 0 && index < files.value.length) {
    // Revoke preview URL if it's an image
    if (filePreviews.value[index]) {
      revokePreview(filePreviews.value[index]);
    }
    
    // Remove from arrays
    files.value.splice(index, 1);
    filePreviews.value.splice(index, 1);
    
    // Update success message
    if (files.value.length > 0) {
      successMessage.value = `File removed. ${files.value.length} file(s) remaining.`;
      file.value = files.value[0]; // Update backward compatibility reference
    } else {
      successMessage.value = '';
      file.value = null;
    }
    
    // Clear other states if no files remain
    if (files.value.length === 0) {
      fileError.value = '';
      errorMessage.value = '';
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = '';
      }
      downloadUrl.value = '';
    }
  }
}

async function detectOrientation(selectedFile) {
  try {
    if (selectedFile.type.startsWith('image/')) {
      // For images, create an Image element to get dimensions
      const img = new Image();
      const objectUrl = URL.createObjectURL(selectedFile);
      
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        
        if (width > height) {
          orientation.value = 'landscape';
        } else {
          orientation.value = 'portrait';
        }
        
        URL.revokeObjectURL(objectUrl);
        successMessage.value = `Detected ${orientation.value} orientation (${width}×${height}px)`;
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        console.error('Could not detect image dimensions');
        fileError.value = 'Could not read image dimensions';
      };
      
      img.src = objectUrl;
    } else if (selectedFile.type === 'application/pdf') {
      // For PDFs, we'll use a basic heuristic
      // In a production app, you'd use pdf.js or similar library
      // For now, we'll default to portrait for PDFs
      orientation.value = 'portrait';
      successMessage.value = 'PDF detected - orientation set to portrait (can be changed manually)';
    }
  } catch (error) {
    // Could not auto-detect orientation
    fileError.value = 'Orientation detection failed';
  }
}

function validateCustomSize() {
  if (!customSizeEnabled.value) return '';
  if (!customWidth.value || !customHeight.value) {
    return 'Enter both width and height to use a custom page size.';
  }
  if (Number(customWidth.value) <= 0 || Number(customHeight.value) <= 0) {
    return 'Width and height must be positive numbers.';
  }
  return '';
}

async function submitImposition() {
  if (files.value.length === 0 || !canSubmit.value) return;

  const customSizeError = validateCustomSize();
  if (customSizeError) {
    validationWarning.value = customSizeError;
    return;
  }

  const formData = new FormData();
  
  // Append file(s) based on count and type
  if (selectedType.value === 'convert' || exportFormat.value) {
    // Convert and export always use 'files' field (array)
    files.value.forEach((file) => {
      formData.append('files', file);
    });
  } else if (files.value.length === 1) {
    // Single file - use 'file' field for /api/imposition/process
    formData.append('file', files.value[0]);
  } else {
    // Multiple files - use 'files' field for /api/imposition/merge
    files.value.forEach((file) => {
      formData.append('files', file);
    });
  }
  
  formData.append('type', selectedType.value);
  formData.append('orientation', orientation.value);
  formData.append('duplex', duplex.value);
  formData.append('addBlankPages', addBlankPages.value ? 'true' : 'false');
  formData.append('addCropMarks', addCropMarks.value ? 'true' : 'false');
  formData.append('mergeFiles', files.value.length > 1 ? 'true' : 'false');
  formData.append('rotation', rotationAngle.value.toString()); // Add rotation parameter
  if (rotationType.value) {
    formData.append('rotationType', rotationType.value); // Add rotation type (top/bottom)
  }
  
  // Add requested page count if specified (only for signature imposition)
  if (requestedPageCount.value) {
    formData.append('requestedPageCount', requestedPageCount.value.toString());
    console.log('✅ Added requestedPageCount to formData:', requestedPageCount.value);
  }

  if (customSizeEnabled.value) {
    formData.append('pageSize', 'custom');
    formData.append('customWidth', customWidth.value);
    formData.append('customHeight', customHeight.value);
  } else {
    formData.append('pageSize', pageSizeValue.value);
  }

  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  const start = performance.now();

  try {
    // Show processing status
    if (exportFormat.value) {
      successMessage.value = `Converting PDF to ${exportFormat.value.toUpperCase()}...`;
    } else if (selectedType.value === 'convert') {
      successMessage.value = `Converting ${files.value.length} file(s) to PDF...`;
    } else if (files.value.length > 1) {
      successMessage.value = `Processing ${files.value.length} PDFs...`;
    } else {
      successMessage.value = 'Processing PDF...';
    }
    
    // Use the appropriate endpoint based on type and file count
    let blob;
    
    // Handle export format conversions (PDF to JPEG/PNG/DOC)
    if (exportFormat.value) {
      // For PDF to image/doc conversions, we need the export endpoint
      formData.append('exportFormat', exportFormat.value);
      blob = await backendApi.export(formData);
    } else if (selectedType.value === 'convert') {
      // Convert images to PDF
      blob = await backendApi.convert(formData);
    } else if (files.value.length === 1) {
      // Single file imposition
      blob = await backendApi.impose(formData);
    } else {
      // Multiple file merge
      blob = await backendApi.merge(formData);
    }
    
    processingTime.value = Math.round(performance.now() - start);

    // Clean up old preview URL
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
    }
    if (downloadUrl.value && downloadUrl.value !== previewUrl.value) {
      URL.revokeObjectURL(downloadUrl.value);
    }

    // Create new preview URL
    const objectUrl = URL.createObjectURL(blob);
    previewUrl.value = objectUrl;
    downloadUrl.value = objectUrl;
    previewFileType.value = blob.type;
    
    // Detect preview type based on blob MIME type
    if (blob.type.startsWith('image/')) {
      previewType.value = 'image';
    } else if (blob.type === 'application/rtf' || blob.type === 'application/msword' || blob.type.includes('word')) {
      previewType.value = 'doc';
    } else {
      previewType.value = 'pdf';
    }
    
    console.log('✅ File generated successfully:', {
      blobSize: blob.size,
      blobType: blob.type,
      previewType: previewType.value,
      previewUrl: objectUrl,
      processingTime: processingTime.value
    });
    
    // Set appropriate success message based on type
    if (selectedType.value === 'convert') {
      successMessage.value = `Conversion complete in ${processingTime.value}ms. ${files.value.length} file(s) converted to PDF.`;
    } else {
      successMessage.value = `Imposition complete in ${processingTime.value}ms. Preview generated below.`;
    }
  } catch (error) {
    console.error('Error applying imposition:', error);
    
    // Provide better error messages based on error type
    let message = 'Failed to generate imposed PDF.';
    
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      message = `Backend server unavailable. Please ensure the imposition server is running on port 3001.
      
Error: ${error.message}`;
    } else if (error.message.includes('HTTP')) {
      message = `Server error: ${error.message}. Please check the server logs.`;
    } else if (error instanceof Error) {
      message = error.message;
    }
    
    errorMessage.value = message;
  } finally {
    isSubmitting.value = false;
  }
}

function resetForm() {
  file.value = null;
  clearPreviews();
  files.value = [];
  fileError.value = '';
  successMessage.value = '';
  errorMessage.value = '';
  isSubmitting.value = false;
  customSizeEnabled.value = false;
  customWidth.value = '';
  customHeight.value = '';
  selectedType.value = 'booklet';
  pageSizeValue.value = 'auto';
  orientation.value = 'portrait';
  autoDetectOrientation.value = false;
  duplex.value = 'long-edge';
  addBlankPages.value = true;
  addCropMarks.value = false;
  rotationAngle.value = 0; // Reset rotation
  processingTime.value = 0;
  validationWarning.value = '';

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
  }
  downloadUrl.value = '';
}

function openPreview() {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank', 'noopener');
  }
}

function backToUpload() {
  // Clear preview to go back to upload on mobile
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
  }
  downloadUrl.value = '';
  successMessage.value = '';
  errorMessage.value = '';
}

function downloadFile() {
  if (downloadUrl.value) {
    try {
      // Determine file extension based on export format
      let extension = 'pdf';
      let formatLabel = selectedType.value;
      
      if (exportFormat.value === 'jpeg') {
        extension = 'jpg';
        formatLabel = 'jpeg';
      } else if (exportFormat.value === 'png') {
        extension = 'png';
        formatLabel = 'png';
      } else if (exportFormat.value === 'doc') {
        extension = 'doc';
        formatLabel = 'doc';
      }
      
      // Create a temporary download link
      const link = document.createElement('a');
      link.href = downloadUrl.value;
      link.download = `${exportFormat.value ? 'converted' : 'imposed'}-${formatLabel}-${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      successMessage.value = 'Download started successfully!';
      setTimeout(() => {
        if (successMessage.value === 'Download started successfully!') {
          successMessage.value = '';
        }
      }, 3000);
    } catch (error) {
      console.error('Download failed:', error);
      errorMessage.value = 'Download failed. Please try opening in new tab instead.';
    }
  }
}

// File navigation functions
function previousFile() {
  if (currentFileIndex.value > 0) {
    currentFileIndex.value--;
  }
}

function nextFile() {
  if (currentFileIndex.value < files.value.length - 1) {
    currentFileIndex.value++;
  }
}

function openCurrentFilePreview() {
  if (currentFilePreview.value?.url) {
    window.open(currentFilePreview.value.url, '_blank', 'noopener');
  }
}

// Close dropdown when clicking outside
const handleClickOutside = () => {
  activeDropdown.value = null;
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  clearPreviews();
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
});
</script>

<style scoped>
/* Professional Color Palette */
:root {
  --primary-blue: #2563eb;
  --primary-dark: #1e40af;
  --primary-light: #3b82f6;
  --accent-teal: #0d9488;
  --accent-teal-light: #14b8a6;
  --success-green: #059669;
  --warning-amber: #d97706;
  --danger-red: #dc2626;
  --neutral-50: #f8fafc;
  --neutral-100: #f1f5f9;
  --neutral-200: #e2e8f0;
  --neutral-300: #cbd5e1;
  --neutral-400: #94a3b8;
  --neutral-500: #64748b;
  --neutral-600: #475569;
  --neutral-700: #334155;
  --neutral-800: #1e293b;
  --neutral-900: #0f172a;
}

/* New simplified layout styles */
.imposition-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--neutral-50);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-dark));
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.preview-container {
  flex: 1;
  padding: 20px;
  overflow: hidden;
}

.pdf-preview {
  width: 100%;
  height: 100%;
  border: 1px solid var(--neutral-300);
  border-radius: 8px;
  background: white;
}

.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: white;
  border: 2px dashed var(--neutral-300);
  border-radius: 8px;
  color: var(--neutral-500);
  font-size: 1.1rem;
}

.imposition-page ion-content {
  --background: #f8fafc;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
}

.imposition-content {
  --overflow: auto;
}

.imposition-page {
  height: 100vh;
  overflow: hidden;
}

/* Modern Slim Scrollbar Styles */
* {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

*::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

*::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
  border: 2px solid transparent;
  background-clip: padding-box;
}

*::-webkit-scrollbar-corner {
  background: transparent;
}

.imposition-page ion-header {
  overflow: visible !important;
  z-index: 10;
}

.imposition-page ion-toolbar {
  overflow: visible !important;
}

/* Mobile Hamburger Navigation Styles */
.mobile-hamburger-container {
  display: none;
}

.desktop-nav-items {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.hamburger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: var(--neutral-50);
  border: 1px solid var(--neutral-200);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hamburger-btn ion-icon {
  font-size: 24px;
  color: var(--neutral-700);
}

.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  backdrop-filter: blur(4px);
  animation: overlayFadeIn 0.3s ease;
}

@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: white;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  z-index: 10001;
  animation: slideInLeft 0.25s ease-out;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-menu-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.close-btn ion-icon {
  font-size: 20px;
  color: white;
}

.mobile-menu-items {
  flex: 1;
  padding: 8px 0;
}

.mobile-menu-item {
  border-bottom: 1px solid #f1f5f9;
}

.mobile-menu-item.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.mobile-menu-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 16px 20px;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--neutral-700);
}

.mobile-menu-button:hover {
  background: #f8fafc !important;
  color: #2563eb !important;
}

.mobile-menu-button:active {
  background: #f8fafc !important;
  color: #2563eb !important;
}

.mobile-menu-button.active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
  color: #2563eb;
  border-left: 4px solid #2563eb;
}

.mobile-menu-button ion-icon {
  font-size: 20px;
  color: inherit;
  flex-shrink: 0;
}

.mobile-menu-button span {
  flex: 1;
}

.mobile-menu-button .chevron {
  font-size: 16px;
  transition: transform 0.2s ease;
  margin-left: auto;
}

.mobile-menu-button .chevron.rotated {
  transform: rotate(180deg);
}

.mobile-submenu {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  animation: submenuSlideDown 0.2s ease;
}

@keyframes submenuSlideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 300px;
  }
}

.mobile-submenu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 20px 12px 52px;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  color: var(--neutral-600);
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.mobile-submenu-item:hover {
  background: #f8fafc !important;
  color: #2563eb !important;
}

.mobile-submenu-item:active {
  background: #f8fafc !important;
  color: #2563eb !important;
}

.mobile-submenu-item.active {
  background: #2563eb !important;
  color: white !important;
}

.mobile-submenu-item.active:hover {
  background: #1e40af !important;
  color: white !important;
}

.mobile-submenu-item.active strong,
.mobile-submenu-item.active small,
.mobile-submenu-item.active * {
  color: white !important;
}

.mobile-submenu-item strong {
  font-weight: 600;
  font-size: 14px;
}

.mobile-submenu-item small {
  font-size: 12px;
  opacity: 0.8;
  line-height: 1.3;
}

.mobile-submenu-item.toggle-item {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.mobile-submenu-item.toggle-item span {
  flex: 1;
}

.mobile-submenu-item.disabled-item {
  opacity: 0.4;
  pointer-events: none;
}

/* Hide hamburger on desktop */
@media (min-width: 769px) {
  .mobile-hamburger-container {
    display: none !important;
  }
  
  .desktop-nav-items {
    display: flex !important;
  }
}
.imposition-nav-toolbar {
  background: white;
  border-bottom: 1px solid var(--neutral-200);
  padding: 8px 0;
  overflow: visible !important;
  position: relative;
  z-index: 1000;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
}

.imposition-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  overflow: visible !important;
  flex-wrap: nowrap;
  position: relative;
  z-index: 100;
}

.nav-item {
  position: relative;
  flex-shrink: 0;
  z-index: 999;
}

.nav-item.dropdown {
  overflow: visible !important;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--neutral-50);
  border: 1px solid var(--neutral-200);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--neutral-700);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-button:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.nav-button.active:hover {
  background: #1e40af;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.5);
}

.nav-button:active {
  transform: scale(0.98);
  background: var(--neutral-200);
}

.nav-button.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.nav-button.active ion-icon {
  color: white;
}

.nav-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.disabled-dropdown {
  opacity: 0.4;
  pointer-events: none;
}

.nav-button:hover ion-icon {
  color: inherit;
}

.nav-button ion-icon {
  font-size: 18px;
}

.nav-button .chevron {
  font-size: 16px;
  transition: transform 0.2s ease;
}

.nav-item.dropdown .nav-button:hover .chevron {
  transform: rotate(180deg);
}

.dropdown-bridge {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 8px;
  background: transparent;
  z-index: 999;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 200px;
  max-width: 300px;
  background: white;
  border: 1px solid var(--neutral-200);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 99999;
  padding: 4px;
  animation: dropdownFadeIn 0.15s ease;
  max-height: 400px;
  overflow-y: auto;
  display: block;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 14px;
  color: var(--neutral-700);
  white-space: nowrap;
}

.dropdown-item:hover {
  background: #f8fafc !important;
  color: #2563eb !important;
}

.dropdown-item:hover ion-icon {
  color: #2563eb !important;
}

.dropdown-item:hover span {
  color: #2563eb !important;
}

.dropdown-item:hover strong {
  color: #2563eb !important;
}

.dropdown-item:hover * {
  color: #2563eb !important;
}

.dropdown-item.active {
  background: #2563eb !important;
  color: white !important;
}

.dropdown-item.active:hover {
  background: #1e40af !important;
  color: white !important;
}

.dropdown-item.active strong,
.dropdown-item.active span,
.dropdown-item.active * {
  color: white !important;
}

.dropdown-item.disabled-item {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.dropdown-item.disabled-item ion-toggle {
  opacity: 0.4;
}

.dropdown-item strong {
  font-weight: 600;
}



.dropdown-item ion-icon {
  font-size: 18px;
  margin-right: 8px;
}

.dropdown-divider {
  height: 1px;
  background: var(--neutral-200);
  margin: 4px 0;
}

.dropdown-section {
  padding: 4px 0;
}

.dropdown-section-header {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--neutral-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.expandable-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
}

.expandable-item ion-icon {
  font-size: 16px;
  margin-left: 8px;
  color: var(--neutral-400);
}

.expandable-section-wrapper {
  position: relative;
}

.submenu-dropdown {
  position: absolute;
  left: calc(100% + 4px);
  top: 0;
  min-width: 200px;
  max-width: 300px;
  background: white;
  border: 1px solid var(--neutral-200);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 99999;
  padding: 4px;
  animation: submenuFadeIn 0.15s ease;
  max-height: 400px;
  overflow-y: auto;
}

.submenu-dropdown.submenu-teleport {
  position: fixed;
  left: auto;
  top: auto;
  z-index: 100000;
}

@keyframes submenuFadeIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.expanded-section {
  padding-left: 8px;
  animation: expandFadeIn 0.2s ease;
}

@keyframes expandFadeIn {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

.sub-item {
  padding-left: 24px !important;
  font-size: 13px;
}

.dropdown-menu.options-dropdown {
  min-width: 180px;
  max-width: 180px;
  max-height: 200px;
  position: relative;
  overflow-y: auto;
  overflow-x: visible;
}

.dropdown-menu.options-dropdown-teleport {
  min-width: 220px;
  max-width: 220px;
  max-height: 300px;
  background: white;
  border: 1px solid var(--neutral-200);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 8px;
  animation: dropdownFadeIn 0.15s ease;
  overflow-y: auto;
  overflow-x: visible;
}

.dropdown-menu.options-dropdown-teleport .dropdown-item {
  padding: 10px 12px !important;
}

.dropdown-menu.export-dropdown {
  min-width: 180px;
  max-width: 180px;
  max-height: 300px;
}

.dropdown-menu.export-dropdown .dropdown-item {
  padding: 10px 12px !important;
}

.dropdown-item.toggle-item {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.dropdown-item.toggle-item span {
  flex: 1;
}

.dropdown-item.toggle-item ion-toggle {
  flex-shrink: 0;
}

.generate-btn {
  margin-left: auto;
  align-self: center;
  --background: var(--primary-blue);
  --background-hover: var(--primary-dark);
  --border-radius: 8px;
  --padding-start: 20px;
  --padding-end: 20px;
  font-weight: 600;
  height: 40px;
  flex-shrink: 0;
}

.generate-btn ion-icon {
  font-size: 20px;
  margin-right: 6px;
}

/* Mobile back button - hidden on desktop */
.mobile-back-btn {
  display: none;
  margin-left: auto;
  align-self: center;
  --background: var(--primary-blue);
  --background-hover: var(--primary-dark);
  --border-radius: 8px;
  --padding-start: 20px;
  --padding-end: 20px;
  font-weight: 600;
  height: 40px;
  flex-shrink: 0;
}

.mobile-back-btn ion-icon {
  font-size: 20px;
  margin-right: 6px;
}

@media (max-width: 768px) {
  .mobile-back-btn {
    display: flex;
  }
  
  /* Hide generate button on mobile when preview exists */
  .generate-btn {
    display: flex;
  }
  
  body:has(.show-mobile) .generate-btn {
    display: none;
  }
}


.imposition-page ion-header {
  overflow: visible !important;
}

.imposition-page ion-header::part(native) {
  overflow: visible !important;
}

.imposition-page ion-header ion-toolbar:first-child {
  --background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  --color: #ffffff;
  --border-width: 0;
  box-shadow: 0 4px 24px rgba(37, 99, 235, 0.15);
}

.imposition-page ion-header ion-title {
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
}

.imposition-page ion-header ion-button {
  --color: #ffffff;
  --background-hover: rgba(255, 255, 255, 0.15);
  --border-radius: 10px;
  font-weight: 600;
}

.hero {
  padding: 3rem 1.5rem 2rem;
  text-align: center;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.03) 0%, transparent 100%);
  border-bottom: 1px solid rgba(37, 99, 235, 0.08);
}

.hero h1 {
  font-size: clamp(2rem, 3vw, 2.75rem);
  margin-bottom: 0.75rem;
  color: var(--neutral-900);
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #0d9488 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  max-width: 680px;
  margin: 0 auto;
  line-height: 1.7;
  color: var(--neutral-600);
  font-size: 1.05rem;
  font-weight: 500;
}

.main-container {
  height: calc(100vh - 109px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.split-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  height: 100%;
  overflow: hidden;
}

@media (min-width: 769px) {
  .drop-zone-modern {
    padding: 24px 32px 20px !important;
  }
}

@media (max-width: 768px) {
  .split-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    overflow: visible;
    height: auto;
  }

  .main-container {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }

  .panel {
    height: auto;
    min-height: 50vh;
  }

  /* Hide right panel completely on mobile by default */
  .right-panel {
    display: none !important;
    min-height: 0 !important;
    height: 0 !important;
    overflow: hidden !important;
  }
  
  .panel-header {
    padding: 20px 20px;
  }
  
  .header-icon {
    width: 48px;
    height: 48px;
  }
  
  .header-icon ion-icon {
    font-size: 24px;
  }
  
  .header-content h2 {
    font-size: 18px;
  }
  
  .header-content p {
    font-size: 12px;
  }
  
  .panel-body {
    padding: 20px;
  }
  
  .file-items-grid {
    grid-template-columns: 1fr;
    max-height: 300px;
  }

  /* Hide supported formats on mobile */
  .supported-formats {
    display: none !important;
  }

  /* Force show right panel only when actively processing or showing preview */
  .right-panel.show-mobile {
    display: flex !important;
    height: auto !important;
    min-height: 50vh !important;
    overflow: visible !important;
  }

  /* On mobile: Hide left panel ONLY when generating or when generated preview is shown */
  .left-panel.hide-on-mobile {
    display: none !important;
  }

  /* Mobile Navigation Styles */
  .mobile-hamburger-container {
    display: flex !important;
  }
  
  .desktop-nav-items {
    display: none !important;
  }
  
  .desktop-only-dropdown {
    pointer-events: none !important;
  }
  
  .nav-item.dropdown {
    pointer-events: none !important;
  }
  
  .dropdown-menu {
    display: none !important;
  }
  
  .dropdown-bridge {
    display: none !important;
  }
  
  .mobile-submenu-item small {
    display: none !important;
  }
  
  .mobile-submenu-item {
    padding: 8px 20px 8px 32px !important;
  }
  
  .mobile-submenu-item:hover,
  .mobile-submenu-item:active,
  .mobile-submenu-item:focus {
    background: #f8fafc !important;
    color: #2563eb !important;
  }
  
  .mobile-menu-button:hover,
  .mobile-menu-button:active,
  .mobile-menu-button:focus {
    background: #f8fafc !important;
    color: #2563eb !important;
  }
  
  .drop-zone-modern {
    padding: 16px 20px 16px !important;
  }
  
  .generate-btn {
    --padding-start: 16px !important;
    --padding-end: 16px !important;
    height: 36px !important;
    font-size: 14px !important;
  }
}

.back-arrow-btn {
  --color: white !important;
  --padding-start: 8px !important;
  --padding-end: 8px !important;
  --min-height: 32px !important;
  margin-left: 8px !important;
}

.back-arrow-icon {
  font-size: 18px !important;
  color: white !important;
}

.imposition-page ion-header ion-title {
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
  margin-left: -12px !important;
}

.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  overflow: hidden;
}

.left-panel {
  border-right: 1px solid #e2e8f0;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 32px;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #7c3aed 100%);
  background-size: 200% 200%;
  animation: gradientShift 8s ease infinite;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  min-height: 68px;
}

.panel-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shine 3s infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 200%; }
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.header-icon:hover {
  transform: scale(1.05) rotate(5deg);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.header-icon ion-icon {
  font-size: 32px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.header-content h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: white;
  letter-spacing: -0.03em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.header-content p {
  margin: 6px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 28px 0;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.drop-zone-modern {
  border: 2px dashed #e2e8f0;
  border-radius: 20px;
  padding: 40px 48px 32px;
  text-align: center;
  background: radial-gradient(circle, #ffffff 0%, #f1f5f9 40%, #ddd6fe 100%);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  position: relative;
  min-height: 380px;
  justify-content: center;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.03),
    0 2px 4px rgba(0, 0, 0, 0.02),
    0 12px 24px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  contain: layout style paint;
}

.drop-zone-modern::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 30px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6);
  background-size: 300% 300%;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.4s ease;
  animation: gradientRotate 4s ease infinite;
}

@keyframes gradientRotate {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.drop-zone-modern::after {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: 26px;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 1) 0%, rgba(147, 197, 253, 0.15) 30%, rgba(219, 234, 254, 0.2) 60%, rgba(239, 246, 255, 0.25) 100%);
  z-index: -1;
  transition: all 0.4s ease;
}

.drop-zone-modern:hover {
  border-color: transparent;
  box-shadow: 
    0 0 0 1px rgba(59, 130, 246, 0.1),
    0 4px 8px rgba(59, 130, 246, 0.08),
    0 20px 40px rgba(59, 130, 246, 0.12);
}

.drop-zone-modern:hover::before {
  opacity: 1;
}

.drop-zone-modern:hover::after {
  background: linear-gradient(180deg, #ffffff 0%, #eff6ff 50%, #dbeafe 100%);
}

.drop-zone-modern.dragging {
  border-color: transparent;
  transform: scale(1.02);
  box-shadow: 
    0 0 0 4px rgba(59, 130, 246, 0.2),
    0 8px 16px rgba(59, 130, 246, 0.15),
    0 32px 64px rgba(59, 130, 246, 0.2);
}

.drop-zone-modern.dragging::before {
  opacity: 1;
  animation: gradientRotate 1s ease infinite;
}

.drop-zone-modern.dragging::after {
  background: linear-gradient(180deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%);
}

.drop-zone-modern.has-files {
  min-height: auto;
  padding: 0;
  background: #ffffff;
  border: none;
}

.drop-zone-modern.has-files::before,
.drop-zone-modern.has-files::after {
  display: none;
}

/* Upload Interface - Modern Design */
.upload-interface {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  animation: fadeInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  width: 100%;
  max-width: 100%;
}

@keyframes fadeInScale {
  from { 
    opacity: 0; 
    transform: scale(0.9) translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: scale(1) translateY(0); 
  }
}

.upload-icon-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.upload-icon-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%);
  border-radius: 50%;
  opacity: 0.1;
  animation: breathe 3s ease-in-out infinite;
}

.upload-icon-orbit {
  position: absolute;
  inset: 5px;
  border: 2px solid transparent;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6);
  background-clip: padding-box;
  animation: rotate 8s linear infinite;
  opacity: 0.3;
}

.orbit-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  top: 2px;
  left: 50%;
  transform: translateX(-50%);
}

.orbit-dot-1 {
  animation: orbitDot 3s ease-in-out infinite;
  animation-delay: 0s;
}

.orbit-dot-2 {
  animation: orbitDot 3s ease-in-out infinite;
  animation-delay: -1s;
}

.orbit-dot-3 {
  animation: orbitDot 3s ease-in-out infinite;
  animation-delay: -2s;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.15); opacity: 0.2; }
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes orbitDot {
  0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.3; transform: translateX(-50%) scale(1.2); }
}

.upload-icon {
  font-size: 48px;
  color: #3b82f6;
  z-index: 2;
  filter: drop-shadow(0 4px 20px rgba(59, 130, 246, 0.4));
  animation: floatIcon 4s ease-in-out infinite;
}

@keyframes floatIcon {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-6px) rotate(-1deg); }
  75% { transform: translateY(-3px) rotate(1deg); }
}

.upload-text {
  text-align: center;
  max-width: 480px;
}

.upload-text h3 {
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.upload-subtitle {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #475569;
  line-height: 1.5;
}

.upload-subtitle .highlight {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}

.upload-hint {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  line-height: 1.4;
}

.upload-hint strong {
  color: #3b82f6;
  font-weight: 700;
}

.upload-actions {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 100%;
}

.browse-btn {
  --border-radius: 20px;
  --padding-start: 36px;
  --padding-end: 36px;
  --padding-top: 18px;
  --padding-bottom: 18px;
  --background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  --background-hover: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  --box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4), 0 2px 4px rgba(37, 99, 235, 0.2);
  font-weight: 700;
  font-size: 16px;
  text-transform: none;
  letter-spacing: -0.01em;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.browse-btn:hover {
  --box-shadow: 0 10px 30px rgba(37, 99, 235, 0.5), 0 4px 8px rgba(37, 99, 235, 0.25);
  transform: translateY(-3px) scale(1.02);
}

.drag-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  animation: fadeInUp 0.8s ease-out;
}

.drag-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  border-radius: 50%;
  color: #475569;
  animation: bounce 2s infinite;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
  60% {
    transform: translateY(-2px);
  }
}

.supported-formats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  animation: fadeInUp 1s ease-out;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.format-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.format-title {
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.format-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}

.format-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 2px solid;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}

.format-badge.image {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #93c5fd;
  color: #1e40af;
}

.format-badge.document {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fbbf24;
  color: #92400e;
}

.format-badge:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.format-badge.image:hover {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
  border-color: #60a5fa;
  color: #1d4ed8;
}

.format-badge.document:hover {
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  border-color: #f59e0b;
  color: #78350f;
}

.file-preview-interface {
  width: 100%;
  animation: fadeIn 0.4s ease;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 20px;
  border: none;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.02);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.file-count {
  display: flex;
  align-items: center;
  gap: 10px;
}

.count-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 12px;
  font-size: 18px;
  font-weight: 800;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.count-label {
  font-size: 15px;
  font-weight: 600;
  color: #475569;
}

.add-more-btn {
  --border-radius: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
  --border-width: 2px;
  font-weight: 600;
  font-size: 13px;
  text-transform: none;
  transition: all 0.2s ease;
}

.add-more-btn:hover {
  --background: rgba(59, 130, 246, 0.1);
}

.file-items-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  max-height: calc(100vh - 400px);
  overflow-y: auto;
  padding: 16px;
  width: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.file-items-grid::-webkit-scrollbar {
  width: 8px;
}

.file-items-grid::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.file-items-grid::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #94a3b8 0%, #cbd5e1 100%);
  border-radius: 4px;
}

.file-items-grid::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #64748b 0%, #94a3b8 100%);
}

.file-item-compact {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 18px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: move;
  user-select: none;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.02);
}

.file-item-compact::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
  background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
  transform-origin: center;
}

.file-item-compact:hover::before {
  transform: scaleY(1);
}

.file-item-compact:hover {
  border-color: #3b82f6;
  box-shadow: 
    0 4px 12px rgba(59, 130, 246, 0.15),
    0 12px 28px rgba(59, 130, 246, 0.1);
}

.file-index-badge {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 0 16px 0 12px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  color: #94a3b8;
  cursor: grab;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.drag-handle:hover {
  background: #f1f5f9;
  color: #64748b;
}

.drag-handle:active {
  cursor: grabbing;
  background: #e2e8f0;
}

.drag-handle ion-icon {
  font-size: 20px;
}

.file-item-compact:hover {
  border-color: #2563eb;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.15), 0 4px 12px rgba(37, 99, 235, 0.1);
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
}

.file-item-compact.dragging-file {
  opacity: 0.5;
  cursor: move;
}

.file-item-compact.drag-over {
  border-color: #10b981;
  background: #d1fae5;
  border-width: 2px;
  border-style: dashed;
  transform: scale(1.02);
}

.file-item-compact.dragging-file {
  opacity: 0.5;
  cursor: move;
}

.file-item-compact.drag-over {
  border-color: #10b981;
  background: #d1fae5;
  border-width: 2px;
  border-style: dashed;
  transform: scale(1.02);
}

.file-item-compact .file-preview {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.file-item-compact:hover .file-preview {
  border-color: #93c5fd;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.file-item-compact .image-preview {
  width: 100%;
  height: 100%;
}

.file-item-compact .image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.file-item-compact:hover .image-preview img {
  transform: scale(1.1);
}

.file-item-compact .file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.file-item-compact .file-icon ion-icon {
  font-size: 28px;
  color: #3b82f6;
  filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.2));
}

.file-item-compact .file-info {
  flex: 1;
  min-width: 0;
}

.file-item-compact .file-name {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
  letter-spacing: -0.01em;
}

.file-item-compact .file-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-item-compact .file-size {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.file-item-compact .file-type {
  padding: 2px 8px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.file-item-compact .remove-btn {
  flex-shrink: 0;
  --color: #94a3b8;
  --background-hover: rgba(239, 68, 68, 0.1);
  --color-hover: #ef4444;
  transition: all 0.2s ease;
}

.file-item-compact .remove-btn:hover {
  transform: scale(1.1);
}

/* Modern Message Styles */
.message {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid;
  margin-top: 20px;
  animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

.message-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.message-icon ion-icon {
  font-size: 24px;
}

.message-content {
  flex: 1;
  line-height: 1.4;
}

.success-message {
  display: none;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #065f46;
  border-color: #10b981;
}

.success-message .message-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.success-message .message-icon ion-icon {
  color: white;
}

.message-icon-text-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.success-message .message-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.success-message .message-icon ion-icon {
  color: white;
  font-size: 20px;
}

.error-message {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #991b1b;
  border-color: #ef4444;
}

.error-message .message-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.error-message .message-icon ion-icon {
  color: white;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.error-message ion-icon {
  font-size: 24px;
  color: #ef4444;
  filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3));
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.file-preview-scroll::-webkit-scrollbar-track {
  display: none;
}

.file-preview-scroll::-webkit-scrollbar-thumb {
  display: none;
}

.file-preview-scroll::-webkit-scrollbar-thumb:hover {
  display: none;
}

.file-preview-card {
  position: relative;
  flex: 0 0 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.65rem;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08),
              0 1px 4px rgba(37, 99, 235, 0.06);
  border: 1.5px solid rgba(37, 99, 235, 0.12);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.file-preview-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12),
              0 2px 8px rgba(37, 99, 235, 0.1);
  border-color: var(--primary-blue);
}

.file-preview-card.is-dragging {
  opacity: 0.6;
  transform: scale(0.95) rotate(2deg);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.2);
  z-index: 100;
}

.file-preview-card.is-drop-target {
  border-style: dashed;
  border-color: var(--primary-blue);
  border-width: 2px;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
  background: rgba(37, 99, 235, 0.03);
}

.file-preview-card.add-card {
  justify-content: center;
  cursor: pointer;
  border-style: dashed;
  border-width: 2px;
  color: var(--primary-blue);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.04) 0%, rgba(37, 99, 235, 0.02) 100%);
}

.file-preview-card.add-card:hover {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%);
  border-color: var(--primary-dark);
}

.file-preview-card.add-card .preview-frame {
  border-color: rgba(37, 99, 235, 0.3);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%);
  color: var(--primary-blue);
}

.file-preview-card.add-card ion-icon {
  font-size: 1.75rem;
  font-weight: bold;
}

.file-preview-card.add-card.is-drop-target {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(37, 99, 235, 0.06) 100%);
}

.remove-preview {
  position: absolute;
  top: 0.45rem;
  right: 0.45rem;
  background: var(--danger-red);
  border: none;
  padding: 0.2rem;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 50%;
  z-index: 10;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}

.remove-preview:hover {
  background: #b91c1c;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}

.remove-preview ion-icon {
  font-size: 1.2rem;
}

.preview-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  border: 1.5px solid rgba(37, 99, 235, 0.15);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.file-index {
  position: absolute;
  top: 0.4rem;
  left: 0.4rem;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-dark) 100%);
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
  z-index: 5;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  color: var(--primary-blue);
}

.preview-placeholder ion-icon {
  font-size: 1.5rem;
}

.preview-ext {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--neutral-700);
}

.file-name {
  display: block;
  width: 100%;
  text-align: center;
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--neutral-700);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.file-size {
  color: var(--neutral-500);
  font-size: 0.68rem;
  font-weight: 500;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.options-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.options-group label {
  font-weight: 700;
  color: var(--neutral-800);
  font-size: 0.95rem;
  letter-spacing: -0.01em;
}

.segment-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0.5rem;
  margin: 0 -0.5rem;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
}

.segment-scroll::-webkit-scrollbar {
  display: none;
  height: 0px;
}

.segment-scroll::-webkit-scrollbar-track {
  display: none;
}

.segment-scroll::-webkit-scrollbar-thumb {
  display: none;
}

ion-segment {
  --background: var(--neutral-100);
  border-radius: 14px;
  padding: 0.35rem;
  min-width: max-content;
  box-shadow: inset 0 2px 4px rgba(15, 23, 42, 0.06);
}

.imposition-segment::part(scroll) {
  display: flex;
  gap: 0.75rem;
  padding: 0.15rem 0.4rem;
}

ion-segment-button {
  --color: var(--neutral-700);
  --color-checked: #ffffff;
  --background-checked: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-dark) 100%);
  --indicator-color: transparent;
  min-height: 72px;
  flex: 0 0 auto;
  min-width: 200px;
  border-radius: 12px;
  align-items: flex-start;
  text-align: left;
  transition: all 0.25s ease;
  border: 1.5px solid transparent;
}

ion-segment-button:hover {
  background: var(--neutral-50);
  border-color: rgba(37, 99, 235, 0.2);
}

ion-segment-button::part(indicator-background) {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-dark) 100%);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
}

ion-segment-button ion-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.95rem;
  width: 100%;
  max-width: 190px;
  min-width: 0;
  padding: 0.25rem;
}

ion-segment-button ion-label strong {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 700;
  letter-spacing: -0.01em;
}

ion-segment-button small {
  font-size: 0.76rem;
  opacity: 0.75;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  line-height: 1.3;
}

.options-grid {
  display: grid;
  gap: 1rem;
}

.options-grid ion-item {
  --background: var(--neutral-50);
  --border-color: rgba(37, 99, 235, 0.12);
  --border-radius: 14px;
  --padding-start: 1.25rem;
  --padding-end: 1.25rem;
  --inner-padding-end: 0;
  --min-height: 60px;
  border-radius: 14px;
  margin: 0;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.options-grid ion-item:hover {
  --background: #ffffff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.options-grid ion-item ion-label {
  font-weight: 600;
  color: var(--neutral-700);
  font-size: 0.95rem;
}

.options-grid ion-select,
.options-grid ion-toggle {
  --placeholder-color: var(--neutral-400);
}

.options-grid ion-toggle {
  --background: var(--neutral-300);
  --background-checked: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-dark) 100%);
  --handle-background: #ffffff;
  --handle-background-checked: #ffffff;
  --handle-box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
}

.custom-size {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.custom-size-hint {
  margin: 0;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.06) 0%, rgba(13, 148, 136, 0.04) 100%);
  border-radius: 14px;
  border-left: 4px solid var(--accent-teal);
  font-size: 0.9rem;
  color: var(--neutral-700);
  font-weight: 500;
  line-height: 1.6;
}

.custom-size-fields {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.dimension-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  background: #ffffff;
  border: 2px solid rgba(37, 99, 235, 0.15);
  border-radius: 16px;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.dimension-field:hover {
  border-color: rgba(37, 99, 235, 0.3);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.dimension-field label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--neutral-700);
  letter-spacing: -0.01em;
}

.dimension-input {
  --padding-start: 0.6rem;
  --padding-end: 0.6rem;
  --padding-top: 0.5rem;
  --padding-bottom: 0.5rem;
  --background: var(--neutral-50);
  --color: var(--neutral-900);
  --placeholder-color: var(--neutral-400);
  --highlight-color-focused: var(--primary-blue);
  --border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
}

.dimension-input::part(native) {
  border: 1.5px solid rgba(37, 99, 235, 0.2);
  border-radius: 10px;
  font-size: 0.9rem;
  transition: all 0.25s ease;
  font-weight: 600;
}

.dimension-field:focus-within {
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12),
              0 4px 12px rgba(15, 23, 42, 0.08);
}

.dimension-field:focus-within .dimension-input::part(native) {
  border-color: var(--primary-blue);
  background: #ffffff;
}

.custom-size-note {
  margin-top: 0;
  padding: 0 0.5rem;
  font-size: 0.82rem;
  color: var(--neutral-500);
  font-weight: 500;
}

.custom-size.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.advanced {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(37, 99, 235, 0.12);
}

.advanced ion-item {
  --background: var(--neutral-50);
  font-weight: 600;
}

.advanced-content {
  padding: 1.25rem 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: var(--neutral-50);
}

.submit-btn {
  margin-top: 0.5rem;
  --background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-dark) 100%);
  --background-hover: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-blue) 100%);
  --background-activated: var(--primary-dark);
  --border-radius: 14px;
  --box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
  --padding-top: 1.1rem;
  --padding-bottom: 1.1rem;
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
  text-transform: none;
  transition: all 0.3s ease;
}

.submit-btn:hover:not([disabled]) {
  transform: translateY(-2px);
  --box-shadow: 0 8px 28px rgba(37, 99, 235, 0.4);
}

.submit-btn:active:not([disabled]) {
  transform: translateY(0);
}

.message {
  display: block;
  margin-top: 0;
  padding: 0.85rem 1.1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1.5;
}

.message.note {
  margin-top: 0;
}

.message[color="danger"] {
  background: rgba(220, 38, 38, 0.1);
  color: var(--danger-red);
  border-left: 4px solid var(--danger-red);
}

.message[color="success"] {
  background: rgba(5, 150, 105, 0.1);
  color: var(--success-green);
  border-left: 4px solid var(--success-green);
}

.message[color="warning"] {
  background: rgba(217, 119, 6, 0.1);
  color: var(--warning-amber);
  border-left: 4px solid var(--warning-amber);
}

.orientation-note {
  display: block;
  margin-top: 0;
  margin-bottom: 0.75rem;
  padding: 0.75rem 1.1rem;
  font-size: 0.88rem;
  background: rgba(5, 150, 105, 0.08);
  color: var(--success-green);
  border-left: 4px solid var(--success-green);
  border-radius: 10px;
  font-weight: 600;
}

.preview-card {
  min-height: 100%;
}

.status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 60px 24px;
  text-align: center;
}

.status ion-icon,
.status ion-spinner {
  font-size: 64px;
  color: #2563eb;
}

.status.error ion-icon {
  color: #ef4444;
}

.status-content h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.status-content p {
  margin: 8px 0 0;
  font-size: 14px;
  color: #64748b;
  max-width: 400px;
}

.preview-container,
.file-preview-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  margin: 0;
  border-bottom: none;
  flex-shrink: 0;
}

.preview-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.preview-info {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.preview-frame {
  flex: 1;
  border-radius: 24px;
  overflow: hidden;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  position: relative;
  display: flex;
  min-height: 0;
  margin: 0 !important;
  padding: 0;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.03),
    0 4px 12px rgba(0, 0, 0, 0.04),
    0 16px 32px rgba(0, 0, 0, 0.06);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.preview-frame::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 26px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%);
  background-size: 200% 200%;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.4s ease;
  animation: borderGlow 4s ease infinite;
}

@keyframes borderGlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.preview-frame:hover {
  border-color: transparent;
  transform: translateY(-4px);
  box-shadow: 
    0 8px 24px rgba(59, 130, 246, 0.15),
    0 24px 48px rgba(59, 130, 246, 0.12);
}

.preview-frame:hover::before {
  opacity: 1;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #ffffff;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 80px 32px;
  text-align: center;
  height: 100%;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
  border-radius: 24px;
  animation: fadeInEmpty 0.6s ease;
}

@keyframes fadeInEmpty {
  from { 
    opacity: 0; 
    transform: scale(0.95);
  }
  to { 
    opacity: 1; 
    transform: scale(1);
  }
}

.empty-state ion-icon {
  font-size: 88px;
  color: #94a3b8;
  filter: drop-shadow(0 4px 16px rgba(148, 163, 184, 0.3));
  animation: floatDoc 4s ease-in-out infinite;
}

@keyframes floatDoc {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-12px) rotate(3deg); }
}

.empty-state h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #334155;
  letter-spacing: -0.02em;
}

.empty-state p {
  margin: 0;
  font-size: 15px;
  color: #64748b;
  max-width: 340px;
  line-height: 1.6;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
  flex-shrink: 0;
}

.actions ion-button {
  --border-radius: 12px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  font-weight: 600;
  text-transform: none;
}

.file-navigation-compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 12px;
  background: transparent;
  border-radius: 8px;
  flex-shrink: 0;
  min-height: 36px;
}

.file-info-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  font-size: 12px;
}

.file-counter {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  white-space: nowrap;
}

.file-name-inline {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.file-size-inline {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  white-space: nowrap;
}

.file-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 8px;
  flex-shrink: 0;
}

.file-counter {
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  min-width: 60px;
  text-align: center;
}

.current-file-info {
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.current-file-info .file-name {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 3px;
}

.current-file-info .file-details {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.image-preview-large {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.image-preview-large img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.file-preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px;
  height: 100%;
}

.file-preview-placeholder ion-icon {
  font-size: 64px;
  color: #cbd5e1;
}

.file-preview-placeholder p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
}

.file-preview-placeholder .file-size {
  font-size: 13px;
  color: #94a3b8;
}

.status.error {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.08) 0%, rgba(220, 38, 38, 0.04) 100%);
  border-left-color: var(--danger-red);
  color: var(--danger-red);
}

.status.success {
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%);
  border-left-color: var(--success-green);
  color: var(--success-green);
}

.status ion-icon {
  font-size: 2rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.status-content {
  flex: 1;
}

.status-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--neutral-900);
}

.status.error .status-content h3 {
  color: var(--danger-red);
}

.status-content p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--neutral-600);
  font-weight: 500;
  line-height: 1.5;
}

.status.error .status-content p {
  color: var(--neutral-700);
}

.preview-container {
  margin-top: 1rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  padding: 0;
  border-bottom: none;
}

.preview-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--neutral-800);
}

.preview-info {
  font-size: 0.85rem;
  color: var(--neutral-500);
  font-weight: 500;
}

.preview-frame {
  margin-top: 1.5rem;
  border-radius: 16px;
  overflow: hidden;
  background: var(--neutral-900);
  min-height: 480px;
  border: 2px solid rgba(37, 99, 235, 0.15);
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.15);
}

.preview-frame iframe {
  width: 100%;
  height: 520px;
  border: none;
  background: #ffffff;
}

.empty-state {
  margin-top: 1.5rem;
  text-align: center;
  color: var(--neutral-500);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1.5rem;
  background: linear-gradient(135deg, var(--neutral-50) 0%, var(--neutral-100) 100%);
  border-radius: 16px;
  border: 2px dashed rgba(37, 99, 235, 0.2);
}

.empty-state ion-icon {
  font-size: 3.5rem;
  color: rgba(37, 99, 235, 0.35);
}

.empty-state h3 {
  margin: 0;
  color: var(--neutral-700);
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: -0.01em;
}

.empty-state p {
  margin: 0;
  color: var(--neutral-600);
  font-weight: 500;
  line-height: 1.6;
}

.actions {
  margin-top: 1.75rem;
  display: grid;
  gap: 1rem;
}

.actions ion-button[fill="solid"] {
  --background: linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-teal-light) 100%);
  --background-hover: linear-gradient(135deg, var(--accent-teal-light) 0%, var(--accent-teal) 100%);
  --background-activated: var(--accent-teal);
  --border-radius: 14px;
  --box-shadow: 0 6px 20px rgba(13, 148, 136, 0.3);
  font-weight: 700;
  height: 54px;
  font-size: 1rem;
  letter-spacing: 0.025em;
}

.actions ion-button[fill="clear"] {
  --color: var(--neutral-600);
  --color-hover: var(--primary-blue);
  --color-activated: var(--primary-dark);
  --border-radius: 14px;
  font-weight: 600;
  height: 54px;
  font-size: 1rem;
}

.preview-container {
  margin-top: 1rem;
}

.preview-iframe {
  width: 100%;
  height: 500px;
  border: 1px solid var(--neutral-200);
  border-radius: 12px;
}

.preview-frame {
  background: var(--neutral-100);
  border-radius: 12px;
  overflow: hidden;
  min-height: 400px;
}

/* File Preview Styles */
.file-preview-container {
  margin-top: 1rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

.preview-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.preview-header h4 {
  margin: 0;
  margin-top: 3px;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.02em;
}

.preview-subtitle {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.preview-title-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.preview-title-container h4 {
  margin: 0;
}

.preview-icon-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  flex-shrink: 0;
}

.preview-icon-badge ion-icon {
  font-size: 20px;
  color: white;
}

.file-info-inline {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 8px;
  flex: 0.7;
  min-width: 0;
}

.file-name-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
  min-width: 0;
}

.file-icon-small {
  font-size: 16px;
  color: #3b82f6;
  flex-shrink: 0;
}

.file-name-display span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-divider {
  color: #cbd5e1;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 0.3;
  flex-shrink: 0;
}

.nav-btn {
  --padding-start: 8px;
  --padding-end: 8px;
  width: 32px;
  height: 32px;
  --border-radius: 10px;
}

.nav-btn ion-icon {
  font-size: 18px;
}

.file-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.file-badge .current {
  font-size: 13px;
  font-weight: 700;
  color: white;
}

.file-badge .separator {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 1px;
}

.file-badge .total {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.preview-action-btn {
  --padding-start: 16px;
  --padding-end: 16px;
  --border-radius: 10px;
  height: 32px;
  font-weight: 600;
  font-size: 12px;
}

.preview-action-btn ion-icon {
  font-size: 16px;
}

.preview-frame {
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.03),
    0 10px 20px rgba(0, 0, 0, 0.04),
    0 20px 40px rgba(0, 0, 0, 0.05);
  background: #ffffff;
  position: relative;
}

.preview-container {
  position: relative;
  min-height: 450px;
}

.image-preview-large {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 450px;
  background: linear-gradient(135deg, #fafbfc 0%, #f3f4f6 100%);
  padding: 30px;
  position: relative;
}

.preview-image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  max-height: 450px;
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.05),
    0 10px 40px rgba(0, 0, 0, 0.12),
    0 20px 60px rgba(0, 0, 0, 0.08);
  animation: fadeInScale 0.5s ease;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.preview-image-wrapper img {
  max-width: 100%;
  max-height: 450px;
  object-fit: contain;
  display: block;
}

.preview-overlay-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
}

.preview-overlay-badge ion-icon {
  font-size: 16px;
  color: #3b82f6;
}

.pdf-preview-container {
  display: flex;
  flex-direction: column;
  min-height: 500px;
  background: #f8fafc;
}

.preview-iframe {
  width: 100%;
  min-height: 500px;
  border: none;
  background: #ffffff;
  flex: 1;
}

.file-preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 450px;
  background: linear-gradient(135deg, #fafbfc 0%, #f3f4f6 100%);
  padding: 50px;
  gap: 16px;
}

.placeholder-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%);
  border-radius: 20px;
  animation: floatAnimation 3s ease-in-out infinite;
}

@keyframes floatAnimation {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.placeholder-icon-wrapper ion-icon {
  font-size: 40px;
  color: #3b82f6;
}

.file-preview-placeholder h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.02em;
}

.placeholder-description {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.file-size-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.file-size-badge ion-icon {
  font-size: 14px;
  color: #64748b;
}

/* File List Styles */
.file-list {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--neutral-200);
}

.file-list h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--neutral-700);
  letter-spacing: -0.01em;
}

.file-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--neutral-50);
  border: 1px solid var(--neutral-200);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.file-item:hover {
  background: white;
  border-color: var(--primary-light);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
}

.file-preview {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--neutral-100);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon ion-icon {
  font-size: 24px;
  color: var(--primary-blue);
}

.file-info {
  flex: 1;
  min-width: 0; /* Enable text truncation */
}

.file-name {
  font-weight: 600;
  color: var(--neutral-800);
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-details {
  font-size: 0.8rem;
  color: var(--neutral-500);
  margin-top: 0.25rem;
}

.message-note {
  display: block;
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-weight: 500;
  font-size: 0.875rem;
}

.actions ion-button[fill="solid"]:hover:not([disabled]) {
  transform: translateY(-2px);
  --box-shadow: 0 8px 28px rgba(13, 148, 136, 0.4);
}

.actions ion-button[fill="clear"] {
  --color: var(--neutral-600);
  --color-hover: var(--primary-blue);
  --border-radius: 12px;
  --padding-top: 0.9rem;
  --padding-bottom: 0.9rem;
  font-weight: 600;
  font-size: 0.98rem;
  text-transform: none;
  transition: all 0.25s ease;
}

.actions ion-button[fill="clear"]:hover:not([disabled]) {
  --background: var(--neutral-100);
}

@media (max-width: 991px) {
  .hero {
    padding-top: 2rem;
    padding-bottom: 1.5rem;
  }

  .content-grid {
    padding: 1.5rem 0;
  }

  .preview-frame iframe {
    height: 400px;
  }
}

@media (max-width: 575px) {
  .hero {
    padding: 1.5rem 1rem 1.25rem;
  }

  .hero h1 {
    font-size: 1.75rem;
  }

  .hero p {
    font-size: 0.95rem;
  }

  .upload-card ion-card-header,
  .settings-card ion-card-header,
  .preview-card ion-card-header {
    padding: 1.25rem 1.5rem;
  }

  .upload-card ion-card-content,
  .settings-card ion-card-content,
  .preview-card ion-card-content {
    padding: 1.5rem 1.5rem;
    gap: 1.5rem;
  }

  .drop-zone {
    padding: 2rem 1.25rem;
  }

  ion-segment-button {
    min-height: 76px;
    min-width: 180px;
  }

  .preview-frame iframe {
    height: 360px;
  }

  .file-preview-card {
    flex: 0 0 100px;
  }
}
</style>

<style>
/* Unscoped styles for teleported dropdowns */
.dropdown-menu .dropdown-item:hover {
  background: #f8fafc !important;
  color: #2563eb !important;
}

.dropdown-menu .dropdown-item:hover ion-icon {
  color: #2563eb !important;
}

.dropdown-menu .dropdown-item:hover span {
  color: #2563eb !important;
}

.dropdown-menu .dropdown-item:hover strong {
  color: #2563eb !important;
}

.submenu-dropdown .dropdown-item:hover {
  background: #f8fafc !important;
  color: #2563eb !important;
}

.submenu-dropdown .dropdown-item:hover ion-icon {
  color: #2563eb !important;
}

.submenu-dropdown .dropdown-item:hover span {
  color: #2563eb !important;
}

.submenu-dropdown .dropdown-item:hover strong {
  color: #2563eb !important;
}
</style>

<style scoped>
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .preview-container {
    padding: 6px;
  }
}

/* Processing Animation Styles */
.status.processing {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px solid #e2e8f0;
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  animation: processingPulse 2s ease-in-out infinite;
}

@keyframes processingPulse {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
    border-color: #e2e8f0;
  }
  50% { 
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0.1);
    border-color: #93c5fd;
  }
}

.processing-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  margin-bottom: 32px;
}

.processing-circle {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.processing-dot {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  animation: processingRotate 2s linear infinite;
}

.processing-dot-1 {
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0s;
}

.processing-dot-2 {
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  animation-delay: 0.5s;
}

.processing-dot-3 {
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 1s;
}

.processing-dot-4 {
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  animation-delay: 1.5s;
}

@keyframes processingRotate {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  25% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
  75% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.processing-files {
  display: flex;
  align-items: center;
  gap: 20px;
  animation: filesProcess 3s ease-in-out infinite;
}

.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  font-size: 24px;
  color: white;
}

.processing-file-1 {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  animation: fileFloat1 2s ease-in-out infinite;
}

.processing-file-2 {
  background: linear-gradient(135deg, #10b981, #059669);
  animation: fileFloat2 2s ease-in-out infinite;
  animation-delay: 0.3s;
}

.output-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  animation: outputPulse 1.5s ease-in-out infinite;
}

@keyframes fileFloat1 {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(5deg); }
}

@keyframes fileFloat2 {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-6px) rotate(-3deg); }
}

@keyframes outputPulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}

.processing-arrow {
  display: flex;
  align-items: center;
  gap: 4px;
}

.arrow-part {
  width: 8px;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 2px;
  animation: arrowFlow 1s ease-in-out infinite;
}

.arrow-1 { animation-delay: 0s; }
.arrow-2 { animation-delay: 0.2s; }
.arrow-3 { animation-delay: 0.4s; }

@keyframes arrowFlow {
  0%, 100% { opacity: 0.3; transform: scaleX(1); }
  50% { opacity: 1; transform: scaleX(1.5); }
}

@keyframes filesProcess {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(5px); }
}

.processing-text {
  font-size: 16px;
  color: #64748b;
  margin: 8px 0 24px 0;
  animation: textFade 2s ease-in-out infinite;
}

@keyframes textFade {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.processing-stages {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 20px;
}

.stage-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.stage-item.active {
  color: #3b82f6;
  font-weight: 600;
}

.stage-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #cbd5e1;
  transition: all 0.3s ease;
  position: relative;
}

.stage-item.active .stage-dot {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  animation: stageDotPulse 1.5s ease-in-out infinite;
}

@keyframes stageDotPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1);
  }
}

/* Status Content */
.status-content h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

/* New File Card Design */
.file-card {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: move;
  user-select: none;
  position: relative;
  overflow: hidden;
  min-width: 0;
  flex-shrink: 0;
  height: 100%;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.02);
}

.file-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
  transform-origin: left;
}

.file-card:hover::before {
  transform: scaleX(1);
}

.file-card:hover {
  border-color: #3b82f6;
  box-shadow: 
    0 4px 8px rgba(59, 130, 246, 0.1),
    0 12px 32px rgba(59, 130, 246, 0.08);
}

.file-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 10px 4px;
  height: 28px;
  margin-bottom: -8px;
}

.file-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  margin-left: -10px;
  margin-top: -4px;
  z-index: 10;
  position: relative;
}

.file-card .drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #94a3b8;
  cursor: grab;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.file-card .drag-handle:hover {
  background: #f1f5f9;
  color: #64748b;
}

.remove-btn-compact {
  --padding-start: 4px;
  --padding-end: 4px;
  --padding-top: 4px;
  --padding-bottom: 4px;
  width: 28px;
  height: 28px;
  --border-radius: 8px;
  margin-right: -4px;
}

.file-preview-area {
  position: relative;
  padding: 6px;
  min-height: 50px;
  display: grid;
  grid-template-rows: 1fr auto;
  align-items: center;
  justify-items: center;
  flex: 1;
  place-items: center;
}

.file-card .image-preview {
  position: relative;
  width: 100%;
  height: 45px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.file-card .image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 6px;
}

.pdf-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  width: 100%;
  min-width: 0;
}

.pdf-icon-large {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 36px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 8px;
  font-size: 18px;
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  animation: pdfPulse 2s ease-in-out infinite;
  position: relative;
}

@keyframes pdfPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.pdf-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
  width: 100%;
  min-width: 0;
}

.pdf-pages {
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.pdf-status {
  font-size: 10px;
  color: #10b981;
  font-weight: 500;
  line-height: 1.1;
}

.document-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
  width: 100%;
  min-width: 0;
}

.document-label {
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.image-label {
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  line-height: 1.1;
  padding-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.document-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-width: 0;
}

.document-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6b7280, #4b5563);
  border-radius: 8px;
  font-size: 16px;
  color: white;
  box-shadow: 0 4px 10px rgba(107, 114, 128, 0.3);
}

.document-icon.docx,
.document-icon.doc {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
  width: 38px;
  height: 38px;
  font-size: 18px;
}

.file-type-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 1px 5px;
  border-radius: 8px;
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid;
}

.pdf-icon-large .file-type-badge.pdf {
  top: -2px;
  right: -8px;
}

.file-type-badge.image {
  background: linear-gradient(135deg, #fed7aa, #fdba74);
  border-color: #f97316;
  color: #c2410c;
}

.file-type-badge.pdf {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border-color: #f87171;
  color: #dc2626;
}

.file-type-badge.document {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border-color: #d1d5db;
  color: #374151;
}

.file-type-badge.docx,
.file-type-badge.doc {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-color: #60a5fa;
  color: #1e40af;
}

.file-card-footer {
  padding: 5px 10px 6px;
  border-top: 1px solid #fecaca;
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
  margin-top: auto;
}

.file-card-footer.docx,
.file-card-footer.doc {
  border-top: 1px solid #bfdbfe;
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%);
}

.file-card-footer.image {
  border-top: 1px solid #fed7aa;
  background: linear-gradient(180deg, #f97316 0%, #ea580c 50%, #c2410c 100%);
}

.file-card .file-name {
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.1;
}

.file-card .file-size {
  font-size: 9px;
  color: #ffffff;
  font-weight: 500;
  line-height: 1.1;
  opacity: 0.9;
}

/* Responsive file grid */
@media (max-width: 768px) {
  .file-items-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    padding: 12px;
  }
  
  .file-card .file-name {
    font-size: 12px;
  }
  
  .file-card .file-size {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .file-items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 10px;
    border: none;
  }
  
  .file-preview-interface {
    padding: 5px;
    border: none;
  }
  
  .empty-state {
    border: none;
  }
  
  .preview-header {
    border: none;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .preview-header-left {
    width: 100%;
  }
  
  .file-info-inline {
    width: 100%;
  }
  
  .preview-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .preview-title-container {
    justify-content: space-between;
    width: 100%;
  }
  
  .preview-action-btn {
    --padding-start: 24px;
    --padding-end: 24px;
    height: 28px;
    font-size: 11px;
  }
  
  .preview-action-btn ion-icon {
    font-size: 14px;
  }
  
  .file-header {
    padding: 12px 12px;
    flex-wrap: nowrap;
  }
  
  .file-count {
    gap: 6px;
  }
  
  .count-number {
    width: 32px;
    height: 32px;
    font-size: 15px;
  }
  
  .count-label {
    font-size: 14px;
    white-space: nowrap;
  }
  
  .add-more-btn {
    --padding-start: 12px;
    --padding-end: 12px;
    font-size: 12px;
  }
  
  .panel-body {
    padding-bottom: 30px;
  }
  
  /* Hide scrollbar on mobile */
  ion-content {
    --offset-bottom: auto;
    --overflow: hidden;
  }
  
  ion-content::part(scroll) {
    overflow-y: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* Internet Explorer 10+ */
  }
  
  ion-content::part(scroll)::-webkit-scrollbar {
    display: none; /* WebKit */
  }
}
</style>
