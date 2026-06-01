<template>
  <div class="legacy-light legacy-cities" :dir="dir">

    <div class="ambient-particles">
      <span></span><span></span><span></span><span></span><span></span>
    </div>

    <!-- Page Header -->
    <section class="page-header" style="background-image: url('/images/header_bg.png'); background-size: cover; background-position: center;">
      <div class="cities-header-overlay"></div>
      <div class="container cities-header-content">
        <p class="page-lead">
          {{ t('citiesPage.lead') }}
        </p>
        <div class="page-badges">
          <span><i class="fas fa-layer-group" /> {{ t('citiesPage.organizedBrowsing') }}</span>
          <span><i class="fas fa-search" /> {{ t('citiesPage.fasterSearch') }}</span>
          <span><i class="fas fa-landmark" /> {{ t('citiesPage.professionalDisplay') }}</span>
        </div>
        <h1>{{ t('citiesPage.title') }}</h1>
      </div>
    </section>


    <!-- Filter & Search Section -->
    <section class="cities-filter">
      <div class="container">
        <div class="cities-filter-bar">
          <div class="cities-filter-title-wrap">
            <h2>{{ t('citiesPage.filterCities') }}</h2>
            <NuxtLink to="/" class="btn-back">
              <i class="fas fa-home"></i> <span>{{ dir === 'rtl' ? 'العودة للصفحة الرئيسية' : 'Return to Home' }}</span>
            </NuxtLink>
          </div>
          <div class="search-box cities-search-box">
            <input
              type="text"
              id="city-search-input"
              oninput="window.handleCitySearch && window.handleCitySearch()"
              :placeholder="t('citiesPage.searchPlaceholder')"
            />
            <i class="fas fa-search" />
          </div>
        </div>
        <div class="filter-options">
          <button
            v-for="filter in filters"
            :key="filter.value"
            class="filter-btn"
            :class="{ active: filter.value === 'all' }"
            :data-filter="filter.value"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- Cities List Section (shown when not viewing landmarks) -->
    <section class="cities-list">
      <div class="container">
        <div class="cities-grid-container">
          <div
            v-for="city in allCities"
            :key="city.key"
            class="city-box reveal"
            :data-category="city.category"
          >
            <div class="city-box-image" :style="`background-image: url('${city.image && city.image.startsWith('http') ? city.image : '/images/backgrounds/' + (city.image || 'yemen_pattern.jpg')}')`" />
            <div class="city-box-content">
              <h3>{{ city.name }}</h3>
              <p>{{ city.description }}</p>
            </div>
            <div class="city-box-footer">
              <span class="city-category">{{ city.categoryLabel }}</span>
              <button
                class="btn-small view-landmarks"
                :data-city="city.key"
              >
                {{ t('citiesPage.viewLandmarks') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Premium User Auth Modal for Map Viewing -->
    <div id="user-auth-modal" class="glass-modal-wrapper">
        <div class="glass-modal-bg" id="close-auth-overlay"></div>
        
        <div class="split-modal-content">
          <!-- Right side: Form -->
          <div class="modal-form-side">
             <button type="button" id="close-auth-modal" class="modal-close-btn"><i class="fas fa-times"></i></button>
             
             <div class="modal-brand">
               <div class="icon-glow"><i class="fas fa-map-marked-alt"></i></div>
               <h2>{{ t('citiesPage.explorationGateway') }}</h2>
               <p>{{ t('citiesPage.registerOnce') }}</p>
             </div>
             
             <form id="user-auth-form" class="modal-form">
               <div class="cool-input">
                 <i class="far fa-user"></i>
                 <input type="text" id="auth-name" :placeholder="t('citiesPage.namePlaceholder')" required />
               </div>
               <div class="cool-input">
                 <i class="fas fa-envelope"></i>
                 <input type="email" id="auth-email" :placeholder="t('citiesPage.emailPlaceholder')" required />
               </div>
               <button type="submit" class="cool-submit-btn">{{ t('citiesPage.goExplore') }} <i class="fas fa-rocket" style="margin-right: 10px;"></i></button>
             </form>
          </div>
          
          <!-- Left side: Image -->
          <div class="modal-image-side">
             <div class="image-overlay-text">
                <h3>{{ t('citiesPage.journeyStarts') }}<br>{{ t('citiesPage.fromHere') }}</h3>
             </div>
          </div>
        </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import arLocale from '~/locales/ar';
import enLocale from '~/locales/en';

const { t, dir, locale } = useLocale();

useHead({
  title: computed(() => t('citiesPage.seoTitle')),
  meta: [
    { name: "description", content: computed(() => t('citiesPage.seoDescription')) }
  ],
  link: [
    { rel: "stylesheet", href: "/css/landmarks-style.css" },
    { rel: "stylesheet", href: "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" }
  ],
  script: [
    {
      src: "https://maps.googleapis.com/maps/api/js?key=AIzaSyBNLrJhOMz6idD05pzwk17mcLQHNOMXGs0&callback=Function.prototype",
      defer: true
    }
  ],
  bodyAttrs: { class: "legacy-light legacy-cities" }
});

// Filter types
const filters = computed(() => [
  { value: "all", label: t('citiesPage.all') },
  { value: "historical", label: t('citiesPage.historical') },
  { value: "coastal", label: t('citiesPage.coastal') },
  { value: "mountain", label: t('citiesPage.mountain') },
  { value: "island", label: t('citiesPage.island') },
  { value: "desert", label: t('citiesPage.desert') }
]);

const api = useApi();
const { data: apiCitiesData } = useAsyncData(
  "public-cities",
  () => api.listCities({ per_page: 100 })
);

const cityKeys = ['sanaa', 'aden', 'taiz', 'hodeidah', 'mukalla', 'ibb', 'shibam', 'socotra', 'marib', 'dhamar', 'saada', 'seiyun', 'shihr', 'abean', 'hajjah', 'mahwit', 'bayda', 'amran', 'dhale', 'aljawf', 'lahij', 'shabwah', 'mahrah', 'hadibo'];
const cityImages: Record<string, string> = {
  sanaa: 'sanaa_city.jpg', aden: 'aden_city.jpg', taiz: 'taiz_city.jpg', hodeidah: 'al_hodeidah_city.jpg',
  mukalla: 'al_mukalla_city.jpg', ibb: 'ibb_city.jpg', shibam: 'shibam_city.jpg', socotra: 'socotra_island.jpg',
  marib: 'marib_city.jpg', dhamar: 'dhamar_city.jpg', saada: 'saada_city.jpg', seiyun: 'seiyun_city.jpg',
  shihr: 'al_shihr_city.jpg', abean: 'zinjibar_city.jpg', hajjah: 'hajjah_city.jpg', mahwit: 'al_mahwit_city.jpg',
  bayda: 'al_bayda_city.jpg', amran: 'amran_city.jpg', dhale: 'al_dhale_city.jpg', aljawf: 'al_hazm_city.jpg',
  lahij: 'lahij_city.jpg', shabwah: 'shabwah_city.jpg', mahrah: 'al_mahrah_city.jpg', hadibo: 'hadibo_city.jpg'
};
const cityCategories: Record<string, string> = {
  sanaa: 'historical mountain', aden: 'coastal historical', taiz: 'mountain historical', hodeidah: 'coastal',
  mukalla: 'coastal', ibb: 'mountain', shibam: 'historical desert', socotra: 'island',
  marib: 'historical desert', dhamar: 'historical mountain', saada: 'historical mountain', seiyun: 'historical desert',
  shihr: 'coastal', abean: 'coastal', hajjah: 'mountain', mahwit: 'mountain',
  bayda: 'mountain', amran: 'mountain historical', dhale: 'mountain', aljawf: 'desert',
  lahij: 'coastal', shabwah: 'desert', mahrah: 'coastal desert', hadibo: 'island coastal'
};

const legacyCities = computed(() => {
  const loc = locale.value === 'ar' ? arLocale : enLocale;
  return cityKeys.map(key => ({
    key,
    name: loc.legacyCities[key as keyof typeof loc.legacyCities]?.name || key,
    image: cityImages[key] || 'yemen_pattern.jpg',
    category: cityCategories[key] || 'general',
    categoryLabel: loc.legacyCities[key as keyof typeof loc.legacyCities]?.categoryLabel || key,
    description: loc.legacyCities[key as keyof typeof loc.legacyCities]?.description || ''
  }));
});

const allCities = computed(() => {
  const merged = JSON.parse(JSON.stringify(legacyCities.value));
  const apiCities = Array.isArray(apiCitiesData.value?.data) ? apiCitiesData.value.data : [];
  const isEn = locale.value === 'en';
  
  apiCities.forEach((apiCity: any) => {
    if (apiCity.status !== 'published') return;
      
    const exists = merged.find((c: any) => c.key === apiCity.slug);
    
    // Resolve localized name and description
    const localizedName = (isEn && apiCity.name_en) ? apiCity.name_en : apiCity.name;
    const localizedDesc = (isEn && apiCity.description_en) ? apiCity.description_en : apiCity.description;

    if (!exists) {
      merged.push({
        key: apiCity.slug,
        name: localizedName,
        image: apiCity.image_url || 'yemen_pattern.jpg',
        category: apiCity.category || 'general',
        categoryLabel: getCategoryLabel(apiCity.category || 'general'),
        description: localizedDesc || t('cityDetail.descriptionSoon')
      });
    } else {
        // Only overwrite if API provides a localized version or we are in Arabic
        if (apiCity.image_url) {
            exists.image = apiCity.image_url;
        }
        if (localizedDesc) {
            exists.description = localizedDesc;
        }
        if (localizedName) {
            exists.name = localizedName;
        }
        if (apiCity.category) {
            exists.category = apiCity.category;
            exists.categoryLabel = getCategoryLabel(apiCity.category);
        }
    }
  });

  return merged;
});

const getCategoryLabel = (category: string) => {
  const loc = locale.value === 'ar' ? arLocale : enLocale;
  const labels = loc.citiesPage.categoryLabels as Record<string, string>;
  
  // Handle combined categories like "historical mountain"
  if (category && category.includes(' ')) {
     return category.split(' ').map((c: string) => labels[c] || c).join(' / ');
  }
  
  return labels[category] || category;
};

// Sync API data with Legacy JS window object
watch([apiCitiesData, locale], ([newData, currentLocale]: [any, string]) => {
  if (typeof window === 'undefined') return;
  
  // Ensure the global object exists
  (window as any).__DYNAMIC_CITIES__ = {};
  
  const apiCities = Array.isArray(newData?.data) ? newData.data : [];
  const isEn = currentLocale === 'en';
  const fallbackEnData = (window as any).updatedLandmarksDataEn || {};
  const fallbackArData = (window as any).updatedLandmarksData || {};
  
  apiCities.forEach((city: any) => {
    if (city.status !== 'published') return;
    
    // Choose local fallback map for city based on slug
    const fallbackCity = isEn ? fallbackEnData[city.slug] : fallbackArData[city.slug];
    
    const resolveCityName = () => {
        if (isEn && city.name_en) return city.name_en;
        if (fallbackCity && fallbackCity.name) return fallbackCity.name;
        return city.name;
    };
    
    // Map api landmarks to expected legacy format
    const landmarks = Array.isArray(city.landmarks) ? city.landmarks.map((lm: any) => {
      // Find fallback landmark by external_id
      const fallbackLm = (fallbackCity && fallbackCity.landmarks) ? fallbackCity.landmarks.find((l: any) => l.id === lm.external_id) : null;
      
      let lmName = lm.name;
      let lmDesc = lm.description || '';
      let lmCategoryNames = lm.category_names || [t('citiesPage.general')];
      
      if (isEn) {
          if (lm.name_en) {
              lmName = lm.name_en;
          } else if (fallbackLm && fallbackLm.name) {
              lmName = fallbackLm.name;
          }
          
          if (lm.description_en) {
              lmDesc = lm.description_en;
          } else if (fallbackLm && fallbackLm.description) {
              lmDesc = fallbackLm.description;
          }
          
          if (fallbackLm && fallbackLm.categoryNames) {
              lmCategoryNames = fallbackLm.categoryNames;
          }
      } else {
          // Arabic
          if (fallbackLm && fallbackLm.name) lmName = fallbackLm.name;
          if (fallbackLm && fallbackLm.description) lmDesc = fallbackLm.description;
          if (fallbackLm && fallbackLm.categoryNames) lmCategoryNames = fallbackLm.categoryNames;
      }
        
      return {
          id: String(lm.id),
          name: lmName,
          description: lmDesc,
          categories: lm.categories || ['general'],
          categoryNames: lmCategoryNames,
          coordinates: { lat: lm.latitude || 0, lng: lm.longitude || 0 },
          googleMapsUrl: lm.google_maps_url || '',
          images: lm.images?.length ? lm.images : (fallbackLm ? fallbackLm.images : [])
      };
    }) : [];
    
    // Inject or update into safe dynamic property (using 'slug' as expected by button logic previously? Wait, we need to check button logic!)
    // Actually city map is matched by ID "1" or "sanaa", let's inject both ID and Slug to be perfectly safe
    const mappedPayload = {
      name: resolveCityName(),
      landmarks: landmarks
    };
    (window as any).__DYNAMIC_CITIES__[String(city.id)] = mappedPayload;
    (window as any).__DYNAMIC_CITIES__[city.slug] = mappedPayload;
  });
  
  // Re-bind listeners when list updates
  setTimeout(() => {
    if (typeof (window as any).initLandmarksView === 'function') {
      (window as any).initLandmarksView();
    }
  }, 300);
}, { immediate: true, deep: true });

// React to Sidebar clicks when already on this page
const route = useRoute();
watch(() => route.query.category, (newCategory: any) => {
  if (newCategory) {
    const btn = document.querySelector(`.filter-btn[data-filter="${newCategory}"]`) as HTMLElement;
    if (btn) btn.click();
  } else {
    // If we only cleared category, we should reset the filter if there's no view active
    const btn = document.querySelector(`.filter-btn[data-filter="all"]`) as HTMLElement;
    if (btn && !route.query.view) btn.click();
  }
});

watch(() => route.query.view, (newView: any) => {
  if (newView) {
    setTimeout(() => {
      const btn = document.querySelector(`.view-landmarks[data-city="${newView}"]`) as HTMLElement;
      if (btn) btn.click();
    }, 100);
  } else {
    // If view is cleared, assume user wants to go back to city list (if not already there)
    const backBtn = document.querySelector('.btn-back') as HTMLElement;
    if (backBtn) backBtn.click();
  }
});

onMounted(() => {
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('revealed');
        });
      },
      { threshold: 0.1 }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('revealed'));
  }

  const scriptsToLoad = [
    "/js/enhanced-script.js",
    "/js/complete-landmarks-data.js",
    "/js/updated-landmarks-data.js",      // Arabic data (always load)
    "/js/updated-landmarks-data-en.js",   // English data (always load)
    "/js/landmarks-view.js",
    "/js/map-fix.js",
    "/js/landmarks-images.js",
    "/js/auth-system.js"
  ];
  
  let loadedCount = 0;
  
  const initScripts = () => {
    // Re-initialize legacy scripts since Nuxt mounted the DOM dynamically
    if (typeof (window as any).initLandmarksView === 'function') {
      (window as any).initLandmarksView();
    }
    if (typeof (window as any).initCityFilters === 'function') {
      (window as any).initCityFilters();
      if (route.query.category) {
        setTimeout(() => {
          const btn = document.querySelector(`.filter-btn[data-filter="${route.query.category}"]`) as HTMLElement;
          if (btn) btn.click();
        }, 100);
      }
      if (route.query.view) {
        setTimeout(() => {
          const btn = document.querySelector(`.view-landmarks[data-city="${route.query.view}"]`) as HTMLElement;
          if (btn) btn.click();
        }, 300);
      }
    }
    if (typeof (window as any).initAuthSystem === 'function') {
      (window as any).initAuthSystem();
    }
    if (typeof (window as any).initMapFix === 'function') {
      (window as any).initMapFix();
    }
  };

  scriptsToLoad.forEach(src => {
    if (document.querySelector(`script[src="${src}"]`)) {
      loadedCount++;
      if (loadedCount === scriptsToLoad.length) {
        setTimeout(initScripts, 200);
      }
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.onload = () => {
      loadedCount++;
      if (loadedCount === scriptsToLoad.length) {
        setTimeout(initScripts, 200);
      }
    };
    script.onerror = () => {
      // Count even failed scripts to avoid hanging
      loadedCount++;
      if (loadedCount === scriptsToLoad.length) {
        setTimeout(initScripts, 200);
      }
    };
    document.body.appendChild(script);
  });
});
</script>

