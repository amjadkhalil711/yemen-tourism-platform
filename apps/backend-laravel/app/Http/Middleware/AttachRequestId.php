<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AttachRequestId
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = $this->resolveRequestId($request);

        $request->attributes->set('request_id', $requestId);

        $response = $next($request);
        $response->headers->set('X-Request-Id', $requestId);

        return $response;
    }

    private function resolveRequestId(Request $request): string
    {
        $requestId = $request->headers->get('X-Request-Id');
        if (!is_string($requestId)) {
            return (string) Str::uuid();
        }

        $normalized = trim($requestId);
        if ($normalized === '' || strlen($normalized) > 96) {
            return (string) Str::uuid();
        }

        if (!preg_match('/^[A-Za-z0-9._:-]+$/', $normalized)) {
            return (string) Str::uuid();
        }

        return $normalized;
    }
}
