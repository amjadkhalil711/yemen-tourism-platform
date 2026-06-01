<template>
  <div>
    <!-- Yemen Interactive Heatmap Hero -->
    <div class="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-8 mt-2 group">
      <div id="yemen-heatmap" class="absolute inset-0 w-full h-full z-0 pointer-events-auto"></div>
      
      <!-- Overlay Text on Map -->
      <div class="absolute top-6 right-6 z-10 pointer-events-none">
        <div class="bg-slate-900/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-lg">
          <h2 class="text-2xl font-bold mb-1 flex items-center gap-2" style="background:linear-gradient(135deg,#FFE17D,#F0C84C,#D4A827);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
            <i class="fas fa-fire text-amber-500 animate-pulse"></i>
            {{ t('dashboard.heatmapTitle') }}
          </h2>
          <p class="text-sm" style="color:#F6DFA0;">{{ t('dashboard.heatmapDesc') }}</p>
        </div>
      </div>
      
      <!-- Overlay Controls -->
      <div class="absolute bottom-6 right-6 z-10">
        <button type="button" class="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-indigo-600/90 backdrop-blur-sm border border-indigo-500/50 rounded-xl hover:bg-indigo-500 hover:-translate-y-0.5 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]" :disabled="pending || isRefreshing" @click="refreshMetrics()">
            <span v-if="pending || isRefreshing"><i class="fas fa-circle-notch fa-spin"></i> {{ t('dashboard.refreshing') }}</span>
            <span v-else><i class="fas fa-sync-alt"></i> {{ t('dashboard.liveRefresh') }}</span>
        </button>
      </div>
    </div>

    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-white mb-1">{{ t('dashboard.liveMetrics') }}</h2>
        <p class="text-slate-400 text-sm">{{ statsSummary }}</p>
      </div>
    </div>

    <section v-if="pending && !hasLoadedSuccessfully" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <article v-for="item in 4" :key="item" class="h-32 bg-slate-800/50 rounded-2xl border border-white/5 animate-pulse" aria-hidden="true" />
    </section>

    <AdminStatePanel
      v-else-if="error && !hasLoadedSuccessfully"
      :title="t('dashboard.loadFailed')"
      :description="t('dashboard.loadFailedDesc')"
      tone="error"
      :panel="true"
    >
      <template #actions>
        <button type="button" class="px-5 py-2.5 bg-red-500/20 text-red-500 font-medium rounded-xl hover:bg-red-500/30 transition-colors" @click="refreshMetrics()">{{ t('tryAgain') }}</button>
      </template>
    </AdminStatePanel>

    <section v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <article v-for="card in cards" :key="card.id" class="group relative overflow-hidden rounded-2xl bg-slate-800/40 backdrop-blur-md border border-white/5 p-6 hover:bg-slate-800/80 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1">
        <!-- Background Icon glow -->
        <div class="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 transform group-hover:scale-110 pointer-events-none">
           <i class="fas text-9xl mt-2" :class="[card.icon, card.outline]"></i>
        </div>

        <div class="relative z-10 flex flex-col h-full justify-between">
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/5" :class="[card.bg, card.outline]">
              <i class="fas" :class="card.icon"></i>
            </div>
          </div>
          <div>
            <p class="text-3xl font-extrabold text-white mb-1">{{ card.value }}</p>
            <p class="text-sm font-medium text-slate-400">{{ card.label }}</p>
          </div>
        </div>
      </article>
    </section>

    <!-- Professional Statistics Charts Section -->
    <section v-if="!pending && hasLoadedSuccessfully" class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Left Column: Donut Charts -->
      <div class="flex flex-col gap-6">
        <div class="bg-slate-800/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:bg-slate-800/60 transition-colors">
          <div class="absolute -left-6 -top-6 text-slate-700/30 group-hover:text-amber-500/10 transition-colors pointer-events-none transform -rotate-12 translate-x-2">
             <i class="fas fa-chart-pie text-9xl"></i>
          </div>
          <h3 class="text-white text-lg font-bold mb-4 flex justify-between items-center relative z-10">
            <span>{{ t('dashboard.categoryRatio') }}</span>
            <div class="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <i class="fas fa-layer-group"></i>
            </div>
          </h3>
          <ClientOnly :fallback="t('dashboard.chartLoading')">
            <apexchart type="donut" height="280" :options="categoryChartOptions" :series="categoryChartSeries"></apexchart>
          </ClientOnly>
        </div>

        <div class="bg-slate-800/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:bg-slate-800/60 transition-colors">
          <div class="absolute -left-6 -top-6 text-slate-700/30 group-hover:text-emerald-500/10 transition-colors pointer-events-none transform -rotate-12 translate-x-2">
             <i class="fas fa-heartbeat text-9xl"></i>
          </div>
          <h3 class="text-white text-lg font-bold mb-4 flex justify-between items-center relative z-10">
            <span>{{ t('dashboard.activityStatus') }}</span>
            <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <i class="fas fa-power-off"></i>
            </div>
          </h3>
          <ClientOnly :fallback="t('dashboard.chartLoading')">
            <apexchart type="donut" height="280" :options="statusChartOptions" :series="statusChartSeries"></apexchart>
          </ClientOnly>
        </div>
      </div>

      <!-- Center & Right: Bar Chart + Area Chart -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        
        <div class="bg-slate-800/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg flex-1 relative overflow-hidden group hover:bg-slate-800/60 transition-colors">
          <h3 class="text-white text-lg font-bold mb-4 flex justify-between items-center relative z-10">
            <span>{{ t('dashboard.topCities') }}</span>
            <div class="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <i class="fas fa-city"></i>
            </div>
          </h3>
          <ClientOnly :fallback="t('dashboard.chartLoading')">
            <div class="w-full relative z-10" style="min-height: 350px;">
                <apexchart type="bar" height="350" :options="citiesBarChartOptions" :series="citiesBarChartSeries"></apexchart>
            </div>
          </ClientOnly>
        </div>

        <div class="bg-slate-800/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:bg-slate-800/60 transition-colors">
          <h3 class="text-white text-lg font-bold mb-4 flex justify-between items-center relative z-10">
            <span>{{ t('dashboard.viewsCurve') }}</span>
            <div class="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <i class="fas fa-chart-area"></i>
            </div>
          </h3>
          <ClientOnly :fallback="t('dashboard.chartLoading')">
            <div class="w-full relative z-10" style="min-height: 250px;">
                <apexchart type="area" height="250" :options="growthAreaChartOptions" :series="growthAreaChartSeries"></apexchart>
            </div>
          </ClientOnly>
        </div>

      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { ApiStatsOverview, ApiStatsCityBreakdown } from "~/types/api";
