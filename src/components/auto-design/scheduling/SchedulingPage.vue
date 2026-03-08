<template>
<div class="scheduling-page">
    <!-- Breadcrumb -->
    <div class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <router-link to="/home" class="breadcrumb-link">Home</router-link>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Schedule Selector</span>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <div class="flex justify-between items-center px-10 py-3">
        <!-- Schedule Selection Buttons -->
        <div class="button-group">
          <!-- National Public Holidays Dropdown -->
          <div 
            class="holiday-dropdown-container"
            @mouseenter="openHolidayDropdown"
            @mouseleave="delayedCloseHolidayDropdown"
          >
            <button :class="btnClasses('holiday')">
              National Public Holidays
            </button>

            <!-- Dropdown Menu -->
            <transition name="fade">
              <div v-if="holidayDropdownOpen" class="holiday-dropdown-menu">
                <div class="holiday-items-container">
                  <!-- Select All Checkbox -->
                  <label class="holiday-item holiday-select-all">
                    <input
                      v-model="allSelected"
                      type="checkbox"
                      class="holiday-checkbox"
                      @change="toggleSelectAll"
                    />
                    <span>Select All</span>
                  </label>

                  <!-- Holidays -->
                  <label
                    v-for="(holiday, idx) in holidays"
                    :key="idx"
                    class="holiday-item"
                    :title="holiday.date + ' – ' + holiday.name"
                  >
                    <input
                      v-model="selectedHolidays"
                      :value="holiday"
                      type="checkbox"
                      class="holiday-checkbox"
                    />
                    <span class="holiday-text">
                      {{ holiday.date }} – {{ holiday.name }}
                    </span>
                  </label>
                </div>

                <!-- Schedule Task Button in Dropdown -->
                <button class="holiday-schedule-btn" @click="openTaskModalFromDropdown">
                  Schedule Task
                </button>
              </div>
            </transition>
          </div>

          <!-- Birthday Button -->
          <div class="dropdown-container">
            <button :class="btnClasses('birthday')" @click="handleBirthdayClick">
              Birthday
            </button>
          </div>

          <!-- Congratulatory/Special Events Button -->
          <div class="dropdown-container">
            <button :class="btnClasses('special-events')" @click="handleSpecialEventsClick">
              Congratulatory/Special Events
            </button>
          </div>

          <!-- Business Advert Button -->
          <div class="dropdown-container">
            <button :class="btnClasses('business-advert')" @click="handleBusinessAdvertClick">
              Business Advert
            </button>
          </div>

          <!-- Weekly Task Dropdown -->
          <div 
            class="dropdown-container"
            @click.stop
            @mouseenter="openSpecificDropdown('weeklyTask')"
            @mouseleave="delayedCloseSpecificDropdown('weeklyTask')"
          >
            <button :class="btnClasses('weekly-task')">
              Weekly Task
            </button>
            <transition name="fade">
              <div v-if="dropdowns.weeklyTask" class="dropdown-menu">
                <div class="dropdown-items-container">
                  <!-- Select All Checkbox -->
                  <div class="dropdown-item select-all" @click="toggleSelectAllForMenu('weeklyTask')">
                    <input
                      :checked="selectAllStates.weeklyTask"
                      type="checkbox"
                      class="dropdown-checkbox"
                      readonly
                    />
                    <span>Select All</span>
                  </div>
                  <!-- Menu Items -->
                  <div v-for="item in weeklyTaskItems" :key="item" class="dropdown-item" @click="toggleItemForMenu('weeklyTask', item)">
                    <input
                      :checked="selectedItems.weeklyTask.includes(item)"
                      type="checkbox"
                      class="dropdown-checkbox"
                      readonly
                    />
                    <span>{{ item }}</span>
                  </div>
                </div>
                <!-- Schedule Task Button -->
                <button class="schedule-btn" @click="scheduleDropdownTask('weeklyTask')">
                  Schedule Task
                </button>
              </div>
            </transition>
          </div>

          <!-- Monthly Dropdown -->
          <div 
            class="dropdown-container"
            @click.stop
            @mouseenter="openSpecificDropdown('monthly')"
            @mouseleave="delayedCloseSpecificDropdown('monthly')"
          >
            <button :class="btnClasses('monthly')">
              Monthly Task
            </button>
            <transition name="fade">
              <div v-if="dropdowns.monthly" class="dropdown-menu">
                <div class="dropdown-items-container">
                  <!-- Select All Checkbox -->
                  <div class="dropdown-item select-all" @click="toggleSelectAllForMenu('monthly')">
                    <input
                      :checked="selectAllStates.monthly"
                      type="checkbox"
                      class="dropdown-checkbox"
                      readonly
                    />
                    <span>Select All</span>
                  </div>
                  <!-- Menu Items -->
                  <div v-for="item in monthlyItems" :key="item" class="dropdown-item" @click="toggleItemForMenu('monthly', item)">
                    <input
                      :checked="selectedItems.monthly.includes(item)"
                      type="checkbox"
                      class="dropdown-checkbox"
                      readonly
                    />
                    <span>{{ item }}</span>
                  </div>
                </div>
                <!-- Schedule Task Button -->
                <button class="schedule-btn" @click="scheduleDropdownTask('monthly')">
                  Schedule Task
                </button>
              </div>
            </transition>
          </div>

          <!-- Quote Dropdown -->
          <div 
            class="dropdown-container"
            @click.stop
            @mouseenter="openSpecificDropdown('quote')"
            @mouseleave="delayedCloseSpecificDropdown('quote')"
          >
            <button :class="btnClasses('quote')">
              Quote
            </button>
            <transition name="fade">
              <div v-if="dropdowns.quote" class="dropdown-menu">
                <div class="dropdown-items-container">
                  <!-- Menu Items -->
                  <div v-for="item in quoteItems" :key="item" class="dropdown-item" @click="selectAndSchedule('quote', item)">
                    <span>{{ item }}</span>
                  </div>
                </div>
              </div>
            </transition>
          </div>
          
        </div>

        <!-- More Button (Right Side) -->
        <div class="more-button-container">
          <div 
            class="dropdown-container"
            @click.stop
            @mouseenter="openSpecificDropdown('more')"
            @mouseleave="delayedCloseSpecificDropdown('more')"
          >
            <button class="more-btn-green">
              More
            </button>
            <transition name="fade">
              <div v-if="dropdowns.more" class="dropdown-menu">
                <div class="dropdown-items-container">
                  <!-- Simple Menu Items (No checkboxes or Schedule Task) -->
                  <button v-for="item in moreItems" :key="item" class="more-item" @click="handleMoreAction(item)">
                    {{ item }}
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
       
      </div>
    </div>

      <!-- Main Grid Layout -->
      <div class="main-grid">
        <!-- Calendar and Task Section -->
        <div class="calendar-section">
          <!-- Custom Calendar -->
          <div class="calendar-card">
            <!-- Header -->
            <div class="calendar-header">
              <button @click="prevMonth" class="calendar-nav-btn">‹</button>
              <h2 class="calendar-title">
                {{ monthNames[currentMonth] }} {{ currentYear }}
              </h2>
              <button @click="nextMonth" class="calendar-nav-btn">›</button>
            </div>

            <!-- Week Days -->
            <div class="calendar-weekdays">
              <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
            </div>

            <!-- Dates -->
            <div class="calendar-dates">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                class="calendar-day"
                :class="{
                  'selected': isSelected(day),
                  'empty': !day,
                  'clickable': day
                }"
                @click="selectDate(day)"
              >
                {{ day || '' }}
              </div>
            </div>

            <!-- Selected date -->
            <div v-if="selectedDate" class="selected-date">
              Selected: {{ selectedDate }}
            </div>
          </div>
        </div>

        <!-- Templates and Holidays Section -->
        <div class="templates-section">
          <!-- Grid Content -->
          <div class="content-grid">
            <!-- Left Side: Template Section -->
            <div class="template-section">
              <!-- Template Header -->
              <div class="header-box template">
                <p>Template</p>
              </div>
              <!-- Template Grid -->
              <div class="template-grid">
                <div v-for="n in 6" :key="n" class="template-item">
                  Template {{ n }}
                </div>
              </div>
            </div>

          <!-- Right Side: Holiday Section -->
            <div class="holiday-section">
              <!-- Holiday Header -->
              <div class="header-box holiday">
                <p>Upcoming Events</p>
              </div>
              <!-- Holiday Calendar -->
              <div class="holiday-display">
                <!-- Show placeholder when no tasks -->
                <div v-if="scheduledTasks.length === 0" class="placeholder-content">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>Holiday Calendar</span>
                </div>

                <!-- Show scheduled tasks list -->
                <div v-else class="scheduled-tasks-list">
                  <div 
                    v-for="(taskItem, index) in scheduledTasks" 
                    :key="index"
                    class="scheduled-task-item"
                  >
                    <div class="task-image-box">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
                      </svg>
                    </div>
                    <div class="task-details">
                      <div class="task-name">{{ taskItem.name }}</div>
                      <div class="task-date-time">{{ taskItem.date }} at {{ taskItem.time }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Confirmation Modal -->
            <div v-if="showConfirmationModal" class="modal-overlay confirmation-modal-overlay" @click.self="cancelConfirmation">
              <div class="confirmation-modal">
                <div class="confirmation-header">
                  <h3>Confirm Schedule</h3>
                  <button class="close-btn" @click="cancelConfirmation">✕</button>
                </div>
                <div class="confirmation-body">
                  <div class="confirmation-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 12l2 2 4-4"/>
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                  </div>
                  <p class="confirmation-message">{{ confirmationMessage }}</p>
                </div>
                <div class="confirmation-actions">
                  <button class="btn-cancel" @click="cancelConfirmation">Cancel</button>
                  <button class="btn-confirm" @click="executeConfirmedAction">Yes, Schedule</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Form Modal -->
      <transition name="modal-fade">
        <div v-if="showTaskModal" class="modal-overlay" @click="closeTaskModal">
          <div class="modal-content" @click.stop>
            <!-- Close Button -->
            <button class="modal-close" @click="closeTaskModal">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <!-- Modal Header -->
            <div class="modal-header">
              <h2 class="modal-title">{{ getModalTitle() }}</h2>
            </div>

            <!-- Events Banner (Horizontal Scrolling) - Show for National Public Holidays, Weekly Task, and Monthly -->
            <div v-if="(selectedHolidays.length > 0 && (!currentDropdownSelection.category || currentDropdownSelection.category === '')) || (currentDropdownSelection.category === 'weeklyTask' || currentDropdownSelection.category === 'monthly')" class="events-banner">
              <!-- Instruction Text -->
              <div class="events-instruction">
                <p v-if="!currentDropdownSelection.category || currentDropdownSelection.category === ''">Click on holiday buttons below to select which ones to schedule. Selected holidays show with a ✓</p>
                <p v-else-if="currentDropdownSelection.category === 'weeklyTask'">Click on weekly task items button(s) below to select which ones to schedule. Selected button(s) show with a ✓</p>
                <p v-else-if="currentDropdownSelection.category === 'monthly'">Click on monthly task button(s) below to select which ones to schedule. Selected button(s) show with a ✓</p>
                <p v-else>Selected {{ formatCategoryName(currentDropdownSelection.category).toLowerCase() }} items are shown below. Click to view details.</p>
                <p v-if="!currentDropdownSelection.category || currentDropdownSelection.category === ''"><strong>Selected for scheduling: {{ activeHolidayIndices.length }}</strong> | <strong>Total holidays: {{ selectedHolidays.length }}</strong></p>
                <p v-else><strong>Selected for scheduling: {{ activeDropdownIndices.length }}</strong> | <strong>Total items: {{ currentDropdownSelection.items.length }}</strong></p>
              </div>
              
              <div class="events-scroll-container">
                <button class="scroll-arrow scroll-left" @click="scrollEventsLeft">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <div class="events-list-wrapper">
                  <div class="events-list" ref="eventsList">
                    <!-- National Public Holiday items -->
                    <button 
                      v-for="(holiday, idx) in selectedHolidays" 
                      v-if="!currentDropdownSelection.category || currentDropdownSelection.category === ''"
                      :key="`event-${idx}`" 
                      class="event-item"
                      :class="{ active: activeHolidayIndices.includes(idx) }"
                      @click="toggleHoliday(idx)"
                    >
                      <span class="event-name">{{ holiday.name }}</span>
                      <span v-if="activeHolidayIndices.includes(idx)" class="checkmark">✓</span>
                    </button>
                    
                    <!-- Weekly Task / Monthly dropdown items -->
                    <button 
                      v-for="(item, idx) in currentDropdownSelection.items" 
                      v-if="currentDropdownSelection.category === 'weeklyTask' || currentDropdownSelection.category === 'monthly'"
                      :key="`dropdown-event-${idx}`" 
                      class="event-item"
                      :class="{ active: activeDropdownIndices.includes(idx) }"
                      @click="toggleDropdownItem(idx)"
                    >
                      <span class="event-name">{{ item }}</span>
                      <span v-if="activeDropdownIndices.includes(idx)" class="checkmark">✓</span>
                    </button>
                  </div>
                </div>
                <button class="scroll-arrow scroll-right" @click="scrollEventsRight">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Birthday Header Bar -->
            <div v-if="currentDropdownSelection.category === 'birthday' || currentDropdownSelection.category === 'specialEvents' || currentDropdownSelection.category === 'businessAdvert' || currentDropdownSelection.category === 'quote'" class="birthday-header-bar">
              <div class="header-inner-container">
                <div class="header-section">
                  <span class="header-label">Heading</span>
                  <input 
                    type="text" 
                    class="header-input" 
                    :placeholder="isInputFocused ? '' : placeholderText"
                    @focus="handleInputFocus"
                    @blur="handleInputBlur"
                  />
                </div>
                
                <div class="datetime-container">
                  <div class="datetime-label-section" @click="handleDateClick">
                    <span class="datetime-label">Date/Time</span>
                  </div>
                  <div class="datetime-value-section">
                    <span class="datetime-value">{{ displayDateTime }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-body">
              <!-- Description Section (Button inside dashed box) -->
              <div class="description-row">
                <div class="description-section" :class="{ 'birthday-description-section': currentDropdownSelection.category === 'birthday' || currentDropdownSelection.category === 'specialEvents' || currentDropdownSelection.category === 'businessAdvert' }">
                  <label class="section-label">Description:</label>
                  <div v-if="currentDropdownSelection.category === 'birthday' || currentDropdownSelection.category === 'specialEvents' || currentDropdownSelection.category === 'businessAdvert'" class="birthday-grid-container">
                    <div class="textarea-container">
                      <textarea 
                        v-model="organizerName" 
                        class="description-textarea" 
                        rows="6"
                        placeholder="Sample:&#10;(James Williams, Chairman Finland Intercontinental)&#10;Quote &quot;wishing you many years ahead, Amen&quot;&#10;Phone No: 08032-----54&#10;Facebook/WhatsApp: jamesw_02"
                      ></textarea>
                      <div class="fab-group">
                        <button class="btn-generate-quotes" @click="handleGenerateQuoteClick">
                          <svg viewBox="0 0 24 24">
                            <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
                          </svg>
                          Generate Quote
                        </button>
                        <button class="btn-microphone" @click="handleMicrophoneClick">
                          <svg viewBox="0 0 24 24">
                            <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z" />
                            <path d="M19 10a7 7 0 0 1-14 0" />
                            <path d="M12 17v4" />
                            <path d="M8 21h8" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <!-- Blue Box / Info Form - Same Position -->
                    <div class="blue-box-container">
                      <!-- Show form when clicked -->
                      <div v-if="showInfoForm" class="presenter-form">
                        <!-- Presenter (Optional) Section -->
                        <div class="form-section">
                          <h3 class="section-title">Information</h3>
                          <textarea v-model="sponsorInfo.fullText" placeholder="Presented/Sponsored by:&#10;David Lius&#10;(Financial Secretary)&#10;08052------42" class="combined-input" rows="4"></textarea>
                        </div>
                        
                        <!-- Presenter (Image/Logo) Section -->
                        <div class="form-section logo-section">
                          <div class="upload-section">
                            <input type="file" @change="handlePresenterLogoUpload" accept="image/*" class="hidden-input" ref="logoInput" />
                            <div v-if="!logoPreviewUrl" @click="$refs.logoInput.click()" class="upload-box-presenter">
                              <div class="upload-icon">
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                  <circle cx="8.5" cy="8.5" r="1.5"/>
                                  <polyline points="21,15 16,10 5,21"/>
                                </svg>
                              </div>
                              <p class="upload-text">Upload Logo</p>
                            </div>
                            <div v-else class="logo-preview-container">
                              <img :src="logoPreviewUrl" alt="Logo Preview" class="logo-preview-image" />
                              <button @click="removePresenterLogo" class="logo-remove-btn" type="button">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="form-actions-inline">
                          <button @click="showInfoForm = false" class="back-btn">Back</button>
                        </div>
                      </div>
                      
                      <!-- Show blue box when not editing -->
                      <div v-else class="blue-box" @click="showInfoForm = true">
                        <p class="blue-box-text">Do you want to be courtesy or sponsorer on this design</p>
                        <div class="click-here-section">
                          <div class="hand-icon">👇</div>
                          <span class="click-here-text">click here</span>
                        </div>
                        <p class="blue-box-text-small">to fill in your information</p>
                      </div>
                    </div>
                    <div class="upload-time-container">
                      <!-- Picture Upload Section -->
                      <div class="upload-section-new" :class="{ disabled: uploadedPictures.length >= 3 }">
                        <label class="upload-label">
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple
                            class="upload-input"
                            :disabled="uploadedPictures.length >= 3"
                            @change="handlePictureUpload"
                          />
                          <div class="upload-box-new">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21 15 16 10 5 21"/>
                            </svg>
                            <span class="upload-text-new">{{ uploadedPictures.length < 3 ? `Upload Pictures (${uploadedPictures.length}/3)` : 'Max 3 Pictures' }}</span>
                          </div>
                        </label>
                      </div>
                      <!-- Image Preview Section -->
                      <div class="image-preview-section">
                        <div class="preview-container">
                          <div v-if="uploadedPictures.length === 0" class="preview-placeholder">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21 15 16 10 5 21"/>
                            </svg>
                            <span class="preview-text">Preview ({{ uploadedPictures.length }}/3)</span>
                          </div>
                          <div v-else class="image-grid">
                            <div 
                              v-for="(picture, index) in uploadedPictures" 
                              :key="index" 
                              class="image-item"
                              @click="handleImageClick(picture, index)"
                            >
                              <img :src="picture.url" :alt="`Picture ${index + 1}`" class="uploaded-image" />
                              <button 
                                class="remove-image-btn"
                                @click.stop="handleRemoveImage(index)"
                                aria-label="Remove image"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="description-flex">
                    <div class="textarea-container">
                      <textarea 
                        v-model="organizerName" 
                        class="description-textarea" 
                        rows="6"
                        placeholder="Sample:&#10;(James Williams, Chairman Finland Intercontinental)&#10;Quote &quot;wishing you many years ahead, Amen&quot;&#10;Phone No: 08032-----54&#10;Facebook/WhatsApp: jamesw_02"
                      ></textarea>
                      <div class="fab-group">
                        <button class="btn-generate-quotes" @click="handleGenerateQuoteClick">
                          <svg viewBox="0 0 24 24">
                            <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
                          </svg>
                          Generate Quote
                        </button>
                        <button class="btn-microphone" @click="handleMicrophoneClick">
                          <svg viewBox="0 0 24 24">
                            <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z" />
                            <path d="M19 10a7 7 0 0 1-14 0" />
                            <path d="M12 17v4" />
                            <path d="M8 21h8" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Upload, Preview and Time Section for non-birthday modals -->
                  <div v-if="currentDropdownSelection.category !== 'birthday' && currentDropdownSelection.category !== 'specialEvents'" class="upload-time-container">
                <!-- Picture Upload Section -->
                <div class="upload-section-new" :class="{ disabled: uploadedPictures.length >= 3 }">
                  <label class="upload-label">
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      class="upload-input"
                      :disabled="uploadedPictures.length >= 3"
                      @change="handlePictureUpload"
                    />
                    <div class="upload-box-new">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span class="upload-text-new">{{ uploadedPictures.length < 3 ? `Upload Pictures (${uploadedPictures.length}/3)` : 'Max 3 Pictures' }}</span>
                    </div>
                  </label>
                </div>

                <!-- Image Preview Section -->
                <div class="image-preview-section">




                  <div class="preview-container">
                    <div v-if="uploadedPictures.length === 0" class="preview-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span class="preview-text">Preview ({{ uploadedPictures.length }}/3)</span>
                    </div>
                    <div v-else class="image-carousel" @wheel="handleWheel">
                      <!-- Navigation arrows -->
                      <button 
                        v-if="uploadedPictures.length > 1" 
                        class="nav-arrow nav-left" 
                        @click="previousImage"
                        title="Previous image (continuous loop) - Use ← key"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>
                      
                      <!-- Current image with enhanced features -->
                      <div class="image-wrapper">
                        
                        <img 
                          :src="uploadedPictures[currentPreviewIndex]" 
                          alt="Preview Image" 
                          class="preview-image"
                          draggable="true"
                          @dblclick="openImagePreview"
                          @dragstart="handleDragStart($event, currentPreviewIndex)"
                          @dragover="handleDragOver"
                          @drop="handleDrop($event, currentPreviewIndex)"
                          @touchstart="handleTouchStart"
                          @touchend="handleTouchEnd"
                        />
                        
                        <button 
                          class="delete-image-btn" 
                          @click="deleteImage(currentPreviewIndex)" 
                          title="Delete this image">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                      
                      <button 
                        v-if="uploadedPictures.length > 1" 
                        class="nav-arrow nav-right" 
                        @click="nextImage"
                        title="Next image (continuous loop) - Use → key"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                      
                      <!-- Image indicators with drag & drop -->
                      <div v-if="uploadedPictures.length > 1" class="image-indicators">
                        <div 
                          v-for="(image, index) in uploadedPictures" 
                          :key="index"
                          class="indicator-wrapper"
                          draggable="true"
                          @dragstart="handleDragStart($event, index)"
                          @dragover="handleDragOver"
                          @drop="handleDrop($event, index)"
                        >
                          <button 
                            @click="currentPreviewIndex = index"
                            class="indicator" 
                            :class="{ active: index === currentPreviewIndex }"
                          >
                          </button>
                        </div>
                      </div>
                      
                      <!-- Image counter -->
                      <div class="image-counter">{{ currentPreviewIndex + 1 }}/{{ uploadedPictures.length }}</div>
                    </div>
                  </div>
                </div>

                <!-- Time Selector Section -->
                <div v-if="currentDropdownSelection.category !== 'birthday'" class="time-selector-section-new">
                  <div class="time-display-box-new" @click="initializeTimePicker(); showCustomTimePicker = true">
                    <div class="time-display-large">
                      <span class="time-value-large">{{ selectedTime ? formatDisplayTime(selectedTime) : '8:00' }}</span>
                      <div class="time-period-toggle-new">
                        <button 
                          type="button"
                          class="period-option-new" 
                          :class="{ active: getTimePeriod() === 'AM' }" 
                          @click.stop="setTimePeriod('AM')"
                        >
                          am
                        </button>
                        <button 
                          type="button"
                          class="period-option-new" 
                          :class="{ active: getTimePeriod() === 'PM' }" 
                          @click.stop="setTimePeriod('PM')"
                        >
                          pm
                        </button>
                      </div>
                    </div>

                    <!-- Custom Time Picker Dropdown -->
                    <div v-if="showCustomTimePicker" class="custom-time-picker" @click.stop>
                      <div class="time-picker-header">
                        <span>Select Time</span>
                        <button class="close-picker" @click="showCustomTimePicker = false">✕</button>
                      </div>
                      <div class="time-picker-body">
                        <!-- Hour Column -->
                        <div class="time-column">
                          <div class="column-label">Hour</div>
                          <div class="time-box-container">
                            <button class="time-arrow time-arrow-up" @click="incrementHour" @mousedown="startContinuousIncrement('hour')" @mouseup="stopContinuous" @mouseleave="stopContinuous">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="18 15 12 9 6 15"></polyline>
                              </svg>
                            </button>
                            <div class="time-display-value">
                              {{ timePickerHour }}
                            </div>
                            <button class="time-arrow time-arrow-down" @click="decrementHour" @mousedown="startContinuousDecrement('hour')" @mouseup="stopContinuous" @mouseleave="stopContinuous">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div class="time-separator">:</div>
                        
                        <!-- Minute Column -->
                        <div class="time-column">
                          <div class="column-label">Minute</div>
                          <div class="time-box-container">
                            <button class="time-arrow time-arrow-up" @click="incrementMinute" @mousedown="startContinuousIncrement('minute')" @mouseup="stopContinuous" @mouseleave="stopContinuous">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="18 15 12 9 6 15"></polyline>
                              </svg>
                            </button>
                            <div class="time-display-value">
                              {{ timePickerMinute }}
                            </div>
                            <button class="time-arrow time-arrow-down" @click="decrementMinute" @mousedown="startContinuousDecrement('minute')" @mouseup="stopContinuous" @mouseleave="stopContinuous">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <!-- AM/PM Column -->
                        <div class="time-column period-column">
                          <div class="column-label">Period</div>
                          <div class="time-box-container period-container">
                            <div class="period-option" :class="{ 'selected': timePeriod === 'am' }" @click="timePeriod = 'am'">
                              AM
                            </div>
                            <div class="period-option" :class="{ 'selected': timePeriod === 'pm' }" @click="timePeriod = 'pm'">
                              PM
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="time-picker-footer">
                        <button class="btn-confirm-time" @click="confirmTime">Confirm</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                </div>
              </div>

              <!-- Social Media and Action Buttons Section -->
              <div class="bottom-actions-container" :class="{ 'birthday-layout': currentDropdownSelection.category === 'birthday' || currentDropdownSelection.category === 'specialEvents' || currentDropdownSelection.category === 'businessAdvert' }">
                <!-- Social Media Section -->
                <div class="social-media-section">
                  <div class="social-header-new">
                    <span>Select Social Media</span>
                    <button type="button" class="btn-select-all-social" @click="toggleSelectAllSocial">{{ selectAllButtonText }}</button>
                  </div>
                  <div class="social-icons">
                    <button type="button" class="social-icon facebook" :class="{ selected: selectedSocialMedia.includes('facebook') }" @click="toggleSocialMedia('facebook')" title="Facebook">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </button>
                    <button type="button" class="social-icon whatsapp" :class="{ selected: selectedSocialMedia.includes('whatsapp') }" @click="toggleSocialMedia('whatsapp')" title="WhatsApp">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </button>
                    <button type="button" class="social-icon instagram" :class="{ selected: selectedSocialMedia.includes('instagram') }" @click="toggleSocialMedia('instagram')" title="Instagram">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.630c-.789.306-1.459.717-2.126 1.384S.935 3.35.630 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.630c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                      </svg>
                    </button>
                    <button type="button" class="social-icon twitter" :class="{ selected: selectedSocialMedia.includes('twitter') }" @click="toggleSocialMedia('twitter')" title="Twitter">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </button>
                    <button type="button" class="social-icon tiktok" :class="{ selected: selectedSocialMedia.includes('tiktok') }" @click="toggleSocialMedia('tiktok')" title="TikTok">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                      </svg>
                    </button>
                    <button type="button" class="social-icon youtube" :class="{ selected: selectedSocialMedia.includes('youtube') }" @click="toggleSocialMedia('youtube')" title="YouTube">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </button>
                    <button type="button" class="social-icon linkedin" :class="{ selected: selectedSocialMedia.includes('linkedin') }" @click="toggleSocialMedia('linkedin')" title="LinkedIn">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </button>
                    <button type="button" class="social-icon telegram" :class="{ selected: selectedSocialMedia.includes('telegram') }" @click="toggleSocialMedia('telegram')" title="Telegram">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </button>
                    <button type="button" class="social-icon snapchat" :class="{ selected: selectedSocialMedia.includes('snapchat') }" @click="toggleSocialMedia('snapchat')" title="Snapchat">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.510.075.045.203.09.401.09.3-0 .73-.329 1.05-.54.26-.171.354-.21.442-.21.027 0 .049.003.065.008.261.043.264.361.264.431 0 .54-.494 1.085-1.226 1.085-.31 0-.599-.074-.896-.15-.295-.074-.591-.15-.968-.15-.18 0-.368.025-.562.075-.05.014-.101.028-.153.044l.009.009-.013-.004c-.077 1.529-.138 2.772-.415 3.734-.302 1.047-.837 1.857-1.592 2.408-1.03.754-2.367 1.094-3.625 1.094-1.25 0-2.582-.34-3.61-1.094-.755-.551-1.29-1.361-1.593-2.408-.274-.952-.334-2.171-.407-3.67-.014-.257-.029-.52-.048-.794-.17-.047-.357-.082-.557-.082-.374 0-.666.076-.957.15-.296.076-.588.15-.897.15-.73 0-1.224-.546-1.224-1.085 0-.069.003-.387.263-.43.016-.005.038-.008.065-.008.089 0 .183.039.444.21.319.211.75.54 1.049.54.199 0 .325-.045.401-.09-.006-.12-.013-.246-.023-.376l-.021-.289c-.106-1.628-.232-3.654.297-4.847 1.582-3.545 4.939-3.821 5.929-3.821zm.001 1.321c-.81 0-3.784.212-5.135 3.197-.433.967-.32 2.626-.218 4.167.014.203.028.408.042.615l.029.427c.011.161.022.326.033.492.023.346.186.591.453.591.122 0 .227-.039.317-.125.296-.283.481-.791.725-1.403.251-.63.53-1.343 1.017-1.788.332-.304.785-.453 1.386-.453.603 0 1.056.149 1.388.453.487.445.767 1.158 1.018 1.788.244.612.429 1.12.725 1.403.09.086.195.125.317.125.267 0 .43-.245.453-.591.012-.166.023-.331.034-.492l.029-.427c.014-.207.028-.412.042-.615.102-1.541.215-3.2-.218-4.167-1.35-2.985-4.324-3.197-5.134-3.197z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons-new">
                  <!-- Birthday, Special Events, and Business Advert modals only show Schedule Task button -->
                  <template v-if="currentDropdownSelection.category === 'birthday' || currentDropdownSelection.category === 'specialEvents' || currentDropdownSelection.category === 'businessAdvert'">
                    <button 
                      class="btn-schedule-all-new" 
                      @click="confirmScheduleAllTasks"
                      :disabled="!selectedTime"
                    >
                      Schedule Task
                    </button>
                  </template>
                  
                  <!-- All other modals show both buttons -->
                  <template v-else>
                    <button 
                      class="btn-schedule-selected-new" 
                      @click="confirmScheduleSelectedTask"
                      :disabled="((currentDropdownSelection.category === 'weeklyTask' || currentDropdownSelection.category === 'monthly') && activeDropdownIndices.length === 0) || ((!currentDropdownSelection.category || currentDropdownSelection.category === '') && activeHolidayIndices.length === 0) || !selectedTime"
                    >
                      Schedule Selected Task ({{ (currentDropdownSelection.category === 'weeklyTask' || currentDropdownSelection.category === 'monthly') ? activeDropdownIndices.length : activeHolidayIndices.length }})
                    </button>
                    <button 
                      class="btn-schedule-all-new" 
                      @click="confirmScheduleAllTasks"
                      :disabled="((currentDropdownSelection.category === 'weeklyTask' || currentDropdownSelection.category === 'monthly') ? currentDropdownSelection.items.length === 0 : selectedHolidays.length === 0) || !selectedTime"
                    >
                      Schedule All Tasks ({{ (currentDropdownSelection.category === 'weeklyTask' || currentDropdownSelection.category === 'monthly') ? currentDropdownSelection.items.length : selectedHolidays.length }})
                    </button>
                  </template>
                </div>
              </div>

              <!-- Scheduled Task Card -->
              <div v-if="scheduledTask" class="scheduled-task-card">
                <div class="success-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 class="card-title">
                  {{ selectedHolidays.length > 0 ? 'Task Scheduled! Continue with remaining holidays.' : 'All Tasks Scheduled Successfully!' }}
                </h3>
                <p v-if="selectedHolidays.length > 0" class="card-subtitle">
                  {{ selectedHolidays.length }} holiday(s) remaining to schedule
                </p>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>



  <!-- Image Cropper Modal -->
  <LogoCropper
    v-if="showCropper && currentImageToCrop"
    :is-open="showCropper"
    :image-url="currentImageToCrop"
    @crop="handleCropComplete"
    @close="closeCropper"
  />
  
  <!-- Date/Time Picker Modal -->
  <div v-if="showDateTimePicker" class="datetime-modal-overlay" @click="closeDateTimePicker">
    <div class="datetime-picker-modal" @click.stop>
      <!-- Calendar View -->
      <div v-if="pickerStep === 'date'" class="calendar-container">
        <div class="calendar-header">
          <h3>{{ formatSelectedDateHeader() }}</h3>
        </div>
        
        <div class="calendar-nav">
          <button @click="pickerPreviousMonth" class="nav-btn">
            <svg viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </button>
          <span class="month-year">{{ currentMonthName }} {{ pickerYear }}</span>
          <button @click="pickerNextMonth" class="nav-btn">
            <svg viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </button>
        </div>
        
        <div class="calendar-grid">
          <div class="weekday-headers">
            <div class="weekday">Sun</div>
            <div class="weekday">Mon</div>
            <div class="weekday">Tue</div>
            <div class="weekday">Wed</div>
            <div class="weekday">Thu</div>
            <div class="weekday">Fri</div>
            <div class="weekday">Sat</div>
          </div>
          
          <div class="calendar-days">
            <div 
              v-for="day in calendarPickerDays" 
              :key="day.key"
              :class="[
                'calendar-day',
                { 
                  'other-month': day.otherMonth,
                  'selected': day.date === selectedPickerDate && !day.otherMonth,
                  'today': day.isToday && !day.otherMonth
                }
              ]"
              @click="pickerSelectDate(day)"
            >
              {{ day.date }}
            </div>
          </div>
        </div>
        
        <div class="calendar-actions">
          <button class="cancel-btn" @click="closeDateTimePicker">Cancel</button>
          <button 
            class="set-btn" 
            :disabled="!selectedPickerDate"
            @click="proceedToTimePicker"
          >
            Set Date
          </button>
        </div>
      </div>
      
      <!-- Clock View -->
      <div v-if="pickerStep === 'time'" class="clock-container">
        <div class="clock-header">
          <div class="header-content">
            <h3>Select Time</h3>
            <div class="selected-date-display">
              {{ formatSelectedDate() }}
            </div>
          </div>
          <button class="close-btn" @click="closeDateTimePicker">
            <svg viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <!-- Clock Interface -->
        <div v-if="!showTimeInput" class="clock-face">
          <div class="clock-circle">
            <div class="clock-center"></div>
            
            <!-- Keyboard Toggle positioned beside clock -->
            <svg class="keyboard-toggle-absolute" @click="showTimeInput = true" title="Input Time" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/>
            </svg>
            
            <!-- Hour markers (shown when minute picker is not active) -->
            <div v-if="!showMinutePicker" 
              v-for="hour in 12" 
              :key="hour"
              :class="['hour-marker', { active: selectedHour === hour }]"
              :style="getHourPosition(hour)"
              @click="selectHour(hour)"
            >
              {{ hour }}
            </div>
            
            <!-- Minute markers (shown when hour is selected) -->
            <div v-if="showMinutePicker" 
              v-for="minute in minuteMarkers" 
              :key="minute"
              :class="['minute-marker', { active: selectedMinute === minute }]"
              :style="getMinutePosition(minute)"
              @click="selectMinute(minute)"
            >
              {{ minute.toString().padStart(2, '0') }}
            </div>
            
            <!-- Clock hands -->
            <div v-if="!showMinutePicker"
              class="clock-hand hour-hand"
              :style="getHourHandRotation()"
            ></div>
            <div v-if="showMinutePicker"
              class="clock-hand minute-hand"
              :style="getMinuteHandRotation()"
            ></div>
          </div>
          
          <div class="time-display">
            <span class="time-value">{{ formatTime() }}</span>
            <div class="am-pm-toggle">
              <button 
                :class="['am-pm-btn', { active: selectedPeriod === 'AM' }]"
                @click="selectedPeriod = 'AM'"
              >
                AM
              </button>
              <button 
                :class="['am-pm-btn', { active: selectedPeriod === 'PM' }]"
                @click="selectedPeriod = 'PM'"
              >
                PM
              </button>
            </div>
          </div>
          
          <div class="clock-controls">
          </div>
          
        </div>
        
        <!-- Time Input Interface -->
        <div v-if="showTimeInput" class="time-input-interface">
          <div class="time-input-group">
            <input 
              type="number" 
              v-model.number="inputHour" 
              min="1" 
              max="12" 
              class="time-input"
              placeholder="12"
            />
            <span class="time-separator">:</span>
            <input 
              type="number" 
              v-model.number="inputMinute" 
              min="0" 
              max="59" 
              class="time-input"
              placeholder="00"
            />
            <select v-model="selectedPeriod" class="period-select">
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
          
          <button class="clock-toggle" @click="showTimeInput = false">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
              <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
            </svg>
            Clock View
          </button>
        </div>
        
        <!-- Clock Action Buttons - Always Visible -->
        <div class="button-group">
          <button class="cancel-btn" @click="smartBackNavigation">Back</button>
          <button class="cancel-btn" @click="closeDateTimePicker">Cancel</button>
          <button class="set-btn" @click="setDateTime">Set Time</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import LogoCropper from '@/components/image/LogoCropper.vue'

// State
const selectedDate = ref<string | null>(null)
const selectedTime = ref('08:00')
const task = ref('')
const scheduledTask = ref(false)
const selection = ref('holiday')
const selectedHolidays = ref<Array<{ date: string; name: string }>>([])  
const holidayDropdownOpen = ref(false)
const allSelected = ref(false)
const showTaskModal = ref(false)
const scheduledTasks = ref<Array<{ date: string; time: string; name: string; source: string }>>([])
const uploadedLogo = ref<string | null>(null)
const uploadedPictures = ref<string[]>([])
const currentPreviewIndex = ref(0)
const currentHolidayIndex = ref<number>(0)

// Sponsor Info Modal State
const showInfoForm = ref(false)
const sponsorInfo = ref({
  fullText: '',
  logo: null
})
const logoPreviewUrl = ref('')

// Image cropping state
const showCropper = ref(false)
const currentImageToCrop = ref('')
const pendingImages = ref<string[]>([])
const currentCropIndex = ref(0)

// Advanced carousel features
const isDragging = ref(false)
const dragStartIndex = ref(-1)
const showImagePreview = ref(false)
const previewImageUrl = ref('')
const activeHolidayIndices = ref<number[]>([])

// Date/Time Picker State
const showDateTimePicker = ref(false)
const pickerStep = ref('date') // 'date' or 'time'
const selectedPickerDate = ref(null)
const pickerMonth = ref(new Date().getMonth())
const pickerYear = ref(new Date().getFullYear())
const selectedHour = ref(12)
const selectedMinute = ref(0)
const selectedPeriod = ref('AM')
const showTimeInput = ref(false)
const showMinutePicker = ref(false)
const inputHour = ref(12)
const inputMinute = ref(0)

// Display DateTime for the button
const displayDateTime = ref('--/-- 00:00am')

// Alternating placeholder for Happy Birthday input
const placeholderText = ref('Happy Birthday')
const isInputFocused = ref(false)
const placeholderInterval = ref<number | null>(null)

// Active dropdown items for Weekly Task and Monthly
const activeDropdownIndices = ref<number[]>([])
const organizerName = ref('')
const timePeriod = ref<'am' | 'pm'>('am')
const timeInput = ref<HTMLInputElement | null>(null)
const eventsList = ref<HTMLDivElement | null>(null)
const hourScroll = ref<HTMLDivElement | null>(null)
const minuteScroll = ref<HTMLDivElement | null>(null)
let closeTimeout: number | null = null

// Social Media Selection State
const selectedSocialMedia = ref<string[]>([])

// New Dropdown System
const dropdowns = ref({
  specialEvents: false,
  businessAdvert: false,
  weeklyTask: false,
  monthly: false,
  quote: false,
  more: false
})

const selectedItems = ref({
  specialEvents: [] as string[],
  businessAdvert: [] as string[],
  weeklyTask: [] as string[],
  monthly: [] as string[],
  quote: [] as string[]
})

const selectAllStates = ref({
  specialEvents: false,
  businessAdvert: false,
  weeklyTask: false,
  monthly: false,
  quote: false
})

// Menu Items
const specialEventsItems = [] as string[]
const businessAdvertItems = ['Product Launch', 'Promo', 'Business Update']
const weeklyTaskItems = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const monthlyItems = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const quoteItems = ['Daily Quote', 'Motivational', 'Wisdom Quote']
const moreItems = ['Set-up Signee', 'Document Schedule', 'Set-up Colour']

// Custom Time Picker State
const showCustomTimePicker = ref(false)
const showConfirmationModal = ref(false)
const confirmationAction = ref(null)
const confirmationMessage = ref('')

// Store currently selected dropdown items for modal display
const currentDropdownSelection = ref({
  category: '',
  items: [] as string[]
})

const timePickerHour = ref('08')
const timePickerMinute = ref('00')
const hours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
const minutes = [
  '00', '01', '02', '03', '04', '05', '06', '07', '08', '09',
  '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '20', '21', '22', '23', '24', '25', '26', '27', '28', '29',
  '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
  '40', '41', '42', '43', '44', '45', '46', '47', '48', '49',
  '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'
]

// Initialize picker with current time if available
function initializeTimePicker() {
  if (selectedTime.value) {
    const [hours24, mins] = selectedTime.value.split(':')
    let hour12 = parseInt(hours24)
    
    // Convert 24-hour to 12-hour format
    if (hour12 === 0) {
      hour12 = 12
      timePeriod.value = 'am'
    } else if (hour12 < 12) {
      timePeriod.value = 'am'
    } else if (hour12 === 12) {
      timePeriod.value = 'pm'
    } else {
      hour12 -= 12
      timePeriod.value = 'pm'
    }
    
    timePickerHour.value = hour12.toString().padStart(2, '0')
    timePickerMinute.value = mins
  }
}

const holidays = ref([
  { date: '2025-01-01', name: "New Year's Day" },
  { date: '2025-03-31', name: 'Eid el-Fitr' },
  { date: '2025-04-01', name: 'Eid el-Fitr Holiday' },
  { date: '2025-04-18', name: 'Good Friday' },
  { date: '2025-04-21', name: 'Easter Monday' },
  { date: '2025-05-01', name: "Workers' Day" },
  { date: '2025-06-06', name: 'Eid-ul-Adha' },
  { date: '2025-06-09', name: 'Eid-ul-Adha Holiday' },
  { date: '2025-06-12', name: 'Democracy Day' },
  { date: '2025-07-15', name: 'Day of Mourning (Buhari)' },
  { date: '2025-09-04', name: 'Eid-el-Maulud' },
  { date: '2025-10-01', name: 'Independence Day' },
  { date: '2025-12-25', name: 'Christmas Day' },
  { date: '2025-12-26', name: 'Boxing Day' }
])

// Hover dropdown handling
function openHolidayDropdown() {
  if (closeTimeout) {
    window.clearTimeout(closeTimeout)
  }
  holidayDropdownOpen.value = true
}

function delayedCloseHolidayDropdown() {
  closeTimeout = window.setTimeout(() => {
    holidayDropdownOpen.value = false
  }, 200)
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedHolidays.value = [...holidays.value]
  } else {
    selectedHolidays.value = []
  }
}

