<template>
  <div class="space-y-3 my-4">
    <div v-if="statusMessage" :id="statusId" class="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-sm" role="status" aria-live="polite">
      <i class="fas fa-check-circle mt-0.5 text-lg"></i>
      <div class="flex-1">
        <p class="font-bold mb-0.5">إشعار نجاح</p>
        <p class="text-sm font-medium">{{ statusMessage }}</p>
      </div>
    </div>
    <div v-if="errorMessage" :id="errorId" class="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 shadow-sm" role="alert" aria-live="assertive">
      <i class="fas fa-exclamation-circle mt-0.5 text-lg"></i>
      <div class="flex-1">
        <p class="font-bold mb-0.5">تنبيه بالخطأ</p>
        <p class="text-sm font-medium">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  statusMessage: string;
  errorMessage: string;
  statusId?: string;
  errorId?: string;
}

withDefaults(defineProps<Props>(), {
  statusId: "admin-status-message",
  errorId: "admin-error-message"
});
</script>
