<template>
  <div class="modal-overlay" v-if="show" @click.self="close">
    <div class="modal-content help-content">
      <div class="modal-header">
        <h3>Help Center</h3>
        <button class="close-btn" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="help-search">
          <input type="text" placeholder="Search for help topics..." v-model="helpSearchQuery">
          <button><i class="fas fa-search"></i></button>
        </div>

        <div class="help-tabs">
          <button
            class="help-tab"
            :class="{ active: activeHelpTab === 'getting-started' }"
            @click="activeHelpTab = 'getting-started'"
          >
            <i class="fas fa-play-circle"></i> Getting Started
          </button>
          <button
            class="help-tab"
            :class="{ active: activeHelpTab === 'tutorials' }"
            @click="activeHelpTab = 'tutorials'"
          >
            <i class="fas fa-video"></i> Tutorials
          </button>
          <button
            class="help-tab"
            :class="{ active: activeHelpTab === 'faq' }"
            @click="activeHelpTab = 'faq'"
          >
            <i class="fas fa-question-circle"></i> FAQ
          </button>
          <button
            class="help-tab"
            :class="{ active: activeHelpTab === 'support' }"
            @click="activeHelpTab = 'support'"
          >
            <i class="fas fa-headset"></i> Support
          </button>
        </div>

        <div class="help-tab-content">
          <div v-if="activeHelpTab === 'getting-started'">
            <div class="help-articles">
              <div class="help-article">
                <div class="article-icon"><i class="fas fa-play-circle"></i></div>
                <div class="article-content">
                  <h4>Introduction to the editor</h4>
                  <p>Learn the basics of the editor interface and tools.</p>
                  <a href="#">Read more <i class="fas fa-arrow-right"></i></a>
                </div>
              </div>
              <div class="help-article">
                <div class="article-icon"><i class="fas fa-palette"></i></div>
                <div class="article-content">
                  <h4>Working with templates</h4>
                  <p>How to use and customize templates for your designs.</p>
                  <a href="#">Read more <i class="fas fa-arrow-right"></i></a>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeHelpTab === 'tutorials'">
            <div class="video-tutorials">
              <div class="video-tutorial">
                <div class="video-thumbnail">
                  <img src="https://via.placeholder.com/160x90" alt="Tutorial thumbnail">
                  <div class="play-button"><i class="fas fa-play"></i></div>
                </div>
                <div class="video-info">
                  <h4>Getting Started with Audio Graphic Design</h4>
                  <span class="video-duration">5:32</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeHelpTab === 'faq'">
            <div class="faq-list">
              <div class="faq-item" v-for="(faq, index) in faqs" :key="index">
                <div class="faq-question" @click="toggleFaq(index)">
                  <span>{{ faq.question }}</span>
                  <i :class="faq.isOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                </div>
                <div class="faq-answer" v-if="faq.isOpen" v-html="faq.answer"></div>
              </div>
            </div>
          </div>

          <div v-if="activeHelpTab === 'support'">
            <div class="support-options">
              <div class="support-option">
                <div class="support-icon"><i class="fas fa-envelope"></i></div>
                <div class="support-content">
                  <h4>Email Support</h4>
                  <p>Get help from our support team via email.</p>
                  <a href="mailto:support@audiographicdesign.com">support@audiographicdesign.com</a>
                </div>
              </div>
              <div class="support-option">
                <div class="support-icon"><i class="fas fa-comments"></i></div>
                <div class="support-content">
                  <h4>Live Chat</h4>
                  <p>Chat with our support agents in real-time.</p>
                  <button class="start-chat-btn">
                    <i class="fas fa-comment"></i> Start Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: Boolean,
})

const emit = defineEmits(['close'])

const helpSearchQuery = ref('')
const activeHelpTab = ref('getting-started')

const faqs = ref([
  {
    question: 'How do I resize my canvas?',
    answer: 'You can resize your canvas by going to <strong>Settings > Canvas</strong> and selecting a preset size or entering custom dimensions.',
    isOpen: false
  },
  {
    question: 'Can I collaborate with others in real-time?',
    answer: 'Yes! Click the <strong>Share</strong> button in the top-right corner, then go to the <strong>Team</strong> tab to invite collaborators by email.',
    isOpen: false
  },
])

function close() {
  emit('close')
}

function toggleFaq(index) {
  faqs.value[index].isOpen = !faqs.value[index].isOpen
}
</script>

<style scoped>
/* Using styles from AppHeader.vue for now */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1002;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 16px;
  width: 550px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.dark-theme .modal-content {
  background-color: #2d3748;
  color: var(--text-dark-primary);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--header-border-light);
}

.dark-theme .modal-header {
  border-bottom-color: var(--header-border-dark);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: var(--text-light-secondary);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
