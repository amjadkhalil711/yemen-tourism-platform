<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListLandmarksRequest;
use App\Http\Requests\StoreLandmarkRequest;
use App\Http\Requests\UpdateLandmarkRequest;
use App\Http\Resources\LandmarkResource;
use App\Models\Landmark;
use App\Services\LandmarkService;
use App\Support\ApiResponse;
use App\Support\PaginationEnvelope;
use Illuminate\Http\JsonResponse;

class LandmarkController extends Controller
{
    public function __construct(private readonly LandmarkService $landmarkService)
    {
    }

    public function index(ListLandmarksRequest $request): JsonResponse
    {
        return $this->respondWithLandmarkList($request, false);
    }

    public function adminIndex(ListLandmarksRequest $request): JsonResponse
    {
        return $this->respondWithLandmarkList($request, true);
    }

    public function show(Landmark $landmark): JsonResponse
    {
        $payload = $this->landmarkService->show($landmark);

        return ApiResponse::success(
            data: $payload,
            message: 'Landmark loaded.'
        );
    }

    public function store(StoreLandmarkRequest $request): JsonResponse
    {
        $landmark = $this->landmarkService->create($request->validated());

        return ApiResponse::success(
            data: (new LandmarkResource($landmark->load('city:id,slug,name')))->resolve(),
            message: 'Landmark created successfully.',
            status: 201
        );
    }

    public function update(UpdateLandmarkRequest $request, Landmark $landmark): JsonResponse
    {
        $landmark = $this->landmarkService->update($landmark, $request->validated());

        return ApiResponse::success(
            data: (new LandmarkResource($landmark->load('city:id,slug,name')))->resolve(),
            message: 'Landmark updated successfully.'
        );
    }

    public function destroy(Landmark $landmark): JsonResponse
    {
        $this->landmarkService->delete($landmark);

        return ApiResponse::deleted('Landmark deleted successfully.');
    }

    private function respondWithLandmarkList(ListLandmarksRequest $request, bool $includeInactive): JsonResponse
    {
        $filters = $request->validated();
        $perPage = max(1, min((int) $request->integer('per_page', 15), 100));
        $page = max(1, (int) $request->integer('page', 1));
        $citySlug = (string) ($filters['city_slug'] ?? '');
        $category = (string) ($filters['category'] ?? '');
        $search = (string) ($filters['q'] ?? '');

        $payload = $this->landmarkService->listPaginated($perPage, $page, $citySlug, $category, $search, $includeInactive);

        return ApiResponse::success(
            data: is_array($payload['data'] ?? null) ? $payload['data'] : [],
            message: 'Landmarks loaded.',
            extra: PaginationEnvelope::extractExtra($payload)
        );
    }
}
