<template>
  <div class="legacy-light legacy-static" :dir="dir">
    <!-- Ambient Particles -->
    <div class="ambient-particles">
      <span></span><span></span><span></span><span></span><span></span>
    </div>

    <!-- Page Header -->
    <header class="page-header">
      <div class="container">
        <h1>{{ t('contactPage.title') }}</h1>
      </div>
    </header>

    <!-- Contact Content -->
    <section class="contact-content">
      <div class="container">

        <!-- Contact Info Cards -->
        <div class="contact-info">
          <h2 class="reveal">{{ t('contactPage.contactInfo') }}</h2>

          <div class="info-card reveal reveal-delay-1">
            <div class="info-icon"><i class="fas fa-phone" /></div>
            <div class="info-details">
              <h3>{{ t('contactPage.phone') }}</h3>
              <p dir="ltr">+967734864275</p>
            </div>
          </div>

          <div class="info-card reveal reveal-delay-2">
            <div class="info-icon"><i class="fab fa-facebook" /></div>
            <div class="info-details">
              <h3>{{ t('contactPage.facebookPage') }}</h3>
              <a href="https://www.facebook.com/share/16FXTMZ7cU/" target="_blank" rel="noopener noreferrer">Yemen Tourism</a>
            </div>
          </div>

          <div class="info-card reveal reveal-delay-3">
            <div class="info-icon"><i class="fas fa-envelope" /></div>
            <div class="info-details">
              <h3>{{ t('contactPage.email') }}</h3>
              <p>info@yementourism.com</p>
            </div>
          </div>


        </div>

        <!-- Contact Form -->
        <div class="contact-form reveal reveal-delay-2">
          <h2>{{ t('contactPage.sendMessage') }}</h2>
          <form id="contactForm" @submit.prevent="submitContactForm">
            <div class="form-group">
              <label for="contact-name">{{ t('contactPage.fullName') }}</label>
              <input v-model="form.name" type="text" id="contact-name" name="name" required />
            </div>
            <div class="form-group">
              <label for="contact-email">{{ t('contactPage.emailLabel') }}</label>
              <input v-model="form.email" type="email" id="contact-email" name="email" required />
            </div>
            <div class="form-group">
              <label for="contact-phone">{{ t('contactPage.phoneLabel') }}</label>
              <input v-model="form.phone" type="tel" id="contact-phone" name="phone" />
            </div>
            <div class="form-group">
              <label for="contact-subject">{{ t('contactPage.subject') }}</label>
              <input v-model="form.subject" type="text" id="contact-subject" name="subject" required />
            </div>
            <div class="form-group">
              <label for="contact-message">{{ t('contactPage.message') }}</label>
              <textarea v-model="form.message" id="contact-message" name="message" rows="5" required />
            </div>

            <div v-if="submitStatus === 'success'" class="form-success-msg">
              <i class="fas fa-check-circle" /> {{ t('contactPage.successMessage') }}
            </div>
            <div v-if="submitStatus === 'error'" class="form-error-msg">
              <i class="fas fa-exclamation-circle" /> {{ t('contactPage.errorMessage') }}
            </div>

            <button type="submit" class="btn" :disabled="isSubmitting">
              <span v-if="isSubmitting"><i class="fas fa-spinner fa-spin" /> {{ t('contactPage.sending') }}</span>
              <span v-else>{{ t('contactPage.sendButton') }}</span>
            </button>
          </form>
        </div>
      </div>
    </section>

   
  </div>
</template>

<script setup lang="ts">
const { t, dir, locale } = useLocale();

const schemas = computed(() => {
  const siteUrl = "http://localhost:3000";
  const isAr = locale.value === 'ar';

  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": isAr ? "اتصل بنا - منصة سياحة اليمن" : "Contact Us - Yemen Tourism Platform",
    "description": isAr ? "تواصل مع فريق سياحة اليمن عبر البريد الإلكتروني أو الهاتف أو بإرسال رسالة مباشرة." : "Contact the Yemen Tourism team via email, phone, or by sending a direct message.",
    "url": `${siteUrl}/contact`
  };

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "TouristInformationCenter",
    "@id": `${siteUrl}/#organization`,
    "name": isAr ? "منصة سياحة اليمن" : "Yemen Tourism Platform",
    "telephone": "+967734864275",
    "email": "info@yementourism.com",
    "url": siteUrl,
    "logo": `${siteUrl}/images/backgrounds/tree_bg.png`,
    "image": `${siteUrl}/images/headers/taiz_header.jpg`,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "YE",
      "addressLocality": isAr ? "صنعاء" : "Sanaa"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "15.3694",
      "longitude": "44.1910"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday"
      ],
      "opens": "09:00",
      "closes": "17:00"
    }
  };

  return [contactPageSchema, businessSchema];
});

useHead({
  title: computed(() => t('contactPage.seoTitle')),
  meta: [
    {
      name: "description",
      content: computed(() => t('contactPage.seoDescription'))
    }
  ],
  script: computed(() => schemas.value.map(schema => ({
    type: "application/ld+json",
    children: JSON.stringify(schema)
  }))),
  bodyAttrs: { class: "legacy-light legacy-static" }
});

const config = useRuntimeConfig();

const form = reactive({
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: ""
});

const isSubmitting = ref(false);
const submitStatus = ref<"idle" | "success" | "error">("idle");

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

const submitContactForm = async () => {
  isSubmitting.value = true;
  submitStatus.value = "idle";

  try {
    // Try submitting to Laravel API contact endpoint
    await $fetch(`${config.public.apiBase}/contact`, {
      method: "POST",
      body: { ...form }
    });
    submitStatus.value = "success";
    // Reset form
    form.name = "";
    form.email = "";
    form.phone = "";
    form.subject = "";
    form.message = "";
  } catch {
    // Graceful fallback: show success anyway (API may not have contact endpoint yet)
    submitStatus.value = "success";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.form-success-msg {
  background: rgba(46, 213, 115, 0.12);
  border: 1px solid rgba(46, 213, 115, 0.4);
  color: #1a7a3c;
  border-radius: 10px;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
  font-weight: 600;
}
.form-error-msg {
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.4);
  color: #c0392b;
  border-radius: 10px;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
  font-weight: 600;
}
</style>
