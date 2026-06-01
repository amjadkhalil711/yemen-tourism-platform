// بيانات المعالم السياحية لكل مدينة
const citiesData = {
    sanaa: {
        name: "صنعاء",
        landmarks: [
            {
                id: "old_sanaa",
                name: "مدينة صنعاء القديمة",
                category: "historical",
                categoryName: "معلم أثري",
                description: "مدينة قديمة مأهولة منذ القرن الخامس قبل الميلاد على الأقل، وبها مبان بنيت قبل القرن الحادي عشر الميلادي. في القرن الأول للميلاد أصبحت عاصمة مؤقتة لمملكة سبأ. تم إدراجها في قائمة التراث العالمي عام 1986.",
                images: ["sanaa_old_city_1.jpg", "sanaa_old_city_2.jpg", "sanaa_old_city_3.jpg"],
                location: {lat: 15.35556, lng: 44.20806},
                directions: "تقع مدينة صنعاء القديمة في وسط العاصمة صنعاء، ويمكن الوصول إليها عبر الطريق الرئيسي من مطار صنعاء الدولي بمسافة تقدر بحوالي 10 كم.",
                guides: [
                    {name: "أحمد محمد", contact: "+967 777 123 456"},
                    {name: "علي صالح", contact: "+967 733 987 654"},
                    {name: "فاطمة عبدالله", contact: "+967 711 456 789"}
                ]
            },
            {
                id: "grand_mosque",
                name: "الجامع الكبير",
                category: "historical",
                categoryName: "معلم أثري",
                description: "يعد الجامع الكبير بصنعاء من أقدم المساجد في العالم الإسلامي، ويقال إنه بني في عهد الرسول محمد صلى الله عليه وسلم. يتميز بعمارته الإسلامية الفريدة وزخارفه الجميلة.",
                images: ["sanaa_grand_mosque_1.jpg", "sanaa_grand_mosque_2.jpg"],
                location: {lat: 15.35472, lng: 44.21417},
                directions: "يقع الجامع الكبير في قلب مدينة صنعاء القديمة، ويمكن الوصول إليه سيراً على الأقدام من باب اليمن.",
                guides: [
                    {name: "محمد علي", contact: "+967 777 222 333"},
                    {name: "عبدالرحمن سعيد", contact: "+967 733 444 555"}
                ]
            },
            {
                id: "bab_alyemen",
                name: "باب اليمن",
                category: "tourism",
                categoryName: "معلم سياحي",
                description: "باب اليمن هو أحد أشهر بوابات مدينة صنعاء القديمة، ويعتبر رمزاً للمدينة. تم بناؤه في القرن الثامن الهجري، ويعد نقطة انطلاق لزيارة المدينة القديمة.",
                images: ["bab_alyemen_1.jpg", "bab_alyemen_2.jpg"],
                location: {lat: 15.35278, lng: 44.20694},
                directions: "يقع باب اليمن في الجهة الجنوبية من سور مدينة صنعاء القديمة، ويمكن الوصول إليه بسهولة من وسط المدينة.",
                guides: [
                    {name: "سعيد أحمد", contact: "+967 777 666 777"},
                    {name: "نورا محمد", contact: "+967 733 888 999"}
                ]
            },
            {
                id: "dar_alhajar",
                name: "دار الحجر",
                category: "tourism",
                categoryName: "معلم سياحي",
                description: "قصر صخري مبني على صخرة في وادي ظهر، ويعود تاريخ بنائه إلى القرن الثامن عشر الميلادي. يعتبر من أشهر المعالم السياحية في اليمن ورمزاً للسياحة اليمنية.",
                images: ["dar_alhajar_1.jpg", "dar_alhajar_2.jpg", "dar_alhajar_3.jpg"],
                location: {lat: 15.41667, lng: 44.16667},
                directions: "يقع قصر دار الحجر في منطقة وادي ظهر، على بعد حوالي 15 كم شمال غرب صنعاء. يمكن الوصول إليه بالسيارة عبر الطريق المؤدي إلى شبام كوكبان.",
                guides: [
                    {name: "خالد عبدالله", contact: "+967 777 111 222"},
                    {name: "سمية علي", contact: "+967 733 333 444"}
                ]
            },
            {
                id: "alsaleh_mosque",
                name: "مسجد الصالح",
                category: "tourism",
                categoryName: "معلم سياحي",
                description: "أحد أكبر المساجد في اليمن والعالم، تم بناؤه عام 2008 وسمي على اسم الرئيس اليمني السابق علي عبدالله صالح. يتسع لأكثر من 40 ألف مصلي.",
                images: ["alsaleh_mosque_1.jpg", "alsaleh_mosque_2.jpg"],
                location: {lat: 15.37222, lng: 44.20000},
                directions: "يقع مسجد الصالح في الجهة الجنوبية من مدينة صنعاء، ويمكن الوصول إليه عبر شارع الستين.",
                guides: [
                    {name: "عمر محمد", contact: "+967 777 555 666"},
                    {name: "ليلى أحمد", contact: "+967 733 777 888"}
                ]
            }
        ]
    },
    shibam: {
        name: "شبام",
        landmarks: [
            {
                id: "shibam_old_city",
                name: "مدينة شبام القديمة وسورها",
                category: "historical",
                categoryName: "معلم أثري",
                description: "تعود مباني المدينة إلى القرن السادس عشر الميلادي وتعد إحدى أقدم النماذج للتنظيم المدني الدقيق المرتكز على مبدأ البناء المرتفع حيث أنها تحتوي على مباني برجية شاهقة منبثقة من الصخور. تم إدراجها في قائمة التراث العالمي عام 1982.",
                images: ["shibam_old_city_1.jpg", "shibam_old_city_2.jpg", "shibam_old_city_3.jpg"],
                location: {lat: 15.92694, lng: 48.62667},
                directions: "تقع مدينة شبام في وادي حضرموت، على بعد حوالي 500 كم شرق صنعاء. يمكن الوصول إليها عبر الطريق من مدينة سيئون أو المكلا.",
                guides: [
                    {name: "سالم باعباد", contact: "+967 777 123 123"},
                    {name: "عبدالله بافقيه", contact: "+967 733 456 456"}
                ]
            },
            {
                id: "mud_skyscrapers",
                name: "ناطحات السحاب الطينية",
                category: "historical",
                categoryName: "معلم أثري",
                description: "تشتهر شبام بمبانيها الطينية المرتفعة التي يصل ارتفاع بعضها إلى 30 متراً وتتكون من 5 إلى 11 طابقاً، مما جعلها تلقب بـ'مانهاتن الصحراء'. تعتبر من أقدم أمثلة التخطيط العمودي للمدن في العالم.",
                images: ["shibam_skyscrapers_1.jpg", "shibam_skyscrapers_2.jpg"],
                location: {lat: 15.92500, lng: 48.62778},
                directions: "تقع ناطحات السحاب الطينية داخل مدينة شبام المسورة، ويمكن مشاهدتها من جميع أنحاء المدينة.",
                guides: [
                    {name: "محمد باحميد", contact: "+967 777 789 789"},
                    {name: "فاطمة باحارثة", contact: "+967 733 321 321"}
                ]
            }
        ]
    },
    zabid: {
        name: "زبيد",
        landmarks: [
            {
                id: "zabid_historical",
                name: "حاضرة زبيد التاريخية",
                category: "historical",
                categoryName: "معلم أثري",
                description: "هي مدينة يمنية تشكل موقعاً ذا أهمية أثرية وتاريخية استثنائية، بفضل هندستها المحلية والعسكرية وتخطيطها المدني. كانت عاصمة لليمن من القرن الثالث عشر إلى القرن الخامس عشر، واتسمت بأهمية جمة في العالم العربي والإسلامي طيلة قرون من الزمن بفضل جامعتها الإسلامية. تم إدراجها في قائمة التراث العالمي عام 1993.",
                images: ["zabid_historical_1.jpg", "zabid_historical_2.jpg"],
                location: {lat: 14.19806, lng: 43.31333},
                directions: "تقع مدينة زبيد في محافظة الحديدة، على بعد حوالي 25 كم من ساحل البحر الأحمر و150 كم جنوب غرب صنعاء.",
                guides: [
                    {name: "حسن الزبيدي", contact: "+967 777 111 000"},
                    {name: "كريمة محمد", contact: "+967 733 222 000"}
                ]
            },
            {
                id: "islamic_university",
                name: "الجامعة الإسلامية القديمة",
                category: "historical",
                categoryName: "معلم أثري",
                description: "كانت زبيد مركزاً علمياً مهماً في العالم الإسلامي، وتضم جامعة إسلامية قديمة كانت من أهم المراكز العلمية في اليمن والجزيرة العربية.",
                images: ["zabid_university_1.jpg", "zabid_university_2.jpg"],
                location: {lat: 14.19500, lng: 43.31500},
                directions: "تقع الجامعة الإسلامية القديمة في وسط مدينة زبيد التاريخية.",
                guides: [
                    {name: "عبدالرحمن الزبيدي", contact: "+967 777 333 000"},
                    {name: "زينب علي", contact: "+967 733 444 000"}
                ]
            }
        ]
    },
    socotra: {
        name: "سقطرى",
        landmarks: [
            {
                id: "dragon_blood_trees",
                name: "شجرة دم التنين",
                category: "natural",
                categoryName: "معلم طبيعي",
                description: "شجرة دم التنين هي نوع من الأشجار الفريدة التي تنمو فقط في أرخبيل سقطرى. تتميز بشكلها المظلي الفريد وعصارتها الحمراء التي تستخدم في الطب التقليدي والصباغة. تعتبر رمزاً لجزيرة سقطرى والتنوع البيولوجي الفريد فيها.",
                images: ["socotra_dragon_tree_1.jpg", "socotra_dragon_tree_2.jpg", "socotra_dragon_tree_3.jpg"],
                location: {lat: 12.58333, lng: 54.30000},
                directions: "تنتشر أشجار دم التنين في هضبة ديكسم في وسط جزيرة سقطرى، ويمكن الوصول إليها عبر طرق وعرة تتطلب سيارات دفع رباعي.",
                guides: [
                    {name: "سالم السقطري", contact: "+967 777 555 000"},
                    {name: "عبدالله محمد", contact: "+967 733 666 000"}
                ]
            },
            {
                id: "detwah_lagoon",
                name: "بحيرة دتواه",
                category: "natural",
                categoryName: "معلم طبيعي",
                description: "بحيرة ساحلية خلابة تقع في الجزء الشمالي الغربي من جزيرة سقطرى. تتميز بمياهها الفيروزية الصافية والشعاب المرجانية والحياة البحرية المتنوعة.",
                images: ["socotra_detwah_1.jpg", "socotra_detwah_2.jpg"],
                location: {lat: 12.71667, lng: 53.50000},
                directions: "تقع بحيرة دتواه بالقرب من قرية قلنسية في الجزء الشمالي الغربي من جزيرة سقطرى، ويمكن الوصول إليها بالسيارة من مدينة حديبو.",
                guides: [
                    {name: "محمد السقطري", contact: "+967 777 777 000"},
                    {name: "فاطمة سعيد", contact: "+967 733 888 000"}
                ]
            },
            {
                id: "homhil_protected_area",
                name: "محمية حومحل الطبيعية",
                category: "natural",
                categoryName: "معلم طبيعي",
                description: "محمية طبيعية تضم مجموعة متنوعة من النباتات المتوطنة في سقطرى، بما في ذلك أشجار دم التنين وأشجار اللبان. تتميز بمناظرها الطبيعية الخلابة والينابيع الطبيعية.",
                images: ["socotra_homhil_1.jpg", "socotra_homhil_2.jpg"],
                location: {lat: 12.58056, lng: 54.31667},
                directions: "تقع محمية حومحل في الجزء الشمالي الشرقي من جزيرة سقطرى، ويمكن الوصول إليها بالسيارة من مدينة حديبو ثم السير على الأقدام.",
                guides: [
                    {name: "أحمد السقطري", contact: "+967 777 999 000"},
                    {name: "سعاد علي", contact: "+967 733 111 222"}
                ]
            }
        ]
    },
    aden: {
        name: "عدن",
        landmarks: [
            {
                id: "sira_fortress",
                name: "قلعة صيرة",
                category: "historical",
                categoryName: "معلم أثري",
                description: "قلعة تاريخية تقع على جزيرة صيرة في خليج عدن، بنيت في القرن الحادي عشر الميلادي. تتميز بموقعها الاستراتيجي وإطلالتها الرائعة على المدينة والخليج.",
                images: ["aden_sira_1.jpg", "aden_sira_2.jpg"],
                location: {lat: 12.78333, lng: 44.98333},
                directions: "تقع قلعة صيرة على جزيرة صغيرة في خليج عدن، ويمكن الوصول إليها عبر جسر يربطها بالبر الرئيسي.",
                guides: [
                    {name: "محمد العدني", contact: "+967 777 222 333"},
                    {name: "سميرة أحمد", contact: "+967 733 444 555"}
                ]
            },
            {
                id: "aden_tanks",
                name: "صهاريج عدن",
                category: "historical",
                categoryName: "معلم أثري",
                description: "سلسلة من الصهاريج المائية القديمة التي بنيت في العصور الوسطى لتخزين مياه الأمطار. تعتبر من أهم الآثار التاريخية في عدن وشاهداً على براعة الهندسة المائية القديمة.",
                images: ["aden_tanks_1.jpg", "aden_tanks_2.jpg"],
                location: {lat: 12.80000, lng: 45.03333},
                directions: "تقع صهاريج عدن في منطقة كريتر، في الجزء القديم من مدينة عدن.",
                guides: [
                    {name: "خالد العدني", contact: "+967 777 666 777"},
                    {name: "نجلاء محمد", contact: "+967 733 888 999"}
                ]
            },
            {
                id: "gold_mohur_beach",
                name: "شاطئ جولد موهر",
                category: "tourism",
                categoryName: "معلم سياحي",
                description: "أحد أجمل شواطئ عدن، يتميز برماله الذهبية ومياهه الصافية. يعد وجهة مفضلة للسباحة والاسترخاء.",
                images: ["aden_gold_mohur_1.jpg", "aden_gold_mohur_2.jpg"],
                location: {lat: 12.78889, lng: 44.96667},
                directions: "يقع شاطئ جولد موهر في الجهة الغربية من مدينة عدن، بالقرب من منطقة التواهي.",
                guides: [
                    {name: "عمر سعيد", contact: "+967 777 111 222"},
                    {name: "هدى علي", contact: "+967 733 333 444"}
                ]
            }
        ]
    },
    taiz: {
        name: "تعز",
        landmarks: [
            {
                id: "cairo_castle",
                name: "قلعة القاهرة",
                category: "historical",
                categoryName: "معلم أثري",
                description: "قلعة تاريخية تقع على قمة جبل صبر المطل على مدينة تعز. بنيت في العصر الأيوبي وتوسعت في العصر الرسولي. تتميز بموقعها الاستراتيجي وإطلالتها الرائعة على المدينة.",
                images: ["taiz_cairo_castle_1.jpg", "taiz_cairo_castle_2.jpg"],
                location: {lat: 13.57778, lng: 44.01667},
                directions: "تقع قلعة القاهرة على قمة جبل صبر، ويمكن الوصول إليها عبر طريق متعرج من وسط مدينة تعز.",
                guides: [
                    {name: "أحمد التعزي", contact: "+967 777 555 666"},
                    {name: "سلوى محمد", contact: "+967 733 777 888"}
                ]
            },
            {
                id: "alashrafiya_mosque",
                name: "الجامع الأشرفية",
                category: "historical",
                categoryName: "معلم أثري",
                description: "مسجد تاريخي بني في العصر الرسولي في القرن الثالث عشر الميلادي. يتميز بعمارته الإسلامية الفريدة وزخارفه الجميلة.",
                images: ["taiz_ashrafiya_1.jpg", "taiz_ashrafiya_2.jpg"],
                location: {lat: 13.57500, lng: 44.02500},
                directions: "يقع الجامع الأشرفية في وسط مدينة تعز القديمة، بالقرب من سوق المظفر.",
                guides: [
                    {name: "محمد التعزي", contact: "+967 777 999 000"},
                    {name: "زينب أحمد", contact: "+967 733 111 222"}
                ]
            },
            {
                id: "sabir_mountain",
                name: "جبل صبر",
                category: "natural",
                categoryName: "معلم طبيعي",
                description: "جبل شاهق يطل على مدينة تعز، يصل ارتفاعه إلى حوالي 3000 متر فوق مستوى سطح البحر. يتميز بمناظره الطبيعية الخلابة ومناخه المعتدل.",
                images: ["taiz_sabir_1.jpg", "taiz_sabir_2.jpg"],
                location: {lat: 13.56667, lng: 44.01111},
                directions: "يمكن الوصول إلى جبل صبر عبر طريق متعرج من مدينة تعز، ويستغرق الصعود حوالي ساعة بالسيارة.",
                guides: [
                    {name: "خالد الصبري", contact: "+967 777 333 444"},
                    {name: "فاطمة سعيد", contact: "+967 733 555 666"}
                ]
            }
        ]
    },
    marib: {
        name: "مأرب",
        landmarks: [
            {
                id: "marib_dam",
                name: "سد مأرب",
                category: "historical",
                categoryName: "معلم أثري",
                description: "أحد أقدم السدود في العالم، بني في الألفية الأولى قبل الميلاد في عهد مملكة سبأ. يعتبر من أهم الإنجازات الهندسية في العصور القديمة.",
                images: ["marib_dam_1.jpg", "marib_dam_2.jpg"],
                location: {lat: 15.41667, lng: 45.35000},
                directions: "يقع سد مأرب القديم على بعد حوالي 10 كم جنوب شرق مدينة مأرب.",
                guides: [
                    {name: "سالم المأربي", contact: "+967 777 777 888"},
                    {name: "نورة أحمد", contact: "+967 733 999 111"}
                ]
            },
            {
                id: "bilqis_throne",
                name: "عرش بلقيس",
                category: "historical",
                categoryName: "معلم أثري",
                description: "معبد أثري يعود إلى عصر مملكة سبأ، ويرتبط بالملكة بلقيس (ملكة سبأ). يعتبر من أهم المواقع الأثرية في اليمن.",
                images: ["marib_bilqis_1.jpg", "marib_bilqis_2.jpg"],
                location: {lat: 15.43333, lng: 45.33333},
                directions: "يقع معبد عرش بلقيس على بعد حوالي 7 كم شرق مدينة مأرب.",
                guides: [
                    {name: "محمد السبئي", contact: "+967 777 222 333"},
                    {name: "عائشة علي", contact: "+967 733 444 555"}
                ]
            }
        ]
    },
    ibb: {
        name: "إب",
        landmarks: [
            {
                id: "ibb_nature",
                name: "طبيعة إب الخضراء",
                category: "natural",
                categoryName: "معلم طبيعي",
                description: "تشتهر محافظة إب بطبيعتها الخضراء الخلابة والمدرجات الزراعية المتدرجة على سفوح الجبال. تلقب بـ'لؤلؤة اليمن الخضراء' نظراً لجمالها الطبيعي.",
                images: ["ibb_nature_1.jpg", "ibb_nature_2.jpg"],
                location: {lat: 13.96667, lng: 44.18333},
                directions: "تقع مدينة إب على بعد حوالي 193 كم جنوب صنعاء، ويمكن الوصول إليها عبر الطريق الرئيسي المؤدي إلى تعز.",
                guides: [
                    {name: "أحمد الإبي", contact: "+967 777 666 777"},
                    {name: "سلمى محمد", contact: "+967 733 888 999"}
                ]
            },
            {
                id: "baadan_castle",
                name: "قلعة بعدان",
                category: "historical",
                categoryName: "معلم أثري",
                description: "قلعة تاريخية تقع على قمة جبل بعدان في محافظة إب. بنيت في العصر الحميري وتوسعت في العصور اللاحقة. تتميز بموقعها الاستراتيجي وإطلالتها الرائعة على المناطق المحيطة.",
                images: ["ibb_baadan_1.jpg", "ibb_baadan_2.jpg"],
                location: {lat: 14.00000, lng: 44.16667},
                directions: "تقع قلعة بعدان على بعد حوالي 20 كم شمال مدينة إب، ويمكن الوصول إليها عبر طريق جبلي.",
                guides: [
                    {name: "محمد البعداني", contact: "+967 777 111 222"},
                    {name: "فاطمة سعيد", contact: "+967 733 333 444"}
                ]
            }
        ]
    }
};

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة الشريط الجانبي للأجهزة المحمولة
    initSidebar();
    
    // تهيئة صفحة المدن إذا كنا في صفحة المدن
    if (document.querySelector('.cities-filter')) {
        initCitiesPage();
    }
    
    // تهيئة نموذج الاتصال إذا كنا في صفحة تواصل معنا
    if (document.getElementById('contactForm')) {
        initContactForm();
    }
});

