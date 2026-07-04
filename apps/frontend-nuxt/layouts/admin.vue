<template>
  <div class="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" :dir="dir">
    <a href="#admin-main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-[999] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-amber-400 focus:text-slate-900 focus:rounded-xl focus:font-bold">{{ t('adminLayout.skipToContent') }}</a>

    <!-- Desktop Sidebar -->
    <aside class="hidden lg:flex lg:flex-col w-72 bg-slate-900 border-white/5 relative overflow-hidden shrink-0" :class="isRtl ? 'border-l' : 'border-r'">
      <!-- Decorative blurs -->
      <div class="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Brand / Logo -->
      <div class="relative z-10 px-6 py-6 border-b border-white/5">
        <NuxtLink to="/admin/dashboard" class="flex items-center gap-3 group" @click="closeMenu">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-shadow">
            <i class="fas fa-mosque text-xl"></i>
          </div>
          <div>
            <p class="text-white font-extrabold text-lg tracking-tight leading-none">{{ t('adminLayout.yemenTourism') }}</p>
            <p class="text-slate-500 text-xs font-medium mt-0.5">{{ t('adminLayout.controlPanel') }}</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Navigation -->
      <nav class="relative z-10 flex-1 px-4 py-6 space-y-1.5 overflow-y-auto" aria-label="Admin navigation">
        <p class="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{{ t('adminLayout.mainMenu') }}</p>
        <NuxtLink
          v-for="item in localizedNavItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group"
          :class="isActive(item.path)
            ? 'bg-gradient-to-l from-amber-500/20 to-amber-500/5 text-amber-400 shadow-inner border border-amber-500/10'
            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'"
          :aria-current="isActive(item.path) ? 'page' : undefined"
          @click="closeMenu"
        >
          <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" :class="isActive(item.path) ? item.activeBg : 'bg-white/5 group-hover:bg-white/10'">
            <i class="fas" :class="item.icon"></i>
          </div>
          <span>{{ item.label }}</span>
          <div v-if="isActive(item.path)" class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" :class="isRtl ? 'mr-auto' : 'ml-auto'"></div>
        </NuxtLink>
      </nav>

      <!-- Footer / Logout -->
      <div class="relative z-10 p-4 border-t border-white/5">
        <!-- Language Toggle -->
        <button type="button" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-transparent mb-2" @click="toggleLocale">
          <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><i class="fas fa-globe"></i></div>
          <span>{{ t('switchLang') }}</span>
        </button>
        <NuxtLink to="/" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-transparent mb-2">
          <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><i class="fas fa-globe"></i></div>
          <span>{{ t('adminLayout.mainWebsite') }}</span>
        </NuxtLink>
        <button
          type="button"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-white hover:bg-red-500/10 transition-all border border-transparent disabled:opacity-50"
          :disabled="isLoggingOut"
          @click="logout"
        >
          <div class="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center"><i class="fas" :class="isLoggingOut ? 'fa-spinner fa-spin' : 'fa-sign-out-alt'"></i></div>
          <span>{{ isLoggingOut ? t('adminLayout.loggingOut') : t('adminLayout.logout') }}</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
      <!-- Topbar -->
      <header class="shrink-0 h-16 bg-slate-900/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 gap-4 z-30">
        <!-- Mobile menu toggle -->
        <button
          type="button"
          class="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white transition-all"
          :aria-expanded="isMenuOpen"
          aria-controls="mobile-nav"
          @click="toggleMenu"
        >
          <i class="fas" :class="isMenuOpen ? 'fa-times' : 'fa-bars'"></i>
        </button>

        <!-- Breadcrumb -->
        <div class="flex items-center gap-2 text-sm text-slate-400">
          <i class="fas fa-home text-xs text-slate-500"></i>
          <span class="text-slate-600">/</span>
          <span class="text-white font-semibold">{{ currentPageTitle }}</span>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400">
            <i class="fas fa-circle text-emerald-400 text-[6px]"></i>
            <span>{{ t('connected') }}</span>
          </div>
        </div>
      </header>

      <!-- Mobile Sidebar Overlay -->
      <Transition name="fade">
        <div v-if="isMenuOpen" class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" @click="closeMenu" />
      </Transition>

      <!-- Mobile Sidebar -->
      <Transition :name="isRtl ? 'slide-right' : 'slide-left'">
        <aside v-if="isMenuOpen" id="mobile-nav" class="fixed top-0 bottom-0 z-50 w-72 bg-slate-900 border-white/5 flex flex-col lg:hidden overflow-y-auto" :class="isRtl ? 'right-0 border-l' : 'left-0 border-r'">
          <div class="px-6 py-5 border-b border-white/5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/30">
                <i class="fas fa-mosque text-lg"></i>
              </div>
              <p class="text-white font-extrabold">{{ t('adminLayout.yemenTourism') }}</p>
            </div>
            <button type="button" class="w-8 h-8 rounded-lg bg-white/5 text-slate-400 hover:text-white flex items-center justify-center" @click="closeMenu">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <nav class="flex-1 p-4 space-y-1.5" aria-label="Mobile admin navigation">
            <NuxtLink
              v-for="item in localizedNavItems"
              :key="item.path"
              :to="item.path"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              :class="isActive(item.path)
                ? 'bg-gradient-to-l from-amber-500/20 to-amber-500/5 text-amber-400 border border-amber-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'"
              :aria-current="isActive(item.path) ? 'page' : undefined"
              @click="closeMenu"
            >
              <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="isActive(item.path) ? item.activeBg : 'bg-white/5'">
                <i class="fas" :class="item.icon"></i>
              </div>
              <span>{{ item.label }}</span>
            </NuxtLink>
          </nav>

          <div class="p-4 border-t border-white/5 space-y-2">
            <button type="button" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all" @click="toggleLocale">
              <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><i class="fas fa-globe"></i></div>
              <span>{{ t('switchLang') }}</span>
            </button>
            <NuxtLink to="/" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all" @click="closeMenu">
              <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><i class="fas fa-globe"></i></div>
              <span>{{ t('adminLayout.mainWebsite') }}</span>
            </NuxtLink>
            <button type="button" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50" :disabled="isLoggingOut" @click="logout">
              <div class="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center"><i class="fas" :class="isLoggingOut ? 'fa-spinner fa-spin' : 'fa-sign-out-alt'"></i></div>
              <span>{{ isLoggingOut ? t('adminLayout.loggingOut') : t('adminLayout.logout') }}</span>
            </button>
          </div>
        </aside>
      </Transition>

      <!-- Page Content -->
      <main id="admin-main-content" tabindex="-1" class="flex-1 overflow-y-auto p-6 md:p-8 focus:outline-none">
        <slot />
      </main>
    </div>

    <!-- AI Chatbot (available in admin too) -->
    <AIChatbot />
  </div>
