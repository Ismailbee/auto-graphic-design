<template>
  <div class="admin-dashboard">
    <AdminSidebar :collapsed="adminStore.sidebarCollapsed" />
    <div class="admin-main" :class="{ 'sidebar-collapsed': adminStore.sidebarCollapsed }">
      <AdminHeader />
      <div class="admin-content">
        <div class="dashboard-header">
          <h1 class="dashboard-title">Analytics</h1>
          <p class="dashboard-subtitle">View detailed analytics and reports</p>
        </div>
        <div class="coming-soon-card">
          <div class="coming-soon-icon">📈</div>
          <h2>Analytics Coming Soon</h2>
          <p>This feature is currently under development.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdminStore } from '@/stores/admin'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
const adminStore = useAdminStore()
</script>

<style scoped src="@/styles/admin.css"></style>
<style scoped>
.coming-soon-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  max-width: 600px;
  margin: 60px auto;
}
.coming-soon-icon { font-size: 80px; margin-bottom: 24px; }
.coming-soon-card h2 { font-size: 28px; font-weight: 600; margin: 0 0 16px 0; color: #fff; }
.coming-soon-card p { font-size: 16px; color: rgba(255, 255, 255, 0.8); margin: 0; }
</style>

