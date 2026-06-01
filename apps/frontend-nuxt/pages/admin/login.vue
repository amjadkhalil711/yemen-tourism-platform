<template>
  <div class="split-login-page" :dir="dir">
    <div class="form-side">
      <!-- Navbar equivalent -->
      <div class="top-nav">
        <NuxtLink to="/">{{ t('adminLoginPage.navHome') }}</NuxtLink>
        <NuxtLink to="/cities">{{ t('adminLoginPage.navCities') }}</NuxtLink>
        <div class="nav-spacer"></div>
        <NuxtLink to="/contact" class="btn-contact">{{ t('adminLoginPage.navContact') }}</NuxtLink>
        <button type="button" class="btn-lang" @click="toggleLocale">
          <i class="fas fa-globe"></i> {{ t('switchLang') }}
        </button>
      </div>
      
      <div class="form-container">
        <div class="brand-title">
          <div class="logo-icon">
             <i class="fas fa-shield-alt"></i>
          </div>
          <h1>{{ t('adminLoginPage.portalTitle') }}</h1>
          <p>{{ t('adminLoginPage.portalSubtitle') }}</p>
        </div>

        <form ref="loginFormRef" class="premium-form" novalidate @submit.prevent="submitLogin">
          <div v-if="errorMessage" class="alert-box error">{{ errorMessage }}</div>
          <div v-if="statusMessage" class="alert-box success">{{ statusMessage }}</div>

          <div class="input-wrapper">
             <label>{{ t('adminLoginPage.username') }}</label>
             <div class="input-inner">
               <i class="far fa-user"></i>
               <input
                 id="identifier"
                 v-model.trim="form.identifier"
                 type="text"
                 :placeholder="t('adminLoginPage.usernamePlaceholder')"
                 autocomplete="username"
                 required
                 @blur="validateField('identifier')"
               />
             </div>
             <p v-if="fieldErrors.identifier" class="field-error">{{ fieldErrors.identifier }}</p>
          </div>

          <div class="input-wrapper">
             <label>{{ t('adminLoginPage.password') }}</label>
             <div class="input-inner">
               <i class="fas fa-lock"></i>
               <input
                 id="password"
                 v-model="form.password"
                 type="password"
                 :placeholder="t('adminLoginPage.passwordPlaceholder')"
                 autocomplete="current-password"
                 required
                 @blur="validateField('password')"
               />
             </div>
             <p v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</p>
          </div>
          
          <div class="forgot-wrapper">
            <a href="#">{{ t('adminLoginPage.forgotPassword') }}</a>
          </div>

          <button type="submit" class="submit-btn" :disabled="isSubmitting || auth.isLoading">
             <span v-if="isSubmitting || auth.isLoading"><i class="fas fa-spinner fa-spin"></i> {{ t('adminLoginPage.loggingIn') }}</span>
             <span v-else>{{ t('adminLoginPage.loginButton') }} <i class="fas" :class="isRtl ? 'fa-arrow-left' : 'fa-arrow-right'" :style="isRtl ? 'margin-right: 10px;' : 'margin-left: 10px;'"></i></span>
          </button>
        </form>
      </div>
    </div>
    
    <div class="image-side">
      <div class="glass-overlay-card">
         <h2>{{ t('adminLoginPage.imageTitle') }}</h2>
         <p>{{ t('adminLoginPage.imageSubtitle') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { sanitizeAdminRedirect } from "~/utils/admin-redirect";
import { focusFirstInvalidField } from "~/utils/form-accessibility";

const { t, dir, isRtl, toggleLocale } = useLocale();

type LoginField = "identifier" | "password";

definePageMeta({
  layout: false
});

useSeoMeta({
  title: "Admin Login | Yemen Tourism",
  description: "Secure admin login for the Yemen Tourism management panel."
});

const auth = useAuthStore();
const route = useRoute();
const { resolveApiErrorMessage } = useApiErrorMessage();
const { success: notifySuccess, error: notifyError } = useToast();
const redirectTarget = computed(() => sanitizeAdminRedirect(route.query.redirect));
const loginFormRef = ref<HTMLFormElement | null>(null);

const form = reactive({
  identifier: "",
  password: ""
});

const fieldErrors = reactive<Record<LoginField, string>>({
  identifier: "",
  password: ""
});

const isSubmitting = ref(false);
const errorMessage = ref("");
const statusMessage = ref("");

const validateField = (field: LoginField): boolean => {
  const value = form[field].trim();
  fieldErrors[field] = "";

  if (field === "identifier" && value.length < 3) {
    fieldErrors.identifier = t('adminLoginPage.validationUsername');
  }

  if (field === "password" && value.length < 6) {
    fieldErrors.password = t('adminLoginPage.validationPassword');
  }

  return !fieldErrors[field];
};

const validateAll = (): boolean => {
  return (["identifier", "password"] as LoginField[]).map((field) => validateField(field)).every(Boolean);
};

const ensureExistingAdminSession = async () => {
  if (!auth.isAuthenticated) {
    return;
  }

  try {
    await auth.fetchMe();
    if (auth.user?.role === "admin") {
      await navigateTo(redirectTarget.value);
      return;
    }
  } catch {
    // Fall through to logout cleanup.
  }

  await auth.logout();
};

await ensureExistingAdminSession();

const submitLogin = async () => {
  errorMessage.value = "";
  statusMessage.value = "";

  if (!validateAll()) {
    errorMessage.value = t('adminLoginPage.validationError');
    notifyError(errorMessage.value);
    await nextTick();
    focusFirstInvalidField(loginFormRef.value);
    return;
  }

  isSubmitting.value = true;

  try {
    const user = await auth.login(form.identifier, form.password);
    if (user.role !== "admin") {
      await auth.logout();
      errorMessage.value = t('adminLoginPage.noAdminAccess');
      notifyError(errorMessage.value);
      return;
    }

    statusMessage.value = t('adminLoginPage.redirecting');
    notifySuccess(t('adminLoginPage.loginSuccess'));
    await navigateTo(redirectTarget.value);
  } catch (error) {
    errorMessage.value = resolveApiErrorMessage(error, {
      fallback: t('adminLoginPage.loginFailed'),
      rateLimitMessage: t('adminLoginPage.tooManyAttempts')
    });
    notifyError(errorMessage.value);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.split-login-page {
  display: flex;
  min-height: 100vh;
  background: #0b1120;
  color: #fff;
  font-family: 'Tajawal', sans-serif;
  overflow: hidden;
}

.form-side {
  width: 45%;
  min-width: 500px;
  display: flex;
  flex-direction: column;
  padding: 40px 50px;
  background: #0b1120;
  position: relative;
  z-index: 10;
  box-shadow: -20px 0 50px rgba(0,0,0,0.8);
}

[dir="ltr"] .form-side {
  box-shadow: 20px 0 50px rgba(0,0,0,0.8);
}

.image-side {
  flex: 1;
  background: url('/images/backgrounds/tree_bg.png') no-repeat center center / cover;
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 60px;
}

.image-side::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, #0b1120 0%, rgba(11, 17, 32, 0.4) 30%, transparent 100%);
}

[dir="ltr"] .image-side::before {
  background: linear-gradient(to left, #0b1120 0%, rgba(11, 17, 32, 0.4) 30%, transparent 100%);
}

.glass-overlay-card {
  position: relative;
  z-index: 2;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 45px;
  border-radius: 30px;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

[dir="rtl"] .glass-overlay-card {
  border-right: 4px solid #4ade80;
}
[dir="ltr"] .glass-overlay-card {
  border-left: 4px solid #4ade80;
}

.glass-overlay-card h2 {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 15px;
  text-shadow: 0 4px 20px rgba(0,0,0,0.5);
  line-height: 1.2;
}

.glass-overlay-card p {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  line-height: 1.6;
}

.top-nav {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 50px;
}
.top-nav a {
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  font-size: 1.1rem;
  transition: 0.3s;
  font-weight: 600;
}
.top-nav a:hover {
  color: #fff;
}
.nav-spacer {
  flex: 1;
}
.btn-contact {
  background: rgba(255,255,255,0.08);
  padding: 8px 20px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.15);
}
.btn-contact:hover {
  background: rgba(255,255,255,0.15);
}
.btn-lang {
  background: rgba(255,255,255,0.08);
  padding: 8px 18px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  transition: 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-lang:hover {
  background: rgba(255,255,255,0.15);
  color: #fff;
}

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 440px;
  margin: 0 auto;
  width: 100%;
}

.brand-title {
  margin-bottom: 45px;
}
.logo-icon {
  width: 65px;
  height: 65px;
  background: linear-gradient(135deg, #4ade80, #14b8a6);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 25px;
  box-shadow: 0 10px 25px rgba(74, 222, 128, 0.25);
  color: #0b1120;
}
.brand-title h1 {
  font-size: 2.4rem;
  margin: 0 0 10px;
  font-weight: 800;
}
.brand-title p {
  color: rgba(255,255,255,0.5);
  margin: 0;
  font-size: 1.1rem;
}

.premium-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.input-wrapper label {
  display: block;
  margin-bottom: 10px;
  font-size: 1rem;
  color: rgba(255,255,255,0.85);
  font-weight: 600;
}

.input-inner {
  position: relative;
  background: #1e293b;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.08);
  transition: 0.3s;
}
.input-inner:focus-within {
  border-color: #4ade80;
  box-shadow: 0 0 0 4px rgba(74, 222, 128, 0.15);
  background: #253347;
}

.input-inner i {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,0.4);
  font-size: 1.2rem;
  transition: 0.3s;
}
[dir="rtl"] .input-inner i { right: 20px; }
[dir="ltr"] .input-inner i { left: 20px; }

.input-inner:focus-within i {
  color: #4ade80;
}

.input-inner input {
  width: 100%;
  background: transparent;
  border: none;
  color: #fff;
  font-family: inherit;
  font-size: 1.1rem;
  outline: none;
}
[dir="rtl"] .input-inner input { padding: 18px 50px 18px 20px; }
[dir="ltr"] .input-inner input { padding: 18px 20px 18px 50px; }

.input-inner input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.forgot-wrapper {
  margin-top: -5px;
}
[dir="rtl"] .forgot-wrapper { text-align: right; }
[dir="ltr"] .forgot-wrapper { text-align: left; }

.forgot-wrapper a {
  color: #4ade80;
  text-decoration: none;
  font-size: 0.95rem;
  transition: 0.3s;
}
.forgot-wrapper a:hover {
  color: #fff;
  text-decoration: underline;
}

.submit-btn {
  background: #4ade80;
  color: #0b1120;
  font-weight: 800;
  font-size: 1.25rem;
  padding: 18px;
  border-radius: 18px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: 0.3s;
  box-shadow: 0 10px 20px rgba(74, 222, 128, 0.2);
  margin-top: 10px;
}
.submit-btn:hover:not(:disabled) {
  background: #22c55e;
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(34, 197, 94, 0.3);
}

.submit-btn i {
  font-size: 1.1rem;
}

.field-error {
  color: #ef4444;
  font-size: 0.85rem;
  margin: 8px 0 0;
}
[dir="rtl"] .field-error { padding-right: 5px; }
[dir="ltr"] .field-error { padding-left: 5px; }

.alert-box {
  padding: 16px;
  border-radius: 16px;
  text-align: center;
  font-size: 1rem;
  font-weight: bold;
}
.alert-box.error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}
.alert-box.success {
  background: rgba(74, 222, 128, 0.15);
  border: 1px solid rgba(74, 222, 128, 0.3);
  color: #86efac;
}

/* responsive */
@media (max-width: 992px) {
  .split-login-page {
    flex-direction: column;
  }
  .form-side {
    width: 100%;
    min-width: 0;
    padding: 30px;
  }
  .image-side {
    min-height: 400px;
    padding: 30px;
    order: -1;
  }
}
</style>
