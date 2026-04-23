<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'phone'    => 'nullable|string|regex:/^[0-9]{10,11}$/',
            'address'  => 'nullable|string|max:500',
            'role'     => 'nullable|in:admin,employee',
            'avatar'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'     => 'Tên nhân viên không được để trống.',
            'email.required'    => 'Email không được để trống.',
            'email.unique'      => 'Email này đã được sử dụng.',
            'password.required' => 'Mật khẩu không được để trống.',
            'password.min'      => 'Mật khẩu phải có ít nhất 6 ký tự.',
            'phone.regex'       => 'Số điện thoại không hợp lệ (10-11 chữ số).',
            'role.in'           => 'Role phải là admin hoặc employee.',
        ];
    }
}
