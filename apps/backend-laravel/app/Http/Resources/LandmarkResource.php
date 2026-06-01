<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LandmarkResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'city_id' => $this->city_id,
            'city' => $this->whenLoaded('city', function (): array {
                return [
                    'id' => $this->city->id,
                    'slug' => $this->city->slug,
                    'name' => $this->city->name,
                ];
            }),
            'external_id' => $this->external_id,
            'name' => $this->name,
            'name_en' => $this->name_en,
            'description' => $this->description,
            'description_en' => $this->description_en,
            'categories' => $this->categories ?? [],
            'category_names' => $this->category_names ?? [],
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'google_maps_url' => $this->google_maps_url,
            'images' => $this->images ?? [],
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
