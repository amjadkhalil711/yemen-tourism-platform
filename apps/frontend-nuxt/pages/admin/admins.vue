<template>
  <div class="space-y-6 md:space-y-8 pb-10">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 rounded-2xl p-6 border border-white/5 relative overflow-hidden">
      <!-- Decor -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 space-y-1.5 flex-1">
        <div class="flex items-center gap-3 text-cyan-400 mb-2">
          <i class="fas fa-user-shield text-xl animate-pulse"></i>
          <span class="text-xs font-bold uppercase tracking-wider">{{ t('manageAdminsPage.title') }}</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{{ t('manageAdminsPage.title') }}</h1>
        <p class="text-slate-400 text-sm md:text-base max-w-2xl">
          {{ t('manageAdminsPage.subtitle') }}
        </p>
      </div>

      <div class="relative z-10 w-full md:w-auto flex items-center gap-3">
        <div class="relative w-full md:w-72">
          <i class="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('manageAdminsPage.searchPlaceholder')"
            class="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl py-2.5 pr-11 pl-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm placeholder:text-slate-600"
          />
        </div>
        <button
          @click="openModal"
          class="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-l from-cyan-600 to-teal-600 text-white hover:from-cyan-500 hover:to-teal-500 hover:-translate-y-0.5 transition-all shadow-lg shadow-cyan-500/10"
        >
          <i class="fas fa-plus"></i>
          {{ t('manageAdminsPage.addAdmin') }}
        </button>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-cyan-900/10 border border-cyan-500/20 rounded-2xl p-6 flex items-center gap-5 relative overflow-hidden">
        <div class="absolute right-0 top-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div class="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-2xl shrink-0">
          <i class="fas fa-users-cog"></i>
        </div>
        <div>
          <p class="text-slate-400 text-sm font-medium mb-1">{{ locale === 'ar' ? 'إجمالي المشرفين' : 'Total Admins' }}</p>
          <p class="text-3xl font-bold text-white">{{ admins.length }}</p>
        </div>
      </div>
    </div>

    <!-- Admins Table List -->
    <div class="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
      
      <div v-if="pending && admins.length === 0" class="p-12 text-center text-slate-500">
        <i class="fas fa-circle-notch fa-spin text-3xl mb-3 text-cyan-500"></i>
        <p>{{ locale === 'ar' ? 'جاري جلب قائمة المشرفين...' : 'Loading admins...' }}</p>
      </div>

      <div v-else-if="admins.length === 0" class="p-16 text-center text-slate-500 flex flex-col items-center">
        <div class="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-600 text-3xl">
          <i class="fas fa-user-lock"></i>
        </div>
        <p class="text-lg font-medium text-slate-300">{{ t('manageAdminsPage.noAdmins') }}</p>
      </div>

      <div v-else-if="filteredAdmins.length === 0" class="p-16 text-center text-slate-500 flex flex-col items-center">
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
              <th class="py-4 px-6 font-medium text-start">{{ t('manageAdminsPage.adminName') }}</th>
              <th class="py-4 px-6 font-medium text-start">{{ t('manageAdminsPage.adminEmail') }}</th>
              <th class="py-4 px-6 font-medium text-start">{{ t('manageAdminsPage.adminRole') }}</th>
              <th class="py-4 px-6 font-medium text-start">{{ t('manageAdminsPage.date') }}</th>
              <th class="py-4 px-6 font-medium text-center">{{ t('manageAdminsPage.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-sm">
            <tr v-for="(admin, index) in filteredAdmins" :key="admin.id" class="hover:bg-white/[0.02] transition-colors group">
              <td class="py-4 px-6 text-slate-500 font-medium text-start">
                {{ index + 1 }}
              </td>
              <td class="py-4 px-6 text-start">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/10 flex items-center justify-center text-cyan-300 font-bold shrink-0">
                    {{ admin.name ? admin.name.charAt(0).toUpperCase() : '؟' }}
                  </div>
                  <div>
                    <p class="text-slate-200 font-medium group-hover:text-amber-400 transition-colors">{{ admin.name }}</p>
                    <span v-if="admin.id === currentUser?.id" class="inline-block mt-0.5 px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-white/5">
                      {{ locale === 'ar' ? 'حسابك الحالي' : 'Your Account' }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6 text-slate-400 font-mono text-sm text-start" dir="ltr">
                <a :href="'mailto:' + admin.email" class="hover:text-cyan-400 hover:underline transition-colors">
                  {{ admin.email }}
                </a>
              </td>
              <td class="py-4 px-6 text-start">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border" :class="getRoleClass(admin.role)">
                  <span class="w-1.5 h-1.5 rounded-full" :class="getRoleDotClass(admin.role)"></span>
                  {{ getRoleLabel(admin.role) }}
                </span>
              </td>
              <td class="py-4 px-6 text-slate-400 text-start">
                <div class="flex items-center gap-2">
                  <i class="far fa-calendar-alt text-slate-500"></i>
                  <span>{{ formatDate(admin.created_at) }}</span>
                </div>
              </td>
              <td class="py-4 px-6 text-center">
                <button
                  @click="confirmDelete(admin)"
                  :disabled="admin.id === currentUser?.id"
                  :title="admin.id === currentUser?.id ? '' : t('manageAdminsPage.deleteConfirm')"
                  class="flex items-center justify-center w-9 h-9 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all mx-auto disabled:opacity-30 disabled:pointer-events-none"
                >
                  <i class="fas fa-trash-alt text-xs"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Admin Modal -->
    <Transition name="modal-fade">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative" @click.stop>
          
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-white/5 bg-slate-950/40 flex items-center justify-between">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <i class="fas fa-user-plus text-cyan-400"></i>
              {{ t('manageAdminsPage.addAdmin') }}
            </h3>
            <button @click="closeModal" class="w-8 h-8 rounded-lg bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <form @submit.prevent="saveAdmin" class="p-6 space-y-4" :dir="dir">
            <!-- Name -->
            <label class="block">
              <span class="block text-sm font-medium text-slate-300 mb-1.5">{{ t('manageAdminsPage.adminName') }}</span>
              <input
                v-model="form.name"
                type="text"
                required
                :placeholder="t('manageAdminsPage.namePlaceholder')"
                class="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
              />
            </label>

            <!-- Email -->
            <label class="block">
              <span class="block text-sm font-medium text-slate-300 mb-1.5">{{ t('manageAdminsPage.adminEmail') }}</span>
              <input
                v-model="form.email"
                type="email"
                required
                :placeholder="t('manageAdminsPage.emailPlaceholder')"
                class="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
              />
            </label>

            <!-- Password -->
            <label class="block">
              <span class="block text-sm font-medium text-slate-300 mb-1.5">{{ t('manageAdminsPage.password') }}</span>
              <input
                v-model="form.password"
                type="password"
                required
                minlength="6"
                :placeholder="t('manageAdminsPage.passwordPlaceholder')"
                class="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
              />
            </label>

            <!-- Role Dropdown -->
            <label class="block">
              <span class="block text-sm font-medium text-slate-300 mb-1.5">{{ t('manageAdminsPage.adminRole') }}</span>
              <div class="relative">
                <select
                  v-model="form.role"
                  required
                  class="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm cursor-pointer"
                >
                  <option value="" disabled>{{ t('manageAdminsPage.selectRole') }}</option>
                  <option value="admin">{{ t('manageAdminsPage.roles.admin') }}</option>
                  <option value="admin_cities">{{ t('manageAdminsPage.roles.admin_cities') }}</option>
                  <option value="admin_landmarks">{{ t('manageAdminsPage.roles.admin_landmarks') }}</option>
                  <option value="admin_visitors">{{ t('manageAdminsPage.roles.admin_visitors') }}</option>
                  <option value="admin_report">{{ t('manageAdminsPage.roles.admin_report') }}</option>
                  <option value="admin_messages">{{ t('manageAdminsPage.roles.admin_messages') }}</option>
                </select>
                <i class="fas fa-chevron-down absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </label>

            <!-- Modal Footer -->
            <div class="pt-4 border-t border-white/5 flex justify-end gap-3">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all"
              >
                {{ t('manageAdminsPage.close') }}
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-4 py-2 bg-gradient-to-l from-cyan-600 to-teal-600 text-white hover:from-cyan-500 hover:to-teal-500 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              >
                <span v-if="isSubmitting"><i class="fas fa-spinner fa-spin mr-1"></i>...</span>
                <span v-else>{{ t('manageAdminsPage.save') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ApiUser } from '~/types/api';

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});

const { t, locale, dir, isRtl } = useLocale();
const api = useApi();
const authStore = useAuthStore();
const { success: notifySuccess, error: notifyError } = useToast();

useHead({
  title: computed(() => `${t('manageAdminsPage.title')} - ${t('adminLayout.controlPanel')}`),
  meta: [
    { name: 'description', content: computed(() => t('manageAdminsPage.subtitle')) }
  ]
});

// Currently logged in admin user
const currentUser = computed(() => authStore.user);

// Search and list states
const searchQuery = ref('');

// Fetch list of admins
const { data, pending, refresh: refreshAdmins } = useAsyncData<{ data: ApiUser[] }>(
  'admin-users-list',
  () => api.listAdmins(),
  {
    server: false,
    default: () => ({ data: [] })
  }
);

const admins = computed((): ApiUser[] => data.value?.data ?? []);

// Filtered list
const filteredAdmins = computed(() => {
  if (!searchQuery.value) return admins.value;
  const q = searchQuery.value.toLowerCase().trim();
  return admins.value.filter(admin => 
    admin.name.toLowerCase().includes(q) ||
    admin.email.toLowerCase().includes(q)
  );
});

// Modal state
const isModalOpen = ref(false);
const isSubmitting = ref(false);

const form = ref({
  name: '',
  email: '',
  password: '',
  role: ''
});

const openModal = () => {
  form.value = { name: '', email: '', password: '', role: '' };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

// Date Formatter
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(locale.value === 'ar' ? 'ar-YE' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

// Role Styles Helpers
const getRoleClass = (role: string | null) => {
  if (role === 'admin') {
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }
  if (role === 'admin_cities') {
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  }
  if (role === 'admin_landmarks') {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  }
  if (role === 'admin_visitors') {
    return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
  }
  if (role === 'admin_report') {
    return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  }
  if (role === 'admin_messages') {
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  }
  return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
};

const getRoleDotClass = (role: string | null) => {
  if (role === 'admin') return 'bg-amber-400';
  if (role === 'admin_cities') return 'bg-blue-400';
  if (role === 'admin_landmarks') return 'bg-emerald-400';
  if (role === 'admin_visitors') return 'bg-indigo-400';
  if (role === 'admin_report') return 'bg-purple-400';
  if (role === 'admin_messages') return 'bg-rose-400';
  return 'bg-slate-400';
};

const getRoleLabel = (role: string | null) => {
  if (!role) return '';
  const translationKey = `manageAdminsPage.roles.${role}`;
  const label = t(translationKey);
  // Fallback to raw value if translation is not found
  return label === translationKey ? role : label;
};

// Create new admin
const saveAdmin = async () => {
  isSubmitting.value = true;
  try {
    await api.createAdmin(form.value);
    notifySuccess(t('manageAdminsPage.createSuccess'));
    closeModal();
    await refreshAdmins();
  } catch (err: any) {
    console.error('Failed to create admin', err);
    notifyError(t('manageAdminsPage.createError'));
  } finally {
    isSubmitting.value = false;
  }
};

// Delete handler
const confirmDelete = async (admin: ApiUser) => {
  if (admin.id === currentUser.value?.id) {
    return;
  }
  
  if (!confirm(t('manageAdminsPage.deleteConfirm'))) return;
  
  try {
    await api.deleteAdmin(admin.id);
    notifySuccess(t('manageAdminsPage.deleteSuccess'));
    await refreshAdmins();
  } catch (err) {
    console.error('Delete admin failed', err);
    notifyError(t('manageAdminsPage.deleteError'));
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
