// وظائف تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إضافة شاشة التحميل
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loadingOverlay);
    
    // إخفاء شاشة التحميل بعد تحميل الصفحة
    window.addEventListener('load', function() {
        setTimeout(function() {
            loadingOverlay.classList.add('hidden');
            // تفعيل تأثيرات الظهور عند التمرير
            initScrollAnimations();
            // تهيئة الشريط الجانبي المتجاوب
            initResponsiveSidebar();
            // تهيئة القائمة المنطوية
            initCollapsibleMenu();
        }, 500);
    });
    
    // تهيئة تأثيرات الظهور عند التمرير
    function initScrollAnimations() {
        const fadeElements = document.querySelectorAll('.fade-in');
        
        const fadeInObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });
        
        fadeElements.forEach(element => {
            fadeInObserver.observe(element);
        });
    }
    
    // تهيئة الشريط الجانبي المتجاوب
    function initResponsiveSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const main = document.querySelector('main');
        
        // إضافة زر التبديل للشريط الجانبي
        const sidebarToggle = document.getElementById('sidebar-toggle');
        
        // تفعيل زر التبديل
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            main.classList.toggle('expanded');
        });
        
        // إغلاق الشريط الجانبي عند النقر خارجه في الشاشات الصغيرة
        document.addEventListener('click', function(event) {
            const isSidebarClicked = sidebar.contains(event.target);
            const isToggleClicked = sidebarToggle.contains(event.target);
            
            if (!isSidebarClicked && !isToggleClicked && window.innerWidth <= 768 && !sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
                main.classList.add('expanded');
            }
        });
        
        // تعديل حالة الشريط الجانبي عند تغيير حجم النافذة
        window.addEventListener('resize', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.add('collapsed');
                main.classList.add('expanded');
            } else {
                sidebar.classList.remove('collapsed');
                main.classList.remove('expanded');
            }
        });
        
        // تعيين الحالة الافتراضية للشريط الجانبي
        if (window.innerWidth <= 768) {
            sidebar.classList.add('collapsed');
            main.classList.add('expanded');
        }
    }
    
    // تهيئة القائمة المنطوية
    function initCollapsibleMenu() {
        const sectionTitles = document.querySelectorAll('.nav-section-title');
        
        sectionTitles.forEach(title => {
            title.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const isActive = content.classList.contains('active');
                
                // إغلاق جميع الأقسام المفتوحة
                document.querySelectorAll('.nav-section-content').forEach(item => {
                    item.classList.remove('active');
                });
                
                document.querySelectorAll('.nav-section-title').forEach(item => {
                    item.classList.remove('active');
                });
                
                // فتح القسم المحدد إذا لم يكن مفتوحاً بالفعل
                if (!isActive) {
                    content.classList.add('active');
                    this.classList.add('active');
                }
            });
        });
        
        // فتح القسم الأول افتراضياً
        document.querySelector('.nav-section-content').classList.add('active');
        document.querySelector('.nav-section-title').classList.add('active');
    }
    
    // تفعيل تأثيرات الأزرار
    initButtonEffects();
    
    // تهيئة تصفية المدن
    if (document.querySelector('.filter-options')) {
        initCityFilters();
    }
    
    // تهيئة عرض المعالم
    if (document.querySelector('.view-landmarks')) {
        initLandmarksView();
    }
    
    // تهيئة الخرائط التفاعلية
    if (document.getElementById('map')) {
        initInteractiveMaps();
    }
});

function resolveLegacyLandmarkImagePath(imagePath) {
    if (!imagePath) return '../images/placeholder.jpg';
    if (/^(https?:)?\/\//.test(imagePath) || imagePath.startsWith('data:')) {
        return imagePath;
    }
    return `../images/${imagePath.replace(/^\.?\//, '')}`;
}

// تفعيل تأثيرات الأزرار
function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn, .btn-small, .filter-btn, .landmark-filter-btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
}

