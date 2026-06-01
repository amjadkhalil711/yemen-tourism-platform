// i18n support for landmarks view
function getLandmarksLocale() {
    try { return localStorage.getItem('yemen_locale') || 'ar'; } catch(e) { return 'ar'; }
}

function getLandmarksData() {
    var lang = getLandmarksLocale();
    if (lang === 'en' && window.updatedLandmarksDataEn) {
        return window.updatedLandmarksDataEn;
    }
    return window.updatedLandmarksData || {};
}

var _lmI18n = {
    ar: {
        backToCities: 'العودة للمدن',
        landmarksOf: 'معالم مدينة ',
        filterLandmarks: 'تصفية المعالم',
        searchPlaceholder: 'ابحث عن معلم سياحي...',
        all: 'الكل',
        historical: 'تاريخي',
        architectural: 'معماري',
        religious: 'ديني',
        natural: 'طبيعي',
        coastal: 'ساحلي',
        cultural: 'ثقافي',
        recreational: 'ترفيهي',
        viewDetails: 'عرض التفاصيل',
        viewMap: 'عرض الخريطة',
        worthVisiting: 'يستحق الزيارة',
        discoverPath: 'اكتشف المسار',
        directAdventure: 'طريقك المباشر نحو المغامرة',
        travelCompanions: 'رفاق الرحلة',
        bestGuides: 'أفضل المرشدين لرحلة لا تُنسى',
        directionsTo: 'الاتجاهات إلى ',
        howToReach: 'كيفية الوصول',
        guidesFor: 'المرشدون السياحيون لـ ',
        guide1Name: 'أحمد محمد',
        guide1Desc: 'مرشد سياحي متخصص في المعالم التاريخية والأثرية',
        guide2Name: 'سارة علي',
        guide2Desc: 'مرشدة سياحية متخصصة في الثقافة والتراث اليمني',
        guide3Name: 'خالد عبدالله',
        guide3Desc: 'مرشد سياحي ذو خبرة واسعة في المعالم الطبيعية والبيئية',
        speaksLangs: 'يتحدث العربية والإنجليزية',
        guide2Langs: 'تتحدث العربية والإنجليزية والفرنسية',
        contactBtn: 'التواصل',
        directionsTemplate: function(lName, cName) { return 'يمكنك الوصول إلى ' + lName + ' عن طريق استخدام خدمات النقل المحلية أو سيارات الأجرة. المعلم يقع في موقع مميز في مدينة ' + cName + '. للحصول على إرشادات دقيقة، يرجى الاتصال بمكتب السياحة المحلي أو استخدام تطبيقات الخرائط على هاتفك الذكي.'; },
        mapLoadFailed: 'تعذر تحميل الخريطة. يرجى التحقق من اتصالك بالإنترنت.',
        location: 'الموقع',
        welcomeYemen: 'مرحباً بك في عبق اليمن',
        themeHistorical: 'استنشق عبق التاريخ والأصالة',
        themeCoastal: 'أهلاً بك في سحر الشواطئ وعالم البحار',
        themeMountain: 'عانق السحاب والطبيعة الخضراء الساحرة',
        themeDesert: 'سحر الرمال الذهبية ودفء الصحراء',
        themeIsland: 'لؤلؤة فريدة وسط المحيط',
        landmarksOfSidebar: 'معالم ',
        tourismHistorical: 'السياحة الأثرية والتاريخية',
        tourismNatural: 'السياحة الطبيعية',
        tourismReligious: 'السياحة الدينية',
        tourismCoastal: 'السياحة الشاطئية',
        tourismRecreational: 'سياحة المغامرات والترفيه',
        tourismDiverse: 'السياحة المتنوعة',
        landmarksOfType: 'معالم ',
        noLandmarksFound: 'لم يتم العثور على معالم من هذا النوع. يرجى تحديد نوع آخر.',
        guideInCity: ' في ',
    },
    en: {
        backToCities: 'Back to Cities',
        landmarksOf: 'Landmarks of ',
        filterLandmarks: 'Filter Landmarks',
        searchPlaceholder: 'Search for a landmark...',
        all: 'All',
        historical: 'Historical',
        architectural: 'Architectural',
        religious: 'Religious',
        natural: 'Natural',
        coastal: 'Coastal',
        cultural: 'Cultural',
        recreational: 'Recreational',
        viewDetails: 'View Details',
        viewMap: 'View Map',
        worthVisiting: 'Worth Visiting',
        discoverPath: 'Discover the Path',
        directAdventure: 'Your direct route to adventure',
        travelCompanions: 'Travel Companions',
        bestGuides: 'The best guides for an unforgettable trip',
        directionsTo: 'Directions to ',
        howToReach: 'How to Reach',
        guidesFor: 'Tour Guides for ',
        guide1Name: 'Ahmed Mohammed',
        guide1Desc: 'Tour guide specializing in historical and archaeological landmarks',
        guide2Name: 'Sarah Ali',
        guide2Desc: 'Tour guide specializing in Yemeni culture and heritage',
        guide3Name: 'Khalid Abdullah',
        guide3Desc: 'Experienced tour guide in natural and environmental landmarks',
        speaksLangs: 'Speaks Arabic and English',
        guide2Langs: 'Speaks Arabic, English, and French',
        contactBtn: 'Contact',
        directionsTemplate: function(lName, cName) { return 'You can reach ' + lName + ' using local transportation or taxis. The landmark is located in a prime location in ' + cName + '. For precise directions, please contact the local tourism office or use maps apps on your smartphone.'; },
        mapLoadFailed: 'Could not load the map. Please check your internet connection.',
        location: 'Location',
        welcomeYemen: 'Welcome to the essence of Yemen',
        themeHistorical: 'Breathe in the essence of history and authenticity',
        themeCoastal: 'Welcome to the magic of beaches and the world of seas',
        themeMountain: 'Embrace the clouds and enchanting green nature',
        themeDesert: 'The magic of golden sands and the warmth of the desert',
        themeIsland: 'A unique pearl in the heart of the ocean',
        landmarksOfSidebar: 'Landmarks of ',
        tourismHistorical: 'Historical & Archaeological Tourism',
        tourismNatural: 'Nature Tourism',
        tourismReligious: 'Religious Tourism',
        tourismCoastal: 'Beach Tourism',
        tourismRecreational: 'Adventure & Recreation Tourism',
        tourismDiverse: 'Diverse Tourism',
        landmarksOfType: 'Landmarks: ',
        noLandmarksFound: 'No landmarks of this type were found. Please select another type.',
        guideInCity: ' in ',
    }
};

