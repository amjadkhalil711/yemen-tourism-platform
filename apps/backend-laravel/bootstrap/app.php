<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->append(\App\Http\Middleware\AttachRequestId::class);
        $middleware->alias([
            'abilities' => \Laravel\Sanctum\Http\Middleware\CheckAbilities::class,
            'ability' => \Laravel\Sanctum\Http\Middleware\CheckForAnyAbility::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Throwable $e, Request $request) {
            if (!$request->is('api/*')) {
                return null;
            }

            if ($e instanceof HttpResponseException) {
                return $e->getResponse();
            }

            $requestId = (string) ($request->attributes->get('request_id') ?: Str::uuid());
            $status = 500;
            $payload = [
                'status' => 'error',
                'message' => 'Server error.',
                'errors' => [],
                'request_id' => $requestId,
            ];

            if ($e instanceof ValidationException) {
                $status = 422;
                $payload['message'] = 'Validation failed.';
                $payload['errors'] = $e->errors();
            } elseif ($e instanceof AuthenticationException) {
                $status = 401;
                $payload['message'] = 'Unauthenticated.';
            } elseif ($e instanceof AuthorizationException) {
                $status = 403;
                $payload['message'] = 'Forbidden.';
            } elseif ($e instanceof ModelNotFoundException) {
                $status = 404;
                $payload['message'] = 'Resource not found.';
            } elseif ($e instanceof HttpExceptionInterface) {
                $status = $e->getStatusCode();
                $payload['message'] = $e->getMessage() !== '' ? $e->getMessage() : 'Request failed.';
            }

            if ($status >= 500) {
                Log::error('Unhandled API exception', [
                    'request_id' => $requestId,
                    'path' => $request->path(),
                    'method' => $request->method(),
                    'exception' => $e::class,
                    'error_message' => $e->getMessage(),
                ]);
            }

            return response()->json($payload, $status);
        });
    })->create();
