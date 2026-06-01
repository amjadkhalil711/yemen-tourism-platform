<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListCitiesRequest;
use App\Http\Requests\StoreCityRequest;
use App\Http\Requests\UpdateCityRequest;
use App\Http\Resources\CityResource;
use App\Models\City;
use App\Services\CityService;
use App\Support\ApiResponse;
use App\Support\PaginationEnvelope;
use Illuminate\Http\JsonResponse;

class CityController extends Controller
{
    public function __construct(private readonly CityService $cityService)
    {
    }

    public function index(ListCitiesRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $perPage = max(1, min((int) $request->integer('per_page', 15), 100));
        $page = max(1, (int) $request->integer('page', 1));
        $status = (string) ($filters['status'] ?? '');
        $search = (string) ($filters['q'] ?? '');
        $payload = $this->cityService->listPaginated($perPage, $page, $status, $search);

        return ApiResponse::success(
            data: is_array($payload['data'] ?? null) ? $payload['data'] : [],
            message: 'Cities loaded.',
            extra: PaginationEnvelope::extractExtra($payload)
        );
    }

    public function show(City $city): JsonResponse
    {
        $payload = $this->cityService->show($city);

        return ApiResponse::success(
            data: $payload,
            message: 'City loaded.'
        );
    }

    public function store(StoreCityRequest $request): JsonResponse
    {
        $city = $this->cityService->create($request->validated());

        return ApiResponse::success(
            data: (new CityResource($city))->resolve(),
            message: 'City created successfully.',
            status: 201
        );
    }

    public function update(UpdateCityRequest $request, City $city): JsonResponse
    {
        $city = $this->cityService->update($city, $request->validated());

        return ApiResponse::success(
            data: (new CityResource($city))->resolve(),
            message: 'City updated successfully.'
        );
    }

    public function destroy(City $city): JsonResponse
    {
        $this->cityService->delete($city);

        return ApiResponse::deleted('City deleted successfully.');
    }
}
