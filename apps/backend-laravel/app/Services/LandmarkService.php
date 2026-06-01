<?php

namespace App\Services;

use App\Contracts\LandmarkRepository;
use App\Http\Resources\LandmarkResource;
use App\Models\Landmark;
use App\Support\CacheVersion;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class LandmarkService
{
    public function __construct(private readonly LandmarkRepository $landmarks)
    {
    }

    /**
     * @return array<string, mixed>
     */
    public function listPaginated(int $perPage, int $page, string $citySlug, string $category, string $search, bool $includeInactive = false): array
    {
        $version = (int) Cache::get('landmarks:version', 1);
        $hash = md5(json_encode([
            'city_slug' => $citySlug,
            'category' => $category,
            'q' => $search,
            'page' => $page,
            'per_page' => $perPage,
            'include_inactive' => $includeInactive,
        ]));
        $cacheKey = "landmarks:index:v{$version}:{$hash}";

        /** @var array<string, mixed> $payload */
        $payload = Cache::remember($cacheKey, now()->addMinutes(15), function () use ($citySlug, $category, $search, $perPage, $page, $includeInactive) {
            $cityId = $this->resolveCityIdBySlug($citySlug);
            if ($citySlug !== '' && $cityId === null) {
                return $this->emptyPaginatedPayload($perPage, $page);
            }

            $landmarks = $this->landmarks->paginateForIndex(
                $perPage,
                $page,
                $cityId,
                $category,
                $search,
                $includeInactive
            );

            return LandmarkResource::collection($landmarks)->response()->getData(true);
        });

        return $payload;
    }

    /**
     * @return array<string, mixed>
     */
    private function emptyPaginatedPayload(int $perPage, int $page): array
    {
        $emptyPaginator = new LengthAwarePaginator(
            items: new Collection(),
            total: 0,
            perPage: $perPage,
            currentPage: $page,
            options: [
                'path' => request()->url(),
                'pageName' => 'page',
            ]
        );

        return LandmarkResource::collection($emptyPaginator)->response()->getData(true);
    }

    private function resolveCityIdBySlug(string $citySlug): ?int
    {
        if ($citySlug === '') {
            return null;
        }

        $citiesVersion = (int) Cache::get('cities:version', 1);
        $cacheKey = "cities:slug-id:v{$citiesVersion}:{$citySlug}";

        /** @var int $cachedCityId */
        $cachedCityId = (int) Cache::remember($cacheKey, now()->addMinutes(30), function () use ($citySlug): int {
            $resolvedId = $this->landmarks->resolveCityIdBySlug($citySlug);

            return $resolvedId ?? 0;
        });

        return $cachedCityId > 0 ? $cachedCityId : null;
    }

    /**
     * @return array<string, mixed>
     */
    public function show(Landmark $landmark): array
    {
        $version = (int) Cache::get('landmarks:version', 1);
        $cacheKey = "landmarks:show:v{$version}:{$landmark->id}";

        /** @var array<string, mixed> $payload */
        $payload = Cache::remember($cacheKey, now()->addMinutes(30), function () use ($landmark) {
            $landmark = $this->landmarks->loadForShow($landmark);

            return (new LandmarkResource($landmark))->resolve();
        });

        return $payload;
    }

    public function create(array $data): Landmark
    {
        $data['is_active'] = array_key_exists('is_active', $data) ? (bool) $data['is_active'] : true;
        $data['sort_order'] = $data['sort_order'] ?? 999;

        $landmark = $this->landmarks->create($data);
        $this->touchCacheVersion();

        return $landmark;
    }

    public function update(Landmark $landmark, array $data): Landmark
    {
        $landmark = $this->landmarks->update($landmark, $data);
        $this->touchCacheVersion();

        return $landmark;
    }

    public function delete(Landmark $landmark): void
    {
        $this->landmarks->delete($landmark);
        $this->touchCacheVersion();
    }

    private function touchCacheVersion(): void
    {
        CacheVersion::bumpMany([
            'landmarks:version',
            'cities:version',
            'stats:version',
        ]);
    }
}
