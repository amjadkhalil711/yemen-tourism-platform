<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetApiSecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $this->setIfMissing($response, 'X-Content-Type-Options', 'nosniff');
        $this->setIfMissing($response, 'X-Frame-Options', 'DENY');
        $this->setIfMissing($response, 'Referrer-Policy', 'no-referrer');
        $this->setIfMissing($response, 'Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
        $this->setIfMissing(
            $response,
            'Content-Security-Policy',
            "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
        );

        return $response;
    }

    private function setIfMissing(Response $response, string $name, string $value): void
    {
        if (!$response->headers->has($name)) {
            $response->headers->set($name, $value);
        }
    }
}
