<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-title>Videos</ion-title>
        <ion-buttons slot="end">
          <ion-button :disabled="loading" @click="refresh">
            Refresh
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar class="!py-2 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
        <ion-searchbar
          v-model="query"
          placeholder="Search videos, creators, tags..."
          :debounce="200"
          class="max-w-5xl mx-auto !px-2"
          show-clear-button="focus"
        />
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="min-h-screen w-full px-4 sm:px-6 py-6 bg-secondary">
        <div class="max-w-6xl mx-auto space-y-4">
          <!-- Controls: Filters + Sort -->
          <div class="flex flex-col gap-3">
            <div class="flex flex-wrap items-center gap-2">
              <ion-chip
                v-for="cat in categories"
                :key="cat.value"
                :outline="activeCategory !== cat.value"
                :color="activeCategory === cat.value ? 'primary' : undefined"
                @click="activeCategory = cat.value; onFilterChange()"
              >
                <ion-label>{{ cat.label }}</ion-label>
              </ion-chip>

              <div class="ms-auto">
                <ion-segment v-model="sortBy" @ionChange="onFilterChange">
                  <ion-segment-button value="latest">
                    <ion-label>Latest</ion-label>
                  </ion-segment-button>
                  <ion-segment-button value="popular">
                    <ion-label>Popular</ion-label>
                  </ion-segment-button>
                  <ion-segment-button value="duration">
                    <ion-label>Duration</ion-label>
                  </ion-segment-button>
                </ion-segment>
              </div>
            </div>
          </div>

          <!-- Grid -->
          <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <VideoSkeleton v-for="i in 9" :key="i" />
          </div>

          <template v-else>
            <div v-if="visibleVideos.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <article
                v-for="video in visibleVideos"
                :key="video.id"
                class="group bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div class="relative">
                  <img
                    :src="video.thumbnail"
                    :alt="video.title"
                    class="w-full aspect-video object-cover"
                    loading="lazy"
                  />
                  <span class="duration-badge">{{ formatDuration(video.duration) }}</span>
                  <button
                    class="play-overlay"
                    aria-label="Play video"
                    @click="openPlayer(video)"
                  >
                    <ion-icon :icon="playCircle" class="text-white text-4xl drop-shadow" />
                  </button>
                </div>

                <div class="p-4 space-y-2">
                  <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 leading-snug line-clamp-2">
                    {{ video.title }}
                  </h3>
                  <div class="flex items-center gap-2 text-xs text-neutral-500">
                    <ion-icon :icon="personCircle" />
                    <span class="truncate">{{ video.author }}</span>
                    <span>•</span>
                    <ion-icon :icon="eye" />
                    <span>{{ formatViews(video.views) }}</span>
                    <span>•</span>
                    <ion-icon :icon="timeOutline" />
                    <span>{{ timeAgo(video.publishedAt) }}</span>
                  </div>

                  <div class="flex flex-wrap gap-1 pt-1">
                    <ion-badge
                      v-for="tag in video.tags"
                      :key="tag"
                      color="medium"
                      class="!rounded-full !px-2 !py-1 text-[10px]"
                    >
                      {{ tag }}
                    </ion-badge>
                  </div>

                  <div class="pt-2 flex gap-2">
                    <ion-button size="small" fill="solid" @click="openPlayer(video)">
                      Play
                    </ion-button>
                    <ion-button size="small" fill="outline" @click="saveForLater(video)">
                      Save
                    </ion-button>
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="flex flex-col items-center justify-center text-center py-16 bg-white/60 dark:bg-neutral-900/60 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
              <img src="/image/logoauto.png" alt="No results" class="w-16 h-16 opacity-60 mb-3" />
              <h3 class="text-neutral-800 dark:text-neutral-200 font-semibold">No results</h3>
              <p class="text-neutral-500 max-w-md">Try adjusting your search or filters to find what you are looking for.</p>
            </div>
          </template>

          <ion-infinite-scroll
            threshold="100px"
            @ionInfinite="onInfinite"
            :disabled="loading || !hasMore"
          >
            <ion-infinite-scroll-content loading-text="Loading more..." />
          </ion-infinite-scroll>
        </div>
      </div>

      <!-- Player Modal -->
      <ion-modal :is-open="isPlayerOpen" @didDismiss="closePlayer">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ currentVideo?.title || 'Player' }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closePlayer">
                <ion-icon :icon="close" slot="icon-only" />
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div class="p-4">
            <div class="rounded-lg overflow-hidden bg-black">
              <video
                v-if="currentVideo"
                ref="videoRef"
                :src="currentVideo.src"
                class="w-full h-auto"
                controls
                autoplay
              />
              <div v-else class="aspect-video flex items-center justify-center text-neutral-300">Loading...</div>
            </div>
            <div class="mt-3">
              <h2 class="font-semibold text-lg">{{ currentVideo?.title }}</h2>
              <p class="text-sm text-neutral-600">By {{ currentVideo?.author }}</p>
            </div>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonChip,
  IonBadge,
  IonIcon,
  IonModal,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSkeletonText,
} from '@ionic/vue'
import { ref, computed, onMounted, watch } from 'vue'
import { playCircle, timeOutline, eye, personCircle, close } from 'ionicons/icons'

// Local skeleton component (inline for simplicity)
const VideoSkeleton = {
  name: 'VideoSkeleton',
  components: { IonSkeletonText },
  template: `
    <div class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <ion-skeleton-text animated style="width: 100%; aspect-ratio: 16 / 9;"></ion-skeleton-text>
      <div class="p-4 space-y-2">
        <ion-skeleton-text animated style="width: 80%; height: 14px;"></ion-skeleton-text>
        <ion-skeleton-text animated style="width: 60%; height: 12px;"></ion-skeleton-text>
      </div>
    </div>
  `,
}

