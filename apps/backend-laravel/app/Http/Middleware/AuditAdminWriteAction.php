<?php

namespace App\Http\Middleware;

use App\Models\City;
use App\Models\Landmark;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class AuditAdminWriteAction
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $actor = $request->user();
        $startedAt = microtime(true);
        $response = null;
        $exception = null;

        try {
            $response = $next($request);

            return $response;
        } catch (Throwable $caughtException) {
            $exception = $caughtException;
            throw $caughtException;
        } finally {
            if ($this->shouldAudit()) {
                $this->writeAuditLog(
                    request: $request,
                    actor: $actor,
                    response: $response,
                    exception: $exception,
                    startedAt: $startedAt
                );
            }
        }
    }

    private function shouldAudit(): bool
    {
        return (bool) config('audit.admin_write.enabled', true);
    }

    private function writeAuditLog(
        Request $request,
        ?User $actor,
        ?Response $response,
        ?Throwable $exception,
        float $startedAt
    ): void {
        $statusCode = $response?->getStatusCode();
        $durationMs = (int) round((microtime(true) - $startedAt) * 1000);
        $requestId = (string) ($request->attributes->get('request_id') ?? '');

        $route = $request->route();
        $routeUri = method_exists($route, 'uri') ? (string) $route->uri() : null;
        $routeName = method_exists($route, 'getName') ? $route->getName() : null;
        $city = $this->resolveCityIdentifier($request);
        $landmark = $this->resolveLandmarkIdentifier($request);

        $context = [
            'event' => 'admin_write_audit',
            'request_id' => $requestId !== '' ? $requestId : null,
            'actor_id' => $actor?->id,
            'actor_role' => $actor?->role,
            'method' => $request->method(),
            'path' => $request->path(),
            'route_uri' => $routeUri,
            'route_name' => is_string($routeName) && $routeName !== '' ? $routeName : null,
            'target_city' => $city,
            'target_landmark' => $landmark,
            'status' => $statusCode,
            'succeeded' => $statusCode !== null ? $statusCode < 400 : false,
            'duration_ms' => $durationMs,
            'ip' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
            'exception' => $exception?->getMessage() ? [
                'class' => $exception::class,
                'message' => substr($exception->getMessage(), 0, 255),
            ] : null,
        ];

        $channel = trim((string) config('audit.admin_write.channel', ''));
        if ($channel !== '') {
            Log::channel($channel)->info('Admin content write action', $context);
            return;
        }

        Log::info('Admin content write action', $context);
    }

    private function resolveCityIdentifier(Request $request): ?string
    {
        $city = $request->route('city');
        if ($city instanceof City) {
            return $city->slug !== '' ? $city->slug : (string) $city->id;
        }

        if (is_scalar($city)) {
            return (string) $city;
        }

        return null;
    }

    private function resolveLandmarkIdentifier(Request $request): ?string
    {
        $landmark = $request->route('landmark');
        if ($landmark instanceof Landmark) {
            return (string) $landmark->id;
        }

        if (is_scalar($landmark)) {
            return (string) $landmark;
        }

        return null;
    }
}
