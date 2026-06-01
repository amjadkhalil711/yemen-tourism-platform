<template>
  <div>
    <!-- ── Control Bar (hidden in print) ── -->
    <div class="no-print mb-8 flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold flex items-center gap-3" style="background:linear-gradient(135deg,#FFE17D,#F0C84C,#D4A827);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
          <div class="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <i class="fas fa-file-alt"></i>
          </div>
          {{ t('report.title') }}
        </h1>
        <p class="text-slate-400 text-sm mt-1 ms-13">{{ t('report.subtitle') }}</p>
      </div>
      <button
        type="button"
        :disabled="pending || isPrinting"
        class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg disabled:opacity-50"
        :class="isPrinting
          ? 'bg-slate-700 text-slate-300 cursor-wait'
          : 'bg-gradient-to-l from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 hover:-translate-y-0.5 shadow-purple-500/30'"
        @click="exportPdf"
      >
        <i class="fas" :class="isPrinting ? 'fa-spinner fa-spin' : 'fa-file-pdf'"></i>
        {{ isPrinting ? t('report.printing') : t('report.exportPdf') }}
      </button>
    </div>

    <!-- ── Loading skeleton ── -->
    <div v-if="pending" class="space-y-6">
      <div v-for="i in 5" :key="i" class="h-40 bg-slate-800/50 rounded-2xl border border-white/5 animate-pulse" />
    </div>

    <!-- ── Report Content ── -->
    <div v-else id="report-content" class="space-y-8">

      <!-- ══ Report Cover Header ══ -->
      <div class="report-card relative overflow-hidden rounded-2xl border border-white/10 p-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 print-header">
        <div class="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-amber-500/10 pointer-events-none" />
        <div class="relative z-10 flex items-start justify-between flex-wrap gap-6">
          <div class="flex items-center gap-5">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-900 shadow-xl shadow-amber-500/30 text-3xl shrink-0">
              <i class="fas fa-mosque"></i>
            </div>
            <div>
              <h2 class="text-3xl font-extrabold leading-tight" style="background:linear-gradient(135deg,#FFE17D,#F0C84C,#D4A827);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">{{ t('report.title') }}</h2>
              <p class="text-slate-400 text-sm mt-1">{{ t('report.by') }}</p>
            </div>
          </div>
          <div class="text-end">
            <p class="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-1">{{ t('report.generatedOn') }}</p>
            <p class="text-white font-bold text-lg">{{ generatedDate }}</p>
            <span class="inline-block mt-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
              {{ t('report.confidential') }}
            </span>
          </div>
        </div>
      </div>

      <!-- ══ Section 0: Executive Summary ══ -->
      <section>
        <div class="mb-4 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold">1</div>
          <div>
            <h3 class="text-lg font-bold text-white">{{ t('report.executiveSummary') }}</h3>
            <p class="text-xs text-slate-400">{{ t('report.executiveSummaryDesc') }}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="card in summaryCards"
            :key="card.id"
            class="report-card rounded-2xl p-5 border"
            :class="card.bg"
          >
            <div class="flex items-center gap-3 mb-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-lg" :class="card.iconBg">
                <i class="fas" :class="[card.icon, card.iconColor]"></i>
              </div>
            </div>
            <p class="text-2xl font-extrabold text-white">{{ card.value }}</p>
            <p class="text-xs font-medium mt-1" :class="card.iconColor">{{ card.label }}</p>
          </div>
        </div>
      </section>

      <!-- ══ Section 1: Geographic Distribution ══ -->
      <section class="page-break">
        <div class="mb-4 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">2</div>
          <div>
            <h3 class="text-lg font-bold text-white">{{ t('report.section1Title') }}</h3>
            <p class="text-xs text-slate-400">{{ t('report.section1Desc') }}</p>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <!-- Bar Chart -->
          <div class="lg:col-span-3 report-card rounded-2xl border border-white/5 bg-slate-800/30 p-4">
            <ClientOnly :fallback="t('dashboard.chartLoading')">
              <apexchart type="bar" height="320" :options="citiesChartOpts" :series="citiesChartSeries" />
            </ClientOnly>
          </div>
          <!-- Cities Table -->
          <div class="lg:col-span-2 report-card rounded-2xl border border-white/5 bg-slate-800/30 overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-white/5 bg-slate-700/40">
                  <th class="px-4 py-3 text-start text-slate-400 font-semibold text-xs uppercase">{{ t('report.rank') }}</th>
                  <th class="px-4 py-3 text-start text-slate-400 font-semibold text-xs uppercase">{{ t('report.cityName') }}</th>
                  <th class="px-4 py-3 text-end text-slate-400 font-semibold text-xs uppercase">{{ t('report.landmarksCol') }}</th>
                  <th class="px-4 py-3 text-end text-slate-400 font-semibold text-xs uppercase">{{ t('report.mapViewsCol') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(city, i) in citiesBreakdown"
                  :key="city.slug"
                  class="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td class="px-4 py-3 text-slate-500 font-mono text-xs">{{ i + 1 }}</td>
                  <td class="px-4 py-3 font-semibold text-white">
                    {{ locale === 'ar' ? city.name : (city.name_en || city.name) }}
                  </td>
                  <td class="px-4 py-3 text-end text-indigo-300 font-bold">{{ city.landmarks_count.toLocaleString() }}</td>
                  <td class="px-4 py-3 text-end text-emerald-300 font-bold">{{ city.map_views_count.toLocaleString() }}</td>
                </tr>
                <tr v-if="!citiesBreakdown.length">
                  <td colspan="4" class="px-4 py-8 text-center text-slate-500">{{ t('report.noData') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ══ Section 2: Content Categories ══ -->
      <section>
        <div class="mb-4 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">3</div>
          <div>
            <h3 class="text-lg font-bold text-white">{{ t('report.section2Title') }}</h3>
            <p class="text-xs text-slate-400">{{ t('report.section2Desc') }}</p>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <!-- Donut chart -->
          <div class="lg:col-span-2 report-card rounded-2xl border border-white/5 bg-slate-800/30 p-4 flex items-center justify-center">
            <ClientOnly :fallback="t('dashboard.chartLoading')">
              <apexchart type="donut" height="300" :options="catChartOpts" :series="catChartSeries" />
            </ClientOnly>
          </div>
          <!-- Categories Table -->
          <div class="lg:col-span-3 report-card rounded-2xl border border-white/5 bg-slate-800/30 overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-white/5 bg-slate-700/40">
                  <th class="px-4 py-3 text-start text-slate-400 font-semibold text-xs uppercase">{{ t('report.rank') }}</th>
                  <th class="px-4 py-3 text-start text-slate-400 font-semibold text-xs uppercase">{{ t('report.categoryName') }}</th>
                  <th class="px-4 py-3 text-end text-slate-400 font-semibold text-xs uppercase">{{ t('report.countCol') }}</th>
                  <th class="px-4 py-3 text-end text-slate-400 font-semibold text-xs uppercase">{{ t('report.pctCol') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(cat, i) in categoryBreakdown"
                  :key="cat.name"
                  class="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td class="px-4 py-3 text-slate-500 font-mono text-xs">{{ i + 1 }}</td>
                  <td class="px-4 py-3 font-semibold text-white">{{ cat.name }}</td>
                  <td class="px-4 py-3 text-end text-purple-300 font-bold">{{ cat.count.toLocaleString() }}</td>
                  <td class="px-4 py-3 text-end">
                    <span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300">
                      {{ categoryPct(cat.count) }}%
                    </span>
                  </td>
                </tr>
                <tr v-if="!categoryBreakdown.length">
                  <td colspan="4" class="px-4 py-8 text-center text-slate-500">{{ t('report.noData') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ══ Section 3: Landmark Status ══ -->
      <section class="page-break">
        <div class="mb-4 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">4</div>
          <div>
            <h3 class="text-lg font-bold text-white">{{ t('report.section3Title') }}</h3>
            <p class="text-xs text-slate-400">{{ t('report.section3Desc') }}</p>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Donut -->
          <div class="report-card rounded-2xl border border-white/5 bg-slate-800/30 p-4 flex items-center justify-center">
            <ClientOnly :fallback="t('dashboard.chartLoading')">
              <apexchart type="donut" height="280" :options="statusChartOpts" :series="statusSeries" />
            </ClientOnly>
          </div>
          <!-- Big numbers -->
          <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="report-card rounded-2xl p-6 border border-emerald-500/20 bg-emerald-500/10 flex flex-col justify-between">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                <i class="fas fa-check-circle text-emerald-400 text-xl"></i>
              </div>
              <div>
                <p class="text-4xl font-extrabold text-white">{{ stats.active_landmarks_count.toLocaleString() }}</p>
                <p class="text-emerald-400 font-semibold text-sm mt-1">{{ t('dashboard.chartActive') }}</p>
                <p class="text-slate-400 text-xs mt-1">{{ activeRate }}% {{ t('dashboard.chartActive').toLowerCase() }}</p>
              </div>
            </div>
            <div class="report-card rounded-2xl p-6 border border-red-500/20 bg-red-500/10 flex flex-col justify-between">
              <div class="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center mb-4">
                <i class="fas fa-times-circle text-red-400 text-xl"></i>
              </div>
              <div>
                <p class="text-4xl font-extrabold text-white">{{ inactiveCount.toLocaleString() }}</p>
                <p class="text-red-400 font-semibold text-sm mt-1">{{ t('dashboard.chartInactive') }}</p>
                <p class="text-slate-400 text-xs mt-1">{{ 100 - activeRate }}% {{ t('dashboard.chartInactive').toLowerCase() }}</p>
              </div>
            </div>
            <div class="sm:col-span-2 report-card rounded-2xl p-6 border border-white/5 bg-slate-700/30 flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-slate-600/50 flex items-center justify-center">
                <i class="fas fa-map-marked-alt text-slate-300 text-xl"></i>
              </div>
              <div>
                <p class="text-3xl font-extrabold text-white">{{ stats.landmarks_count.toLocaleString() }}</p>
                <p class="text-slate-400 text-sm mt-0.5">{{ t('dashboard.totalLandmarks') }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══ Section 4: Monthly Visitor Trends ══ -->
      <section>
        <div class="mb-4 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold">5</div>
          <div>
            <h3 class="text-lg font-bold text-white">{{ t('report.section4Title') }}</h3>
            <p class="text-xs text-slate-400">{{ t('report.section4Desc') }}</p>
          </div>
        </div>
        <div class="report-card rounded-2xl border border-white/5 bg-slate-800/30 p-4">
          <ClientOnly :fallback="t('dashboard.chartLoading')">
            <apexchart type="area" height="280" :options="monthlyChartOpts" :series="monthlySeries" />
          </ClientOnly>
        </div>
        <!-- Monthly breakdown mini-table -->
        <div class="mt-4 grid grid-cols-6 lg:grid-cols-12 gap-2">
          <div
            v-for="(views, idx) in stats.monthly_views"
            :key="idx"
            class="report-card rounded-xl p-3 border border-white/5 bg-slate-800/30 text-center"
            :class="views === peakViews && views > 0 ? 'border-indigo-500/40 bg-indigo-500/10' : ''"
          >
            <p class="text-xs text-slate-500 font-semibold mb-1">{{ monthNames[idx] }}</p>
            <p class="text-sm font-extrabold" :class="views === peakViews && views > 0 ? 'text-indigo-300' : 'text-white'">
              {{ views.toLocaleString() }}
            </p>
          </div>
        </div>
      </section>

      <!-- ══ Section 5: Key Insights ══ -->
      <section class="page-break">
        <div class="mb-4 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center text-sm font-bold">6</div>
          <div>
            <h3 class="text-lg font-bold text-white">{{ t('report.section5Title') }}</h3>
            <p class="text-xs text-slate-400">{{ t('report.section5Desc') }}</p>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="insight in insights"
            :key="insight.key"
            class="report-card rounded-2xl p-5 border flex gap-4 items-start"
            :class="insight.cardCls"
          >
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :class="insight.iconBg">
              <i class="fas" :class="[insight.icon, insight.iconCls]"></i>
            </div>
            <div class="min-w-0">
              <p class="text-xs font-semibold text-slate-400 mb-1">{{ t(`report.${insight.key}`) }}</p>
              <p class="text-lg font-extrabold text-white truncate">{{ insight.value }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ══ Report Footer ══ -->
      <div class="report-card rounded-2xl border border-white/5 bg-slate-800/30 px-8 py-5 flex items-center justify-between gap-4 flex-wrap text-sm text-slate-500">
        <div class="flex items-center gap-2">
          <i class="fas fa-mosque text-amber-500/50"></i>
          <span>{{ t('report.by') }}</span>
        </div>
        <span>{{ t('report.generatedOn') }}: {{ generatedDate }}</span>
        <span class="text-xs">{{ t('report.confidential') }}</span>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiStatsOverview, ApiStatsCityBreakdown, ApiStatsCategoryBreakdown } from '~/types/api';
import ar from '~/locales/ar';
import en from '~/locales/en';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const { t, locale } = useLocale();
const api = useApi();

// ── Types ──────────────────────────────────────────────
interface StatsOverviewResponse { data?: ApiStatsOverview; }

// ── Data ───────────────────────────────────────────────
const { data, pending } = useAsyncData<StatsOverviewResponse>(
  'report-stats-overview',
  () => api.statsOverview({ cacheTtlMs: 30_000 }),
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
        monthly_views: Array(12).fill(0),
      },
    }),
  }
);

const stats = computed((): ApiStatsOverview => (data.value as StatsOverviewResponse)?.data ?? {
  cities_count: 0, landmarks_count: 0, active_landmarks_count: 0,
  map_views_count: 0, cities_breakdown: [], category_breakdown: [], monthly_views: Array(12).fill(0),
});

const citiesBreakdown = computed((): ApiStatsCityBreakdown[] => stats.value.cities_breakdown ?? []);
const categoryBreakdown = computed((): ApiStatsCategoryBreakdown[] => stats.value.category_breakdown ?? []);
const monthNames = computed(() => locale.value === 'ar' ? ar.dashboard.months : en.dashboard.months);
const generatedDate = computed(() => new Date().toLocaleDateString(locale.value === 'ar' ? 'ar-YE' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' }));

// ── Derived stats ──────────────────────────────────────
const inactiveCount = computed(() => Math.max(0, stats.value.landmarks_count - stats.value.active_landmarks_count));
const activeRate = computed(() => stats.value.landmarks_count > 0
  ? Math.round((stats.value.active_landmarks_count / stats.value.landmarks_count) * 100) : 0);
const peakViews = computed(() => Math.max(...(stats.value.monthly_views ?? [0])));
const categoryTotal = computed(() => categoryBreakdown.value.reduce((s, c) => s + c.count, 0));
const categoryPct = (count: number) => categoryTotal.value > 0 ? ((count / categoryTotal.value) * 100).toFixed(1) : '0.0';

// ── Summary cards ──────────────────────────────────────
const summaryCards = computed(() => [
  { id: 'cities', label: t('dashboard.totalCities'), value: stats.value.cities_count.toLocaleString(), icon: 'fa-city', bg: 'border-blue-500/20 bg-blue-500/5', iconBg: 'bg-blue-500/20', iconColor: 'text-blue-400' },
  { id: 'landmarks', label: t('dashboard.totalLandmarks'), value: stats.value.landmarks_count.toLocaleString(), icon: 'fa-map-marked-alt', bg: 'border-emerald-500/20 bg-emerald-500/5', iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-400' },
  { id: 'active', label: t('dashboard.activeLandmarks'), value: stats.value.active_landmarks_count.toLocaleString(), icon: 'fa-check-circle', bg: 'border-amber-500/20 bg-amber-500/5', iconBg: 'bg-amber-500/20', iconColor: 'text-amber-400' },
  { id: 'views', label: t('dashboard.mapViews'), value: stats.value.map_views_count.toLocaleString(), icon: 'fa-map-pin', bg: 'border-purple-500/20 bg-purple-500/5', iconBg: 'bg-purple-500/20', iconColor: 'text-purple-400' },
]);

// ── Insights ───────────────────────────────────────────
const insights = computed(() => {
  const cities = citiesBreakdown.value;
  const topCity = cities[0];
  const topByViews = [...cities].sort((a, b) => b.map_views_count - a.map_views_count)[0];
  const topCat = categoryBreakdown.value[0];
  const peakIdx = stats.value.monthly_views ? stats.value.monthly_views.indexOf(peakViews.value) : -1;
  const peakName = peakIdx >= 0 ? monthNames.value[peakIdx] : '-';
  const yearlyTotal = (stats.value.monthly_views ?? []).reduce((a, b) => a + b, 0);
  const getCityName = (c: ApiStatsCityBreakdown | undefined) => !c ? '-' : (locale.value === 'ar' ? c.name : (c.name_en || c.name));
  return [
    { key: 'insightTopCity', value: getCityName(topCity), icon: 'fa-map-marker-alt', cardCls: 'border-amber-500/20 bg-amber-500/5', iconBg: 'bg-amber-500/20', iconCls: 'text-amber-400' },
    { key: 'insightTopViews', value: getCityName(topByViews), icon: 'fa-eye', cardCls: 'border-blue-500/20 bg-blue-500/5', iconBg: 'bg-blue-500/20', iconCls: 'text-blue-400' },
    { key: 'insightTopCategory', value: topCat?.name || '-', icon: 'fa-tag', cardCls: 'border-purple-500/20 bg-purple-500/5', iconBg: 'bg-purple-500/20', iconCls: 'text-purple-400' },
    { key: 'insightActiveRate', value: `${activeRate.value}%`, icon: 'fa-check-circle', cardCls: 'border-emerald-500/20 bg-emerald-500/5', iconBg: 'bg-emerald-500/20', iconCls: 'text-emerald-400' },
    { key: 'insightPeakMonth', value: peakViews.value > 0 ? peakName : '-', icon: 'fa-calendar-check', cardCls: 'border-indigo-500/20 bg-indigo-500/5', iconBg: 'bg-indigo-500/20', iconCls: 'text-indigo-400' },
    { key: 'insightTotalViews', value: yearlyTotal.toLocaleString(), icon: 'fa-chart-line', cardCls: 'border-pink-500/20 bg-pink-500/5', iconBg: 'bg-pink-500/20', iconCls: 'text-pink-400' },
  ];
});

// ── Chart options ──────────────────────────────────────
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#ec4899'];
const darkChart = { background: 'transparent', toolbar: { show: false } };
const darkGrid = { borderColor: 'rgba(255,255,255,0.06)', strokeDashArray: 4 };
const darkAxisLabel = { style: { colors: '#94a3b8' } };

const citiesChartSeries = computed(() => [
  { name: t('report.landmarksCol'), data: citiesBreakdown.value.map(c => c.landmarks_count) },
  { name: t('report.mapViewsCol'), data: citiesBreakdown.value.map(c => c.map_views_count) },
]);
const citiesChartOpts = computed(() => ({
  chart: { ...darkChart, type: 'bar' },
  plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '55%' } },
  colors: ['#6366f1', '#10b981'],
  dataLabels: { enabled: true, style: { colors: ['#fff'], fontSize: '11px' } },
  xaxis: { categories: citiesBreakdown.value.map(c => locale.value === 'ar' ? c.name : (c.name_en || c.name)), labels: darkAxisLabel, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { labels: { style: { colors: '#e2e8f0', fontSize: '12px', fontWeight: 600 } } },
  theme: { mode: 'dark' }, grid: darkGrid, legend: { labels: { colors: '#cbd5e1' } },
}));

const catChartSeries = computed(() => categoryBreakdown.value.length > 0 ? categoryBreakdown.value.map(c => c.count) : [1]);
const catChartOpts = computed(() => ({
  chart: { ...darkChart, type: 'donut' },
  labels: categoryBreakdown.value.length > 0 ? categoryBreakdown.value.map(c => c.name) : [t('report.noData')],
  colors: CHART_COLORS,
  theme: { mode: 'dark' },
  stroke: { show: true, colors: ['#1e293b'], width: 2 },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: '68%', labels: { show: true, name: { color: '#94a3b8' }, value: { color: '#f8fafc', fontSize: '22px', fontWeight: 'bold' } } } } },
  legend: { position: 'bottom', labels: { colors: '#cbd5e1' } },
}));

const statusSeries = computed(() => [stats.value.active_landmarks_count, inactiveCount.value]);
const statusChartOpts = computed(() => ({
  chart: { ...darkChart, type: 'donut' },
  labels: [t('dashboard.chartActive'), t('dashboard.chartInactive')],
  colors: ['#10b981', '#ef4444'],
  theme: { mode: 'dark' },
  stroke: { show: true, colors: ['#1e293b'], width: 2 },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: '68%', labels: { show: true, name: { color: '#94a3b8' }, value: { color: '#f8fafc', fontSize: '22px', fontWeight: 'bold' } } } } },
  legend: { position: 'bottom', labels: { colors: '#cbd5e1' } },
}));

const monthlySeries = computed(() => [{ name: t('dashboard.viewsCount'), data: stats.value.monthly_views ?? Array(12).fill(0) }]);
const monthlyChartOpts = computed(() => ({
  chart: { ...darkChart, type: 'area' },
  colors: ['#a855f7'],
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  xaxis: { categories: monthNames.value, labels: darkAxisLabel, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { labels: darkAxisLabel },
  theme: { mode: 'dark' }, grid: darkGrid, tooltip: { theme: 'dark' },
  markers: { size: 4, colors: ['#a855f7'], strokeColors: '#1e293b', strokeWidth: 2 },
}));

// ── PDF Export ─────────────────────────────────────────
const isPrinting = ref(false);

const exportPdf = async () => {
  isPrinting.value = true;
  await nextTick();

  const reportEl = document.getElementById('report-content');
  if (!reportEl) { isPrinting.value = false; return; }

  // Walk every ancestor up to <body> and unclamp overflow/height so the
  // browser's print renderer can see all content, not just the viewport slice.
  type Override = { el: HTMLElement; overflow: string; overflowY: string; height: string; maxHeight: string; minHeight: string; display: string; };
  const overrides: Override[] = [];

  let cur: HTMLElement | null = reportEl.parentElement;
  while (cur && cur.tagName !== 'BODY') {
    overrides.push({
      el: cur,
      overflow:   cur.style.overflow,
      overflowY:  cur.style.overflowY,
      height:     cur.style.height,
      maxHeight:  cur.style.maxHeight,
      minHeight:  cur.style.minHeight,
      display:    cur.style.display,
    });
    cur.style.overflow  = 'visible';
    cur.style.overflowY = 'visible';
    cur.style.height    = 'auto';
    cur.style.maxHeight = 'none';
    cur.style.minHeight = '0';
    cur.style.display   = 'block';
    cur = cur.parentElement;
  }

  // Also unclamp <body> itself
  const bodyOrig = { overflow: document.body.style.overflow, height: document.body.style.height };
  document.body.style.overflow = 'visible';
  document.body.style.height   = 'auto';

  // Small delay so the reflowed layout settles before print dialog opens
  await new Promise<void>(r => setTimeout(r, 350));

  const restore = () => {
    overrides.forEach(({ el, overflow, overflowY, height, maxHeight, minHeight, display }) => {
      el.style.overflow  = overflow;
      el.style.overflowY = overflowY;
      el.style.height    = height;
      el.style.maxHeight = maxHeight;
      el.style.minHeight = minHeight;
      el.style.display   = display;
    });
    document.body.style.overflow = bodyOrig.overflow;
    document.body.style.height   = bodyOrig.height;
    isPrinting.value = false;
    window.removeEventListener('afterprint', restore);
  };

  window.addEventListener('afterprint', restore);
  window.print();
};
</script>


<style>
/* ─────────────────────────────────────────────────────────
   PRINT STYLES  (non-scoped so they can reach admin layout)
   Dark theme is preserved — no white-background overrides.
   ───────────────────────────────────────────────────────── */

/* Force ALL backgrounds and colors to print exactly as shown on screen */
* {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
}

@media print {
  @page { size: A4 portrait; margin: 10mm 12mm; }

  /* 1. Dark background matching the dashboard ──────────────────────── */
  html, body {
    height: auto !important;
    overflow: visible !important;
    background: #0f172a !important;   /* slate-900 — same as admin layout */
    color: #f1f5f9   !important;
  }

  /* 2. Strip height/overflow from layout containers ────────────────── */
  .h-screen      { height: auto     !important; }
  .min-h-0       { min-height: 0    !important; }
  .overflow-hidden,
  .overflow-y-auto,
  .overflow-x-hidden { overflow: visible !important; }

  .flex     { display: block !important; }
  .flex-col { display: block !important; }
  .flex-1   { flex: none !important; height: auto !important; }

  main {
    overflow: visible !important;
    height: auto      !important;
    max-height: none  !important;
    padding: 0        !important;
    background: #0f172a !important;
  }

  /* 3. Hide admin chrome ──────────────────────────────────────────── */
  aside, header,
  .no-print,
  .chatbot-trigger,
  #ai-chatbot { display: none !important; }

  /* 4. Report cards — keep their existing dark Tailwind backgrounds ── */
  #report-content { display: block !important; }

  .report-card { break-inside: avoid; }

  /* 5. Page-break helpers ─────────────────────────────────────────── */
  .page-break { break-before: page !important; }
  section     { break-inside: avoid; }

  /* 6. Charts & tables ────────────────────────────────────────────── */
  .apexcharts-canvas,
  .apexcharts-svg { overflow: visible !important; max-width: 100% !important; }

  table { border-collapse: collapse !important; }
  td, th { border-bottom: 1px solid rgba(255,255,255,0.08) !important; }

  /* 7. Restore grid layout after flex→block reset ─────────────────── */
  .grid { display: grid !important; }
  .space-y-8 > * + * { margin-top: 2rem !important; }
}
</style>