import ar from '~/locales/ar';
import en from '~/locales/en';

interface StatsOverviewResponse {
  data?: ApiStatsOverview;
}

definePageMeta({
  layout: "admin",
  middleware: "admin"
});

useSeoMeta({
  title: "Admin Dashboard | Yemen Tourism",
  description: "Administrative analytics dashboard for Yemen Tourism platform."
});

// إدراج مستلزمات الخريطة التفاعلية Leaflet بدون الحاجة لأي أوامر تثبيت npm
useHead({
  link: [
    { rel: 'stylesheet', href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css' }
  ],
  script: [
    { src: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', defer: true }
  ]
});

const { t, locale } = useLocale();
const api = useApi();
const { runRefreshWithFeedback } = useRefreshFeedback();
const isRefreshing = ref(false);
const hasLoadedSuccessfully = ref(false);
const dashboardStatsRequest = {
  cacheTtlMs: 15_000
} as const;

// ======= تهيئة وإعداد الخريطة الحرارية المباشرة ==========
const HEATMAP_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#ec4899', '#a3e635', '#14b8a6'];
let heatmapMapInstance: any = null;
const heatmapCircles: any[] = [];

const drawHeatmapCities = () => {
  // @ts-ignore
  if (!heatmapMapInstance || !window.L) return;
  heatmapCircles.forEach(c => c.remove());
  heatmapCircles.length = 0;

  const cities: ApiStatsCityBreakdown[] = (data.value as StatsOverviewResponse | null)?.data?.cities_breakdown ?? [];
  cities.forEach((city, i) => {
    if (city.avg_lat === null || city.avg_lng === null) return;
    const weight = city.map_views_count + city.landmarks_count * 5;
    const radius = Math.max(12, Math.min(weight / 8, 40));
    const color = HEATMAP_COLORS[i % HEATMAP_COLORS.length];
    const displayName = locale.value === 'ar' ? city.name : (city.name_en || city.name);
    // @ts-ignore
    const circle = window.L.circleMarker([city.avg_lat, city.avg_lng], {
      radius,
      fillColor: color,
      color,
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5,
      className: 'pulse-marker'
    }).bindTooltip(`
      <div dir="rtl" style="text-align: right; font-family: 'Tajawal', sans-serif;">
        <b style="color: ${color}; font-size: 15px;">${displayName}</b><br>
        <span style="color: #94a3b8; font-size: 13px;">${t('dashboard.landmarksCount')}: ${city.landmarks_count}</span><br>
        <span style="color: #94a3b8; font-size: 13px;">${t('dashboard.mapViews')}: ${city.map_views_count}</span>
      </div>
    `, { direction: 'top', className: 'custom-tooltip' });
    circle.addTo(heatmapMapInstance);
    heatmapCircles.push(circle);
  });
};

onMounted(() => {
  const initMap = () => {
    // @ts-ignore
    if (!window.L) {
      setTimeout(initMap, 200);
      return;
    }
    // @ts-ignore
    heatmapMapInstance = window.L.map('yemen-heatmap', {
        zoomControl: true,
        attributionControl: false
    }).setView([15.5527, 48.5164], 6);

    // Dark professional theme for Dashboard Maps 
    // @ts-ignore
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB'
    }).addTo(heatmapMapInstance);

    drawHeatmapCities();
  };
  
  // Wait a little bit for scripts to load fully 
  setTimeout(initMap, 400);
});

