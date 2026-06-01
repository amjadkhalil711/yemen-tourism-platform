<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;
use RuntimeException;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $rows = $this->loadJson('cities.seed.json');

        foreach ($rows as $row) {
            City::query()->updateOrCreate(
                ['slug' => (string) ($row['slug'] ?? '')],
                [
                    'name' => (string) ($row['name'] ?? ''),
                    'description' => $row['description'] ?? null,
                    'status' => (string) ($row['status'] ?? 'published'),
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
