<?php

namespace App\Http\Requests\LeaveRequest;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreLeaveTypeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string',
            'is_paid' => [
                'required',
                'boolean',
                // function ($attribute, $value, $fail) {
                //     if ($value == false) {
                //         $exists = \App\Models\LeaveType::where('is_paid', false)->exists();
                //         if ($exists) {
                //             $fail('Hệ thống chỉ cho phép có duy nhất một loại nghỉ không lương.');
                //         }
                //     }
                // },
            ],
            'default_days' => 'required|numeric',
            'allow_half_day' => 'boolean',
            'allow_hourly' => [
                'boolean',
                function ($attribute, $value, $fail) {
                    if ($this->input('is_paid') && $value) {
                        $fail('Loại nghỉ phép có lương không được phép chọn nghỉ theo giờ.');
                    }
                },
            ],
            'is_active' => 'required|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            "name.required" => "Yêu cầu nhập tên",
            "is_paid.required" => "Yêu cầu nhập trạng thái",
            "default_days.required" => "Yêu cầu nhập số ngày",
            "is_active.required" => "Yêu cầu nhập trạng thái",
        ];
    }
}
