<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Landmark;
use Illuminate\Database\Seeder;
use RuntimeException;

class LandmarkSeeder extends Seeder
{
    public function run(): void
    {
        $rows = $this->loadJson('landmarks.seed.json');
        $cityIdBySlug = City::query()->pluck('id', 'slug')->all();

        foreach ($rows as $row) {
            $citySlug = (string) ($row['city_slug'] ?? '');
            $cityId = $cityIdBySlug[$citySlug] ?? null;
            if (!$cityId) {
                continue;
            }

            $externalId = (string) ($row['external_id'] ?? '');
            $name = (string) ($row['name'] ?? '');

            // Legacy data may repeat external_id across cities (and rarely within same city).
            // Keep city + external_id + name as the stable identity to preserve all legacy rows.
            $lookup = $externalId !== ''
                ? ['city_id' => $cityId, 'external_id' => $externalId, 'name' => $name]
                : ['city_id' => $cityId, 'name' => $name];

            Landmark::query()->updateOrCreate(
                $lookup,
                [
                    'city_id' => $cityId,
                    'external_id' => $externalId !== '' ? $externalId : null,
                    'name' => $name,
                    'description' => $row['description'] ?? null,
                    'categories' => is_array($row['categories'] ?? null) ? $row['categories'] : [],
                    'category_names' => is_array($row['category_names'] ?? null) ? $row['category_names'] : [],
                    'latitude' => $row['latitude'] ?? null,
                    'longitude' => $row['longitude'] ?? null,
                    'google_maps_url' => $row['google_maps_url'] ?? null,
                    'images' => is_array($row['images'] ?? null) ? $row['images'] : [],
                    'sort_order' => (int) ($row['sort_order'] ?? 999),
                    'is_active' => (bool) ($row['is_active'] ?? true),
                ]
            );
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function loadJson(string $fileName): array
    {
        $paths = [
            database_path("seed-data/{$fileName}"),
            base_path("modernization/seeds/{$fileName}"),
            base_path("../modernization/seeds/{$fileName}"),
            base_path("../../modernization/seeds/{$fileName}"),
        ];

        foreach ($paths as $path) {
            if (is_file($path)) {
                $decoded = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
                if (is_array($decoded)) {
                    return $decoded;
                }
            }
        }

        throw new RuntimeException("Seed file not found: {$fileName}");
    }
}
