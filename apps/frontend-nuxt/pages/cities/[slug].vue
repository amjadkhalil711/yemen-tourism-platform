<template>
  <div class="public-page city-details-page" :dir="dir">
    <section v-if="pending" class="surface-panel loading-panel">
      <div class="skeleton-block hero-skeleton" />
      <div class="skeleton-block body-skeleton" />
      <div class="skeleton-block body-skeleton" />
    </section>

    <PublicStatePanel
      v-else-if="loadError"
      :title="t('cityDetail.unableToLoad')"
      :description="t('cityDetail.unableToLoadDesc')"
      title-tag="h1"
      tone="error"
    >
      <template #actions>
        <button type="button" class="brand-btn brand-btn-ink compact-btn" @click="refresh()">{{ t('tryAgain') }}</button>
        <a href="/cities.html" class="text-link">{{ t('cityDetail.legacyExplorer') }}</a>
      </template>
    </PublicStatePanel>

    <PublicStatePanel
      v-else-if="!city"
      :title="t('cityDetail.cityNotFound')"
      :description="t('cityDetail.cityNotFoundDesc')"
      title-tag="h1"
    >
      <template #actions>
        <a href="/cities" class="text-link">{{ t('cityDetail.backToCities') }}</a>
      </template>
    </PublicStatePanel>

    <template v-else>
      <section class="brand-hero city-hero" :style="heroStyle">
        <p class="brand-kicker">{{ t('cityDetail.cityProfile') }}</p>
        <h1 class="brand-hero-title">{{ (locale === 'en' && city.name_en) ? city.name_en : city.name }}</h1>
        <p class="brand-hero-text">{{ (locale === 'en' && city.description_en) ? city.description_en : (city.description || t('cityDetail.descriptionSoon')) }}</p>
        <div class="hero-meta">
          <span class="meta-chip">{{ landmarks.length }} {{ t('cityDetail.landmarksCount') }}</span>
          <span class="meta-chip" :class="{ draft: city.status === 'draft' }">
            {{ city.status === "published" ? t('cityDetail.published') : t('cityDetail.draft') }}
          </span>
        </div>
      </section>

      <section class="surface-panel">
        <div class="section-head">
          <div class="section-heading">
            <h2 class="section-title">{{ t('cityDetail.landmarks') }}</h2>
            <p class="section-description">{{ t('cityDetail.exploreLandmarks') }} {{ city.name }}.</p>
          </div>
          <a href="/cities.html" class="text-link">{{ t('cityDetail.legacyExplorer') }}</a>
        </div>

        <p v-if="landmarks.length === 0" class="empty-copy">{{ t('cityDetail.noLandmarks') }}</p>

        <div v-else class="landmarks-grid">
          <article v-for="landmark in landmarks" :key="landmark.id" class="landmark-card">
            <div class="landmark-head">
              <h3>{{ (locale === 'en' && landmark.name_en) ? landmark.name_en : landmark.name }}</h3>
              <p v-if="landmark.category_names?.length" class="categories">{{ landmark.category_names.join(" | ") }}</p>
            </div>

            <p class="landmark-description">
              {{ (locale === 'en' && landmark.description_en) ? landmark.description_en : (landmark.description || t('cityDetail.landmarkDescSoon')) }}
            </p>

            <div class="landmark-actions">
              <a
                v-if="landmark.mapUrl && landmark.mapLabel"
                :href="landmark.mapUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-link"
              >
                {{ landmark.mapLabel }}
              </a>
            </div>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ApiCity, ApiLandmark } from "~/types/api";
import { toSafeExternalUrl } from "../../utils/safe-url.js";

interface ApiCityShowResponse {
  data?: ApiCity;
}

interface CityLandmarkViewModel extends ApiLandmark {
  mapUrl: string | null;
  mapLabel: string | null;
}

const { t, dir, locale } = useLocale();
const route = useRoute();
const api = useApi();
const { isAbortError } = useApiErrorMessage();

const citySlug = computed(() => String(route.params.slug ?? ""));
const cityDetailsRequestOptions = {
  cancelPrevious: true,
  cancelKey: "public-city-details-navigation",
  cacheTtlMs: 45_000
} as const;

const { data, pending, error, refresh } = useAsyncData<ApiCityShowResponse>(
  `city-details-${citySlug.value}`,
  () => api.getCityBySlug(citySlug.value, cityDetailsRequestOptions),
  {
    watch: [citySlug],
    default: () => ({ data: undefined })
  }
);

const loadError = computed(() => Boolean(error.value && !isAbortError(error.value)));

const city = computed(() => data.value?.data);
const buildCoordinatesUrl = (landmark: ApiLandmark): string | null => {
  if (landmark.latitude === null || landmark.longitude === null) {
    return null;
  }

  return `https://www.openstreetmap.org/?mlat=${landmark.latitude}&mlon=${landmark.longitude}#map=14/${landmark.latitude}/${landmark.longitude}`;
};