function openTaskModal() {
  showTaskModal.value = true
}

function openTaskModalFromDropdown() {
  // Clear dropdown selection for National Public Holiday
  currentDropdownSelection.value = {
    category: '',
    items: []
  }
  showTaskModal.value = true
  holidayDropdownOpen.value = false
}

function closeTaskModal() {
  showTaskModal.value = false
}

function getModalTitle(): string {
  // If we have a dropdown category selected, check if it's a single-item selection type
  if (currentDropdownSelection.value.category && currentDropdownSelection.value.category !== '') {
    // For Special Events, Business Advert, Quote, and Birthday - show the specific item name
    if ((currentDropdownSelection.value.category === 'specialEvents' || 
         currentDropdownSelection.value.category === 'businessAdvert' || 
         currentDropdownSelection.value.category === 'quote' ||
         currentDropdownSelection.value.category === 'birthday') &&
        currentDropdownSelection.value.items.length === 1) {
      return currentDropdownSelection.value.items[0]
    }
    
    // For other categories (Weekly Task, Monthly Task, etc.) - show the formatted category name
    return formatCategoryName(currentDropdownSelection.value.category)
  }
  
  // If we're dealing with National Public Holidays (no category but have holidays)
  if (selectedHolidays.value.length > 0 && (!currentDropdownSelection.value.category || currentDropdownSelection.value.category === '')) {
    return 'National Public Holidays'
  }
  
  // Default fallback
  return 'Task Description'
}

