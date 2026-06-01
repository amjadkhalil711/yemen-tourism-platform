<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $cityId = $this->route('city')?->id;

        return [
            'name'           => ['sometimes', 'required', 'string', 'max:255'],
            'name_en'        => ['nullable', 'string', 'max:255'],
            'slug'           => [
                'sometimes',
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('cities', 'slug')->ignore($cityId),
            ],
            'description'    => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'image_url'      => ['nullable', 'url:http,https', 'max:2048'],
            'status'         => ['sometimes', 'required', 'in:draft,published'],
            'category'       => ['nullable', 'string', 'max:255'],
        ];
    }
}
