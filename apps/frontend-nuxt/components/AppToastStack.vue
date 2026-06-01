<template>
  <teleport to="body">
    <div class="toast-stack" aria-live="polite" aria-atomic="true">
      <article
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-card"
        :class="`toast-${toast.kind}`"
        :role="toast.kind === 'error' ? 'alert' : 'status'"
        :aria-live="toast.kind === 'error' ? 'assertive' : 'polite'"
      >
        <div class="toast-main">
          <p class="toast-title">{{ toast.title }}</p>
          <p class="toast-message">{{ toast.message }}</p>
        </div>
        <button type="button" class="toast-close" :aria-label="`Dismiss ${toast.title} message`" @click="removeToast(toast.id)">
          x
        </button>
      </article>
    </div>
  </teleport>
</template>

<script setup lang="ts">
const { toasts, removeToast } = useToast();
</script>

<style scoped>
.toast-stack {
  position: fixed;
  top: 1rem;
  inset-inline-end: 1rem;
  z-index: 1000;
  display: grid;
  gap: 0.55rem;
  width: min(92vw, 360px);
  pointer-events: none;
}

.toast-card {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.65rem;
  border-radius: 0.78rem;
  border: 1px solid transparent;
  padding: 0.68rem 0.72rem;
  box-shadow: 0 14px 26px rgba(10, 25, 38, 0.22);
  backdrop-filter: blur(8px);
}

.toast-main {
  display: grid;
  gap: 0.2rem;
}

.toast-title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 800;
}

.toast-message {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.45;
}

.toast-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  min-height: 2rem;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: inherit;
  font-size: 1rem;
  cursor: pointer;
  line-height: 1;
  opacity: 0.75;
}

.toast-close:hover {
  opacity: 1;
}

.toast-close:focus-visible {
  opacity: 1;
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.toast-success {
  background: rgba(18, 121, 84, 0.95);
  border-color: rgba(124, 235, 194, 0.5);
  color: #f1fff8;
}

.toast-error {
  background: rgba(142, 32, 32, 0.95);
  border-color: rgba(255, 171, 171, 0.55);
  color: #fff3f3;
}

.toast-info {
  background: rgba(18, 63, 108, 0.95);
  border-color: rgba(155, 204, 255, 0.52);
  color: #f0f8ff;
}

@media (max-width: 640px) {
  .toast-stack {
    inset-inline-end: 0.5rem;
    inset-inline-start: 0.5rem;
    width: auto;
  }
}
</style>
