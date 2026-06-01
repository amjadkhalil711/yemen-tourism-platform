<?php

namespace Tests\Feature;

use Database\Seeders\AdminUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiRateLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AdminUserSeeder::class);
    }

    public function test_admin_login_endpoint_is_rate_limited(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'login' => 'admin',
                'password' => 'wrong-password',
            ])->assertStatus(422);
        }

        $response = $this->postJson('/api/v1/auth/login', [
            'login' => 'admin',
            'password' => 'wrong-password',
        ]);

        $response
            ->assertStatus(429)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Too many requests. Please wait and try again.')
            ->assertJsonStructure([
                'status',
                'message',
                'errors',
                'data',
                'request_id',
            ]);

        $this->assertTrue($response->headers->has('Retry-After'));
        $this->assertTrue($response->headers->has('X-Request-Id'));
    }

    public function test_user_login_endpoint_is_rate_limited(): void
    {
        for ($i = 0; $i < 20; $i++) {
            $this->postJson('/api/v1/auth/user-login', [
                'name' => 'Visitor',
                'email' => "visitor{$i}@example.com",
            ])->assertOk();
        }

        $response = $this->postJson('/api/v1/auth/user-login', [
            'name' => 'Visitor',
            'email' => 'visitor-over-limit@example.com',
        ]);

        $response
            ->assertStatus(429)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Too many requests. Please wait and try again.')
            ->assertJsonStructure([
                'status',
                'message',
                'errors',
                'data',
                'request_id',
            ]);

        $this->assertTrue($response->headers->has('Retry-After'));
        $this->assertTrue($response->headers->has('X-Request-Id'));
    }
}
