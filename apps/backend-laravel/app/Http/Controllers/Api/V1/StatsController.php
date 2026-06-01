<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Landmark;
use App\Models\MapView;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    private const MAP_VIEWS_TOTAL_CACHE_KEY = 'stats:map_views_total';

    public function overview(): JsonResponse
    {
        $version = (int) Cache::get('stats:version', 1);
        $cacheKey = "stats:overview:v{$version}";

        $payload = Cache::remember($cacheKey, now()->addMinutes(5), function (): array {
            $landmarkCounts = Landmark::query()
                ->selectRaw('COUNT(*) as landmarks_count')
                ->selectRaw('COUNT(*) FILTER (WHERE is_active = true) as active_landmarks_count')
                ->first();

            // Per-city breakdown: landmark counts + average coordinates
            $cities = City::select('id', 'name', 'name_en', 'slug')
                ->withCount('landmarks')
                ->withAvg('landmarks', 'latitude')
                ->withAvg('landmarks', 'longitude')
                ->orderByDesc('landmarks_count')
                ->take(10)
                ->get();

            // Map views per city (aggregated through landmarks)
            $cityMapViews = DB::table('map_views')
                ->join('landmarks', 'map_views.landmark_id', '=', 'landmarks.id')
                ->select('landmarks.city_id', DB::raw('COUNT(*) as views_count'))
                ->whereNotNull('map_views.landmark_id')
                ->groupBy('landmarks.city_id')
                ->pluck('views_count', 'city_id')
                ->toArray();

            $citiesBreakdown = $cities->map(fn ($city) => [
                'name'            => $city->name,
                'name_en'         => $city->name_en,
                'slug'            => $city->slug,
                'landmarks_count' => $city->landmarks_count,
                'map_views_count' => (int) ($cityMapViews[$city->id] ?? 0),
                'avg_lat'         => $city->landmarks_avg_latitude !== null
                    ? round((float) $city->landmarks_avg_latitude, 4) : null,
                'avg_lng'         => $city->landmarks_avg_longitude !== null
                    ? round((float) $city->landmarks_avg_longitude, 4) : null,
            ])->values()->toArray();

            // Category distribution from active landmark category_names (JSON array column)
            $categoryBreakdown = Landmark::select('category_names')
                ->where('is_active', true)
                ->get()
                ->flatMap(fn ($l) => $l->category_names ?? [])
                ->countBy()
                ->sortDesc()
                ->take(8)
                ->map(fn ($count, $name) => ['name' => $name, 'count' => $count])
                ->values()
                ->toArray();

            // Monthly views for current year — 12-element array (Jan–Dec)
            // Use driver-appropriate syntax for month extraction
            $driver = DB::connection()->getDriverName();
            $year   = now()->year;

            if ($driver === 'pgsql') {
                $monthNumExpr = "EXTRACT(MONTH FROM created_at)::integer";
            } else {
                $monthNumExpr = "CAST(strftime('%m', created_at) AS INTEGER)";
            }

            $monthlyRaw = DB::table('map_views')
                ->selectRaw("{$monthNumExpr} as month_num, COUNT(*) as count")
                ->whereYear('created_at', $year)
                ->groupByRaw($monthNumExpr)
                ->orderByRaw($monthNumExpr)
                ->pluck('count', 'month_num')
                ->toArray();

            $monthlyViews = array_map(
                fn ($m) => (int) ($monthlyRaw[$m] ?? $monthlyRaw[(string) $m] ?? 0),
                range(1, 12)
            );

            return [
                'cities_count'           => City::query()->count(),
                'landmarks_count'        => (int) ($landmarkCounts?->landmarks_count ?? 0),
                'active_landmarks_count' => (int) ($landmarkCounts?->active_landmarks_count ?? 0),
                'cities_breakdown'       => $citiesBreakdown,
                'category_breakdown'     => $categoryBreakdown,
                'monthly_views'          => $monthlyViews,
            ];
        });

        $payload['map_views_count'] = $this->resolveMapViewsCount();

        return ApiResponse::success(
            data: $payload,
            message: 'Stats overview loaded.'
        );
    }

    private function resolveMapViewsCount(): int
    {
        $cachedCount = Cache::get(self::MAP_VIEWS_TOTAL_CACHE_KEY);
        if (is_numeric($cachedCount)) {
            return max((int) $cachedCount, 0);
        }

        $databaseCount = (int) MapView::query()->count();
        Cache::forever(self::MAP_VIEWS_TOTAL_CACHE_KEY, $databaseCount);

        return $databaseCount;
    }
}