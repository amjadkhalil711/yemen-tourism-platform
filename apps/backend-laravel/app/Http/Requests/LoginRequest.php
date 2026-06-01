<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'login' => ['nullable', 'string', 'max:255', 'required_without:email'],
            'email' => ['nullable', 'email', 'required_without:login'],
            'password' => ['required', 'string', 'min:6'],
        ];
    }
}