</template>

<script setup lang="ts">
const { t, dir, isRtl, toggleLocale } = useLocale();
const auth = useAuthStore();
const { success: notifySuccess, error: notifyError } = useToast();
const route = useRoute();
const isMenuOpen = ref(false);
const isLoggingOut = ref(false);

const navItemsRaw = [
  { path: '/admin/dashboard', labelKey: 'adminLayout.dashboard', icon: 'fa-chart-pie', activeBg: 'bg-amber-500/20 text-amber-400' },
  { path: '/admin/cities', labelKey: 'adminLayout.manageCities', icon: 'fa-city', activeBg: 'bg-blue-500/20 text-blue-400' },
  { path: '/admin/landmarks', labelKey: 'adminLayout.manageLandmarks', icon: 'fa-map-marked-alt', activeBg: 'bg-emerald-500/20 text-emerald-400' },
  { path: '/admin/visitors', labelKey: 'adminLayout.mapVisitors', icon: 'fa-users', activeBg: 'bg-indigo-500/20 text-indigo-400' },
  { path: '/admin/report', labelKey: 'adminLayout.report', icon: 'fa-file-alt', activeBg: 'bg-purple-500/20 text-purple-400' },
  { path: '/admin/messages', labelKey: 'adminLayout.contactMessages', icon: 'fa-envelope', activeBg: 'bg-rose-500/20 text-rose-400' },
  { path: '/admin/admins', labelKey: 'adminLayout.manageAdmins', icon: 'fa-user-shield', activeBg: 'bg-cyan-500/20 text-cyan-400' },
];

const allowedNavItems = computed(() => {
  const role = auth.user?.role;
  if (role === 'admin') {
    return navItemsRaw;
  }
  
  return navItemsRaw.filter(item => {
    if (item.path === '/admin/dashboard') return true;
    if (role === 'admin_cities' && item.path === '/admin/cities') return true;
    if (role === 'admin_landmarks' && item.path === '/admin/landmarks') return true;
    if (role === 'admin_visitors' && item.path === '/admin/visitors') return true;
    if (role === 'admin_report' && item.path === '/admin/report') return true;
    if (role === 'admin_messages' && item.path === '/admin/messages') return true;
    return false;
  });
});

const localizedNavItems = computed(() =>
  allowedNavItems.value.map(item => ({
    ...item,
    label: t(item.labelKey)
  }))
);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const isActive = (path: string): boolean => {
  return route.path === path || route.path.startsWith(`${path}/`);
};

const currentPageTitle = computed(() => {
  const match = localizedNavItems.value.find(item => isActive(item.path));
  return match?.label || t('adminLayout.dashboard');
});

const logout = async () => {
  if (isLoggingOut.value) {
    return;
  }

  isLoggingOut.value = true;

  try {
    await auth.logout();
    notifySuccess(t('adminLayout.logoutSuccess'));
  } catch {
    notifyError(t('adminLayout.logoutError'));
  } finally {
    closeMenu();
    isLoggingOut.value = false;
    await navigateTo("/admin/login");
  }
};

watch(
  () => route.fullPath,
  () => {
    closeMenu();
  }
);
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active, .slide-left-enter-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-leave-active, .slide-left-leave-active {
  transition: transform 0.25s ease-in;
}
.slide-right-enter-from, .slide-right-leave-to {
  transform: translateX(100%);
}
.slide-left-enter-from, .slide-left-leave-to {
  transform: translateX(-100%);
}

/* Move chatbot trigger away from right sidebar in RTL setup */
@media (min-width: 1024px) {
  [dir="rtl"] :deep(.chatbot-trigger) {
    right: 318px !important;
  }
}
</style>
