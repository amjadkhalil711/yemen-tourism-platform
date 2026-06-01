<?php

namespace App\Services;

use App\Contracts\CityRepository;
use App\Http\Resources\CityResource;
use App\Models\City;
use App\Support\CacheVersion;
use Illuminate\Support\Facades\Cache;

class CityService
{
    public function __construct(private readonly CityRepository $cities)
    {
    }

    /**
     * @return array<string, mixed>
     */
    public function listPaginated(int $perPage, int $page, string $status = '', string $search = ''): array
    {
        $version = (int) Cache::get('cities:version', 1);
        $statusSegment = $status !== '' ? $status : 'all';
        $searchSegment = $search !== '' ? md5($search) : 'none';
        $cacheKey = "cities:index:v{$version}:s{$statusSegment}:q{$searchSegment}:p{$page}:pp{$perPage}";

        /** @var array<string, mixed> $payload */
        $payload = Cache::remember($cacheKey, now()->addMinutes(15), function () use ($perPage, $page, $status, $search) {
            $cities = $this->cities->paginateForIndex($perPage, $page, $status, $search);

            return CityResource::collection($cities)->response()->getData(true);
        });

        return $payload;
    }

    /**
     * @return array<string, mixed>
     */
    public function show(City $city): array
    {
        $version = (int) Cache::get('cities:version', 1);
        $cacheKey = "cities:show:v{$version}:{$city->slug}";

        /** @var array<string, mixed> $payload */
        $payload = Cache::remember($cacheKey, now()->addMinutes(30), function () use ($city) {
            $city = $this->cities->loadForShow($city);

            return (new CityResource($city))->resolve();
        });

        return $payload;
    }

    public function create(array $data): City
    {
        $city = $this->cities->create($data);
        $this->touchCacheVersion();

        return $city;
    }

    public function update(City $city, array $data): City
    {
        $city = $this->cities->update($city, $data);
        $this->touchCacheVersion();

        return $city;
    }

    public function delete(City $city): void
    {
        $this->cities->delete($city);
        $this->touchCacheVersion();
    }

    private function touchCacheVersion(): void
    {
        CacheVersion::bumpMany([
            'cities:version',
            'landmarks:version',
            'stats:version',
        ]);
    }
}
