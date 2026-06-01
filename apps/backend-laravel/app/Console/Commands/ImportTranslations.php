<?php

namespace App\Console\Commands;

use App\Models\City;
use App\Models\Landmark;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ImportTranslations extends Command
{
    protected $signature = 'app:import-translations {--file=translations_export.json}';
    protected $description = 'Import English translations for cities and landmarks from a JSON file';

    public function handle()
    {
        $file = $this->option('file');
        $path = database_path("seed-data/{$file}");

        if (!File::exists($path)) {
            $this->error("File not found: {$path}");
            return;
        }

        $data = json_decode(File::get($path), true);

        if (isset($data['cities'])) {
            foreach ($data['cities'] as $cityData) {
                if (!empty($cityData['name_en'])) {
                    City::where('id', $cityData['id'])->update([
                        'name_en' => $cityData['name_en'],
                        'description_en' => $cityData['description_en'] ?? null,
                    ]);
                }
            }
            $this->info("Cities translated successfully.");
        }

        if (isset($data['landmarks'])) {
            foreach ($data['landmarks'] as $lmData) {
                if (!empty($lmData['name_en'])) {
                    Landmark::where('id', $lmData['id'])->update([
                        'name_en' => $lmData['name_en'],
                        'description_en' => $lmData['description_en'] ?? null,
                    ]);
                }
            }
            $this->info("Landmarks translated successfully.");
        }
        
        $this->info("Import completed!");
    }
}
