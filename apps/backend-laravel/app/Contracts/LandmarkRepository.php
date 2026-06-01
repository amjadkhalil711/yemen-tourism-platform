<?php

namespace App\Contracts;

use App\Models\Landmark;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface LandmarkRepository
{
    public function paginateForIndex(
        int $perPage,
        int $page,
        ?int $cityId,
        string $category,
        string $search,
        bool $includeInactive = false
    ): LengthAwarePaginator;

    public function resolveCityIdBySlug(string $citySlug): ?int;

    public function loadForShow(Landmark $landmark): Landmark;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Landmark;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Landmark $landmark, array $data): Landmark;

    public function delete(Landmark $landmark): void;
}
