<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Landmark;
use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class ApiAuthFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AdminUserSeeder::class);
    }

    public function test_admin_can_login_with_legacy_username(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'login' => 'admin',
            'password' => 'admin123',
        ]);

        $response
            ->assertOk()
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'name', 'email', 'role'],
            ]);
    }

    public function test_admin_can_login_with_email(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'admin123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.role', 'admin');
    }

    public function test_admin_can_login_with_case_insensitive_username(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'login' => 'AdMiN',
            'password' => 'admin123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.role', 'admin');
    }

    public function test_admin_can_login_with_uppercase_email_input(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'ADMIN@EXAMPLE.COM',
            'password' => 'admin123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.role', 'admin');
    }

    public function test_invalid_login_is_rejected(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'login' => 'admin',
            'password' => 'wrong-pass',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('message', 'Invalid credentials.');
    }

    public function test_stats_endpoint_requires_authentication(): void
    {
        $this->getJson('/api/v1/stats/overview')
            ->assertStatus(401);
    }

    public function test_admin_with_token_can_access_stats_overview(): void
    {
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'login' => 'admin',
            'password' => 'admin123',
        ])->assertOk()->json();

        $token = $loginResponse['token'] ?? '';

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/stats/overview')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'cities_count',
                    'landmarks_count',
                    'active_landmarks_count',
                    'map_views_count',
                ],
            ]);
    }

    public function test_non_admin_user_is_forbidden_from_stats_overview(): void
    {
        $user = User::query()->create([
            'name' => 'editor',
            'email' => 'editor@example.com',
            'password' => Hash::make('editor123'),
            'role' => 'user',
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/stats/overview')
            ->assertStatus(403);
    }

    public function test_admin_login_issues_scoped_token_abilities(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'login' => 'admin',
            'password' => 'admin123',
        ])->assertOk();

        $plainTextToken = (string) $response->json('token');
        $tokenId = (int) explode('|', $plainTextToken, 2)[0];
        $token = PersonalAccessToken::query()->findOrFail($tokenId);

        $expectedAbilities = [
            'session:read',
            'session:write',
            'stats:read',
            'content:read',
            'content:write',
            'map:view:track',
        ];

        foreach ($expectedAbilities as $ability) {
            $this->assertContains($ability, $token->abilities);
        }
    }

    public function test_user_login_issues_scoped_visitor_token_abilities(): void
    {
        $response = $this->postJson('/api/v1/auth/user-login', [
            'name' => 'Visitor One',
            'email' => 'visitor-one@example.com',
        ])->assertOk();

        $plainTextToken = (string) $response->json('token');
        $tokenId = (int) explode('|', $plainTextToken, 2)[0];
        $token = PersonalAccessToken::query()->findOrFail($tokenId);

        $expectedAbilities = [
            'session:read',
            'session:write',
            'map:view:track',
        ];

        foreach ($expectedAbilities as $ability) {
            $this->assertContains($ability, $token->abilities);
        }

        $this->assertNotContains('content:write', $token->abilities);
        $this->assertNotContains('stats:read', $token->abilities);
    }

    public function test_admin_stats_requires_stats_read_ability_when_token_is_scoped(): void
    {
        $admin = User::query()->where('email', 'admin@example.com')->firstOrFail();
        $token = $admin->createToken('limited-admin', ['session:read'])->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/stats/overview')
            ->assertStatus(403);
    }

    public function test_admin_stats_accepts_legacy_wildcard_token_for_backward_compatibility(): void
    {
        $admin = User::query()->where('email', 'admin@example.com')->firstOrFail();
        $token = $admin->createToken('legacy-admin', ['*'])->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/stats/overview')
            ->assertOk();
    }

    public function test_map_view_tracking_is_reflected_in_stats_overview_count(): void
    {
        $city = City::query()->create([
            'name' => 'Stats City',
            'slug' => 'stats-city',
            'description' => 'City used for stats test',
            'status' => 'published',
        ]);

        $landmark = Landmark::query()->create([
            'city_id' => $city->id,
            'name' => 'Stats Landmark',
            'description' => 'Landmark used for stats test',
            'categories' => ['historical'],
            'category_names' => ['Historical'],
            'latitude' => 15.35,
            'longitude' => 44.21,
            'google_maps_url' => null,
            'images' => [],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $token = (string) $this->postJson('/api/v1/auth/login', [
            'login' => 'admin',
            'password' => 'admin123',
        ])->assertOk()->json('token');

        $beforeCount = (int) $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/stats/overview')
            ->assertOk()
            ->json('data.map_views_count');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/v1/landmarks/{$landmark->id}/views")
            ->assertCreated()
            ->assertJsonPath('data.landmark_id', $landmark->id);

        $afterCount = (int) $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/stats/overview')
            ->assertOk()
            ->json('data.map_views_count');

        $this->assertSame($beforeCount + 1, $afterCount);
    }

    public function test_anonymous_user_can_track_map_view(): void
    {
        $city = City::query()->create([
            'name' => 'Anonymous View City',
            'slug' => 'anonymous-view-city',
            'description' => 'City used for anonymous map view tracking test',
            'status' => 'published',
        ]);

        $landmark = Landmark::query()->create([
            'city_id' => $city->id,
            'name' => 'Anonymous View Landmark',
            'description' => 'Landmark used for anonymous map view tracking test',
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
    }

    public function test_authenticated_token_without_map_view_ability_cannot_track_map_view(): void
    {
        $city = City::query()->create([
            'name' => 'Limited Token City',
            'slug' => 'limited-token-city',
            'description' => 'City used for token ability map view test',
            'status' => 'published',
        ]);

        $landmark = Landmark::query()->create([
            'city_id' => $city->id,
            'name' => 'Limited Token Landmark',
            'description' => 'Landmark used for token ability map view test',
            'categories' => ['historical'],
            'category_names' => ['Historical'],
            'latitude' => 15.35,
            'longitude' => 44.21,
            'google_maps_url' => null,
            'images' => [],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $admin = User::query()->where('email', 'admin@example.com')->firstOrFail();
        $limitedToken = $admin->createToken('limited-map-tracking', ['session:read'])->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$limitedToken}")
            ->postJson("/api/v1/landmarks/{$landmark->id}/views")
            ->assertStatus(403)
            ->assertJsonPath('status', 'error');
    }
}
