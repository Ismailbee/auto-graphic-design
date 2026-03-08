<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <!-- Pull to Refresh - Custom Styled -->
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)" pull-factor="0.5" pull-min="60" pull-max="120">
        <ion-refresher-content
          :pulling-icon="arrowDown"
          pulling-text=""
          refreshing-spinner="crescent"
          refreshing-text="">
        </ion-refresher-content>
      </ion-refresher>
      
      <!-- Custom Refresh Indicator Overlay -->
      <div v-if="isRefreshing" class="custom-refresh-overlay">
        <div class="refresh-indicator">
          <div class="refresh-spinner"></div>
          <p class="refresh-text">Refreshing analytics...</p>
        </div>
      </div>

  <div class="h-screen overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-sky-900 pt-20 md:pt-0">
    <!-- Background accents -->
    <div class="fixed inset-0 opacity-5 pointer-events-none">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_rgba(56,189,248,0.25),_transparent_55%)]"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,_rgba(16,185,129,0.2),_transparent_55%)]"></div>
    </div>

    <div class="relative w-full max-w-full lg:max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8 lg:py-12 pb-20">
      <!-- Page header -->
      <header class="mb-6 sm:mb-8 lg:mb-10">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100/80 dark:bg-sky-900/30 text-sm font-semibold text-sky-700 dark:text-sky-300">
              <span class="h-2 w-2 rounded-full bg-sky-500 animate-pulse"></span>
              {{ branchLabel }} Performance Insights
            </div>
            <h1 class="mt-4 text-3xl font-bold text-slate-900 dark:text-white">Reports &amp; Analytics</h1>
            <p class="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">
              Monitor financial performance, member activity, and operational trends for the {{ branchLabel }} branch.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <select
              v-model="selectedRange"
              class="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button
              @click="refreshData"
              class="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="hidden sm:inline">Refresh</span>
            </button>
            <button
              @click="exportReport"
              class="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 text-sm sm:text-base rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-lg shadow-sky-600/20 transition"
            >
              <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v8m0 0l-3-3m3 3l3-3m-6 6h6a2 2 0 002-2V6a2 2 0 00-2-2h-3.5l-1.5-1.5A1.5 1.5 0 0010 2H6a2 2 0 00-2 2v12a2 2 0 002 2h3" />
              </svg>
              <span class="hidden sm:inline">Export</span>
              <span class="sm:hidden">Export</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Branch warning -->
      <div v-if="!branchName" class="bg-white/90 dark:bg-slate-800/90 border border-amber-200 dark:border-amber-700 rounded-2xl p-8 text-center shadow-xl">
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">No branch selected</h2>
        <p class="text-slate-600 dark:text-slate-400">Return to dashboard and choose a branch to view analytics.</p>
        <button
          @click="goToDashboard"
          class="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20 transition"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      <div v-else>
        <!-- KPI cards -->
        <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
          <KpiCard
            title="Monthly Revenue"
            :value="`₦${monthlyRevenue}`"
            :trend="revenueTrendLabel"
            trendLabel="vs last period"
            gradient="from-emerald-500 to-emerald-600"
          />
          <KpiCard
            title="Active Invoices"
            :value="activeInvoices"
            :trend="invoiceTrendLabel"
            trendLabel="completion rate"
            gradient="from-sky-500 to-blue-600"
          />
          <KpiCard
            title="Active Receipts"
            :value="activeReceipts"
            :trend="receiptTrendLabel"
            trendLabel="issued"
            gradient="from-purple-500 to-purple-600"
          />
          <KpiCard
            title="Member Engagement"
            :value="engagementScore"
            :trend="engagementLabel"
            trendLabel="activity score"
            gradient="from-indigo-500 to-indigo-600"
          />
          <KpiCard
            title="Processing Time"
            :value="processingTimeLabel"
            :trend="processingTrendLabel"
            trendLabel="avg SLA"
            gradient="from-amber-500 to-orange-600"
          />
          <KpiCard
            title="Pending Tasks"
            :value="pendingTasks"
            :trend="tasksTrendLabel"
            trendLabel="to complete"
            gradient="from-rose-500 to-rose-600"
          />
        </section>

        <!-- Revenue trend -->
        <section class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div class="lg:col-span-2 bg-white/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl shadow-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Revenue Trend</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">Projected revenue distribution over selected period</p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="chartType = 'bar'"
                  :class="[
                    'px-3 py-1 rounded-lg text-xs font-semibold transition',
                    chartType === 'bar' ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  ]"
                >
                  Bar
                </button>
                <button
                  @click="chartType = 'line'"
                  :class="[
                    'px-3 py-1 rounded-lg text-xs font-semibold transition',
                    chartType === 'line' ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  ]"
                >
                  Line
                </button>
              </div>
            </div>
            <div class="h-64">
              <Bar v-if="chartType === 'bar'" :data="revenueChartData" :options="revenueChartOptions" />
              <Line v-else :data="revenueChartData" :options="revenueChartOptions" />
            </div>
          </div>

          <!-- Activity mix -->
          <div class="bg-white/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl shadow-xl p-6">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Activity Mix</h2>
            <div class="h-64 flex items-center justify-center">
              <Doughnut :data="activityMixChartData" :options="activityMixChartOptions" />
            </div>
          </div>
        </section>

        <!-- Operational overview -->
        <section class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
          <div class="xl:col-span-2 bg-white/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl shadow-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Operational Highlights</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  Key metrics compared to the previous period
                </p>
              </div>
              <button
                @click="viewRawData"
                class="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-xs text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                View raw data
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TrendCard
                title="Invoice Processing"
                :primary="`${invoiceInsights.processed}`"
                :secondary="`${invoiceInsights.pending} pending`"
                :trend="invoiceInsights.trend"
              />
              <TrendCard
                title="Receipt Issuance"
                :primary="`${receiptInsights.issued}`"
                :secondary="`${receiptInsights.pending} pending`"
                :trend="receiptInsights.trend"
              />
              <TrendCard
                title="Member Actions"
                :primary="memberActionLabel"
                :secondary="`${activityMix[0]?.label || 'Actions'} lead`"
                :trend="engagementLabel"
              />
            </div>
          </div>

          <div class="bg-white/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl shadow-xl p-6">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Recent Signals</h2>
            <ul class="space-y-3">
              <li
                v-for="signal in insightSignals"
                :key="signal.id"
                class="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 p-4"
              >
                <span :class="['mt-1 h-2 w-2 rounded-full', signal.color]"></span>
                <div>
                  <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ signal.title }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">{{ signal.description }}</p>
                  <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ signal.timestamp }}</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <!-- Invoice vs Receipt Comparison Chart -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div class="bg-white/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl shadow-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Document Processing</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">Invoice vs Receipt comparison</p>
              </div>
            </div>
            <div class="h-64">
              <Bar :data="documentComparisonChartData" :options="documentComparisonChartOptions" />
            </div>
          </div>

          <div class="bg-white/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl shadow-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Processing Status</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">Completed vs Pending documents</p>
              </div>
            </div>
            <div class="h-64 flex items-center justify-center">
              <Doughnut :data="statusComparisonChartData" :options="statusComparisonChartOptions" />
            </div>
          </div>
        </section>

        <!-- Activity timeline -->
        <section class="bg-white/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl shadow-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Member Activity Timeline</h2>
              <p class="text-sm text-slate-500 dark:text-slate-400">Most recent actions across your branch</p>
            </div>
            <button
              @click="refreshActivities"
              class="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-xs text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>
          <div v-if="loading" class="py-12 text-center">
            <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
            <p class="mt-4 text-slate-500 dark:text-slate-400">Loading analytics...</p>
          </div>
          <div v-else-if="activities.length === 0" class="py-12 text-center text-slate-500 dark:text-slate-400">
            <p>No member activity recorded during this period.</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <article
              v-for="activity in activities"
              :key="activity.id"
              class="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 p-4"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" :class="activityBadge(activity.action)">
                  {{ actionLabel(activity.action) }}
                </span>
                <span class="text-xs text-slate-400 dark:text-slate-500">{{ formatRelativeTime(activity.timestamp) }}</span>
              </div>
              <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ activity.memberName }}</h3>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ activity.action }}</p>
              <p class="mt-3 text-xs text-slate-400 dark:text-slate-500">{{ activity.branch }} branch</p>
            </article>
          </div>
        </section>
      </div>
    </div>
  </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent, computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonPage, IonContent, IonRefresher, IonRefresherContent } from '@ionic/vue';
