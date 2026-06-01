<?php

namespace App\Support;

final class PaginationEnvelope
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public static function extractExtra(array $payload): array
    {
        $extra = [];

        foreach ([
            'links',
            'meta',
            'current_page',
            'last_page',
            'per_page',
            'total',
            'from',
            'to',
            'path',
            'first_page_url',
            'last_page_url',
            'next_page_url',
            'prev_page_url',
        ] as $key) {
            if (array_key_exists($key, $payload)) {
                $extra[$key] = $payload[$key];
            }
        }

        return $extra;
    }
}
