<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization logic can be added here or in middleware
    }

    public function rules(): array
    {
        return [
            'check_in'  => 'nullable|date',
            'check_out' => 'nullable|date|after:check_in',
            'note'      => 'nullable|string|max:500',
        ];
    }

    public function messages()
    {
        return [
            'check_out.after' => 'Giờ check-out phải sau giờ check-in.',
        ];
    }
}