function _lt(key) {
    var lang = getLandmarksLocale();
    return (_lmI18n[lang] && _lmI18n[lang][key]) || (_lmI18n['ar'][key]) || key;
}

// تحديث آلية عرض المعالم السياحية
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة عرض المعالم
    initLandmarksView();
    
    // تهيئة تصفية المدن
    if (document.querySelector('.filter-options')) {
        initCityFilters();
    }
    
    // تهيئة الشريط الجانبي
    initSidebar();
});

function resolveLandmarkImagePath(imagePath) {
    if (!imagePath) return 'images/placeholder.jpg';
    if (/^(https?:)?\/\//.test(imagePath) || imagePath.startsWith('images/') || imagePath.startsWith('/images/')) {
        return imagePath;
    }
    return `images/${imagePath.replace(/^\.?\//, '')}`;
}

function normalizeLandmarkCategoryToken(value) {
    var normalized = String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ');

    var aliases = {
        'تاريخي': 'historical',
        'تاريخية': 'historical',
        'historical': 'historical',
        'معماري': 'architectural',
        'معمارية': 'architectural',
        'architectural': 'architectural',
        'ديني': 'religious',
        'دينية': 'religious',
        'religious': 'religious',
        'طبيعي': 'natural',
        'طبيعية': 'natural',
        'natural': 'natural',
        'ساحلي': 'coastal',
        'ساحلية': 'coastal',
        'coastal': 'coastal',
        'ثقافي': 'cultural',
        'ثقافية': 'cultural',
        'cultural': 'cultural',
        'ترفيهي': 'recreational',
        'ترفيهية': 'recreational',
        'recreational': 'recreational',
        'الكل': 'all',
        'all': 'all'
    };

    return aliases[normalized] || normalized;
}

function getNormalizedLandmarkCategories(value) {
    if (Array.isArray(value)) {
        var collected = [];
        value.forEach(function(item) {
            getNormalizedLandmarkCategories(item).forEach(function(token) {
                if (token) collected.push(token);
            });
        });
        return collected;
    }

    var tokens = [];
    String(value || '')
        .split(/[|,/]+/)
        .forEach(function(part) {
            String(part || '')
                .split(/\s+/)
                .forEach(function(piece) {
                    var normalized = normalizeLandmarkCategoryToken(piece);
                    if (normalized) tokens.push(normalized);
                });
        });

    return tokens;
}