// New Dropdown Functions
function toggleDropdown(menuName: keyof typeof dropdowns.value) {
  // Close all other dropdowns first
  Object.keys(dropdowns.value).forEach(key => {
    if (key !== menuName) {
      dropdowns.value[key as keyof typeof dropdowns.value] = false
    }
  })
  
  // Toggle the current dropdown
  dropdowns.value[menuName] = !dropdowns.value[menuName]
  
  // Close holiday dropdown if it's open
  if (dropdowns.value[menuName]) {
    holidayDropdownOpen.value = false
  }
}

function toggleSelectAllForMenu(menuName: keyof typeof selectedItems.value) {
  const items = getItemsForMenu(String(menuName))
  const currentlyAllSelected = selectAllStates.value[menuName]
  
  // Toggle the state
  selectAllStates.value[menuName] = !currentlyAllSelected
  
  // Update selected items based on new state
  if (selectAllStates.value[menuName]) {
    selectedItems.value[menuName] = [...items]
  } else {
    selectedItems.value[menuName] = []
  }
}

function toggleItemForMenu(menuName: keyof typeof selectedItems.value, item: string) {
  const currentItems = selectedItems.value[menuName] || []
  
  if (currentItems.includes(item)) {
    // Remove item
    selectedItems.value[menuName] = currentItems.filter(i => i !== item)
  } else {
    // Add item
    selectedItems.value[menuName] = [...currentItems, item]
  }
  
  // Update select all state based on whether all items are selected
  const allItems = getItemsForMenu(String(menuName))
  selectAllStates.value[menuName] = selectedItems.value[menuName].length === allItems.length
}

function getItemsForMenu(menuName: string): string[] {
  switch (menuName) {
    case 'specialEvents': return specialEventsItems
    case 'businessAdvert': return businessAdvertItems
    case 'weeklyTask': return weeklyTaskItems
    case 'monthly': return monthlyItems
    case 'quote': return quoteItems
    default: return []
  }
}

// Function to select an item and open modal directly
function selectAndSchedule(category: string, item: string) {
  // Store the selected category and item for modal display
  currentDropdownSelection.value = {
    category: category,
    items: [item]
  }
  
  // Close the dropdown
  dropdowns.value[category as keyof typeof dropdowns.value] = false
  
  // Open the task modal
  showTaskModal.value = true
}

function scheduleDropdownTask(menuName: keyof typeof selectedItems.value) {
  const selected = selectedItems.value[menuName]
  if (selected.length > 0) {
    // Store the selected category and items for modal display
    currentDropdownSelection.value = {
      category: menuName,
      items: [...selected]
    }
    
    // Reset active dropdown indices - items should start unselected
    activeDropdownIndices.value = []
    
    // Open the task modal with the selected items
    showTaskModal.value = true
    // Close the dropdown
    dropdowns.value[menuName as keyof typeof dropdowns.value] = false
  } else {
    alert('Please select at least one item before scheduling.')
  }
}

function formatCategoryName(category: string): string {
  switch (category) {
    case 'weeklyTask':
      return 'Weekly Task'
    case 'monthly':
      return 'Monthly'
    case 'specialEvents':
      return 'Congratulatory/Special Events'
    case 'businessAdvert':
      return 'Business Advert'
    case 'quote':
      return 'Quote'
    case 'birthday':
      return 'Birthday'
    default:
      return category.replace(/([A-Z])/g, ' $1').trim()
  }
}

function handleMoreAction(action: string) {
  // Handle the "More" menu actions here
  switch (action) {
    case 'Set-up Signee':
      // Handle signee setup
      break
    case 'Document Schedule':
      // Handle document schedule
      break
    case 'Set-up Colour':
      // Handle color setup
      break
  }
  // Close the dropdown
  dropdowns.value.more = false
}

function handleBirthdayClick() {
  // Store the selected category and item for modal display
  currentDropdownSelection.value = {
    category: 'birthday',
    items: ['Birthday']
  }
  
  // Close all dropdowns first
  Object.keys(dropdowns.value).forEach(key => {
    dropdowns.value[key as keyof typeof dropdowns.value] = false
  })
  
  // Close holiday dropdown if it's open
  holidayDropdownOpen.value = false
  
  // Set selection to birthday
  selection.value = 'birthday'
  
  // Open task modal for birthday scheduling
  showTaskModal.value = true
}

function handleBusinessAdvertClick() {
  // Store the selected category and item for modal display
  currentDropdownSelection.value = {
    category: 'businessAdvert',
    items: ['Business Advert']
  }
  
  // Close all dropdowns first
  Object.keys(dropdowns.value).forEach(key => {
    dropdowns.value[key as keyof typeof dropdowns.value] = false
  })
  
  // Close holiday dropdown if it's open
  holidayDropdownOpen.value = false
  
  // Set selection to business advert
  selection.value = 'businessAdvert'
  
  // Open task modal for business advert scheduling
  showTaskModal.value = true
}

function handleSpecialEventsClick() {
  // Store the selected category and item for modal display
  currentDropdownSelection.value = {
    category: 'specialEvents',
    items: ['Congratulatory/Special Events']
  }
  
  // Close all dropdowns first
  Object.keys(dropdowns.value).forEach(key => {
    dropdowns.value[key as keyof typeof dropdowns.value] = false
  })
  
  // Close holiday dropdown if it's open
  holidayDropdownOpen.value = false
  
  // Set selection to special events
  selection.value = 'specialEvents'
  
  // Restart placeholder animation with correct texts for special events
  startPlaceholderAnimation()
  
  // Open task modal for special events scheduling
  showTaskModal.value = true
}

// Hover functions for new dropdowns
let specificDropdownTimeout: number | null = null

function openSpecificDropdown(menuName: keyof typeof dropdowns.value) {
  if (specificDropdownTimeout) {
    window.clearTimeout(specificDropdownTimeout)
  }
  
  // Close all other dropdowns first
  Object.keys(dropdowns.value).forEach(key => {
    if (key !== menuName) {
      dropdowns.value[key as keyof typeof dropdowns.value] = false
    }
  })
  
  // Close holiday dropdown if it's open
  holidayDropdownOpen.value = false
  
  // Open the current dropdown
  dropdowns.value[menuName] = true
}

function delayedCloseSpecificDropdown(menuName: keyof typeof dropdowns.value) {
  specificDropdownTimeout = window.setTimeout(() => {
    dropdowns.value[menuName] = false
  }, 200)
}

// Close dropdowns when clicking outside
function handleClickOutside() {
  Object.keys(dropdowns.value).forEach(key => {
    dropdowns.value[key as keyof typeof dropdowns.value] = false
  })
}

// Add click outside listener
document.addEventListener('click', handleClickOutside)

function handleLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedLogo.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function handlePictureUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  
  if (files.length === 0) {
    return
  }
  
  // Calculate how many more images we can add
  const remainingSlots = 3 - uploadedPictures.value.length
  const filesToProcess = files.slice(0, remainingSlots)
  
  // Convert files to base64 for cropping
  const imagePromises = filesToProcess.map(file => {
    return new Promise<string>((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Not an image file'))
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target?.result as string)
      }
      reader.onerror = (e) => reject(e)
      reader.readAsDataURL(file)
    })
  })
  
  Promise.all(imagePromises)
    .then(images => {
      pendingImages.value = images
      currentCropIndex.value = 0
      startCropping()
    })
    .catch(error => {
      console.error('Error loading images:', error)
    })
  
  // Reset input to allow selecting the same file again
  target.value = ''
}

