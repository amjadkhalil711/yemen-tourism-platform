<?php

namespace App\Repositories\Eloquent;

use App\Contracts\CityRepository;
use App\Models\City;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentCityRepository implements CityRepository
{
    public function paginateForIndex(int $perPage, int $page, string $status = '', string $search = ''): LengthAwarePaginator
    {
        $query = City::query()
            ->select([
                'id',
                'slug',
                'name',
                'name_en',
                'description',
                'description_en',
                'image_url',
                'status',
                'category',
                'created_at',
                'updated_at',
            ])
            ->withCount('landmarks')
            ->with(['landmarks' => function ($query) {
                $query->where('is_active', true)->orderBy('sort_order');
            }]);

        if ($status !== '') {
            $query->where('status', $status);
        }

        if ($search !== '') {
            $query->where(function ($subQuery) use ($search): void {
                $subQuery
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query
            ->orderBy('name')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function loadForShow(City $city): City
    {
        $city->loadCount('landmarks')->load([
            'landmarks' => function ($query): void {
                $query
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
                    ->where('is_active', true)
                    ->orderBy('sort_order')
                    ->limit(50);
            },
        ]);

        return $city;
    }

    public function create(array $data): City
    {
        return City::query()->create($data);
    }

    public function update(City $city, array $data): City
    {
        $city->fill($data);
        $city->save();

        return $city;
    }

    public function delete(City $city): void
    {
        $city->delete();
    }
}