// تهيئة عرض المعالم
function initLandmarksView() {
    const viewButtons = document.querySelectorAll('.view-landmarks');
    const citiesList = document.querySelector('.cities-list');
    
    // إنشاء حاوية المعالم إذا لم تكن موجودة
    let landmarksContainer = document.getElementById('landmarks-container');
    if (!landmarksContainer) {
        landmarksContainer = document.createElement('section');
        landmarksContainer.id = 'landmarks-container';
        landmarksContainer.className = 'landmarks-container';
        landmarksContainer.style.display = 'none';
        
        var _arrowIcon = getLandmarksLocale() === 'en' ? 'fa-arrow-left' : 'fa-arrow-right';
        var _homeText = getLandmarksLocale() === 'en' ? 'Return to Home' : 'العودة للصفحة الرئيسية';
        landmarksContainer.innerHTML = `
            <div class="container">
                <div class="landmarks-header">
                    <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                        <button class="btn-back" onclick="window.backToCities && window.backToCities()"><i class="fas ${_arrowIcon}"></i> ${_lt('backToCities')}</button>
                        <a href="/" class="btn-back" style="text-decoration: none; background: linear-gradient(135deg, #10b981 0%, #047857 100%); color: white; border: none; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);"><i class="fas fa-home"></i> ${_homeText}</a>
                    </div>
                    <h2>${_lt('landmarksOf')}<span id="city-name"></span></h2>
                </div>
                
                <div class="landmarks-filter">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; margin-bottom: 15px; gap: 10px;">
                        <h3 style="margin: 0;">${_lt('filterLandmarks')}</h3>
                        <div class="search-box" style="position: relative; flex-grow: 1; max-width: 400px;">
                            <input type="text" id="landmark-search-input" oninput="window.handleLandmarkSearch && window.handleLandmarkSearch()" placeholder="${_lt('searchPlaceholder')}" style="width: 100%; padding: 12px 15px 12px 40px; border-radius: 25px; border: 2px solid #e0e0e0; font-family: inherit; font-size: 1rem; transition: 0.3s; box-sizing: border-box;">
                            <i class="fas fa-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #888;"></i>
                        </div>
                    </div>
                    <div class="filter-options">
                        <button class="landmark-filter-btn active" data-filter="all">${_lt('all')}</button>
                        <button class="landmark-filter-btn" data-filter="historical">${_lt('historical')}</button>
                        <button class="landmark-filter-btn" data-filter="architectural">${_lt('architectural')}</button>
                        <button class="landmark-filter-btn" data-filter="religious">${_lt('religious')}</button>
                        <button class="landmark-filter-btn" data-filter="natural">${_lt('natural')}</button>
                        <button class="landmark-filter-btn" data-filter="coastal">${_lt('coastal')}</button>
                        <button class="landmark-filter-btn" data-filter="cultural">${_lt('cultural')}</button>
                        <button class="landmark-filter-btn" data-filter="recreational">${_lt('recreational')}</button>
                    </div>
                </div>
                
                <div class="landmarks-grid" id="landmarks-grid"></div>
            </div>
            
            <!-- نافذة تفاصيل المعلم - نسخة بريميوم -->
            <div id="landmark-modal" class="modal premium-landmark-modal">
                <div class="premium-modal-backdrop close-modal"></div>
                <div class="modal-content premium-modal-content">
                    <button class="premium-close-btn close-modal"><i class="fas fa-times"></i></button>
                    
                    <div class="premium-modal-hero">
                        <div class="modal-slider-container">
                            <div id="modal-slider" class="modal-slider"></div>
                            <div class="slider-gradient-overlay"></div>
                            <button class="slider-btn prev"><i class="fas fa-chevron-right"></i></button>
                            <button class="slider-btn next"><i class="fas fa-chevron-left"></i></button>
                            <div class="premium-hero-content">
                                <span id="modal-category-badge" class="premium-badge"></span>
                                <h2 id="modal-title" class="premium-title"></h2>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-info premium-info-section">
                        <div class="premium-description-card">
                            <div class="premium-quote-icon"><i class="fas fa-quote-right"></i></div>
                            <p id="modal-description" class="premium-description-text"></p>
                        </div>
                        
                        <div class="premium-action-cards">
                            <div class="action-card" id="show-directions">
                                <div class="action-icon"><i class="fas fa-map-marked-alt"></i></div>
                                <div class="action-text">
                                    <h4>${_lt('discoverPath')}</h4>
                                    <p>${_lt('directAdventure')}</p>
                                </div>
                                <i class="fas fa-arrow-left action-arrow"></i>
                            </div>
                            
                            <div class="action-card" id="show-guides">
                                <div class="action-icon"><i class="fas fa-user-tie"></i></div>
                                <div class="action-text">
                                    <h4>${_lt('travelCompanions')}</h4>
                                    <p>${_lt('bestGuides')}</p>
                                </div>
                                <i class="fas fa-arrow-left action-arrow"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- نافذة الخريطة -->
            <div id="map-modal" class="modal">
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>${_lt('directionsTo')}<span id="map-landmark-name"></span></h2>
                    
                    <div id="map" class="map-container"></div>
                    
                    <div class="directions-info">
                        <h3>${_lt('howToReach')}</h3>
                        <p id="directions-text"></p>
                    </div>
                </div>
            </div>
            
            <!-- نافذة المرشدين السياحيين -->
            <div id="guides-modal" class="modal">
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>${_lt('guidesFor')}<span id="guides-landmark-name"></span></h2>
                    
                    <div id="guides-list" class="guides-list"></div>
                </div>
            </div>
        `;
        
        // إضافة حاوية المعالم إلى الصفحة
        if (citiesList) {
            citiesList.parentNode.insertBefore(landmarksContainer, citiesList.nextSibling);
        } else {
            document.querySelector('main').appendChild(landmarksContainer);
        }
    }
    
    // تفعيل أزرار عرض المعالم
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const dynamic = window.__DYNAMIC_CITIES__ || {};
            const currentCitiesData = Object.assign({}, getLandmarksData(), dynamic);
            const cityId = this.getAttribute('data-city');
            window.currentActiveCityId = cityId; // Save for language switching
            const cityData = currentCitiesData[cityId];
            
            if (cityData) {
                // استخراج طبيعة المدينة للحصول على الثيم
                const cityBox = this.closest('.city-box');
                const categories = cityBox ? cityBox.getAttribute('data-category') : 'default';
                let themeClass = 'magic-theme-default';
                let magicSubtitleText = _lt('welcomeYemen');
                
                if (categories.includes('historical')) { themeClass = 'magic-theme-historical'; magicSubtitleText = _lt('themeHistorical'); }
                else if (categories.includes('coastal')) { themeClass = 'magic-theme-coastal'; magicSubtitleText = _lt('themeCoastal'); }
                else if (categories.includes('mountain')) { themeClass = 'magic-theme-mountain'; magicSubtitleText = _lt('themeMountain'); }
                else if (categories.includes('desert')) { themeClass = 'magic-theme-desert'; magicSubtitleText = _lt('themeDesert'); }
                else if (categories.includes('island')) { themeClass = 'magic-theme-island'; magicSubtitleText = _lt('themeIsland'); }
                
                // إنشاء نافذة السحر الانتقالية (Magic Overlay)
                let overlay = document.getElementById('city-magic-overlay');
                if(!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = 'city-magic-overlay';
                    overlay.classList.add('city-magic-overlay');
                    document.body.appendChild(overlay);
                }
                
                // تحديد الثيم والخلفية
                const bgImage = cityBox ? cityBox.querySelector('.city-box-image').style.backgroundImage : '';
                overlay.className = `city-magic-overlay ${themeClass}`;
                overlay.style.backgroundImage = bgImage;
                
                overlay.innerHTML = `
                    <div class="magic-particles"></div>
                    <h1 class="magic-title">${cityData.name}</h1>
                    <h3 class="magic-subtitle">${magicSubtitleText}</h3>
                `;
                
                var shouldAnimateOverlay = !!window.isLanguageSwitching;
                if (shouldAnimateOverlay) {
                    overlay.classList.add('active');
                } else {
                    overlay.classList.remove('active');
                }
                
                // تغيير الدوم في الخلفية بصمت
                setTimeout(() => {
                    // إخفاء قائمة المدن وترويساتها وإظهار قائمة المعالم
                    if (citiesList) {
                        citiesList.style.display = 'none';
                    }
                    const pageHeader = document.querySelector('.page-header');
                    const citiesFilter = document.querySelector('.cities-filter');
                    if (pageHeader) pageHeader.style.display = 'none';
                    if (citiesFilter) citiesFilter.style.display = 'none';
                    
                    landmarksContainer.style.display = 'block';
                    
                    // تعيين اسم المدينة
                    document.getElementById('city-name').textContent = cityData.name;
                    
                    // إنشاء بطاقات المعالم
                    const landmarksGrid = document.getElementById('landmarks-grid');
                    landmarksGrid.innerHTML = '';
                    
                    cityData.landmarks.forEach(landmark => {
                        const landmarkCard = document.createElement('div');
                        landmarkCard.className = 'landmark-card fade-in';
                        const normalizedCategories = getNormalizedLandmarkCategories(landmark.categories || []);
                        const normalizedCategoryNames = getNormalizedLandmarkCategories(landmark.categoryNames || []);
                        const allFilterTokens = Array.from(new Set(normalizedCategories.concat(normalizedCategoryNames)));
                        landmarkCard.setAttribute('data-categories', allFilterTokens.join(' '));
                        
                        // تحديد الفئة الرئيسية للعرض
                        const primaryCategory = landmark.categories[0];
                        const primaryCategoryName = landmark.categoryNames[0];
                        
                        // تحديد صورة المعلم
                        const imagePath = landmark.images && landmark.images.length > 0
                            ? resolveLandmarkImagePath(landmark.images[0])
                            : 'images/placeholder.jpg';
                        
                        landmarkCard.innerHTML = `
                            <div class="landmark-image" style="background-image: url('${imagePath}')"></div>
                            <div class="landmark-info">
                                <span class="landmark-category category-${primaryCategory}">${primaryCategoryName}</span>
                                <h3>${landmark.name}</h3>
                                <p>${landmark.description.substring(0, 150)}...</p>
                                <div class="landmark-actions">
                                    <button class="btn-small view-landmark" data-landmark-id="${landmark.id}">${_lt('viewDetails')}</button>
                                    <button class="btn-small view-map" data-id="${landmark.id}" data-lat="${landmark.coordinates.lat}" data-lng="${landmark.coordinates.lng}" data-name="${landmark.name}" data-google-maps-url="${landmark.googleMapsUrl || ''}">
                                        <i class="fas fa-map-marker-alt"></i> ${_lt('viewMap')}
                                    </button>
                                </div>
                            </div>
                        `;
                        
                        landmarksGrid.appendChild(landmarkCard);
                    });
                    
                    // تفعيل تأثيرات الظهور
                    setTimeout(() => {
                        const fadeElements = document.querySelectorAll('.fade-in');
                        fadeElements.forEach(element => {
                            element.classList.add('visible');
                        });
                    }, 50);
                    
                    // تفعيل تصفية المعالم
                    initLandmarkFilters();
                    
                    // تفعيل عرض تفاصيل المعلم
                    initLandmarkDetails(cityData);
                    
                    // تفعيل عرض الخريطة
                    initLandmarkMaps();
                    
                    // التمرير لأعلى الصفحة تحت الهيدر بقليل
                    window.scrollTo({ top: document.querySelector('.page-header').offsetHeight, behavior: 'instant' });

                    if (shouldAnimateOverlay) {
                        setTimeout(() => {
                            overlay.classList.remove('active');
                        }, 800);
                    } else {
                        overlay.classList.remove('active');
                    }
                    
                }, shouldAnimateOverlay ? 1200 : 0);
            }
        });
    });
    
    // زر العودة للمدن عبر الدالة العامة
}

