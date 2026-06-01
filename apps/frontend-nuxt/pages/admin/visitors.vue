<template>
  <div class="space-y-6 md:space-y-8 pb-10">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 rounded-2xl p-6 border border-white/5 relative overflow-hidden">
      <!-- Decor -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 space-y-1.5 flex-1">
        <div class="flex items-center gap-3 text-indigo-400 mb-2">
          <i class="fas fa-users text-xl"></i>
          <span class="text-xs font-bold uppercase tracking-wider">سجل الزوار</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight">زوار الخرائط</h1>
        <p class="text-slate-400 text-sm md:text-base max-w-2xl">
          أدناه ملخص للأشخاص الذين أبدوا اهتماماً، وسجلوا دخولهم للاطلاع على الإحداثيات والخرائط الدقيقة لمعالمنا السياحية.
        </p>
      </div>

      <div class="relative z-10 w-full md:w-auto">
        <div class="flex gap-2">
          <div class="relative w-full md:w-72">
            <i class="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ابحث بالاسم أو البريد..."
              class="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl py-2.5 pr-11 pl-4 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm placeholder:text-slate-600"
            />
          </div>
          <button @click="clearLog" title="تفريغ السجل" class="shrink-0 flex items-center justify-center w-11 h-11 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-colors">
             <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-6 flex items-center gap-5">
        <div class="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl shrink-0">
          <i class="fas fa-user-check"></i>
        </div>
        <div>
          <p class="text-slate-400 text-sm font-medium mb-1">إجمالي المستكشفين</p>
          <p class="text-3xl font-bold text-white">{{ visitors.length }}</p>
        </div>
      </div>
    </div>

    <!-- Visitors Table List -->
    <div class="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
      
      <div v-if="isLoading" class="p-12 text-center text-slate-500">
        <i class="fas fa-circle-notch fa-spin text-3xl mb-3 text-indigo-500"></i>
        <p>جاري جلب قائمة الزوار...</p>
      </div>

      <div v-else-if="filteredVisitors.length === 0" class="p-16 text-center text-slate-500 flex flex-col items-center">
        <div class="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-600 text-3xl">
          <i class="fas fa-ghost"></i>
        </div>
        <p class="text-lg font-medium text-slate-300">لا يوجد زوار مسجلين</p>
        <p class="text-sm mt-1">لم نتمكن من العثور على أي زوار أو نتائج توافق بحثك الحالى.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-right border-collapse">
          <thead>
            <tr class="bg-slate-950/50 text-slate-400 text-sm border-b border-white/5">
              <th class="py-4 px-6 font-medium">#</th>
              <th class="py-4 px-6 font-medium">الزائر</th>
              <th class="py-4 px-6 font-medium">البريد الإلكتروني</th>
              <th class="py-4 px-6 font-medium">تاريخ الزيارة</th>
              <th class="py-4 px-6 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-sm">
            <tr v-for="(visitor, index) in filteredVisitors" :key="index" class="hover:bg-white/[0.02] transition-colors group">
              <td class="py-4 px-6 text-slate-500 font-medium">
                {{ index + 1 }}
              </td>
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-700 border border-white/5 flex items-center justify-center text-slate-300 font-bold shrink-0">
                    {{ visitor.name ? visitor.name.charAt(0).toUpperCase() : '؟' }}
                  </div>
                  <div>
                    <p class="text-slate-200 font-medium group-hover:text-amber-400 transition-colors">{{ visitor.name }}</p>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6 text-slate-400 font-mono text-sm" dir="ltr">
                <a :href="'mailto:' + visitor.email" class="hover:text-indigo-400 hover:underline transition-colors">
                  {{ visitor.email }}
                </a>
              </td>
              <td class="py-4 px-6 text-slate-400">
                <div class="flex items-center gap-2">
                  <i class="far fa-calendar-alt text-slate-500"></i>
                  <span>{{ visitor.date }}</span>
                </div>
              </td>
              <td class="py-4 px-6">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 blur-[1px]"></span>
                  نشط
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

useHead({
  title: 'سجل زوار الخرائط - الإدارة',
  meta: [
    { name: 'description', content: 'قائمة بالمستخدمين الزائرين لخرائط المعالم السياحية.' }
  ]
});

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});

interface Visitor {
  name: string;
  email: string;
  date: string;
}

const visitors = ref<Visitor[]>([]);
const isLoading = ref(true);
const searchQuery = ref('');

onMounted(() => {
  // Load data locally
  try {
    const rawData = localStorage.getItem('pt_dummy_users');
    if (rawData) {
      const parsed = JSON.parse(rawData);
      // reverse to show newest first if appends at end
      visitors.value = Array.isArray(parsed) ? parsed.reverse() : [];
    }
  } catch (err) {
    console.error('Failed to parse pt_dummy_users', err);
  } finally {
    isLoading.value = false;
  }
});

const filteredVisitors = computed(() => {
  if (!searchQuery.value) return visitors.value;
  
  const query = searchQuery.value.toLowerCase().trim();
  return visitors.value.filter(v => 
    (v.name && v.name.toLowerCase().includes(query)) ||
    (v.email && v.email.toLowerCase().includes(query))
  );
});

const clearLog = () => {
  if (confirm("هل أنت متأكد من مسح كافة سجلات الزوار؟")) {
    visitors.value = [];
    localStorage.removeItem('pt_dummy_users');
  }
};
</script>
