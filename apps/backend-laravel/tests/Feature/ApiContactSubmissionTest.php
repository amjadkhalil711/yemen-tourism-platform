<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiContactSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_message_can_be_submitted(): void
    {
        $response = $this->postJson('/api/v1/contact', [
            'name' => 'Visitor Name',
            'email' => 'visitor@example.com',
            'phone' => '+967734864275',
            'subject' => 'Partnership inquiry',
            'message' => 'I would like to discuss tourism platform collaboration.',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Message received successfully.')
            ->assertJsonPath('data.accepted', true)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => ['accepted'],
                'request_id',
            ]);

        $this->assertDatabaseHas('contact_messages', [
            'name' => 'Visitor Name',
            'email' => 'visitor@example.com',
            'phone' => '+967734864275',
            'subject' => 'Partnership inquiry',
            'message' => 'I would like to discuss tourism platform collaboration.',
        ]);
    }

    public function test_contact_submission_requires_valid_payload(): void
    {
        $this->postJson('/api/v1/contact', [
            'name' => 'A',
            'email' => 'invalid-email',
            'subject' => 'Hi',
            'message' => 'short',
        ])
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonStructure([
                'errors' => ['name', 'email', 'subject', 'message'],
            ]);
    }

    public function test_contact_submission_is_rate_limited(): void
    {
        $payload = [
            'name' => 'Visitor Name',
            'email' => 'rate-limit@example.com',
            'subject' => 'Rate limit test',
            'message' => 'This message body is long enough to pass validation.',
        ];

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/contact', $payload)->assertCreated();
        }

        $this->postJson('/api/v1/contact', $payload)
            ->assertStatus(429);
    }
}