function deleteImage(index: number) {
  uploadedPictures.value.splice(index, 1)
  // Adjust current index if necessary
  if (currentPreviewIndex.value >= uploadedPictures.value.length) {
    currentPreviewIndex.value = Math.max(0, uploadedPictures.value.length - 1)
  }
}

function nextImage() {
  if (uploadedPictures.value.length > 1) {
    currentPreviewIndex.value = (currentPreviewIndex.value + 1) % uploadedPictures.value.length
  }
}

function previousImage() {
  if (uploadedPictures.value.length > 1) {
    currentPreviewIndex.value = currentPreviewIndex.value === 0 
      ? uploadedPictures.value.length - 1 
      : currentPreviewIndex.value - 1
  }
}

// Touch handling for swipe navigation
let touchStartX = 0
let touchEndX = 0

function handleTouchStart(event: TouchEvent) {
  touchStartX = event.touches[0].clientX
}

function handleTouchEnd(event: TouchEvent) {
  touchEndX = event.changedTouches[0].clientX
  handleSwipe()
}

function handleSwipe() {
  const swipeThreshold = 30 // Reduced for more sensitive swiping
  const diff = touchStartX - touchEndX
  
  if (Math.abs(diff) > swipeThreshold && uploadedPictures.value.length > 1) {
    if (diff > 0) {
      // Swiped left - go to next image (continuous loop)
      nextImage()
    } else {
      // Swiped right - go to previous image (continuous loop)
      previousImage()
    }
  }
}

// Advanced Features

// Keyboard navigation
function handleKeydown(event: KeyboardEvent) {
  if (!uploadedPictures.value.length) return
  
  switch (event.key) {
    case 'ArrowLeft':
      if (!showImagePreview.value) previousImage()
      break
    case 'ArrowRight':
      if (!showImagePreview.value) nextImage()
      break
    case 'Escape':
      if (showImagePreview.value) {
        closeImagePreview()
      }
      break
  }
}

// Image interaction handlers
function openImagePreview() {
  previewImageUrl.value = uploadedPictures.value[currentPreviewIndex.value]
  showImagePreview.value = true
}

function closeImagePreview() {
  showImagePreview.value = false
  previewImageUrl.value = ''
}

// Drag & Drop reordering
function handleDragStart(event: DragEvent, index: number) {
  isDragging.value = true
  dragStartIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', index.toString())
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function handleDrop(event: DragEvent, dropIndex: number) {
  event.preventDefault()
  const dragIndex = dragStartIndex.value
  
  if (dragIndex !== -1 && dragIndex !== dropIndex) {
    const newPictures = [...uploadedPictures.value]
    const [draggedItem] = newPictures.splice(dragIndex, 1)
    newPictures.splice(dropIndex, 0, draggedItem)
    uploadedPictures.value = newPictures
    
    // Update current index if needed
    if (currentPreviewIndex.value === dragIndex) {
      currentPreviewIndex.value = dropIndex
    } else if (dragIndex < currentPreviewIndex.value && dropIndex >= currentPreviewIndex.value) {
      currentPreviewIndex.value--
    } else if (dragIndex > currentPreviewIndex.value && dropIndex <= currentPreviewIndex.value) {
      currentPreviewIndex.value++
    }
  }
  
  isDragging.value = false
  dragStartIndex.value = -1
}



function toggleSocialMedia(platform: string) {
  const index = selectedSocialMedia.value.indexOf(platform)
  if (index > -1) {
    selectedSocialMedia.value.splice(index, 1)
  } else {
    selectedSocialMedia.value.push(platform)
  }
}

function toggleSelectAllSocial() {
  const allPlatforms = ['facebook', 'whatsapp', 'instagram', 'twitter', 'tiktok', 'youtube', 'linkedin', 'telegram', 'snapchat']
  if (selectedSocialMedia.value.length === allPlatforms.length) {
    selectedSocialMedia.value = []
  } else {
    selectedSocialMedia.value = [...allPlatforms]
  }
}

const selectAllButtonText = computed(() => {
  const allPlatforms = ['facebook', 'whatsapp', 'instagram', 'twitter', 'tiktok', 'youtube', 'linkedin', 'telegram', 'snapchat']
  return selectedSocialMedia.value.length === allPlatforms.length ? 'Unselect All' : 'Select All'
})

// Image cropping functions
function startCropping() {
  if (pendingImages.value.length > 0) {
    currentImageToCrop.value = pendingImages.value[currentCropIndex.value]
    showCropper.value = true
  }
}

function handleCropComplete(croppedImageData: string) {
  // Add the cropped image to uploaded pictures
  uploadedPictures.value.push(croppedImageData)
  currentPreviewIndex.value = uploadedPictures.value.length - 1
  
  // Move to next image or finish
  currentCropIndex.value++
  if (currentCropIndex.value < pendingImages.value.length) {
    currentImageToCrop.value = pendingImages.value[currentCropIndex.value]
    // Keep cropper open for next image
  } else {
    closeCropper()
  }
}

function closeCropper() {
  showCropper.value = false
  pendingImages.value = []
  currentCropIndex.value = 0
  currentImageToCrop.value = ''

}

function selectHoliday(index: number) {
  currentHolidayIndex.value = index
  // Reset form for new holiday entry
  uploadedLogo.value = null
  uploadedPicture.value = null
  selectedTime.value = ''
  task.value = ''
  organizerName.value = ''
}

function toggleHoliday(index: number) {
  const idx = activeHolidayIndices.value.indexOf(index)
  if (idx > -1) {
    // Remove if already selected
    activeHolidayIndices.value.splice(idx, 1)
  } else {
    // Add if not selected
    activeHolidayIndices.value.push(index)
  }
  
  // Set current index to the last selected
  if (activeHolidayIndices.value.length > 0) {
    currentHolidayIndex.value = activeHolidayIndices.value[activeHolidayIndices.value.length - 1]
  }
}

function toggleDropdownItem(index: number) {
  const idx = activeDropdownIndices.value.indexOf(index)
  if (idx > -1) {
    // Remove if already selected
    activeDropdownIndices.value.splice(idx, 1)
  } else {
    // Add if not selected
    activeDropdownIndices.value.push(index)
  }
}

function formatDisplayTime(time: string): string {
  if (!time) return 'Select Time'
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:${minutes || '00'}`
}

function getTimePeriod(): string {
  if (!selectedTime.value) return 'AM'
  const [hours] = selectedTime.value.split(':')
  return parseInt(hours) >= 12 ? 'PM' : 'AM'
}

function setTimePeriod(period: 'AM' | 'PM') {
  if (!selectedTime.value) {
    // Set default time based on period
    selectedTime.value = period === 'AM' ? '08:00' : '20:00'
    updateTimePeriod()
    return
  }
  
  const [hours, minutes] = selectedTime.value.split(':')
  let hour = parseInt(hours)
  
  // Convert to 12-hour format first
  const currentPeriod = hour >= 12 ? 'PM' : 'AM'
  
  // Only change if different period selected
  if (currentPeriod !== period) {
    if (period === 'AM' && hour >= 12) {
      hour -= 12
    } else if (period === 'PM' && hour < 12) {
      hour += 12
    }
    
    selectedTime.value = `${hour.toString().padStart(2, '0')}:${minutes}`
    updateTimePeriod()
  }
}

// Custom Time Picker Functions

function validateHour() {
  // Remove non-digits
  timePickerHour.value = timePickerHour.value.replace(/\D/g, '')
  
  if (timePickerHour.value === '') return
  
  let value = parseInt(timePickerHour.value)
  if (isNaN(value) || value < 1) {
    timePickerHour.value = '01'
  } else if (value > 12) {
    timePickerHour.value = '12'
  } else if (timePickerHour.value.length === 2 || value > 1) {
    timePickerHour.value = value.toString().padStart(2, '0')
  }
}

function validateMinute() {
  // Remove non-digits
  timePickerMinute.value = timePickerMinute.value.replace(/\D/g, '')
  
  if (timePickerMinute.value === '') return
  
  let value = parseInt(timePickerMinute.value)
  if (isNaN(value) || value < 0) {
    timePickerMinute.value = '00'
  } else if (value > 59) {
    timePickerMinute.value = '59'
  } else if (timePickerMinute.value.length === 2) {
    timePickerMinute.value = value.toString().padStart(2, '0')
  }
}

function incrementHour() {
  let value = parseInt(timePickerHour.value) || 12
  value++
  if (value > 12) value = 1
  timePickerHour.value = value.toString().padStart(2, '0')
}

function decrementHour() {
  let value = parseInt(timePickerHour.value) || 12
  value--
  if (value < 1) value = 12
  timePickerHour.value = value.toString().padStart(2, '0')
}

function incrementMinute() {
  let value = parseInt(timePickerMinute.value) || 0
  value++
  if (value > 59) value = 0
  timePickerMinute.value = value.toString().padStart(2, '0')
}

function decrementMinute() {
  let value = parseInt(timePickerMinute.value) || 0
  value--
  if (value < 0) value = 59
  timePickerMinute.value = value.toString().padStart(2, '0')
}

// Continuous scrolling functionality
let continuousInterval: number | null = null

function startContinuousIncrement(type: 'hour' | 'minute') {
  // Clear any existing interval
  if (continuousInterval) {
    clearInterval(continuousInterval)
  }
  
  // Start continuous increment after initial delay
  continuousInterval = setTimeout(() => {
    continuousInterval = setInterval(() => {
      if (type === 'hour') {
        incrementHour()
      } else {
        incrementMinute()
      }
    }, 150) // Repeat every 150ms
  }, 500) // Initial delay of 500ms
}

function startContinuousDecrement(type: 'hour' | 'minute') {
  // Clear any existing interval
  if (continuousInterval) {
    clearInterval(continuousInterval)
  }
  
  // Start continuous decrement after initial delay
  continuousInterval = setTimeout(() => {
    continuousInterval = setInterval(() => {
      if (type === 'hour') {
        decrementHour()
      } else {
        decrementMinute()
      }
    }, 150) // Repeat every 150ms
  }, 500) // Initial delay of 500ms
}

function stopContinuous() {
  if (continuousInterval) {
    clearInterval(continuousInterval)
    continuousInterval = null
  }
}

function handleHourKey(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    incrementHour()
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    decrementHour()
  }
}

function handleMinuteKey(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    incrementMinute()
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    decrementMinute()
  }
}

function confirmTime() {
  const period = timePeriod.value
  let hour = parseInt(timePickerHour.value)
  
  // Convert to 24-hour format
  if (period === 'pm' && hour !== 12) {
    hour += 12
  } else if (period === 'am' && hour === 12) {
    hour = 0
  }
  
  const formattedHour = hour.toString().padStart(2, '0')
  selectedTime.value = `${formattedHour}:${timePickerMinute.value}`
  showCustomTimePicker.value = false
}

function updateTimePeriod() {
  if (selectedTime.value) {
    const [hours] = selectedTime.value.split(':')
    timePeriod.value = parseInt(hours) >= 12 ? 'pm' : 'am'
  }
}

function scrollEventsLeft() {
  if (eventsList.value) {
    eventsList.value.scrollBy({ left: -350, behavior: 'smooth' })
  }
}

function scrollEventsRight() {
  if (eventsList.value) {
    eventsList.value.scrollBy({ left: 350, behavior: 'smooth' })
  }
}

function confirmScheduleSelectedTask() {
  // Check if we have valid input:
  // Either: (date + time + task) OR (holidays + time) OR (dropdown items + time)
  const hasCalendarTask = selectedDate.value && selectedTime.value && task.value.trim()
  const hasHolidayTask = selectedHolidays.value.length > 0 && selectedTime.value && activeHolidayIndices.value.length > 0
  const hasDropdownTask = currentDropdownSelection.value.items.length > 0 && selectedTime.value && activeDropdownIndices.value.length > 0
  
  // Check for required fields first
  if ((hasHolidayTask && activeHolidayIndices.value.length > 0) || (hasDropdownTask && activeDropdownIndices.value.length > 0)) {
    if (!organizerName.value.trim()) {
      alert('Please fill in the description text area before scheduling the selected task.')
      return
    }
    if (selectedSocialMedia.value.length === 0) {
      alert('Please select at least one social media platform before scheduling the selected task.')
      return
    }
  }
  
  if (!hasCalendarTask && !hasHolidayTask && !hasDropdownTask) {
    alert('Please select tasks and time before scheduling.')
    return
  }
  
  // Show confirmation modal
  const taskCount = activeHolidayIndices.value.length + activeDropdownIndices.value.length
  confirmationMessage.value = `Are you sure you want to schedule ${taskCount > 0 ? 'the selected task(s)' : 'this task'}?`
  confirmationAction.value = 'scheduleSelected'
  showConfirmationModal.value = true
}

function confirmScheduleAllTasks() {
  const isDropdownMode = currentDropdownSelection.value.category === 'weeklyTask' || currentDropdownSelection.value.category === 'monthly'
  const itemCount = isDropdownMode ? currentDropdownSelection.value.items.length : selectedHolidays.value.length
  
  if (itemCount === 0 || !selectedTime.value) {
    alert(isDropdownMode ? 'Please select items and time.' : 'Please select holidays and time.')
    return
  }

  // Validation for description and social media
  if (!organizerName.value.trim()) {
    alert('Please fill in the description text area before scheduling all tasks.')
    return
  }
  if (selectedSocialMedia.value.length === 0) {
    alert('Please select at least one social media platform before scheduling all tasks.')
    return
  }
  
  // Show confirmation modal
  confirmationMessage.value = `Are you sure you want to schedule all ${itemCount} tasks?`
  confirmationAction.value = 'scheduleAll'
  showConfirmationModal.value = true
}

function executeConfirmedAction() {
  if (confirmationAction.value === 'scheduleSelected') {
    scheduleTask()
  } else if (confirmationAction.value === 'scheduleAll') {
    scheduleAllTasks()
  }
  showConfirmationModal.value = false
  confirmationAction.value = null
}

function cancelConfirmation() {
  showConfirmationModal.value = false
  confirmationAction.value = null
}

function scheduleAllTasks() {
  const isDropdownMode = currentDropdownSelection.value.category === 'weeklyTask' || currentDropdownSelection.value.category === 'monthly'
  const itemCount = isDropdownMode ? currentDropdownSelection.value.items.length : selectedHolidays.value.length
  
  if (itemCount === 0 || !selectedTime.value) {
    alert(isDropdownMode ? 'Please select items and time.' : 'Please select holidays and time.')
    return
  }

  // Validation for description and social media
  if (!organizerName.value.trim()) {
    alert('Please fill in the description text area before scheduling all tasks.')
    return
  }
  if (selectedSocialMedia.value.length === 0) {
    alert('Please select at least one social media platform before scheduling all tasks.')
    return
  }

  if (isDropdownMode) {
    // Schedule all dropdown items
    currentDropdownSelection.value.items.forEach(item => {
      scheduledTasks.value.push({
        date: selectedDate.value || new Date().toISOString().split('T')[0],
        time: selectedTime.value,
        name: item,
        source: currentDropdownSelection.value.category,
        description: organizerName.value,
        pictures: [...uploadedPictures.value],
        socialMedia: [...selectedSocialMedia.value]
      })
    })
    
    // Clear dropdown selection
    currentDropdownSelection.value = { category: '', items: [] }
    activeDropdownIndices.value = []
  } else {
    // Schedule all holidays
    selectedHolidays.value.forEach(holiday => {
      scheduledTasks.value.push({
        date: holiday.date,
        time: selectedTime.value,
        name: holiday.name,
        source: 'holiday',
        description: organizerName.value,
        pictures: [...uploadedPictures.value],
        socialMedia: [...selectedSocialMedia.value]
      })
    })
    
    // Clear and close
    selectedHolidays.value = []
    activeHolidayIndices.value = []
  }
  
  // Common cleanup for both cases
  activeDropdownIndices.value = []
  allSelected.value = false
  scheduledTask.value = true
  
  // Reset form fields
  organizerName.value = ''
  uploadedPictures.value = []
  selectedSocialMedia.value = []
  
  setTimeout(() => {
    closeTaskModal()
    scheduledTask.value = false
  }, 1500)
}

function scheduleTask() {
  // Check if we have valid input:
  // Either: (date + time + task) OR (holidays + time) OR (dropdown items + time)
  const hasCalendarTask = selectedDate.value && selectedTime.value && task.value.trim()
  const hasHolidayTask = selectedHolidays.value.length > 0 && selectedTime.value
  const hasDropdownTask = currentDropdownSelection.value.items.length > 0 && selectedTime.value
  
  // Validation for description and social media when scheduling holidays or dropdown tasks
  if ((hasHolidayTask && activeHolidayIndices.value.length > 0) || (hasDropdownTask && activeDropdownIndices.value.length > 0)) {
    if (!organizerName.value.trim()) {
      alert('Please fill in the description text area before scheduling the selected task.')
      return
    }
    if (selectedSocialMedia.value.length === 0) {
      alert('Please select at least one social media platform before scheduling the selected task.')
      return
    }
  }
  
  if (hasCalendarTask || hasHolidayTask || hasDropdownTask) {
    // Add task from calendar date or manual entry (if provided)
    if (hasCalendarTask) {
      scheduledTasks.value.push({
        date: selectedDate.value,
        time: selectedTime.value,
        name: task.value,
        source: 'calendar'
      })
    }
    
    // Add only ACTIVE holidays as scheduled tasks (those in activeHolidayIndices)
    if (hasHolidayTask && activeHolidayIndices.value.length > 0) {
      const activeHolidays = activeHolidayIndices.value.map(index => selectedHolidays.value[index])
      
      activeHolidays.forEach(holiday => {
        scheduledTasks.value.push({
          date: holiday.date,
          time: selectedTime.value,
          name: holiday.name,
          source: 'holiday',
          description: organizerName.value,
          pictures: [...uploadedPictures.value],
          socialMedia: [...selectedSocialMedia.value]
        })
      })
      
      // Remove only the active holidays from selectedHolidays
      const remainingHolidays = selectedHolidays.value.filter((_, index) => !activeHolidayIndices.value.includes(index))
      selectedHolidays.value = remainingHolidays
      
      // Clear active indices since those holidays are now scheduled
      activeHolidayIndices.value = []
      activeDropdownIndices.value = []
      
      // Update allSelected state
      allSelected.value = selectedHolidays.value.length === holidays.value.length
    } else if (hasHolidayTask && activeHolidayIndices.value.length === 0) {
      alert('Please select at least one holiday from the events list above.')
      return
    }
    
    // Add only ACTIVE dropdown items as scheduled tasks (those in activeDropdownIndices)
    if (hasDropdownTask && activeDropdownIndices.value.length > 0) {
      const activeDropdownItems = activeDropdownIndices.value.map(index => currentDropdownSelection.value.items[index])
      
      activeDropdownItems.forEach(item => {
        scheduledTasks.value.push({
          date: new Date().toLocaleDateString(), // Use current date or allow date selection
          time: selectedTime.value,
          name: item,
          source: currentDropdownSelection.value.category,
          description: organizerName.value,
          pictures: [...uploadedPictures.value],
          socialMedia: [...selectedSocialMedia.value]
        })
      })
      
      // Remove only the active dropdown items from currentDropdownSelection.items
      const remainingItems = currentDropdownSelection.value.items.filter((_, index) => !activeDropdownIndices.value.includes(index))
      currentDropdownSelection.value.items = remainingItems
      
      // Clear active indices since those items are now scheduled
      activeDropdownIndices.value = []
    } else if (hasDropdownTask && activeDropdownIndices.value.length === 0) {
      alert('Please select at least one item from the dropdown list above.')
      return
    }
    
    scheduledTask.value = true
    
    // Only reset form fields and close modal if it's a calendar task OR if no holidays/dropdown items remain
    if (hasCalendarTask || (selectedHolidays.value.length === 0 && currentDropdownSelection.value.items.length === 0)) {
      // Reset form fields only when closing
      task.value = ''
      selectedTime.value = ''
      selectedDate.value = null
      organizerName.value = ''
      uploadedPictures.value = []
      selectedSocialMedia.value = []
      
      setTimeout(() => {
        closeTaskModal()
        scheduledTask.value = false
      }, 1500)
    } else {
      // Just show success message briefly but keep modal open for remaining holidays
      setTimeout(() => {
        scheduledTask.value = false
      }, 1000)
    }
  } else {
    alert('Please select holidays and time, or fill in date, time, and task description.')
  }
}

const btnClasses = (val: string) => {
  const base = 'action-btn'
  let active = selection.value === val ? 'active' : ''
  
  // Check if any of the new dropdowns are open and mark as active
  if (val === 'special-events' && dropdowns.value.specialEvents) active = 'active'
  if (val === 'business-advert' && dropdowns.value.businessAdvert) active = 'active'
  if (val === 'weekly-task' && dropdowns.value.weeklyTask) active = 'active'
  if (val === 'monthly' && dropdowns.value.monthly) active = 'active'
  if (val === 'quote' && dropdowns.value.quote) active = 'active'
  if (val === 'more' && dropdowns.value.more) active = 'active'
  
  return `${base} ${active}`
}

// Social Media Share
function shareToSocial(platform: string) {
  const url = encodeURIComponent("https://smartdesignpro.com")
  const text = encodeURIComponent(`Check out this: ${task.value || 'My scheduled item'}`)

  let shareUrl = ""
  switch (platform) {
    case "whatsapp":
      shareUrl = `https://wa.me/?text=${text}%20${url}`
      break
    case "facebook":
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
      break
    case "instagram":
      alert("Instagram sharing requires native app integration. Copying link instead.")
      navigator.clipboard.writeText(`${text} ${url}`)
      return
    case "linkedin":
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
      break
    case "twitter":
      shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
      break
    case "tiktok":
      alert("TikTok sharing is not available via web. Copying link instead.")
      navigator.clipboard.writeText(`${text} ${url}`)
      return
  }

  if (shareUrl) {
    window.open(shareUrl, "_blank")
  }
}

