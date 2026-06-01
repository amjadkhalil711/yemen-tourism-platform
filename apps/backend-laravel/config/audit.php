<?php

return [
    'admin_write' => [
        // Keep enabled by default for production traceability.
        'enabled' => (bool) env('AUDIT_ADMIN_WRITE_ENABLED', true),
        // Optional PSR logger channel, falls back to default log channel when blank.
        'channel' => env('AUDIT_ADMIN_WRITE_CHANNEL', ''),
    ],
];
