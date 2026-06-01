// تحسين تفاعل الشريط الجانبي
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة الشريط الجانبي
    initSidebar();
    
    // تهيئة تأثيرات الظهور عند التمرير
    initScrollAnimations();
    
    // تفعيل تأثيرات الأزرار
    initButtonEffects();
});

// تهيئة الشريط الجانبي
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const main = document.querySelector('main');
    
    // تفعيل زر التبديل
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            main.classList.toggle('expanded');
        });
    }
    
    // تفعيل أقسام القائمة المنطوية
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
    if (document.querySelector('.nav-section-content')) {
        document.querySelector('.nav-section-content').classList.add('active');
    }
    
    if (document.querySelector('.nav-section-title')) {
        document.querySelector('.nav-section-title').classList.add('active');
    }
    
    // تفعيل روابط الشريط الجانبي
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // إذا كان الرابط يشير إلى صفحة أخرى، اتركه يعمل بشكل طبيعي
            if (href && href !== '#' && !href.startsWith('javascript:') && href.includes('.html')) {
                return;
            }
            
            // منع السلوك الافتراضي للروابط الداخلية
            e.preventDefault();
            
            // إضافة تأثير النقر
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 300);
            
            // تنفيذ الإجراء المناسب حسب نوع الرابط
            if (this.closest('.nav-section-content#main-pages-content')) {
                handleMainPagesLink(this);
            } else if (this.closest('.nav-section-content#tourism-types-content')) {
                handleTourismTypesLink(this);
            } else if (this.closest('.nav-section-content#main-cities-content')) {
                handleMainCitiesLink(this);
            } else if (this.closest('.nav-section-content#contact-info-content')) {
                handleContactInfoLink(this);
            }
        });
    });
    
    // معالجة روابط الصفحات الرئيسية
    function handleMainPagesLink(link) {
        const linkText = link.textContent.trim();
        console.log(`تم النقر على: ${linkText}`);
        
        // تنفيذ الإجراء المناسب حسب نص الرابط
        if (linkText.includes('المعالم السياحية')) {
            // الانتقال إلى صفحة المدن وعرض المعالم
            window.location.href = 'cities.html';
        } else if (linkText.includes('الفنادق')) {
            alert('سيتم إضافة صفحة الفنادق قريباً');
        } else if (linkText.includes('المطاعم')) {
            alert('سيتم إضافة صفحة المطاعم قريباً');
        }
    }
    
    // معالجة روابط أنواع السياحة
    function handleTourismTypesLink(link) {
        const linkText = link.textContent.trim();
        console.log(`تم النقر على نوع السياحة: ${linkText}`);
        
        // الانتقال إلى صفحة المدن
        window.location.href = 'cities.html';
        
        // تخزين نوع السياحة في التخزين المحلي لاستخدامه في صفحة المدن
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
            tourismType = 'adventure';
        }
        
        if (tourismType) {
            localStorage.setItem('selectedTourismType', tourismType);
        }
    }
    
    // معالجة روابط المدن الرئيسية
    function handleMainCitiesLink(link) {
        const cityName = link.textContent.trim();
        console.log(`تم النقر على المدينة: ${cityName}`);
        
        // الانتقال إلى صفحة المدن
        window.location.href = 'cities.html';
        
        // تخزين اسم المدينة في التخزين المحلي لاستخدامه في صفحة المدن
        localStorage.setItem('selectedCity', cityName);
    }
    
    // معالجة روابط معلومات الاتصال
    function handleContactInfoLink(link) {
        const linkText = link.textContent.trim();
        console.log(`تم النقر على: ${linkText}`);
        
        // تنفيذ الإجراء المناسب حسب نص الرابط
        if (linkText.includes('تواصل معنا')) {
            window.location.href = 'contact.html';
        } else if (linkText.includes('عن الموقع')) {
            window.location.href = 'about.html';
        } else if (linkText.includes('الأسئلة الشائعة')) {
            alert('سيتم إضافة صفحة الأسئلة الشائعة قريباً');
        }
    }
    
    // إغلاق الشريط الجانبي عند النقر خارجه في الشاشات الصغيرة
    document.addEventListener('click', function(event) {
        if (sidebar && sidebarToggle) {
            const isSidebarClicked = sidebar.contains(event.target);
            const isToggleClicked = sidebarToggle.contains(event.target);
            
            if (!isSidebarClicked && !isToggleClicked && window.innerWidth <= 768 && !sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
                main.classList.add('expanded');
            }
        }
    });
    
    // تعديل حالة الشريط الجانبي عند تغيير حجم النافذة
    window.addEventListener('resize', function() {
        if (sidebar) {
            if (window.innerWidth <= 768) {
                sidebar.classList.add('collapsed');
                main.classList.add('expanded');
            } else {
                sidebar.classList.remove('collapsed');
                main.classList.remove('expanded');
            }
        }
    });
    
    // تعيين الحالة الافتراضية للشريط الجانبي
    if (sidebar && window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
        main.classList.add('expanded');
    }
}

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
        
        // إضافة تأثير النقر
        button.addEventListener('click', function() {
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 300);
        });
    });
}

// إضافة كود لتنفيذ الوظائف عند تحميل صفحة المدن
document.addEventListener('DOMContentLoaded', function() {
    // التحقق مما إذا كنا في صفحة المدن
    if (window.location.href.includes('cities.html')) {
        // التحقق من وجود مدينة محددة في التخزين المحلي
        const selectedCity = localStorage.getItem('selectedCity');
        if (selectedCity) {
            // البحث عن زر عرض المعالم للمدينة المحددة
            const cityBoxes = document.querySelectorAll('.city-box');
            cityBoxes.forEach(box => {
                const cityName = box.querySelector('h3').textContent.trim();
                if (cityName === selectedCity) {
                    // التمرير إلى المدينة
                    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // النقر على زر عرض المعالم بعد التمرير
                    setTimeout(() => {
                        const viewButton = box.querySelector('.view-landmarks');
                        if (viewButton) {
                            viewButton.click();
                        }
                    }, 1000);
                }
            });
            
            // مسح المدينة المحددة من التخزين المحلي
            localStorage.removeItem('selectedCity');
        }
        
        // التحقق من وجود نوع سياحة محدد في التخزين المحلي
        const selectedTourismType = localStorage.getItem('selectedTourismType');
        if (selectedTourismType) {
            // البحث عن زر التصفية المناسب والنقر عليه
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(button => {
                const filterType = button.getAttribute('data-filter');
                if (filterType === selectedTourismType) {
                    button.click();
                }
            });
            
            // مسح نوع السياحة المحدد من التخزين المحلي
            localStorage.removeItem('selectedTourismType');
        }
    }
});
