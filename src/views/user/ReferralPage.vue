<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" color="light"></ion-back-button>
        </ion-buttons>
        <ion-title class="custom-title">Referral Program</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="referral-page">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-background">
          <div class="floating-icon icon-1">🎁</div>
          <div class="floating-icon icon-2">💰</div>
          <div class="floating-icon icon-3">⭐</div>
          <div class="floating-icon icon-4">🎉</div>
        </div>
        <div class="hero-content">
          <div class="hero-badge">
            <span>🚀 Earn Rewards</span>
          </div>
          <h1 class="hero-title">Invite Friends,<br/>Earn Big Together!</h1>
          <p class="hero-subtitle">Share the love and get rewarded for every friend who joins</p>
        </div>
      </div>

      <div class="content-wrapper">
        <!-- Rewards Showcase -->
        <div class="rewards-showcase">
          <div class="reward-card primary">
            <div class="reward-header">
              <div class="reward-icon-wrapper">
                <span class="reward-emoji">🎁</span>
              </div>
              <span class="reward-badge">For Your Friend</span>
            </div>
            <div class="reward-amount">750</div>
            <div class="reward-label">Free Tokens</div>
          </div>
          
          <div class="plus-divider">
            <span>+</span>
          </div>
          
          <div class="reward-card secondary">
            <div class="reward-header">
              <div class="reward-icon-wrapper">
                <span class="reward-emoji">💰</span>
              </div>
              <span class="reward-badge">For You</span>
            </div>
            <div class="reward-amount">500</div>
            <div class="reward-label">Free Tokens</div>
          </div>
        </div>

        <!-- Referral Code Section -->
        <div class="referral-code-section">
          <div class="section-header">
            <h2>Your Referral Code</h2>
            <p>Share this code with your friends</p>
          </div>

          <div v-if="loading" class="loading-container">
            <ion-spinner name="crescent" color="primary"></ion-spinner>
            <p>Loading your code...</p>
          </div>

          <div v-else-if="referralCode" class="code-card">
            <div class="code-display-container">
              <div class="code-label">YOUR CODE</div>
              <div class="code-value">{{ referralCode }}</div>
              <div class="code-url">{{ getReferralUrl() }}</div>
            </div>

            <div class="action-buttons-grid">
              <button class="action-btn primary" :disabled="copying" @click="copyCode">
                <span class="btn-icon">
                  <svg v-if="!copying" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <svg v-else fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span class="btn-text">{{ copying ? 'Copied!' : 'Copy Code' }}</span>
              </button>

              <button class="action-btn secondary" @click="shareCode">
                <span class="btn-icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </span>
                <span class="btn-text">Share Link</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Stats Dashboard -->
        <div class="stats-dashboard">
          <div class="section-header">
            <h2>Your Impact</h2>
            <p>Track your referral success</p>
          </div>

          <div v-if="loadingStats" class="loading-container">
            <ion-spinner name="crescent" color="primary"></ion-spinner>
          </div>

          <div v-else-if="stats" class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-value">{{ stats.referralCount }}</div>
              <div class="stat-label">Friends Referred</div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🪙</div>
              <div class="stat-value">{{ stats.totalTokensEarned }}</div>
              <div class="stat-label">Tokens Earned</div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🔥</div>
              <div class="stat-value">{{ stats.referralCount > 0 ? (stats.totalTokensEarned / stats.referralCount).toFixed(0) : 0 }}</div>
              <div class="stat-label">Avg. Per Referral</div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🎯</div>
              <div class="stat-value">{{ getNextMilestone(stats.referralCount) }}</div>
              <div class="stat-label">Next Milestone</div>
            </div>
          </div>
        </div>

        <!-- Recent Referrals -->
        <div v-if="stats && stats.referrals && stats.referrals.length > 0" class="referrals-section">
          <div class="section-header">
            <h2>Recent Referrals</h2>
            <p>Your latest successful invites</p>
          </div>

          <div class="referrals-list">
            <div v-for="referral in stats.referrals.slice(0, 5)" :key="referral.id" class="referral-item">
              <div class="referral-avatar">
                <span>{{ getInitials(referral.referredName) }}</span>
              </div>
              <div class="referral-info">
                <div class="referral-name">{{ referral.referredName }}</div>
                <div class="referral-date">{{ formatDate(referral.createdAt) }}</div>
              </div>
              <div class="referral-reward">
                <span class="reward-amount">+{{ referral.tokensAwarded }}</span>
                <span class="reward-token">tokens</span>
              </div>
            </div>
          </div>
        </div>

        <!-- How It Works -->
        <div class="how-it-works-section">
          <div class="section-header">
            <h2>How It Works</h2>
            <p>Three simple steps to earn rewards</p>
          </div>

          <div class="steps-container">
            <div class="step-item">
              <div class="step-number">
                <span>1</span>
                <div class="step-connector"></div>
              </div>
              <div class="step-content">
                <div class="step-icon">📤</div>
                <h3>Share Your Code</h3>
                <p>Send your unique referral code or link to friends via social media, email, or messaging apps</p>
              </div>
            </div>

            <div class="step-item">
              <div class="step-number">
                <span>2</span>
                <div class="step-connector"></div>
              </div>
              <div class="step-content">
                <div class="step-icon">✨</div>
                <h3>Friend Signs Up</h3>
                <p>They use your code during registration to unlock their welcome bonus of 750 tokens</p>
              </div>
            </div>

            <div class="step-item">
              <div class="step-number">
                <span>3</span>
              </div>
              <div class="step-content">
                <div class="step-icon">🎊</div>
                <h3>Both Get Rewarded</h3>
                <p>You receive 500 tokens instantly, and your friend gets 750 tokens to start their journey!</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Benefits Section -->
        <div class="benefits-section">
          <div class="section-header">
            <h2>Why Refer Friends?</h2>
          </div>

          <div class="benefits-grid">
            <div class="benefit-card">
              <div class="benefit-icon">💎</div>
              <h3>Unlimited Rewards</h3>
              <p>No cap on referrals - invite as many friends as you want</p>
            </div>

            <div class="benefit-card">
              <div class="benefit-icon">⚡</div>
              <h3>Instant Credits</h3>
              <p>Tokens are credited immediately when friends sign up</p>
            </div>

            <div class="benefit-card">
              <div class="benefit-icon">🌟</div>
              <h3>Exclusive Perks</h3>
              <p>Unlock special badges and privileges as you refer more</p>
            </div>

            <div class="benefit-card">
              <div class="benefit-icon">🤝</div>
              <h3>Help Friends</h3>
              <p>Give your friends a head start with bonus tokens</p>
            </div>
          </div>
        </div>

        <!-- CTA Section -->
        <div class="cta-section">
          <div class="cta-card">
            <h2>Start Earning Today!</h2>
            <p>Share your code now and watch your tokens grow</p>
            <button class="cta-button" @click="shareCode">
              <span>Share My Code</span>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonSpinner,
  toastController
} from '@ionic/vue'
import { useUserStore } from '@/stores/user.store'
import { useAuthStore } from '@/stores/auth'

