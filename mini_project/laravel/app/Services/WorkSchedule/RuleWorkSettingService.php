<?php

namespace App\Services\WorkSchedule;

use App\Interfaces\WorkSchedule\RuleWorkSettingRepositoryInterface;
use Illuminate\Support\Facades\Validator;

class RuleWorkSettingService
{
    protected $repository;

    public function __construct(RuleWorkSettingRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    public function getAll()
    {
        return $this->repository->getAll();
    }

    public function store(array $data)
    {
        if (isset($data['setting'])) {
            $data['setting'] = $this->preprocessSetting($data['setting']);
            $this->validateSetting($data['setting']);
        }
        return $this->repository->create($data);
    }

    public function update($id, array $data)
    {
        if (isset($data['setting'])) {
            $data['setting'] = $this->preprocessSetting($data['setting']);
            $this->validateSetting($data['setting']);
        }
        return $this->repository->update($id, $data);
    }

    public function delete($id)
    {
        return $this->repository->delete($id);
    }

    public function setActive($id)
    {
        return $this->repository->setActive($id);
    }

    protected function validateSetting(array $setting)
    {
        $rules = [
            'shifts' => 'required|array',
            'shifts.*.work_start' => 'required|date_format:H:i',
            'shifts.*.work_end' => 'required|date_format:H:i',
            'shifts.*.break_start' => 'required|date_format:H:i',
            'shifts.*.break_end' => 'required|date_format:H:i',
            'saturday_config' => 'required|array',
            'saturday_config.type' => 'required|in:bi_weekly,every_week,none',
            'saturday_config.reference_date' => 'required_if:saturday_config.type,bi_weekly|date',
        ];

        $messages = [
            'required' => 'Trường :attribute là bắt buộc.',
            'date_format' => 'Trường :attribute không đúng định dạng giờ (:format).',
            'in' => 'Giá trị của trường :attribute không hợp lệ.',
            'date' => 'Trường :attribute phải là một ngày hợp lệ.',
            'required_if' => 'Trường :attribute là bắt buộc khi chọn làm việc cách tuần.',
        ];

        $validator = Validator::make($setting, $rules, $messages);

        if ($validator->fails()) {
            throw new \Exception("Cấu hình Setting không hợp lệ: " . implode(", ", $validator->errors()->all()));
        }

        if (isset($setting['saturday_config']['reference_date'])) {
            $date = date('N', strtotime($setting['saturday_config']['reference_date']));
            if ($date != 6) {
                throw new \Exception("Ngày mốc phải là một ngày Thứ 7.");
            }
        }
    }


    protected function preprocessSetting(array $setting)
    {
        if (isset($setting['shifts']) && is_array($setting['shifts'])) {
            foreach ($setting['shifts'] as $key => $shift) {
                if (isset($shift['break_start'])) {
                    $setting['shifts'][$key]['half_day_split'] = $shift['break_end'];
                }
            }
        }
        return $setting;
    }
}