window.backToCities = function() {
    const landmarksContainer = document.getElementById('landmarks-container');
    const citiesList = document.querySelector('.cities-list');
    const pageHeader = document.querySelector('.page-header');
    const citiesFilter = document.querySelector('.cities-filter');
    
    if (landmarksContainer) landmarksContainer.style.display = 'none';
    if (citiesList) citiesList.style.display = ''; // Fallback to stylesheet default
    if (pageHeader) pageHeader.style.display = '';
    if (citiesFilter) citiesFilter.style.display = '';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};


// تهيئة تصفية المعالم
window.handleLandmarkSearch = function() {
    const searchInput = document.getElementById('landmark-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const activeFilterBtn = document.querySelector('.landmark-filter-btn.active');
    const activeFilter = normalizeLandmarkCategoryToken(activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all');
    
    // Fallback: If for any reason querySelector doesn't find .landmark-card in DOM, 
    // try to get them from the active grid container directly.
    const landmarksGrid = document.getElementById('landmarks-grid');
    if (!landmarksGrid) return;
    
    const currentCards = landmarksGrid.querySelectorAll('.landmark-card');
    
    currentCards.forEach(card => {
        const landmarkName = (card.querySelector('h3')?.textContent || '').toLowerCase();
        const landmarkDesc = (card.querySelector('p')?.textContent || '').toLowerCase();
        const categories = getNormalizedLandmarkCategories(card.getAttribute('data-categories') || card.getAttribute('data-category') || '');
        
        const matchesFilter = activeFilter === 'all' || categories.includes(activeFilter);
        const matchesSearch = landmarkName.includes(query) || landmarkDesc.includes(query);
        
        if (matchesFilter && matchesSearch) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 10);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 200);
        }
    });
};

