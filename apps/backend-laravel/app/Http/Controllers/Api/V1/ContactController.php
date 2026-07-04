<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactMessageRequest;
use App\Http\Resources\ContactMessageResource;
use App\Models\ContactMessage;
use App\Services\ContactService;
use App\Support\ApiResponse;
use App\Support\PaginationEnvelope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function __construct(private readonly ContactService $contactService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->integer('per_page', 15), 100));
        $page = max(1, (int) $request->integer('page', 1));

        $messages = ContactMessage::orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage, ['*'], 'page', $page);

        return ApiResponse::success(
            data: ContactMessageResource::collection($messages)->response()->getData(true)['data'],
            message: 'Messages loaded.',
            extra: PaginationEnvelope::extractExtra($messages->toArray())
        );
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

    public function destroy(ContactMessage $contactMessage): JsonResponse
    {
        $contactMessage->delete();

        return ApiResponse::deleted('Message deleted successfully.');
    }
}
