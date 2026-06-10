<template>
  <div class="page-shell" :class="{ 'sidebar-open': isSidebarOpen, 'sidebar-collapsed': !isSidebarOpen }" :dir="dir">
    <!-- Skip Link -->
    <a href="#main-content" class="skip-link">{{ t('skipToContent') }}</a>

    <!-- ══════════════════════════════════════════
         HEADER BAR — glassmorphism with 3 buttons
    ══════════════════════════════════════════ -->
    <header class="top-header">
      <!-- Left cluster: admin + chatbot + lang -->
      <div class="header-actions">

        <!-- Admin Login -->
        <NuxtLink to="/admin/login" class="hdr-btn admin-btn" :title="t('adminLogin')">
          <span class="hdr-btn-icon">
            <i class="fas fa-user-shield" />
          </span>
          <span class="hdr-btn-label">{{ t('adminLogin') }}</span>
          <span class="hdr-btn-glow" />
        </NuxtLink>

        <!-- Divider -->
        <span class="hdr-divider" />

        <!-- Yemen Tourism AI Chatbot -->
        <button
          type="button"
          class="hdr-btn chatbot-btn"
          :title="locale === 'ar' ? 'سياحة اليمن AI' : 'Yemen Tourism AI'"
          @click="openChatbot"
        >
          <span class="hdr-btn-icon chatbot-icon-wrap">
            <i class="fas fa-robot" />
            <span class="chatbot-ping" />
          </span>
          <span class="hdr-btn-label">سياحة اليمن AI</span>
          <span class="hdr-btn-glow chatbot-glow" />
        </button>

        <!-- Divider -->
        <span class="hdr-divider" />

        <!-- Language Toggle -->
        <button
          type="button"
          class="hdr-btn lang-btn"
          :title="t('switchLang')"
          @click="toggleLocale"
        >
          <span class="hdr-btn-icon">
            <i class="fas fa-globe" />
          </span>
          <span class="hdr-btn-label">{{ locale === 'ar' ? 'English' : 'العربية' }}</span>
          <span class="hdr-btn-glow lang-glow" />
        </button>

      </div>
    </header>

    <!-- AI Chatbot (lazy-loaded — only mounted when user opens it) -->
    <LazyAIChatbot v-if="chatbotMounted" ref="chatbotRef" :hide-floating-trigger="true" />

    <!-- Sidebar -->
    <div class="sidebar" id="sidebar">
      <div class="wave-effect" />
      <div class="moving-bar" />
      <div class="logo">
        <h2>{{ t('siteName') }}</h2>
        <h3>{{ t('siteSlogan') }}</h3>
      </div>
      <nav>
        <!-- Main Pages Section -->
        <div class="nav-section">
          <div class="nav-section-title" @click="toggleSection('main-pages')">
            <span>{{ t('sidebar.mainPages') }}</span>
            <i class="fas" :class="openSections['main-pages'] ? 'fa-chevron-up' : 'fa-chevron-down'" />
          </div>
          <div class="nav-section-content" :class="{ open: openSections['main-pages'] }">
            <ul>
              <li><NuxtLink to="/"><i class="fas fa-home" /> {{ t('home') }}</NuxtLink></li>
              <li><NuxtLink to="/cities"><i class="fas fa-city" /> {{ t('cities') }}</NuxtLink></li>
              <li><NuxtLink to="/about"><i class="fas fa-info-circle" /> {{ t('about') }}</NuxtLink></li>
              <li><NuxtLink to="/contact"><i class="fas fa-envelope" /> {{ t('contact') }}</NuxtLink></li>
            </ul>
          </div>
        </div>

        <!-- Tourism Types Section -->
        <div class="nav-section">
          <div class="nav-section-title" @click="toggleSection('tourism-types')">
            <span>{{ t('sidebar.tourismTypes') }}</span>
            <i class="fas" :class="openSections['tourism-types'] ? 'fa-chevron-up' : 'fa-chevron-down'" />
          </div>
          <div class="nav-section-content" :class="{ open: openSections['tourism-types'] }">
            <ul>
              <li><NuxtLink to="/cities?category=historical"><i class="fas fa-monument" /> {{ t('sidebar.historicalTourism') }}</NuxtLink></li>
              <li><NuxtLink to="/cities?category=mountain"><i class="fas fa-mountain" /> {{ t('sidebar.naturalTourism') }}</NuxtLink></li>
              <li><NuxtLink to="/cities?category=religious"><i class="fas fa-mosque" /> {{ t('sidebar.religiousTourism') }}</NuxtLink></li>
              <li><NuxtLink to="/cities?category=coastal"><i class="fas fa-umbrella-beach" /> {{ t('sidebar.beachTourism') }}</NuxtLink></li>
              <li><NuxtLink to="/cities?category=desert"><i class="fas fa-hiking" /> {{ t('sidebar.adventureTourism') }}</NuxtLink></li>
            </ul>
          </div>
        </div>

        <!-- Main Cities Section -->
        <div class="nav-section">
          <div class="nav-section-title" @click="toggleSection('main-cities')">
            <span>{{ t('sidebar.mainCities') }}</span>
            <i class="fas" :class="openSections['main-cities'] ? 'fa-chevron-up' : 'fa-chevron-down'" />
          </div>
          <div class="nav-section-content" :class="{ open: openSections['main-cities'] }">
            <ul>
              <li v-for="city in mainCitiesList" :key="city.slug">
                <NuxtLink :to="`/cities?view=${city.slug}`"><i class="fas fa-city" /> {{ city.name }}</NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <!-- Contact Info Section -->
        <div class="nav-section">
          <div class="nav-section-title" @click="toggleSection('contact-info')">
            <span>{{ t('sidebar.contactInfo') }}</span>
            <i class="fas" :class="openSections['contact-info'] ? 'fa-chevron-up' : 'fa-chevron-down'" />
          </div>
          <div class="nav-section-content" :class="{ open: openSections['contact-info'] }">
            <ul>
              <li><NuxtLink to="/contact"><i class="fas fa-envelope" /> {{ t('contact') }}</NuxtLink></li>
              <li><NuxtLink to="/about"><i class="fas fa-info-circle" /> {{ t('sidebar.aboutSite') }}</NuxtLink></li>
            </ul>
          </div>
        </div>
      </nav>

      <div class="social-links">
        <a href="https://www.facebook.com/share/16FXTMZ7cU/" target="_blank" rel="noopener noreferrer"><i class="fab fa-facebook" /></a>
        <a href="#"><i class="fab fa-twitter" /></a>
        <a href="#"><i class="fab fa-instagram" /></a>
        <a href="#"><i class="fab fa-youtube" /></a>
      </div>
    </div>

    <!-- Sidebar Toggle Button -->
    <div class="sidebar-toggle" id="sidebar-toggle" @click="toggleSidebar">
      <i class="fas" :class="isSidebarOpen ? 'fa-times' : 'fa-bars'" />
    </div>

    <!-- Main Content -->
    <main id="main-content" tabindex="-1">
      <slot />

      <!-- Footer -->
      <footer>
        <div class="container">
          <p>{{ t('allRightsReserved') }} &copy; 2026 - {{ t('siteName') }}</p>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
