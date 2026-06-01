<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => is_string($this->input('name')) ? trim((string) $this->input('name')) : $this->input('name'),
            'email' => is_string($this->input('email')) ? strtolower(trim((string) $this->input('email'))) : $this->input('email'),
            'phone' => is_string($this->input('phone')) ? trim((string) $this->input('phone')) : $this->input('phone'),
            'subject' => is_string($this->input('subject')) ? trim((string) $this->input('subject')) : $this->input('subject'),
            'message' => is_string($this->input('message')) ? trim((string) $this->input('message')) : $this->input('message'),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email', 'max:180'],
            'phone' => ['nullable', 'string', 'min:7', 'max:40'],
            'subject' => ['required', 'string', 'min:3', 'max:160'],
            'message' => ['required', 'string', 'min:10', 'max:1200'],
        ];
    }
}