// Calendar State
const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Generate calendar days
const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()

  const days: (number | null)[] = Array(firstDay).fill(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  return days
})

// Navigation
function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// Select date
function selectDate(day: number | null) {
  if (!day) return
  // Immediate visual feedback
  const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  selectedDate.value = dateStr
  // Use requestAnimationFrame for smooth modal opening
  requestAnimationFrame(() => {
    openTaskModal()
  })
}

function isSelected(day: number | null) {
  if (!selectedDate.value || !day) return false
  const [y, m, d] = selectedDate.value.split("-").map(Number)
  return y === currentYear.value && m === currentMonth.value + 1 && d === day
}

// Handle Date/Time button clicks
function handleDateClick() {
  console.log('Date label clicked - opening date picker...', { showDateTimePicker: showDateTimePicker.value });
  showDateTimePicker.value = true
  pickerStep.value = 'date'
  console.log('After setting showDateTimePicker:', showDateTimePicker.value)
}

function handleTimeClick() {
  console.log('Time value clicked - opening time picker...', { showDateTimePicker: showDateTimePicker.value });
  showDateTimePicker.value = true
  pickerStep.value = 'time'
  console.log('After setting showDateTimePicker:', showDateTimePicker.value)
}

// Date/Time Picker Functions
function closeDateTimePicker() {
  showDateTimePicker.value = false
  pickerStep.value = 'date'
  showTimeInput.value = false
  showMinutePicker.value = false
}

function pickerPreviousMonth() {
  if (pickerMonth.value === 0) {
    pickerMonth.value = 11
    pickerYear.value--
  } else {
    pickerMonth.value--
  }
}

function pickerNextMonth() {
  if (pickerMonth.value === 11) {
    pickerMonth.value = 0
    pickerYear.value++
  } else {
    pickerMonth.value++
  }
}

function pickerSelectDate(day) {
  if (day.otherMonth) return
  // Immediate visual feedback
  selectedPickerDate.value = day.date
  // Provide instant visual feedback
  requestAnimationFrame(() => {
    // Additional smooth processing if needed
  })
}

function proceedToTimePicker() {
  if (!selectedPickerDate.value) return
  pickerStep.value = 'time'
}

function selectHour(hour) {
  selectedHour.value = hour
  inputHour.value = hour
  // Auto-advance to minute selection after hour selection
  showMinutePicker.value = true
}

function formatSelectedDate() {
  if (!selectedPickerDate.value) return ''
  const date = new Date(pickerYear.value, pickerMonth.value, selectedPickerDate.value)
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function formatSelectedDateHeader() {
  if (!selectedPickerDate.value) return 'Select Date'
  const date = new Date(pickerYear.value, pickerMonth.value, selectedPickerDate.value)
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric' 
  })
}

function formatTime() {
  const hour = showTimeInput.value ? inputHour.value : selectedHour.value
  const minute = showTimeInput.value ? inputMinute.value : selectedMinute.value
  const formattedHour = hour || 12
  const formattedMinute = minute.toString().padStart(2, '0')
  return `${formattedHour}:${formattedMinute} ${selectedPeriod.value}`
}

function getHourPosition(hour) {
  const angle = (hour * 30) - 90 // 30 degrees per hour, starting from top
  const radius = 80
  const x = Math.cos(angle * Math.PI / 180) * radius
  const y = Math.sin(angle * Math.PI / 180) * radius
  return {
    transform: `translate(${x}px, ${y}px)`
  }
}

function getHourHandRotation() {
  if (showMinutePicker.value && selectedHour.value) {
    // When minute picker is active, point to the selected hour
    const angle = (selectedHour.value * 30) - 90
    return {
      transform: `rotate(${angle}deg)`
    }
  }
  
  const hour = showTimeInput.value ? inputHour.value : selectedHour.value
  const angle = ((hour || 12) * 30) - 90
  return {
    transform: `rotate(${angle}deg)`
  }
}

function backToCalendar() {
  pickerStep.value = 'date'
  showTimeInput.value = false
}

function setDateTime() {
  const hour = showTimeInput.value ? inputHour.value : selectedHour.value
  const minute = showTimeInput.value ? inputMinute.value : selectedMinute.value
  
  if (!selectedPickerDate.value || !hour) return
  
  // Get short month name
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const shortMonth = monthNames[pickerMonth.value]
  
  // Update the display value with short month format
  const formattedDate = `${shortMonth} ${selectedPickerDate.value.toString().padStart(2, '0')}`
  const formattedTime = `${hour}:${minute.toString().padStart(2, '0')}${selectedPeriod.value.toLowerCase()}`
  
  // Update the button display with selected date and time
  displayDateTime.value = `${formattedDate} - ${formattedTime}`
  
  console.log('Selected DateTime:', { date: formattedDate, time: formattedTime, display: displayDateTime.value })
  
  closeDateTimePicker()
}

// Minute picker functions
function selectMinute(minute) {
  // Immediate, synchronous updates for instant response
  selectedMinute.value = minute
  inputMinute.value = minute
  
  // Optional: Force immediate DOM update for ultra-responsiveness
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(() => {
      // This ensures the next frame renders with updated values
    })
  }
}

function backToHourSelection() {
  showMinutePicker.value = false
}

function smartBackNavigation() {
  if (showMinutePicker.value) {
    // If on minute picker, go back to hour picker
    backToHourSelection()
  } else if (pickerStep.value === 'time') {
    // If on hour picker, go back to date picker
    backToCalendar()
  } else {
    // If on date picker, close the dialog
    closeDateTimePicker()
  }
}

function getMinutePosition(minute) {
  const angle = (minute * 6) - 90 // 6 degrees per minute, starting from top
  const radius = 80 // Restore original radius
  const x = Math.cos(angle * Math.PI / 180) * radius
  const y = Math.sin(angle * Math.PI / 180) * radius
  return {
    transform: `translate(${x}px, ${y}px)`
  }
}

function getMinuteHandRotation() {
  const minute = showTimeInput.value ? inputMinute.value : selectedMinute.value
  const angle = (minute * 6) - 90
  return {
    transform: `rotate(${angle}deg)`
  }
}

// Computed property for minute markers (0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55)
const minuteMarkers = computed(() => {
  return Array.from({ length: 12 }, (_, i) => i * 5)
})

// Sponsor Info Form Functions
function submitSponsorInfo() {
  console.log('Presenter info submitted:', sponsorInfo.value)
  // Here you can add API call to save the presenter information
  showInfoForm.value = false
  // Keep the data for the design, don't reset
  // sponsorInfo.value = { name: '', role: '', phone: '', logo: null }
}

function handlePresenterLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    sponsorInfo.value.logo = file
    // Create preview URL
    logoPreviewUrl.value = URL.createObjectURL(file)
    console.log('Presenter logo uploaded:', file.name)
  }
}

function removePresenterLogo() {
  sponsorInfo.value.logo = null
  if (logoPreviewUrl.value) {
    URL.revokeObjectURL(logoPreviewUrl.value)
    logoPreviewUrl.value = ''
  }
  // Reset file input using nextTick and proper ref access
  nextTick(() => {
    const logoInputElement = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement
    if (logoInputElement) {
      logoInputElement.value = ''
      // Force a change event to ensure Vue reactivity
      logoInputElement.dispatchEvent(new Event('change', { bubbles: true }))
    }
  })
}

// Handle Generate Quote and Microphone button clicks
function handleGenerateQuoteClick() {
  console.log('Generate Quote button clicked!');
  // TODO: Implement quote generation functionality
}

function handleMicrophoneClick() {
  console.log('Microphone button clicked!');
  // TODO: Implement voice recording functionality
}

// Watch for input changes to sync with clock
watch(inputHour, (newHour) => {
  if (newHour >= 1 && newHour <= 12) {
    selectedHour.value = newHour
  }
})

watch(inputMinute, (newMinute) => {
  if (newMinute >= 0 && newMinute <= 59) {
    selectedMinute.value = newMinute
  }
})

// Alternating placeholder functions
function startPlaceholderAnimation() {
  if (placeholderInterval.value) {
    clearInterval(placeholderInterval.value)
  }
  
  // Different placeholder texts based on modal category
  let placeholderTexts
  if (currentDropdownSelection.value.category === 'specialEvents') {
    placeholderTexts = ['Retirement Service in honour of', 'Congratulation on your Appointment', 'Happy Convocation']
  } else if (currentDropdownSelection.value.category === 'quote') {
    placeholderTexts = ['Daily Words of Inspiration', 'Quote of the Day', 'Motivational Message']
  } else {
    placeholderTexts = ['Happy Birthday', 'am +1 today', 'Golden Jubilee, Daddy @ 60']
  }
  
  // Set initial placeholder text
  placeholderText.value = placeholderTexts[0]
  
  let currentIndex = 0
  
  placeholderInterval.value = setInterval(() => {
    if (!isInputFocused.value) {
      currentIndex = (currentIndex + 1) % placeholderTexts.length
      placeholderText.value = placeholderTexts[currentIndex]
    }
  }, 3000)
}

function stopPlaceholderAnimation() {
  if (placeholderInterval.value) {
    clearInterval(placeholderInterval.value)
    placeholderInterval.value = null
  }
}

function handleInputFocus(event: Event) {
  isInputFocused.value = true
  const target = event.target as HTMLInputElement
  target.select()
}

function handleInputBlur() {
  isInputFocused.value = false
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  startPlaceholderAnimation()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  stopPlaceholderAnimation()
})

// Computed properties for advanced features
const hasMultipleImages = computed(() => uploadedPictures.value.length > 1)

// Computed properties for date/time picker
const currentMonthName = computed(() => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[pickerMonth.value]
})

const calendarPickerDays = computed(() => {
  const firstDay = new Date(pickerYear.value, pickerMonth.value, 1).getDay()
  const daysInMonth = new Date(pickerYear.value, pickerMonth.value + 1, 0).getDate()
  const days = []
  const today = new Date()
  
  // Previous month's trailing days
  const prevMonth = pickerMonth.value === 0 ? 11 : pickerMonth.value - 1
  const prevYear = pickerMonth.value === 0 ? pickerYear.value - 1 : pickerYear.value
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate()
  
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      date: daysInPrevMonth - i,
      otherMonth: true,
      key: `prev-${daysInPrevMonth - i}`
    })
  }
  
  // Current month's days
  for (let date = 1; date <= daysInMonth; date++) {
    const isToday = 
      today.getDate() === date &&
      today.getMonth() === pickerMonth.value &&
      today.getFullYear() === pickerYear.value
      
    days.push({
      date,
      otherMonth: false,
      isToday,
      key: `current-${date}`
    })
  }
  
  // Next month's leading days
  const remainingDays = 42 - days.length
  for (let date = 1; date <= remainingDays; date++) {
    days.push({
      date,
      otherMonth: true,
      key: `next-${date}`
    })
  }
  
  return days
})
</script>

<style scoped>
.scheduling-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%);
}

/* Breadcrumb */
.breadcrumb-wrapper {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-bottom: solid 1px #1e40af;
  padding: 0.75rem 3rem;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.breadcrumb-link {
  color: #dbeafe;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.breadcrumb-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.breadcrumb-separator {
  color: #bfdbfe;
  font-weight: 600;
  font-size: 1rem;
}

.breadcrumb-current {
  color: white;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  backdrop-filter: blur(10px);
}

/* Main Content */
.scheduling-content {
  padding: 2rem 3rem;
  max-width: 1600px;
  margin: 0 auto;
}

/* Action Bar */
.action-bar {
  background: white;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 1rem;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.button-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.action-btn:hover {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #92400e;
}

.action-btn.active {
  background: #f59e0b;
  border-color: #f59e0b;
  color: white;
}

/* Holiday Dropdown */
.holiday-dropdown-container {
  position: relative;
}

.holiday-dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  z-index: 50;
  width: 18rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.holiday-items-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  max-height: 320px;
}

.holiday-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.holiday-item:hover {
  background: #fef3c7;
}

.holiday-select-all {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.75rem;
  margin-bottom: 0.5rem;
}

.holiday-checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: #f59e0b;
  cursor: pointer;
}

