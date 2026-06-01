<template>
  <div class="public-page error-page">
    <section class="brand-hero error-hero">
      <p class="brand-kicker">Platform Status</p>
      <h1 class="brand-hero-title">{{ heading }}</h1>
      <p class="brand-hero-text">{{ description }}</p>
      <p v-if="requestId" class="request-id">Request ID: {{ requestId }}</p>

      <div class="brand-hero-actions">
        <button type="button" class="brand-btn brand-btn-solid" @click="goHome">Back to Home</button>
        <NuxtLink to="/cities" class="brand-btn brand-btn-outline">Browse Cities</NuxtLink>
      </div>
    </section>

    <section class="surface-panel support-panel">
      <h2 class="surface-panel-title">Need help?</h2>
      <p class="surface-panel-copy">
        If this issue continues, include the request ID when contacting support.
      </p>
      <NuxtLink to="/contact" class="text-link">Contact Support</NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

interface ErrorPayload {
  request_id?: string;
}

const props = defineProps<{
  error: NuxtError & { data?: ErrorPayload };
}>();

const statusCode = computed(() => Number(props.error?.statusCode ?? 500));

const heading = computed(() => {
  if (statusCode.value === 404) {
    return "Page not found";
  }

  if (statusCode.value === 401) {
    return "Authentication required";
  }

  if (statusCode.value === 403) {
    return "Access denied";
  }

  if (statusCode.value === 429) {
    return "Too many requests";
  }

  if (statusCode.value >= 500) {
    return "Temporary server issue";
  }

  return "Unexpected error";
});

const fallbackDescription = computed(() => {
  if (statusCode.value === 404) {
    return "The page you requested does not exist or may have moved.";
  }

  if (statusCode.value === 429) {
    return "Please wait a moment and try again.";
  }

  if (statusCode.value >= 500) {
    return "The platform is temporarily unavailable. Please retry shortly.";
  }

  return "We could not complete this request.";
});

const description = computed(() => {
  const message = props.error?.statusMessage || props.error?.message;
  if (typeof message === "string" && message.trim() !== "") {
    return message;
  }

  return fallbackDescription.value;
});

const requestId = computed(() => {
  const value = props.error?.data?.request_id;
  return typeof value === "string" && value.trim() !== "" ? value : "";
});

const goHome = () => {
  clearError({ redirect: "/" });
};

useSeoMeta({
  title: `${statusCode.value} | Yemen Tourism`,
  description: description.value
});
</script>

<style scoped>
.error-page {
  gap: 1rem;
}

.error-hero {
  background:
    radial-gradient(circle at 12% 14%, rgba(199, 137, 47, 0.32), transparent 42%),
    linear-gradient(140deg, #0c2a43, #1a4c72 58%, #2f7da3);
}

.request-id {
  margin: 0.8rem 0 0;
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.85);
}

.support-panel {
  display: grid;
  gap: 0.6rem;
}
</style>