// ===================================

const { data, pending, error, refresh } = useAsyncData<StatsOverviewResponse>(
  "admin-stats-overview",
  () => api.statsOverview(dashboardStatsRequest),
  {
    server: false,
    default: () => ({
      data: {
        cities_count: 0,
        landmarks_count: 0,
        active_landmarks_count: 0,
        map_views_count: 0,
        cities_breakdown: [],
        category_breakdown: [],
        monthly_views: Array(12).fill(0)
      }
    })
  }
);

watch(data, () => {
  drawHeatmapCities();
});

watch(
  [pending, error],
  ([isPending, currentError]) => {
    if (!isPending && !currentError) {
      hasLoadedSuccessfully.value = true;
    }
  },
  { immediate: true }
);

const refreshMetrics = async () => {
  if (isRefreshing.value) {
    return;
  }

  isRefreshing.value = true;

  try {
    await runRefreshWithFeedback(refresh, {
      pendingError: error,
      fallback: t('dashboard.refreshFailed'),
      successMessage: t('dashboard.refreshSuccess'),
      rateLimitMessage: t('dashboard.refreshRateLimit')
    });
  } finally {
    isRefreshing.value = false;
  }
};

const cards = computed(() => {
  const stats = data.value?.data ?? {
    cities_count: 0,
    landmarks_count: 0,
    active_landmarks_count: 0,
    map_views_count: 0
  };

  return [
    { id: "cities", label: t('dashboard.totalCities'), value: stats.cities_count.toLocaleString(), icon: "fa-city", outline: "text-blue-400", bg: "bg-blue-500/10" },
    { id: "landmarks", label: t('dashboard.totalLandmarks'), value: stats.landmarks_count.toLocaleString(), icon: "fa-map-marked-alt", outline: "text-amber-400", bg: "bg-amber-500/10" },
    { id: "active-landmarks", label: t('dashboard.activeLandmarks'), value: stats.active_landmarks_count.toLocaleString(), icon: "fa-check-circle", outline: "text-emerald-400", bg: "bg-emerald-500/10" },
    { id: "map-views", label: t('dashboard.mapViews'), value: stats.map_views_count.toLocaleString(), icon: "fa-map-pin", outline: "text-purple-400", bg: "bg-purple-500/10" }
  ];
});

const statsSummary = computed(() => {
  return t('dashboard.metricsSummary');
});

// === Professional Charts Configuration ===