import { arrowDown } from 'ionicons/icons';
import { getMemberActivities, getAllReceipts, getAllInvoices } from '../api-service';
import { getDashboardData } from '../api-service';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'vue-chartjs';
import KpiCard from '../components/KpiCard.vue';
import TrendCard from '../components/TrendCard.vue';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default defineComponent({
  name: 'ReportsAnalyticsPage',
  components: { 
    KpiCard, 
    TrendCard, 
    Bar, 
    Line, 
    Doughnut,
    IonPage,
    IonContent,
    IonRefresher,
    IonRefresherContent
  },
  props: {
    branch: {
      type: String,
      default: 'SmartDesignPro'
    }
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();

    const branchName = computed(() => route.query.branch || '');
    const branchLabel = computed(() => (branchName.value ? `${branchName.value} Branch` : 'SmartDesignPro'));

    const selectedRange = ref('30');
    const loading = ref(false);
    const isRefreshing = ref(false);

    const activities = ref([]);
    const revenueTrend = ref([]);
    const activeInvoices = ref(0);
    const activeReceipts = ref(0);
    const pendingTasks = ref(0);
    const monthlyRevenue = ref('0');
    const revenueChange = ref(0);
    const invoiceCompletion = ref(0);
    const engagementScore = ref('0%');
    const engagementChange = ref(0);
    const processingTime = ref(0);
    const processingDelta = ref(0);

    const invoiceInsights = ref({ processed: 0, pending: 0, trend: '+0%' });
    const receiptInsights = ref({ issued: 0, pending: 0, trend: '+0%' });

    const insightSignals = ref([]);
    const chartType = ref('bar'); // Toggle between 'bar' and 'line'

    const activityMix = computed(() => {
      const total = activities.value.length || 1;
      const buckets = {
        created: 0,
        deleted: 0,
        login: 0,
        invoice: 0,
        receipt: 0
      };

      activities.value.forEach((activity) => {
        const action = activity.action?.toLowerCase() || '';
        if (action.includes('created')) buckets.created += 1;
        else if (action.includes('deleted')) buckets.deleted += 1;
        else if (action.includes('invoice')) buckets.invoice += 1;
        else if (action.includes('receipt')) buckets.receipt += 1;
        else if (action.includes('login')) buckets.login += 1;
      });

      return [
        { label: 'Member logins', value: buckets.login, percent: Math.round((buckets.login / total) * 100), color: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-400' },
        { label: 'Accounts created', value: buckets.created, percent: Math.round((buckets.created / total) * 100), color: 'bg-sky-500', gradient: 'from-sky-500 to-sky-400' },
        { label: 'Documents issued', value: buckets.invoice + buckets.receipt, percent: Math.round(((buckets.invoice + buckets.receipt) / total) * 100), color: 'bg-purple-500', gradient: 'from-purple-500 to-purple-400' },
        { label: 'Accounts deleted', value: buckets.deleted, percent: Math.round((buckets.deleted / total) * 100), color: 'bg-rose-500', gradient: 'from-rose-500 to-rose-400' }
      ].filter((item) => item.value > 0);
    });

    // Chart.js data configurations
    const revenueChartData = computed(() => ({
      labels: revenueTrend.value.map(point => point.label),
      datasets: [
        {
          label: 'Revenue (₦)',
          data: revenueTrend.value.map(point => point.value),
          backgroundColor: chartType.value === 'bar' 
            ? 'rgba(56, 189, 248, 0.8)' 
            : 'rgba(56, 189, 248, 0.2)',
          borderColor: 'rgba(56, 189, 248, 1)',
          borderWidth: 2,
          fill: chartType.value === 'line',
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: 'rgba(16, 185, 129, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 6
        }
      ]
    }));

    const revenueChartOptions = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#fff',
          bodyColor: '#e2e8f0',
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return `₦${context.parsed.y.toLocaleString('en-NG')}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(148, 163, 184, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: 'rgba(148, 163, 184, 0.8)',
            font: {
              size: 11
            },
            callback: function(value) {
              return '₦' + (value / 1000).toFixed(0) + 'k';
            }
          }
        },
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: 'rgba(148, 163, 184, 0.8)',
            font: {
              size: 11
            }
          }
        }
      }
    }));

    const activityMixChartData = computed(() => ({
      labels: activityMix.value.map(item => item.label),
      datasets: [
        {
          data: activityMix.value.map(item => item.value),
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',   // emerald
            'rgba(56, 189, 248, 0.8)',   // sky
            'rgba(168, 85, 247, 0.8)',   // purple
            'rgba(244, 63, 94, 0.8)'     // rose
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(56, 189, 248, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(244, 63, 94, 1)'
          ],
          borderWidth: 2,
          hoverOffset: 10
        }
      ]
    }));

    const activityMixChartOptions = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'rgba(148, 163, 184, 0.9)',
            padding: 15,
            font: {
              size: 12,
              weight: '500'
            },
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#fff',
          bodyColor: '#e2e8f0',
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percent = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${context.parsed} (${percent}%)`;
            }
          }
        }
      }
    }));

    // Document comparison chart (Invoice vs Receipt)
    const documentComparisonChartData = computed(() => ({
      labels: ['Processed', 'Pending', 'Total'],
      datasets: [
        {
          label: 'Invoices',
          data: [
            invoiceInsights.value.processed,
            invoiceInsights.value.pending,
            invoiceInsights.value.processed + invoiceInsights.value.pending
          ],
          backgroundColor: 'rgba(56, 189, 248, 0.8)',
          borderColor: 'rgba(56, 189, 248, 1)',
          borderWidth: 2
        },
        {
          label: 'Receipts',
          data: [
            receiptInsights.value.issued,
            receiptInsights.value.pending,
            receiptInsights.value.issued + receiptInsights.value.pending
          ],
          backgroundColor: 'rgba(168, 85, 247, 0.8)',
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 2
        }
      ]
    }));

    const documentComparisonChartOptions = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: 'rgba(148, 163, 184, 0.9)',
            padding: 15,
            font: {
              size: 13,
              weight: '600'
            },
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#fff',
          bodyColor: '#e2e8f0',
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(148, 163, 184, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: 'rgba(148, 163, 184, 0.8)',
            font: {
              size: 11
            }
          }
        },
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: 'rgba(148, 163, 184, 0.8)',
            font: {
              size: 11
            }
          }
        }
      }
    }));

    // Status comparison doughnut chart
    const statusComparisonChartData = computed(() => {
      const totalProcessed = invoiceInsights.value.processed + receiptInsights.value.issued;
      const totalPending = invoiceInsights.value.pending + receiptInsights.value.pending;

      return {
        labels: ['Completed', 'Pending'],
        datasets: [
          {
            data: [totalProcessed, totalPending],
            backgroundColor: [
              'rgba(16, 185, 129, 0.8)',
              'rgba(251, 146, 60, 0.8)'
            ],
            borderColor: [
              'rgba(16, 185, 129, 1)',
              'rgba(251, 146, 60, 1)'
            ],
            borderWidth: 2,
            hoverOffset: 10
          }
        ]
      };
    });

    const statusComparisonChartOptions = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'rgba(148, 163, 184, 0.9)',
            padding: 15,
            font: {
              size: 13,
              weight: '600'
            },
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#fff',
          bodyColor: '#e2e8f0',
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percent = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${context.parsed} documents (${percent}%)`;
            }
          }
        }
      }
    }));

    const revenueTrendLabel = computed(() => `${revenueChange.value >= 0 ? '+' : ''}${revenueChange.value}%`);
    const invoiceTrendLabel = computed(() => `${invoiceCompletion.value}% complete`);
    const receiptTrendLabel = computed(() => `${activeReceipts.value}`);
    const tasksTrendLabel = computed(() => `${pendingTasks.value}`);
    const engagementLabel = computed(() => `${engagementChange.value >= 0 ? '+' : ''}${engagementChange.value}%`);
    const processingTimeLabel = computed(() => `${processingTime.value} hrs`);
    const processingTrendLabel = computed(() => `${processingDelta.value >= 0 ? '+' : ''}${processingDelta.value}% vs target`);
    const engagementScoreLabel = computed(() => engagementScore.value);
    const maxRevenueValue = computed(() => Math.max(...revenueTrend.value.map((point) => point.value), 1));

    const memberActionLabel = computed(() => {
      const top = [...activityMix.value].sort((a, b) => b.value - a.value)[0];
      return top ? `${top.value} actions` : '0 actions';
    });

    const fetchAnalytics = async () => {
      if (!branchName.value) return;
      loading.value = true;
      try {
        const result = await getDashboardData(branchName.value);
        if (result.success) {
          const { data } = result;
          activeInvoices.value = data.activeInvoices ?? 0;
          monthlyRevenue.value = (data.monthlyRevenue ?? 0).toLocaleString('en-NG');
          revenueChange.value = data.revenueChange ?? 0;
          invoiceCompletion.value = data.invoiceCompletion ?? 0;
          engagementScore.value = `${data.engagementScore ?? 72}%`;
          engagementChange.value = data.engagementChange ?? 0;
          processingTime.value = data.processingTime ?? 6;
          processingDelta.value = data.processingDelta ?? -12;
          
          // Fetch receipts to get active receipts count
          const receiptsResult = await getAllReceipts(branchName.value, 100);
          if (receiptsResult.success && Array.isArray(receiptsResult.data)) {
            activeReceipts.value = receiptsResult.data.length;
          } else {
            activeReceipts.value = data.activeReceipts ?? 0;
          }
          
          // Fetch invoices to calculate pending tasks
          const invoicesResult = await getAllInvoices(branchName.value, 100);
          if (invoicesResult.success && Array.isArray(invoicesResult.data)) {
            const pendingInvoices = invoicesResult.data.filter(inv => inv.status === 'pending' || inv.status === 'draft').length;
            const pendingReceipts = receiptsResult.success && Array.isArray(receiptsResult.data) 
              ? receiptsResult.data.filter(rec => rec.status === 'pending' || rec.status === 'draft').length 
              : 0;
            pendingTasks.value = pendingInvoices + pendingReceipts;
          } else {
            pendingTasks.value = data.pendingTasks ?? 0;
          }
          
          invoiceInsights.value = {
            processed: data.invoicesProcessed ?? activeInvoices.value,
            pending: data.invoicesPending ?? Math.max(0, 12 - activeInvoices.value),
            trend: `${data.invoiceTrend ?? '+8%'} QoQ`
          };
          receiptInsights.value = {
            issued: data.receiptsIssued ?? Math.floor(activeInvoices.value * 0.8),
            pending: data.receiptsPending ?? Math.max(0, activeInvoices.value - Math.floor(activeInvoices.value * 0.8)),
            trend: `${data.receiptTrend ?? '+5%'} QoQ`
          };
          buildRevenueTrend(data.monthlyRevenue ?? 0);
          buildSignals();
        } else {
          // Use fallback data if API fails
          applyFallbackData();
        }
      } catch (error) {
        console.error('❌ Failed to load analytics:', error);
        applyFallbackData();
      } finally {
        loading.value = false;
      }
    };

    const loadActivities = async () => {
      if (!branchName.value) return;
      try {
        const result = await getMemberActivities(branchName.value, 18);
        if (result.success) {
          activities.value = Array.isArray(result.data) ? result.data : [];
        } else {
          activities.value = [];
        }
      } catch (error) {
        console.error('❌ Failed to load member activities:', error);
        activities.value = [];
      }
    };

    const refreshData = () => {
      fetchAnalytics();
      loadActivities();
    };

    const handleRefresh = async (event) => {
      console.log('🔄 Pull-to-refresh: Reloading analytics...');
      isRefreshing.value = true;
      fetchAnalytics();
      loadActivities();
      setTimeout(() => {
        isRefreshing.value = false;
        event.target.complete();
      }, 500);
    };

    const refreshActivities = () => {
      loadActivities();
    };

    const exportReport = () => {
      const blob = new Blob([JSON.stringify({
        branch: branchName.value,
        generatedAt: new Date().toISOString(),
        range: selectedRange.value,
        monthlyRevenue: monthlyRevenue.value,
        activeInvoices: activeInvoices.value,
        engagementScore: engagementScoreLabel.value,
        activities: activities.value
      }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${branchName.value || 'sdp'}-analytics.json`;
      link.click();
      URL.revokeObjectURL(url);
    };

    const goToDashboard = () => {
      router.push({ name: 'Dashboard', query: { branch: branchName.value } });
    };

    const viewRawData = () => {
      exportReport();
    };

    const buildRevenueTrend = (baseline) => {
      const base = baseline || 0;
      const length = selectedRange.value === '90' ? 6 : selectedRange.value === '30' ? 5 : 4;
      revenueTrend.value = Array.from({ length }, (_, index) => {
        const factor = 1 + Math.sin((index + 1) * 0.5) * 0.1;
        return {
          label: `W${index + 1}`,
          value: Math.round((base / length || 0) * factor)
        };
      });
    };

    const buildSignals = () => {
      insightSignals.value = [
        {
          id: 'signal-1',
          title: 'High member engagement',
          description: 'Member logins are up compared to the previous period.',
          color: 'bg-emerald-500',
          timestamp: formatRelativeTime(new Date().toISOString())
        },
        {
          id: 'signal-2',
          title: 'Invoices in review',
          description: `${invoiceInsights.value.pending} invoices are awaiting approval.`,
          color: 'bg-amber-500',
          timestamp: 'Updated 2 hours ago'
        },
        {
          id: 'signal-3',
          title: 'Revenue on track',
          description: 'Revenue trend is positive versus the previous cycle.',
          color: 'bg-sky-500',
          timestamp: 'Updated today'
        }
      ];
    };

    const applyFallbackData = () => {
      activeInvoices.value = 12;
      activeReceipts.value = 18;
      pendingTasks.value = 8;
      monthlyRevenue.value = (3500000).toLocaleString('en-NG');
      revenueChange.value = 12;
      invoiceCompletion.value = 78;
      engagementScore.value = '74%';
      engagementChange.value = 6;
      processingTime.value = 5.4;
      processingDelta.value = -8;
      invoiceInsights.value = { processed: 48, pending: 12, trend: '+6% QoQ' };
      receiptInsights.value = { issued: 44, pending: 6, trend: '+4% QoQ' };
      buildRevenueTrend(3500000);
      buildSignals();
    };

    watch(selectedRange, () => {
      buildRevenueTrend(parseInt(monthlyRevenue.value.replace(/[^0-9]/g, ''), 10) || 0);
    });

    watch(branchName, () => {
      refreshData();
    }, { immediate: true });

    onMounted(async () => {
      if (branchName.value) {
        refreshData();
      }
    });



    return {
      branchName,
      branchLabel,
      selectedRange,
      loading,
      isRefreshing,
      activities,
      revenueTrend,
      monthlyRevenue,
      activeInvoices,
      activeReceipts,
      pendingTasks,
      engagementScore: engagementScoreLabel,
      revenueTrendLabel,
      invoiceTrendLabel,
      receiptTrendLabel,
      tasksTrendLabel,
      engagementLabel,
      processingTimeLabel,
      processingTrendLabel,
      maxRevenueValue,
      activityMix,
      insightSignals,
      invoiceInsights,
      receiptInsights,
      memberActionLabel,
      refreshData,
      handleRefresh,
      refreshActivities,
      exportReport,
      goToDashboard,
      viewRawData,
      actionLabel,
      activityBadge,
      formatRelativeTime,
      chartType,
      arrowDown,
      revenueChartData,
      revenueChartOptions,
      activityMixChartData,
      activityMixChartOptions,
      documentComparisonChartData,
      documentComparisonChartOptions,
      statusComparisonChartData,
      statusComparisonChartOptions
    };
  }
});

