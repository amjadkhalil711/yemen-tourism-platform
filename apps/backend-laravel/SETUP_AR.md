# إعداد Backend (Laravel 11 API)

## 1) تشغيل سريع محليًا باستخدام SQLite

من جذر المشروع:

```powershell
cd apps/backend-laravel
$env:DB_CONNECTION='sqlite'
$env:DB_DATABASE='database/database.sqlite'
..\..\tools\php\php.exe artisan migrate:fresh --seed
..\..\tools\php\php.exe artisan serve --host=127.0.0.1 --port=8000
```

بيانات دخول الأدمن الافتراضية:

- username: `admin`
- email: `admin@example.com`
- password: `admin123`

## 2) تشغيل MySQL + Redis (بيئة مطابقة للإنتاج)

1. انسخ `.env.example` إلى `.env`.
2. شغّل MySQL و Redis محليًا.
3. نفّذ:

```powershell
cd apps/backend-laravel
..\..\tools\php\php.exe artisan migrate --seed
..\..\tools\php\php.exe artisan serve --host=127.0.0.1 --port=8000
```

ملاحظة: إذا ظهر خطأ اتصال MySQL (`SQLSTATE[HY000] [2002]`) فهذا يعني أن MySQL غير شغّال أو بيانات الاتصال في `.env` غير صحيحة.

## 3) التحقق من سلامة النظام

```powershell
..\..\tools\php\php.exe artisan route:list
..\..\tools\php\php.exe artisan test
```

## 4) التحقق من اكتمال البيانات بعد الـ Seed

عند النجاح، يجب أن تكون البيانات:

- المدن: `25`
- المعالم: `614`

