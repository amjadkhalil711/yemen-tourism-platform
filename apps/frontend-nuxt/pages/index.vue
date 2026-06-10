<template>
  <div class="legacy-light legacy-home" :dir="dir">
    <!-- Ambient Particles -->
    <div class="ambient-particles">
      <span></span><span></span><span></span><span></span><span></span>
    </div>

    <!-- Hero Section -->
    <section class="hero">
      <video
        autoplay
        loop
        muted
        playsinline
        preload="auto"
        fetchpriority="high"
        class="hero-video"
      >
        <source src="/images/headers/ye.mp4" type="video/mp4" />
      </video>
      <div class="hero-content">
        <h1>{{ t('heroTitle') }}</h1>
        <p>{{ t('heroDescription') }}</p>
        <NuxtLink to="/cities" class="btn">{{ t('exploreCities') }}</NuxtLink>
        <div class="hero-highlights">
          <span><i class="fas fa-gem" /> {{ t('heroHighlights.heritage') }}</span>
          <span><i class="fas fa-map-marked-alt" /> {{ t('heroHighlights.citiesLandmarks') }}</span>
          <span><i class="fas fa-sun" /> {{ t('heroHighlights.visualIdentity') }}</span>
        </div>
        <div class="scroll-indicator" />
      </div>
    </section>

    <!-- Introduction Section -->
    <section class="intro">
      <div class="container">
        <h2 class="reveal">{{ t('introTitle') }}</h2>
        <p class="reveal reveal-delay-1">{{ t('introP1') }}</p>
        <p class="reveal reveal-delay-2">{{ t('introP2') }}</p>
      </div>
    </section>

    <!-- Featured Cities Section -->
    <section class="featured-cities">
      <div class="container">
        <h2 class="reveal">{{ t('featuredCitiesTitle') }}</h2>
        <div class="cities-grid">
          <div v-for="(city, idx) in localizedFeaturedCities" :key="city.id"
               :class="`city-card reveal reveal-delay-${(idx % 5) + 1}`">
            <div class="city-image" :id="city.id" />
            <span v-if="city.badge" class="city-badge">{{ city.badge }}</span>
            <h3>{{ city.name }}</h3>
            <p>{{ city.description }}</p>
            <NuxtLink :to="`/cities?view=${city.slug}`" class="btn-small">{{ t('discoverMore') }}</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Tourism Types Section -->
    <section class="tourism-types">
      <div class="container">
        <h2 class="reveal">{{ t('tourismTypesTitle') }}</h2>
        <div class="types-grid">
          <div v-for="(type, idx) in localizedTourismTypes" :key="type.icon"
               :class="`type-card reveal reveal-delay-${(idx % 5) + 1}`">
            <i :class="`fas ${type.icon}`" />
            <h3>{{ type.title }}</h3>
            <p>{{ type.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section (AEO / GEO Optimization) -->
    <section class="faq-section">
      <div class="container">
        <h2 class="reveal">{{ t('faq.title') }}</h2>
        <p class="reveal reveal-delay-1 faq-subtitle">{{ t('faq.subtitle') }}</p>
        <div class="faq-accordion reveal reveal-delay-2">
          <div
            v-for="(item, idx) in localizedFaqs"
            :key="idx"
            class="faq-item"
            :class="{ active: activeFaqIdx === idx }"
          >
            <button
              class="faq-question"
              @click="toggleFaq(idx)"
              :aria-expanded="activeFaqIdx === idx"
            >
              <span>{{ item.question }}</span>
              <span class="faq-icon"><i class="fas" :class="activeFaqIdx === idx ? 'fa-minus' : 'fa-plus'" /></span>
            </button>
            <div class="faq-answer-wrapper">
              <div class="faq-answer">
                <p>{{ item.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <h2 class="reveal">{{ t('ctaTitle') }}</h2>
        <p class="reveal reveal-delay-1">{{ t('ctaDescription') }}</p>
        <NuxtLink to="/cities" class="btn reveal reveal-delay-2">{{ t('ctaButton') }}</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import arLocale from '~/locales/ar';
import enLocale from '~/locales/en';

const { t, dir, locale } = useLocale();

const activeFaqIdx = ref<number | null>(null);

const toggleFaq = (idx: number) => {
  activeFaqIdx.value = activeFaqIdx.value === idx ? null : idx;
};

const localizedFaqs = computed(() => {
  const loc = locale.value === 'ar' ? arLocale : enLocale;
  return loc.faq.items;
});

// Dynamic Schema Markup generation (GEO / AEO Optimization)
const schemas = computed(() => {
  const siteUrl = "http://localhost:3000";
  const isAr = locale.value === 'ar';

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": isAr ? "سياحة اليمن" : "Yemen Tourism",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/cities?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  const infoCenterSchema = {
    "@context": "https://schema.org",
    "@type": "TouristInformationCenter",
    "@id": `${siteUrl}/#organization`,
    "name": isAr ? "منصة سياحة اليمن" : "Yemen Tourism Platform",
    "url": siteUrl,
    "logo": `${siteUrl}/images/backgrounds/tree_bg.png`,
    "image": `${siteUrl}/images/headers/taiz_header.jpg`,
    "description": isAr
      ? "المنصة الرسمية الرائدة لاستكشاف المعالم السياحية والأثرية والطبيعية في اليمن"
      : "The leading official platform to explore tourist, historical, and natural landmarks of Yemen.",
    "telephone": "+967734864275",
    "email": "info@yementourism.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "YE",
      "addressLocality": isAr ? "صنعاء" : "Sanaa"
    },
    "sameAs": [
      "https://www.facebook.com/share/16FXTMZ7cU/",
      "https://en.wikipedia.org/wiki/Yemen"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": localizedFaqs.value.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return [websiteSchema, infoCenterSchema, faqSchema];
});

useHead({
  title: computed(() => locale.value === 'ar' ? "سياحة اليمن - اكتشف جمال اليمن" : "Yemen Tourism - Discover the Beauty of Yemen"),
  meta: [
    {
      name: "description",
      content: computed(() => locale.value === 'ar'
        ? "اكتشف أجمل المدن والمعالم السياحية والأثرية والطبيعية في اليمن. تجربة سياحية لا تُنسى في أرض الحضارات العريقة."
        : "Discover the most beautiful cities and tourist, archaeological, and natural landmarks in Yemen. An unforgettable tourism experience in the land of ancient civilizations."
      )
    }
  ],
  link: [
    { rel: "preload", href: "/images/headers/ye.mp4", as: "video", type: "video/mp4", fetchpriority: "high" },
    { rel: "stylesheet", href: "/css/enhanced-homepage.css" },
    { rel: "stylesheet", href: "/css/featured-cities.css" },
    { rel: "stylesheet", href: "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" }
  ],
  script: computed(() => schemas.value.map(schema => ({
    type: "application/ld+json",
    children: JSON.stringify(schema)
  }))),
  bodyAttrs: { class: "legacy-light legacy-home" }
});

const cityIds = ['sanaa', 'taiz', 'ibb', 'shibam', 'socotra', 'aden'];

const localizedFeaturedCities = computed(() =>
  cityIds.map(id => ({
    id,
    slug: id,
    name: t(`featuredCities.${id}.name`),
    description: t(`featuredCities.${id}.description`),
    badge: t(`featuredCities.${id}.badge`) !== `featuredCities.${id}.badge` ? t(`featuredCities.${id}.badge`) : null,
  }))
);

const tourismKeys = [
  { key: 'archaeological', icon: 'fa-monument' },
  { key: 'natural', icon: 'fa-mountain' },
  { key: 'religious', icon: 'fa-mosque' },
  { key: 'beach', icon: 'fa-umbrella-beach' },
  { key: 'adventure', icon: 'fa-hiking' },
  { key: 'food', icon: 'fa-utensils' },
];

const localizedTourismTypes = computed(() =>
  tourismKeys.map(({ key, icon }) => ({
    icon,
    title: t(`tourismTypes.${key}.title`),
    description: t(`tourismTypes.${key}.description`),
  }))
);

// Initialize scroll-based reveal animations
onMounted(() => {
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1 }
    );
    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('revealed'));
  }
});
</script>

