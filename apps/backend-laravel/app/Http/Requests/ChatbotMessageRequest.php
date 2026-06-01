<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChatbotMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message'            => ['required', 'string', 'min:1', 'max:500'],
            'user_id'            => ['nullable', 'integer', 'min:1'],
            'page_context'       => ['nullable', 'string', 'max:200'],
            'history'            => ['nullable', 'array', 'max:20'],
            'history.*.role'     => ['required_with:history', 'string', 'in:user,ai'],
            'history.*.text'     => ['required_with:history', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'message.required' => 'Message is required.',
            'message.max'      => 'Message must not exceed 500 characters.',
        ];
    }

    /**
     * Sanitize the message before validation to prevent injection.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('message')) {
            $this->merge([
                'message' => strip_tags((string) $this->input('message')),
            ]);
        }
    }
}
