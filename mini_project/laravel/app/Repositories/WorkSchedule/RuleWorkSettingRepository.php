<?php

namespace App\Repositories\WorkSchedule;

use App\Interfaces\WorkSchedule\RuleWorkSettingRepositoryInterface;
use App\Models\RuleWorkSetting;
use Illuminate\Support\Facades\DB;

class RuleWorkSettingRepository implements RuleWorkSettingRepositoryInterface
{
    public function getAll()
    {
        return RuleWorkSetting::latest()->get();
    }

    public function findById($id)
    {
        return RuleWorkSetting::findOrFail($id);
    }

    public function create(array $data)
    {
        return RuleWorkSetting::create($data);
    }

    public function update($id, array $data)
    {
        $rule = $this->findById($id);
        $rule->update($data);
        return $rule;
    }

    public function delete($id)
    {
        $rule = $this->findById($id);
        return $rule->delete();
    }

    public function setActive($id)
    {
        return DB::transaction(function () use ($id) {
            RuleWorkSetting::where('is_active', true)->update(['is_active' => false]);
            $rule = $this->findById($id);
            $rule->update(['is_active' => true]);

            return $rule;
        });
    }

    public function getActiveRule()
    {
        return RuleWorkSetting::where('is_active', true)->first();
    }
}