// تهيئة الشريط الجانبي للأجهزة المحمولة
function initSidebar() {
    // يمكن إضافة منطق للشريط الجانبي المتجاوب هنا
}

// تهيئة صفحة المدن
function initCitiesPage() {
    // تهيئة فلتر المدن
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع الأزرار
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // إضافة الفئة النشطة للزر المضغوط
            this.classList.add('active');
            
            // فلترة المدن
            const filter = this.getAttribute('data-filter');
            filterCities(filter);
        });
    });
    
    // تهيئة أزرار عرض المعالم
    const viewLandmarksButtons = document.querySelectorAll('.view-landmarks');
    viewLandmarksButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cityId = this.getAttribute('data-city');
            showLandmarks(cityId);
        });
    });
    
    // تهيئة زر العودة للمدن
    const backButton = document.querySelector('.btn-back');
    if (backButton) {
        backButton.addEventListener('click', function() {
            hideLandmarks();
        });
    }
    
    // تهيئة فلتر المعالم
    const landmarkFilterButtons = document.querySelectorAll('.landmark-filter-btn');
    landmarkFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع الأزرار
            landmarkFilterButtons.forEach(btn => btn.classList.remove('active'));
            // إضافة الفئة النشطة للزر المضغوط
            this.classList.add('active');
            
            // فلترة المعالم
            const filter = this.getAttribute('data-filter');
            filterLandmarks(filter);
        });
    });
}

