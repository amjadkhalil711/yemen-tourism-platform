<?php

/**
 * ============================================================
 *  سكريبت نقل البيانات من SQLite إلى PostgreSQL
 *  Yemen Tourism Website
 * ============================================================
 *
 *  كيفية التشغيل:
 *  1. تأكد أن PostgreSQL شغّال وقاعدة البيانات منشأة
 *  2. نفّذ أولاً: php artisan migrate  (على قاعدة postgres)
 *  3. ثم شغّل هذا السكريبت: php migrate_to_postgres.php
 * ============================================================
 */

// ─── إعدادات SQLite ───────────────────────────────────────────
$sqlitePath = __DIR__ . '/database/database.sqlite';

// ─── إعدادات PostgreSQL ───────────────────────────────────────
$pgHost = '127.0.0.1';
$pgPort = '5432';
$pgDb = 'yemen_tourism';
$pgUser = 'postgres';
$pgPassword = '123'; // ← غيّر هذا

// ═════════════════════════════════════════════════════════════
//  لا تعدّل ما تحت هذا السطر
// ═════════════════════════════════════════════════════════════

echo "\n🚀 بدء عملية نقل البيانات من SQLite إلى PostgreSQL...\n\n";

// ─── الاتصال بـ SQLite ────────────────────────────────────────
if (!file_exists($sqlitePath)) {
    die("❌ خطأ: ملف SQLite غير موجود في: $sqlitePath\n");
}

try {
    $sqlite = new PDO("sqlite:$sqlitePath");
    $sqlite->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ تم الاتصال بـ SQLite بنجاح\n";
} catch (PDOException $e) {
    die("❌ فشل الاتصال بـ SQLite: " . $e->getMessage() . "\n");
}

// ─── الاتصال بـ PostgreSQL ────────────────────────────────────
try {
    $pg = new PDO("pgsql:host=$pgHost;port=$pgPort;dbname=$pgDb", $pgUser, $pgPassword);
    $pg->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ تم الاتصال بـ PostgreSQL بنجاح\n\n";
} catch (PDOException $e) {
    die("❌ فشل الاتصال بـ PostgreSQL: " . $e->getMessage() . "\n");
}

// ─── دالة مساعدة لطباعة النتائج ──────────────────────────────
function migrateTable(PDO $sqlite, PDO $pg, string $table, string $insertSQL, callable $mapper): void
{
    echo "📦 جاري نقل جدول: $table ...\n";

    $rows = $sqlite->query("SELECT * FROM $table ORDER BY id")->fetchAll(PDO::FETCH_ASSOC);

    if (empty($rows)) {
        echo "   ⚠️  الجدول فارغ، تم تخطيه.\n\n";
        return;
    }

    // حذف البيانات الموجودة مسبقاً لتجنب التعارض (إعادة تشغيل آمنة)
    $pg->exec("DELETE FROM $table");

    $stmt = $pg->prepare($insertSQL);
    $count = 0;
    $errors = 0;
    $sp = 0; // savepoint counter

    foreach ($rows as $row) {
        $sp++;
        $pg->exec("SAVEPOINT sp_$sp");
        try {
            $stmt->execute($mapper($row));
            $pg->exec("RELEASE SAVEPOINT sp_$sp");
            $count++;
        } catch (PDOException $e) {
            // تراجع عن هذا السجل فقط، وليس كل شيء
            $pg->exec("ROLLBACK TO SAVEPOINT sp_$sp");
            $errors++;
            echo "   ⚠️  تم تخطي السجل id={$row['id']}: " . $e->getMessage() . "\n";
        }
    }

    // إعادة ضبط الـ sequence في PostgreSQL لتفادي تعارض الـ IDs
    try {
        $pg->exec("SELECT setval(pg_get_serial_sequence('$table', 'id'), COALESCE(MAX(id), 1)) FROM $table");
    } catch (PDOException $e) {
        // بعض الجداول لا تحتوي على sequence
    }

    echo "   ✅ تم نقل $count سجل" . ($errors > 0 ? " | ⚠️ تم تخطي $errors سجل" : "") . "\n\n";
}

// ─── بدء المعاملة ─────────────────────────────────────────────
$pg->beginTransaction();

