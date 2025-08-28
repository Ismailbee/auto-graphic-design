<template>
  <ion-page>
    <page-header label="Videos" />

    <ion-content :fullscreen="true">
      <div class="bg-secondary min-h-screen w-full sm:px-[80px] py-8">
        <!-- Breadcrumb -->
        <Breadcrumb
          prevPageName="Home"
          prevPageRoute="/home"
          currentPageName="Videos"
          class="px-6 sm:px-0 pb-3"
        />

        <div class="lg:grid lg:grid-cols-3 lg:gap-8 px-4 sm:px-0">
          <!-- Main Video Content -->
          <div class="lg:col-span-2">
            <!-- Video Player -->
            <div class="bg-black rounded-xl shadow-lg overflow-hidden aspect-video mb-4">
              <video
                ref="videoPlayer"
                controls
                class="w-full h-full"
                :poster="mainVideo.poster"
                @play="handlePlay"
                @pause="handlePause"
              >
                <source :src="mainVideo.src" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <!-- Video Details -->
            <div class="px-2">
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{{ mainVideo.title }}</h1>
              <div class="flex flex-col sm:flex-row sm:items-center justify-between text-gray-600">
                <p class="mb-2 sm:mb-0">{{ mainVideo.views }} views • {{ mainVideo.uploadDate }}</p>
                <div class="flex items-center space-x-4">
                  <ion-button fill="clear" class="text-gray-700" @click="handleLike">
                    <ion-icon name="start" :icon="thumbsUpOutline"></ion-icon>
                    {{ mainVideo.likes }}
                  </ion-button>
                  <ion-button fill="clear" class="text-gray-700" @click="handleShare">
                    <ion-icon name="start" :icon="shareSocialOutline"></ion-icon>
                    Share
                  </ion-button>
                  <ion-button fill="clear" class="text-gray-700" @click="handleSave">
                    <ion-icon name="start" :icon="bookmarkOutline"></ion-icon>
                    Save
                  </ion-button>
                </div>
              </div>
            </div>

            <!-- Uploader Info -->
            <div class="flex items-center justify-between p-4 my-4 bg-white rounded-xl shadow-md">
              <div class="flex items-center">
                <img :src="mainVideo.uploader.avatar" alt="Uploader" class="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h2 class="font-bold text-lg">{{ mainVideo.uploader.name }}</h2>
                  <p class="text-gray-500">{{ mainVideo.uploader.subscribers }} subscribers</p>
                </div>
              </div>
              <ion-button :color="isSubscribed ? 'medium' : 'primary'" @click="toggleSubscription">
                {{ isSubscribed ? 'Subscribed' : 'Subscribe' }}
              </ion-button>
            </div>
          </div>

          <!-- Suggested Videos -->
          <div class="lg:col-span-1">
            <h2 class="text-xl font-bold mb-4 px-2">Up Next</h2>
            <div class="space-y-4">
              <div
                v-for="video in suggestedVideos"
                :key="video.id"
                class="flex items-center p-2 bg-white rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-colors"
                @click="playVideo(video)"
              >
                <img :src="video.thumbnail" alt="thumbnail" class="w-24 h-16 object-cover rounded-md mr-4" />
                <div>
                  <h3 class="font-semibold text-md leading-tight">{{ video.title }}</h3>
                  <p class="text-sm text-gray-500">{{ video.uploader }}</p>
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
import { ref, reactive } from 'vue';
import { IonPage, IonContent, IonButton, IonIcon, useIonToast } from '@ionic/vue';
import { thumbsUpOutline, shareSocialOutline, bookmarkOutline } from 'ionicons/icons';
import pageHeader from "../../Header/pageHeader.vue";
import Breadcrumb from "@/components/pages/Breadcrumb.vue";

const videoPlayer = ref(null);
const [presentToast] = useIonToast();
const isSubscribed = ref(false);

const mainVideo = reactive({
  title: 'Getting Started with Vue 3 and Ionic',
  src: 'https://www.w3schools.com/html/mov_bbb.mp4',
  poster: 'https://i.ytimg.com/vi/S_gH-pg_2dc/maxresdefault.jpg',
  views: '1.2M',
  uploadDate: '2 weeks ago',
  likes: '42K',
  uploader: {
    name: 'Vue Masters',
    avatar: 'https://yt3.ggpht.com/a/AATXAJx_V_2-6q_Nn4TCR8o_tSA9Qe_c_xcL-V_tZQ=s900-c-k-c0xffffffff-no-rj-mo',
    subscribers: '250K'
  }
});

const suggestedVideos = ref([
  { id: 1, title: 'Advanced Component Design', uploader: 'Vue Masters', thumbnail: 'https://i.ytimg.com/vi/Y-3_u3-9-aA/hqdefault.jpg', src: '...' },
  { id: 2, title: 'State Management with Pinia', uploader: 'Ionic Academy', thumbnail: 'https://i.ytimg.com/vi/kxyy_n_2-AU/hqdefault.jpg', src: '...' },
  { id: 3, title: 'Building a Real-time Chat App', uploader: 'Net Ninja', thumbnail: 'https://i.ytimg.com/vi/1_p8-pA-yPA/hqdefault.jpg', src: '...' },
  { id: 4, title: 'Mastering Vue Router', uploader: 'Vue School', thumbnail: 'https://i.ytimg.com/vi/g-e-hA0-s-g/hqdefault.jpg', src: '...' },
]);

const showToast = (message, color = 'primary') => {
  presentToast({
    message,
    duration: 2000,
    color,
    position: 'bottom'
  });
};

const handlePlay = () => console.log('Video playing');
const handlePause = () => console.log('Video paused');

const handleLike = () => {
  mainVideo.likes = '42.1K'; // Simulate like increment
  showToast('You liked this video!', 'success');
};

const handleShare = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: mainVideo.title,
        text: `Check out this video: ${mainVideo.title}`,
        url: window.location.href,
      });
      showToast('Shared successfully!', 'success');
    } catch (error) {
      showToast('Error sharing video.', 'danger');
    }
  } else {
    showToast('Web Share API not supported in your browser.', 'warning');
  }
};

const handleSave = () => {
  showToast('Video saved to your library!', 'success');
};

const toggleSubscription = () => {
  isSubscribed.value = !isSubscribed.value;
  const message = isSubscribed.value ? 'Subscribed to Vue Masters!' : 'Unsubscribed from Vue Masters.';
  showToast(message, 'success');
};

const playVideo = (video) => {
  mainVideo.title = video.title;
  mainVideo.uploader.name = video.uploader;
  // In a real app, you would update the video source and other details
  // mainVideo.src = video.src;
  // videoPlayer.value.load();
  // videoPlayer.value.play();
  showToast(`Now playing: ${video.title}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<style scoped>
.bg-secondary {
  background-color: #f8f9fa;
}
.aspect-video {
  aspect-ratio: 16 / 9;
}
</style>
