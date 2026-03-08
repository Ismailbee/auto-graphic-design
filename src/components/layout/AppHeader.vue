<template>
  <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
    <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Left Section: Logo and Navigation -->
        <div class="flex items-center space-x-8">
          <!-- Logo/App Name -->
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <!-- Logo Icon -->
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
            </div>
            <div class="hidden sm:block">
              <h1 class="text-xl font-bold text-gray-900 tracking-tight">Design Studio</h1>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <nav class="hidden md:flex space-x-1" role="tablist">
            <button
              v-for="tab in navigationTabs"
              :key="tab.id"
              @click="$emit('navigate', tab.id)"
              :class="[
                'relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'hover:scale-105 active:scale-95',
                currentView === tab.id
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm'
              ]"
              :aria-selected="currentView === tab.id"
              role="tab"
            >
              <div class="flex items-center space-x-2">
                <font-awesome-icon :icon="tab.icon" class="w-4 h-4" />
                <span>{{ tab.label }}</span>
              </div>

              <!-- Active indicator -->
              <div
                v-if="currentView === tab.id"
                class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full transition-all duration-200"
              ></div>
            </button>
          </nav>
        </div>

        <!-- Right Section: User Profile -->
        <div class="flex items-center space-x-4">

          <!-- Mobile Navigation Menu -->
          <div class="md:hidden">
            <Menu as="div" class="relative">
              <MenuButton class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <font-awesome-icon icon="bars" class="w-5 h-5" />
              </MenuButton>
              
              <transition
                enter-active-class="transition duration-100 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
              >
                <MenuItems class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div class="py-1">
                    <MenuItem
                      v-for="tab in navigationTabs"
                      :key="tab.id"
                      v-slot="{ active }"
                    >
                      <button
                        @click="$emit('navigate', tab.id)"
                        :class="[
                          'flex items-center w-full px-4 py-2 text-sm',
                          active ? 'bg-gray-50 text-gray-900' : 'text-gray-700',
                          currentView === tab.id ? 'bg-blue-50 text-blue-700' : ''
                        ]"
                      >
                        <font-awesome-icon :icon="tab.icon" class="w-4 h-4 mr-3" />
                        {{ tab.label }}
                      </button>
                    </MenuItem>
                  </div>
                </MenuItems>
              </transition>
            </Menu>
          </div>

          <!-- User Profile Dropdown -->
          <Menu as="div" class="relative">
            <MenuButton class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <!-- User Avatar -->
              <div v-if="!authStore.user?.avatar" class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-white">{{ userInitials }}</span>
              </div>
              <img v-else :src="authStore.user.avatar" :alt="userName" class="w-8 h-8 rounded-full object-cover" />
              
              <!-- User Name (hidden on small screens) -->
              <div class="hidden sm:block text-left">
                <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
                <p class="text-xs text-gray-500">{{ userRole }}</p>
              </div>
              
              <!-- Dropdown Arrow -->
              <font-awesome-icon icon="chevron-down" class="w-4 h-4 text-gray-400" />
            </MenuButton>

            <transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <MenuItems class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div class="py-1">
                  <!-- User Info Section -->
                  <div class="px-4 py-3 border-b border-gray-100">
                    <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
                    <p class="text-xs text-gray-500">{{ userEmail }}</p>
                  </div>
                  
                  <!-- Menu Items -->
                  <MenuItem v-for="item in userMenuItems" :key="item.id" v-slot="{ active }">
                    <button
                      @click="handleUserMenuClick(item.id)"
                      :class="[
                        'flex items-center w-full px-4 py-2 text-sm',
                        active ? 'bg-gray-50 text-gray-900' : 'text-gray-700',
                        item.id === 'signout' ? 'text-red-600 hover:text-red-700' : ''
                      ]"
                    >
                      <font-awesome-icon :icon="item.icon" class="w-4 h-4 mr-3" />
                      {{ item.label }}
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </transition>
          </Menu>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { useAuthStore } from '@/stores/auth'

// Props
interface Props {
  currentView: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  navigate: [view: string]
  userAction: [action: string]
}>()

// Auth store
const authStore = useAuthStore()

// Navigation tabs configuration
const navigationTabs = [
  {
    id: 'editor',
    label: 'Main Editor',
    icon: 'edit'
  },
  {
    id: 'demo',
    label: 'Floating Panel Demo',
    icon: 'layer-group'
  }
]

// User data from auth store
const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Guest')
const userEmail = computed(() => authStore.user?.email || '')
const userRole = computed(() => authStore.user?.role || 'User')

const userInitials = computed(() => {
  return (userName.value || 'G')
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
})

// User menu items
const userMenuItems = [
  {
    id: 'profile',
    label: 'Profile & Settings',
    icon: 'user-circle'
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: 'cog'
  },
  {
    id: 'signout',
    label: 'Sign Out',
    icon: 'sign-out-alt'
  }
]

// Methods
function handleUserMenuClick(action: string) {
  emit('userAction', action)
}
</script>

<style scoped>
/* Custom styles for enhanced visual appeal */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style>
