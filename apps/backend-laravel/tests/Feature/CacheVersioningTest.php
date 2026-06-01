<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Landmark;
use App\Support\CacheVersion;
use Database\Seeders\AdminUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CacheVersioningTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(AdminUserSeeder::class);
        Cache::setDefaultDriver('database');
    }

    public function test_cache_version_helper_initializes_missing_key_for_database_store(): void
    {
        Cache::forget('test:version');
        $this->assertNull(Cache::get('test:version'));

        $next = CacheVersion::bump('test:version');

        $this->assertSame(2, $next);
        $this->assertSame(2, (int) Cache::get('test:version'));
    }

    public function test_creating_city_bumps_version_keys_when_missing(): void
    {
        Cache::forget('cities:version');
        Cache::forget('landmarks:version');
        Cache::forget('stats:version');

        $token = (string) $this->postJson('/api/v1/auth/login', [
            'login' => 'admin',
            'password' => 'admin123',
        ])->assertOk()->json('token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/cities', [
                'name' => 'Cache Test City',
                'slug' => 'cache-test-city',
                'description' => 'Checks version keys with database cache store',
                'status' => 'published',
            ])
            ->assertCreated();

        $this->assertSame(2, (int) Cache::get('cities:version'));
        $this->assertSame(2, (int) Cache::get('landmarks:version'));
        $this->assertSame(2, (int) Cache::get('stats:version'));
    }

    public function test_tracking_map_view_updates_counter_without_bumping_stats_version(): void
    {
        Cache::forever('stats:version', 10);
        Cache::forget('stats:map_views_total');

        $city = City::query()->create([
            'name' => 'Map Counter City',
            'slug' => 'map-counter-city',
            'description' => 'City used for map view cache counter test',
            'status' => 'published',
        ]);

        $landmark = Landmark::query()->create([
            'city_id' => $city->id,
            'name' => 'Map Counter Landmark',
            'description' => 'Landmark used for map view cache counter test',
            'categories' => ['historical'],
            'category_names' => ['Historical'],
            'latitude' => 15.35,
            'longitude' => 44.21,
            'google_maps_url' => null,
            'images' => [],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->postJson("/api/v1/landmarks/{$landmark->id}/views")
            ->assertCreated()
            ->assertJsonPath('data.landmark_id', $landmark->id);

        $this->assertSame(10, (int) Cache::get('stats:version'));
        $this->assertSame(1, (int) Cache::get('stats:map_views_total'));
    }
}
