// ربط صور المعالم السياحية ببياناتها البرمجية
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة عرض المعالم
    initLandmarksDisplay();
});

// تهيئة عرض المعالم
function initLandmarksDisplay() {
    // التحقق من وجود زر عرض المعالم
    const viewButtons = document.querySelectorAll('.view-landmarks');
    if (viewButtons.length === 0) return;
    
    const citiesList = document.querySelector('.cities-list');
    const landmarksContainer = document.getElementById('landmarks-container');
    const cityNameSpan = document.querySelector('#city-name span');
    const landmarksGrid = document.getElementById('landmarks-grid');
    const backButton = document.querySelector('.btn-back');
    
    // استخدام البيانات المحدثة للمعالم
    const citiesData = window.updatedLandmarksData || window.citiesData || {};
    
    // تفعيل أزرار عرض المعالم
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cityId = this.getAttribute('data-city');
            const cityData = citiesData[cityId];
            
            if (cityData) {
                // إخفاء قائمة المدن وإظهار قائمة المعالم
                if (citiesList) citiesList.style.display = 'none';
                if (landmarksContainer) landmarksContainer.style.display = 'block';
                
                // تعيين اسم المدينة
                if (cityNameSpan) cityNameSpan.textContent = cityData.name;
                
                // إنشاء بطاقات المعالم
                if (landmarksGrid) {
                    landmarksGrid.innerHTML = '';
                    
                    cityData.landmarks.forEach(landmark => {
                        // التأكد من وجود صور للمعلم
                        const landmarkImage = landmark.images && landmark.images.length > 0 
                            ? landmark.images[0] 
                            : 'images/placeholder.jpg';
                        
                        // تحديد فئة المعلم
                        const category = landmark.categories && landmark.categories.length > 0 
                            ? landmark.categories[0] 
                            : 'other';
                        
                        // تحديد اسم الفئة
                        const categoryName = landmark.categoryNames && landmark.categoryNames.length > 0 
                            ? landmark.categoryNames[0] 
                            : 'أخرى';
                        
                        const landmarkCard = document.createElement('div');
                        landmarkCard.className = 'landmark-card fade-in';
                        landmarkCard.setAttribute('data-category', category);
                        
                        landmarkCard.innerHTML = `
                            <div class="landmark-image" style="background-image: url('${landmarkImage}')"></div>
                            <div class="landmark-info">
                                <span class="landmark-category category-${category}">${categoryName}</span>
                                <h3>${landmark.name}</h3>
                                <p>${landmark.description.substring(0, 100)}...</p>
                                <div class="landmark-actions">
                                    <button class="btn-small view-landmark" data-landmark="${landmark.id}">عرض التفاصيل</button>
                                    <button class="btn-small view-map" data-lat="${landmark.coordinates.lat}" data-lng="${landmark.coordinates.lng}" data-name="${landmark.name}">
                                        <i class="fas fa-map-marker-alt"></i> عرض الخريطة
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
            }
        });
    });
    
    // زر العودة للمدن
    if (backButton) {
        backButton.addEventListener('click', function() {
            if (landmarksContainer) landmarksContainer.style.display = 'none';
            if (citiesList) citiesList.style.display = 'block';
            
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
            const landmarkId = this.getAttribute('data-landmark') || this.getAttribute('data-landmark-id');
            
            // البحث عن المعلم في بيانات المدينة
            currentLandmark = cityData.landmarks.find(landmark => landmark.id === landmarkId);
            
            if (currentLandmark && landmarkModal) {
                // تعيين عنوان المعلم
                if (modalTitle) modalTitle.textContent = currentLandmark.name;
                
                // تعيين الفئة
                const modalCategoryBadge = document.getElementById('modal-category-badge');
                if (modalCategoryBadge) {
                    modalCategoryBadge.textContent = (currentLandmark.categoryNames && currentLandmark.categoryNames.length > 0) 
                        ? currentLandmark.categoryNames[0] 
                        : "يستحق الزيارة";
                }
                
                // إنشاء شرائح الصور
                if (modalSlider) {
                    modalSlider.innerHTML = '';
                    
                    // التأكد من وجود صور للمعلم
                    if (currentLandmark.images && currentLandmark.images.length > 0) {
                        currentLandmark.images.forEach((image, index) => {
                            const slideImage = document.createElement('img');
                            slideImage.className = 'slider-image' + (index === 0 ? ' active' : '');
                            slideImage.src = image;
                            slideImage.alt = currentLandmark.name;
                            modalSlider.appendChild(slideImage);
                        });
                    } else {
                        // إضافة صورة افتراضية إذا لم تكن هناك صور
                        const slideImage = document.createElement('img');
                        slideImage.className = 'slider-image active';
                        slideImage.src = 'images/placeholder.jpg';
                        slideImage.alt = currentLandmark.name;
                        modalSlider.appendChild(slideImage);
                    }
                }
                
                // تعيين وصف المعلم
                if (modalDescription) modalDescription.textContent = currentLandmark.description;
                
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
    
    // إغلاق النوافذ المنبثقة
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });
    
    // إغلاق النوافذ المنبثقة عند النقر خارجها
    window.addEventListener('click', function(event) {
        if (landmarkModal && event.target === landmarkModal) {
            landmarkModal.style.display = 'none';
        }
        
        if (mapModal && event.target === mapModal) {
            mapModal.style.display = 'none';
        }
        
        if (guidesModal && event.target === guidesModal) {
            guidesModal.style.display = 'none';
        }
    });
    
    // زر عرض الاتجاهات
    if (showDirectionsButton) {
        showDirectionsButton.addEventListener('click', function() {
            if (currentLandmark && mapModal) {
                if (mapLandmarkName) mapLandmarkName.textContent = currentLandmark.name;
                
                // إنشاء نص الاتجاهات
                if (directionsText) {
                    directionsText.innerHTML = `
                        <p>للوصول إلى ${currentLandmark.name}:</p>
                        <ol>
                            <li>انطلق من وسط المدينة باتجاه الشمال.</li>
                            <li>استمر في الطريق الرئيسي لمسافة 2 كم.</li>
                            <li>انعطف يميناً عند الإشارة الضوئية الأولى.</li>
                            <li>استمر في الطريق لمسافة 1 كم حتى تصل إلى ${currentLandmark.name}.</li>
                        </ol>
                        <p>الإحداثيات: ${currentLandmark.coordinates.lat}, ${currentLandmark.coordinates.lng}</p>
                    `;
                }
                
                // إظهار النافذة المنبثقة
                mapModal.style.display = 'block';
                
                // تهيئة الخريطة
                initMap(currentLandmark.coordinates.lat, currentLandmark.coordinates.lng, currentLandmark.name);
            }
        });
    }
    
    // زر عرض المرشدين السياحيين
    if (showGuidesButton) {
        showGuidesButton.addEventListener('click', function() {
            if (currentLandmark && guidesModal) {
                if (guidesLandmarkName) guidesLandmarkName.textContent = currentLandmark.name;
                
                // إنشاء قائمة المرشدين السياحيين
                if (guidesList) {
                    guidesList.innerHTML = `
                        <div class="guide-card">
                            <div class="guide-image" style="background-image: url('images/guides/guide1.jpg')"></div>
                            <div class="guide-info">
                                <h4>أحمد محمد</h4>
                                <p>مرشد سياحي متخصص في المعالم التاريخية والأثرية. يتحدث العربية والإنجليزية والفرنسية.</p>
                                <p>الهاتف: 123456789</p>
                                <p>البريد الإلكتروني: ahmed@example.com</p>
                            </div>
                        </div>
                        
                        <div class="guide-card">
                            <div class="guide-image" style="background-image: url('images/guides/guide2.jpg')"></div>
                            <div class="guide-info">
                                <h4>سارة علي</h4>
                                <p>مرشدة سياحية متخصصة في التراث الثقافي والفني. تتحدث العربية والإنجليزية والإيطالية.</p>
                                <p>الهاتف: 987654321</p>
                                <p>البريد الإلكتروني: sara@example.com</p>
                            </div>
                        </div>
                        
                        <div class="guide-card">
                            <div class="guide-image" style="background-image: url('images/guides/guide3.jpg')"></div>
                            <div class="guide-info">
                                <h4>خالد عبدالله</h4>
                                <p>مرشد سياحي متخصص في المناطق الطبيعية والجبلية. يتحدث العربية والإنجليزية والألمانية.</p>
                                <p>الهاتف: 456789123</p>
                                <p>البريد الإلكتروني: khaled@example.com</p>
                            </div>
                        </div>
                    `;
                }
                
                // إظهار النافذة المنبثقة
                guidesModal.style.display = 'block';
            }
        });
    }
}

// تهيئة الخريطة
function initMap(lat, lng, name) {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    // إنشاء الخريطة
    const map = L.map(mapContainer).setView([lat, lng], 15);
    
    // إضافة طبقة الخريطة
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // إضافة علامة الموقع
    L.marker([lat, lng]).addTo(map)
        .bindPopup(name)
        .openPopup();
}

// تهيئة عرض الخريطة
function initLandmarkMaps() {
    const mapButtons = document.querySelectorAll('.view-map');
    const mapModal = document.getElementById('map-modal');
    const mapLandmarkName = document.getElementById('map-landmark-name');
    const directionsText = document.getElementById('directions-text');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    mapButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lat = parseFloat(this.getAttribute('data-lat'));
            const lng = parseFloat(this.getAttribute('data-lng'));
            const name = this.getAttribute('data-name');
            
            if (mapModal) {
                if (mapLandmarkName) mapLandmarkName.textContent = name;
                
                // إنشاء نص الاتجاهات
                if (directionsText) {
                    directionsText.innerHTML = `
                        <p>للوصول إلى ${name}:</p>
                        <ol>
                            <li>انطلق من وسط المدينة باتجاه الشمال.</li>
                            <li>استمر في الطريق الرئيسي لمسافة 2 كم.</li>
                            <li>انعطف يميناً عند الإشارة الضوئية الأولى.</li>
                            <li>استمر في الطريق لمسافة 1 كم حتى تصل إلى ${name}.</li>
                        </ol>
                        <p>الإحداثيات: ${lat}, ${lng}</p>
                    `;
                }
                
                // إظهار النافذة المنبثقة
                // mapModal.style.display = 'block'; // Removed to prevent annoying duplicate modal
                
                // تهيئة الخريطة
                // initMap(lat, lng, name); // Removed map initialization

            }
        });
    });
    
    // إغلاق النوافذ المنبثقة
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });
    
    // إغلاق النوافذ المنبثقة عند النقر خارجها
    window.addEventListener('click', function(event) {
        if (mapModal && event.target === mapModal) {
            mapModal.style.display = 'none';
        }
    });
}