<style scoped>
.no-results {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--pt-text-muted, #888);
}
.no-results i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.4;
}
.no-results p {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

/* Split Modal Styles */
.glass-modal-wrapper {
  display: none; /* Controlled by JS: display: flex */
  position: fixed;
  inset: 0;
  z-index: 10000;
  align-items: center;
  justify-content: center;
}

.glass-modal-wrapper.active {
  display: flex;
}

.glass-modal-bg {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.85); /* dark blur overlay */
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  z-index: 1;
}

.split-modal-content {
  position: relative;
  z-index: 2;
  display: flex;
  width: 900px;
  max-width: 92vw;
  min-height: 520px;
  background: #0b1120;
  border-radius: 35px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05);
  animation: modalPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  direction: rtl;
  font-family: 'Tajawal', sans-serif;
}

@keyframes modalPopIn {
  0% { opacity: 0; transform: scale(0.9) translateY(30px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-form-side {
  flex: 1.1;
  padding: 50px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.modal-close-btn {
  position: absolute;
  top: 25px;
  left: 25px; /* RTL left */
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.3s;
  font-size: 1.2rem;
  z-index: 10;
}
.modal-close-btn:hover {
  background: rgba(239, 68, 68, 0.8);
  transform: rotate(90deg);
  border-color: rgba(239, 68, 68, 1);
}

.modal-brand {
  margin-bottom: 40px;
}
.icon-glow {
  width: 65px; height: 65px;
  background: linear-gradient(135deg, rgba(45, 212, 191, 0.15), rgba(20, 184, 166, 0.25));
  color: #4ade80;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin-bottom: 20px;
  box-shadow: 0 0 25px rgba(74, 222, 128, 0.2);
  border: 1px solid rgba(74, 222, 128, 0.3);
}
.modal-brand h2 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 10px;
}
.modal-brand p {
  color: rgba(255,255,255,0.6);
  font-size: 1.05rem;
  margin: 0;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cool-input {
  position: relative;
  background: #1e293b;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.05);
  transition: 0.3s;
}
.cool-input:focus-within {
  border-color: #4ade80;
  box-shadow: 0 0 0 4px rgba(74, 222, 128, 0.15);
  background: #253347;
}
.cool-input i {
  position: absolute;
  top: 50%;
  right: 20px; /* RTL right */
  transform: translateY(-50%);
  color: rgba(255,255,255,0.4);
  font-size: 1.2rem;
  transition: 0.3s;
}
.cool-input:focus-within i {
  color: #4ade80;
}
.cool-input input {
  width: 100%;
  padding: 18px 50px 18px 20px;
  background: transparent;
  border: none;
  color: #fff;
  font-family: inherit;
  outline: none;
  font-size: 1.1rem;
  box-sizing: border-box;
}
.cool-input input::placeholder {
  color: rgba(255,255,255,0.4);
}

.cool-submit-btn {
  width: 100%;
  background: #4ade80;
  color: #0b1120;
  border: none;
  padding: 18px;
  border-radius: 18px;
  font-size: 1.2rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: 0.3s;
  box-shadow: 0 10px 20px rgba(74, 222, 128, 0.2);
  margin-top: 10px;
}
.cool-submit-btn:hover {
  background: #22c55e;
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(34, 197, 94, 0.3);
}

.modal-image-side {
  flex: 1;
  background: url('/images/backgrounds/tree_bg.png') no-repeat center center / cover;
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 40px;
  box-shadow: inset 20px 0 50px rgba(0,0,0,0.8); /* shadow throwing into image from form */
}
.modal-image-side::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(11, 17, 32, 0.6) 0%, transparent 60%);
}
.image-overlay-text {
  position: relative;
  z-index: 2;
  border-right: 4px solid #4ade80;
  padding-right: 20px;
}
.image-overlay-text h3 {
  color: #fff;
  margin: 0 0 10px;
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 1.2;
  text-shadow: 0 4px 15px rgba(0,0,0,0.6);
}

@media (max-width: 768px) {
  .split-modal-content {
    flex-direction: column;
    max-width: 450px;
  }
  .modal-image-side {
    width: 100%;
    min-height: 250px;
    order: -1; /* image on top on mobile */
    box-shadow: inset 0 -20px 50px rgba(0,0,0,0.8);
  }
}
</style>
