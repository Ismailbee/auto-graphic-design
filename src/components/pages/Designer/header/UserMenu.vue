<template>
  <div class="user-profile" @click="toggleUserMenu">
    <img :src="userAvatar" alt="User Avatar" />
    <div class="user-dropdown" v-if="showUserMenu">
      <div class="user-info">
        <img :src="userAvatar" alt="User Avatar" class="large-avatar" />
        <div class="user-details">
          <div class="user-name">{{ userStore.user?.name || 'Guest User' }}</div>
          <div class="user-email">{{ userStore.user?.email || 'guest@example.com' }}</div>
        </div>
      </div>
      <hr />
      <button @click="navigateTo('/account')">
        <i class="fas fa-user-circle"></i> My Account
      </button>
      <button @click="navigateTo('/designs')">
        <i class="fas fa-folder"></i> My Designs
      </button>
      <button @click="navigateTo('/templates')">
        <i class="fas fa-star"></i> My Templates
      </button>
      <hr />
      <button @click="logout" class="logout-button">
        <i class="fas fa-sign-out-alt"></i> Sign Out
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../../../stores/user'

const router = useRouter()
const userStore = useUserStore()

const showUserMenu = ref(false)

const userAvatar = computed(() => {
  return 'https://i.pravatar.cc/32?u=' + (userStore.user?.email || 'default');
})

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function navigateTo(path) {
  router.push(path)
  showUserMenu.value = false
}

function logout() {
  userStore.logout()
  router.push('/login')
  showUserMenu.value = false
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-profile')) {
      showUserMenu.value = false
    }
  })
})
</script>

<style scoped>
/* Using styles from AppHeader.vue for now */
.user-profile {
  position: relative;
}

.user-profile img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.user-profile img:hover {
  border-color: var(--primary-color);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.07);
  width: 240px;
  padding: 8px;
  z-index: 10;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.dark-theme .user-dropdown {
  background-color: #1f2937;
  border-color: #374151;
}

.user-dropdown button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
}

.dark-theme .user-dropdown button {
  color: var(--text-dark-primary);
}

.user-dropdown button:hover {
  background-color: #f9fafb;
}

.dark-theme .user-dropdown button:hover {
  background-color: #374151;
}

.user-dropdown hr {
  border: none;
  border-top: 1px solid #f3f4f6;
  margin: 8px 0;
}

.dark-theme .user-dropdown hr {
  border-top-color: #374151;
}
</style>