const { t, dir, locale, toggleLocale } = useLocale();
const route = useRoute();
const isSidebarOpen = ref(true);

// Reference to the AIChatbot component to call openChat()
const chatbotRef = ref<{ openChat: () => void } | null>(null);
const chatbotMounted = ref(false);

const openChatbot = async () => {
  chatbotMounted.value = true;
  await nextTick();
  chatbotRef.value?.openChat();
};

const openSections = reactive<Record<string, boolean>>({
  'main-pages': true,
  'tourism-types': false,
  'main-cities': false,
  'contact-info': false
});

const cityKeys = ['taiz', 'ibb', 'aden', 'sanaa', 'socotra', 'mukalla', 'hodeidah', 'marib', 'shibam'];

const mainCitiesList = computed(() =>
  cityKeys.map(slug => ({
    slug,
    name: t(`cityNames.${slug}`)
  }))
);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const toggleSection = (section: string) => {
  openSections[section] = !openSections[section];
};

// Close sidebar on route change
watch(() => route.fullPath, () => {
  isSidebarOpen.value = false;
});

// Inject seasonal themes script on client only
onMounted(() => {
  if (window.innerWidth <= 768) {
    isSidebarOpen.value = false;
  }
  if (!document.querySelector('script[src="/js/seasonal-themes.js"]')) {
    const script = document.createElement('script');
    script.src = '/js/seasonal-themes.js';
    script.defer = true;
    document.body.appendChild(script);
  }
  // Shooting star intro (once per session)
  if (!document.querySelector('script[src="/js/shooting-star-intro.js"]')) {
    const starScript = document.createElement('script');
    starScript.src = '/js/shooting-star-intro.js';
    starScript.defer = true;
    document.body.appendChild(starScript);
  }
});
</script>

<style scoped>
/* ══════════════════════════════════════════════════
   HEADER BAR
══════════════════════════════════════════════════ */
.top-header {
  position: fixed;
  top: 0;
  left: 0;
  /* stop exactly where the sidebar starts */
  right: 280px;
  height: 56px;
  z-index: 9990;
  display: flex;
  align-items: center;
  padding: 0 20px;
  /* NO background — fully transparent so the hero shows through */
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-bottom: none;
  box-shadow: none;
  /* prevent any part of the header leaking under the sidebar */
  overflow: hidden;
  transition: right 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.header-actions {
  display: flex;
  align-items: center;
  width: 100%;
  /* distribute three buttons evenly from edge to edge */
  justify-content: space-evenly;
}

/* ── Divider ── */
.hdr-divider {
  display: block;
  width: 1px;
  height: 26px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 1px;
  margin: 0 4px;
}

/* ══════════════════════════════════════════════════
   HEADER BUTTON — shared base
══════════════════════════════════════════════════ */
.hdr-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-family: 'Tajawal', 'Segoe UI', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  letter-spacing: 0.4px;
  white-space: nowrap;
  text-shadow: 0 1px 4px rgba(0,0,0,0.4);
}