// تهيئة تصفية المدن
window.handleCitySearch = function() {
    const searchInput = document.getElementById('city-search-input');
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const activeFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const currentCityBoxes = document.querySelectorAll('.city-box');

    currentCityBoxes.forEach(box => {
        const cityName = (box.querySelector('h3')?.textContent || '').toLowerCase();
        const cityDesc = (box.querySelector('p')?.textContent || '').toLowerCase();
        const category = box.getAttribute('data-category') || '';
        
        const matchesFilter = activeFilter === 'all' || category.includes(activeFilter);
        const matchesSearch = cityName.includes(query) || cityDesc.includes(query);
        
        if (matchesFilter && matchesSearch) {
            box.style.display = 'block';
            setTimeout(() => {
                box.style.opacity = '1';
                box.style.transform = 'translateY(0)';
            }, 10);
        } else {
            box.style.opacity = '0';
            box.style.transform = 'translateY(20px)';
            setTimeout(() => {
                box.style.display = 'none';
            }, 200);
        }
    });
};

function initCityFilters() {
    // Only bind button clicks here. The search input is handled via oninput directly.
    const filterContainer = document.querySelector('.cities-filter .filter-options');
    if (filterContainer) {
        const newContainer = filterContainer.cloneNode(true);
        filterContainer.parentNode.replaceChild(newContainer, filterContainer);
        
        newContainer.addEventListener('click', function(e) {
            if (e.target && e.target.classList.contains('filter-btn')) {
                newContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                window.handleCitySearch();
            }
        });
    }
}