// فلترة المدن حسب الفئة
function filterCities(filter) {
    const cityBoxes = document.querySelectorAll('.city-box');
    
    cityBoxes.forEach(box => {
        if (filter === 'all') {
            box.style.display = 'flex';
        } else {
            const categories = box.getAttribute('data-category').split(' ');
            if (categories.includes(filter)) {
                box.style.display = 'flex';
            } else {
                box.style.display = 'none';
            }
        }
    });
}

// عرض معالم المدينة المحددة
function showLandmarks(cityId) {
    // إخفاء قسم المدن
    document.querySelector('.cities-list').style.display = 'none';
    document.querySelector('.cities-filter').style.display = 'none';
    
    // إظهار قسم المعالم
    const landmarksSection = document.getElementById('landmarks-container');
    landmarksSection.style.display = 'block';
    
    // تحديث اسم المدينة
    const cityNameSpan = document.querySelector('#city-name span');
    cityNameSpan.textContent = citiesData[cityId].name;
    
    // إنشاء بطاقات المعالم
    const landmarksGrid = document.getElementById('landmarks-grid');
    landmarksGrid.innerHTML = '';
    
    citiesData[cityId].landmarks.forEach(landmark => {
        const landmarkCard = createLandmarkCard(landmark, cityId);
        landmarksGrid.appendChild(landmarkCard);
    });
    
    // تمرير إلى أعلى الصفحة
    window.scrollTo(0, 0);
}

