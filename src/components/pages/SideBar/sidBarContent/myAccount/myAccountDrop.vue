<template>
  <div
    class="absolute -right-20 mt-7 w-[190px] p-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-50"
  >
    <!-- User Info -->
    <div class="p-2 border-b border-gray-200">
      <h3 class="text-base m-0 font-semibold text-red-500">
        {{ userStore.fullName }}
      </h3>
      <p class="text-sm text-gray-400 truncate">
        {{ userStore.email }}
      </p>
    </div>

    <!-- Menu Options -->
    <div class="flex flex-col py-2">
      <button
        v-for="(item, index) in menuItems"
        :key="index"
        @click="navigate(item.route)"
        class="px-4 text-black p-1 text-sm text-left hover:bg-gray-100 transition"
      >
        {{ item.label }}
      </button>
    </div>

    <!-- Logout Button -->
    <div class="border-t border-gray-200">
      <button
        @click="logout"
        class="w-full px-4 py-2 text-left text-red-500 hover:bg-red-50 transition flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
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
  { label: "Profile", route: "/myAccountPage" },
  { label: "Account Setting", route: "/accountSet" },
  { label: "Notification", route: "/notification" },
  { label: "Membership Plan", route: "/membership-plan" },
  { label: "Contact Us", route: "/membershipPlan" },
  { label: "Help Center", route: "/membership-plan" },
  { label: "Privacy Policy", route: "/membership-plan" },
  { label: "Terms of service", route: "/membership-plan" },
  { label: "Password & Security", route: "/passwordSecurity" },
];

function navigate(route) {
  router.push(route);
}

async function logout() {
  try {
   
    console.log("User logged out");
    // For now, just reload the page to simulate logout
    window.location.href = '/login';
  } catch (error) {
    console.error("Logout failed:", error);
  }
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