<?php

namespace App\Providers;

use App\Contracts\CityRepository;
use App\Contracts\LandmarkRepository;
use App\Models\User;
use App\Repositories\Eloquent\EloquentCityRepository;
use App\Repositories\Eloquent\EloquentLandmarkRepository;
use App\Support\ApiResponse;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(CityRepository::class, EloquentCityRepository::class);
        $this->app->bind(LandmarkRepository::class, EloquentLandmarkRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('manage-content', function (User $user): bool {
            return str_starts_with((string) $user->role, 'admin');
        });

        Gate::define('manage-cities', function (User $user): bool {
            return in_array($user->role, ['admin', 'admin_cities']);
        });

        Gate::define('manage-landmarks', function (User $user): bool {
            return in_array($user->role, ['admin', 'admin_landmarks']);
        });

        Gate::define('view-visitors', function (User $user): bool {
            return in_array($user->role, ['admin', 'admin_visitors']);
        });

        Gate::define('view-reports', function (User $user): bool {
            return in_array($user->role, ['admin', 'admin_report']);
        });

        Gate::define('manage-messages', function (User $user): bool {
            return in_array($user->role, ['admin', 'admin_messages']);
        });

        Gate::define('manage-admins', function (User $user): bool {
            return $user->role === 'admin';
        });

        RateLimiter::for('auth-login', function (Request $request): Limit {
            $identifier = strtolower(trim((string) ($request->input('login') ?: $request->input('email') ?: 'guest')));

            return $this->withRateLimitedEnvelope(
                Limit::perMinute(10)->by($identifier.'|'.$request->ip())
            );
        });

        RateLimiter::for('user-login', function (Request $request): Limit {
            return $this->withRateLimitedEnvelope(
                Limit::perMinute(20)->by('visitor|'.$request->ip())
            );
        });

        RateLimiter::for('contact-submit', function (Request $request): Limit {
            $email = strtolower(trim((string) ($request->input('email') ?: 'guest')));

            return $this->withRateLimitedEnvelope(
                Limit::perMinute(5)->by($email.'|'.$request->ip())
            );
        });

        RateLimiter::for('map-views', function (Request $request): Limit {
            $actorKey = $request->user()?->id ? 'user:'.$request->user()->id : 'ip:'.$request->ip();
            $landmarkKey = (string) ($request->route('landmark')?->id ?? $request->route('landmark') ?? 'unknown');

            return $this->withRateLimitedEnvelope(
                Limit::perMinute(120)->by($actorKey.'|landmark:'.$landmarkKey)
            );
        });

        RateLimiter::for('admin-write', function (Request $request): Limit {
            $actorKey = $request->user()?->id ? 'admin:'.$request->user()->id : 'ip:'.$request->ip();

            return $this->withRateLimitedEnvelope(
                Limit::perMinute(120)->by($actorKey)
            );
        });

        RateLimiter::for('chatbot', function (Request $request): Limit {
            return $this->withRateLimitedEnvelope(
                Limit::perMinute(30)->by('chatbot:'.$request->ip())
            );
        });
    }

    private function withRateLimitedEnvelope(Limit $limit): Limit
    {
        return $limit->response(function (Request $request, array $headers): JsonResponse {
            $response = ApiResponse::error(
                message: 'Too many requests. Please wait and try again.',
                status: 429,
                data: []
            );

            foreach ($headers as $name => $value) {
                $response->headers->set((string) $name, (string) $value);
            }

            return $response;
        });
    }
}
