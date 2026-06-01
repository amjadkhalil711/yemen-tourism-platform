<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactMessageRequest;
use App\Services\ContactService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    public function __construct(private readonly ContactService $contactService)
    {
    }

    public function store(StoreContactMessageRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $requestId = (string) ($request->attributes->get('request_id') ?? '');

        $this->contactService->submit($payload, $requestId);

        return ApiResponse::success(
            data: [
                'accepted' => true,
            ],
            message: 'Message received successfully.',
            status: 201
        );
    }
}
