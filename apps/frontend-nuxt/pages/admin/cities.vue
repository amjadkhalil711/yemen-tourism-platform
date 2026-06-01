<template>
  <div>
    <AdminPageHero
      kicker="إدارة المحتوى"
      title="إدارة المدن"
      description="إنشاء وتعديل وتنظيم سجلات المدن المنشورة على المنصة السياحية."
      legacy-href="/admin-dashboard.html"
      legacy-label="عرض لوحة التحكم السابقة"
    />

    <section class="flex flex-col lg:flex-row gap-8">
      <!-- Form Panel -->
      <article class="lg:w-[420px] shrink-0 bg-slate-800/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl p-6 overflow-hidden self-start sticky top-24">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
        <div class="relative z-10 flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <h2 class="text-xl font-extrabold tracking-tight flex items-center gap-3" style="background:linear-gradient(135deg,#FFE17D,#F0C84C,#D4A827);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="editingSlug ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'">
              <i class="fas" :class="editingSlug ? 'fa-pen' : 'fa-plus'"></i>
            </div>
            {{ editingSlug ? "تعديل بيانات المدينة" : "إضافة مدينة جديدة" }}
          </h2>
          <button v-if="editingSlug" type="button" class="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1" @click="resetForm">
             إلغاء <i class="fas fa-times"></i>
          </button>
        </div>

        <form ref="cityFormRef" class="relative z-10 space-y-5" novalidate @submit.prevent="saveCity">

          <!-- Language Tab Switcher -->
          <div class="flex rounded-xl overflow-hidden border border-white/10 mb-1">
            <button
              type="button"
              class="flex-1 py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2"
              :class="langTab === 'ar' ? 'bg-blue-500/20 text-blue-300 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'"
              @click="langTab = 'ar'"
            >
              <span>🇾🇪</span> العربية
            </button>
            <button
              type="button"
              class="flex-1 py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2"
              :class="langTab === 'en' ? 'bg-emerald-500/20 text-emerald-300 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'"
              @click="langTab = 'en'"
            >
              <span>🇬🇧</span> English
            </button>
          </div>

          <!-- Arabic Fields -->
          <template v-if="langTab === 'ar'">
            <label class="block">
              <span class="block text-sm font-medium text-slate-300 mb-1.5">اسم المدينة (عربي) <span class="text-red-400">*</span></span>
              <input
                v-model.trim="form.name"
                class="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                :class="fieldErrors.name ? 'focus:ring-red-500/50 border-red-500/50' : 'focus:ring-blue-500/50 hover:border-white/20'"
                type="text"
                placeholder="مثال: تعز"
                maxlength="255"
                dir="rtl"
                :aria-invalid="Boolean(fieldErrors.name)"
                :aria-describedby="fieldErrors.name ? 'city-name-error' : undefined"
                @blur="validateField('name')"
              />
              <p v-if="fieldErrors.name" id="city-name-error" class="mt-1.5 text-xs text-red-400 flex items-center gap-1"><i class="fas fa-exclamation-circle"></i> {{ fieldErrors.name }}</p>
            </label>
            <label class="block">
              <span class="block text-sm font-medium text-slate-300 mb-1.5">وصف المدينة (عربي)</span>
              <textarea
                v-model.trim="form.description"
                class="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/20 transition-all resize-none"
                rows="4"
                dir="rtl"
                placeholder="وصف جذاب للمدينة وتاريخها ومميزاتها..."
                maxlength="4000"
              ></textarea>
            </label>
          </template>

          <!-- English Fields -->
          <template v-if="langTab === 'en'">
            <label class="block">
              <span class="block text-sm font-bold text-emerald-300 mb-1.5">City Name (English)</span>
              <input
                v-model.trim="form.nameEn"
                class="w-full px-4 py-3 bg-slate-900/50 border border-emerald-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 hover:border-emerald-500/30 transition-all"
                type="text"
                placeholder="e.g. Taiz"
                maxlength="255"
                dir="ltr"
              />
            </label>
            <label class="block">
              <span class="block text-sm font-bold text-emerald-300 mb-1.5">City Description (English)</span>
              <textarea
                v-model.trim="form.descriptionEn"
                class="w-full px-4 py-3 bg-slate-900/50 border border-emerald-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 hover:border-emerald-500/30 transition-all resize-none"
                rows="4"
                dir="ltr"
                placeholder="An attractive description of the city, its history and features..."
                maxlength="4000"
              ></textarea>
            </label>
          </template>

          <!-- Always-visible fields (Slug, Status, Category, Image) -->
          <label class="block">
            <span class="block text-sm font-medium text-slate-300 mb-1.5">المُعرّف (Slug) <span class="text-red-400">*</span></span>
            <input
              v-model.trim="form.slug"
              class="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              :class="fieldErrors.slug ? 'focus:ring-red-500/50 border-red-500/50' : 'focus:ring-blue-500/50 hover:border-white/20'"
              type="text"
              placeholder="e.g. taiz"
              maxlength="255"
              dir="ltr"
              :aria-invalid="Boolean(fieldErrors.slug)"
              :aria-describedby="fieldErrors.slug ? 'city-slug-error' : undefined"
              @input="slugTouched = true"
              @blur="normalizeSlug(); validateField('slug')"
            />
            <p v-if="fieldErrors.slug" id="city-slug-error" class="mt-1.5 text-xs text-red-400 flex items-center gap-1"><i class="fas fa-exclamation-circle"></i> {{ fieldErrors.slug }}</p>
          </label>

          <div class="grid grid-cols-2 gap-4">
            <label class="block">
              <span class="block text-sm font-medium text-slate-300 mb-1.5">الحالة</span>
              <div class="relative">
                <select v-model="form.status" class="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/20 transition-all cursor-pointer">
                  <option value="draft">مسودة</option>
                  <option value="published">منشور</option>
                </select>
                <i class="fas fa-chevron-down absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </label>

            <label class="block">
              <span class="block text-sm font-medium text-slate-300 mb-1.5">التصنيف</span>
              <div class="relative">
                <select v-model="form.category" class="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/20 transition-all cursor-pointer">
                  <option value="">بدون تصنيف</option>
                  <option value="historical">تاريخية</option>
                  <option value="coastal">ساحلية</option>
                  <option value="mountain">جبلية</option>
                  <option value="island">جزيرة</option>
                  <option value="desert">صحراوية</option>
                  <option value="historical mountain">تاريخية جبلية</option>
                  <option value="historical desert">تاريخية صحراوية</option>
                  <option value="coastal historical">ساحلية تاريخية</option>
                  <option value="mountain historical">جبلية تاريخية</option>
                  <option value="island coastal">جزيرة ساحلية</option>
                  <option value="coastal desert">ساحلية صحراوية</option>
                </select>
                <i class="fas fa-chevron-down absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </label>
          </div>

          <label class="block">
            <span class="block text-sm font-medium text-slate-300 mb-1.5">رابط صورة المدينة</span>
            <input
              v-model.trim="form.imageUrl"
              class="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all hover:border-white/20 focus:ring-blue-500/50"
              type="url"
              dir="ltr"
              placeholder="https://example.com/city-image.jpg"
              maxlength="2048"
            />
            <p class="mt-1 text-xs text-slate-500">أدخل رابط URL مباشر لصورة المدينة (يُفضل بعرض 800+ بيكسل)</p>
          </label>

          <!-- Image Preview -->
          <div v-if="form.imageUrl && isValidUrl(form.imageUrl)" class="relative rounded-xl overflow-hidden border border-white/10 bg-slate-900/30">
            <img :src="form.imageUrl" alt="معاينة صورة المدينة" class="w-full h-40 object-cover" @error="imagePreviewError = true" @load="imagePreviewError = false" />
            <div v-if="imagePreviewError" class="absolute inset-0 flex items-center justify-center bg-slate-900/80">
              <p class="text-red-400 text-sm flex items-center gap-2"><i class="fas fa-exclamation-triangle"></i> تعذر تحميل الصورة</p>
            </div>
            <div v-else class="absolute bottom-2 right-2 bg-emerald-500/90 text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <i class="fas fa-check-circle"></i> صورة صالحة
            </div>
          </div>

          <div class="pt-2">
            <button type="submit" class="w-full py-3.5 rounded-xl font-bold text-slate-900 flex justify-center items-center gap-2 transition-all shadow-lg focus:outline-none focus:ring-2" :class="editingSlug ? 'bg-amber-400 hover:bg-amber-300 shadow-amber-500/20 focus:ring-amber-500/50' : 'bg-blue-400 hover:bg-blue-300 shadow-blue-500/20 focus:ring-blue-500/50'" :disabled="isSaving">
              <span v-if="isSaving"><i class="fas fa-circle-notch fa-spin"></i> جاري الحفظ...</span>
              <template v-else>
                <i class="fas" :class="editingSlug ? 'fa-save' : 'fa-check'"></i>
                <span>{{ editingSlug ? "تحديث التغييرات" : "حفظ المدينة" }}</span>
              </template>
            </button>
          </div>
        </form>

        <AdminStatusMessages :status-message="statusMessage" :error-message="errorMessage" status-id="city-form-status" error-id="city-form-error" class="mt-4" />
      </article>

      <!-- List Panel -->
      <article class="lg:flex-1 bg-slate-800/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl p-6 relative min-h-[500px]">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-xl font-extrabold text-white">سجلات المدن</h2>
            <p class="text-slate-400 text-sm mt-1">{{ resultsSummary }}</p>
          </div>
          <button type="button" class="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" :disabled="pending || isRefreshingList" @click="refreshList()">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': pending || isRefreshingList }"></i>
            {{ pending || isRefreshingList ? "جاري التحديث..." : "تحديث القائمة" }}
          </button>
        </div>

        <div class="relative mb-6">
          <label for="city-search-input" class="sr-only">البحث في المدن</label>
          <input
            id="city-search-input"
            v-model.trim="searchInput"
            class="w-full px-12 py-3.5 bg-slate-900/60 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            type="search"
            placeholder="ابحث عن مدينة بالاسم أو المُعرّف أو الحالة..."
          />
          <i class="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
        </div>

        <div v-if="pending && !hasLoadedSuccessfully" class="space-y-3">
          <div v-for="item in 5" :key="item" class="h-20 bg-slate-700/30 rounded-xl animate-pulse" aria-hidden="true" />
        </div>

        <AdminStatePanel
          v-else-if="error && !hasLoadedSuccessfully"
          title="تعذر تحميل بيانات المدن"
          description="حدث خطأ أثناء الاتصال. يرجى إعادة المحاولة."
          tone="error"
          title-tag="h3"
          class="my-8"
        >
          <template #actions>
            <button type="button" class="px-5 py-2.5 bg-red-500/20 text-red-500 font-medium rounded-xl hover:bg-red-500/30 transition-colors" @click="refreshList()">أعد المحاولة</button>
          </template>
        </AdminStatePanel>

        <div v-else-if="cities.length > 0" class="flex flex-col gap-3">
          <div v-for="city in cities" :key="city.id" class="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/30 border border-white/5 hover:bg-slate-700/30 hover:border-white/10 transition-all">
            <div class="flex items-center gap-4">
              <!-- City Image Thumbnail -->
              <div class="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-slate-800">
                <img v-if="city.image_url" :src="city.image_url" :alt="city.name" class="w-full h-full object-cover" @error="($event.target as HTMLImageElement).style.display='none'" />
                <div v-else class="w-full h-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <i class="fas fa-city text-xl"></i>
                </div>
              </div>
              <div>
                <p class="font-bold text-white text-lg">{{ city.name }}</p>
                <div class="flex flex-wrap items-center gap-2 lg:gap-3 text-xs md:text-sm text-slate-400 mt-1">
                  <span class="flex items-center gap-1"><i class="fas fa-link text-slate-500"></i> {{ city.slug }}</span>
                  <span class="w-1 h-1 rounded-full bg-slate-600"></span>
                  <span class="flex items-center gap-1"><i class="fas fa-map-pin text-slate-500"></i> {{ city.landmarks_count ?? 0 }} معلم</span>
                  <span class="w-1 h-1 rounded-full bg-slate-600"></span>
                  <span class="px-2 py-0.5 rounded border inline-flex items-center gap-1 font-medium text-xs" :class="city.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'">
                    <i class="fas" :class="city.status === 'published' ? 'fa-eye' : 'fa-eye-slash'"></i> {{ city.status === 'published' ? 'منشور' : 'مسودة' }}
                  </span>
                  <span v-if="city.category" class="px-2 py-0.5 rounded border inline-flex items-center gap-1 font-medium text-xs bg-blue-500/10 text-blue-300 border-blue-500/20">
                    <i class="fas fa-tag"></i> {{ getCategoryLabel(city.category) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <a :href="`/cities/${city.slug}`" target="_blank" class="w-10 h-10 rounded-lg bg-white/5 text-slate-300 hover:bg-blue-500 hover:text-white border border-white/5 hover:border-blue-400 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500" title="عرض الصفحة">
                <i class="fas fa-external-link-alt"></i>
              </a>
              <button type="button" class="w-10 h-10 rounded-lg bg-white/5 text-slate-300 hover:bg-amber-500 hover:text-slate-900 border border-white/5 hover:border-amber-400 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-500" title="تعديل" @click="loadForEdit(city)">
                <i class="fas fa-pen"></i>
              </button>
              <button type="button" class="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50" title="حذف" :disabled="deletingSlug === city.slug" @click="deleteCity(city)">
                <i class="fas" :class="deletingSlug === city.slug ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
              </button>
            </div>
          </div>
        </div>

        <AdminStatePanel
          v-else
          title="لا توجد مدن"
          description="لم يتم العثور على أي مدينة تطابق محددات البحث الخاصة بك."
          title-tag="h3"
          class="my-8"
        />

        <section v-if="lastPage > 1" class="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4" aria-label="Pagination">
          <p class="text-sm text-slate-400 font-medium">الصفحة <span class="text-white">{{ currentPage }}</span> من <span class="text-white">{{ lastPage }}</span> <span class="text-xs text-slate-500">({{ totalRecords }} إجمالي)</span></p>
          <div class="flex items-center gap-2">
            <button type="button" class="px-4 py-2 text-sm font-medium rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" :disabled="page >= lastPage || pending" @click="goToPage(page + 1)">
              التالية <i class="fas fa-chevron-left text-xs"></i>
            </button>
            <button type="button" class="px-4 py-2 text-sm font-medium rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" :disabled="page <= 1 || pending" @click="goToPage(page - 1)">
              <i class="fas fa-chevron-right text-xs"></i> السابقة
            </button>
          </div>
        </section>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { ApiCity, ApiPaginated } from "~/types/api";
import { focusFirstInvalidField } from "~/utils/form-accessibility";

type CityStatus = "draft" | "published";
type CityFormField = "name" | "slug";

interface CityFormState {
  name: string;
  nameEn: string;
  slug: string;
  status: CityStatus;
  category: string;
  description: string;
  descriptionEn: string;
  imageUrl: string;
}

const langTab = ref<'ar' | 'en'>('ar');

interface AdminCitiesResponse extends ApiPaginated<ApiCity> {
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  historical: "تاريخية",
  coastal: "ساحلية",
  mountain: "جبلية",
  island: "جزيرة",
  desert: "صحراوية",
  "historical mountain": "تاريخية جبلية",
  "historical desert": "تاريخية صحراوية",
  "coastal historical": "ساحلية تاريخية",
  "mountain historical": "جبلية تاريخية",
  "island coastal": "جزيرة ساحلية",
  "coastal desert": "ساحلية صحراوية",
};

const getCategoryLabel = (category: string): string => {
  return CATEGORY_LABELS[category] || category;
};

definePageMeta({
  layout: "admin",
  middleware: "admin"
});

useSeoMeta({
  title: "Admin Cities | Yemen Tourism",
  description: "Administrative city management for Yemen Tourism."
});

const api = useApi();
const { resolveApiErrorMessage } = useApiErrorMessage();
const { success: notifySuccess, error: notifyError } = useToast();
const { runRefreshWithFeedback } = useRefreshFeedback();
const searchInput = ref("");
const searchQuery = ref("");
const page = ref(1);
const perPage = 15;
const cityFormRef = ref<HTMLFormElement | null>(null);
const isSaving = ref(false);
const deletingSlug = ref<string | null>(null);
const editingSlug = ref<string | null>(null);
const slugTouched = ref(false);
const statusMessage = ref("");
const errorMessage = ref("");
const isRefreshingList = ref(false);
const hasLoadedSuccessfully = ref(false);
const imagePreviewError = ref(false);
const adminCitiesListRequest = {
  cacheTtlMs: 15_000,
  cancelPrevious: true,
  cancelKey: "admin-cities-list"
} as const;
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const emptyForm = (): CityFormState => ({
  name: "",
  nameEn: "",
  slug: "",
  status: "draft",
  category: "",
  description: "",
  descriptionEn: "",
  imageUrl: ""
});

const form = reactive<CityFormState>(emptyForm());

const fieldErrors = reactive<Record<CityFormField, string>>({
  name: "",
  slug: ""
});

const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const { data, pending, error, refresh } = useAsyncData<AdminCitiesResponse>(
  () => `admin-cities-list-${page.value}-${searchQuery.value}`,
  () =>
    api.listCities(
      {
        per_page: perPage,
        page: page.value,
        ...(searchQuery.value ? { q: searchQuery.value } : {})
      },
      adminCitiesListRequest
    ),
  {
    server: false,
    watch: [page, searchQuery],
    default: () => ({ data: [] })
  }
);

watch(
  [pending, error],
  ([isPending, currentError]) => {
    if (!isPending && !currentError) {
      hasLoadedSuccessfully.value = true;
    }
  },
  { immediate: true }
);

const cities = computed(() => {
  const list = Array.isArray(data.value?.data) ? data.value?.data : [];
  return list;
});

const currentPage = computed(() => {
  const metaValue = Number(data.value?.meta?.current_page ?? 0);
  const directValue = Number(data.value?.current_page ?? 0);
  return Math.max(metaValue || directValue || page.value, 1);
});

const lastPage = computed(() => {
  const metaValue = Number(data.value?.meta?.last_page ?? 0);
  const directValue = Number(data.value?.last_page ?? 0);
  return Math.max(metaValue || directValue || 1, 1);
});

const totalRecords = computed(() => {
  const metaValue = Number(data.value?.meta?.total ?? 0);
  const directValue = Number(data.value?.total ?? 0);
  return metaValue || directValue || cities.value.length;
});

const resultsSummary = computed(() => {
  if (searchQuery.value) {
    return `عرض ${cities.value.length} مدينة مطابقة. الإجمالي: ${totalRecords.value}.`;
  }

  return `عرض ${cities.value.length} مدينة في هذه الصفحة. الإجمالي: ${totalRecords.value}.`;
});

const goToPage = (nextPage: number) => {
  if (nextPage < 1 || nextPage > lastPage.value || nextPage === page.value) {
    return;
  }

  page.value = nextPage;
};

watch(searchInput, (value) => {
  if (searchDebounceTimer !== null) {
    clearTimeout(searchDebounceTimer);
  }

  searchDebounceTimer = setTimeout(() => {
    const normalizedSearchQuery = value.trim();
    if (normalizedSearchQuery === searchQuery.value) {
      return;
    }

    searchQuery.value = normalizedSearchQuery;
    page.value = 1;
  }, 250);
});

onBeforeUnmount(() => {
  if (searchDebounceTimer !== null) {
    clearTimeout(searchDebounceTimer);
  }
});

watch(
  () => form.name,
  (value) => {
    if (editingSlug.value || slugTouched.value) {
      return;
    }

    form.slug = slugify(value);
  }
);

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const normalizeSlug = () => {
  form.slug = slugify(form.slug);
};

const clearMessages = () => {
  statusMessage.value = "";
  errorMessage.value = "";
};

const resetForm = () => {
  Object.assign(form, emptyForm());
  editingSlug.value = null;
  slugTouched.value = false;
  langTab.value = 'ar';
  fieldErrors.name = "";
  fieldErrors.slug = "";
  imagePreviewError.value = false;
  clearMessages();
};

const validateField = (field: CityFormField): boolean => {
  fieldErrors[field] = "";
  const value = form[field].trim();

  if (field === "name" && value.length < 2) {
    fieldErrors.name = "اسم المدينة يجب أن يكون حرفين على الأقل.";
  }

  if (field === "slug") {
    if (value.length < 2) {
      fieldErrors.slug = "المُعرّف مطلوب (حرفين على الأقل).";
    } else if (!/^[a-z0-9-]+$/.test(value)) {
      fieldErrors.slug = "المُعرّف يقبل أحرف إنجليزية صغيرة وأرقام وشرطات فقط.";
    }
  }

  return !fieldErrors[field];
};

const validateAll = () => {
  normalizeSlug();
  return (["name", "slug"] as CityFormField[]).map((field) => validateField(field)).every(Boolean);
};

const loadForEdit = (city: ApiCity) => {
  clearMessages();
  editingSlug.value = city.slug;
  slugTouched.value = true;
  langTab.value = 'ar';
  form.name = city.name;
  form.nameEn = (city as any).name_en ?? "";
  form.slug = city.slug;
  form.status = city.status;
  form.category = city.category ?? "";
  form.description = city.description ?? "";
  form.descriptionEn = (city as any).description_en ?? "";
  form.imageUrl = city.image_url ?? "";
  imagePreviewError.value = false;

  // Scroll to form
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const saveCity = async () => {
  clearMessages();

  if (!validateAll()) {
    errorMessage.value = "يرجى تصحيح الأخطاء قبل الحفظ.";
    await nextTick();
    focusFirstInvalidField(cityFormRef.value);
    return;
  }

  isSaving.value = true;

  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    name_en: form.nameEn.trim() || null,
    slug: form.slug.trim(),
    status: form.status,
    description: form.description.trim() || null,
    description_en: form.descriptionEn.trim() || null,
    image_url: form.imageUrl.trim() || null,
    category: form.category || null
  };

  try {
    if (editingSlug.value) {
      await api.updateCity(editingSlug.value, payload);
      statusMessage.value = `تم تحديث المدينة "${form.name}" بنجاح.`;
    } else {
      await api.createCity(payload);
      statusMessage.value = `تم إنشاء المدينة "${form.name}" بنجاح.`;
    }

    notifySuccess(statusMessage.value);
    resetForm();
    await refresh();
  } catch (exception) {
    errorMessage.value = resolveApiErrorMessage(exception, {
      fallback: "فشل حفظ المدينة. يرجى إعادة المحاولة.",
      rateLimitMessage: "طلبات كثيرة جداً. يرجى الانتظار دقيقة ثم أعد المحاولة."
    });
    notifyError(errorMessage.value);
  } finally {
    isSaving.value = false;
  }
};

const deleteCity = async (city: ApiCity) => {
  clearMessages();

  const accepted = window.confirm(`هل تريد حذف المدينة "${city.name}"؟ هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع المعالم المرتبطة بها.`);
  if (!accepted) {
    return;
  }

  deletingSlug.value = city.slug;
  try {
    await api.deleteCity(city.slug);
    statusMessage.value = `تم حذف المدينة "${city.name}" بنجاح.`;
    notifySuccess(statusMessage.value);
    if (editingSlug.value === city.slug) {
      resetForm();
    }
    await refresh();
  } catch (exception) {
    errorMessage.value = resolveApiErrorMessage(exception, {
      fallback: "فشل حذف المدينة.",
      rateLimitMessage: "طلبات كثيرة جداً. يرجى الانتظار ثم أعد المحاولة."
    });
    notifyError(errorMessage.value);
  } finally {
    deletingSlug.value = null;
  }
};

const refreshList = async () => {
  if (isRefreshingList.value) {
    return;
  }

  isRefreshingList.value = true;

  try {
    const result = await runRefreshWithFeedback(refresh, {
      pendingError: error,
      fallback: "تعذر تحديث بيانات المدن.",
      successMessage: "تم تحديث قائمة المدن.",
      rateLimitMessage: "طلبات كثيرة. يرجى الانتظار ثم أعد المحاولة."
    });

    if (!result.ok) {
      errorMessage.value = result.message;
    }
  } finally {
    isRefreshingList.value = false;
  }
};
</script>