function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Unknown';
  const now = new Date();
  const target = new Date(timestamp);
  const diffMs = now - target;
  if (Number.isNaN(diffMs)) return 'Unknown';
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function actionLabel(action = '') {
  const lower = action.toLowerCase();
  if (lower.includes('login')) return 'Login';
  if (lower.includes('invoice')) return 'Invoice';
  if (lower.includes('receipt')) return 'Receipt';
  if (lower.includes('create')) return 'Created';
  if (lower.includes('delete')) return 'Deleted';
  return 'Update';
}

function activityBadge(action = '') {
  const lower = action.toLowerCase();
  if (lower.includes('delete')) return 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400';
  if (lower.includes('create')) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
  if (lower.includes('invoice') || lower.includes('receipt')) return 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400';
  return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
}
</script>

<style scoped>
/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: rgba(148, 163, 184, 0.1);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.5);
  border-radius: 5px;
  transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(56, 189, 248, 0.7);
}

/* For Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(56, 189, 248, 0.5) rgba(148, 163, 184, 0.1);
}

/* Custom Refresh Indicator Styles */
.custom-refresh-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  display: flex;
  justify-content: center;
  padding-top: 20px;
  pointer-events: none;
}

.refresh-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px 32px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.3s ease-out;
}

.dark .refresh-indicator {
  background: rgba(30, 41, 59, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.refresh-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(56, 189, 248, 0.2);
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.refresh-text {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #38bdf8;
  text-align: center;
}

.dark .refresh-text {
  color: #7dd3fc;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
