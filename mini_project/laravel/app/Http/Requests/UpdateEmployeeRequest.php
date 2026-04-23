<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('id');

        return [
            'name'     => 'sometimes|string|max:255',
            'email'    => "sometimes|email|unique:users,email,{$userId}",
            'password' => 'sometimes|nullable|string|min:8',
            'phone'    => 'sometimes|nullable|string|regex:/^[0-9]{10,11}$/',
            'address'  => 'sometimes|nullable|string|max:500',
            'role'     => 'sometimes|in:admin,employee',
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique'  => 'Email này đã được sử dụng.',
            'password.min'  => 'Mật khẩu phải có ít nhất 8 ký tự.',
            'phone.regex'   => 'Số điện thoại không hợp lệ (10-11 chữ số).',
            'role.in'       => 'Role phải là admin hoặc employee.',
        ];
    }
}
