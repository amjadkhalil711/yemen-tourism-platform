<?php

namespace App\Console\Commands;

use App\Models\City;
use App\Models\Landmark;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ExportTranslations extends Command
{
    protected $signature = 'app:export-translations {--file=translations_export.json}';
    protected $description = 'Export cities and landmarks missing English translations to a JSON file';

    public function handle()
    {
        $file = $this->option('file');
        $path = database_path("seed-data/{$file}");

        $export = [
            'cities' => City::all()->map(function ($city) {
                return [
                    'id' => $city->id,
                    'name_ar' => $city->name,
                    'name_en' => $city->name_en ?? '',
                    'description_ar' => $city->description,
                    'description_en' => $city->description_en ?? '',
                ];
            }),
            'landmarks' => Landmark::all()->map(function ($lm) {
                return [
                    'id' => $lm->id,
                    'name_ar' => $lm->name,
                    'name_en' => $lm->name_en ?? '',
                    'description_ar' => $lm->description,
                    'description_en' => $lm->description_en ?? '',
                    'category_names_ar' => $lm->category_names,
                ];
            })
        ];

        File::put($path, json_encode($export, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        $this->info("Exported successfully to: {$path}");
        $this->info("Translate the 'name_en' and 'description_en' empty fields and re-import using app:import-translations");
    }
}