// تهيئة عرض المعالم
function initLandmarksView() {
    const viewButtons = document.querySelectorAll('.view-landmarks');
    const citiesList = document.querySelector('.cities-list');
    const landmarksContainer = document.getElementById('landmarks-container');
    const cityNameSpan = document.querySelector('#city-name span');
    const landmarksGrid = document.getElementById('landmarks-grid');
    const backButton = document.querySelector('.btn-back');
    
    // بيانات المعالم السياحية لكل مدينة
    const citiesData = window.citiesData || {};
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cityId = this.getAttribute('data-city');
            const cityData = citiesData[cityId];
            
            if (cityData) {
                // إخفاء قائمة المدن وإظهار قائمة المعالم
                citiesList.style.display = 'none';
                landmarksContainer.style.display = 'block';
                
                // تعيين اسم المدينة
                cityNameSpan.textContent = cityData.name;
                
                // إنشاء بطاقات المعالم
                landmarksGrid.innerHTML = '';
                
                cityData.landmarks.forEach(landmark => {
                    const landmarkCard = document.createElement('div');
                    landmarkCard.className = 'landmark-card fade-in';
                    landmarkCard.setAttribute('data-category', landmark.category);
                    
                    landmarkCard.innerHTML = `
                        <div class="landmark-image" style="background-image: url('${resolveLegacyLandmarkImagePath(landmark.images[0])}')"></div>
                        <div class="landmark-info">
                            <span class="landmark-category category-${landmark.category}">${landmark.categoryName}</span>
                            <h3>${landmark.name}</h3>
                            <p>${landmark.description.substring(0, 100)}...</p>
                            <div class="landmark-actions">
                                <button class="btn-small view-landmark" data-landmark="${landmark.id}">${typeof _lt === 'function' ? _lt('viewDetails') : 'عرض التفاصيل'}</button>
                                <button class="btn-small view-map" data-lat="${landmark.coordinates.lat}" data-lng="${landmark.coordinates.lng}" data-name="${landmark.name}">
                                    <i class="fas fa-map-marker-alt"></i> ${typeof _lt === 'function' ? _lt('viewMap') : 'عرض الخريطة'}
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
                }, 100);
                
                // تفعيل تصفية المعالم
                initLandmarkFilters();
                
                // تفعيل عرض تفاصيل المعلم
                initLandmarkDetails(cityData);
                
                // تفعيل عرض الخريطة
                initLandmarkMaps();
                
                // التمرير لأعلى الصفحة
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
    
    // زر العودة للمدن
    if (backButton) {
        backButton.addEventListener('click', function() {
            landmarksContainer.style.display = 'none';
            citiesList.style.display = 'block';
            
            // التمرير لأعلى الصفحة
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// تهيئة تصفية المعالم
function initLandmarkFilters() {
    const filterButtons = document.querySelectorAll('.landmark-filter-btn');
    const landmarkCards = document.querySelectorAll('.landmark-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع الأزرار
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // إضافة الفئة النشطة للزر المحدد
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            landmarkCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    if (card.getAttribute('data-category') === filter) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 100);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                }
            });
        });
    });
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
            const landmarkId = this.getAttribute('data-landmark');
            
            // البحث عن المعلم في بيانات المدينة
            currentLandmark = cityData.landmarks.find(landmark => landmark.id === landmarkId);
            
            if (currentLandmark) {
                // تعيين عنوان المعلم
                modalTitle.textContent = currentLandmark.name;
                
                // إنشاء شرائح الصور
                modalSlider.innerHTML = '';
                currentLandmark.images.forEach((image, index) => {
                    const slideImage = document.createElement('img');
                    slideImage.className = 'slider-image' + (index === 0 ? ' active' : '');
                    slideImage.src = `../images/${image}`;
                    slideImage.alt = currentLandmark.name;
                    modalSlider.appendChild(slideImage);
                });
                
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
                directionsText.textContent = currentLandmark.directions;
                
                // إظهار نافذة الخريطة
                mapModal.style.display = 'block';
                landmarkModal.style.display = 'none';
                
                // تهيئة الخريطة
                initMap(currentLandmark.coordinates.lat, currentLandmark.coordinates.lng, currentLandmark.name);
            }
        });
    }
    
    // زر عرض المرشدين
    if (showGuidesButton) {
        showGuidesButton.addEventListener('click', function() {
            if (currentLandmark) {
                guidesLandmarkName.textContent = currentLandmark.name;
                
                // إنشاء بطاقات المرشدين
                guidesList.innerHTML = '';
                
                currentLandmark.guides.forEach(guide => {
                    const guideCard = document.createElement('div');
                    guideCard.className = 'guide-card';
                    
                    guideCard.innerHTML = `
                        <div class="guide-avatar">${guide.name.charAt(0)}</div>
                        <h3 class="guide-name">${guide.name}</h3>
                        <p class="guide-contact">${guide.contact}</p>
                    `;
                    
                    guidesList.appendChild(guideCard);
                });
                
                // إظهار نافذة المرشدين
                guidesModal.style.display = 'block';
                landmarkModal.style.display = 'none';
            }
        });
    }
    
    // أزرار الإغلاق
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
        }
        
        if (event.target === mapModal) {
            mapModal.style.display = 'none';
        }
        
        if (event.target === guidesModal) {
            guidesModal.style.display = 'none';
        }
    });
}

// تهيئة خرائط المعالم
function initLandmarkMaps() {
    const mapButtons = document.querySelectorAll('.view-map');
    
    mapButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lat = parseFloat(this.getAttribute('data-lat'));
            const lng = parseFloat(this.getAttribute('data-lng'));
            const name = this.getAttribute('data-name');
            
            // فتح خرائط جوجل في نافذة جديدة
            const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15&t=m`;
            window.open(googleMapsUrl, '_blank');
        });
    });
}

// تهيئة الخرائط التفاعلية
function initInteractiveMaps() {
    // تهيئة الخريطة الرئيسية
    const mainMap = document.getElementById('main-map');
    if (mainMap) {
        const defaultLat = 15.3694;
        const defaultLng = 44.1910;
        initMap(defaultLat, defaultLng, 'اليمن', 7);
    }
    
    // تهيئة خرائط المعالم
    const landmarkMaps = document.querySelectorAll('.landmark-map');
    landmarkMaps.forEach(mapElement => {
        const lat = parseFloat(mapElement.getAttribute('data-lat'));
        const lng = parseFloat(mapElement.getAttribute('data-lng'));
        const name = mapElement.getAttribute('data-name');
        
        if (lat && lng) {
            initMap(lat, lng, name, 15, mapElement.id);
        }
    });
}

