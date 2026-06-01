<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ListCitiesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $status = $this->input('status');
        $searchQuery = $this->input('q');

        if (is_string($status)) {
            $normalizedStatus = strtolower(trim($status));
            $this->merge([
                'status' => $normalizedStatus !== '' ? $normalizedStatus : null,
            ]);
        }

        if (is_string($searchQuery)) {
            $normalizedSearchQuery = trim($searchQuery);
            $this->merge([
                'q' => $normalizedSearchQuery !== '' ? $normalizedSearchQuery : null,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1'],
            'status' => ['nullable', 'string', 'in:draft,published'],
            'q' => ['nullable', 'string', 'max:255'],
        ];
    }
}
