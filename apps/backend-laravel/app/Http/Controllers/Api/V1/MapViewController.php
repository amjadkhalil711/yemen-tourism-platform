<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Landmark;
use App\Models\MapView;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\PersonalAccessToken;

class MapViewController extends Controller
{
    private const MAP_VIEWS_TOTAL_CACHE_KEY = 'stats:map_views_total';

    public function store(Landmark $landmark): JsonResponse
    {
        $tokenModel = $this->resolveBearerToken();
        if ($tokenModel && !$tokenModel->can('map:view:track')) {
            return ApiResponse::error(
                message: 'Insufficient token ability for map view tracking.',
                status: 403,
                data: []
            );
        }

        $user = $tokenModel?->tokenable;

        MapView::query()->create([
            'user_id' => $user?->id,
            'landmark_id' => $landmark->id,
            'landmark_name' => $landmark->name,
        ]);

        $this->incrementMapViewsCounter();

        return ApiResponse::success(
            data: [
                'landmark_id' => $landmark->id,
            ],
            message: 'Landmark view tracked.',
            status: 201
        );
    }

    private function incrementMapViewsCounter(): void
    {
        $cachedCount = Cache::get(self::MAP_VIEWS_TOTAL_CACHE_KEY);

        if (!is_numeric($cachedCount)) {
            Cache::forever(self::MAP_VIEWS_TOTAL_CACHE_KEY, (int) MapView::query()->count());

            return;
        }

        $incremented = Cache::increment(self::MAP_VIEWS_TOTAL_CACHE_KEY);
        if ($incremented !== false) {
            return;
        }

        Cache::forever(self::MAP_VIEWS_TOTAL_CACHE_KEY, ((int) $cachedCount) + 1);
    }

    private function resolveBearerToken(): ?PersonalAccessToken
    {
        $bearerToken = request()->bearerToken();
        if (!is_string($bearerToken) || trim($bearerToken) === '') {
            return null;
        }

        $resolvedToken = PersonalAccessToken::findToken($bearerToken);

        return $resolvedToken instanceof PersonalAccessToken ? $resolvedToken : null;
    }
}
