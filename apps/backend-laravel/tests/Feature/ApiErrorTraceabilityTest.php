<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiErrorTraceabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_reuses_valid_request_id_header_when_provided(): void
    {
        $incomingRequestId = 'frontend-req-123.abc_DEF';

        $response = $this->withHeaders([
            'X-Request-Id' => $incomingRequestId,
        ])->getJson('/api/v1/cities');

        $response->assertOk();
        $response->assertHeader('X-Request-Id', $incomingRequestId);
        $response->assertJsonPath('request_id', $incomingRequestId);
    }

    public function test_api_replaces_invalid_request_id_header_with_server_generated_value(): void
    {
        $incomingRequestId = 'invalid request id with spaces';

        $response = $this->withHeaders([
            'X-Request-Id' => $incomingRequestId,
        ])->getJson('/api/v1/cities');

        $response->assertOk();

        $payloadRequestId = (string) $response->json('request_id');
        $headerRequestId = (string) $response->headers->get('X-Request-Id');

        $this->assertNotSame($incomingRequestId, $payloadRequestId);
        $this->assertNotSame($incomingRequestId, $headerRequestId);
        $this->assertMatchesRegularExpression('/^[A-Za-z0-9._:-]{1,96}$/', $payloadRequestId);
        $this->assertSame($payloadRequestId, $headerRequestId);
    }

    public function test_api_success_payload_includes_request_id_and_response_header(): void
    {
        $response = $this->getJson('/api/v1/cities');

        $response
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'message',
                'data',
                'request_id',
            ]);

        $payloadRequestId = (string) $response->json('request_id');
        $headerRequestId = (string) $response->headers->get('X-Request-Id');

        $this->assertNotEmpty($payloadRequestId);
        $this->assertNotEmpty($headerRequestId);
        $this->assertSame($headerRequestId, $payloadRequestId);
    }

    public function test_api_error_payload_includes_request_id_and_response_header(): void
    {
        $response = $this->getJson('/api/v1/cities/non-existent-city-slug');

        $response
            ->assertStatus(404)
            ->assertJsonPath('status', 'error')
            ->assertJsonStructure([
                'status',
                'message',
                'errors',
                'request_id',
            ]);

        $this->assertIsString((string) $response->json('message'));
        $this->assertNotEmpty((string) $response->json('message'));
        $this->assertIsString((string) $response->json('request_id'));
        $this->assertNotEmpty((string) $response->json('request_id'));
        $this->assertTrue($response->headers->has('X-Request-Id'));
    }

    public function test_api_responses_include_security_headers(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertOk();
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('Referrer-Policy', 'no-referrer');
        $response->assertHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
        $response->assertHeader(
            'Content-Security-Policy',
            "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
        );
    }
}
