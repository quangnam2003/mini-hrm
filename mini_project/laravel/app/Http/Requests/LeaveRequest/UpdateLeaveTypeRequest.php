<?php

namespace App\Http\Requests\LeaveRequest;

use App\Models\LeaveType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateLeaveTypeRequest extends FormRequest
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
            'name' => 'sometimes|string',
            'is_paid' => [
                'sometimes',
                'boolean',
                // function ($attribute, $value, $fail) {
                //     if ($value == false) {
                //         $leaveTypeId = $this->route('leave_type');
                //         $exists = LeaveType::where('is_paid', false)
                //             ->where('id', '!=', $leaveTypeId)
                //             ->exists();
                //         if ($exists) {
                //             $fail('Hệ thống chỉ cho phép có duy nhất một loại nghỉ không lương.');
                //         }
                //     }
                // },
            ],
            'default_days' => 'sometimes|numeric',
            'allow_half_day' => 'sometimes|boolean',
            'allow_hourly' => [
                'sometimes',
                'boolean',
                function ($attribute, $value, $fail) {
                    if ($value) {
                        $isPaid = $this->has('is_paid') ? $this->input('is_paid') : LeaveType::find($this->route('id'))?->is_paid;
                        if ($isPaid) {
                            $fail('Loại nghỉ phép có lương không được phép chọn nghỉ theo giờ.');
                        }
                    }
                },
            ],
            'is_active' => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            "name.sometimes" => "Không được để trống tên",
            "is_paid.sometimes" => "Không được để trống trạng thái",
            "default_days.sometimes" => "Không được để trống số ngày",
            "is_active.sometimes" => "Không được để trống trạng thái",
        ];
    }
}