.holiday-text {
  font-size: 0.875rem;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.holiday-schedule-btn {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.625rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.holiday-schedule-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

/* New Dropdown Containers */
.dropdown-container {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 200px;
  max-height: 300px;
  margin-top: 0.25rem;
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
}

/* Fix More button dropdown positioning to prevent overflow */
.more-button-container .dropdown-menu {
  left: auto;
  right: 0;
  min-width: 180px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f1f5f9;
  user-select: none;
  font-size: 0.875rem;
  border-radius: 6px;
}

.dropdown-items-container {
  flex: 1;
  overflow-y: auto;
  max-height: 220px;
}

.dropdown-item:hover {
  background-color: #fef3c7;
}

.dropdown-item.select-all {
  background-color: #f1f5f9;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.5rem 0.75rem;
  padding-bottom: 0.75rem;
  margin-bottom: 0.5rem;
}

.dropdown-item.select-all:hover {
  background-color: #fef3c7;
}

.dropdown-checkbox {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  accent-color: #f59e0b;
  cursor: pointer;
}

.schedule-btn {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.625rem 1rem;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.schedule-btn:hover {
  background: #d97706;
  transform: translateY(-1px);
}

/* More Button Container (Right Side) */
.more-button-container {
  margin-left: auto;
}

.more-btn-green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
  min-width: 80px;
  text-align: center;
}

.more-btn-green:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.more-btn-green:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.more-item {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: transparent;
  color: #1e293b;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
  border-radius: 6px;
}

.more-item:last-child {
  border-bottom: none;
}

.more-item:hover {
  background-color: #fef3c7;
}

/* Dropdown Animation */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* Social Buttons */
.social-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.social-btn {
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.social-btn:hover {
  transform: scale(1.1);
}

.social-btn svg {
  width: 0.875rem;
  height: 0.875rem;
}

.social-btn.whatsapp { background: #25d366; color: white; }
.social-btn.facebook { background: #1877f2; color: white; }
.social-btn.instagram { background: #e4405f; color: white; }
.social-btn.linkedin { background: #0a66c2; color: white; }
.social-btn.twitter { background: #1da1f2; color: white; }
.social-btn.tiktok { background: #000000; color: white; }

/* Action Buttons */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.attach-btn,
.send-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.attach-btn {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.attach-btn:hover {
  background: #f8fafc;
}

.attach-btn svg {
  width: 1rem;
  height: 1rem;
}

.send-btn {
  background: #f59e0b;
  color: white;
}

.send-btn:hover {
  background: #d97706;
}

.send-btn svg {
  width: 0.875rem;
  height: 0.875rem;
}

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: minmax(400px, 1fr) 2fr;
  gap: 2rem;
  padding: 1rem 2rem ;
}

/* Calendar Section */
.calendar-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Main Calendar Card */
.calendar-section .calendar-card {
  background: white;
  padding: 0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 400px;
  flex-shrink: 0;
  overflow: visible;
}

/* Main Calendar Header */
.calendar-section .calendar-card .calendar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.25rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  padding: 20px 1.5rem;
  border-radius: 12px 12px 0 0;
  margin-left: 0;
  margin-right: 0;
  margin-top: 0;
  position: relative;
  width: 100%;
}

/* Main Calendar Navigation Buttons */
.calendar-section .calendar-card .calendar-nav-btn {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 6px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.08s ease-out;
  color: #1d4ed8;
  font-weight: bold;
  position: absolute;
  padding: 0 0 6px 0;
  line-height: 1;
  text-align: center;
  will-change: transform, background-color;
}

.calendar-section .calendar-card .calendar-nav-btn:first-child {
  left: 1.5rem;
}

.calendar-section .calendar-card .calendar-nav-btn:last-child {
  right: 1.5rem;
}

.calendar-section .calendar-card .calendar-nav-btn:hover {
  background: white;
  transform: scale(1.08);
  box-shadow: 0 2px 8px rgba(29, 78, 216, 0.2);
}

/* Main Calendar Title */
.calendar-section .calendar-card .calendar-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  text-align: center;
  width: 100%;
  margin: 0;
}

/* Main Calendar Weekdays */
.calendar-section .calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: 500;
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 0.75rem;
  padding: 0 1.5rem;
}

.calendar-section .weekday {
  padding: 0.25rem 0.5rem;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Main Calendar Dates */
.calendar-section .calendar-dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  text-align: center;
  padding: 0 1.5rem 1rem 1.5rem;
  contain: layout style;
  will-change: contents;
}

.calendar-day {
  aspect-ratio: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  will-change: transform, background-color, box-shadow;
}

.calendar-day.empty {
  background: transparent;
}

.calendar-day.clickable {
  cursor: pointer;
  color: #374151;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  font-weight: 600;
}

.calendar-day.clickable:hover {
  background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
  border-color: #f59e0b;
  transform: translateY(-1px) scale(1.03);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.25);
  color: #92400e;
}

.calendar-day.clickable:active {
  transform: translateY(0px) scale(1.01);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
  transition: all 0.05s ease-out;
}

.calendar-day.clickable:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.calendar-day.selected {
  background: #3b82f6;
  color: white;
  font-weight: 600;
  border-radius: 50%;
  transform: scale(1.1);
  border: none;
  transition: all 0.08s ease-out;
}

.calendar-day.selected:hover {
  background: #2563eb;
  transform: scale(1.12);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.selected-date {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
  text-align: center;
  font-weight: 500;
  color: #1e293b;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.25rem;
}

.form-group.hidden {
  display: none;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #f59e0b;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #f59e0b;
}

.schedule-btn {
  width: 100%;
  padding: 0.875rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.schedule-btn:hover {
  background: #059669;
}

.scheduled-task-card {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.card-content p {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.card-content strong {
  color: #1e293b;
}

.holidays-list {
  margin-top: 0.75rem;
}

.holidays-list ul {
  list-style: disc;
  padding-left: 1.5rem;
  margin-top: 0.5rem;
}

.holidays-list li {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

/* Templates Section */
.templates-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  max-height: 450px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  align-items: stretch; /* Make both columns equal height */
  flex: 1; /* Take all remaining space in templates-section */
  margin: 0;
  overflow: hidden;
}

/* Template Section Container */
.template-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%; /* Fill parent height */
  overflow: hidden;
  padding: 0;
}

/* Holiday Section Container */
.holiday-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%; /* Fill parent height */
  overflow: hidden;
  padding: 0;
}

.header-box {
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 600;
  color: white;
}

.header-box.template {
  background: #f59e0b;
}

.header-box.holiday {
  background: #f59e0b;
}

.template-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
  height: 380px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  padding-right: 1rem;
  background: #e5e7eb;
  border-radius: 8px;
}

.template-item {
  min-height: 6.5rem;
  background: #ef4444;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
}

.template-item:hover {
  transform: translateY(-2px);
}

.holiday-display {
  background: #e5e7eb;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 380px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.5rem;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #9ca3af;
}

.placeholder-content svg {
  width: 4rem;
  height: 4rem;
}

/* Scheduled Tasks List */
.scheduled-tasks-list {
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  max-height: 100%;
}

.scheduled-task-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  background: white;
  padding: 0.875rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.scheduled-task-item:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.task-image-box {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.task-image-box svg {
  width: 1.75rem;
  height: 1.75rem;
  stroke-width: 2;
}

.task-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.task-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-date-time {
  font-size: 0.8125rem;
  color: #6b7280;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .holiday-display {
    min-height: 300px;
  }
}

@media (max-width: 768px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .holiday-display {
    min-height: 200px;
  }
}

@media (max-width: 768px) {
  .breadcrumb-wrapper,
  .scheduling-content {
    padding-left: 1rem;
    padding-right: 1rem;
  }

 .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .button-group,
  .social-buttons,
  .action-buttons {
    justify-content: center;
  }

  .section-headers {
    grid-template-columns: 1fr;
  }

  .template-grid {
    grid-template-columns: 1fr;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  max-width: 750px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-close {
  position: absolute;
  top: 0.75rem;
  right: 1.25rem;
  width: 2rem;
  height: 2rem;
  border: none;
  background: white;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modal-close:hover {
  background: #f5f5f5;
  color: #333;
  transform: scale(1.1);
}

.modal-close svg {
  width: 1rem;
  height: 1rem;
}

/* Modal Header */
.modal-header {
  background: linear-gradient(135deg, #4a5ff5 0%, #2d3eb8 100%);
  padding: 0.5rem 2rem 0.75rem 2rem;
  text-align: center;
}

.modal-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.5px;
}

/* Events Banner (Horizontal Scrolling) */
.events-banner {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 0.125rem 1.5rem;
  position: relative;
  border-bottom: 1px solid #dee2e6;
  box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

/* Birthday Header Bar */
.birthday-header-bar {
  background: #1e3a8a;
  padding: 30px 16px;
  margin-bottom: 0.25rem;
  height: 70px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-inner-container {
  background: linear-gradient(to left, #1e3a8a 0%, #1e40af 100%);
  border-radius: 12px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  overflow: hidden;
}

.header-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-label {
  color: white;
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}

.header-input {
  background: white;
  border: none;
  border-radius: 16px;
  padding: 3px 12px;
  font-size: 14px;
  color: #374151;
  min-width: 350px;
  max-width: 450px;
  height: 28px;
  flex-shrink: 1;
  outline: none;
}

.header-input::placeholder {
  color: #9ca3af;
  opacity: 1;
}

.header-input:focus {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.at-symbol {
  color: white;
  font-size: 18px;
  font-weight: normal;
  margin: 0 2px;
}

.year-section {
  display: flex;
  align-items: center;
}

.year-input {
  background: white;
  border: none;
  border-radius: 16px;
  padding: 3px 12px;
  font-size: 14px;
  color: #374151;
  min-width: 65px;
  max-width: 80px;
  height: 28px;
  text-align: center;
  outline: none;
}

.year-input::placeholder {
  color: #9ca3af;
  opacity: 1;
  text-align: center;
}

.year-input:focus {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.datetime-container {
  display: flex;
  gap: 2px;
  margin-left: 12px;
  align-items: center;
  flex-shrink: 0;
}

.datetime-label-section {
  background: #ff8500;
  border-radius: 16px 0 0 16px;
  padding: 4px 16px;
  display: flex;
  align-items: center;
  transition: all 0.08s ease-out;
  cursor: pointer;
  will-change: transform, filter;
  min-width: 80px;
}

.datetime-label-section:hover {
  transform: translateY(-0.5px) scale(1.01);
  filter: brightness(1.08);
  box-shadow: 0 2px 8px rgba(255, 133, 0, 0.25);
}

.datetime-label-section:active {
  transform: translateY(0px) scale(0.98);
  filter: brightness(0.9);
  box-shadow: 0 2px 8px rgba(255, 133, 0, 0.4);
}

.datetime-value-section {
  background: #6366f1;
  border-radius: 0 16px 16px 0;
  padding: 4px 16px;
  display: flex;
  align-items: center;
  transition: all 0.08s ease-out;
  cursor: pointer;
  will-change: transform, filter;
  min-width: 120px;
}

.datetime-value-section:hover {
  transform: translateY(-0.5px) scale(1.01);
  filter: brightness(1.08);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}

.datetime-value-section:active {
  transform: translateY(0px) scale(0.98);
  filter: brightness(0.9);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
}

.datetime-label {
  color: white;
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}

.datetime-value {
  color: white;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
}

.dropdown-items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.events-instruction {
  text-align: center;
  margin-bottom: 0;
  padding-top: 0.375rem;
}

.events-instruction p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.events-instruction strong {
  color: #374151;
  font-weight: 600;
}

.events-banner .events-scroll-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.events-list-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.events-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: nowrap;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  padding: 0.5rem 1rem 0.5rem 0.75rem;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.events-list::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.scroll-arrow {
  background: #2c5aa0;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.scroll-arrow svg {
  width: 20px;
  height: 20px;
  stroke: white;
  stroke-width: 3;
}

.scroll-arrow:hover {
  background: #1e3a6f;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.scroll-arrow:active {
  transform: scale(0.95);
}

.event-item {
  background: #2c5aa0;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.375rem 1rem;
  border: 2px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  position: relative;
  overflow: visible;
  box-shadow: 0 1px 3px rgba(44, 90, 160, 0.15);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.event-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 26px;
}

.event-item:hover {
  background: #1e3a6f;
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(30, 58, 111, 0.25);
}

.event-item:hover::before {
  opacity: 1;
}

.event-item.active {
  background: linear-gradient(135deg, #ff7a3d 0%, #ff5722 100%);
  box-shadow: 0 2px 6px rgba(255, 87, 34, 0.25);
  transform: translateY(-1px) scale(1.02);
  font-weight: 700;
  border: 2px solid rgba(255, 255, 255, 0.6);
}

.event-item.active::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 1;
}

.event-name {
  position: relative;
  z-index: 1;
}

.checkmark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: white;
  color: #ff5722;
  border-radius: 50%;
  font-size: 0.65rem;
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  animation: checkmark-pop 0.3s ease-out;
}

@keyframes checkmark-pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.modal-body {
  padding: 0.5rem 2rem 2rem;
  overflow-y: auto;
  flex: 1;
  background: #fafafa;
}

/* Form Group */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9375rem;
  color: #333;
  background: white;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #4a5ff5;
  box-shadow: 0 0 0 3px rgba(74, 95, 245, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9375rem;
  color: #333;
  background: white;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s;
}

.form-textarea:focus {
  outline: none;
  border-color: #4a5ff5;
  box-shadow: 0 0 0 3px rgba(74, 95, 245, 0.1);
}

.form-textarea::placeholder {
  color: #9ca3af;
}

/* Confirmation Modal Styles */
.confirmation-modal-overlay {
  z-index: 2000;
}

.confirmation-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  animation: modalSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.confirmation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.confirmation-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.confirmation-header .close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.confirmation-header .close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.confirmation-body {
  padding: 1rem 1.5rem;
  text-align: center;
}

.confirmation-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.confirmation-icon svg {
  width: 32px;
  height: 32px;
  color: white;
}

.confirmation-message {
  font-size: 1.1rem;
  color: #374151;
  margin: 0;
  line-height: 1.5;
}

.confirmation-actions {
  display: flex;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Upload Sections Container (3 columns) */
.upload-sections-container {
  display: grid;
  grid-template-columns: 0.93fr 0.96fr 1.11fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.upload-section {
  display: flex;
  flex-direction: column;
  height: 40px;
}

.upload-label {
  display: block;
  cursor: pointer;
  height: 100%;
}

.upload-input,
.time-input-hidden {
  display: none;
}

.upload-box {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 1.5rem 1rem;
  text-align: center;
  transition: all 0.3s;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  height: 100%;
}

.upload-box.picture-box {
  border-color: #fbbf24;
  background: #fffbeb;
}

.upload-box:hover {
  border-color: #9ca3af;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.upload-box svg {
  width: 2.5rem;
  height: 2.5rem;
  color: #9ca3af;
  margin-bottom: 0.75rem;
  flex-shrink: 0;
}

.upload-box.picture-box svg {
  color: #fbbf24;
}

.uploaded-image {
  max-width: 100%;
  max-height: 80px;
  object-fit: contain;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.upload-text {
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #6b7280;
  text-align: center;
  line-height: 1.4;
}

.upload-box.picture-box .upload-text {
  color: #d97706;
}

/* Time Selector Section */
.time-selector-section {
  display: flex;
  flex-direction: column;
}

.time-display-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 1.5rem 1rem;
  cursor: pointer;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.35);
  overflow: hidden;
}

.time-display-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.time-display-box:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.45);
}

.time-display-box:hover::before {
  opacity: 1;
}

.time-display-box:active {
  transform: translateY(-1px);
}

/* Custom Time Picker Dropdown */
.custom-time-picker {
  position: absolute;
  top: 0;
  left: -0.5rem;
  right: -0.5rem;
  height: 165px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.time-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0.6rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
  border-radius: 16px 16px 0 0;
}

.close-picker {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 0.95rem;
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  line-height: 1;
  padding: 0;
}

.close-picker:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.time-picker-body {
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 0.3rem 0.6rem;
  gap: 0.4rem;
  height: 120px;
  background: linear-gradient(to bottom, #f8f9ff 0%, #ffffff 50%);
  flex-shrink: 0;
  overflow: hidden;
  max-width: 100%;
}

.time-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 70px;
  min-width: 50px;
  width: 70px;
  height: 100%;
  overflow: hidden;
}

.period-column {
  max-width: 60px;
}

.column-label {
  text-align: center;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.2rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.time-box-container {
  flex: 1;
  border: none;
  border-radius: 10px;
  background: white;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(229, 231, 235, 0.3);
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 80px;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 0.2rem;
}

.time-arrow {
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  padding: 0.3rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 20px;
  min-height: 20px;
  flex-shrink: 0;
}

.time-arrow svg {
  width: 12px;
  height: 12px;
  color: #667eea;
}

.time-arrow:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.time-arrow:active {
  transform: translateY(0);
  background: #d1d5db;
}

.time-display-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: #3b5998;
  background: #f8f9ff;
  border-radius: 6px;
  margin: 0.1rem 0;
  min-height: 35px;
}

.time-numbers-list::-webkit-scrollbar {
  width: 5px;
}

.time-numbers-list::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 4px;
  margin: 2px 0;
}

.time-numbers-list::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 4px;
}

.time-numbers-list::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}



.time-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 900;
  color: #667eea;
  padding: 0 0.3rem;
  margin-top: 0.3rem;
  flex-shrink: 0;
  min-width: 12px;
}

.period-container {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.3rem;
  height: 50px;
}

.period-container .period-option {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
}

.period-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.15);
  background: #f3f4f6;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.period-option.selected {
  background: #b8bcc4;
  color: #3b5998;
  box-shadow: none;
  outline: none;
  border: none;
}

.time-picker-footer {
  padding: 0.15rem 0.6rem 1rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0;
  border-radius: 0 0 16px 16px;
}

.btn-confirm-time {
  width: 100%;
  padding: 0.65rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-confirm-time:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-confirm-time:active {
  transform: translateY(0);
}

.time-display {
  text-align: center;
  color: white;
  width: 100%;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.adjust-time-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  opacity: 0.95;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.time-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  letter-spacing: 1px;
  margin: 0;
  user-select: none;
}

/* Smaller font for "Select Time" placeholder */
.time-value.is-placeholder {
  font-size: 22px;
  padding-bottom: 6px;
}

.time-period-toggle {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0;
}

.period-option {
  padding: 0.4rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.25);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #262626;
  backdrop-filter: blur(10px);
}

.period-option:active {
  transform: scale(1);
}

.period-option.active {
  background: white;
  color: #667eea;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-color: white;
  transform: scale(1.05);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-schedule-selected,
.btn-schedule-all {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-schedule-selected {
  background: #f59e0b;
  color: white;
}

.btn-schedule-selected:hover {
  background: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(245, 158, 11, 0.3);
}

.btn-schedule-all {
  background: #10b981;
  color: white;
}

.btn-schedule-all:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(16, 185, 129, 0.3);
}

.btn-schedule-selected:active,
.btn-schedule-all:active {
  transform: translateY(0);
}

/* New Design Styles */
.description-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.description-flex {
  position: relative;
  width: 100%;
}

/* Birthday modal specific layout */
.birthday-description-layout {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.birthday-description-layout .textarea-container {
  flex: 1;
}

.blue-box-container {
  flex-shrink: 0;
}

.blue-box {
  width: 140px;
  height: 310px; /* Fixed height independent of textarea */
  background: #3b82f6;
  border-radius: 12px;
  border: 1px solid #2563eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-left: 10px;
}

/* Birthday modal specific layout */
.birthday-description-layout {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  /* Keep original width - no margin adjustment */
}

.birthday-description-layout .textarea-container {
  flex: 1;
  max-width: calc(100% - 140px); /* Reserve space for blue box and gap */
}

/* Birthday description section with grid positioning */
.birthday-description-section {
  position: relative;
}

/* Birthday grid container for proportional sizing */
.birthday-grid-container {
  display: grid;
  grid-template-columns: 2fr 200px; /* Increased from 180px to 200px */
  grid-template-rows: auto auto; /* Two rows: top for textarea/blue box, bottom for upload/preview */
  gap: 10px;
  align-items: start;
}

.birthday-grid-container .textarea-container {
  grid-column: 1;
  grid-row: 1; /* First row only */
}

.birthday-grid-container .blue-box {
  width: 100%;
  height: 100%;
  flex: 1;
  background: #8b5cf6;
  border-radius: 12px;
  border: 1px solid #7c3aed;
  margin: 0; /* Remove all margins */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  cursor: pointer;
  text-align: center;
  transition: transform .25s ease;
}

.birthday-grid-container .blue-box:hover {
  transform: translateY(-2px);
}

.blue-box-text {
  color: white;
  font-size: 15px;
  text-align: center;
  line-height: 1.4;
  margin: 0 0 8px 0;
  font-weight: 400;
}

.blue-box-text-small {
  color: white;
  font-size: 14px;
  text-align: center;
  line-height: 1.3;
  margin: 8px 0 0 0;
  font-weight: 400;
}

.click-here-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 5px 0;
}

.click-here-text {
  color: white;
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 5px;
}

.hand-icon {
  font-size: 20px;
  animation: pointingAnimation 1.5s ease-in-out infinite;
}

@keyframes pointingAnimation {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-3px) scale(1.1);
  }
}

/* Blue Box Container - Same Grid Position */
.blue-box-container {
  grid-column: 2;
  grid-row: 1 / 3; /* Span both rows */
  width: 200px;
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

/* Presenter Form - Exact Same Positioning */
.presenter-form {
  width: 100%;
  height: 100%;
  flex: 1;
  background: #8b5cf6;
  border-radius: 12px;
  border: 2px dotted #7c3aed;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
}

.form-section {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 80px;
  cursor: pointer;
}

.logo-section {
  flex: 0 0 auto;
  height: auto;
  min-height: 80px;
  max-height: 100px;
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 12px;
  font-weight: bold;
  color: white;
  margin: 0 0 4px 0;
  text-align: center;
  flex-shrink: 0;
}

.form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 4px;
}

.example-label {
  font-size: 10px;
  color: #d4965a;
  margin: 0 0 2px 0;
  font-weight: 500;
}

.example-text {
  font-size: 11px;
  color: #d4965a;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.combined-input {
  width: 100%;
  height: 80px;
  flex: 1;
  min-height: 80px;
  padding: 6px;
  font-size: 13px;
  border: none;
  border-radius: 8px;
  background: white;
  color: #333;
  font-weight: 500;
  margin-bottom: 2px;
  outline: none;
  resize: none;
  font-family: Arial, sans-serif;
  line-height: 1.4;
  cursor: text;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
}

.combined-input::-webkit-scrollbar {
  width: 6px;
}

.combined-input::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

.combined-input::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.3);
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.combined-input::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.6);
}

.combined-input:hover::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
}

.combined-input:focus {
  border-color: transparent;
  box-shadow: none;
}

.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1 1 auto;
  min-height: 80px;
}

