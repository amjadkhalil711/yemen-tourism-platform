<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use Database\Seeders\AdminUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiContactMessagesAdminTest extends TestCase
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

    public function test_admin_can_list_contact_messages(): void
    {
        // Seed some contact messages
        ContactMessage::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+1234567890',
            'subject' => 'Test Subject 1',
            'message' => 'Hello this is test message 1.',
        ]);

        ContactMessage::create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'phone' => null,
            'subject' => 'Test Subject 2',
            'message' => 'Hello this is test message 2.',
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/contact-messages');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.name', 'Jane Smith') // Ordered desc by default
            ->assertJsonPath('data.1.name', 'John Doe');
    }

    public function test_admin_can_delete_contact_message(): void
    {
        $message = ContactMessage::create([
            'name' => 'Delete Me',
            'email' => 'delete@example.com',
            'subject' => 'Please delete',
            'message' => 'This message should be deleted.',
        ]);

        $this->withHeader('Authorization', "Bearer {$this->token}")
            ->deleteJson("/api/v1/contact-messages/{$message->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('contact_messages', [
            'id' => $message->id,
        ]);
    }

    public function test_guests_cannot_access_contact_messages(): void
    {
        $this->getJson('/api/v1/contact-messages')
            ->assertStatus(401);
    }
}