// State
const loading = ref(true)
const query = ref('')
const sortBy = ref('latest')
const activeCategory = ref('all')
const isPlayerOpen = ref(false)
const currentVideo = ref(null)
const videoRef = ref(null)

const categories = [
  { label: 'All', value: 'all' },
  { label: 'Tutorials', value: 'tutorial' },
  { label: 'Templates', value: 'template' },
  { label: 'Exports', value: 'export' },
]

const allVideos = ref([
  // Demo dataset; replace with API hookup when ready
  {
    id: 'v1',
    title: 'Getting Started with the Designer',
    author: 'Studio Team',
    duration: 312, // seconds
    views: 15320,
    publishedAt: '2025-07-12T10:00:00Z',
    category: 'tutorial',
    tags: ['beginner', 'walkthrough'],
    thumbnail: 'https://picsum.photos/seed/v1/640/360',
    src: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
  },
  {
    id: 'v2',
    title: 'Design Templates Overview',
    author: 'Creative Lab',
    duration: 198,
    views: 42103,
    publishedAt: '2025-06-30T15:40:00Z',
    category: 'template',
    tags: ['templates', 'gallery'],
    thumbnail: 'https://picsum.photos/seed/v2/640/360',
    src: 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4',
  },
  {
    id: 'v3',
    title: 'Export Settings Best Practices',
    author: 'Expert Tips',
    duration: 420,
    views: 2198,
    publishedAt: '2025-05-18T08:20:00Z',
    category: 'export',
    tags: ['export', 'quality'],
    thumbnail: 'https://picsum.photos/seed/v3/640/360',
    src: 'https://samplelib.com/lib/preview/mp4/sample-15s.mp4',
  },
  // more examples
  ...Array.from({ length: 9 }).map((_, i) => ({
    id: `vX${i}`,
    title: `Pro Workflow Tips #${i + 1}`,
    author: 'Pro Studio',
    duration: 120 + (i * 17) % 300,
    views: 1000 * (i + 1),
    publishedAt: new Date(Date.now() - (i + 3) * 86400000).toISOString(),
    category: i % 2 === 0 ? 'tutorial' : 'template',
    tags: ['pro', i % 2 === 0 ? 'workflow' : 'gallery'],
    thumbnail: `https://picsum.photos/seed/vx${i}/640/360`,
    src: 'https://samplelib.com/lib/preview/mp4/sample-20s.mp4',
  })),
])

// Derived
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const cat = activeCategory.value
  let items = allVideos.value.filter((v) => {
    const inCat = cat === 'all' || v.category === cat
    if (!inCat) return false
    if (!q) return true
    return (
      v.title.toLowerCase().includes(q) ||
      v.author.toLowerCase().includes(q) ||
      v.tags.some((t) => t.toLowerCase().includes(q))
    )
  })

  if (sortBy.value === 'latest') {
    items = items.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
  } else if (sortBy.value === 'popular') {
    items = items.sort((a, b) => b.views - a.views)
  } else if (sortBy.value === 'duration') {
    items = items.sort((a, b) => b.duration - a.duration)
  }
  return items
})

// Pagination / infinite scroll
const pageSize = 9
const page = ref(1)
const visibleVideos = ref([])
const hasMore = computed(() => filtered.value.length > visibleVideos.value.length)

function sliceVisible() {
  visibleVideos.value = filtered.value.slice(0, page.value * pageSize)
}

function onFilterChange() {
  page.value = 1
  sliceVisible()
}

async function onInfinite(ev) {
  if (!hasMore.value) {
    ev.target.complete()
    return
  }
  // Simulate async load
  await new Promise((r) => setTimeout(r, 400))
  page.value += 1
  sliceVisible()
  ev.target.complete()
}

function refresh() {
  loading.value = true
  // Simulate refetch
  setTimeout(() => {
    page.value = 1
    sliceVisible()
    loading.value = false
  }, 600)
}

// Player controls
function openPlayer(video) {
  currentVideo.value = video
  isPlayerOpen.value = true
}
function closePlayer() {
  isPlayerOpen.value = false
  if (videoRef.value) {
    try { videoRef.value.pause() } catch {}
  }
  setTimeout(() => (currentVideo.value = null), 250)
}

// Utils
function formatDuration(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  if (h) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}
function formatViews(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}
function timeAgo(iso) {
  const d = new Date(iso)
  const diff = Math.floor((Date.now() - +d) / 1000)
  const units = [
    ['y', 31536000],
    ['mo', 2592000],
    ['w', 604800],
    ['d', 86400],
    ['h', 3600],
    ['m', 60],
  ]
  for (const [u, s] of units) {
    const v = Math.floor(diff / s)
    if (v >= 1) return `${v}${u} ago`
  }
  return 'just now'
}

function saveForLater(video) {
  // Hook up to your store or backend later
  // eslint-disable-next-line no-console
  console.log('Saved for later:', video.id)
}

// Effects
onMounted(() => {
  // Simulate initial load
  setTimeout(() => {
    loading.value = false
    sliceVisible()
  }, 700)
})

watch([query, activeCategory, sortBy], () => {
  onFilterChange()
})

// expose icons
defineExpose({})
</script>

<style scoped>
.bg-secondary { background-color: #f8f9fa; }
.duration-badge {
  position: absolute;
  right: 8px;
  bottom: 8px;
  background: rgba(0,0,0,0.8);
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}
.play-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}
article:hover .play-overlay { opacity: 1; background: rgba(0,0,0,0.25); }
.aspect-video { aspect-ratio: 16 / 9; }
</style>