try {

    // ══════════════════════════════════════════════════════════
    //  1. جدول المستخدمين (users)
    // ══════════════════════════════════════════════════════════
    migrateTable(
        $sqlite,
        $pg,
        'users',
        'INSERT INTO users
            (id, name, email, role, email_verified_at, password, remember_token, created_at, updated_at)
         VALUES
            (:id, :name, :email, :role, :email_verified_at, :password, :remember_token, :created_at, :updated_at)
         ON CONFLICT (id) DO NOTHING',
        fn($row) => [
            ':id' => $row['id'],
            ':name' => $row['name'],
            ':email' => $row['email'],
            ':role' => $row['role'] ?? 'viewer',
            ':email_verified_at' => $row['email_verified_at'] ?? null,
            ':password' => $row['password'],
            ':remember_token' => $row['remember_token'] ?? null,
            ':created_at' => $row['created_at'] ?? date('Y-m-d H:i:s'),
            ':updated_at' => $row['updated_at'] ?? date('Y-m-d H:i:s'),
        ]
    );

    // ══════════════════════════════════════════════════════════
    //  2. جدول المدن (cities)
    // ══════════════════════════════════════════════════════════
    migrateTable(
        $sqlite,
        $pg,
        'cities',
        'INSERT INTO cities
            (id, slug, name, name_en, description, description_en, image_url, status, category, created_at, updated_at)
         VALUES
            (:id, :slug, :name, :name_en, :description, :description_en, :image_url, :status, :category, :created_at, :updated_at)
         ON CONFLICT (id) DO NOTHING',
        fn($row) => [
            ':id' => $row['id'],
            ':slug' => $row['slug'],
            ':name' => $row['name'],
            ':name_en' => $row['name_en'] ?? null,
            ':description' => $row['description'] ?? null,
            ':description_en' => $row['description_en'] ?? null,
            ':image_url' => $row['image_url'] ?? null,
            ':status' => $row['status'] ?? 'published',
            ':category' => $row['category'] ?? null,
            ':created_at' => $row['created_at'] ?? date('Y-m-d H:i:s'),
            ':updated_at' => $row['updated_at'] ?? date('Y-m-d H:i:s'),
        ]
    );

    // ══════════════════════════════════════════════════════════
    //  3. جدول المعالم (landmarks)
    // ══════════════════════════════════════════════════════════
    migrateTable(
        $sqlite,
        $pg,
        'landmarks',
        'INSERT INTO landmarks
            (id, city_id, external_id, name, name_en, description, description_en,
             categories, category_names, latitude, longitude, google_maps_url,
             images, sort_order, is_active, created_at, updated_at)
         VALUES
            (:id, :city_id, :external_id, :name, :name_en, :description, :description_en,
             :categories, :category_names, :latitude, :longitude, :google_maps_url,
             :images, :sort_order, :is_active, :created_at, :updated_at)
         ON CONFLICT (id) DO NOTHING',
        fn($row) => [
            ':id' => $row['id'],
            ':city_id' => $row['city_id'],
            ':external_id' => $row['external_id'] ?? null,
            ':name' => $row['name'],
            ':name_en' => $row['name_en'] ?? null,
            ':description' => $row['description'] ?? null,
            ':description_en' => $row['description_en'] ?? null,
            ':categories' => $row['categories'] ?? null,
            ':category_names' => $row['category_names'] ?? null,
            ':latitude' => $row['latitude'] ?? null,
            ':longitude' => $row['longitude'] ?? null,
            ':google_maps_url' => $row['google_maps_url'] ?? null,
            ':images' => $row['images'] ?? null,
            ':sort_order' => $row['sort_order'] ?? 999,
            ':is_active' => (int) ($row['is_active'] ?? 1),
            ':created_at' => $row['created_at'] ?? date('Y-m-d H:i:s'),
            ':updated_at' => $row['updated_at'] ?? date('Y-m-d H:i:s'),
        ]
    );

    // ══════════════════════════════════════════════════════════
//  4. جدول map_views (إن وُجد)
// ══════════════════════════════════════════════════════════
    $hasMapViews = $sqlite->query("SELECT name FROM sqlite_master WHERE type='table' AND name='map_views'")->fetch();

    if ($hasMapViews) {
        migrateTable(
            $sqlite,
            $pg,
            'map_views',
            'INSERT INTO map_views 
            (id, user_id, landmark_id, landmark_name, created_at, updated_at)
         VALUES 
            (:id, :user_id, :landmark_id, :landmark_name, :created_at, :updated_at)
         ON CONFLICT (id) DO NOTHING',
            fn($row) => [
                ':id' => $row['id'],
                ':user_id' => $row['user_id'] ?? null,
                ':landmark_id' => $row['landmark_id'] ?? null,
                ':landmark_name' => $row['landmark_name'] ?? null,
                ':created_at' => $row['created_at'] ?? date('Y-m-d H:i:s'),
                ':updated_at' => $row['updated_at'] ?? date('Y-m-d H:i:s'),
            ]
        );
    }
    // ─── تأكيد المعاملة ───────────────────────────────────────
    $pg->commit();
    echo "════════════════════════════════════════\n";
    echo "🎉 تم نقل جميع البيانات بنجاح!\n";
    echo "════════════════════════════════════════\n\n";
    echo "📌 الخطوة التالية: عدّل ملف .env وغيّر DB_CONNECTION إلى pgsql\n\n";

} catch (Exception $e) {
    $pg->rollBack();
    echo "\n❌ حدث خطأ، تم التراجع عن جميع التغييرات!\n";
    echo "السبب: " . $e->getMessage() . "\n";
}
