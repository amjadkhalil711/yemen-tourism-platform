<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetPublicApiCacheHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        if (!$request->isMethod('GET')) {
            return $response;
        }

        if (!$response instanceof JsonResponse || $response->getStatusCode() !== 200) {
            return $response;
        }

        $etag = $this->buildStableEtag((string) $response->getContent());
        if ($etag === null) {
            return $response;
        }

        $response->headers->set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        $response->headers->set('ETag', $etag);

        $ifNoneMatch = trim((string) $request->headers->get('If-None-Match'));
        if ($ifNoneMatch !== '' && $ifNoneMatch === $etag) {
            $response->setNotModified();
        }

        return $response;
    }

    private function buildStableEtag(string $content): ?string
    {
        if ($content === '') {
            return null;
        }

        $decoded = json_decode($content, true);
        if (is_array($decoded)) {
            unset($decoded['request_id']);
            $normalizedContent = json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            if (is_string($normalizedContent) && $normalizedContent !== '') {
                return '"'.sha1($normalizedContent).'"';
            }
        }

        return '"'.sha1($content).'"';
    }
}