const landmarks = computed<CityLandmarkViewModel[]>(() => {
  return (city.value?.landmarks ?? [])
    .filter((landmark) => landmark.is_active)
    .map((landmark) => {
      const safeGoogleMapsUrl = toSafeExternalUrl(landmark.google_maps_url);
      const coordinatesUrl = buildCoordinatesUrl(landmark);

      return {
        ...landmark,
        mapUrl: safeGoogleMapsUrl ?? coordinatesUrl,
        mapLabel: safeGoogleMapsUrl ? t('cityDetail.openMap') : coordinatesUrl ? t('cityDetail.openCoordinates') : null
      };
    });
});

const heroStyle = computed(() => {
  if (city.value?.image_url) {
    return {
      backgroundImage: `linear-gradient(to bottom, rgba(13, 47, 77, 0.8), rgba(29, 87, 127, 0.9)), url('${city.value.image_url}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return {};
});

const cityEntityMappings: Record<string, { wikidata: string; wikipedia: string }> = {
  sanaa: {
    wikidata: "https://www.wikidata.org/wiki/Q2471",
    wikipedia: "https://en.wikipedia.org/wiki/Sana'a"
  },
  aden: {
    wikidata: "https://www.wikidata.org/wiki/Q122859",
    wikipedia: "https://en.wikipedia.org/wiki/Aden"
  },
  taiz: {
    wikidata: "https://www.wikidata.org/wiki/Q223707",
    wikipedia: "https://en.wikipedia.org/wiki/Taiz"
  },
  hodeidah: {
    wikidata: "https://www.wikidata.org/wiki/Q190223",
    wikipedia: "https://en.wikipedia.org/wiki/Al_Hudaydah"
  },
  mukalla: {
    wikidata: "https://www.wikidata.org/wiki/Q311309",
    wikipedia: "https://en.wikipedia.org/wiki/Al_Mukalla"
  },
  ibb: {
    wikidata: "https://www.wikidata.org/wiki/Q167389",
    wikipedia: "https://en.wikipedia.org/wiki/Ibb"
  },
  shibam: {
    wikidata: "https://www.wikidata.org/wiki/Q192265",
    wikipedia: "https://en.wikipedia.org/wiki/Shibam"
  },
  socotra: {
    wikidata: "https://www.wikidata.org/wiki/Q187071",
    wikipedia: "https://en.wikipedia.org/wiki/Socotra"
  },
  marib: {
    wikidata: "https://www.wikidata.org/wiki/Q216962",
    wikipedia: "https://en.wikipedia.org/wiki/Marib"
  },
  dhamar: {
    wikidata: "https://www.wikidata.org/wiki/Q272288",
    wikipedia: "https://en.wikipedia.org/wiki/Dhamar"
  },
  saada: {
    wikidata: "https://www.wikidata.org/wiki/Q686884",
    wikipedia: "https://en.wikipedia.org/wiki/Sa'dah"
  },
  seiyun: {
    wikidata: "https://www.wikidata.org/wiki/Q2424588",
    wikipedia: "https://en.wikipedia.org/wiki/Seiyun"
  },
  shihr: {
    wikidata: "https://www.wikidata.org/wiki/Q311307",
    wikipedia: "https://en.wikipedia.org/wiki/Al_Shihr"
  },
  abean: {
    wikidata: "https://www.wikidata.org/wiki/Q318431",
    wikipedia: "https://en.wikipedia.org/wiki/Abyan_Governorate"
  },
  hajjah: {
    wikidata: "https://www.wikidata.org/wiki/Q226999",
    wikipedia: "https://en.wikipedia.org/wiki/Hajjah"
  },
  mahwit: {
    wikidata: "https://www.wikidata.org/wiki/Q226938",
    wikipedia: "https://en.wikipedia.org/wiki/Al_Mahwit"
  },
  bayda: {
    wikidata: "https://www.wikidata.org/wiki/Q244222",
    wikipedia: "https://en.wikipedia.org/wiki/Al_Bayda,_Yemen"
  },
  amran: {
    wikidata: "https://www.wikidata.org/wiki/Q244318",
    wikipedia: "https://en.wikipedia.org/wiki/Amran"
  },
  dhale: {
    wikidata: "https://www.wikidata.org/wiki/Q244102",
    wikipedia: "https://en.wikipedia.org/wiki/Al_Dhale'e"
  },
  aljawf: {
    wikidata: "https://www.wikidata.org/wiki/Q318182",
    wikipedia: "https://en.wikipedia.org/wiki/Al_Jawf_Governorate"
  },
  lahij: {
    wikidata: "https://www.wikidata.org/wiki/Q244288",
    wikipedia: "https://en.wikipedia.org/wiki/Lahij_Governorate"
  },
  shabwah: {
    wikidata: "https://www.wikidata.org/wiki/Q318359",
    wikipedia: "https://en.wikipedia.org/wiki/Shabwah_Governorate"
  },
  mahrah: {
    wikidata: "https://www.wikidata.org/wiki/Q328120",
    wikipedia: "https://en.wikipedia.org/wiki/Al_Mahrah_Governorate"
  },
  hadibo: {
    wikidata: "https://www.wikidata.org/wiki/Q3506161",
    wikipedia: "https://en.wikipedia.org/wiki/Hadibu"
  }
};

const schemas = computed(() => {
  if (!city.value) return [];

  const siteUrl = "http://localhost:3000";
  const isEn = locale.value === 'en';
  const name = isEn && city.value.name_en ? city.value.name_en : city.value.name;
  const description = isEn && city.value.description_en ? city.value.description_en : (city.value.description || t('cityDetail.descriptionSoon'));

  const slug = citySlug.value.toLowerCase();
  const mapping = cityEntityMappings[slug];
  const sameAsLinks = ["https://en.wikipedia.org/wiki/Yemen"];
  if (mapping) {
    sameAsLinks.unshift(mapping.wikidata, mapping.wikipedia);
  }

  // Place schema
  const placeSchema: any = {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": `${siteUrl}/cities/${citySlug.value}#place`,
    "name": name,
    "description": description,
    "url": `${siteUrl}/cities/${citySlug.value}`,
    "sameAs": sameAsLinks,
    "hasMap": `https://www.openstreetmap.org/#map=12/15.3694/44.1910`
  };

  if (city.value.image_url) {
    placeSchema.image = city.value.image_url;
  }

  // Map landmarks to TouristAttractions
  if (landmarks.value.length > 0) {
    placeSchema.containsPlace = landmarks.value.map(lm => {
      const lmName = isEn && lm.name_en ? lm.name_en : lm.name;
      const lmDesc = isEn && lm.description_en ? lm.description_en : (lm.description || t('cityDetail.landmarkDescSoon'));

      const attraction: any = {
        "@type": "TouristAttraction",
        "@id": `${siteUrl}/cities/${citySlug.value}#landmark-${lm.id}`,
        "name": lmName,
        "description": lmDesc
      };

      if (lm.latitude !== null && lm.longitude !== null) {
        attraction.geo = {
          "@type": "GeoCoordinates",
          "latitude": lm.latitude,
          "longitude": lm.longitude
        };
        placeSchema.hasMap = `https://www.openstreetmap.org/?mlat=${lm.latitude}&mlon=${lm.longitude}#map=14/${lm.latitude}/${lm.longitude}`;
      }

      return attraction;
    });
  }

  return [placeSchema];
});

useSeoMeta({
  title: () => city.value?.name ? `${(locale.value === 'en' && city.value.name_en) ? city.value.name_en : city.value.name} | Yemen Tourism` : "City Details | Yemen Tourism",
  description: () => (locale.value === 'en' && city.value?.description_en) ? city.value.description_en : (city.value?.description ?? "Explore city details and landmarks from Yemen Tourism.")
});

useHead({
  script: computed(() => schemas.value.map(schema => ({
    type: "application/ld+json",
    children: JSON.stringify(schema)
  })))
});
</script>

<style scoped>
.city-details-page {
  gap: 1rem;
}

.loading-panel {
  display: grid;
  gap: 0.8rem;
}

.hero-skeleton {
  min-height: 108px;
}

.body-skeleton {
  min-height: 68px;
}

.city-hero {
  background:
    radial-gradient(circle at 12% 14%, rgba(199, 137, 47, 0.37), transparent 43%),
    linear-gradient(140deg, #0d2f4d, #1d577f 58%, #2e7ea7);
  background-size: cover;
  background-position: center;
}

.hero-meta {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.meta-chip {
  padding: 0.3rem 0.62rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.22);
  font-weight: 700;
  font-size: 0.84rem;
}

.meta-chip.draft {
  background: rgba(255, 183, 77, 0.2);
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.section-head .section-description {
  max-width: 58ch;
}

.landmarks-grid {
  margin-top: 0.9rem;
  display: grid;
  gap: 0.8rem;
}

.landmark-card {
  background: #fff;
  border: 1px solid rgba(12, 42, 69, 0.12);
  border-radius: 0.9rem;
  padding: 0.9rem;
  display: grid;
  gap: 0.55rem;
}

.landmark-head h3 {
  margin: 0;
  color: #133553;
}

.categories {
  margin: 0.25rem 0 0;
  color: #4f6982;
  font-size: 0.86rem;
}

.landmark-description {
  margin: 0;
  color: #2b4b68;
  line-height: 1.7;
}

.landmark-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.compact-btn {
  min-height: 42px;
  padding: 0.54rem 1rem;
}

.empty-copy {
  margin: 0.55rem 0 0;
  color: var(--ink-muted);
}

@media (min-width: 900px) {
  .landmarks-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
