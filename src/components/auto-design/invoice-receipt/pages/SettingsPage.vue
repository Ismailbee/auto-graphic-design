<template>
  <div class="h-screen overflow-y-auto pt-20 md:pt-6 px-6 pb-6 max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-4">Create Branch Account</h1>
    <p class="text-sm text-slate-600 mb-6">Create a new branch account by providing branch name and password.</p>

    <form @submit.prevent="handleCreate" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Branch Name</label>
        <input v-model="name" class="w-full rounded border px-3 py-2" placeholder="e.g. Minna" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Password</label>
        <input v-model="password" type="password" class="w-full rounded border px-3 py-2" placeholder="Create a password" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Confirm Password</label>
        <input v-model="confirm" type="password" class="w-full rounded border px-3 py-2" placeholder="Confirm password" />
      </div>

      <div class="flex items-center gap-3">
        <button type="submit" class="bg-emerald-600 text-white px-4 py-2 rounded">Create</button>
        <button type="button" class="bg-gray-200 px-4 py-2 rounded" @click="() => { name=''; password=''; confirm=''; }">Clear</button>
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-if="success" class="text-sm text-emerald-600">{{ success }}</p>
    </form>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';

import { getBranches, createBranch } from '../api-service';

export default defineComponent({
  name: 'SettingsPage',
  props: {
    branch: {
      type: String,
      default: 'SmartDesignPro'
    }
  },
  setup(props) {
    const name = ref('');
    const password = ref('');
    const confirm = ref('');
    const error = ref('');
    const success = ref('');

    const handleCreate = async () => {
      error.value = '';
      success.value = '';
      if (!name.value || !password.value) {
        error.value = 'Branch name and password are required.';
        return;
      }
      if (password.value !== confirm.value) {
        error.value = 'Passwords do not match.';
        return;
      }

      try {
        const result = await createBranch({ name: name.value, password: password.value });
        if (!result.success) {
          throw new Error(result.message || 'Failed to create branch');
        }
        success.value = `Branch ${name.value} created.`;
        name.value = '';
        password.value = '';
        confirm.value = '';
      } catch (err) {
        error.value = err.message || String(err);
      }
    };

    return { name, password, confirm, error, success, handleCreate };
  },
});
</script>

<style scoped>
.rounded { border-radius: 0.5rem; }
</style>