function initLandmarkFilters() {
    // Only bind button clicks here. The search input is handled via oninput directly.
    const filterContainer = document.querySelector('.landmarks-filter .filter-options');
    if (filterContainer) {
        // Overwrite the element to strip old listeners
        const newContainer = filterContainer.cloneNode(true);
        filterContainer.parentNode.replaceChild(newContainer, filterContainer);
        
        newContainer.addEventListener('click', function(e) {
            if (e.target && e.target.classList.contains('landmark-filter-btn')) {
                newContainer.querySelectorAll('.landmark-filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                window.handleLandmarkSearch();
            }
        });
    }
}

// تهيئة عرض تفاصيل المعلم
function initLandmarkDetails(cityData) {
    const viewButtons = document.querySelectorAll('.view-landmark');
    const landmarkModal = document.getElementById('landmark-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalSlider = document.getElementById('modal-slider');
    const modalDescription = document.getElementById('modal-description');
    const closeButtons = document.querySelectorAll('.close-modal');
    const showDirectionsButton = document.getElementById('show-directions');
    const showGuidesButton = document.getElementById('show-guides');
    const mapModal = document.getElementById('map-modal');
    const guidesModal = document.getElementById('guides-modal');
    const mapLandmarkName = document.getElementById('map-landmark-name');
    const guidesLandmarkName = document.getElementById('guides-landmark-name');
    const directionsText = document.getElementById('directions-text');
    const guidesList = document.getElementById('guides-list');
    const prevButton = document.querySelector('.slider-btn.prev');
    const nextButton = document.querySelector('.slider-btn.next');
    
    let currentLandmark = null;
    let currentSlideIndex = 0;
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const landmarkId = this.getAttribute('data-landmark-id');
            
            // البحث عن المعلم في بيانات المدينة
            currentLandmark = cityData.landmarks.find(landmark => landmark.id === landmarkId);
            
            if (currentLandmark) {
                // تعيين عنوان المعلم
                modalTitle.textContent = currentLandmark.name;
                
                // تعيين الفئة
                const modalCategoryBadge = document.getElementById('modal-category-badge');
                if (modalCategoryBadge) {
                    modalCategoryBadge.textContent = (currentLandmark.categoryNames && currentLandmark.categoryNames.length > 0) 
                        ? currentLandmark.categoryNames[0] 
                        : _lt('worthVisiting');
                }
                
                // إنشاء شرائح الصور
                modalSlider.innerHTML = '';
                
                if (currentLandmark.images && currentLandmark.images.length > 0) {
                    currentLandmark.images.forEach((image, index) => {
                        const slideImage = document.createElement('img');
                        slideImage.className = 'slider-image' + (index === 0 ? ' active' : '');
                        slideImage.src = `images/${image}`;
                        slideImage.alt = currentLandmark.name;
                        modalSlider.appendChild(slideImage);
                    });
                } else {
                    // صورة افتراضية إذا لم تكن هناك صور
                    const slideImage = document.createElement('img');
                    slideImage.className = 'slider-image active';
                    slideImage.src = 'images/placeholder.jpg';
                    slideImage.alt = currentLandmark.name;
                    modalSlider.appendChild(slideImage);
                }
                
                // تعيين وصف المعلم
                modalDescription.textContent = currentLandmark.description;
                
                // إعادة تعيين مؤشر الشريحة الحالية
                currentSlideIndex = 0;
                
                // إظهار النافذة المنبثقة
                landmarkModal.style.display = 'block';
                
                // تفعيل أزرار التنقل في الشرائح
                initSliderButtons();
            }
        });
    });
    
    // تفعيل أزرار التنقل في الشرائح
    function initSliderButtons() {
        if (prevButton && nextButton) {
            prevButton.onclick = function() {
                showSlide(currentSlideIndex - 1);
            };
            
            nextButton.onclick = function() {
                showSlide(currentSlideIndex + 1);
            };
        }
    }
    
    // عرض شريحة محددة
    function showSlide(index) {
        const slides = document.querySelectorAll('.slider-image');
        
        if (slides.length === 0) return;
        
        if (index >= slides.length) {
            currentSlideIndex = 0;
        } else if (index < 0) {
            currentSlideIndex = slides.length - 1;
        } else {
            currentSlideIndex = index;
        }
        
        slides.forEach(slide => slide.classList.remove('active'));
        slides[currentSlideIndex].classList.add('active');
    }
    
    // زر عرض الاتجاهات
    if (showDirectionsButton) {
        showDirectionsButton.addEventListener('click', function() {
            if (currentLandmark) {
                mapLandmarkName.textContent = currentLandmark.name;
                
                // نص الاتجاهات
                directionsText.textContent = _lt('directionsTemplate')(currentLandmark.name, cityData.name);
                
                // إخفاء نافذة تفاصيل المعلم
                landmarkModal.style.display = 'none';
                
                // إظهار نافذة الخريطة
                mapModal.style.display = 'block';
                
                // تهيئة الخريطة
                initMap(currentLandmark.coordinates.lat, currentLandmark.coordinates.lng, currentLandmark.name);
            }
        });
    }
    
    // زر عرض المرشدين السياحيين
    if (showGuidesButton) {
        showGuidesButton.addEventListener('click', function() {
            if (currentLandmark) {
                guidesLandmarkName.textContent = currentLandmark.name;
                
                // قائمة المرشدين السياحيين
                guidesList.innerHTML = `
                    <div class="guide-card">
                        <div class="guide-image" style="background-image: url('images/guide1.jpg')"></div>
                        <div class="guide-info">
                            <h3>${_lt('guide1Name')}</h3>
                            <p>${_lt('guide1Desc')}${_lt('guideInCity')}${cityData.name}. ${_lt('speaksLangs')}.</p>
                            <button class="btn-small">${_lt('contactBtn')}</button>
                        </div>
                    </div>
                    <div class="guide-card">
                        <div class="guide-image" style="background-image: url('images/guide2.jpg')"></div>
                        <div class="guide-info">
                            <h3>${_lt('guide2Name')}</h3>
                            <p>${_lt('guide2Desc')}. ${_lt('guide2Langs')}.</p>
                            <button class="btn-small">${_lt('contactBtn')}</button>
                        </div>
                    </div>
                    <div class="guide-card">
                        <div class="guide-image" style="background-image: url('images/guide3.jpg')"></div>
                        <div class="guide-info">
                            <h3>${_lt('guide3Name')}</h3>
                            <p>${_lt('guide3Desc')}${_lt('guideInCity')}${cityData.name}. ${_lt('speaksLangs')}.</p>
                            <button class="btn-small">${_lt('contactBtn')}</button>
                        </div>
                    </div>
                `;
                
                // إخفاء نافذة تفاصيل المعلم
                landmarkModal.style.display = 'none';
                
                // إظهار نافذة المرشدين السياحيين
                guidesModal.style.display = 'block';
            }
        });
    }
    
    // أزرار إغلاق النوافذ المنبثقة
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            landmarkModal.style.display = 'none';
            mapModal.style.display = 'none';
            guidesModal.style.display = 'none';
        });
    });
    
    // إغلاق النوافذ المنبثقة عند النقر خارجها
    window.addEventListener('click', function(event) {
        if (event.target === landmarkModal) {
            landmarkModal.style.display = 'none';
        } else if (event.target === mapModal) {
            mapModal.style.display = 'none';
        } else if (event.target === guidesModal) {
            guidesModal.style.display = 'none';
        }
    });
}

