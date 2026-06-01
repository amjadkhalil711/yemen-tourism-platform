<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

final class CacheVersion
{
    /**
     * @param  array<int, string>  $keys
     */
    public static function bumpMany(array $keys): void
    {
        foreach ($keys as $key) {
            self::bump($key);
        }
    }

    public static function bump(string $key): int
    {
        $current = Cache::get($key);

        if (!is_numeric($current)) {
            // Database cache store cannot increment non-existent keys.
            Cache::forever($key, 1);
            $current = 1;
        }

        $incremented = Cache::increment($key);
        if ($incremented !== false) {
            return (int) $incremented;
        }

        // Fallback for stores/drivers that reject atomic increment in edge cases.
        $next = ((int) $current) + 1;
        Cache::forever($key, $next);

        return $next;
    }
}
