<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ChatbotController;
use App\Http\Controllers\Api\V1\CityController;
use App\Http\Controllers\Api\V1\ContactController;
use App\Http\Controllers\Api\V1\LandmarkController;
use App\Http\Controllers\Api\V1\MapViewController;
use App\Http\Controllers\Api\V1\StatsController;
use App\Http\Middleware\AuditAdminWriteAction;
use App\Http\Middleware\SetApiSecurityHeaders;
use App\Http\Middleware\SetPublicApiCacheHeaders;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware(SetApiSecurityHeaders::class)->group(function (): void {
    Route::get('health', fn () => response()->json(['status' => 'ok']));

    // ── AI Chatbot (public — rate-limited) ─────────────────────────────────
    Route::post('chatbot/message', [ChatbotController::class, 'message'])
        ->middleware('throttle:chatbot');

    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:auth-login');
    Route::post('auth/user-login', [AuthController::class, 'userLogin'])->middleware('throttle:user-login');
    Route::post('contact', [ContactController::class, 'store'])->middleware('throttle:contact-submit');

    Route::get('cities', [CityController::class, 'index'])->middleware(SetPublicApiCacheHeaders::class);
    Route::get('cities/{city:slug}', [CityController::class, 'show'])->middleware(SetPublicApiCacheHeaders::class);
    Route::get('landmarks', [LandmarkController::class, 'index'])->middleware(SetPublicApiCacheHeaders::class);
    Route::get('landmarks/{landmark}', [LandmarkController::class, 'show'])->middleware(SetPublicApiCacheHeaders::class);
    Route::post('landmarks/{landmark}/views', [MapViewController::class, 'store'])->middleware('throttle:map-views');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('auth/logout', [AuthController::class, 'logout'])->middleware('abilities:session:write');
        Route::get('auth/me', [AuthController::class, 'me'])->middleware('abilities:session:read');

        Route::middleware(['can:manage-content', 'throttle:admin-write'])->group(function (): void {
            Route::get('stats/overview', [StatsController::class, 'overview'])->middleware('abilities:stats:read');
            Route::get('admin/landmarks', [LandmarkController::class, 'adminIndex'])->middleware('abilities:content:read');

            Route::middleware(['abilities:content:write', AuditAdminWriteAction::class])->group(function (): void {
                Route::post('cities', [CityController::class, 'store']);
                Route::put('cities/{city:slug}', [CityController::class, 'update']);
                Route::delete('cities/{city:slug}', [CityController::class, 'destroy']);

                Route::post('landmarks', [LandmarkController::class, 'store']);
                Route::put('landmarks/{landmark}', [LandmarkController::class, 'update']);
                Route::delete('landmarks/{landmark}', [LandmarkController::class, 'destroy']);
            });
        });
    });
});
