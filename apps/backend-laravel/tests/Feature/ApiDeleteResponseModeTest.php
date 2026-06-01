<?php

namespace Tests\Feature;

use App\Models\City;
use Database\Seeders\AdminUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiDeleteResponseModeTest extends TestCase
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

    public function test_city_delete_can_return_success_envelope_in_compatibility_mode(): void
    {
        $this->app['config']->set('api.delete_response_mode', 'envelope');

        $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/cities', [
                'name' => 'Delete Test City',
                'slug' => 'delete-test-city',
                'description' => 'City to delete',
                'status' => 'published',
            ])
            ->assertStatus(201);

        $this->withHeader('Authorization', "Bearer {$this->token}")
            ->deleteJson('/api/v1/cities/delete-test-city')
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'City deleted successfully.')
            ->assertJsonPath('data', [])
            ->assertJsonStructure([
                'status',
                'message',
                'data',
                'request_id',
            ]);
    }

    public function test_landmark_delete_can_return_success_envelope_in_compatibility_mode(): void
    {
        $this->app['config']->set('api.delete_response_mode', 'envelope');

        $city = City::query()->create([
            'name' => 'Delete Landmark City',
            'slug' => 'delete-landmark-city',
            'description' => 'City for landmark deletion test',
            'status' => 'published',
        ]);

        $landmarkResponse = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/landmarks', [
                'city_id' => $city->id,
                'name' => 'Delete Landmark',
                'description' => 'Landmark to delete',
                'categories' => ['historical'],
                'category_names' => ['Historical'],
                'is_active' => true,
            ])
            ->assertStatus(201)
            ->json();

        $landmarkId = (int) ($landmarkResponse['data']['id'] ?? 0);

        $this->withHeader('Authorization', "Bearer {$this->token}")
            ->deleteJson("/api/v1/landmarks/{$landmarkId}")
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Landmark deleted successfully.')
            ->assertJsonPath('data', [])
            ->assertJsonStructure([
                'status',
                'message',
                'data',
                'request_id',
            ]);
    }
}
