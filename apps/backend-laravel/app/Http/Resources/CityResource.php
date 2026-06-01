<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CityResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'name_en' => $this->name_en,
            'description' => $this->description,
            'description_en' => $this->description_en,
            'image_url' => $this->image_url,
            'status' => $this->status,
            'category' => $this->category,
            'landmarks_count' => $this->whenCounted('landmarks'),
            'landmarks' => LandmarkResource::collection($this->whenLoaded('landmarks')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
