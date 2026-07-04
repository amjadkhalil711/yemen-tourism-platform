<template>
  <div class="space-y-6 md:space-y-8 pb-10">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 rounded-2xl p-6 border border-white/5 relative overflow-hidden">
      <!-- Decor -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 space-y-1.5 flex-1">
        <div class="flex items-center gap-3 text-rose-400 mb-2">
          <i class="fas fa-envelope text-xl animate-pulse"></i>
          <span class="text-xs font-bold uppercase tracking-wider">{{ t('contactMessagesPage.title') }}</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{{ t('contactMessagesPage.title') }}</h1>
        <p class="text-slate-400 text-sm md:text-base max-w-2xl">
          {{ t('contactMessagesPage.subtitle') }}
        </p>
      </div>

      <div class="relative z-10 w-full md:w-auto">
        <div class="flex gap-2">
          <div class="relative w-full md:w-72">
            <i class="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('contactMessagesPage.searchPlaceholder')"
              class="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl py-2.5 pr-11 pl-4 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all text-sm placeholder:text-slate-600"
            />
          </div>
          <button @click="refreshMessages" :disabled="pending" title="تحديث" class="shrink-0 flex items-center justify-center w-11 h-11 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-colors disabled:opacity-50">
             <i class="fas fa-sync-alt" :class="{ 'fa-spin': pending }"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-rose-900/10 border border-rose-500/20 rounded-2xl p-6 flex items-center gap-5 relative overflow-hidden">
        <div class="absolute right-0 top-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div class="w-14 h-14 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 text-2xl shrink-0">
          <i class="fas fa-inbox"></i>
        </div>
        <div>
          <p class="text-slate-400 text-sm font-medium mb-1">{{ t('contactMessagesPage.totalMessages') }}</p>
          <p class="text-3xl font-bold text-white">{{ totalCount }}</p>
        </div>
      </div>
    </div>

    <!-- Messages Table List -->
    <div class="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
      
      <div v-if="pending && messages.length === 0" class="p-12 text-center text-slate-500">
        <i class="fas fa-circle-notch fa-spin text-3xl mb-3 text-rose-500"></i>
        <p>{{ locale === 'ar' ? 'جاري جلب الرسائل...' : 'Loading messages...' }}</p>
      </div>

      <div v-else-if="messages.length === 0" class="p-16 text-center text-slate-500 flex flex-col items-center">
        <div class="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-600 text-3xl">
          <i class="fas fa-envelope-open"></i>
        </div>
        <p class="text-lg font-medium text-slate-300">{{ t('contactMessagesPage.noMessages') }}</p>
      </div>

      <div v-else-if="filteredMessages.length === 0" class="p-16 text-center text-slate-500 flex flex-col items-center">
        <div class="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-600 text-3xl">
          <i class="fas fa-search"></i>
        </div>
        <p class="text-lg font-medium text-slate-300">{{ t('contactMessagesPage.noResults') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-right border-collapse" :dir="dir">
          <thead>
            <tr class="bg-slate-950/50 text-slate-400 text-sm border-b border-white/5">
              <th class="py-4 px-6 font-medium text-start">#</th>
              <th class="py-4 px-6 font-medium text-start">{{ t('contactMessagesPage.sender') }}</th>
              <th class="py-4 px-6 font-medium text-start">{{ t('contactMessagesPage.email') }}</th>
              <th class="py-4 px-6 font-medium text-start">{{ t('contactMessagesPage.subject') }}</th>
              <th class="py-4 px-6 font-medium text-start">{{ t('contactMessagesPage.date') }}</th>
              <th class="py-4 px-6 font-medium text-center">{{ t('contactMessagesPage.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-sm">
            <tr v-for="(msg, index) in filteredMessages" :key="msg.id" class="hover:bg-white/[0.02] transition-colors group">
              <td class="py-4 px-6 text-slate-500 font-medium text-start">
                {{ (page - 1) * perPage + index + 1 }}
              </td>
              <td class="py-4 px-6 text-start">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500/20 to-orange-500/10 border border-rose-500/10 flex items-center justify-center text-rose-300 font-bold shrink-0">
                    {{ msg.name ? msg.name.charAt(0).toUpperCase() : '؟' }}
                  </div>
                  <div>
                    <p class="text-slate-200 font-medium group-hover:text-amber-400 transition-colors">{{ msg.name }}</p>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6 text-slate-400 font-mono text-sm text-start" dir="ltr">
                <a :href="'mailto:' + msg.email" class="hover:text-rose-400 hover:underline transition-colors">
                  {{ msg.email }}
                </a>
              </td>
              <td class="py-4 px-6 text-slate-300 font-medium text-start">
                {{ msg.subject }}
              </td>
              <td class="py-4 px-6 text-slate-400 text-start">
                <div class="flex items-center gap-2">
                  <i class="far fa-calendar-alt text-slate-500"></i>
                  <span>{{ formatDate(msg.created_at) }}</span>
                </div>
              </td>
              <td class="py-4 px-6 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="viewDetails(msg)"
                    :title="t('contactMessagesPage.viewDetails')"
                    class="flex items-center justify-center w-9 h-9 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                  >
                    <i class="fas fa-eye text-xs"></i>
                  </button>
                  <button
                    @click="confirmDelete(msg)"
                    :title="t('contactMessagesPage.deleteMessage')"
                    class="flex items-center justify-center w-9 h-9 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                  >
                    <i class="fas fa-trash-alt text-xs"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="totalPages > 1" class="no-print border-t border-white/5 px-6 py-4 flex items-center justify-between gap-4 flex-wrap bg-slate-950/20">
        <p class="text-xs text-slate-400">
          {{ locale === 'ar' 
            ? `عرض الصفحة ${page} من أصل ${totalPages} (إجمالي ${totalCount} رسالة)` 
            : `Showing page ${page} of ${totalPages} (${totalCount} messages total)` 
          }}
        </p>
        <div class="flex items-center gap-2">
          <button
            :disabled="page === 1"
            @click="page--"
            class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <i class="fas" :class="isRtl ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
            {{ locale === 'ar' ? ' السابق' : ' Prev' }}
          </button>
          
          <button
            v-for="p in totalPages"
            :key="p"
            @click="page = p"
            class="w-8 h-8 rounded-lg text-xs font-bold transition-all"
            :class="page === p 
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'"
          >
            {{ p }}
          </button>

          <button
            :disabled="page === totalPages"
            @click="page++"
            class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            {{ locale === 'ar' ? 'التالي ' : 'Next ' }}
            <i class="fas" :class="isRtl ? 'fa-chevron-left' : 'fa-chevron-right'"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Message Details Modal -->
    <Transition name="modal-fade">
      <div v-if="isModalOpen && selectedMessage" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative" @click.stop>
          
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-white/5 bg-slate-950/40 flex items-center justify-between">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <i class="fas fa-envelope-open text-rose-400"></i>
              {{ t('contactMessagesPage.detailsTitle') }}
            </h3>
            <button @click="closeModal" class="w-8 h-8 rounded-lg bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto" :dir="dir">
            <!-- Metadata Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-slate-950/40 border border-white/5 rounded-xl p-4">
                <p class="text-xs text-slate-500 mb-1">{{ t('contactMessagesPage.sender') }}</p>
                <p class="text-sm font-semibold text-white">{{ selectedMessage.name }}</p>
              </div>
              <div class="bg-slate-950/40 border border-white/5 rounded-xl p-4">
                <p class="text-xs text-slate-500 mb-1">{{ t('contactMessagesPage.email') }}</p>
                <a :href="'mailto:' + selectedMessage.email" class="text-sm font-semibold text-rose-400 hover:underline break-all" dir="ltr">
                  {{ selectedMessage.email }}
                </a>
              </div>
              <div class="bg-slate-950/40 border border-white/5 rounded-xl p-4">
                <p class="text-xs text-slate-500 mb-1">{{ t('contactMessagesPage.phone') }}</p>
                <p class="text-sm font-semibold text-white" dir="ltr">
                  {{ selectedMessage.phone || t('contactMessagesPage.noPhone') }}
                </p>
              </div>
              <div class="bg-slate-950/40 border border-white/5 rounded-xl p-4">
                <p class="text-xs text-slate-500 mb-1">{{ t('contactMessagesPage.date') }}</p>
                <p class="text-sm font-semibold text-white">
                  {{ formatDate(selectedMessage.created_at) }}
                </p>
              </div>
            </div>

            <!-- Subject -->
            <div class="bg-slate-950/20 border border-white/5 rounded-xl p-4">
              <p class="text-xs text-slate-500 mb-1">{{ t('contactMessagesPage.subject') }}</p>
              <p class="text-sm font-bold text-slate-200">{{ selectedMessage.subject }}</p>
            </div>

            <!-- Message Content -->
            <div class="bg-slate-950/20 border border-white/5 rounded-xl p-4 space-y-2">
              <p class="text-xs text-slate-500 border-b border-white/5 pb-2">{{ t('contactMessagesPage.message') }}</p>
              <p class="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{{ selectedMessage.message }}</p>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 border-t border-white/5 bg-slate-950/40 flex justify-end gap-3">
            <button
              @click="confirmDelete(selectedMessage)"
              class="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2"
            >
              <i class="fas fa-trash-alt"></i>
              {{ t('contactMessagesPage.deleteMessage') }}
            </button>
            <button
              @click="closeModal"
              class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all"
            >
              {{ t('contactMessagesPage.close') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ApiContactMessage, ApiPaginated } from '~/types/api';

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});

const { t, locale, dir, isRtl } = useLocale();
const api = useApi();
const { success: notifySuccess, error: notifyError } = useToast();

useHead({
  title: computed(() => `${t('contactMessagesPage.title')} - ${t('adminLayout.controlPanel')}`),
  meta: [
    { name: 'description', content: computed(() => t('contactMessagesPage.subtitle')) }
  ]
});

// Paging and query states
const page = ref(1);
const perPage = 15;
const searchQuery = ref('');

// Fetch list of messages
const { data, pending, refresh: refreshMessages } = useAsyncData<ApiPaginated<ApiContactMessage>>(
  () => `admin-contact-messages-list-${page.value}`,
  () => api.listContactMessages({
    page: page.value,
    per_page: perPage
  }),
  {
    server: false,
    watch: [page],
    default: () => ({ data: [], current_page: 1, last_page: 1, total: 0 })
  }
);

const messages = computed((): ApiContactMessage[] => data.value?.data ?? []);
const totalCount = computed(() => data.value?.total ?? 0);
const totalPages = computed(() => data.value?.last_page ?? 1);

// Client-side quick filter to supplement backend paging search
const filteredMessages = computed(() => {
  if (!searchQuery.value) return messages.value;
  const q = searchQuery.value.toLowerCase().trim();
  return messages.value.filter(msg => 
    msg.name.toLowerCase().includes(q) ||
    msg.email.toLowerCase().includes(q) ||
    msg.subject.toLowerCase().includes(q) ||
    msg.message.toLowerCase().includes(q)
  );
});

// Modal state
const isModalOpen = ref(false);
const selectedMessage = ref<ApiContactMessage | null>(null);

const viewDetails = (msg: ApiContactMessage) => {
  selectedMessage.value = msg;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedMessage.value = null;
};

// Date Formatter
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(locale.value === 'ar' ? 'ar-YE' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

// Delete handler
const confirmDelete = async (msg: ApiContactMessage) => {
  if (!confirm(t('contactMessagesPage.deleteConfirm'))) return;
  
  try {
    await api.deleteContactMessage(msg.id);
    notifySuccess(t('contactMessagesPage.deleteSuccess'));
    
    // Close modal if open on the deleted message
    if (selectedMessage.value?.id === msg.id) {
      closeModal();
    }
    
    // Refresh lists
    await refreshMessages();
  } catch (err) {
    console.error('Delete message failed', err);
    notifyError(t('contactMessagesPage.deleteError'));
  }
};
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-active > div, .modal-fade-leave-active > div {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from > div {
  transform: scale(0.95);
  opacity: 0;
}
.modal-fade-leave-to > div {
  transform: scale(0.95);
  opacity: 0;
}
</style>
