export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: "2026-06-01",
  devtools: { enabled: true },
  css: ["~/assets/css/tailwind.css"],
  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  // ── Performance: instant page transitions + smart prefetching
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true
  },
  router: {
    options: {
      linkActiveClass: "router-link-active",
      linkExactActiveClass: "router-link-exact-active"
    }
  },
  runtimeConfig: {
    public: {
      siteUrl: "http://localhost:3000",
      apiBase: "http://localhost:8000/api/v1",
      apiTimeoutMs: 15000,
      apiRetryEnabled: true,
      apiRetryMaxAttempts: 3,
      apiRetryBaseDelayMs: 250,
      apiRetryMaxDelayMs: 2000,
      apiRetryJitterMs: 100
    }
  },
  app: {
    // Page transitions disabled on purpose — combined with NuxtLink's automatic
    // viewport prefetching, navigation is truly instant with zero visual gap.
    pageTransition: false,
    layoutTransition: false,
    head: {
      htmlAttrs: { lang: "ar", dir: "rtl" },
      title: "سياحة اليمن",
      meta: [
        { charset: "UTF-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },
        { name: "description", content: "منصة سياحة اليمن – اكتشف جمال اليمن ومدنه وتراثه العريق" }
      ],
      link: [
        // Resource hints (faster handshake to third-party origins)
        { rel: "preconnect", href: "https://cdnjs.cloudflare.com", crossorigin: "" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        { rel: "dns-prefetch", href: "https://unpkg.com" },
        // Fonts: preload Tajawal + Inter (display=swap so text renders fast)
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&display=swap"
        },
        // FontAwesome (icons used everywhere)
        {
          rel: "stylesheet",
          href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        },
        // ── Local stylesheets (in cascade order) ──
        { rel: "stylesheet", href: "/css/enhanced-style.css" },
        { rel: "stylesheet", href: "/css/enhanced-sidebar.css" },
        { rel: "stylesheet", href: "/css/legacy-glass-light.css" },
        { rel: "stylesheet", href: "/css/premium-theme.css" },
        { rel: "stylesheet", href: "/css/seasonal-themes.css" },
        { rel: "stylesheet", href: "/css/luxury-overhaul.css" },
        { rel: "stylesheet", href: "/css/revolutionary-design.css" }
        // animate.css → loaded only on home page (via useHead)
        // leaflet.css → loaded only on cities pages (via useHead)
      ]
      // Google Maps script removed: it was loaded globally with a no-op
      // callback and is not actually used in the app — saves a 200KB+ blocking download.
    }
  }
});
