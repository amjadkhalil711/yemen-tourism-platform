import arLocale from '~/locales/ar';
import enLocale from '~/locales/en';

type Locale = 'ar' | 'en';

const translations: Record<Locale, any> = { ar: arLocale, en: enLocale };

// Shared reactive state across the app
const currentLocale = ref<Locale>('ar');

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : path), obj);
}

export const useLocale = () => {
  const locale = currentLocale;

  const dir = computed(() => locale.value === 'ar' ? 'rtl' : 'ltr');
  const isRtl = computed(() => locale.value === 'ar');

  const t = (key: string): string => {
    return getNestedValue(translations[locale.value], key) || key;
  };

  const setLocale = (lang: Locale) => {
    locale.value = lang;
    if (import.meta.client) {
      localStorage.setItem('yemen_locale', lang);
      document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', lang);
      // Force legacy landmarks-view.js to rebuild its DOM with the new locale
      const lmContainer = document.getElementById('landmarks-container');
      let wasActive = false;
      let activeCityId: string | null = null;

      if (lmContainer) {
        wasActive = lmContainer.style.display === 'block';
        activeCityId = (window as any).currentActiveCityId;

        lmContainer.remove();
        if (typeof (window as any).initLandmarksView === 'function') {
          (window as any).initLandmarksView();
        }

        // Restore view state
        if (wasActive && activeCityId) {
          // Reopen the city landmarks seamlessly
          setTimeout(() => {
            const overlay = document.getElementById('city-magic-overlay');
            if (overlay) overlay.style.display = 'none'; // skip animation for smooth transition

            const btn = document.querySelector(`.view-landmarks[data-city="${activeCityId}"]`) as HTMLElement;
            if (btn) btn.click();

            setTimeout(() => {
              const cleanupOverlay = document.getElementById('city-magic-overlay');
              if (cleanupOverlay) {
                cleanupOverlay.classList.remove('active');
                cleanupOverlay.style.display = '';
              }
            }, 100);
          }, 50);
        } else {
          // Make sure the main city listing is shown
          const citiesList = document.querySelector('.cities-list') as HTMLElement;
          if (citiesList) citiesList.style.display = 'block';
        }
      }
    }
  };

  const toggleLocale = () => {
    setLocale(locale.value === 'ar' ? 'en' : 'ar');
  };

  // Initialize from storage on client
  if (import.meta.client) {
    const saved = localStorage.getItem('yemen_locale') as Locale | null;
    if (saved && (saved === 'ar' || saved === 'en')) {
      locale.value = saved;
    }
    document.documentElement.setAttribute('dir', locale.value === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', locale.value);
  }

  return {
    locale,
    dir,
    isRtl,
    t,
    setLocale,
    toggleLocale
  };
};