<style scoped>
/* Inject page-specific body classes */
:global(body.legacy-home .sidebar) {
  /* Sidebar body class-based overrides handled by enhanced-style.css */
}

/* ══════════════════════════════════════════════════
   FAQ ACCORDION SECTION (AEO / GEO Optimization)
   Premium Glassmorphic and responsive styling
══════════════════════════════════════════════════ */
.faq-section {
  padding: 80px 0;
  background: radial-gradient(circle at 50% 50%, rgba(29, 87, 127, 0.05), transparent 70%);
}

.faq-subtitle {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.15rem;
  margin-top: -15px;
  margin-bottom: 50px;
}

.faq-accordion {
  max-width: 850px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.faq-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.faq-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(199, 137, 47, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.faq-item.active {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(199, 137, 47, 0.6);
  box-shadow: 0 15px 40px rgba(199, 137, 47, 0.1);
}

.faq-question {
  width: 100%;
  padding: 24px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  background: transparent;
  border: none;
  color: #fff;
  font-family: 'Tajawal', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  text-align: inherit;
  transition: color 0.3s ease;
}

.faq-item.active .faq-question {
  color: #c7882f;
}

.faq-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.faq-item.active .faq-icon {
  background: rgba(199, 137, 47, 0.2);
  color: #c7882f;
  transform: rotate(180deg);
}

.faq-answer-wrapper {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.faq-item.active .faq-answer-wrapper {
  max-height: 500px;
}

.faq-answer {
  padding: 0 30px 24px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 1.05rem;
  line-height: 1.8;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 20px;
}

.faq-answer p {
  margin: 0;
}
</style>
