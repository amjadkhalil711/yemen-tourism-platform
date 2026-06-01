<?php

namespace Tests\Feature;

use Database\Seeders\AdminUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiResponseContractTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AdminUserSeeder::class);
    }

    public function test_login_response_keeps_legacy_fields_and_exposes_standard_envelope(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'login' => 'admin',
            'password' => 'admin123',
        ]);

        $response->assertOk()->assertJsonStructure([
            'status',
            'message',
            'data' => [
                'token',
                'user' => ['id', 'name', 'email', 'role'],
            ],
            // Legacy compatibility fields:
            'token',
            'user' => ['id', 'name', 'email', 'role'],
        ]);

        $this->assertSame($response->json('token'), $response->json('data.token'));
        $this->assertSame($response->json('user.id'), $response->json('data.user.id'));
        $response->assertJsonPath('status', 'success');
    }

    public function test_invalid_login_response_uses_error_envelope(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'login' => 'admin',
            'password' => 'invalid-password',
        ])
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Invalid credentials.')
            ->assertJsonStructure([
                'errors' => ['login'],
            ]);
    }
}