// تهيئة خريطة محددة
function initMap(lat, lng, title, zoom = 15, mapElementId = 'map') {
    const mapElement = document.getElementById(mapElementId);
    
    if (!mapElement) return;
    
    // إنشاء الخريطة
    const map = new google.maps.Map(mapElement, {
        center: { lat: lat, lng: lng },
        zoom: zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        navigationControl: true,
        navigationControlOptions: {
            style: google.maps.NavigationControlStyle.SMALL
        }
    });
    
    // إضافة علامة
    const marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: map,
        title: title,
        animation: google.maps.Animation.DROP
    });
    
    // إضافة نافذة معلومات
    const infoWindow = new google.maps.InfoWindow({
        content: `<div style="text-align: center; padding: 5px;"><strong>${title}</strong></div>`
    });
    
    // فتح نافذة المعلومات عند النقر على العلامة
    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });
    
    // فتح نافذة المعلومات افتراضياً
    infoWindow.open(map, marker);
    
    // إضافة زر الانتقال إلى Google Maps
    const directionsButton = document.createElement('div');
    directionsButton.className = 'custom-map-control';
    directionsButton.innerHTML = `<button class="map-control-button"><i class="fas fa-directions"></i> ${typeof _lt === 'function' ? (getLandmarksLocale() === 'en' ? 'Open in Google Maps' : 'الانتقال إلى Google Maps') : 'الانتقال إلى Google Maps'}</button>`;
    
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(directionsButton);
    
    directionsButton.addEventListener('click', function() {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    });
    
    return map;
}

// تأثيرات إضافية للصفحة
function addExtraEffects() {
    // تأثير التمرير السلس
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // تأثير النبض للأزرار
    document.querySelectorAll('.pulse-effect').forEach(element => {
        element.addEventListener('mouseover', function() {
            this.classList.add('heartbeat');
        });
        
        element.addEventListener('mouseout', function() {
            this.classList.remove('heartbeat');
        });
    });
    
    // تأثير التموج للبطاقات
    document.querySelectorAll('.city-card, .type-card, .landmark-card').forEach(card => {
        card.addEventListener('mouseover', function() {
            this.classList.add('ripple');
        });
        
        card.addEventListener('mouseout', function() {
            this.classList.remove('ripple');
        });
    });
}