// إنشاء بطاقة معلم
function createLandmarkCard(landmark, cityId) {
    const card = document.createElement('div');
    card.className = 'landmark-card';
    card.setAttribute('data-category', landmark.category);
    
    const image = document.createElement('div');
    image.className = 'landmark-image';
    image.style.backgroundImage = `url('images/${landmark.images[0]}')`;
    
    const info = document.createElement('div');
    info.className = 'landmark-info';
    
    const category = document.createElement('span');
    category.className = `landmark-category category-${landmark.category}`;
    category.textContent = landmark.categoryName;
    
    const title = document.createElement('h3');
    title.textContent = landmark.name;
    
    const description = document.createElement('p');
    description.textContent = landmark.description.substring(0, 100) + '...';
    
    const viewButton = document.createElement('button');
    viewButton.className = 'btn-small';
    viewButton.textContent = 'عرض التفاصيل';
    viewButton.addEventListener('click', function() {
        showLandmarkDetails(landmark, cityId);
    });
    
    info.appendChild(category);
    info.appendChild(title);
    info.appendChild(description);
    info.appendChild(viewButton);
    
    card.appendChild(image);
    card.appendChild(info);
    
    return card;
}

// إخفاء قسم المعالم والعودة لقسم المدن
function hideLandmarks() {
    document.querySelector('.cities-list').style.display = 'block';
    document.querySelector('.cities-filter').style.display = 'block';
    document.getElementById('landmarks-container').style.display = 'none';
}

