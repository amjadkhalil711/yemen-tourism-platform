<template>
  <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-8 md:p-10 mb-8 shadow-2xl">
    <!-- Decorative background elements -->
    <div class="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
    
    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="max-w-2xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400 text-xs font-semibold tracking-wide uppercase mb-4">
          <i class="fas fa-sparkles"></i> {{ kicker }}
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">{{ title }}</h1>
        <p class="text-slate-400 text-base leading-relaxed max-w-xl">{{ description }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-4 shrink-0 mt-4 md:mt-0">
        <slot />
        <a v-if="legacyHref" :href="legacyHref" class="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all hover:-translate-y-0.5 shadow-lg shadow-black/20 focus:outline-none focus:ring-2 focus:ring-amber-500/50">
          <i class="fas fa-external-link-alt text-xs"></i> {{ legacyLabel }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  kicker: string;
  title: string;
  description: string;
  legacyHref?: string;
  legacyLabel?: string;
}

withDefaults(defineProps<Props>(), {
  legacyHref: "",
  legacyLabel: "عرض الواجهة السابقة"
});
</script>
