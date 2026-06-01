(function () {
    'use strict';

    const STORAGE_KEY = 'pt_legacy_season_theme';
    const THEMES = [
        {
            id: 'spring',
            shortLabel: '\u0627\u0644\u0631\u0628\u064a\u0639',
            label: 'ثيم الربيع',
            note: 'أوراق وبراعم ولمسة مزهرة',
            emoji: '🌿'
        },
        {
            id: 'winter',
            shortLabel: '\u0627\u0644\u0634\u062a\u0627\u0621',
            label: 'ثيم الشتاء',
            note: 'ثلوج وضباب وجو بارد فاخر',
            emoji: '❄️'
        },
        {
            id: 'autumn',
            shortLabel: '\u0627\u0644\u062e\u0631\u064a\u0641',
            label: 'ثيم الخريف',
            note: 'أوراق متساقطة ودفء ترابي',
            emoji: '🍂'
        },
        {
            id: 'summer',
            shortLabel: '\u0627\u0644\u0635\u064a\u0641',
            label: 'ثيم الصيف',
            note: 'سحب ومطر وأجواء منعشة',
            emoji: '🌧️'
        }
    ];

    let switcherRoot = null;
    let handleTitle = null;
    let handleNote = null;
    let switcherPlacement = 'floating';

    function detectDefaultTheme() {
        const month = new Date().getMonth() + 1;
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'autumn';
        return 'winter';
    }

    function getPreferredTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (THEMES.some((theme) => theme.id === saved)) {
            return saved;
        }
        return detectDefaultTheme();
    }

    function ensureAmbientLayer() {
        let layer = document.querySelector('.season-theme-layer');
        if (layer) return layer;

        layer = document.createElement('div');
        layer.className = 'season-theme-layer';
        layer.setAttribute('aria-hidden', 'true');
        layer.innerHTML = '<div class="season-cloud-bank"></div><div class="season-weather"></div>';
        document.body.prepend(layer);
        return layer;
    }

    function buildThemeOption(theme) {
        return `
            <button type="button" class="season-theme-option" data-season-option="${theme.id}">
                <span class="season-theme-emoji">${theme.emoji}</span>
                <span class="season-theme-copy">
                    <strong>${theme.label}</strong>
                    <span>${theme.note}</span>
                </span>
                <span class="season-theme-check">✓</span>
            </button>
        `;
    }

    function findSwitcherHost() {
        const candidates = [
            { selector: '.admin-topbar .topbar-meta', placement: 'topbar', insert: 'append' },
            { selector: '.page-header .container', placement: 'page-header', insert: 'prepend' },
            { selector: '.hero-content', placement: 'hero', insert: 'prepend' },
            { selector: '.login-form-panel', placement: 'login', insert: 'prepend' }
        ];

        for (const candidate of candidates) {
            const element = document.querySelector(candidate.selector);
            if (element) {
                return { element, placement: candidate.placement, insert: candidate.insert };
            }
        }

        return { element: document.body, placement: 'floating', insert: 'append' };
    }

    function ensureThemeSwitcher() {
        if (switcherRoot) return switcherRoot;

        const host = findSwitcherHost();
        switcherPlacement = host.placement;
        switcherRoot = document.createElement('div');
        switcherRoot.className = `season-theme-switcher season-theme-switcher--${switcherPlacement}`;
        switcherRoot.innerHTML = `
            <button type="button" class="season-theme-handle" id="season-theme-handle">
                <span>
                    <strong>الثيمات الموسمية</strong>
                    <small id="season-theme-handle-note">اختر الجو الذي يناسبك</small>
                </span>
                <span id="season-theme-handle-title">ربيع</span>
            </button>
            <div class="season-theme-panel">
                <div class="season-theme-head">
                    <strong>اختر ثيم الموقع</strong>
                    <span>سيتم حفظ اختيارك وتطبيقه على صفحات الـ Legacy كلها.</span>
                </div>
                ${THEMES.map(buildThemeOption).join('')}
            </div>
        `;

        if (host.insert === 'prepend') {
            host.element.prepend(switcherRoot);
        } else {
            host.element.appendChild(switcherRoot);
        }

        handleTitle = switcherRoot.querySelector('#season-theme-handle-title');
        handleNote = switcherRoot.querySelector('#season-theme-handle-note');

        switcherRoot.querySelector('#season-theme-handle')?.addEventListener('click', (event) => {
            event.stopPropagation();
            switcherRoot.classList.toggle('open');
        });

        switcherRoot.querySelector('.season-theme-panel')?.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        switcherRoot.querySelectorAll('[data-season-option]').forEach((button) => {
            button.addEventListener('click', () => {
                const themeId = button.getAttribute('data-season-option');
                applyTheme(themeId);
                switcherRoot.classList.remove('open');
            });
        });

        document.addEventListener('click', (event) => {
            if (switcherRoot && !switcherRoot.contains(event.target)) {
                switcherRoot.classList.remove('open');
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                switcherRoot?.classList.remove('open');
            }
        });

        return switcherRoot;
    }

    function setParticleStyles(node, config) {
        node.style.setProperty('--left', `${config.left}%`);
        node.style.setProperty('--size', `${config.size}px`);
        node.style.setProperty('--duration', `${config.duration}s`);
        node.style.setProperty('--delay', `${config.delay}s`);
        node.style.setProperty('--drift-x', `${config.driftX}vw`);
        node.style.setProperty('--opacity', String(config.opacity));
        if (typeof config.top === 'number') {
            node.style.setProperty('--top', `${config.top}%`);
        }
        if (typeof config.width === 'number') {
            node.style.setProperty('--width', `${config.width}rem`);
        }
    }

    function createParticle(className, config) {
        const node = document.createElement('span');
        node.className = `seasonal-particle ${className}`;
        setParticleStyles(node, config);
        return node;
    }

    function randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    function renderSpring(weather) {
        for (let index = 0; index < 12; index += 1) {
            weather.appendChild(createParticle('spring-leaf', {
                left: randomBetween(2, 98),
                size: randomBetween(12, 24),
                duration: randomBetween(13, 19),
                delay: randomBetween(-18, 0),
                driftX: randomBetween(-14, 16),
                opacity: randomBetween(0.45, 0.9)
            }));
        }

        for (let index = 0; index < 12; index += 1) {
            weather.appendChild(createParticle('spring-petal', {
                left: randomBetween(2, 98),
                size: randomBetween(10, 18),
                duration: randomBetween(14, 21),
                delay: randomBetween(-16, 0),
                driftX: randomBetween(-16, 12),
                opacity: randomBetween(0.4, 0.85)
            }));
        }

        for (let index = 0; index < 6; index += 1) {
            weather.appendChild(createParticle('spring-bud', {
                left: randomBetween(6, 94),
                size: randomBetween(18, 28),
                duration: randomBetween(8, 12),
                delay: randomBetween(-8, 0),
                driftX: randomBetween(-3, 3),
                opacity: randomBetween(0.35, 0.7),
                top: randomBetween(14, 84)
            }));
        }
    }

    function renderWinter(weather) {
        for (let index = 0; index < 34; index += 1) {
            weather.appendChild(createParticle('winter-flake', {
                left: randomBetween(1, 99),
                size: randomBetween(6, 14),
                duration: randomBetween(9, 18),
                delay: randomBetween(-18, 0),
                driftX: randomBetween(-6, 8),
                opacity: randomBetween(0.45, 0.95)
            }));
        }
    }

    function renderAutumn(weather) {
        for (let index = 0; index < 18; index += 1) {
            weather.appendChild(createParticle('autumn-leaf', {
                left: randomBetween(1, 99),
                size: randomBetween(14, 24),
                duration: randomBetween(11, 17),
                delay: randomBetween(-17, 0),
                driftX: randomBetween(-14, 13),
                opacity: randomBetween(0.5, 0.92)
            }));
        }
    }

    function renderSummer(weather, clouds) {
        for (let index = 0; index < 26; index += 1) {
            weather.appendChild(createParticle('summer-drop', {
                left: randomBetween(1, 99),
                size: randomBetween(60, 108),
                duration: randomBetween(1.1, 1.9),
                delay: randomBetween(-2, 0),
                driftX: randomBetween(-2, 2),
                opacity: randomBetween(0.35, 0.78)
            }));
        }

        for (let index = 0; index < 5; index += 1) {
            const cloud = document.createElement('span');
            cloud.className = 'season-cloud';
            setParticleStyles(cloud, {
                left: 0,
                size: 0,
                duration: randomBetween(28, 44),
                delay: randomBetween(-18, 0),
                driftX: 0,
                opacity: randomBetween(0.52, 0.9),
                top: randomBetween(4, 28),
                width: randomBetween(10, 18)
            });
            clouds.appendChild(cloud);
        }
    }

    function renderThemeDecor(themeId) {
        const layer = ensureAmbientLayer();
        const weather = layer.querySelector('.season-weather');
        const clouds = layer.querySelector('.season-cloud-bank');
        if (!weather || !clouds) return;

        weather.replaceChildren();
        clouds.replaceChildren();

        switch (themeId) {
            case 'winter':
                renderWinter(weather);
                break;
            case 'autumn':
                renderAutumn(weather);
                break;
            case 'summer':
                renderSummer(weather, clouds);
                break;
            case 'spring':
            default:
                renderSpring(weather);
                break;
        }
    }

    function syncSwitcherState(themeId) {
        const theme = THEMES.find((item) => item.id === themeId) || THEMES[0];
        if (handleTitle) handleTitle.textContent = theme.shortLabel || theme.id;
        if (handleNote) handleNote.textContent = theme.note;

        switcherRoot?.querySelectorAll('[data-season-option]').forEach((button) => {
            button.classList.toggle('active', button.getAttribute('data-season-option') === themeId);
        });
    }

    function applyTheme(themeId) {
        if (!THEMES.some((theme) => theme.id === themeId)) return;

        THEMES.forEach((theme) => {
            document.body.classList.remove(`season-${theme.id}`);
        });

        document.body.classList.add(`season-${themeId}`);
        document.body.dataset.seasonTheme = themeId;
        localStorage.setItem(STORAGE_KEY, themeId);
        renderThemeDecor(themeId);
        syncSwitcherState(themeId);
    }

    function init() {
        if (!document.body) return;
        ensureAmbientLayer();
        ensureThemeSwitcher();
        applyTheme(getPreferredTheme());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
