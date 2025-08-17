<template>
    <ion-page class="m-0">
    <page-header>My Profile</page-header>

    <ion-content>
      <div class=" bg-secondary h-full w-full px-[80px] py-[50px]">

        <!-- Breadcrumb -->
        <Breadcrumb
          prevPageName="My Account"
          prevPageRoute="/myAccountPage"
          currentPageName="Notifications"
          class="pb-3"
        />
        
        <div class="bg-white rounded-lg h-full w-full py-5 px-20">
          <div class="border-b pb-4">
                  <div
                  v-for="(notif, index) in notifications"
                  :key="index"
                  
                >
                  <div
                    class="flex bg-white border justify-between h-full w-full border-gray-300 hover:shadow-md items-center px-10 mb-4 rounded-md transition-all duration-200 hover:scale-105"
                  >
                    
                      <h3 class="text-sm font-semibold">{{ notif.title }}</h3>
                      <p class="text-sm text-gray-500">{{ notif.desc }}</p>
                    

                    <div class="flex gap-2">
                      <button
                        class="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-md text-sm"
                        @click="acceptNotification(index)"
                      >
                        Accept
                      </button>

                      <button
                        class="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md text-sm"
                        @click="rejectNotification(index)"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
          </div>
        </div>
      </div>
      </ion-content>
      </ion-page>
</template>

<script setup>
import { watch } from "vue";
import { useNotification } from "@/composables/useNotification";
import pageHeader from "../../../Header/pageHeader.vue";
import Breadcrumb from "@/components/pages/Breadcrumb.vue";

const { notifications, notificationCount } = useNotification();

// Remove hardcoded notifications here, since they already exist in useNotification.js

function acceptNotification(index) {
  notifications.value.splice(index, 1); // Remove notification
  notificationCount.value = notifications.value.length; // Update count
}

function rejectNotification(index) {
  notifications.value.splice(index, 1); // Remove notification
  notificationCount.value = notifications.value.length; // Update count
}

// Automatically keep count in sync
watch(
  notifications,
  () => {
    notificationCount.value = notifications.value.length;
  },
  { deep: true }
);
</script>

<style scoped>
ion-item {
  --inner-padding-end: 0;
}
</style>
