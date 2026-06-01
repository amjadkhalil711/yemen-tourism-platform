// تحسين عرض الخريطة وإصلاح مشكلة عدم ظهورها
window.initMapFix = function() {
    // Prevent double initialization
    if (window._mapFixInitialized) return;
    window._mapFixInitialized = true;

    // إنشاء مجلد للأيقونات إذا لم يكن موجوداً
    createMapIcons();
    
    // تهيئة الخريطة
    initializeMap();
    
    // تهيئة أزرار خرائط جوجل
    initGoogleMapsButtons();
};

// إنشاء أيقونات الخريطة
function createMapIcons() {
    // إنشاء مجلد للأيقونات إذا لم يكن موجوداً
    const iconsDir = 'images/icons';
    
    // هنا يمكن إضافة كود لإنشاء الأيقونات برمجياً إذا لزم الأمر
    console.log('تم تهيئة أيقونات الخريطة');
}

// تهيئة أزرار خرائط جوجل
function initGoogleMapsButtons() {
    // إضافة مستمع للأحداث لجميع أزرار عرض الخريطة
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('view-map') || 
            (event.target.parentElement && event.target.parentElement.classList.contains('view-map'))) {
            
            event.preventDefault();
            event.stopPropagation();
            
            const button = event.target.classList.contains('view-map') ? 
                          event.target : event.target.parentElement;
            
            const lat = parseFloat(button.getAttribute('data-lat'));
            const lng = parseFloat(button.getAttribute('data-lng'));
            const name = button.getAttribute('data-name');
            const landmarkId = button.getAttribute('data-id');
            
            if (lat && lng) {
                // فتح خرائط جوجل في نافذة جديدة
                const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15&t=m`;
                window.open(googleMapsUrl, '_blank');
                console.log(`فتح خرائط جوجل للمعلم: ${name} في الإحداثيات: ${lat}, ${lng}`);

                if (landmarkId && window.PT_API_BASE !== false) {
                    const API_BASE = (window.PT_API_BASE || localStorage.getItem('pt_api_base') || 'http://localhost:8000/api/v1').replace(/\/+$/, '');
                    fetch(`${API_BASE}/landmarks/${landmarkId}/views`, {
                        method: 'POST',
                        headers: { 'Accept': 'application/json' }
                    }).catch(err => console.error('Failed to increment view count', err));
                }
            }
        }
    });
}

// تهيئة الخريطة
function initializeMap() {
    // التحقق من وجود عنصر الخريطة في الصفحة
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.log('عنصر الخريطة غير موجود في الصفحة');
        return;
    }
    
    try {
        // استخدام Leaflet بدلاً من Google Maps لتجنب مشاكل API Key
        const map = L.map('map', {
            center: [15.3694, 44.1910], // إحداثيات مركز اليمن
            zoom: 7,
            zoomControl: true,
            scrollWheelZoom: true
        });

        // إضافة طبقة الخريطة الأساسية
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // إضافة المعالم إلى الخريطة
        addLandmarksToMap(map);
        
        console.log('تم تهيئة الخريطة بنجاح');
    } catch (error) {
        console.error('حدث خطأ أثناء تهيئة الخريطة:', error);
    }
}

// إضافة المعالم إلى الخريطة
function addLandmarksToMap(map) {
    // التحقق من وجود بيانات المعالم
    if (!window.updatedLandmarksData) {
        console.error('بيانات المعالم غير متوفرة');
        return;
    }

    // إضافة المعالم لكل مدينة
    Object.values(window.updatedLandmarksData).forEach(city => {
        city.landmarks.forEach(landmark => {
            if (landmark.coordinates && landmark.coordinates.lat && landmark.coordinates.lng) {
                // إنشاء علامة للمعلم
                const marker = L.marker([landmark.coordinates.lat, landmark.coordinates.lng], {
                    title: landmark.name
                });

                // إنشاء محتوى النافذة المنبثقة
                let popupContent = `
                    <div class="landmark-popup">
                        <h3>${landmark.name}</h3>
                        <p>${landmark.description}</p>
                `;

                // إضافة الصور إذا كانت متوفرة
                if (landmark.images && landmark.images.length > 0) {
                    popupContent += `<div class="landmark-images">`;
                    landmark.images.forEach(image => {
                        popupContent += `<img src="${image}" alt="${landmark.name}" />`;
                    });
                    popupContent += `</div>`;
                }

                // إضافة التصنيفات
                if (landmark.categoryNames && landmark.categoryNames.length > 0) {
                    popupContent += `<div class="landmark-categories">`;
                    landmark.categoryNames.forEach((category, index) => {
                        popupContent += `<span class="category-tag">${category}</span>`;
                    });
                    popupContent += `</div>`;
                }

                popupContent += `</div>`;

                // ربط النافذة المنبثقة بالعلامة
                marker.bindPopup(popupContent, {
                    maxWidth: 300,
                    className: 'landmark-popup-container'
                });

                // إضافة العلامة إلى الخريطة
                marker.addTo(map);
            }
        });
    });
}