.hidden-input {
  display: none;
}

.upload-box-presenter {
  width: 100%;
  height: 100%;
  min-height: 80px;
  border: 1px dashed white;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.upload-box-presenter:hover {
  border-color: white;
  background: rgba(255, 255, 255, 0.4);
}

.logo-preview-container {
  position: relative;
  width: 100%;
  height: 80px;
  min-height: 80px;
  max-height: 80px;
  min-width: 120px;
  border: 1px solid #10b981;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

.logo-remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(239, 68, 68, 0.9);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.logo-remove-btn:hover {
  background: rgba(239, 68, 68, 1);
  transform: scale(1.1);
}

.logo-remove-btn svg {
  width: 12px;
  height: 12px;
}

.upload-icon {
  width: 20px;
  height: 20px;
  color: white;
  margin-bottom: 4px;
  opacity: 0.9;
}

.upload-text {
  font-size: 10px;
  color: white;
  margin: 0;
  font-weight: 500;
}

.form-actions-inline {
  display: flex;
  justify-content: center;
  margin-top: 4px;
  padding-top: 4px;
  width: 100%;
}

.back-btn,
.save-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn {
  width: 100%;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.back-btn:hover {
  background: linear-gradient(135deg, #e55a2b 0%, #d7831a 100%);
  transform: translateY(-2px);
}

.save-btn {
  background: #d4965a;
  color: white;
}

.save-btn:hover {
  background: #c4865a;
}

.birthday-grid-container .upload-time-container {
  grid-column: 1; /* Only occupy the first column (under textarea) */
  grid-row: 2; /* Second row - directly under textarea */
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two columns for upload and preview */
  gap: 1rem;
  margin: 0; /* Reset margins since we're in grid now */
  width: 100%; /* Ensure it doesn't exceed grid width */
  max-width: 100%; /* Prevent overflow */
  overflow: hidden; /* Hide any content that might overflow */
  box-sizing: border-box; /* Include padding/border in width calculation */
}

/* Remove old absolute positioning styles for birthday */
.blue-box-container-absolute {
  display: none; /* Hide the old absolute positioned container */
}

.blue-box-container {
  flex-shrink: 0;
}

.blue-box {
  width: 140px;
  height: 310px; /* Same height as description-textarea */
  background: #3b82f6;
  border-radius: 12px;
  border: 1px solid #2563eb;
  margin-left: 10px;
}

.textarea-container {
  position: relative;
  width: 100%;
}

.description-section {
  margin-top: -0.5rem;
  margin-bottom: 0.25rem;
  border-radius: 12px;
  padding: 0;
  background: white;
  flex: 1 1 auto;
}

.section-label {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.125rem;
  margin-top: 0;
}

.description-textarea {
  width: 100%;
  height: 160px; /* Reduced from 180px */
  padding: 10px 12px;
  padding-bottom: 40px; /* Space for smaller buttons */
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-sizing: border-box;
  resize: none;
  color: #1e293b;
  font-size: 15px;
  outline: none;
  line-height: 1.45;
  font-family: inherit;
  transition: all 0.3s;
  overflow-y: auto; /* Show scroll only when content overflows */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

/* Hide scrollbar for WebKit browsers (Chrome, Safari) */
.description-textarea::-webkit-scrollbar {
  display: none;
}

/* Show scrollbar on hover for better UX */
.description-textarea:hover {
  scrollbar-width: thin; /* Firefox */
  -ms-overflow-style: auto; /* Internet Explorer 10+ */
}

.description-textarea:hover::-webkit-scrollbar {
  display: block;
  width: 6px;
}

.description-textarea:hover::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.description-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.description-textarea::placeholder {
  color: #777;
  opacity: 0.7;
  white-space: pre-line;
}

/* Birthday modal specific textarea - no margin needed with grid */
.birthday-description-section .description-textarea {
  margin-right: 0; /* Reset margin since grid handles spacing */
}

.fab-group {
  position: absolute;
  bottom: 12px;
  right: 20px;
  display: flex;
  gap: 6px;
  z-index: 10;
  pointer-events: none; /* Allow clicks to pass through the container */
}

.fab-group button {
  pointer-events: auto; /* Re-enable clicks on the buttons themselves */
}

.btn-generate-quotes {
  height: 32px;
  padding: 0 10px;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  box-shadow: 0 3px 10px rgba(139, 92, 246, 0.25);
  transition: transform .25s ease, box-shadow .25s ease;
  white-space: nowrap;
}

.btn-generate-quotes:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(139, 92, 246, 0.35);
}

.btn-generate-quotes:active {
  transform: translateY(-1px) scale(0.95);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.btn-microphone {
  height: 32px;
  width: 32px;
  background: #ff3b30;
  border-radius: 50%;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 3px 10px rgba(255, 59, 48, 0.25);
  cursor: pointer;
  transition: transform .25s ease, box-shadow .25s ease;
}

.btn-microphone:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(255, 59, 48, 0.35);
}

.btn-microphone:active {
  transform: translateY(-1px) scale(0.95);
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.4);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.btn-microphone svg {
  width: 14px;
  height: 14px;
  stroke: #fff;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.btn-generate-quotes svg {
  width: 12px;
  height: 12px;
  stroke: #fff;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Date/Time Picker Styles */
.datetime-modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.7) !important;
  backdrop-filter: blur(4px);
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 9999 !important;
  padding: 1rem !important;
  will-change: opacity;
  transform: translateZ(0);
}

.datetime-picker-modal {
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
}

/* Calendar Styles */
.calendar-container {
  padding: 0 12px 8px 12px;
}

.calendar-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 0;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  padding: 16px 0 16px 16px;
  border-radius: 0;
  margin-left: -12px;
  margin-right: -12px;
}

.calendar-header h3 {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 24px;
  font-weight: 700;
  text-align: left;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
  color: white;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.close-btn svg {
  width: 20px;
  height: 20px;
  color: white;
}

.calendar-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  margin-bottom: 3px;
}

.nav-btn {  
  background: #f1f5f9;
  border: none;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.08s ease-out;
  will-change: transform, background-color;
}

.nav-btn:hover {
  background: #e2e8f0;
  transform: scale(1.05);
}

.nav-btn:active {
  transform: scale(1.02);
  transition: all 0.05s ease-out;
}

.nav-btn svg {
  width: 16px;
  height: 16px;
  color: #1e293b;
}

.month-year {
  font-weight: 600;
  font-size: 16px;
  color: #1e293b;
}

.calendar-grid {
  margin-bottom: 12px;
}

.weekday-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 4px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  padding: 6px 4px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.08s ease-out;
  position: relative;
  will-change: transform, background-color;
}

.calendar-day:hover {
  background: #e2e8f0;
  transform: scale(1.05);
}

.calendar-day:active {
  transform: scale(1.02);
  transition: all 0.05s ease-out;
}

.calendar-day:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.calendar-day.other-month {
  color: #cbd5e1;
  cursor: default;
}

.calendar-day.other-month:hover {
  background: none;
  transform: none;
}

.calendar-day.other-month:active {
  transform: none;
}

.calendar-day.selected {
  background: #3b82f6;
  color: white;
  font-weight: 600;
  border-radius: 50%;
  transform: scale(1.1);
  aspect-ratio: 1;
  width: 100%;
  height: auto;
  transition: all 0.06s ease-out;
}

.calendar-day.selected:hover {
  background: #2563eb;
  transform: scale(1.15);
}

.calendar-day.today::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: #ef4444;
  border-radius: 50%;
}

.calendar-day.selected.today::after {
  background: white;
}

.calendar-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: -16px;
}

.cancel-btn, .set-btn {
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.cancel-btn:hover {
  background: #e2e8f0;
}

.set-btn {
  background: #3b82f6;
  border: 1px solid #3b82f6;
  color: white;
}

.set-btn:hover {
  background: #2563eb;
}

.set-btn:disabled {
  background: #cbd5e1;
  border-color: #cbd5e1;
  cursor: not-allowed;
}

/* Clock Styles */
.clock-container {
  padding: 0 12px 8px 12px;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.clock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 -12px 24px -12px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  padding: 1rem 1.5rem;
  border-radius: 0;
  width: calc(100% + 24px);
}

.clock-header h3 {
  margin: 0;
  color: white;
  font-size: 20px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.selected-date-display {
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  padding: 8px 0 0 0;
  background: none;
  border-radius: 0;
  border: none;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.clock-face {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
}

.clock-circle {
  position: relative;
  width: 200px;
  height: 200px;
  border: none;
  border-radius: 50%;
  margin-bottom: 20px;
  background: #f0f0f0;
}

.clock-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  z-index: 3;
}

.hour-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24px;
  height: 24px;
  margin-left: -12px;
  margin-top: -12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 2;
}

.hour-marker:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.hour-marker.active {
  background: #3b82f6;
  color: white;
}

.clock-hand {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: 0 0;
  background: #3b82f6;
  border-radius: 2px;
  z-index: 1;
}

.hour-hand {
  width: 60px;
  height: 2px;
  margin-top: -1px;
  position: relative;
}

.hour-hand.minute-picker-active {
  width: 30px;
}

.hour-hand-arrow {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid #3b82f6;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  width: 100%;
}

.time-value {
  flex: 1;
}

.am-pm-toggle {
  display: flex;
  gap: 2px;
}

.am-pm-btn {
  padding: 6px 14px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 13px;
}

.am-pm-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.am-pm-btn:hover:not(.active) {
  background: #f1f5f9;
}

.keyboard-toggle, .clock-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #64748b;
}

.keyboard-toggle-absolute {
  position: absolute;
  top: 50%;
  right: -70px;
  transform: translateY(-50%);
  transform-origin: center center;
  color: #64748b;
  transition: all 0.2s ease;
  z-index: 10;
  cursor: pointer;
  width: 28px;
  height: 28px;
}

.keyboard-toggle-absolute:hover {
  color: #3b82f6;
  transform: translateY(-50%) scale(1.01);
  transform-origin: center center;
}

.keyboard-toggle:hover, .clock-toggle:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* Override any conflicting keyboard-toggle hover styles for absolute positioned element */
.keyboard-toggle.keyboard-toggle-absolute:hover {
  background: transparent !important;
  border: none !important;
  transform: translateY(-50%) !important;
  box-shadow: none !important;
}

.keyboard-toggle svg, .clock-toggle svg {
  width: 16px;
  height: 16px;
}

/* Remove the old container-based styles since we're now targeting SVG directly */
/* Increase size for the absolute positioned keyboard icon */
.keyboard-toggle-absolute svg {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px;
  min-height: 28px;
  max-width: 28px;
  max-height: 28px;
}

/* Even more specific targeting */
div.keyboard-toggle.keyboard-toggle-absolute svg {
  width: 28px !important;
  height: 28px !important;
}

/* Target the SVG specifically for hover effects */
.keyboard-toggle-absolute svg {
  cursor: pointer;
}

.keyboard-toggle-absolute svg:hover {
  color: #3b82f6;
  transform: scale(1.01);
  transform-origin: center center;
  transition: all 0.2s ease;
}

/* Time Input Interface */
.time-input-interface {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
  gap: 20px;
}

.time-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 600;
}

.time-input {
  width: 60px;
  padding: 12px 8px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  transition: border-color 0.2s ease;
}

.time-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.time-separator {
  color: #64748b;
  font-weight: 600;
}

.period-select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.period-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.clock-container .button-group {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 0px !important;
}

.button-group .cancel-btn,
.button-group .set-btn {
  margin: 0;
  display: inline-block;
  flex: 0 0 auto;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  border: none;
  min-width: 80px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.button-group .cancel-btn {
  background: #f1f5f9;
  border: 1px solid #d1d5db;
  color: #4b5563;
}

.button-group .cancel-btn:hover {
  background: #e5e7eb;
  color: #374151;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.button-group .set-btn {
  background: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
}

.button-group .set-btn:hover {
  background: #2563eb;
  border-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.button-group .set-btn:active {
  transform: translateY(0);
}

.button-group .cancel-btn:active {
  transform: translateY(0);
}

.upload-time-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
  clear: both;
  width: 100%; /* Use full available width */
  margin-left: 0;
}

/* Birthday modal upload container - no margin needed with grid */
.birthday-description-section .upload-time-container {
  grid-template-columns: 1fr 1fr;
  margin-right: 0; /* Reset margin since grid handles spacing */
}

.upload-section-new {
  border: 1px dashed #fbbf24;
  border-radius: 12px;
  padding: 0.31rem;
  background: #fffbeb;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}

.image-preview-section {
  border: 1px solid #10b981;
  border-radius: 12px;
  padding: 0.31rem;
  background: #ecfdf5;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}

.preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #10b981;
  opacity: 0.6;
}

.preview-placeholder svg {
  width: 2rem;
  height: 2rem;
}

.preview-text {
  font-size: 1rem;
  font-weight: 500;
  color: #10b981;
}

.preview-image {
  max-width: 100%;
  max-height: 90px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  user-select: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-carousel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.image-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 2;
}

.nav-arrow:hover {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-50%) scale(1.05);
}

.nav-arrow svg {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.nav-left {
  left: -40px;
}

.nav-right {
  right: -40px;
}

.delete-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 3;
}

.delete-image-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.delete-image-btn svg {
  width: 12px;
  height: 12px;
}

.image-indicators {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: #d1d5db;
  cursor: pointer;
  transition: all 0.2s;
}

.indicator.active {
  background: #10b981;
}

.indicator:hover {
  background: #9ca3af;
}

.indicator.active:hover {
  background: #059669;
}

.image-counter {
  position: absolute;
  top: -8px;
  left: -8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}



/* Bulk Selection Controls */
.bulk-controls {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border: 2px solid #e9ecef;
  flex-wrap: wrap;
}

.bulk-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid #6c757d;
  border-radius: 0.25rem;
  background: white;
  color: #6c757d;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bulk-btn:hover:not(:disabled) {
  background: #6c757d;
  color: white;
}

