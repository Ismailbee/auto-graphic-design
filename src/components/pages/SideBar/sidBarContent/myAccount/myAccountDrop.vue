<template>
  <div
    class="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-lg z-50"
  >
    <!-- User Info -->
    <div class="p-4 border-b border-gray-200">
      <h3 class="text-base font-semibold text-gray-900">
        {{ userStore.fullName }}
      </h3>
      <p class="text-sm text-gray-500 truncate">
        {{ userStore.email }}
      </p>
    </div>

    <!-- Menu Options -->
    <div class="flex flex-col">
      <button
        v-for="(item, index) in menuItems"
        :key="index"
        @click="navigate(item.route)"
        class="px-4 py-2 text-left hover:bg-gray-100 transition rounded-lg"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const router = useRouter();

const menuItems = [
  { label: "Account Setting", route: "/account-setting" },
  { label: "Notification", route: "/notification" },
  { label: "Membership Plan", route: "/membership-plan" },
  { label: "Password & Security", route: "/password-security" },
];

function navigate(route) {
  router.push(route);
}
</script>

<style scoped>
/* Optional: add a subtle scale-in animation */
div {
  animation: dropdownFade 0.2s ease-out;
}

@keyframes dropdownFade {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