// تهيئة بيانات المدن والمعالم
function initCitiesData() {
    // بيانات المدن والمعالم
    window.citiesData = {
        sanaa: {
            id: 'sanaa',
            name: 'صنعاء',
            description: 'العاصمة التاريخية لليمن ومدينة التراث العالمي بعمارتها الفريدة وأسواقها التقليدية.',
            category: 'historical',
            image: 'backgrounds/sanaa_city.jpg',
            landmarks: [
                {
                    id: 'old_sanaa',
                    name: 'صنعاء القديمة',
                    description: 'مدينة تاريخية مدرجة في قائمة التراث العالمي لليونسكو، تتميز بمنازلها المزخرفة المبنية من الطوب اللبن والحجر، والتي يعود تاريخها إلى أكثر من 2500 عام.',
                    category: 'historical',
                    categoryName: 'تاريخي',
                    images: [
                        'https://live.staticflickr.com/65535/52941126870_701c919a6f_b.jpg'
                    ],
                    coordinates: {
                        lat: 15.3525,
                        lng: 44.2095
                    },
                    directions: 'تقع صنعاء القديمة في وسط مدينة صنعاء، ويمكن الوصول إليها بسهولة من أي مكان في المدينة.',
                    guides: [
                        {
                            name: 'أحمد علي',
                            contact: '+967 777 123 456'
                        },
                        {
                            name: 'محمد سعيد',
                            contact: '+967 777 789 012'
                        }
                    ]
                },
                {
                    id: 'great_mosque',
                    name: 'الجامع الكبير',
                    description: 'أحد أقدم المساجد في العالم الإسلامي، بني في عهد الرسول محمد صلى الله عليه وسلم، ويتميز بزخارفه الإسلامية الفريدة وأعمدته الرخامية.',
                    category: 'religious',
                    categoryName: 'ديني',
                    images: [
                        'https://www.alaraby.com/sites/default/files/2023-01/GettyImages-1239705881.jpg'
                    ],
                    coordinates: {
                        lat: 15.3539,
                        lng: 44.2147
                    },
                    directions: 'يقع الجامع الكبير في قلب صنعاء القديمة، ويمكن الوصول إليه سيراً على الأقدام من باب اليمن.',
                    guides: [
                        {
                            name: 'عبدالله محمد',
                            contact: '+967 777 345 678'
                        }
                    ]
                },
                {
                    id: 'national_museum',
                    name: 'المتحف الوطني',
                    description: 'يضم المتحف الوطني مجموعة كبيرة من القطع الأثرية التي تعود إلى مختلف الحضارات اليمنية القديمة، بما في ذلك المملكة السبئية والحميرية.',
                    category: 'cultural',
                    categoryName: 'ثقافي',
                    images: [
                        'https://purehistory.org/wp-content/uploads/2013/12/800px-Sana_national_museum_00.jpg'
                    ],
                    coordinates: {
                        lat: 15.3561,
                        lng: 44.2075
                    },
                    directions: 'يقع المتحف الوطني في قصر دار السعادة، بالقرب من حديقة السبعين في صنعاء.',
                    guides: [
                        {
                            name: 'سمية أحمد',
                            contact: '+967 777 901 234'
                        }
                    ]
                }
            ]
        },
        aden: {
            id: 'aden',
            name: 'عدن',
            description: 'مدينة الموانئ التاريخية والشواطئ الخلابة، بوابة اليمن البحرية وعاصمتها الاقتصادية.',
            category: 'coastal',
            image: 'backgrounds/aden_city.jpg',
            landmarks: [
                {
                    id: 'crater',
                    name: 'مدينة كريتر',
                    description: 'المدينة القديمة التي بنيت داخل فوهة بركان خامد، وتتميز بمبانيها الاستعمارية والأسواق التقليدية.',
                    category: 'historical',
                    categoryName: 'تاريخي',
                    images: ['landmarks/crater_1.jpg', 'landmarks/crater_2.jpg'],
                    coordinates: {
                        lat: 12.7794,
                        lng: 45.0367
                    },
                    directions: 'تقع مدينة كريتر في قلب عدن، ويمكن الوصول إليها عبر طريق المعلا أو طريق خور مكسر.',
                    guides: [
                        {
                            name: 'خالد سالم',
                            contact: '+967 777 567 890'
                        }
                    ]
                },
                {
                    id: 'gold_mohur',
                    name: 'شاطئ جولد موهر',
                    description: 'أحد أجمل الشواطئ في عدن، يتميز برماله الذهبية ومياهه الصافية، ويعد وجهة مثالية للسباحة والاسترخاء.',
                    category: 'beach',
                    categoryName: 'شاطئي',
                    images: ['landmarks/gold_mohur_1.jpg', 'landmarks/gold_mohur_2.jpg'],
                    coordinates: {
                        lat: 12.7853,
                        lng: 44.9761
                    },
                    directions: 'يقع شاطئ جولد موهر على الساحل الغربي لعدن، ويمكن الوصول إليه عبر طريق الساحل.',
                    guides: [
                        {
                            name: 'فاطمة علي',
                            contact: '+967 777 234 567'
                        }
                    ]
                },
                {
                    id: 'sira_fortress',
                    name: 'قلعة صيرة',
                    description: 'قلعة تاريخية تقع على جزيرة صيرة، بنيت في القرن الحادي عشر، وتوفر إطلالات رائعة على خليج عدن.',
                    category: 'historical',
                    categoryName: 'تاريخي',
                    images: ['landmarks/sira_fortress_1.jpg', 'landmarks/sira_fortress_2.jpg'],
                    coordinates: {
                        lat: 12.7861,
                        lng: 44.9742
                    },
                    directions: 'تقع قلعة صيرة على جزيرة صيرة، ويمكن الوصول إليها عبر جسر يربط الجزيرة بمدينة عدن.',
                    guides: [
                        {
                            name: 'عمر سعيد',
                            contact: '+967 777 678 901'
                        }
                    ]
                }
            ]
        }
    };
}

// تنفيذ الوظائف الإضافية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة بيانات المدن والمعالم
    initCitiesData();
    
    // إضافة تأثيرات إضافية
    addExtraEffects();
    
    // تهيئة الخرائط التفاعلية
    if (document.getElementById('map')) {
        initInteractiveMaps();
    }
});