.bulk-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-selected-btn {
  border-color: #dc3545;
  color: #dc3545;
}

.delete-selected-btn:hover:not(:disabled) {
  background: #dc3545;
  color: white;
}

.exit-select-btn {
  border-color: #6c757d;
  color: #6c757d;
}

.exit-select-btn:hover:not(:disabled) {
  background: #6c757d;
  color: white;
}

/* Full-screen image preview modal */
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  cursor: pointer;
}

.preview-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  cursor: default;
}

.full-preview-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 0.5rem;
}

.close-preview-btn {
  position: absolute;
  top: -2.5rem;
  right: 0;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-preview-btn:hover {
  background: white;
  transform: scale(1.1);
}

.preview-navigation {
  position: absolute;
  bottom: -3rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.7);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
}

.preview-nav-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preview-nav-btn:hover {
  background: white;
  transform: scale(1.1);
}

.preview-counter {
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 3rem;
  text-align: center;
}



/* Updated Indicators for Drag & Drop */
.indicator-wrapper {
  position: relative;
  display: inline-block;
  cursor: grab;
}

.indicator-wrapper:active {
  cursor: grabbing;
}

.indicator {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  border: 2px solid #ccc;
  background: transparent;
  margin: 0 0.125rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.indicator.active {
  background: #007bff;
  border-color: #007bff;
}



/* Drag & Drop Visual Feedback */
.image-wrapper {
  position: relative;
  transition: transform 0.2s ease;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 0.5rem;
}

.preview-image:hover {
  opacity: 0.9;
}



.upload-section-new.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.upload-section-new.disabled .upload-label {
  cursor: not-allowed;
}

.upload-box-new {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  height: 100%;
}

.upload-box-new svg {
  width: 2rem;
  height: 2rem;
  color: #f59e0b;
  opacity: 0.5;
}

.upload-text-new {
  font-size: 1rem;
  font-weight: 500;
  color: #f59e0b;
}

.upload-subtitle {
  color: #9ca3af;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
  font-weight: normal;
}

.time-selector-section-new {
  border: 2px solid #6366f1;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 0.31rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 120px;
}

.time-display-box-new {
  width: 100%;
  cursor: pointer;
}

.time-display-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.time-value-large {
  font-size: 4rem;
  font-weight: 700;
  color: white;
  line-height: 1;
  letter-spacing: -0.02em;
  margin-right: 4rem;
}

.time-period-toggle-new {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
}

.period-option-new {
  padding: 0.3rem 0.7rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 50px;
  text-transform: lowercase;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.period-option-new::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s;
}

.period-option-new:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.period-option-new:hover::before {
  left: 100%;
}

.period-option-new:active {
  transform: translateY(0);
  transition: transform 0.1s;
}

.period-option-new.active {
  background: white;
  color: #6366f1;
  border-color: white;
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.3);
  font-weight: 700;
}

.bottom-actions-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 0;
}

.social-media-section {
  border: none;
  border-radius: 12px;
  padding: 0.5rem 1rem 0.75rem;
  background: #f1f3f4;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.social-header-new {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.social-header-new span {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
}

.btn-select-all-social {
  padding: 0.375rem 1rem;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-select-all-social:hover {
  background: #7c3aed;
  transform: translateY(-1px);
}

.social-title {
  font-size: 1rem;
  font-weight: 600;
  color: #f59e0b;
  margin: 0;
  text-align: center;
}

.social-icons {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  gap: 0.125rem;
}

.social-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
  background: #9ca3af !important;
  filter: grayscale(100%);
  flex-shrink: 0;
}

.social-icon svg {
  width: 14px;
  height: 14px;
}

.social-icon.selected {
  filter: none;
}

.social-icon.facebook.selected { background: #1877f2 !important; }
.social-icon.whatsapp.selected { background: #25d366 !important; }
.social-icon.instagram.selected { background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%) !important; }
.social-icon.twitter.selected { background: #1da1f2 !important; }
.social-icon.tiktok.selected { background: #000000 !important; }
.social-icon.youtube.selected { background: #ff0000 !important; }
.social-icon.linkedin.selected { background: #0077b5 !important; }
.social-icon.telegram.selected { background: #0088cc !important; }
.social-icon.snapchat.selected { background: #fffc00 !important; color: #000; }

.social-icon:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-select-all {
  padding: 0.75rem;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-select-all:hover {
  background: #d97706;
  transform: translateY(-1px);
}

.action-buttons-new {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-schedule-selected-new,
.btn-schedule-all-new {
  width: 100%;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-schedule-selected-new {
  background: #f59e0b;
  color: white;
}

.btn-schedule-selected-new:hover:not(:disabled) {
  background: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.3);
}

.btn-schedule-selected-new:disabled {
  background: #9ca3af;
  color: #d1d5db;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.btn-schedule-all-new {
  background: #10b981;
  color: white;
}

.btn-schedule-all-new:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
}

.btn-schedule-all-new:disabled {
  background: #9ca3af;
  color: #d1d5db;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* Birthday modal single button - make it taller and span both grid columns */
/* Use class-based targeting for better browser compatibility */
.modal-body .bottom-actions-container.birthday-layout,
.modal-body:has(.birthday-grid-container) .bottom-actions-container {
  display: flex !important;
  flex-direction: row !important;
  gap: 1.5rem !important;
  grid-template-columns: none !important;
  align-items: stretch !important;
}

.modal-body .bottom-actions-container.birthday-layout .action-buttons-new,
.modal-body:has(.birthday-grid-container) .bottom-actions-container .action-buttons-new {
  width: 50% !important;
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
}

.modal-body .bottom-actions-container.birthday-layout .social-media-section,
.modal-body:has(.birthday-grid-container) .bottom-actions-container .social-media-section {
  width: 50% !important;
  flex: 1 !important;
}

.modal-body .bottom-actions-container.birthday-layout .action-buttons-new .btn-schedule-all-new,
.modal-body:has(.birthday-grid-container) .bottom-actions-container .action-buttons-new .btn-schedule-all-new {
  padding: 1.25rem 1.5rem;
  flex: 1 !important;
  width: 100% !important;
}

/* Scheduled Task Card */
.scheduled-task-card {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  text-align: center;
  color: white;
  animation: slideIn 0.5s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-icon {
  width: 3rem;
  height: 3rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.success-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  stroke-width: 3;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.card-subtitle {
  font-size: 0.875rem;
  font-weight: 400;
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
}

/* Modal Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-enter-from .modal-content {
  transform: scale(0.8) translateY(-20px);
}

.modal-fade-leave-to .modal-content {
  transform: scale(0.8) translateY(20px);
}

/* Responsive Modal Styles */
@media (max-width: 768px) {
  .modal-content {
    max-width: 95%;
    border-radius: 16px;
  }

  .modal-header {
    padding: 1.25rem 1.5rem;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .upload-sections-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .time-display-box {
    min-height: 150px;
  }

  .time-value {
    font-size: 2rem;
  }

  .events-list {
    justify-content: flex-start;
  }

  .event-item {
    font-size: 0.8125rem;
    padding: 0.4rem 0.875rem;
  }

  /* Responsive adjustments for image preview */
  
  .bulk-controls {
    gap: 0.25rem;
    padding: 0.5rem;
  }
  
  .bulk-btn {
    padding: 0.3rem 0.5rem;
    font-size: 0.7rem;
  }



  .preview-navigation {
    bottom: -2.5rem;
    padding: 0.4rem 0.8rem;
  }

  .preview-nav-btn {
    width: 1.8rem;
    height: 1.8rem;
    font-size: 0.9rem;
  }

  .close-preview-btn {
    width: 2rem;
    height: 2rem;
    font-size: 1.2rem;
  }
}

/* Date/Time Picker Styles */
.datetime-picker-modal {
  background: white;
  border-radius: 0;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Calendar Styles */
.calendar-container {
  padding: 0 16px 16px 16px;
  animation: fadeIn 0.3s ease-out;
}

.calendar-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 0;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  padding: 24px 0 24px 20px;
  border-radius: 0;
  margin-left: -16px;
  margin-right: -16px;
}

.calendar-header h3 {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 24px;
  font-weight: 700;
  text-align: left;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
  color: white;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.close-btn svg {
  width: 20px;
  height: 20px;
  color: white;
}

.calendar-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  margin-bottom: 10px;
}

.nav-btn {
  background: #f1f5f9;
  border: none;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: #e2e8f0;
  transform: scale(1.05);
}

.nav-btn svg {
  width: 16px;
  height: 16px;
  color: #1e293b;
}

.month-year {
  font-weight: 600;
  font-size: 16px;
  color: #1e293b;
}

.calendar-grid {
  margin-bottom: 12px;
}

.weekday-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 4px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  padding: 6px 4px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.08s ease-out;
  position: relative;
  will-change: transform, background-color;
}

.calendar-day:hover {
  background: #e2e8f0;
  transform: scale(1.05);
}

.calendar-day:active {
  transform: scale(1.02);
  transition: all 0.05s ease-out;
}

.calendar-day:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.calendar-day.other-month {
  color: #cbd5e1;
  cursor: default;
}

.calendar-day.other-month:hover {
  background: none;
  transform: none;
}

.calendar-day.other-month:active {
  transform: none;
}

.calendar-day.selected {
  background: #3b82f6;
  color: white;
  font-weight: 600;
  border-radius: 50%;
  transform: scale(1.1);
  aspect-ratio: 1;
  width: 100%;
  height: auto;
  transition: all 0.06s ease-out;
}

.calendar-day.selected:hover {
  background: #2563eb;
  transform: scale(1.15);
}

.calendar-day.today::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: #ef4444;
  border-radius: 50%;
}

.calendar-day.selected.today::after {
  background: white;
}

.calendar-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: -16px;
}

.cancel-btn, .set-btn {
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.cancel-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.cancel-btn:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.set-btn {
  background: #3b82f6;
  border: 1px solid #3b82f6;
  color: white;
}

.set-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.set-btn:disabled {
  background: #cbd5e1;
  border-color: #cbd5e1;
  cursor: not-allowed;
  transform: none;
}

/* Clock Styles */
.clock-container {
  padding: 0 24px 24px 24px;
  animation: slideInLeft 0.3s ease-out;
}

.clock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 -24px 24px -24px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  padding: 1rem 1.5rem;
  border-radius: 0;
  width: calc(100% + 48px);
}

.clock-header h3 {
  margin: 0;
  color: white;
  font-size: 20px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.selected-date-display {
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  padding: 8px 0 0 0;
  background: none;
  border-radius: 0;
  border: none;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.clock-face {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
}

.clock-circle {
  position: relative;
  width: 200px;
  height: 200px;
  border: none;
  border-radius: 50%;
  margin-bottom: 20px;
  background: #f0f0f0;
}

.clock-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  z-index: 3;
}

.hour-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 32px;
  height: 32px;
  margin-left: -16px;
  margin-top: -16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 2;
  color: #1e293b;
}

.hour-marker:hover {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hour-marker.active {
  background: #3b82f6;
  color: white;
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.minute-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 28px;
  height: 28px;
  margin-left: -14px;
  margin-top: -14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  /* Instant response with minimal transition for visual feedback only */
  transition: color 0.1s ease-out, background 0.1s ease-out;
  z-index: 2;
  color: #1e293b;
  transform-origin: center;
  /* Hardware acceleration for smooth rendering */
  will-change: transform;
  /* Optimize for touch interactions */
  touch-action: manipulation;
}

.minute-marker:hover {
  color: #3b82f6;
  /* Instant scaling with no transition delay */
  transform: scale(1.08);
  z-index: 3;
}

.minute-marker.active {
  background: #8b5cf6;
  color: white;
  border-radius: 50%;
  /* Instant active state */
  transform: scale(1.03);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
  z-index: 3;
}

.clock-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  font-weight: 500;
  width: 100%;
  justify-content: center;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.back-btn:hover {
  background: linear-gradient(135deg, #e55a2b 0%, #d7831a 100%);
  transform: translateY(-2px);
}

.back-btn svg {
  width: 16px;
  height: 16px;
}

.minute-hand {
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
  border-radius: 1px;
}

.clock-hand {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: 0 center;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 3px;
  z-index: 1;
  /* Instant movement with hardware acceleration */
  transition: none;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.2);
  /* Optimize for smooth transform operations */
  will-change: transform;
  /* Use GPU compositing for smoothest possible rotation */
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.hour-hand {
  width: 70px;
  height: 3px;
  margin-top: -1.5px;
  position: relative;
}

.hour-hand.minute-picker-active {
  width: 35px;
}

.hour-hand-arrow {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid #3b82f6;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  width: 100%;
}

.time-value {
  flex: 1;
}

.am-pm-toggle {
  display: flex;
  gap: 2px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.am-pm-btn {
  padding: 6px 14px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  font-size: 13px;
  color: #64748b;
}

.am-pm-btn.active {
  background: #3b82f6;
  color: white;
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.am-pm-btn:hover:not(.active) {
  background: #e2e8f0;
  color: #1e293b;
}

.keyboard-toggle, .clock-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.keyboard-toggle:hover, .clock-toggle:hover {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.keyboard-toggle svg, .clock-toggle svg {
  width: 16px;
  height: 16px;
}

/* Time Input Interface */
.time-input-interface {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
  gap: 20px;
  animation: fadeIn 0.3s ease-out;
}

.time-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.time-input {
  width: 70px;
  padding: 12px 8px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  transition: all 0.2s ease;
  background: white;
}

.time-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  transform: scale(1.02);
}

.time-separator {
  color: #64748b;
  font-weight: 700;
  font-size: 28px;
}

.period-select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  color: #1e293b;
}

.period-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  transform: scale(1.02);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .datetime-picker-modal {
    max-width: 95%;
    margin: 0 10px;
  }
  
  .calendar-container,
  .clock-container {
    padding: 16px;
  }
  
  .clock-circle {
    width: 180px;
    height: 180px;
  }
  
  .hour-marker {
    width: 28px;
    height: 28px;
    margin-left: -14px;
    margin-top: -14px;
    font-size: 12px;
  }
  
  .time-display {
    font-size: 24px;
  }
  
  .time-input-group {
    padding: 12px 16px;
    gap: 8px;
  }
  
  .time-input {
    width: 60px;
    font-size: 20px;
  }
  
  .time-separator {
    font-size: 24px;
  }
}

/* ===== POPUP CALENDAR - ULTRA-SMOOTH HIGH-PERFORMANCE ===== */
/* Apply exact same styling as main calendar with enhanced performance */
.datetime-picker-modal .calendar-days {
  gap: 0.5rem;
  text-align: center;
  padding: 0 1.5rem 1rem 1.5rem;
  contain: layout style;
  will-change: contents;
}

.datetime-picker-modal .calendar-day {
  aspect-ratio: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.05s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  will-change: transform, background-color, box-shadow, border-color;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  color: #374151;
  font-weight: 600;
  transform: translateZ(0);
  backface-visibility: hidden;
  contain: layout style paint;
}

.datetime-picker-modal .calendar-day:hover {
  background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
  border-color: #f59e0b;
  transform: translateZ(0) translateY(-1px) scale(1.03);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.25);
  color: #92400e;
  transition: all 0.03s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.datetime-picker-modal .calendar-day:active {
  transform: translateZ(0) translateY(0px) scale(1.01);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
  transition: all 0.02s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #78350f;
}

.datetime-picker-modal .calendar-day:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.datetime-picker-modal .calendar-day.other-month {
  opacity: 0.4;
  cursor: default;
  pointer-events: none;
  background: transparent;
  border: none;
  box-shadow: none;
  transform: translateZ(0);
}

.datetime-picker-modal .calendar-day.other-month:hover {
  background: transparent;
  transform: translateZ(0);
  box-shadow: none;
}

.datetime-picker-modal .calendar-day.other-month:active {
  transform: translateZ(0);
}

.datetime-picker-modal .calendar-day.selected {
  background: #3b82f6;
  color: white;
  font-weight: 600;
  border-radius: 50%;
  transform: translateZ(0) scale(1.1);
  border: none;
  transition: all 0.04s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.datetime-picker-modal .calendar-day.selected:hover {
  background: #2563eb;
  transform: translateZ(0) scale(1.12);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  transition: all 0.03s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.datetime-picker-modal .calendar-day.selected:active {
  background: #1d4ed8;
  transform: translateZ(0) scale(1.08);
  box-shadow: 0 3px 10px rgba(59, 130, 246, 0.35);
  transition: all 0.02s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.datetime-picker-modal .calendar-day.today::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: #ef4444;
  border-radius: 50%;
}

.datetime-picker-modal .calendar-day.selected.today::after {
  background: white;
}

/* Enhanced hardware acceleration for ultra-smooth performance */
.datetime-picker-modal .calendar-day,
.datetime-picker-modal .calendar-day:before,
.datetime-picker-modal .calendar-day:after {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  image-rendering: crisp-edges;
}
/* ===== END POPUP CALENDAR STYLING ===== */
</style>