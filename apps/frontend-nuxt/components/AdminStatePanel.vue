<template>
  <section class="flex flex-col items-center justify-center p-8 text-center rounded-3xl border backdrop-blur-md transition-all" :class="[toneWrapperClass, { 'bg-slate-800/40 shadow-2xl': panel, 'bg-slate-800/20 shadow-inner': !panel }]">
    <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4 border shadow-sm" :class="toneIconBgClass">
       <i class="fas text-2xl" :class="toneIconClass"></i>
    </div>
    <component :is="titleTagName" class="text-xl font-extrabold text-white mb-2 tracking-tight">{{ title }}</component>
    <p class="text-slate-400 font-medium max-w-sm">{{ description }}</p>
    <div v-if="$slots.actions" class="mt-6 flex flex-wrap gap-3 justify-center">
      <slot name="actions" />
    </div>
  </section>
</template>

<script setup lang="ts">
type StateTone = "neutral" | "error" | "success" | "warning";
type TitleTag = "h2" | "h3";

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    tone?: StateTone;
    titleTag?: TitleTag;
    panel?: boolean;
  }>(),
  {
    tone: "neutral",
    titleTag: "h2",
    panel: false
  }
);

const titleTagName = computed(() => props.titleTag);

const toneWrapperClass = computed(() => {
  switch (props.tone) {
    case 'error': return 'border-red-500/20';
    case 'success': return 'border-emerald-500/20';
    case 'warning': return 'border-amber-500/20';
    default: return 'border-white/5';
  }
});

const toneIconBgClass = computed(() => {
  switch (props.tone) {
    case 'error': return 'bg-red-500/10 border-red-500/20 text-red-500';
    case 'success': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
    case 'warning': return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
    default: return 'bg-white/5 border-white/10 text-slate-400';
  }
});

const toneIconClass = computed(() => {
  switch (props.tone) {
    case 'error': return 'fa-exclamation-triangle';
    case 'success': return 'fa-check-circle';
    case 'warning': return 'fa-engine-warning'; // or similar
    default: return 'fa-inbox'; // generic empty state
  }
});
</script>
