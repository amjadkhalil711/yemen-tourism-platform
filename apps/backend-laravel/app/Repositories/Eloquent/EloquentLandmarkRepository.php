<?php

namespace App\Repositories\Eloquent;

use App\Contracts\LandmarkRepository;
use App\Models\City;
use App\Models\Landmark;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentLandmarkRepository implements LandmarkRepository
{
    public function paginateForIndex(
        int $perPage,
        int $page,
        ?int $cityId,
        string $category,
        string $search,
        bool $includeInactive = false
    ): LengthAwarePaginator {
        $query = Landmark::query()
            ->select([
                'id',
                'city_id',
                'external_id',
                'name',
                'name_en',
                'description',
                'description_en',
                'categories',
                'category_names',
                'latitude',
                'longitude',
                'google_maps_url',
                'images',
                'sort_order',
                'is_active',
                'created_at',
                'updated_at',
            ])
            ->with('city:id,slug,name');

        if (!$includeInactive) {
            $query->where('is_active', true);
        }

        if ($cityId !== null) {
            $query->where('city_id', $cityId);
        }

        if ($category !== '') {
            $query->whereJsonContains('categories', $category);
        }

        if ($search !== '') {
            $query->where(function ($subQuery) use ($search): void {
                $subQuery
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function resolveCityIdBySlug(string $citySlug): ?int
    {
        $resolvedId = City::query()
            ->where('slug', $citySlug)
            ->value('id');

        return is_numeric($resolvedId) ? (int) $resolvedId : null;
    }

    public function loadForShow(Landmark $landmark): Landmark
    {
        return $landmark->load('city:id,slug,name');
    }

    public function create(array $data): Landmark
    {
        return Landmark::query()->create($data);
    }

    public function update(Landmark $landmark, array $data): Landmark
    {
        $landmark->fill($data);
        $landmark->save();

        return $landmark;
    }

    public function delete(Landmark $landmark): void
    {
        $landmark->delete();
    }
}
