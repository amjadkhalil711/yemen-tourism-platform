<template>
  <section class="surface-panel public-state-panel" :class="[`tone-${tone}`]">
    <component :is="titleTagName" class="public-state-title">{{ title }}</component>
    <p class="public-state-description">{{ description }}</p>
    <div v-if="$slots.actions" class="public-state-actions">
      <slot name="actions" />
    </div>
  </section>
</template>

<script setup lang="ts">
type StateTone = "neutral" | "error";
type TitleTag = "h1" | "h2" | "h3";

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    tone?: StateTone;
    titleTag?: TitleTag;
  }>(),
  {
    tone: "neutral",
    titleTag: "h2"
  }
);

const titleTagName = computed(() => props.titleTag);
</script>

<style scoped>
.public-state-panel {
  display: grid;
  gap: 0.55rem;
}

.public-state-title {
  margin: 0;
  color: var(--brand-ink);
}

.public-state-description {
  margin: 0;
  color: var(--ink-muted);
  line-height: 1.65;
}

.public-state-actions {
  margin-top: 0.2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-items: center;
}

.tone-error {
  border-color: rgba(179, 42, 42, 0.2);
}
</style>
