<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiAdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    private string $superAdminToken = '';
    private string $cityAdminToken = '';
    private User $superAdmin;
    private User $cityAdmin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AdminUserSeeder::class);

        // Get super admin
        $this->superAdmin = User::where('role', 'admin')->firstOrFail();
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'login' => $this->superAdmin->email,
            'password' => 'admin123',
        ])->assertOk()->json();
        $this->superAdminToken = (string) ($loginResponse['token'] ?? '');

        // Create city admin
        $this->cityAdmin = User::create([
            'name' => 'City Admin User',
            'email' => 'cities@example.com',
            'password' => bcrypt('password123'),
            'role' => 'admin_cities',
        ]);
        $loginCityResponse = $this->postJson('/api/v1/auth/login', [
            'login' => 'cities@example.com',
            'password' => 'password123',
        ])->assertOk()->json();
        $this->cityAdminToken = (string) ($loginCityResponse['token'] ?? '');
    }

    public function test_guests_cannot_manage_admins(): void
    {
        $this->getJson('/api/v1/admin/users')->assertStatus(401);
        $this->postJson('/api/v1/admin/users', [])->assertStatus(401);
        $this->deleteJson('/api/v1/admin/users/1')->assertStatus(401);
    }

    public function test_sub_admins_cannot_manage_admins(): void
    {
        $this->withHeader('Authorization', "Bearer {$this->cityAdminToken}")
            ->getJson('/api/v1/admin/users')
            ->assertStatus(403);

        $this->withHeader('Authorization', "Bearer {$this->cityAdminToken}")
            ->postJson('/api/v1/admin/users', [
                'name' => 'Another Admin',
                'email' => 'another@example.com',
                'password' => 'password123',
                'role' => 'admin_landmarks',
            ])
            ->assertStatus(403);

        $this->withHeader('Authorization', "Bearer {$this->cityAdminToken}")
            ->deleteJson("/api/v1/admin/users/{$this->superAdmin->id}")
            ->assertStatus(403);
    }

    public function test_super_admin_can_manage_admins(): void
    {
        // 1. List admins
        $response = $this->withHeader('Authorization', "Bearer {$this->superAdminToken}")
            ->getJson('/api/v1/admin/users');

        $response->assertOk()
            ->assertJsonCount(2, 'data'); // Super Admin + City Admin

        // 2. Create admin
        $createResponse = $this->withHeader('Authorization', "Bearer {$this->superAdminToken}")
            ->postJson('/api/v1/admin/users', [
                'name' => 'New Landmark Admin',
                'email' => 'landmarks@example.com',
                'password' => 'password123',
                'role' => 'admin_landmarks',
            ]);

        $createResponse->assertStatus(201)
            ->assertJsonPath('data.role', 'admin_landmarks');

        $newAdminId = (int) $createResponse->json('data.id');

        $this->assertDatabaseHas('users', [
            'id' => $newAdminId,
            'role' => 'admin_landmarks',
        ]);

        // 3. Delete admin
        $this->withHeader('Authorization', "Bearer {$this->superAdminToken}")
            ->deleteJson("/api/v1/admin/users/{$newAdminId}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('users', [
            'id' => $newAdminId,
        ]);
    }

    public function test_super_admin_cannot_delete_themselves(): void
    {
        $this->withHeader('Authorization', "Bearer {$this->superAdminToken}")
            ->deleteJson("/api/v1/admin/users/{$this->superAdmin->id}")
            ->assertStatus(400)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'You cannot delete your own admin account.');
    }

    public function test_sub_admins_are_restricted_by_gates(): void
    {
        // City admin can manage cities
        $this->withHeader('Authorization', "Bearer {$this->cityAdminToken}")
            ->postJson('/api/v1/cities', [
                'name' => 'Role City',
                'slug' => 'role-city',
                'status' => 'published',
            ])
            ->assertStatus(201);

        // City admin CANNOT manage landmarks (should get 403)
        $this->withHeader('Authorization', "Bearer {$this->cityAdminToken}")
            ->postJson('/api/v1/landmarks', [
                'city_id' => 1,
                'name' => 'Landmark B',
                'is_active' => true,
            ])
            ->assertStatus(403);
    }
}
