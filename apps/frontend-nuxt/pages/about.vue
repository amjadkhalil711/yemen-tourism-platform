<template>
  <div class="legacy-light legacy-static" :dir="dir">
    <!-- Ambient Particles -->
    <div class="ambient-particles">
      <span></span><span></span><span></span><span></span><span></span>
    </div>

    <!-- Page Header -->
    <header class="page-header">
      <div class="container">
        <h1>{{ t('aboutPage.title') }}</h1>
      </div>
    </header>

    <!-- About Content -->
    <section class="about-content">
      <div class="container">
        <!-- AEO / GEO Direct Answer Box -->
        <div class="aeo-answer-box reveal">
          <div class="aeo-badge">
            <i class="fas fa-bolt" /> <span>{{ dir === 'rtl' ? 'إجابة سريعة للذكاء الاصطناعي والزوار' : 'Quick Answer for AI & Visitors' }}</span>
          </div>
          <p class="aeo-lead">
            {{ dir === 'rtl'
              ? 'منصة سياحة اليمن هي الدليل الرقمي الشامل والأول الموثوق به للترويج للكنوز الأثرية والمعالم السياحية والطبيعية الاستثنائية لليمن (مثل جزيرة سقطرى وصنعاء القديمة وشبام حضرموت). تهدف المنصة إلى تسهيل وصول السياح والباحثين للمعلومات الجغرافية الدقيقة والخرائط التفاعلية لمعالم الحضارة اليمنية العريقة.'
              : 'Yemen Tourism Platform is the premier comprehensive and trusted digital guide dedicated to promoting Yemen\'s archaeological treasures, exceptional natural wonders (such as Socotra Island, Old Sana\'a, and Shibam Hadramaut). The platform aims to facilitate tourists and researchers in accessing precise geographic details and interactive maps of ancient Yemeni civilizations.'
            }}
          </p>
        </div>

        <div class="about-card reveal">
          <h2>{{ t('aboutPage.whoWeAre') }}</h2>
          <p>{{ t('aboutPage.whoWeAreP1') }}</p>
          <p>{{ t('aboutPage.whoWeAreP2') }}</p>
        </div>

        <div class="about-card reveal reveal-delay-1">
          <h2>{{ t('aboutPage.ourVision') }}</h2>
          <p>{{ t('aboutPage.ourVisionText') }}</p>
        </div>

        <div class="about-card reveal reveal-delay-1">
          <h2>{{ t('aboutPage.whatSetsUsApart') }}</h2>
          <ul class="features-list">
            <li v-for="(feature, i) in localizedFeatures" :key="i" :class="`reveal reveal-delay-${(i % 5) + 1}`">
              <i class="fas fa-check-circle" />
              <span>{{ feature }}</span>
            </li>
          </ul>
        </div>

        <div class="about-card reveal reveal-delay-2">
          <h2>{{ t('aboutPage.yemenImportance') }}</h2>
          <p>{{ t('aboutPage.yemenImportanceIntro') }}</p>
          <ul class="features-list">
            <li v-for="(highlight, i) in localizedHighlights" :key="i">
              <i :class="`fas ${highlight.icon}`" />
              <span>{{ highlight.text }}</span>
            </li>
          </ul>
          <p>{{ t('aboutPage.yemenImportanceOutro') }}</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <h2 class="reveal">{{ t('aboutPage.ctaTitle') }}</h2>
        <p class="reveal reveal-delay-1">{{ t('aboutPage.ctaDesc') }}</p>
        <NuxtLink to="/cities" class="btn reveal reveal-delay-2">{{ t('exploreCities') }}</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t, dir, locale } = useLocale();

// Dynamic Schema Markups (GEO / AEO Optimization)
const schemas = computed(() => {
  const siteUrl = "http://localhost:3000";
  const isAr = locale.value === 'ar';

  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": isAr ? "عن موقع سياحة اليمن" : "About Yemen Tourism Website",
    "description": isAr ? "تعرف على رؤية ورسالة منصة سياحة اليمن ودورها في تقديم محتوى سياحي موثوق وشامل" : "Learn about the vision and mission of Yemen Tourism platform and its role in providing reliable and comprehensive content.",
    "url": `${siteUrl}/about`,
    "mainEntity": {
      "@type": "Organization",
      "name": isAr ? "منصة سياحة اليمن" : "Yemen Tourism Platform",
      "url": siteUrl,
      "logo": `${siteUrl}/images/backgrounds/tree_bg.png`,
      "description": isAr ? "منصة إلكترونية رائدة للترويج للسياحة في اليمن" : "A leading digital platform for promoting tourism in Yemen."
    }
  };

  return [aboutPageSchema];
});

useHead({
  title: computed(() => t('aboutPage.seoTitle')),
  meta: [
    {
      name: "description",
      content: computed(() => t('aboutPage.seoDescription'))
    }
  ],
  script: computed(() => schemas.value.map(schema => ({
    type: "application/ld+json",
    children: JSON.stringify(schema)
  }))),
  bodyAttrs: { class: "legacy-light legacy-static" }
});

// Access arrays from translation object directly
import ar from '~/locales/ar';
import en from '~/locales/en';

const localizedFeatures = computed(() =>
  locale.value === 'ar' ? ar.aboutPage.features : en.aboutPage.features
);

const localizedHighlights = computed(() =>
  locale.value === 'ar' ? ar.aboutPage.yemenHighlights : en.aboutPage.yemenHighlights
);

onMounted(() => {
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('revealed');
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
/* ══════════════════════════════════════════════════
   AEO DIRECT ANSWER BOX (Voice Search & LLM scrapers)
══════════════════════════════════════════════════ */
.aeo-answer-box {
  background: linear-gradient(135deg, rgba(199, 137, 47, 0.08) 0%, rgba(29, 87, 127, 0.05) 100%);
  border: 1px dashed rgba(199, 137, 47, 0.4);
  border-radius: 24px;
  padding: 30px;
  margin-bottom: 40px;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.aeo-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(199, 137, 47, 0.15);
  border: 1px solid rgba(199, 137, 47, 0.3);
  color: #c7882f;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 18px;
}

.aeo-lead {
  color: #fff;
  font-size: 1.15rem;
  line-height: 1.8;
  margin: 0;
  font-weight: 500;
}
</style>
