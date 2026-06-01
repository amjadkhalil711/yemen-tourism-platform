<?php

namespace Tests\Feature;

use App\Http\Middleware\AuditAdminWriteAction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\RouteCollectionInterface;
use Tests\TestCase;

class ApiAdminAuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_write_routes_include_audit_middleware(): void
    {
        /** @var RouteCollectionInterface $routes */
        $routes = app('router')->getRoutes();

        $targets = [
            ['method' => 'POST', 'uri' => 'api/v1/cities'],
            ['method' => 'PUT', 'uri' => 'api/v1/cities/{city}'],
            ['method' => 'DELETE', 'uri' => 'api/v1/cities/{city}'],
            ['method' => 'POST', 'uri' => 'api/v1/landmarks'],
            ['method' => 'PUT', 'uri' => 'api/v1/landmarks/{landmark}'],
            ['method' => 'DELETE', 'uri' => 'api/v1/landmarks/{landmark}'],
        ];

        foreach ($targets as $target) {
            $route = collect($routes->getRoutes())->first(function ($candidate) use ($target): bool {
                return in_array($target['method'], $candidate->methods(), true)
                    && $candidate->uri() === $target['uri'];
            });

            $this->assertNotNull($route, sprintf('Route %s %s should exist.', $target['method'], $target['uri']));
            $this->assertContains(
                AuditAdminWriteAction::class,
                $route->gatherMiddleware(),
                sprintf('Route %s %s should include admin write audit middleware.', $target['method'], $target['uri'])
            );
        }
    }
}
