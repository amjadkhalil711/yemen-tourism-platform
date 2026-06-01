(function () {
    'use strict';

    const AR = {
        HISTORICAL: '\u062a\u0627\u0631\u064a\u062e\u064a',
        NATURAL: '\u0637\u0628\u064a\u0639\u064a',
        RELIGIOUS: '\u062f\u064a\u0646\u064a',
        COASTAL: '\u0633\u0627\u062d\u0644\u064a',
        RECREATIONAL: '\u062a\u0631\u0641\u064a\u0647\u064a',
        ARCHITECTURAL: '\u0645\u0639\u0645\u0627\u0631\u064a',
        CULTURAL: '\u062b\u0642\u0627\u0641\u064a',
        MOUNTAIN: '\u062c\u0628\u0644\u064a',
        MUSEUM: '\u0645\u062a\u062d\u0641',
        FORTRESS: '\u0642\u0644\u0639\u0629',
        NO_USERS_LOCAL: '\u0644\u0627 \u064a\u0648\u062c\u062f \u0645\u0633\u062a\u062e\u062f\u0645\u0648\u0646 \u0645\u062d\u0641\u0648\u0638\u0648\u0646 \u0645\u062d\u0644\u064a\u064b\u0627 \u0628\u0639\u062f.',
        PUBLISHED: '\u0645\u0646\u0634\u0648\u0631\u0629',
        DRAFT: '\u0645\u0633\u0648\u062f\u0629',
        LOADING_LANDMARKS: '\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u0639\u0627\u0644\u0645...',
        NO_DATA: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a',
        LANDMARKS_COUNT: '\u0639\u062f\u062f \u0627\u0644\u0645\u0639\u0627\u0644\u0645',
        SESSION_EXPIRED: '\u0627\u0646\u062a\u0647\u062a \u0635\u0644\u0627\u062d\u064a\u0629 \u0627\u0644\u062c\u0644\u0633\u0629. \u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
        CHECKING_PERMS: '\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0635\u0644\u0627\u062d\u064a\u0627\u062a...',
        ACCOUNT_NOT_ADMIN: '\u0647\u0630\u0627 \u0627\u0644\u062d\u0633\u0627\u0628 \u0644\u0627 \u064a\u0645\u0644\u0643 \u0635\u0644\u0627\u062d\u064a\u0627\u062a \u0627\u0644\u0625\u062f\u0627\u0631\u0629.',
        SESSION_VERIFY_FAILED: '\u062a\u0639\u0630\u0631 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u062c\u0644\u0633\u0629 \u0627\u0644\u0625\u062f\u0627\u0631\u0629.',
        LANDMARKS_LOAD_FAILED: '\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u0639\u0627\u0644\u0645.',
        REQUIRED_LANDMARK_FIELDS: '\u064a\u0631\u062c\u0649 \u062a\u0639\u0628\u0626\u0629 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u0639\u0644\u0645 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629.',
        LANDMARK_UPDATED: '\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0645\u0639\u0644\u0645 \u0628\u0646\u062c\u0627\u062d.',
        LANDMARK_CREATED: '\u062a\u0645\u062a \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0639\u0644\u0645 \u0628\u0646\u062c\u0627\u062d.',
        LANDMARK_SAVE_FAILED: '\u062a\u0639\u0630\u0631 \u062d\u0641\u0638 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u0639\u0644\u0645.',
        LANDMARK_NOT_FOUND: '\u0627\u0644\u0645\u0639\u0644\u0645 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f.',
        CONFIRM_DELETE_LANDMARK: '\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u062d\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0645\u0639\u0644\u0645\u061f',
        LANDMARK_DELETED: '\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0645\u0639\u0644\u0645.',
        LANDMARK_DELETE_FAILED: '\u062a\u0639\u0630\u0631 \u062d\u0630\u0641 \u0627\u0644\u0645\u0639\u0644\u0645.',
        CITY_NAME_PROMPT: '\u0627\u0633\u0645 \u0627\u0644\u0645\u062f\u064a\u0646\u0629 \u0627\u0644\u062c\u062f\u064a\u062f\u0629:',
        CITY_SLUG_PROMPT: 'Slug \u0627\u0644\u0645\u062f\u064a\u0646\u0629 (\u0623\u062d\u0631\u0641 \u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629/\u0623\u0631\u0642\u0627\u0645):',
        CITY_DESC_PROMPT: '\u0648\u0635\u0641 \u0645\u062e\u062a\u0635\u0631 \u0644\u0644\u0645\u062f\u064a\u0646\u0629 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a):',
        CITY_CREATED: '\u062a\u0645\u062a \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u062f\u064a\u0646\u0629 \u0628\u0646\u062c\u0627\u062d.',
        CITY_CREATE_FAILED: '\u062a\u0639\u0630\u0631 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u062f\u064a\u0646\u0629.',
        CITY_NOT_FOUND: '\u0627\u0644\u0645\u062f\u064a\u0646\u0629 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f\u0629.',
        CITY_EDIT_NAME: '\u062a\u0639\u062f\u064a\u0644 \u0627\u0633\u0645 \u0627\u0644\u0645\u062f\u064a\u0646\u0629:',
        CITY_EDIT_DESC: '\u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0648\u0635\u0641:',
        CITY_EDIT_STATUS: '\u0627\u0644\u062d\u0627\u0644\u0629 (published \u0623\u0648 draft):',
        CITY_UPDATED: '\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0645\u062f\u064a\u0646\u0629 \u0628\u0646\u062c\u0627\u062d.',
        CITY_UPDATE_FAILED: '\u062a\u0639\u0630\u0631 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0645\u062f\u064a\u0646\u0629.',
        CONFIRM_DELETE_CITY: '\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u062d\u0630\u0641 \u0647\u0630\u0647 \u0627\u0644\u0645\u062f\u064a\u0646\u0629\u061f',
        CITY_DELETED: '\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0645\u062f\u064a\u0646\u0629.',
        CITY_DELETE_FAILED: '\u062a\u0639\u0630\u0631 \u062d\u0630\u0641 \u0627\u0644\u0645\u062f\u064a\u0646\u0629.',
        ADD_LANDMARK_TITLE: '\u0625\u0636\u0627\u0641\u0629 \u0645\u0639\u0644\u0645 \u0633\u064a\u0627\u062d\u064a \u062c\u062f\u064a\u062f',
        EDIT_LANDMARK_TITLE_PREFIX: '\u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0645\u0639\u0644\u0645: '
    };

    const API_BASE = (window.PT_API_BASE || localStorage.getItem('pt_api_base') || 'http://localhost:8000/api/v1').replace(/\/+$/, '');
    const CACHE_TTL_MS = 5 * 60 * 1000;
    const CITIES_CACHE_KEY = 'pt_admin_cities_cache_v3';
    const LANDMARKS_CACHE_KEY = 'pt_admin_landmarks_cache_v3';

    let authToken = localStorage.getItem('pt_admin_token') || '';
    let cities = [];
    let landmarks = [];
    let stats = {};
    let editingLandmarkId = null;
    let landmarksLoaded = false;
    let landmarksPromise = null;
    let typeChart = null;
    let citiesChart = null;

    const categoryLabelMap = {
        historical: AR.HISTORICAL,
        natural: AR.NATURAL,
        religious: AR.RELIGIOUS,
        coastal: AR.COASTAL,
        recreational: AR.RECREATIONAL,
        architectural: AR.ARCHITECTURAL,
        cultural: AR.CULTURAL,
        mountain: AR.MOUNTAIN,
        museum: AR.MUSEUM,
        fortress: AR.FORTRESS
    };

    const navItems = document.querySelectorAll('.admin-nav li[data-target]');
    const panels = document.querySelectorAll('.admin-panel');
    const authMask = document.getElementById('auth-mask');
    const adminName = document.getElementById('admin-name');
    const cityFormButton = document.querySelector('#panel-cities .btn.btn-accent');
    const landmarkForm = document.getElementById('landmark-form');
    const landmarkFormTitle = document.getElementById('form-title');
    const landmarkSubmitForm = document.getElementById('new-landmark-form');
    const citySelect = document.getElementById('lm-city');
    const topbarTitle = document.getElementById('dashboard-view-title');
    const topbarCaption = document.getElementById('dashboard-view-caption');
    const topbarDate = document.getElementById('dashboard-current-date');
    const topbarStatus = document.getElementById('dashboard-status-pill');
    const coverageMetric = document.getElementById('dashboard-coverage');
    const syncMetric = document.getElementById('dashboard-sync-time');
    const readinessMetric = document.getElementById('dashboard-readiness');
    const usersCopy = document.getElementById('dashboard-users-copy');
    const settingsForm = document.getElementById('dashboard-settings-form');
    const settingsApiBase = document.getElementById('settings-api-base');
    const settingsContactEmail = document.getElementById('settings-contact-email');
    const settingsDashboardNote = document.getElementById('settings-dashboard-note');
    const settingsNotePreview = document.getElementById('settings-note-preview');
    const quickActionButtons = document.querySelectorAll('[data-panel-jump]');
    const PREFERENCES_KEY = 'pt_admin_dashboard_preferences_v1';
    const PANEL_META = {
        dashboard: {
            title: '<i class="fas fa-tachometer-alt"></i> نظرة عامة',
            caption: 'لوحة متابعة تنفيذية تعرض أهم المؤشرات وحالة المحتوى والخدمات.',
            status: 'جاهزية عالية'
        },
        cities: {
            title: '<i class="fas fa-city"></i> إدارة المدن',
            caption: 'مراجعة حالة النشر، تغطية المحتوى، وعدد المعالم في كل مدينة.',
            status: 'محتوى منظم'
        },
        landmarks: {
            title: '<i class="fas fa-landmark"></i> إدارة المعالم',
            caption: 'تحديث أوصاف المعالم والإحداثيات وبيانات العرض بسرعة أكبر.',
            status: 'فهرسة نشطة'
        },
        users: {
            title: '<i class="fas fa-users"></i> مستخدمو الخريطة',
            caption: 'متابعة الوصول المحلي إلى الخريطة والمستخدمين الذين سجلوا بياناتهم.',
            status: 'متابعة الزوار'
        },
        settings: {
            title: '<i class="fas fa-cogs"></i> إعدادات الموقع',
            caption: 'إدارة الإعدادات التشغيلية للواجهة القديمة ولوحة الإدارة.',
            status: 'إعدادات محلية'
        }
    };

    function numberFormat(value) {
        return new Intl.NumberFormat('ar-YE').format(Number(value) || 0);
    }

    function timeFormat(dateValue) {
        const value = dateValue instanceof Date ? dateValue : new Date(dateValue || Date.now());
        return new Intl.DateTimeFormat('ar-YE', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(value);
    }

    function countLocalUsers() {
        try {
            const users = JSON.parse(localStorage.getItem('pt_dummy_users') || '[]');
            return Array.isArray(users) ? users.length : 0;
        } catch (_) {
            return 0;
        }
    }

    function animateMetricValue(node, rawValue) {
        if (!node) return;
        const nextValue = Number(rawValue) || 0;
        const previousValue = Number(node.dataset.metricValue || 0);
        node.dataset.metricValue = String(nextValue);

        if (previousValue === nextValue) {
            node.textContent = numberFormat(nextValue);
            return;
        }

        const startedAt = performance.now();
        const duration = 520;

        function step(now) {
            const progress = Math.min((now - startedAt) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(previousValue + ((nextValue - previousValue) * eased));
            node.textContent = numberFormat(currentValue);
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    function updateTopbarState(targetKey) {
        const meta = PANEL_META[targetKey] || PANEL_META.dashboard;
        if (topbarTitle) topbarTitle.innerHTML = meta.title;
        if (topbarCaption) topbarCaption.textContent = meta.caption;
        if (topbarStatus) topbarStatus.textContent = meta.status;
    }

    function syncDashboardInsights() {
        const totalCities = Number(stats.cities_count || cities.length || 0);
        const totalLandmarks = Number(landmarksLoaded ? landmarks.length : (stats.landmarks_count || 0));
        const totalViews = Number(stats.map_views_count || 0);
        const totalUsers = countLocalUsers();
        const coverageValue = totalCities > 0 ? Math.min(100, Math.round((totalLandmarks / Math.max(totalCities, 1)) * 5)) : 0;
        const readinessValue = totalLandmarks > 0 ? 'مستقرة' : 'تحتاج بيانات';

        if (coverageMetric) coverageMetric.textContent = `${coverageValue}%`;
        if (syncMetric) syncMetric.textContent = timeFormat(Date.now());
        if (readinessMetric) readinessMetric.textContent = readinessValue;
        if (usersCopy) {
            usersCopy.textContent = `يوجد حالياً ${numberFormat(totalUsers)} مستخدم محلي مسجل، و${numberFormat(totalViews)} زيارة موثقة، مع ${numberFormat(totalLandmarks)} معلم ضمن ${numberFormat(totalCities)} مدينة.`;
        }
    }

    function loadDashboardPreferences() {
        let preferences = {};
        try {
            preferences = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}');
        } catch (_) {
            preferences = {};
        }

        if (settingsApiBase) {
            settingsApiBase.value = preferences.apiBase || localStorage.getItem('pt_api_base') || API_BASE;
        }
        if (settingsContactEmail) {
            settingsContactEmail.value = preferences.contactEmail || '';
        }
        if (settingsDashboardNote) {
            settingsDashboardNote.value = preferences.dashboardNote || '';
        }
        if (settingsNotePreview) {
            settingsNotePreview.textContent = preferences.dashboardNote || 'سيظهر هنا آخر نص محفوظ للملاحظة التشغيلية.';
        }
    }

    function saveDashboardPreferences(event) {
        event.preventDefault();
        const preferences = {
            apiBase: settingsApiBase?.value?.trim() || API_BASE,
            contactEmail: settingsContactEmail?.value?.trim() || '',
            dashboardNote: settingsDashboardNote?.value?.trim() || ''
        };

        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
        localStorage.setItem('pt_api_base', preferences.apiBase);
        if (settingsNotePreview) {
            settingsNotePreview.textContent = preferences.dashboardNote || 'سيظهر هنا آخر نص محفوظ للملاحظة التشغيلية.';
        }
        showToast('تم حفظ الإعدادات المحلية بنجاح.', 'success');
    }

    function startClock() {
        if (!topbarDate) return;
        const renderClock = () => {
            topbarDate.textContent = timeFormat(Date.now());
        };
        renderClock();
        window.setInterval(renderClock, 60000);
    }

    function getSessionCache(key, ttlMs) {
        try {
            const raw = sessionStorage.getItem(key);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return null;
            if (Date.now() - Number(parsed.timestamp || 0) > ttlMs) return null;
            return parsed.data;
        } catch (_) {
            return null;
        }
    }

    function setSessionCache(key, data) {
        try {
            sessionStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
        } catch (_) {
            // Ignore cache write errors.
        }
    }

    function invalidateSessionCache() {
        try {
            sessionStorage.removeItem(CITIES_CACHE_KEY);
            sessionStorage.removeItem(LANDMARKS_CACHE_KEY);
        } catch (_) {
            // Ignore cache remove errors.
        }
    }

    function clearSession() {
        localStorage.removeItem('pt_admin_auth');
        localStorage.removeItem('pt_admin_token');
        localStorage.removeItem('pt_admin_user');
        authToken = '';
    }

    function setMaskText(text) {
        if (!authMask) return;
        const title = authMask.querySelector('h3');
        if (title) title.textContent = text;
    }

    function hideMask() {
        if (!authMask) return;
        authMask.style.opacity = '0';
        setTimeout(() => {
            authMask.style.display = 'none';
        }, 350);
    }

    async function parseJson(response) {
        try {
            return await response.json();
        } catch (_) {
            return {};
        }
    }

    async function apiRequest(path, options) {
        const opts = options || {};
        const requireAuth = opts.requireAuth !== false;
        const body = opts.body;

        const headers = { Accept: 'application/json' };
        if (body !== undefined) headers['Content-Type'] = 'application/json';
        if (requireAuth && authToken) headers.Authorization = `Bearer ${authToken}`;

        const response = await fetch(`${API_BASE}${path}`, {
            method: opts.method || 'GET',
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined
        });

        const payload = await parseJson(response);
        if (response.status === 401) {
            clearSession();
            window.location.href = 'admin-login.html';
            throw new Error(AR.SESSION_EXPIRED);
        }
        if (!response.ok) {
            throw new Error(payload.message || `Request failed (${response.status})`);
        }

        return payload;
    }

    async function fetchAll(path, options) {
        const opts = options || {};
        const requireAuth = opts.requireAuth !== false;
        const cacheKey = opts.cacheKey || '';
        const useCache = Boolean(opts.useCache);

        if (useCache && cacheKey) {
            const cached = getSessionCache(cacheKey, CACHE_TTL_MS);
            if (cached) return cached;
        }

        const sep = path.includes('?') ? '&' : '?';
        const first = await apiRequest(`${path}${sep}page=1&per_page=100`, { requireAuth });
        const firstRows = Array.isArray(first.data) ? first.data : [];
        const lastPage = Number(first.meta?.last_page || 1);

        if (lastPage <= 1) {
            if (cacheKey) setSessionCache(cacheKey, firstRows);
            return firstRows;
        }

        const requests = [];
        for (let page = 2; page <= lastPage; page += 1) {
            requests.push(apiRequest(`${path}${sep}page=${page}&per_page=100`, { requireAuth }));
        }
        const rest = await Promise.all(requests);
        const allRows = [...firstRows];
        rest.forEach((payload) => {
            const rows = Array.isArray(payload.data) ? payload.data : [];
            allRows.push(...rows);
        });

        if (cacheKey) setSessionCache(cacheKey, allRows);
        return allRows;
    }

    function getCityById(cityId) {
        const id = Number(cityId);
        return cities.find((city) => Number(city.id) === id) || null;
    }

    function rebuildCityOptions() {
        if (!citySelect) return;
        citySelect.innerHTML = '';
        cities.forEach((city) => {
            const option = document.createElement('option');
            option.value = String(city.id);
            option.textContent = city.name;
            citySelect.appendChild(option);
        });
    }

    function renderUsersTable() {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        let users = [];
        try {
            users = JSON.parse(localStorage.getItem('pt_dummy_users') || '[]');
        } catch (_) {
            users = [];
        }

        if (users.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="4">${AR.NO_USERS_LOCAL}</td>`;
            tbody.appendChild(tr);
        } else {
            users.forEach((user, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${index + 1}</td><td>${user.name || '-'}</td><td>${user.email || '-'}</td><td>${user.date || '-'}</td>`;
                tbody.appendChild(tr);
            });
        }

        const statUsers = document.getElementById('stat-users');
        animateMetricValue(statUsers, users.length);
        syncDashboardInsights();
    }

    function renderCitiesTable() {
        const tbody = document.getElementById('cities-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        cities.forEach((city) => {
            const count = Number(city.landmarks_count || 0);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${city.name}</strong></td>
                <td>${city.status === 'published' ? AR.PUBLISHED : AR.DRAFT}</td>
                <td><span style="background:var(--pt-grad-primary); color:#fff; padding:3px 10px; border-radius:10px;">${count}</span></td>
                <td class="action-btns">
                    <i class="fas fa-edit" onclick="editCity('${city.slug}')"></i>
                    <i class="fas fa-trash" onclick="deleteCity('${city.slug}')"></i>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderLandmarksTable() {
        const tbody = document.getElementById('landmarks-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!landmarksLoaded) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="4">${AR.LOADING_LANDMARKS}</td>`;
            tbody.appendChild(tr);
            return;
        }

        landmarks.forEach((landmark) => {
            const city = getCityById(landmark.city_id);
            const desc = String(landmark.description || '').trim();
            const shortDesc = desc.length > 60 ? `${desc.slice(0, 60)}...` : (desc || '-');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${landmark.name}</strong></td>
                <td>${city ? city.name : '-'}</td>
                <td>${shortDesc}</td>
                <td class="action-btns">
                    <i class="fas fa-edit" onclick="editLandmark(${landmark.id})"></i>
                    <i class="fas fa-trash" onclick="deleteLandmark(${landmark.id})"></i>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function buildCategoryData() {
        const counts = {};
        landmarks.forEach((landmark) => {
            const categories = Array.isArray(landmark.categories) ? landmark.categories : [];
            categories.forEach((category) => {
                counts[category] = (counts[category] || 0) + 1;
            });
        });

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        if (sorted.length === 0) return { labels: [AR.NO_DATA], values: [1] };
        return {
            labels: sorted.map(([key]) => categoryLabelMap[key] || key),
            values: sorted.map(([, value]) => value)
        };
    }

    function buildCityData() {
        const grouped = new Map();
        landmarks.forEach((landmark) => {
            const cityId = Number(landmark.city_id || 0);
            grouped.set(cityId, (grouped.get(cityId) || 0) + 1);
        });

        const sorted = cities
            .map((city) => ({ name: city.name, count: grouped.get(Number(city.id)) || 0 }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        if (sorted.length === 0) return { labels: [AR.NO_DATA], values: [1] };
        return {
            labels: sorted.map((item) => item.name),
            values: sorted.map((item) => item.count)
        };
    }

    function renderCharts() {
        const typeCanvas = document.getElementById('typeChart');
        const cityCanvas = document.getElementById('citiesChart');
        if (!typeCanvas || !cityCanvas || typeof Chart === 'undefined') return;

        Chart.defaults.color = '#6d879c';
        Chart.defaults.font.family = 'Cairo';

        const byType = buildCategoryData();
        const byCity = buildCityData();

        if (typeChart) typeChart.destroy();
        if (citiesChart) citiesChart.destroy();

        typeChart = new Chart(typeCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: byType.labels,
                datasets: [{
                    label: AR.LANDMARKS_COUNT,
                    data: byType.values,
                    backgroundColor: ['rgba(121, 203, 241, 0.72)', 'rgba(241, 183, 120, 0.72)', 'rgba(128, 219, 201, 0.78)', 'rgba(241, 127, 158, 0.72)', 'rgba(153, 187, 255, 0.72)'],
                    borderColor: ['#4ca8d8', '#f1b778', '#48b98f', '#f17f9e', '#7a9cff'],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(118, 161, 194, 0.12)' } },
                    x: { grid: { display: false } }
                }
            }
        });

        citiesChart = new Chart(cityCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: byCity.labels,
                datasets: [{
                    data: byCity.values,
                    backgroundColor: ['#79cbf1', '#80dbc9', '#ffd2a5', '#f1b7c7', '#a6c7ff'],
                    borderColor: ['#4ca8d8', '#48b98f', '#f1b778', '#f17f9e', '#7a9cff'],
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom', labels: { color: '#5f7b90' } } }
            }
        });
    }

    function renderStats() {
        const statCities = document.getElementById('stat-cities');
        const statLandmarks = document.getElementById('stat-landmarks');
        const statViews = document.getElementById('stat-views');
        animateMetricValue(statCities, stats.cities_count || cities.length);
        animateMetricValue(statLandmarks, landmarksLoaded ? landmarks.length : (stats.landmarks_count || 0));
        animateMetricValue(statViews, stats.map_views_count || 0);
        syncDashboardInsights();
    }

    function showToast(message, type) {
        const toastType = type || 'success';
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '30px';
        toast.style.left = '30px';
        toast.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.82), rgba(242,249,255,0.7))';
        toast.style.backdropFilter = 'blur(18px)';
        toast.style.border = toastType === 'success' ? '1px solid rgba(72,185,143,0.35)' : '1px solid rgba(76,168,216,0.28)';
        toast.style.color = '#17354e';
        toast.style.padding = '15px 25px';
        toast.style.borderRadius = '18px';
        toast.style.boxShadow = '0 24px 36px rgba(44,92,127,0.16)';
        toast.style.zIndex = '999999';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '15px';
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        toast.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        const icon = toastType === 'success'
            ? '<i class="fas fa-check-circle" style="color:#48b98f;font-size:1.5rem;"></i>'
            : '<i class="fas fa-info-circle" style="color:#4ca8d8;font-size:1.5rem;"></i>';

        toast.innerHTML = `${icon}<strong style="letter-spacing:1px">${message}</strong>`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        }, 60);
        setTimeout(() => {
            toast.style.transform = 'translateY(100px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 450);
        }, 3000);
    }

    async function loadBaseData(useCache) {
        const [citiesRows, statsPayload] = await Promise.all([
            fetchAll('/cities', { requireAuth: false, cacheKey: CITIES_CACHE_KEY, useCache: Boolean(useCache) }),
            apiRequest('/stats/overview')
        ]);
        cities = citiesRows;
        stats = statsPayload.data || {};
        rebuildCityOptions();
        renderCitiesTable();
        renderUsersTable();
        renderStats();
    }

    async function ensureLandmarksLoaded(useCache) {
        if (landmarksLoaded) return;
        if (landmarksPromise) {
            await landmarksPromise;
            return;
        }

        landmarksPromise = (async () => {
            landmarks = await fetchAll('/landmarks', { requireAuth: false, cacheKey: LANDMARKS_CACHE_KEY, useCache: Boolean(useCache) });
            landmarksLoaded = true;
            renderLandmarksTable();
            renderStats();
            renderCharts();
        })();

        try {
            await landmarksPromise;
        } finally {
            landmarksPromise = null;
        }
    }

    function openAddLandmarkForm() {
        editingLandmarkId = null;
        landmarkSubmitForm?.reset();
        if (landmarkForm) landmarkForm.style.display = 'block';
        if (landmarkFormTitle) landmarkFormTitle.innerText = AR.ADD_LANDMARK_TITLE;
    }

    function fillLandmarkForm(landmark) {
        document.getElementById('lm-name').value = landmark.name || '';
        document.getElementById('lm-city').value = String(landmark.city_id || '');
        document.getElementById('lm-desc').value = landmark.description || '';
        document.getElementById('lm-lat').value = landmark.latitude ?? '';
        document.getElementById('lm-lng').value = landmark.longitude ?? '';
    }

    function makeLandmarkPayload() {
        return {
            name: document.getElementById('lm-name').value.trim(),
            city_id: Number(document.getElementById('lm-city').value),
            description: document.getElementById('lm-desc').value.trim(),
            latitude: Number(document.getElementById('lm-lat').value),
            longitude: Number(document.getElementById('lm-lng').value),
            categories: ['historical'],
            category_names: [AR.HISTORICAL],
            is_active: true
        };
    }

    async function submitLandmarkForm(event) {
        event.preventDefault();
        const payload = makeLandmarkPayload();
        if (!payload.name || !payload.city_id) {
            showToast(AR.REQUIRED_LANDMARK_FIELDS, 'info');
            return;
        }

        try {
            if (editingLandmarkId) {
                await apiRequest(`/landmarks/${editingLandmarkId}`, { method: 'PUT', body: payload });
                showToast(AR.LANDMARK_UPDATED, 'success');
            } else {
                await apiRequest('/landmarks', { method: 'POST', body: payload });
                showToast(AR.LANDMARK_CREATED, 'success');
            }

            invalidateSessionCache();
            landmarksLoaded = false;
            if (landmarkForm) landmarkForm.style.display = 'none';
            await Promise.all([loadBaseData(false), ensureLandmarksLoaded(false)]);
            document.querySelector('.admin-nav li[data-target="landmarks"]')?.click();
        } catch (error) {
            showToast(error.message || AR.LANDMARK_SAVE_FAILED, 'info');
        }
    }

    async function editLandmark(id) {
        await ensureLandmarksLoaded(true);
        const landmark = landmarks.find((item) => Number(item.id) === Number(id));
        if (!landmark) {
            showToast(AR.LANDMARK_NOT_FOUND, 'info');
            return;
        }
        editingLandmarkId = Number(id);
        if (landmarkForm) landmarkForm.style.display = 'block';
        if (landmarkFormTitle) landmarkFormTitle.innerHTML = `<i class="fas fa-edit"></i> ${AR.EDIT_LANDMARK_TITLE_PREFIX}${landmark.name}`;
        fillLandmarkForm(landmark);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function deleteLandmark(id) {
        if (!window.confirm(AR.CONFIRM_DELETE_LANDMARK)) return;
        try {
            await apiRequest(`/landmarks/${id}`, { method: 'DELETE' });
            showToast(AR.LANDMARK_DELETED, 'success');
            invalidateSessionCache();
            landmarksLoaded = false;
            await Promise.all([loadBaseData(false), ensureLandmarksLoaded(false)]);
        } catch (error) {
            showToast(error.message || AR.LANDMARK_DELETE_FAILED, 'info');
        }
    }

    async function createCity() {
        const name = window.prompt(AR.CITY_NAME_PROMPT);
        if (!name) return;

        const suggestedSlug = name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-_]/g, '');
        const slug = window.prompt(AR.CITY_SLUG_PROMPT, suggestedSlug || '');
        if (!slug) return;

        const description = window.prompt(AR.CITY_DESC_PROMPT, '') || '';

        try {
            await apiRequest('/cities', { method: 'POST', body: { name, slug, description, status: 'published' } });
            showToast(AR.CITY_CREATED, 'success');
            invalidateSessionCache();
            await loadBaseData(false);
            document.querySelector('.admin-nav li[data-target="cities"]')?.click();
        } catch (error) {
            showToast(error.message || AR.CITY_CREATE_FAILED, 'info');
        }
    }

    async function editCity(slug) {
        const city = cities.find((item) => item.slug === slug);
        if (!city) {
            showToast(AR.CITY_NOT_FOUND, 'info');
            return;
        }

        const name = window.prompt(AR.CITY_EDIT_NAME, city.name || '');
        if (!name) return;
        const description = window.prompt(AR.CITY_EDIT_DESC, city.description || '') || '';
        const statusInput = window.prompt(AR.CITY_EDIT_STATUS, city.status || 'published') || city.status || 'published';
        const status = statusInput === 'draft' ? 'draft' : 'published';

        try {
            await apiRequest(`/cities/${slug}`, { method: 'PUT', body: { name, slug: city.slug, description, status } });
            showToast(AR.CITY_UPDATED, 'success');
            invalidateSessionCache();
            await loadBaseData(false);
        } catch (error) {
            showToast(error.message || AR.CITY_UPDATE_FAILED, 'info');
        }
    }

    async function deleteCity(slug) {
        if (!window.confirm(AR.CONFIRM_DELETE_CITY)) return;
        try {
            await apiRequest(`/cities/${slug}`, { method: 'DELETE' });
            showToast(AR.CITY_DELETED, 'success');
            invalidateSessionCache();
            landmarksLoaded = false;
            await Promise.all([loadBaseData(false), ensureLandmarksLoaded(false)]);
        } catch (error) {
            showToast(error.message || AR.CITY_DELETE_FAILED, 'info');
        }
    }

    async function logout() {
        try {
            if (authToken) await apiRequest('/auth/logout', { method: 'POST' });
        } catch (_) {
            // Ignore.
        }
        clearSession();
        window.location.href = 'index.html';
    }

    function bindPanels() {
        navItems.forEach((item) => {
            item.addEventListener('click', async (event) => {
                event.preventDefault();
                navItems.forEach((nav) => nav.classList.remove('active'));
                item.classList.add('active');
                updateTopbarState(item.dataset.target);

                const target = document.getElementById(`panel-${item.dataset.target}`);
                panels.forEach((panel) => panel.classList.remove('active'));
                if (target) target.classList.add('active');

                if (item.dataset.target === 'landmarks' || item.dataset.target === 'dashboard') {
                    try {
                        await ensureLandmarksLoaded(true);
                    } catch (error) {
                        showToast(error.message || AR.LANDMARKS_LOAD_FAILED, 'info');
                    }
                }
            });
        });
    }

    function bindQuickActions() {
        quickActionButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const target = button.dataset.panelJump;
                if (!target) return;
                document.querySelector(`.admin-nav li[data-target="${target}"]`)?.click();
            });
        });
    }

    function bindEvents() {
        bindPanels();
        bindQuickActions();
        document.getElementById('logout-btn')?.addEventListener('click', (event) => {
            event.preventDefault();
            logout();
        });
        cityFormButton?.addEventListener('click', (event) => {
            event.preventDefault();
            createCity();
        });
        landmarkSubmitForm?.addEventListener('submit', submitLandmarkForm);
        settingsForm?.addEventListener('submit', saveDashboardPreferences);
    }

    async function boot() {
        if (!authToken) {
            window.location.href = 'admin-login.html';
            return;
        }

        setMaskText(AR.CHECKING_PERMS);
        updateTopbarState('dashboard');
        loadDashboardPreferences();
        startClock();

        try {
            const me = await apiRequest('/auth/me');
            const user = me.data || {};
            if (user.role !== 'admin') throw new Error(AR.ACCOUNT_NOT_ADMIN);

            if (adminName) adminName.textContent = user.name || 'admin';
            await loadBaseData(true);
            renderLandmarksTable();
            renderCharts();
            syncDashboardInsights();
            hideMask();

            ensureLandmarksLoaded(true).catch((error) => {
                showToast(error.message || AR.LANDMARKS_LOAD_FAILED, 'info');
            });
        } catch (error) {
            clearSession();
            setMaskText(error.message || AR.SESSION_VERIFY_FAILED);
            setTimeout(() => {
                window.location.href = 'admin-login.html';
            }, 900);
        }
    }

    window.openAddLandmarkForm = openAddLandmarkForm;
    window.editLandmark = editLandmark;
    window.deleteLandmark = deleteLandmark;
    window.editCity = editCity;
    window.deleteCity = deleteCity;

    document.addEventListener('DOMContentLoaded', () => {
        bindEvents();
        boot();
    });
})();
