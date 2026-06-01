<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLandmarkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'city_id'        => ['sometimes', 'required', 'integer', 'exists:cities,id'],
            'external_id'    => ['nullable', 'string', 'max:255'],
            'name'           => ['sometimes', 'required', 'string', 'max:255'],
            'name_en'        => ['nullable', 'string', 'max:255'],
            'description'    => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'categories'     => ['nullable', 'array'],
            'categories.*'   => ['string', 'max:100'],
            'category_names'   => ['nullable', 'array'],
            'category_names.*' => ['string', 'max:100'],
            'latitude'       => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'      => ['nullable', 'numeric', 'between:-180,180'],
            'google_maps_url' => ['nullable', 'url:http,https', 'max:2048'],
            'images'         => ['nullable', 'array'],
            'images.*'       => ['string', 'max:2048'],
            'sort_order'     => ['nullable', 'integer', 'min:1'],
            'is_active'      => ['nullable', 'boolean'],
        ];
    }
}