// فلترة المعالم حسب الفئة
function filterLandmarks(filter) {
    const landmarkCards = document.querySelectorAll('.landmark-card');
    
    landmarkCards.forEach(card => {
        if (filter === 'all') {
            card.style.display = 'block';
        } else {
            const category = card.getAttribute('data-category');
            if (category === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// عرض تفاصيل المعلم في نافذة منبثقة
function showLandmarkDetails(landmark, cityId) {
    const modal = document.getElementById('landmark-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalSlider = document.getElementById('modal-slider');
    const modalDescription = document.getElementById('modal-description');
    
    // تعيين العنوان والوصف
    modalTitle.textContent = landmark.name;
    modalDescription.textContent = landmark.description;
    
    // تعيين الفئة
    const modalCategoryBadge = document.getElementById('modal-category-badge');
    if (modalCategoryBadge) {
        modalCategoryBadge.textContent = landmark.categoryName || landmark.category || "يستحق الزيارة";
    }
    
    // إنشاء شرائح الصور
    modalSlider.innerHTML = '';
    landmark.images.forEach((image, index) => {
        const img = document.createElement('img');
        img.src = `images/${image}`;
        img.alt = landmark.name;
        img.className = 'slider-image';
        if (index === 0) {
            img.classList.add('active');
        }
        modalSlider.appendChild(img);
    });
    
    // تهيئة أزرار التنقل بين الصور
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    let currentSlide = 0;
    
    prevBtn.onclick = function() {
        changeSlide(-1);
    };
    
    nextBtn.onclick = function() {
        changeSlide(1);
    };
    
    function changeSlide(direction) {
        const slides = modalSlider.querySelectorAll('.slider-image');
        slides[currentSlide].classList.remove('active');
        
        currentSlide = (currentSlide + direction + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
    }
    
    // تهيئة زر إظهار الاتجاهات
    const showDirectionsBtn = document.getElementById('show-directions');
    showDirectionsBtn.onclick = function() {
        showDirectionsModal(landmark, cityId);
    };
    
    // تهيئة زر إظهار المرشدين
    const showGuidesBtn = document.getElementById('show-guides');
    showGuidesBtn.onclick = function() {
        showGuidesModal(landmark, cityId);
    };
    
    // إظهار النافذة المنبثقة
    modal.style.display = 'block';
    
    // إغلاق النافذة المنبثقة عند النقر على زر الإغلاق
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };
    
    // إغلاق النافذة المنبثقة عند النقر خارجها
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// عرض نافذة الاتجاهات
function showDirectionsModal(landmark, cityId) {
    const modal = document.getElementById('map-modal');
    const landmarkName = document.getElementById('map-landmark-name');
    const directionsText = document.getElementById('directions-text');
    
    // تعيين اسم المعلم واتجاهات الوصول
    landmarkName.textContent = landmark.name;
    directionsText.textContent = landmark.directions;
    
    // إنشاء الخريطة (يمكن استبدالها بخريطة حقيقية باستخدام Google Maps API)
    const mapContainer = document.getElementById('landmark-map');
    mapContainer.innerHTML = `
        <div class="map-placeholder">
            <i class="fas fa-map-marked-alt"></i>
            <p>موقع ${landmark.name}</p>
            <p>الإحداثيات: ${landmark.location.lat}, ${landmark.location.lng}</p>
        </div>
    `;
    
    // إظهار النافذة المنبثقة
    modal.style.display = 'block';
    
    // إغلاق النافذة المنبثقة عند النقر على زر الإغلاق
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };
    
    // إغلاق النافذة المنبثقة عند النقر خارجها
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// عرض نافذة المرشدين
function showGuidesModal(landmark, cityId) {
    const modal = document.getElementById('guides-modal');
    const landmarkName = document.getElementById('guides-landmark-name');
    const guidesList = document.getElementById('guides-list');
    
    // تعيين اسم المعلم
    landmarkName.textContent = landmark.name;
    
    // إنشاء قائمة المرشدين
    guidesList.innerHTML = '';
    landmark.guides.forEach(guide => {
        const guideCard = document.createElement('div');
        guideCard.className = 'guide-card';
        
        const avatar = document.createElement('div');
        avatar.className = 'guide-avatar';
        avatar.innerHTML = '<i class="fas fa-user"></i>';
        
        const name = document.createElement('h3');
        name.className = 'guide-name';
        name.textContent = guide.name;
        
        const contact = document.createElement('p');
        contact.className = 'guide-contact';
        contact.textContent = guide.contact;
        
        guideCard.appendChild(avatar);
        guideCard.appendChild(name);
        guideCard.appendChild(contact);
        
        guidesList.appendChild(guideCard);
    });
    
    // إظهار النافذة المنبثقة
    modal.style.display = 'block';
    
    // إغلاق النافذة المنبثقة عند النقر على زر الإغلاق
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };
    
    // إغلاق النافذة المنبثقة عند النقر خارجها
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// تهيئة نموذج الاتصال
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // يمكن إضافة التحقق من صحة البيانات هنا
        
        // عرض رسالة نجاح (في تطبيق حقيقي، سيتم إرسال البيانات إلى الخادم)
        alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
        
        // إعادة تعيين النموذج
        contactForm.reset();
    });
}
