<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Help"
        @click.self="emit('close')"
      >
        <div class="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
          <div class="flex items-start justify-between gap-4 p-5 border-b border-gray-200">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Quick Tips</h2>
              <p class="text-sm text-gray-600">Fast ways to get a great result.</p>
            </div>
            <button
              type="button"
              class="ui-pressable ui-focusable rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              @click="emit('close')"
            >
              Close
            </button>
          </div>

          <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="rounded-xl border border-gray-200 p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-2">Wedding Sticker (Chat)</h3>
              <ul class="text-sm text-gray-700 space-y-2">
                <li><span class="font-medium">Title:</span> “Wedding Ceremony”</li>
                <li><span class="font-medium">Names:</span> “Aisha &amp; Suleiman”</li>
                <li><span class="font-medium">Date:</span> “6th Jan 2026”</li>
                <li><span class="font-medium">Courtesy:</span> “Courtesy of the family”</li>
              </ul>
              <p class="mt-3 text-xs text-gray-500">Tip: after preview, use Edit to reposition the picture.</p>
            </div>

            <div class="rounded-xl border border-gray-200 p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-2">Shortcuts</h3>
              <ul class="text-sm text-gray-700 space-y-2">
                <li><span class="font-medium">Enter</span> sends your chat message</li>
                <li><span class="font-medium">Esc</span> closes this panel</li>
              </ul>
              <p class="mt-3 text-xs text-gray-500">Motion is subtle and respects reduced-motion.</p>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3 p-5 border-t border-gray-200">
            <div class="text-xs text-gray-500">You can open this anytime from Help.</div>
            <button
              type="button"
              class="ui-pressable ui-focusable rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
              @click="emit('close')"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  open: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 160ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
