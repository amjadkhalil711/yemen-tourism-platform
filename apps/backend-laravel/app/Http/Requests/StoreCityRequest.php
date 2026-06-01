<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'           => ['required', 'string', 'max:255'],
            'name_en'        => ['nullable', 'string', 'max:255'],
            'slug'           => ['required', 'string', 'max:255', 'alpha_dash', 'unique:cities,slug'],
            'description'    => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'image_url'      => ['nullable', 'url:http,https', 'max:2048'],
            'status'         => ['required', 'in:draft,published'],
            'category'       => ['nullable', 'string', 'max:255'],
        ];
    }
}