const userStore = useUserStore()
const authStore = useAuthStore()

const referralCode = ref<string>('')
const loading = ref(false)
const loadingStats = ref(false)
const copying = ref(false)

interface Referral {
  id: string
  referredName: string
  createdAt: string
  tokensAwarded: number
}

interface ReferralStats {
  referralCount: number
  totalTokensEarned: number
  referrals: Referral[]
}

const stats = ref<ReferralStats | null>(null)

onMounted(async () => {
  await loadReferralData()
})

async function loadReferralData() {
  if (!authStore.user?.id) return

  loading.value = true
  loadingStats.value = true

  try {
    // Fetch user data to get referral code
    await userStore.fetchUser(authStore.user.id)
    referralCode.value = userStore.user?.referralCode || ''

    // Fetch referral stats
    await userStore.fetchReferralStats(authStore.user.id)
    stats.value = userStore.referralStats
  } catch (error) {
    console.error('Load referral data error:', error)
    showToast('Failed to load referral data', 'danger')
  } finally {
    loading.value = false
    loadingStats.value = false
  }
}

function getReferralUrl(): string {
  return `${window.location.origin}/signup?ref=${referralCode.value}`
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

function getNextMilestone(count: number): number {
  const milestones = [5, 10, 25, 50, 100, 250, 500, 1000]
  for (const milestone of milestones) {
    if (count < milestone) return milestone
  }
  return count + 100
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(referralCode.value)
    copying.value = true
    showToast('Referral code copied!', 'success')
    
    setTimeout(() => {
      copying.value = false
    }, 2000)
  } catch (error) {
    showToast('Failed to copy code', 'danger')
  }
}

async function shareCode() {
  const shareUrl = getReferralUrl()
  const shareText = `Join SmartDesignPro and get 750 FREE tokens! Use my referral code: ${referralCode.value}`

  try {
    // Check if Web Share API is available
    if (navigator.share) {
      await navigator.share({
        title: 'Join SmartDesignPro',
        text: shareText,
        url: shareUrl
      })
      showToast('Shared successfully!', 'success')
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      showToast('Share link copied to clipboard!', 'success')
    }
  } catch (error) {
    // If user cancels share or error occurs, silently fail or copy to clipboard
    if (error instanceof Error && error.name !== 'AbortError') {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
        showToast('Share link copied to clipboard!', 'success')
      } catch (clipboardError) {
        console.error('Share error:', error)
        showToast('Failed to share', 'danger')
      }
    }
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

async function showToast(message: string, color: string = 'primary') {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color,
    position: 'top'
  })
  await toast.present()
}
</script>

