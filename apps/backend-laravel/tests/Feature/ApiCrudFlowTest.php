<?php

namespace Tests\Feature;

use Database\Seeders\AdminUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiCrudFlowTest extends TestCase
{
    use RefreshDatabase;

    private string $token = '';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AdminUserSeeder::class);

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'login' => 'admin',
            'password' => 'admin123',
        ])->assertOk()->json();

        $this->token = (string) ($loginResponse['token'] ?? '');
    }

    public function test_admin_can_create_update_and_delete_city(): void
    {
        $createResponse = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/cities', [
                'name' => 'Test City',
                'slug' => 'test-city',
                'description' => 'City for API test',
                'status' => 'published',
            ]);

        $createResponse
            ->assertStatus(201)
            ->assertJsonPath('data.slug', 'test-city');

        $this->withHeader('Authorization', "Bearer {$this->token}")
            ->putJson('/api/v1/cities/test-city', [
                'name' => 'Test City Updated',
                'slug' => 'test-city',
                'description' => 'Updated description',
                'status' => 'draft',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'draft');

        $this->withHeader('Authorization', "Bearer {$this->token}")
            ->deleteJson('/api/v1/cities/test-city')
            ->assertNoContent();
    }

    public function test_admin_can_create_update_and_delete_landmark(): void
    {
        $cityResponse = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/cities', [
                'name' => 'Landmark City',
                'slug' => 'landmark-city',
                'description' => 'Landmark parent city',
                'status' => 'published',
            ])
            ->assertStatus(201)
            ->json();

        $cityId = (int) ($cityResponse['data']['id'] ?? 0);

        $createLandmarkResponse = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/landmarks', [
                'city_id' => $cityId,
                'name' => 'Landmark A',
                'description' => 'Description A',
                'categories' => ['historical'],
                'category_names' => ['تاريخي'],
                'latitude' => 15.3547,
                'longitude' => 44.2066,
                'is_active' => true,
            ]);

        $createLandmarkResponse
            ->assertStatus(201)
            ->assertJsonPath('data.name', 'Landmark A');

        $landmarkId = (int) ($createLandmarkResponse->json('data.id') ?? 0);

        $this->withHeader('Authorization', "Bearer {$this->token}")
            ->putJson("/api/v1/landmarks/{$landmarkId}", [
                'name' => 'Landmark A Updated',
                'description' => 'Description Updated',
                'city_id' => $cityId,
                'latitude' => 15.3550,
                'longitude' => 44.2070,
                'is_active' => true,
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Landmark A Updated');

        $this->withHeader('Authorization', "Bearer {$this->token}")
            ->deleteJson("/api/v1/landmarks/{$landmarkId}")
            ->assertNoContent();
    }

    public function test_admin_cannot_create_landmark_with_non_http_map_url(): void
    {
        $cityResponse = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/cities', [
                'name' => 'Validation City',
                'slug' => 'validation-city',
                'description' => 'City for validation test',
                'status' => 'published',
            ])
            ->assertStatus(201)
            ->json();

        $cityId = (int) ($cityResponse['data']['id'] ?? 0);

        $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/landmarks', [
                'city_id' => $cityId,
                'name' => 'Invalid URL Landmark',
                'description' => 'Validation should fail for non-http URL.',
                'categories' => ['historical'],
                'category_names' => ['Historical'],
                'latitude' => 15.3547,
                'longitude' => 44.2066,
                'google_maps_url' => 'ftp://example.com/location',
                'is_active' => true,
            ])
            ->assertStatus(422)
            ->assertJsonPath('status', 'error');
    }
}