.hdr-btn:hover {
  transform: translateY(-2px) scale(1.04);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
  border-color: rgba(255, 255, 255, 0.25);
}

.hdr-btn:active {
  transform: translateY(0) scale(0.98);
}

/* Glow layer on hover */
.hdr-btn-glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.hdr-btn:hover .hdr-btn-glow { opacity: 1; }

/* Icon circle */
.hdr-btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-size: 1.15rem;
  flex-shrink: 0;
  position: relative;
  transition: transform 0.3s ease;
}
.hdr-btn:hover .hdr-btn-icon { transform: rotate(-8deg) scale(1.18); }

/* ── ADMIN button ── */
.admin-btn .hdr-btn-icon {
  background: linear-gradient(135deg, #b8860b, #daa520);
  box-shadow: 0 3px 12px rgba(218, 165, 32, 0.5);
}
.admin-btn .hdr-btn-glow {
  background: linear-gradient(135deg,
    rgba(218, 165, 32, 0.12) 0%,
    rgba(184, 134, 11, 0.04) 100%);
}
.admin-btn:hover {
  border-color: rgba(218, 165, 32, 0.4);
  box-shadow: 0 8px 28px rgba(218, 165, 32, 0.25);
}

/* ── CHATBOT button ── */
.chatbot-btn .chatbot-icon-wrap {
  background: linear-gradient(135deg, #00c853, #1de9b6);
  box-shadow: 0 3px 12px rgba(0, 200, 83, 0.5);
}
.chatbot-btn .chatbot-glow {
  background: linear-gradient(135deg,
    rgba(0, 200, 83, 0.12) 0%,
    rgba(29, 233, 182, 0.04) 100%);
}
.chatbot-btn:hover {
  border-color: rgba(0, 200, 83, 0.4);
  box-shadow: 0 8px 28px rgba(0, 200, 83, 0.25);
}

/* Ping animation on chatbot icon */
.chatbot-ping {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 9px;
  height: 9px;
  background: #00e676;
  border-radius: 50%;
  border: 2px solid #111;
  animation: ping-anim 2s infinite;
}
@keyframes ping-anim {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.5); opacity: 0.6; }
}

/* ── LANGUAGE button ── */
.lang-btn .hdr-btn-icon {
  background: linear-gradient(135deg, #1565c0, #42a5f5);
  box-shadow: 0 3px 12px rgba(66, 165, 245, 0.5);
}
.lang-btn .lang-glow {
  background: linear-gradient(135deg,
    rgba(66, 165, 245, 0.12) 0%,
    rgba(21, 101, 192, 0.04) 100%);
}
.lang-btn:hover {
  border-color: rgba(66, 165, 245, 0.4);
  box-shadow: 0 8px 28px rgba(66, 165, 245, 0.25);
}

/* ══════════════════════════════════════════════════
   SIDEBAR TOGGLE — push down to avoid header overlap
══════════════════════════════════════════════════ */
:global(.sidebar-toggle) {
  top: 14px !important;
}

/* ══════════════════════════════════════════════════
   MAIN CONTENT — NO top padding; hero slides under the
   transparent header exactly like a full-bleed layout
══════════════════════════════════════════════════ */
main {
  /* no padding — content intentionally flows under the transparent header */
  transition: margin-right 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* ══════════════════════════════════════════════════
   SIDEBAR accordion & Collapse
══════════════════════════════════════════════════ */
.page-shell.sidebar-open .sidebar {
  transform: translateX(0) !important;
}

.page-shell.sidebar-collapsed .sidebar {
  transform: translateX(280px) !important;
}

.page-shell.sidebar-collapsed main {
  margin-right: 0 !important;
}

.page-shell.sidebar-collapsed .top-header {
  right: 0 !important;
}

.nav-section-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease;
}
.nav-section-content.open {
  max-height: 600px;
}

/* ══════════════════════════════════════════════════
   SKIP LINK
══════════════════════════════════════════════════ */
.skip-link {
  position: absolute;
  top: -100px;
  right: 0;
  background: #025;
  color: #fff;
  padding: 0.5rem 1rem;
  z-index: 99999;
  border-radius: 0 0 0.5rem 0;
  transition: top 0.2s;
}
.skip-link:focus {
  top: 0;
}

/* ══════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════ */
footer {
  background: rgba(0, 0, 0, 0.3);
  text-align: center;
  padding: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* ══════════════════════════════════════════════════
   RESPONSIVE — hide labels on smaller screens
══════════════════════════════════════════════════ */
@media (max-width: 600px) {
  .hdr-btn-label { display: none; }
  .hdr-btn { padding: 9px 10px; }
  .top-header { right: 0; padding: 0 12px; }
}
</style>
