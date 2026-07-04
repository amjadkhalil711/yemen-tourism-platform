// Authentication for map access on static pages.
window.initAuthSystem = function() {
    // Only bind global event listeners once
    if (window._authSystemInitialized) return;
    window._authSystemInitialized = true;

    const AR = {
        USER_DEFAULT: '\u0645\u0633\u062a\u062e\u062f\u0645',
        WELCOME: '\u0623\u0647\u0644\u0627\u064b \u0628\u0643\u060c',
        LOGOUT: '\u062a\u0633\u062c\u064a\u0644 \u062e\u0631\u0648\u062c',
        LOGOUT_OK: '\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c \u0645\u0646 \u062d\u0633\u0627\u0628\u0643.',
        REGISTER_OK: '\u062a\u0645 \u0627\u0644\u062a\u0633\u062c\u064a\u0644 \u0628\u0646\u062c\u0627\u062d! \u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u0622\u0646 \u0645\u0634\u0627\u0647\u062f\u0629 \u0627\u0644\u062e\u0631\u064a\u0637\u0629.',
        REGISTER_FALLBACK: '\u062a\u0639\u0630\u0631 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0627\u0644\u062e\u0627\u062f\u0645. \u062a\u0645 \u0627\u0644\u062a\u0633\u062c\u064a\u0644 \u0645\u062d\u0644\u064a\u064b\u0627 \u0645\u0624\u0642\u062a\u064b\u0627.',
        REGISTER_ERR: '\u0641\u0634\u0644 \u0627\u0644\u062a\u0633\u062c\u064a\u0644. \u062a\u0623\u0643\u062f \u0645\u0646 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0623\u0648 \u062d\u0627\u0648\u0644 \u0644\u0627\u062d\u0642\u064b\u0627.'
    };

    const normalizeApiBase = (value) => String(value || 'http://127.0.0.1:8000/api/v1')
        .replace('http://localhost:8000', 'http://127.0.0.1:8000')
        .replace(/\/+$/, '');
    const API_BASE = normalizeApiBase(window.PT_API_BASE || localStorage.getItem('pt_api_base'));
    let isUserAuthenticated = localStorage.getItem('pt_user_auth') === 'true';
    let pendingMapElement = null;

    function persistUserSession(payload, fallbackName, fallbackEmail) {
        const user = payload?.data?.user || {};
        const userId = payload?.data?.user_id ?? user.id ?? null;
        const userName = user.name || fallbackName || AR.USER_DEFAULT;
        const userEmail = user.email || fallbackEmail || '';
        const token = payload?.data?.token || '';

        isUserAuthenticated = true;
        localStorage.setItem('pt_user_auth', 'true');
        localStorage.setItem('pt_user_name', userName);
        localStorage.setItem('pt_user_email', userEmail);
        if (userId !== null && userId !== undefined) {
            localStorage.setItem('pt_user_id', String(userId));
        }
        if (token) {
            localStorage.setItem('pt_user_token', token);
        }
        localStorage.setItem('pt_api_base', API_BASE);
    }

    function saveUserForAdminPanel(name, email) {
        let dummyUsers = [];
        try {
            dummyUsers = JSON.parse(localStorage.getItem('pt_dummy_users') || '[]');
        } catch (_) {
            dummyUsers = [];
        }

        const nowDate = new Date().toLocaleDateString('ar-EG');
        const existingIndex = dummyUsers.findIndex((item) => String(item.email || '').toLowerCase() === String(email || '').toLowerCase());
        const row = { name, email, date: nowDate };
        if (existingIndex >= 0) {
            dummyUsers[existingIndex] = row;
        } else {
            dummyUsers.push(row);
        }
        localStorage.setItem('pt_dummy_users', JSON.stringify(dummyUsers));
    }

    async function loginUserViaApi(name, email) {
        const response = await fetch(`${API_BASE}/auth/user-login`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email })
        });

        let payload = {};
        try {
            payload = await response.json();
        } catch (_) {
            payload = {};
        }

        if (!response.ok || payload?.status === 'error') {
            const message = payload?.message || AR.REGISTER_ERR;
            const error = new Error(message);
            error.isApiError = true;
            throw error;
        }

        return payload;
    }

    function completeLoginFlow(name, email, payload) {
        persistUserSession(payload, name, email);
        updateSidebarAuth();
        saveUserForAdminPanel(name, email);
        
        const userAuthModal = document.getElementById('user-auth-modal');
        if (userAuthModal) {
            userAuthModal.classList.remove('active');
            userAuthModal.style.display = 'none';
        }

        if (pendingMapElement) {
            const toClick = pendingMapElement;
            pendingMapElement = null;
            requestAnimationFrame(() => toClick.click());
        }
    }

    function syncServerSession(payload, name, email) {
        persistUserSession(payload, name, email);
        updateSidebarAuth();
        saveUserForAdminPanel(name, email);
    }

    window.updateSidebarAuth = function() {
        const authContainer = document.getElementById('sidebar-user-auth');
        const sidebarNav = document.querySelector('.sidebar nav');
        if (!sidebarNav) return;

        if (isUserAuthenticated) {
            const userName = localStorage.getItem('pt_user_name') || AR.USER_DEFAULT;

            if (!authContainer) {
                const div = document.createElement('div');
                div.id = 'sidebar-user-auth';
                div.className = 'nav-section';
                div.innerHTML = `
                    <div style="padding: 15px; background: rgba(0,0,0,0.2); margin: 10px; border-radius: 8px; text-align: center;">
                        <p style="color: white; margin-bottom: 10px; font-weight: bold;"><i class="fas fa-user-circle"></i> ${AR.WELCOME} <span id="auth-display-name">${userName}</span></p>
                        <button id="user-logout-btn" class="btn-small" style="background:var(--pt-warning); width:100%"><i class="fas fa-sign-out-alt"></i> ${AR.LOGOUT}</button>
                    </div>
                `;
                sidebarNav.appendChild(div);

                document.getElementById('user-logout-btn')?.addEventListener('click', () => {
                    localStorage.removeItem('pt_user_auth');
                    localStorage.removeItem('pt_user_name');
                    localStorage.removeItem('pt_user_email');
                    localStorage.removeItem('pt_user_id');
                    localStorage.removeItem('pt_user_token');
                    isUserAuthenticated = false;
                    window.updateSidebarAuth();
                    if(window.showToast) window.showToast(AR.LOGOUT_OK, 'success');
                });
            } else {
                authContainer.style.display = 'block';
                const nameNode = document.getElementById('auth-display-name');
                if (nameNode) nameNode.textContent = userName;
            }
        } else if (authContainer) {
            authContainer.style.display = 'none';
        }
    }

    // Call once to configure sidebar if present
    window.updateSidebarAuth();

    // Event Delegation for clicks (handles dynamic Vue elements!)
    document.addEventListener('click', (e) => {
        // Modal Closing
        if (e.target && (e.target.id === 'close-auth-modal' || e.target.closest('#close-auth-modal'))) {
            const userAuthModal = document.getElementById('user-auth-modal');
            if (userAuthModal) {
                userAuthModal.classList.remove('active');
                userAuthModal.style.display = 'none';
            }
            pendingMapElement = null;
            return;
        }

        // Intercept map triggers
        let target = e.target;
        while (target && target !== document) {
            const isMapTrigger = (target.classList && target.classList.contains('view-map')) || target.id === 'show-directions';
            if (isMapTrigger) {
                if (!isUserAuthenticated) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    
                    const userAuthModal = document.getElementById('user-auth-modal');
                    if (userAuthModal) {
                        userAuthModal.classList.add('active');
                        userAuthModal.style.display = 'flex';
                        pendingMapElement = target;
                    }
                }
                return; // Let standard flow handle it if authenticated
            }
            target = target.parentNode;
        }
    }, true);

    // Event Delegation for form submission
    document.addEventListener('submit', async (e) => {
        if (e.target && e.target.id === 'user-auth-form') {
            e.preventDefault();
            
            const name = document.getElementById('auth-name')?.value?.trim();
            const email = document.getElementById('auth-email')?.value?.trim();
            if (!name || !email) return;

            completeLoginFlow(name, email, null);
            if(window.showToast) window.showToast(AR.REGISTER_OK, 'success');

            loginUserViaApi(name, email)
                .then((payload) => syncServerSession(payload, name, email))
                .catch(() => {
                    if(window.showToast) window.showToast(AR.REGISTER_FALLBACK, 'error');
                });
        }
    });

    if (!window.showToast) {
        window.showToast = function showToast(message, type = 'success') {
            let toast = document.getElementById('pt-toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'pt-toast';
                toast.className = 'pt-toast';
                document.body.appendChild(toast);
            }

            toast.className = `pt-toast ${type} show`;
            const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
            toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;

            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        };
    }
};
