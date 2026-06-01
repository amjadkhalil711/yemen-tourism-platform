<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

final class ApiResponse
{
    /**
     * @param  array<string, mixed>  $meta
     * @param  array<string, mixed>  $extra
     */
    public static function success(
        mixed $data = [],
        string $message = 'Success.',
        int $status = 200,
        array $meta = [],
        array $extra = []
    ): JsonResponse {
        $payload = [
            'status' => 'success',
            'message' => $message,
            'data' => $data,
        ];

        $requestId = self::resolveRequestId();
        if ($requestId !== null) {
            $payload['request_id'] = $requestId;
        }

        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        if ($extra !== []) {
            $payload = array_merge($payload, $extra);
        }

        return response()->json($payload, $status);
    }

    /**
     * @param  array<string, mixed>  $errors
     * @param  array<string, mixed>  $extra
     */
    public static function error(
        string $message = 'Request failed.',
        int $status = 400,
        array $errors = [],
        mixed $data = [],
        array $extra = []
    ): JsonResponse {
        $payload = [
            'status' => 'error',
            'message' => $message,
            'errors' => $errors,
            'data' => $data,
        ];

        $requestId = self::resolveRequestId();
        if ($requestId !== null) {
            $payload['request_id'] = $requestId;
        }

        if ($extra !== []) {
            $payload = array_merge($payload, $extra);
        }

        return response()->json($payload, $status);
    }

    /**
     * @param  array<string, mixed>  $meta
     * @param  array<string, mixed>  $extra
     */
    public static function deleted(
        string $message = 'Resource deleted successfully.',
        mixed $data = [],
        array $meta = [],
        array $extra = []
    ): JsonResponse {
        $mode = strtolower(trim((string) config('api.delete_response_mode', 'no_content')));

        if ($mode === 'envelope') {
            return self::success(
                data: $data,
                message: $message,
                status: 200,
                meta: $meta,
                extra: $extra
            );
        }

        return response()->json([], 204);
    }

    private static function resolveRequestId(): ?string
    {
        $request = request();
        $requestId = $request->attributes->get('request_id');

        if (is_string($requestId) && trim($requestId) !== '') {
            return $requestId;
        }

        $headerRequestId = $request->headers->get('X-Request-Id');

        return is_string($headerRequestId) && trim($headerRequestId) !== ''
            ? $headerRequestId
            : null;
    }
}
