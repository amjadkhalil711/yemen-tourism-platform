<template>
  <div>
    <AdminPageHero
      kicker="إدارة المحتوى"
      title="إدارة المعالم السياحية"
      description="إضافة وتعديل المعالم، تصنيفاتها، ومعلوماتها الجغرافية التفصيلية للخرائط."
      legacy-href="/admin-dashboard.html"
      legacy-label="عرض لوحة التحكم السابقة"
    />

    <section class="flex flex-col lg:flex-row gap-8">
      <!-- Form Panel -->
      <article class="lg:w-1/3 shrink-0 bg-slate-800/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl p-6 relative lg:sticky lg:top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <div class="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 pointer-events-none"></div>
        <div class="relative z-10 flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <h2 class="text-xl font-extrabold tracking-tight flex items-center gap-3" style="background:linear-gradient(135deg,#FFE17D,#F0C84C,#D4A827);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="editingId ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'">
              <i class="fas" :class="editingId ? 'fa-pen' : 'fa-plus'"></i>
            </div>
            {{ editingId ? "تعديل بيانات المعلم" : "إضافة معلم جديد" }}
          </h2>
          <button v-if="editingId" type="button" class="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1" @click="resetForm">
             إلغاء <i class="fas fa-times"></i>
          </button>
        </div>

        <form ref="landmarkFormRef" class="relative z-10 space-y-5" novalidate @submit.prevent="saveLandmark">
          <label class="block">
            <span class="block text-sm font-medium text-slate-300 mb-1.5">المدينة</span>
            <div class="relative">
              <select
                v-model="form.cityId"
                class="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/20 transition-all cursor-pointer disabled:opacity-50"
                :class="fieldErrors.cityId ? 'focus:ring-red-500/50 border-red-500/50' : 'focus:ring-blue-500/50 hover:border-white/20'"
                :disabled="citiesPending || cities.length === 0"
                :aria-invalid="Boolean(fieldErrors.cityId)"
                :aria-describedby="fieldErrors.cityId ? 'landmark-city-error' : undefined"
                @blur="validateField('cityId')"
              >
                <option value="">اختر المدينة</option>
                <option v-for="city in cities" :key="city.id" :value="String(city.id)">{{ city.name }}</option>
              </select>
              <i class="fas fa-chevron-down absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
            </div>
            <p v-if="fieldErrors.cityId" id="landmark-city-error" class="mt-1.5 text-xs text-red-400 flex items-center gap-1"><i class="fas fa-exclamation-circle"></i> {{ fieldErrors.cityId }}</p>
          </label>

          <!-- Language Tab Switcher -->
          <div class="flex rounded-xl overflow-hidden border border-white/10">
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

          <!-- Arabic name & description -->
          <template v-if="langTab === 'ar'">
            <label class="block">
              <span class="block text-sm font-medium text-slate-300 mb-1.5">اسم المعلم (عربي) <span class="text-red-400">*</span></span>
              <input
                v-model.trim="form.name"
                class="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all"
                :class="fieldErrors.name ? 'focus:ring-2 focus:ring-red-500/50 border-red-500/50' : 'focus:ring-2 focus:ring-blue-500/50 hover:border-white/20'"
                type="text"
                placeholder="مثال: قلعة القاهرة"
                maxlength="255"
                dir="rtl"
                :aria-invalid="Boolean(fieldErrors.name)"
                :aria-describedby="fieldErrors.name ? 'landmark-name-error' : undefined"
                @blur="validateField('name')"
              />
              <p v-if="fieldErrors.name" id="landmark-name-error" class="mt-1.5 text-xs text-red-400 flex items-center gap-1"><i class="fas fa-exclamation-circle"></i> {{ fieldErrors.name }}</p>
            </label>
            <label class="block">
              <span class="block text-sm font-medium text-slate-300 mb-1.5">الوصف (عربي)</span>
              <textarea
                v-model.trim="form.description"
                class="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/20 transition-all resize-none"
                rows="3"
                dir="rtl"
                placeholder="اكتب وصفاً جذاباً للمعلم..."
                maxlength="4000"
              ></textarea>
            </label>
          </template>

          <!-- English name & description -->
          <template v-if="langTab === 'en'">
            <label class="block">
              <span class="block text-sm font-bold text-emerald-300 mb-1.5">Landmark Name (English) <span class="text-red-400">*</span></span>
              <input
                v-model.trim="form.nameEn"
                class="w-full px-4 py-3 bg-slate-900/50 border border-emerald-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 hover:border-emerald-500/30 transition-all"
                type="text"
                placeholder="e.g. Cairo Citadel"
                maxlength="255"
                dir="ltr"
              />
            </label>
            <label class="block">
              <span class="block text-sm font-bold text-emerald-300 mb-1.5">Description (English)</span>
              <textarea
                v-model.trim="form.descriptionEn"
                class="w-full px-4 py-3 bg-slate-900/50 border border-emerald-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 hover:border-emerald-500/30 transition-all resize-none"
                rows="3"
                dir="ltr"
                placeholder="Write an attractive description of the landmark..."
                maxlength="4000"
              ></textarea>
            </label>
          </template>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="block">
              <span class="block text-sm font-medium text-slate-300 mb-1.5">الكلمات الدالة (فواصل)</span>
              <input v-model.trim="form.categoriesCsv" class="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/20 transition-all text-sm" type="text" placeholder="historical, cultural" dir="ltr" />
            </label>

            <label class="block">
              <span class="block text-sm font-medium text-slate-300 mb-1.5">التصنيفات النصية (فواصل)</span>
              <input v-model.trim="form.categoryNamesCsv" class="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/20 transition-all text-sm" type="text" placeholder="تاريخي, ثقافي" />
            </label>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="block">
              <span class="block text-sm font-medium text-slate-300 mb-1.5">خط العرض (Latitude)</span>
              <input
                v-model.trim="form.latitude"
                class="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all text-left dir-ltr"
                :class="fieldErrors.latitude ? 'focus:ring-2 focus:ring-red-500/50 border-red-500/50' : 'focus:ring-2 focus:ring-blue-500/50 hover:border-white/20'"
                type="number"
                step="any"
                placeholder="15.3694"
                :aria-invalid="Boolean(fieldErrors.latitude)"
                :aria-describedby="fieldErrors.latitude ? 'landmark-latitude-error' : undefined"
                @blur="validateField('latitude')"
              />
              <p v-if="fieldErrors.latitude" id="landmark-latitude-error" class="mt-1.5 text-xs text-red-400 flex items-center gap-1"><i class="fas fa-exclamation-circle"></i> {{ fieldErrors.latitude }}</p>
            </label>
            <label class="block">
              <span class="block text-sm font-medium text-slate-300 mb-1.5">خط الطول (Longitude)</span>
              <input
                v-model.trim="form.longitude"
                class="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all text-left dir-ltr"
                :class="fieldErrors.longitude ? 'focus:ring-2 focus:ring-red-500/50 border-red-500/50' : 'focus:ring-2 focus:ring-blue-500/50 hover:border-white/20'"
                type="number"
                step="any"
                placeholder="44.1910"
                :aria-invalid="Boolean(fieldErrors.longitude)"
                :aria-describedby="fieldErrors.longitude ? 'landmark-longitude-error' : undefined"
                @blur="validateField('longitude')"
              />
              <p v-if="fieldErrors.longitude" id="landmark-longitude-error" class="mt-1.5 text-xs text-red-400 flex items-center gap-1"><i class="fas fa-exclamation-circle"></i> {{ fieldErrors.longitude }}</p>
            </label>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="block">
              <span class="block text-sm font-medium text-slate-300 mb-1.5">ترتيب العرض (Sort)</span>
              <input
                v-model.trim="form.sortOrder"
                class="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all text-left dir-ltr"
                :class="fieldErrors.sortOrder ? 'focus:ring-2 focus:ring-red-500/50 border-red-500/50' : 'focus:ring-2 focus:ring-blue-500/50 hover:border-white/20'"
                type="number"
                min="1"
                step="1"
                placeholder="999"
                :aria-invalid="Boolean(fieldErrors.sortOrder)"
                :aria-describedby="fieldErrors.sortOrder ? 'landmark-sort-order-error' : undefined"
                @blur="validateField('sortOrder')"
              />
              <p v-if="fieldErrors.sortOrder" id="landmark-sort-order-error" class="mt-1.5 text-xs text-red-400 flex items-center gap-1"><i class="fas fa-exclamation-circle"></i> {{ fieldErrors.sortOrder }}</p>
            </label>
            <div class="block">
              <span class="block text-sm font-medium text-slate-300 mb-1.5">نشط</span>
              <label class="flex items-center justify-between px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-all">
                <span class="text-sm text-white font-medium">{{ form.isActive ? 'مفعل' : 'معطل' }}</span>
                <div class="relative inline-flex items-center cursor-pointer">
                  <input v-model="form.isActive" type="checkbox" class="sr-only peer" />
                  <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </div>
              </label>
            </div>
          </div>

          <label class="block">
            <span class="block text-sm font-medium text-slate-300 mb-1.5">رابط خرائط جوجل (إختياري)</span>
            <input
              v-model.trim="form.googleMapsUrl"
              class="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all text-left dir-ltr"
              :class="fieldErrors.googleMapsUrl ? 'focus:ring-2 focus:ring-red-500/50 border-red-500/50' : 'focus:ring-2 focus:ring-blue-500/50 hover:border-white/20'"
              type="url"
              maxlength="2048"
              placeholder="https://maps.google.com/..."
              :aria-invalid="Boolean(fieldErrors.googleMapsUrl)"
              :aria-describedby="fieldErrors.googleMapsUrl ? 'landmark-maps-url-error' : undefined"
              @blur="validateField('googleMapsUrl')"
            />
            <p v-if="fieldErrors.googleMapsUrl" id="landmark-maps-url-error" class="mt-1.5 text-xs text-red-400 flex items-center gap-1"><i class="fas fa-exclamation-circle"></i> {{ fieldErrors.googleMapsUrl }}</p>
          </label>

          <label class="block">
            <span class="block text-sm font-medium text-slate-300 mb-1.5">الصور (روابط مفصولة بفواصل)</span>
            <input
              v-model.trim="form.imagesCsv"
              class="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all text-left dir-ltr hover:border-white/20 focus:ring-2 focus:ring-blue-500/50"
              type="text"
              placeholder="https://example.com/1.jpg, https://example.com/2.png"
            />
          </label>

          <!-- Image Preview -->
          <div v-if="firstImageUrl" class="relative rounded-xl overflow-hidden border border-white/10 bg-slate-900/30">
            <img :src="firstImageUrl" alt="معاينة صورة المعلم" class="w-full h-40 object-cover" @error="imagePreviewError = true" @load="imagePreviewError = false" />
            <div v-if="imagePreviewError" class="absolute inset-0 flex items-center justify-center bg-slate-900/80">
              <p class="text-red-400 text-sm flex items-center gap-2"><i class="fas fa-exclamation-triangle"></i> تعذر تحميل الصورة الأولى</p>
            </div>
            <div v-else class="absolute bottom-2 right-2 bg-emerald-500/90 text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <i class="fas fa-check-circle"></i> صورة صالحة
            </div>
          </div>

          <div class="pt-2">
            <button type="submit" class="w-full py-3.5 rounded-xl font-bold text-slate-900 flex justify-center items-center gap-2 transition-all shadow-lg focus:outline-none focus:ring-2" :class="editingId ? 'bg-amber-400 hover:bg-amber-300 shadow-amber-500/20 focus:ring-amber-500/50' : 'bg-blue-400 hover:bg-blue-300 shadow-blue-500/20 focus:ring-blue-500/50'" :disabled="isSaving">
              <span v-if="isSaving"><i class="fas fa-circle-notch fa-spin"></i> جاري الحفظ...</span>
              <template v-else>
                <i class="fas" :class="editingId ? 'fa-save' : 'fa-check'"></i>
                <span>{{ editingId ? "تحديث التغييرات" : "حفظ المعلم" }}</span>
              </template>
            </button>
          </div>
        </form>

        <AdminStatusMessages :status-message="statusMessage" :error-message="errorMessage" status-id="landmark-form-status" error-id="landmark-form-error" class="mt-4" />
      </article>

      <!-- List Panel -->
      <article class="lg:w-2/3 bg-slate-800/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl p-6 relative min-h-[500px]">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-xl font-extrabold text-white">سجلات المعالم</h2>
            <p class="text-slate-400 text-sm mt-1">{{ resultsSummary }}</p>
          </div>
          <button type="button" class="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" :disabled="landmarksPending || isRefreshingAll" @click="refreshAll()">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': landmarksPending || isRefreshingAll }"></i>
            {{ landmarksPending || isRefreshingAll ? "جاري التحديث..." : "تحديث القائمة" }}
          </button>
        </div>

        <div class="relative mb-6">
          <label for="landmark-search-input" class="sr-only">البحث في المعالم</label>
          <input
            id="landmark-search-input"
            v-model.trim="searchInput"
            class="w-full px-12 py-3.5 bg-slate-900/60 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            type="search"
            placeholder="ابحث عن معلم بالاسم، والتصنيف..."
          />
          <i class="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
        </div>

        <div v-if="landmarksPending && !hasLoadedSuccessfully" class="space-y-3">
          <div v-for="item in 6" :key="item" class="h-20 bg-slate-700/30 rounded-xl animate-pulse" aria-hidden="true" />
        </div>

        <AdminStatePanel
          v-else-if="landmarksError && !hasLoadedSuccessfully"
          title="تعذر تحميل بيانات المعالم"
          description="حدث خطأ أثناء الاتصال. يرجى إعادة المحاولة."
          tone="error"
          title-tag="h3"
          class="my-8"
        >
          <template #actions>
            <button type="button" class="px-5 py-2.5 bg-red-500/20 text-red-500 font-medium rounded-xl hover:bg-red-500/30 transition-colors" @click="refreshAll()">أعد المحاولة</button>
          </template>
        </AdminStatePanel>

        <div v-else-if="landmarks.length > 0" class="flex flex-col gap-3">
          <div v-for="landmark in landmarks" :key="landmark.id" class="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/30 border border-white/5 hover:bg-slate-700/30 hover:border-white/10 transition-all">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-slate-800">
                <img v-if="landmark.images && landmark.images.length > 0" :src="landmark.images[0]" :alt="landmark.name" class="w-full h-full object-cover" @error="($event.target as HTMLImageElement).style.display='none'" />
                <div v-else class="w-full h-full bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <i class="fas fa-map-marked-alt text-xl"></i>
                </div>
              </div>
              <div>
                <p class="font-bold text-white text-lg leading-tight">{{ landmark.name }}</p>
                <div class="flex flex-wrap items-center gap-2 lg:gap-3 text-xs md:text-sm text-slate-400 mt-1.5">
                  <span class="flex items-center gap-1 font-semibold text-blue-300"><i class="fas fa-city"></i> {{ landmark.city?.name || "مدينة مجهولة" }}</span>
                  <span class="w-1 h-1 rounded-full bg-slate-600"></span>
                  <span class="flex items-center gap-1"><i class="fas fa-tags text-slate-500"></i> {{ landmark.category_names.join("، ") || "بدون تصنيف" }}</span>
                  <span class="w-1 h-1 rounded-full bg-slate-600"></span>
                  <span class="px-2 py-0.5 rounded border inline-flex items-center gap-1 font-medium text-xs" :class="landmark.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'">
                    <i class="fas" :class="landmark.is_active ? 'fa-check' : 'fa-minus'"></i> {{ landmark.is_active ? 'نشط' : 'غير نشط' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button type="button" class="w-10 h-10 rounded-lg bg-white/5 text-slate-300 hover:bg-amber-500 hover:text-slate-900 hover:border-amber-400 border border-white/5 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-500" title="تعديل" @click="loadForEdit(landmark)">
                <i class="fas fa-pen"></i>
              </button>
              <button type="button" class="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50" title="حذف" :disabled="deletingId === landmark.id" @click="deleteLandmark(landmark)">
                <i class="fas" :class="deletingId === landmark.id ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
              </button>
            </div>
          </div>
        </div>

        <AdminStatePanel
          v-else
          title="لا توجد معالم"
          description="لم يتم العثور على أي معلم سياحي يطابق محددات البحث الخاصة بك."
          title-tag="h3"
          class="my-8"
        />

        <section v-if="lastPage > 1" class="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4" aria-label="Pagination">
          <p class="text-sm text-slate-400 font-medium">الصفحة <span class="text-white">{{ currentPage }}</span> من <span class="text-white">{{ lastPage }}</span> <span class="text-xs text-slate-500">({{ totalRecords }} إجمالي)</span></p>
          <div class="flex items-center gap-2">
            <!-- Notice rtl logic: Next is left, Previous is right usually -->
            <button type="button" class="px-4 py-2 text-sm font-medium rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" :disabled="page >= lastPage || landmarksPending" @click="goToPage(page + 1)">
              التالية <i class="fas fa-chevron-left text-xs"></i>
            </button>
            <button type="button" class="px-4 py-2 text-sm font-medium rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" :disabled="page <= 1 || landmarksPending" @click="goToPage(page - 1)">
              <i class="fas fa-chevron-right text-xs"></i> السابقة
            </button>
          </div>
        </section>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { ApiCity, ApiLandmark, ApiPaginated } from "~/types/api";
import {
  parseLandmarkLatitude,
  parseLandmarkLongitude,
  parseLandmarkSortOrder,
  parseOptionalGoogleMapsUrl
} from "~/utils/landmark-form";
import { focusFirstInvalidField } from "~/utils/form-accessibility";

type LandmarkField = "cityId" | "name" | "latitude" | "longitude" | "sortOrder" | "googleMapsUrl";

interface LandmarkFormState {
  cityId: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  categoriesCsv: string;
  categoryNamesCsv: string;
  latitude: string;
  longitude: string;
  googleMapsUrl: string;
  imagesCsv: string;
  sortOrder: string;
  isActive: boolean;
}

const langTab = ref<'ar' | 'en'>('ar');

interface AdminLandmarksResponse extends ApiPaginated<ApiLandmark> {
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
}

interface AdminCityOptionsResponse extends ApiPaginated<ApiCity> {
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
}

definePageMeta({
  layout: "admin",
  middleware: "admin"
});

useSeoMeta({
  title: "Admin Landmarks | Yemen Tourism",
  description: "Administrative landmark management for Yemen Tourism."
});

const api = useApi();
const { resolveApiErrorMessage } = useApiErrorMessage();
const { success: notifySuccess, error: notifyError } = useToast();
const { runRefreshWithFeedback } = useRefreshFeedback();
const cityOptionsPerPage = 100;
const adminCityOptionsCacheTtlMs = 5 * 60_000;
const searchInput = ref("");
const searchQuery = ref("");
const page = ref(1);
const perPage = 15;
const landmarkFormRef = ref<HTMLFormElement | null>(null);
const editingId = ref<number | null>(null);
const deletingId = ref<number | null>(null);
const isSaving = ref(false);
const statusMessage = ref("");
const errorMessage = ref("");
const isRefreshingAll = ref(false);
const hasLoadedSuccessfully = ref(false);
const imagePreviewError = ref(false);
const adminCityOptionsCache = useState<ApiCity[]>("admin-city-options-cache", () => []);
const adminCityOptionsCacheTimestamp = useState<number>("admin-city-options-cache-ts", () => 0);
const adminCityOptionsRequest = {
  cacheTtlMs: 60_000
} as const;
const adminLandmarksListRequest = {
  cacheTtlMs: 15_000,
  cancelPrevious: true,
  cancelKey: "admin-landmarks-list"
} as const;
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const blankForm = (): LandmarkFormState => ({
  cityId: "",
  name: "",
  nameEn: "",
  description: "",
  descriptionEn: "",
  categoriesCsv: "",
  categoryNamesCsv: "",
  latitude: "",
  longitude: "",
  googleMapsUrl: "",
  imagesCsv: "",
  sortOrder: "999",
  isActive: true
});

const form = reactive<LandmarkFormState>(blankForm());

const fieldErrors = reactive<Record<LandmarkField, string>>({
  cityId: "",
  name: "",
  latitude: "",
  longitude: "",
  sortOrder: "",
  googleMapsUrl: ""
});

const {
  data: citiesData,
  pending: citiesPending,
  refresh: refreshCities
} = useAsyncData<AdminCityOptionsResponse>(
  "admin-city-options",
  async () => {
    const now = Date.now();
    const hasFreshCachedCityOptions =
      adminCityOptionsCache.value.length > 0 &&
      now - adminCityOptionsCacheTimestamp.value < adminCityOptionsCacheTtlMs;

    if (hasFreshCachedCityOptions) {
      return {
        data: adminCityOptionsCache.value,
        current_page: 1,
        last_page: 1,
        per_page: adminCityOptionsCache.value.length,
        total: adminCityOptionsCache.value.length
      };
    }

    const mergedCitiesById = new Map<number, ApiCity>();
    let nextPage = 1;
    let lastPage = 1;

    while (nextPage <= lastPage) {
      const response = await api.listCities(
        {
          per_page: cityOptionsPerPage,
          page: nextPage
        },
        adminCityOptionsRequest
      );

      for (const city of Array.isArray(response.data) ? response.data : []) {
        mergedCitiesById.set(city.id, city);
      }

      const metaLastPage = Number((response as AdminCityOptionsResponse).meta?.last_page ?? 0);
      const directLastPage = Number(response.last_page ?? 0);
      lastPage = Math.max(metaLastPage || directLastPage || nextPage, nextPage);
      nextPage += 1;
    }

    const mergedCities = Array.from(mergedCitiesById.values());
    adminCityOptionsCache.value = mergedCities;
    adminCityOptionsCacheTimestamp.value = Date.now();

    return {
      data: mergedCities,
      current_page: 1,
      last_page: 1,
      per_page: mergedCities.length,
      total: mergedCities.length
    };
  },
  {
    server: false,
    default: () => ({ data: [] })
  }
);

const {
  data: landmarksData,
  pending: landmarksPending,
  error: landmarksError,
  refresh: refreshLandmarks
} = useAsyncData<AdminLandmarksResponse>(
  () => `admin-landmarks-list-${page.value}-${searchQuery.value}`,
  () =>
    api.adminListLandmarks(
      {
        per_page: perPage,
        page: page.value,
        ...(searchQuery.value ? { q: searchQuery.value } : {})
      },
      adminLandmarksListRequest
    ),
  {
    server: false,
    watch: [page, searchQuery],
    default: () => ({ data: [] })
  }
);

watch(
  [landmarksPending, landmarksError],
  ([isPending, currentError]) => {
    if (!isPending && !currentError) {
      hasLoadedSuccessfully.value = true;
    }
  },
  { immediate: true }
);

const cities = computed(() => {
  const list = Array.isArray(citiesData.value?.data) ? citiesData.value.data : [];
  return [...list].sort((a, b) => a.name.localeCompare(b.name));
});

const landmarks = computed(() => {
  const list = Array.isArray(landmarksData.value?.data) ? landmarksData.value.data : [];
  return list;
});

const currentPage = computed(() => {
  const metaValue = Number(landmarksData.value?.meta?.current_page ?? 0);
  const directValue = Number(landmarksData.value?.current_page ?? 0);
  return Math.max(metaValue || directValue || page.value, 1);
});

const lastPage = computed(() => {
  const metaValue = Number(landmarksData.value?.meta?.last_page ?? 0);
  const directValue = Number(landmarksData.value?.last_page ?? 0);
  return Math.max(metaValue || directValue || 1, 1);
});

const totalRecords = computed(() => {
  const metaValue = Number(landmarksData.value?.meta?.total ?? 0);
  const directValue = Number(landmarksData.value?.total ?? 0);
  return metaValue || directValue || landmarks.value.length;
});

const resultsSummary = computed(() => {
  if (searchQuery.value) {
    return `Showing ${landmarks.value.length} matching landmarks on this page. Total matches: ${totalRecords.value}.`;
  }

  return `Showing ${landmarks.value.length} landmarks on this page. Total records: ${totalRecords.value}.`;
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

const csvToArray = (value: string) => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const clearMessages = () => {
  statusMessage.value = "";
  errorMessage.value = "";
};

const resetForm = () => {
  Object.assign(form, blankForm());
  editingId.value = null;
  langTab.value = 'ar';
  fieldErrors.cityId = "";
  fieldErrors.name = "";
  fieldErrors.latitude = "";
  fieldErrors.longitude = "";
  fieldErrors.sortOrder = "";
  fieldErrors.googleMapsUrl = "";
  imagePreviewError.value = false;
  clearMessages();
};

const validateField = (field: LandmarkField): boolean => {
  fieldErrors[field] = "";

  if (field === "cityId" && form.cityId === "") {
    fieldErrors.cityId = "City is required.";
  }

  if (field === "name" && form.name.trim().length < 2) {
    fieldErrors.name = "Name must be at least 2 characters.";
  }

  if (field === "latitude") {
    fieldErrors.latitude = parseLandmarkLatitude(form.latitude).error;
  }

  if (field === "longitude") {
    fieldErrors.longitude = parseLandmarkLongitude(form.longitude).error;
  }

  if (field === "sortOrder") {
    fieldErrors.sortOrder = parseLandmarkSortOrder(form.sortOrder).error;
  }

  if (field === "googleMapsUrl") {
    fieldErrors.googleMapsUrl = parseOptionalGoogleMapsUrl(form.googleMapsUrl).error;
  }

  return !fieldErrors[field];
};

const validateAll = () => {
  const fields: LandmarkField[] = ["cityId", "name", "latitude", "longitude", "sortOrder", "googleMapsUrl"];
  return fields.map((field) => validateField(field)).every(Boolean);
};

const refreshAll = async () => {
  if (isRefreshingAll.value) {
    return;
  }

  isRefreshingAll.value = true;

  try {
    adminCityOptionsCache.value = [];
    adminCityOptionsCacheTimestamp.value = 0;

    const result = await runRefreshWithFeedback(
      async () => {
        await Promise.all([refreshCities(), refreshLandmarks()]);
      },
      {
        pendingError: landmarksError,
        fallback: "Unable to refresh landmark data.",
        successMessage: "Landmark list refreshed.",
        rateLimitMessage: "Too many requests. Please wait and retry."
      }
    );

    if (!result.ok) {
      errorMessage.value = result.message;
    }
  } finally {
    isRefreshingAll.value = false;
  }
};

const loadForEdit = (landmark: ApiLandmark) => {
  clearMessages();
  editingId.value = landmark.id;
  langTab.value = 'ar';
  form.cityId = String(landmark.city_id);
  form.name = landmark.name;
  form.nameEn = (landmark as any).name_en ?? "";
  form.description = landmark.description ?? "";
  form.descriptionEn = (landmark as any).description_en ?? "";
  form.categoriesCsv = landmark.categories.join(", ");
  form.categoryNamesCsv = landmark.category_names.join(", ");
  form.latitude = landmark.latitude !== null ? String(landmark.latitude) : "";
  form.longitude = landmark.longitude !== null ? String(landmark.longitude) : "";
  form.googleMapsUrl = landmark.google_maps_url ?? "";
  form.imagesCsv = (landmark.images || []).join(", ");
  form.sortOrder = String(landmark.sort_order || 999);
  form.isActive = Boolean(landmark.is_active);
  imagePreviewError.value = false;
};

const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const firstImageUrl = computed(() => {
  if (!form.imagesCsv) return null;
  const first = form.imagesCsv.split(',')[0].trim();
  if (first && isValidUrl(first)) return first;
  return null;
});

const saveLandmark = async () => {
  clearMessages();

  if (!validateAll()) {
    errorMessage.value = "Please fix validation errors before saving.";
    await nextTick();
    focusFirstInvalidField(landmarkFormRef.value);
    return;
  }

  isSaving.value = true;

  const latitude = parseLandmarkLatitude(form.latitude).value;
  const longitude = parseLandmarkLongitude(form.longitude).value;
  const sortOrder = parseLandmarkSortOrder(form.sortOrder).value;
  const googleMapsUrl = parseOptionalGoogleMapsUrl(form.googleMapsUrl).value;

  const payload = {
    city_id: Number(form.cityId),
    name: form.name.trim(),
    name_en: form.nameEn.trim() || null,
    description: form.description.trim() || null,
    description_en: form.descriptionEn.trim() || null,
    categories: csvToArray(form.categoriesCsv),
    category_names: csvToArray(form.categoryNamesCsv),
    latitude,
    longitude,
    google_maps_url: googleMapsUrl,
    images: csvToArray(form.imagesCsv),
    sort_order: sortOrder ?? 999,
    is_active: form.isActive
  };

  try {
    if (editingId.value) {
      await api.updateLandmark(editingId.value, payload);
      statusMessage.value = "Landmark updated successfully.";
    } else {
      await api.createLandmark(payload);
      statusMessage.value = "Landmark created successfully.";
    }

    notifySuccess(statusMessage.value);
    resetForm();
    await refreshLandmarks();
  } catch (exception) {
    errorMessage.value = resolveApiErrorMessage(exception, {
      fallback: "Failed to save landmark.",
      rateLimitMessage: "Too many requests. Please wait and retry."
    });
    notifyError(errorMessage.value);
  } finally {
    isSaving.value = false;
  }
};

const deleteLandmark = async (landmark: ApiLandmark) => {
  clearMessages();
  const accepted = window.confirm(`Delete landmark "${landmark.name}"? This action cannot be undone.`);
  if (!accepted) {
    return;
  }

  deletingId.value = landmark.id;
  try {
    await api.deleteLandmark(landmark.id);
    statusMessage.value = `Landmark "${landmark.name}" deleted.`;
    notifySuccess(statusMessage.value);
    if (editingId.value === landmark.id) {
      resetForm();
    }
    await refreshLandmarks();
  } catch (exception) {
    errorMessage.value = resolveApiErrorMessage(exception, {
      fallback: "Failed to delete landmark.",
      rateLimitMessage: "Too many requests. Please wait and retry."
    });
    notifyError(errorMessage.value);
  } finally {
    deletingId.value = null;
  }
};
</script>

<style scoped>
.admin-pagination {
  margin-top: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.admin-pagination p {
  margin: 0;
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.9rem;
}

.field-grid {
  display: grid;
  gap: 0.55rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.checkbox-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(11, 30, 50, 0.5);
  border-radius: 0.7rem;
  padding: 0.52rem 0.66rem;
}

.checkbox-label input {
  width: 1.1rem;
  height: 1.1rem;
  margin: 0;
}

@media (max-width: 600px) {
  .field-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (min-width: 1020px) {
  .admin-content-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
  }
}
</style>
