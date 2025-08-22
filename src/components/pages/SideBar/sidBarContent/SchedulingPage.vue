<template>  
  <ion-page>
    <page-header :icon="arrowBackOutline" label="Scheduling" />

    <ion-content>
      <div class="w-full h-full bg-white flex flex-col">
        <!-- Breadcrumb -->
        <Breadcrumb
          prevPageName="Home"
          prevPageRoute="/home"
          currentPageName="Schedule Selector"
          class="rounded-md shadow-lg pl-16 p-2 pt-6 w-full"
        />

        <!-- Unified Button Group -->
        <div class="flex items-center w-full space-x-3 shadow-lg px-12 pb-3 mt-4 mb-4 justify-between">
          <div class="flex items-center space-x-5">
            <button type="button" @click="selection = 'today'" :class="btnClasses('today', true)">
              Today
            </button>
            <button type="button" @click="selection = 'tomorrow'" :class="btnClasses('tomorrow')">
              Tomorrow
            </button>
            <button type="button" @click="selection = 'everyday'" :class="btnClasses('everyday')">
              Everyday
            </button>
            <button type="button" @click="selection = 'all-friday'" :class="btnClasses('all-friday')">
              All Friday
            </button>

            <!-- National Public Holidays Dropdown -->
            <div 
              class="relative"
              @mouseenter="openHolidayDropdown"
              @mouseleave="delayedCloseHolidayDropdown"
            >
              <button :class="btnClasses('holiday')">
                National Public Holidays
              </button>

              <!-- Dropdown Menu -->
              <transition name="fade">
                <div
                  v-if="holidayDropdownOpen"
                  class="absolute z-20 mt-2 w-72 bg-white border border-gray-300 
                         rounded-md shadow-lg p-2 space-y-1 text-sm font-medium text-gray-800"
                >
                  <!-- Select All Checkbox -->
                  <label
                    class="flex items-center space-x-2 border-b pb-2 mb-2 px-2 py-1 rounded-md 
                           hover:bg-[#F2E7CE] transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      v-model="allSelected"
                      @change="toggleSelectAll"
                      class="form-checkbox h-4 w-4 text-[#BA6900] focus:ring-[#BA6900]"
                    />
                    <span>Select All</span>
                  </label>

                  <!-- Holidays -->
                  <label
                    v-for="(holiday, idx) in holidays"
                    :key="idx"
                    class="flex items-center space-x-2 px-2 py-1 rounded-md 
                           hover:bg-[#F2E7CE] transition-colors cursor-pointer"
                    :title="holiday.date + ' – ' + holiday.name"
                  >
                    <input
                      type="checkbox"
                      :value="holiday"
                      v-model="selectedHolidays"
                      class="form-checkbox h-4 w-4 text-[#BA6900] focus:ring-[#BA6900]"
                    />
                    <span class="whitespace-nowrap truncate">
                      {{ holiday.date }} – {{ holiday.name }}
                    </span>
                  </label>
                </div>
              </transition>
            </div>
          </div>

          <!-- Social Share + Attach + Send -->
          <div class="flex items-center space-x-5">  
            <button @click="shareToSocial('whatsapp')" class="w-7 h-7 flex items-center justify-center bg-green-500 rounded-full text-white hover:scale-110 transition-transform">
              <ion-icon name="logo-whatsapp" class="text-xl" />
            </button>
            <button @click="shareToSocial('facebook')" class="w-7 h-7 flex items-center justify-center bg-blue-600 rounded-full text-white hover:scale-110 transition-transform">
              <ion-icon name="logo-facebook" class="text-xl" />
            </button>
            <button @click="shareToSocial('instagram')" class="w-7 h-7 flex items-center justify-center bg-pink-500 rounded-full text-white hover:scale-110 transition-transform">
              <ion-icon name="logo-instagram" class="text-xl" />
            </button>
            <button @click="shareToSocial('linkedin')" class="w-7 h-7 flex items-center justify-center bg-blue-700 rounded-full text-white hover:scale-110 transition-transform">
              <ion-icon name="logo-linkedin" class="text-xl" />
            </button>
            <button @click="shareToSocial('twitter')" class="w-7 h-7 flex items-center justify-center bg-sky-500 rounded-full text-white hover:scale-110 transition-transform">
              <ion-icon name="logo-twitter" class="text-xl" />
            </button>
            <button @click="shareToSocial('tiktok')" class="w-7 h-7 flex items-center justify-center bg-black rounded-full text-white hover:scale-110 transition-transform">
              <ion-icon name="logo-tiktok" class="text-xl" />
            </button>
          </div>

          <div class="flex items-center space-x-5">
            <button type="button" class="flex items-center px-3 py-1 text-sm font-medium border rounded-md bg-white text-gray-700 hover:bg-[#F2E7CE] transition-colors">
              <ion-icon :icon="attachOutline" class="text-3xl p-0 mr-1 rotate-90"/>
              Attach
            </button>
            <button type="button" class="flex items-center px-4 py-2 text-sm font-medium border rounded-md bg-[#BA6900] text-white hover:bg-[#E07F1A] transition-colors">
              <ion-icon :icon="sendSharp" class="text-lg mr-1" />
              Send
            </button>
          </div>
        </div>

        <!-- Custom Calendar -->
        <div class=" w-full max-w-md p-4 rounded-lg shadow-md">
          <!-- Header -->
          <div class="flex justify-between items-center mb-4">
            <button @click="prevMonth" class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">‹</button>
            <h2 class="text-lg font-semibold">
              {{ monthNames[currentMonth] }} {{ currentYear }}
            </h2>
            <button @click="nextMonth" class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">›</button>
          </div>

          <!-- Week Days -->
          <div class="grid grid-cols-7 text-center font-medium text-sm mb-2">
            <div v-for="day in weekDays" :key="day">{{ day }}</div>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-7 text-center gap-1">
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              class="h-10 flex items-center justify-center rounded cursor-pointer"
              :class="{
                'bg-[#BA6900] text-white': isSelected(day),
                'bg-gray-200': !day,
                'hover:bg-[#F2E7CE]': day
              }"
              @click="selectDate(day)"
            >
              {{ day || '' }}
            </div>
          </div>

          <!-- Selected date -->
          <div v-if="selectedDate" class="mt-4 text-center font-medium">
            Selected: {{ selectedDate }}
          </div>
        </div>

        <!-- Task Form -->
        <div class="flex overflow-auto space-y-4">
          <div class="flex space-y-4 p-4">
            <ion-item>
              <ion-label position="stacked">Task Description</ion-label>
              <ion-textarea v-model="task" auto-grow placeholder="Describe your task..."/>
            </ion-item>

            <ion-button expand="block" color="success" @click="scheduleTask">
              Schedule Task
            </ion-button>
          </div>

          <ion-item>
            <ion-label position="stacked">Select Time</ion-label>
            <ion-datetime v-model="selectedTime" presentation="time" :show-default-buttons="true"/>
          </ion-item>

          <ion-card v-if="scheduledTask">
            <ion-card-header>
              <ion-card-title>Scheduled Task</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p><strong>Date:</strong> {{ selectedDate }}</p>
              <p><strong>Time:</strong> {{ selectedTime }}</p>
              <p><strong>Task:</strong> {{ task }}</p>
              <div v-if="selectedHolidays.length">
                <p><strong>Holidays Selected:</strong></p>
                <ul class="list-disc pl-5">
                  <li v-for="(h, i) in selectedHolidays" :key="i">
                    {{ h.date }} – {{ h.name }}
                  </li>
                </ul>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>


<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { arrowBackOutline, attachOutline, sendSharp } from 'ionicons/icons'
import pageHeader from '../../Header/pageHeader.vue'
import Breadcrumb from '../../Breadcrumb.vue'
import {
  IonPage,
  IonContent,
  IonItem,
  IonLabel,
  IonDatetime,
  IonTextarea,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon
} from '@ionic/vue'

const router = useRouter()

// State
const selectedDate = ref(null)
const selectedTime = ref('')
const task = ref('')
const scheduledTask = ref(false)
const selection = ref('today')
const selectedHolidays = ref([])
const holidayDropdownOpen = ref(false)
const allSelected = ref(false)
let closeTimeout = null

const holidays = ref([
  { date: '2025-01-01', name: "New Year's Day" },
  { date: '2025-03-31', name: 'Eid el-Fitr' },
  { date: '2025-04-01', name: 'Eid el-Fitr Holiday' },
  { date: '2025-04-18', name: 'Good Friday' },
  { date: '2025-04-21', name: 'Easter Monday' },
  { date: '2025-05-01', name: 'Workers’ Day' },
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
  clearTimeout(closeTimeout)
  holidayDropdownOpen.value = true
}
function delayedCloseHolidayDropdown() {
  closeTimeout = setTimeout(() => {
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

function scheduleTask() {
  if (selectedDate.value && selectedTime.value && task.value.trim()) {
    scheduledTask.value = true
    alert('Task Scheduled!')
  } else {
    alert('Please fill in all fields.')
  }
}

const btnClasses = (val) => {
  const base = 'px-4 py-2 text-sm font-medium border rounded-md transition-colors';
  const active = selection.value === val
    ? 'bg-[#BA6900] text-white'
    : 'bg-white text-gray-700 hover:bg-[#F2E7CE]';
  return [base, active].join(' ');
}

// Social Media Share
function shareToSocial(platform) {
  const url = encodeURIComponent("https://myapp.com/goods/123")
  const text = encodeURIComponent(`Check out this product: ${task.value || 'My scheduled item'}`)

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

  const days = Array(firstDay).fill(null)
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
function selectDate(day) {
  if (!day) return
  selectedDate.value = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function isSelected(day) {
  if (!selectedDate.value || !day) return false
  const [y, m, d] = selectedDate.value.split("-").map(Number)
  return y === currentYear.value && m === currentMonth.value + 1 && d === day
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