<style scoped>
/* Global Page Styles */
.referral-page {
  --background: #f8fafc;
}

.custom-toolbar {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: white;
}

.custom-title {
  color: white;
  font-weight: 600;
}

/* Hero Section */
.hero-section {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 24px 80px;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.floating-icon {
  position: absolute;
  font-size: 48px;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.icon-1 { top: 10%; left: 10%; animation-delay: 0s; }
.icon-2 { top: 20%; right: 15%; animation-delay: 1.5s; }
.icon-3 { bottom: 20%; left: 15%; animation-delay: 3s; }
.icon-4 { bottom: 10%; right: 20%; animation-delay: 4.5s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.hero-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 8px 20px;
  border-radius: 20px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hero-badge span {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.hero-title {
  font-size: 36px;
  font-weight: 800;
  color: white;
  margin: 0 0 16px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  max-width: 400px;
  margin: 0 auto;
}

/* Content Wrapper */
.content-wrapper {
  padding: 0 20px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Rewards Showcase */
.rewards-showcase {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  margin-top: -50px;
  margin-bottom: 32px;
  position: relative;
  z-index: 2;
}

.reward-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.reward-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.reward-card.primary {
  border: 2px solid #f59e0b;
}

.reward-card.secondary {
  border: 2px solid #8b5cf6;
}

.reward-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.reward-icon-wrapper {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reward-card.secondary .reward-icon-wrapper {
  background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
}

.reward-emoji {
  font-size: 32px;
}

.reward-badge {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
}

.reward-amount {
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.reward-card.secondary .reward-amount {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.reward-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.plus-divider {
  display: flex;
  align-items: center;
  justify-content: center;
}

.plus-divider span {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* Section Header */
.section-header {
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
}

.section-header p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* Referral Code Section */
.referral-code-section {
  margin-bottom: 40px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.loading-container p {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.code-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.code-display-container {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px dashed #667eea;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  margin-bottom: 24px;
}

.code-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #667eea;
  margin-bottom: 12px;
}

.code-value {
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: 4px;
  font-family: 'Courier New', Courier, monospace;
  margin-bottom: 16px;
  word-break: break-all;
}

.code-url {
  font-size: 12px;
  color: #64748b;
  word-break: break-all;
}

.action-buttons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.action-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.action-btn.primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-btn.secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.action-btn.secondary:hover {
  background: #f0f9ff;
  transform: translateY(-2px);
}

.btn-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon svg {
  width: 20px;
  height: 20px;
}

/* Stats Dashboard */
.stats-dashboard {
  margin-bottom: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* Referrals Section */
.referrals-section {
  margin-bottom: 40px;
}

.referrals-list {
  background: white;
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.referral-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  transition: background 0.2s ease;
}

.referral-item:hover {
  background: #f8fafc;
}

.referral-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}

.referral-info {
  flex: 1;
  min-width: 0;
}

.referral-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.referral-date {
  font-size: 13px;
  color: #64748b;
}

.referral-reward {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.reward-amount {
  font-size: 16px;
  font-weight: 700;
  color: #10b981;
}

.reward-token {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* How It Works Section */
.how-it-works-section {
  margin-bottom: 40px;
}

.steps-container {
  background: white;
  border-radius: 20px;
  padding: 32px 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.step-item {
  display: flex;
  gap: 20px;
  position: relative;
}

.step-item:not(:last-child) {
  margin-bottom: 32px;
}

.step-number {
  position: relative;
  flex-shrink: 0;
}

.step-number span {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.step-connector {
  position: absolute;
  left: 50%;
  top: 48px;
  transform: translateX(-50%);
  width: 2px;
  height: 50px;
  background: linear-gradient(180deg, #667eea 0%, transparent 100%);
}

.step-content {
  flex: 1;
  padding-top: 4px;
}

.step-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.step-content h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
}

.step-content p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
}

/* Benefits Section */
.benefits-section {
  margin-bottom: 40px;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.benefit-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.benefit-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.benefit-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.benefit-card h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
}

.benefit-card p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* CTA Section */
.cta-section {
  margin-bottom: 20px;
}

.cta-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
}

.cta-card h2 {
  font-size: 28px;
  font-weight: 800;
  color: white;
  margin: 0 0 12px;
}

.cta-card p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 32px;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.cta-button svg {
  width: 20px;
  height: 20px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 28px;
  }

  .rewards-showcase {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .plus-divider {
    display: none;
  }

  .reward-card {
    padding: 20px;
  }

  .code-card {
    padding: 24px 20px;
  }

  .code-value {
    font-size: 24px;
    letter-spacing: 2px;
  }

  .action-buttons-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
  }

  .step-item {
    gap: 16px;
  }

  .step-number span {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .cta-card {
    padding: 40px 24px;
  }

  .cta-card h2 {
    font-size: 24px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