// 1. Donut Chart - Categories (real data from category_breakdown)
const categoryChartSeries = computed(() => {
  const breakdown = data.value?.data?.category_breakdown ?? [];
  return breakdown.length > 0 ? breakdown.map(c => c.count) : [1];
});
const categoryChartOptions = computed(() => ({
  chart: { type: 'donut', background: 'transparent' },
  labels: (data.value?.data?.category_breakdown ?? []).length > 0
    ? (data.value?.data?.category_breakdown ?? []).map(c => c.name)
    : [t('dashboard.chartHistorical')],
  colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#ec4899'],
  theme: { mode: 'dark' },
  stroke: { show: true, colors: ['#1e293b'], width: 2 },
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          name: { color: '#94a3b8' },
          value: { color: '#f8fafc', fontSize: '24px', fontWeight: 'bold' }
        }
      }
    }
  },
  legend: { position: 'bottom', labels: { colors: '#cbd5e1' } }
}));

// 2. Donut Chart - Status (Active vs Inactive) — real data, no fake fallback
const statusChartSeries = computed(() => {
    const total = data.value?.data?.landmarks_count ?? 0;
    const active = data.value?.data?.active_landmarks_count ?? 0;
    const inactive = Math.max(0, total - active);
    return [active, inactive];
});

const statusChartOptions = ref({
  chart: { type: 'donut', background: 'transparent' },
  labels: [t('dashboard.chartActive'), t('dashboard.chartInactive')],
  colors: ['#10b981', '#ef4444'],
  theme: { mode: 'dark' },
  stroke: { show: true, colors: ['#1e293b'], width: 2 },
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          name: { color: '#94a3b8' },
          value: { color: '#f8fafc', fontSize: '24px', fontWeight: 'bold' }
        }
      }
    }
  },
  legend: { position: 'bottom', labels: { colors: '#cbd5e1' } }
});

// 3. Bar Chart - Top Cities (real data from cities_breakdown)
const citiesBarChartSeries = computed(() => [{
  name: t('dashboard.landmarksCount'),
  data: (data.value?.data?.cities_breakdown ?? []).map(c => c.landmarks_count)
}, {
  name: t('dashboard.mapViews'),
  data: (data.value?.data?.cities_breakdown ?? []).map(c => c.map_views_count)
}]);
const citiesBarChartOptions = computed(() => ({
  chart: { type: 'bar', background: 'transparent', toolbar: { show: false } },
  plotOptions: {
    bar: { horizontal: true, borderRadius: 4, barHeight: '50%' }
  },
  colors: ['#6366f1', '#10b981'],
  dataLabels: { enabled: true, style: { colors: ['#fff'] } },
  xaxis: {
    categories: (data.value?.data?.cities_breakdown ?? []).map(c =>
      locale.value === 'ar' ? c.name : (c.name_en || c.name)
    ),
    labels: { style: { colors: '#94a3b8' } },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: { style: { colors: '#e2e8f0', fontSize: '13px', fontWeight: 600 } }
  },
  theme: { mode: 'dark' },
  grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
  legend: { labels: { colors: '#cbd5e1' } }
}));

// 4. Area Chart - Monthly Views (real data from monthly_views)
const growthAreaChartSeries = computed(() => [{
  name: t('dashboard.viewsCount'),
  data: data.value?.data?.monthly_views ?? Array(12).fill(0)
}]);
const growthAreaChartOptions = computed(() => ({
  chart: { type: 'area', background: 'transparent', toolbar: { show: false } },
  colors: ['#a855f7'],
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  xaxis: {
    categories: locale.value === 'ar' ? ar.dashboard.months : en.dashboard.months,
    labels: { style: { colors: '#94a3b8' } },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: { style: { colors: '#94a3b8' } }
  },
  theme: { mode: 'dark' },
  grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
  tooltip: { theme: 'dark' }
}));

</script>

<style>
.pulse-marker {
  animation: pulse-glow 2s infinite alternate;
  filter: drop-shadow(0 0 8px rgba(255,255,255,0.4));
}

@keyframes pulse-glow {
  0% { transform: scale(0.95); opacity: 0.8; }
  100% { transform: scale(1.1); opacity: 1; stroke-width: 4px; }
}

/* Custom minimal tooltip for the dark theme map */
.custom-tooltip {
  background: rgba(15, 23, 42, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(8px);
  border-radius: 8px !important;
  color: white !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
}
.custom-tooltip::before {
  border-top-color: rgba(15, 23, 42, 0.9) !important;
}
.leaflet-container {
  background: #0f172a !important; /* Dark Slate to match dashboard */
}
</style>
