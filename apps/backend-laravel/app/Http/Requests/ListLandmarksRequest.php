<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ListLandmarksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $citySlug = $this->input('city_slug');
        $category = $this->input('category');
        $searchQuery = $this->input('q');

        $this->merge([
            'city_slug' => is_string($citySlug) ? strtolower(trim($citySlug)) : $citySlug,
            'category' => is_string($category) ? strtolower(trim($category)) : $category,
            'q' => is_string($searchQuery) ? trim($searchQuery) : $searchQuery,
        ]);
    }

    public function rules(): array
    {
        return [
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1'],
            'city_slug' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'q' => ['nullable', 'string', 'max:255'],
        ];
    }
}
