<template>
  <article class="surface-panel city-card">
    <header class="card-header">
      <h3>{{ city.name }}</h3>
      <span class="status-pill" :class="{ draft: city.status === 'draft' }">{{ statusLabel }}</span>
    </header>

    <p class="description">{{ citySummary }}</p>

    <footer class="card-footer">
      <p class="meta">{{ landmarkCountLabel }}</p>
      <NuxtLink :to="`/cities/${city.slug}`" class="brand-btn brand-btn-ink city-link">View City</NuxtLink>
    </footer>
  </article>
</template>

<script setup lang="ts">
import type { ApiCity } from "~/types/api";

const props = defineProps<{
  city: ApiCity;
}>();

const citySummary = computed(() => {
  const description = props.city.description?.trim();
  if (!description) {
    return "City profile will be updated soon with detailed cultural and tourism information.";
  }

  return description.length > 180 ? `${description.slice(0, 177)}...` : description;
});

const landmarkCountLabel = computed(() => {
  const count = props.city.landmarks_count ?? 0;
  return `${count} landmark${count === 1 ? "" : "s"}`;
});

const statusLabel = computed(() => (props.city.status === "published" ? "Published" : "Draft"));
</script>

<style scoped>
.city-card {
  display: grid;
  gap: 0.85rem;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #143453;
}

.status-pill {
  border-radius: 999px;
  background: #e7f9f0;
  color: #0e7a4f;
  font-size: 0.75rem;
  padding: 0.2rem 0.55rem;
  font-weight: 700;
  white-space: nowrap;
}

.status-pill.draft {
  background: #fff4e8;
  color: #ad5b00;
}

.description {
  margin: 0;
  color: #234663;
  line-height: 1.7;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.meta {
  margin: 0;
  color: #4d6782;
  font-size: 0.9rem;
}

.city-link {
  min-height: 40px;
  padding: 0.5rem 0.92rem;
}
</style>
