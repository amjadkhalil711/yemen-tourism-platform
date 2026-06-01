<?php

namespace App\Contracts;

use App\Models\City;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CityRepository
{
    public function paginateForIndex(int $perPage, int $page, string $status = '', string $search = ''): LengthAwarePaginator;

    public function loadForShow(City $city): City;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): City;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(City $city, array $data): City;

    public function delete(City $city): void;
}
