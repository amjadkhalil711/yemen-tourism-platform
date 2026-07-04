<?php

namespace App\Services;

use App\Models\ContactMessage;
use Illuminate\Support\Facades\Log;

class ContactService
{
    /**
     * @param  array{name:string,email:string,phone?:string|null,subject:string,message:string}  $payload
     */
    public function submit(array $payload, string $requestId): void
    {
        Log::info('Contact message submitted', [
            'request_id' => $requestId !== '' ? $requestId : null,
            'name' => $payload['name'],
            'email_hash' => hash('sha256', strtolower((string) $payload['email'])),
            'has_phone' => !empty($payload['phone']),
            'subject' => $payload['subject'],
            'message_length' => mb_strlen((string) $payload['message']),
        ]);

        ContactMessage::create([
            'name' => $payload['name'],
            'email' => $payload['email'],
            'phone' => $payload['phone'] ?? null,
            'subject' => $payload['subject'],
            'message' => $payload['message'],
        ]);
    }
}