// تهيئة الخرائط
function initLandmarkMaps() {
    const mapButtons = document.querySelectorAll('.view-map');
    
    mapButtons.forEach(button => {
        button.addEventListener('click', function() {
            const googleMapsUrl = this.getAttribute('data-google-maps-url');
            const lat = parseFloat(this.getAttribute('data-lat'));
            const lng = parseFloat(this.getAttribute('data-lng'));
            const name = this.getAttribute('data-name');
            
            // إذا كان رابط خرائط جوجل متوفراً، استخدمه
            if (googleMapsUrl && googleMapsUrl !== '' && googleMapsUrl !== 'undefined') {
                window.open(googleMapsUrl, '_blank');
            } else {
                // استخدم الطريقة القديمة بالإحداثيات
                const fallbackUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15&t=m`;
                window.open(fallbackUrl, '_blank');
            }
        });
    });
}

// تهيئة الخريطة
function initMap(lat, lng, name) {
    const mapContainer = document.getElementById('map');
    
    if (mapContainer && typeof google !== 'undefined' && google.maps) {
        // إنشاء الخريطة
        const map = new google.maps.Map(mapContainer, {
            center: { lat: lat, lng: lng },
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.TERRAIN
        });
        
        // إضافة علامة
        const marker = new google.maps.Marker({
            position: { lat: lat, lng: lng },
            map: map,
            title: name
        });
        
        // إضافة نافذة معلومات
        const infoWindow = new google.maps.InfoWindow({
            content: `<div style="text-align: center;"><strong>${name}</strong></div>`
        });
        
        // فتح نافذة المعلومات عند النقر على العلامة
        marker.addListener('click', function() {
            infoWindow.open(map, marker);
        });
        
        // فتح نافذة المعلومات تلقائياً
        infoWindow.open(map, marker);
    } else {
        // إذا لم تكن خرائط Google متاحة
        mapContainer.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p>${_lt('mapLoadFailed')}</p>
                <p>${_lt('location')}: ${lat}, ${lng}</p>
            </div>
        `;
    }
}



// تهيئة الشريط الجانبي
function initSidebar() {
    // تهيئة روابط المعالم السياحية في الشريط الجانبي
    const landmarksLink = document.querySelector('a[href="#"][i*="landmark"]').parentNode;
    
    // إنشاء قائمة منسدلة للمعالم السياحية
    const submenu = document.createElement('ul');
    submenu.className = 'submenu';
    submenu.style.display = 'none';
    
    // إضافة عناصر القائمة المنسدلة
    const citiesData = window.completeLandmarksData || {};
    
    for (const cityId in citiesData) {
        const cityItem = document.createElement('li');
        const cityLink = document.createElement('a');
        cityLink.href = '#';
        cityLink.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${_lt('landmarksOfSidebar')}${citiesData[cityId].name}`;
        cityLink.setAttribute('data-city', cityId);
        
        cityLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // التنقل إلى صفحة المدن إذا لم نكن فيها بالفعل
            if (!document.querySelector('.cities-list')) {
                window.location.href = 'cities.html';
                
                // تخزين المدينة المحددة للعرض بعد تحميل الصفحة
                localStorage.setItem('selectedCity', cityId);
            } else {
                // محاكاة النقر على زر عرض المعالم للمدينة المحددة
                const viewButton = document.querySelector(`.view-landmarks[data-city="${cityId}"]`);
                if (viewButton) {
                    viewButton.click();
                }
            }
        });
        
        cityItem.appendChild(cityLink);
        submenu.appendChild(cityItem);
    }
    
    // إضافة القائمة المنسدلة إلى عنصر القائمة الرئيسي
    landmarksLink.appendChild(submenu);
    
    // تفعيل القائمة المنسدلة
    landmarksLink.querySelector('a').addEventListener('click', function(e) {
        e.preventDefault();
        submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
    });
    
    // تهيئة روابط أنواع السياحة في الشريط الجانبي
    const tourismTypesLinks = document.querySelectorAll('#tourism-types-content a');
    
    tourismTypesLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // استخراج نوع السياحة من النص
            const linkText = this.textContent.trim();
            let tourismType = '';
            
            if (linkText.includes('الأثرية')) {
                tourismType = 'historical';
            } else if (linkText.includes('الطبيعية')) {
                tourismType = 'natural';
            } else if (linkText.includes('الدينية')) {
                tourismType = 'religious';
            } else if (linkText.includes('الشاطئية')) {
                tourismType = 'coastal';
            } else if (linkText.includes('المغامرات')) {
                tourismType = 'recreational';
            }
            
            // التنقل إلى صفحة المدن إذا لم نكن فيها بالفعل
            if (!document.querySelector('.cities-list')) {
                window.location.href = 'cities.html';
                
                // تخزين نوع السياحة المحدد للتصفية بعد تحميل الصفحة
                localStorage.setItem('selectedTourismType', tourismType);
            } else {
                // إنشاء صفحة تعرض جميع المعالم من النوع المحدد
                showTourismTypeView(tourismType);
            }
        });
    });
    
    // التحقق من وجود مدينة محددة مسبقاً
    if (document.querySelector('.cities-list')) {
        const selectedCity = localStorage.getItem('selectedCity');
        if (selectedCity) {
            const viewButton = document.querySelector(`.view-landmarks[data-city="${selectedCity}"]`);
            if (viewButton) {
                viewButton.click();
            }
            localStorage.removeItem('selectedCity');
        }
        
        // التحقق من وجود نوع سياحة محدد مسبقاً
        const selectedTourismType = localStorage.getItem('selectedTourismType');
        if (selectedTourismType) {
            showTourismTypeView(selectedTourismType);
            localStorage.removeItem('selectedTourismType');
        }
    }
}

// عرض المعالم حسب نوع السياحة
function showTourismTypeView(tourismType) {
    const citiesList = document.querySelector('.cities-list');
    
    // إنشاء حاوية المعالم حسب النوع إذا لم تكن موجودة
    let tourismTypeContainer = document.getElementById('tourism-type-container');
    if (!tourismTypeContainer) {
        tourismTypeContainer = document.createElement('section');
        tourismTypeContainer.id = 'tourism-type-container';
        tourismTypeContainer.className = 'landmarks-container';
        tourismTypeContainer.style.display = 'none';
        
        // إنشاء هيكل حاوية المعالم حسب النوع
        var _arrowIcon2 = getLandmarksLocale() === 'en' ? 'fa-arrow-left' : 'fa-arrow-right';
        tourismTypeContainer.innerHTML = `
            <div class="container">
                <div class="landmarks-header">
                    <button class="btn-back-to-cities"><i class="fas ${_arrowIcon2}"></i> ${_lt('backToCities')}</button>
                    <h2>${_lt('landmarksOfType')}<span id="tourism-type-name"></span></h2>
                </div>
                
                <div class="landmarks-grid" id="tourism-type-grid"></div>
            </div>
        `;
        
        // إضافة حاوية المعالم حسب النوع إلى الصفحة
        if (citiesList) {
            citiesList.parentNode.insertBefore(tourismTypeContainer, citiesList.nextSibling);
        } else {
            document.querySelector('main').appendChild(tourismTypeContainer);
        }
        
        // زر العودة للمدن
        const backButton = tourismTypeContainer.querySelector('.btn-back-to-cities');
        backButton.addEventListener('click', function() {
            tourismTypeContainer.style.display = 'none';
            citiesList.style.display = 'block';
            
            // التمرير لأعلى الصفحة
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // تعيين اسم نوع السياحة
    const tourismTypeNameElement = document.getElementById('tourism-type-name');
    let tourismTypeName = '';
    
    switch (tourismType) {
        case 'historical':
            tourismTypeName = _lt('tourismHistorical');
            break;
        case 'natural':
            tourismTypeName = _lt('tourismNatural');
            break;
        case 'religious':
            tourismTypeName = _lt('tourismReligious');
            break;
        case 'coastal':
            tourismTypeName = _lt('tourismCoastal');
            break;
        case 'recreational':
            tourismTypeName = _lt('tourismRecreational');
            break;
        default:
            tourismTypeName = _lt('tourismDiverse');
    }
    
    tourismTypeNameElement.textContent = tourismTypeName;
    
    // جمع جميع المعالم من النوع المحدد
    const citiesData = getLandmarksData();
    const tourismTypeGrid = document.getElementById('tourism-type-grid');
    tourismTypeGrid.innerHTML = '';
    
    let landmarksCount = 0;
    
    for (const cityId in citiesData) {
        const cityData = citiesData[cityId];
        
        cityData.landmarks.forEach(landmark => {
            if (landmark.categories.includes(tourismType)) {
                landmarksCount++;
                
                const landmarkCard = document.createElement('div');
                landmarkCard.className = 'landmark-card fade-in';
                
                // تحديد الفئة الرئيسية للعرض
                const primaryCategory = landmark.categories[0];
                const primaryCategoryName = landmark.categoryNames[0];
                
                // تحديد صورة المعلم
                const imagePath = landmark.images && landmark.images.length > 0
                    ? resolveLandmarkImagePath(landmark.images[0])
                    : 'images/placeholder.jpg';
                
                landmarkCard.innerHTML = `
                    <div class="landmark-image" style="background-image: url('${imagePath}')"></div>
                    <div class="landmark-info">
                        <span class="landmark-category category-${primaryCategory}">${primaryCategoryName}</span>
                        <h3>${landmark.name}</h3>
                        <p><strong>${cityData.name}</strong> - ${landmark.description.substring(0, 120)}...</p>
                        <div class="landmark-actions">
                            <button class="btn-small view-tourism-type-landmark" data-city="${cityId}" data-landmark-id="${landmark.id}">${_lt('viewDetails')}</button>
                            <button class="btn-small view-map" data-lat="${landmark.coordinates.lat}" data-lng="${landmark.coordinates.lng}" data-name="${landmark.name}">
                                <i class="fas fa-map-marker-alt"></i> ${_lt('viewMap')}
                            </button>
                        </div>
                    </div>
                `;
                
                tourismTypeGrid.appendChild(landmarkCard);
            }
        });
    }
    
    // إذا لم يتم العثور على معالم
    if (landmarksCount === 0) {
        tourismTypeGrid.innerHTML = `
            <div class="no-landmarks">
                <i class="fas fa-exclamation-circle"></i>
                <p>${_lt('noLandmarksFound')}</p>
            </div>
        `;
    }
    
    // إخفاء قائمة المدن وإظهار قائمة المعالم حسب النوع
    citiesList.style.display = 'none';
    tourismTypeContainer.style.display = 'block';
    
    // تفعيل تأثيرات الظهور
    setTimeout(() => {
        const fadeElements = tourismTypeContainer.querySelectorAll('.fade-in');
        fadeElements.forEach(element => {
            element.classList.add('visible');
        });
    }, 100);
    
    // تفعيل أزرار عرض التفاصيل
    const viewButtons = tourismTypeContainer.querySelectorAll('.view-tourism-type-landmark');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cityId = this.getAttribute('data-city');
            const landmarkId = this.getAttribute('data-landmark-id');
            
            // محاكاة النقر على زر عرض المعالم للمدينة المحددة
            const viewButton = document.querySelector(`.view-landmarks[data-city="${cityId}"]`);
            if (viewButton) {
                viewButton.click();
                
                // بعد عرض معالم المدينة، محاكاة النقر على المعلم المحدد
                setTimeout(() => {
                    const landmarkButton = document.querySelector(`.view-landmark[data-landmark-id="${landmarkId}"]`);
                    if (landmarkButton) {
                        landmarkButton.click();
                    }
                }, 500);
            }
        });
    });
    
    // تفعيل أزرار عرض الخريطة
    initLandmarkMaps();
    
    // التمرير لأعلى الصفحة
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
