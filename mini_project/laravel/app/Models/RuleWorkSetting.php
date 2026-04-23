<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class RuleWorkSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'setting',
        'is_active',
        'apply_from',
        'apply_to',
    ];

    protected $casts = [
        'setting' => 'array',
        'is_active' => 'boolean',
        'apply_from' => 'date',
        'apply_to' => 'date',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function isWorkingDay(Carbon $date)
    {
        $dayOfWeek = $date->dayOfWeek;

        if ($dayOfWeek === Carbon::SUNDAY) {
            return false;
        }

        if ($dayOfWeek === Carbon::SATURDAY) {
            if (!isset($this->setting['saturday_config'])) {
                return false; // Default Saturday off if no config
            }

            $config = $this->setting['saturday_config'];
            $type = $config['type'] ?? 'none';

            if ($type === 'all') return true;
            if ($type === 'none') return false;

            if ($type === 'bi_weekly') {
                $refDate = Carbon::parse($config['reference_date'])->startOfDay();
                $targetDate = $date->copy()->startOfDay();

                $diffInDays = $refDate->diffInDays($targetDate);
                $diffInWeeks = (int) floor($diffInDays / 7);

                $isRefWork = ($config['reference_type'] ?? 'on') === 'on';

                if ($diffInWeeks % 2 === 0) {
                    return $isRefWork;
                } else {
                    return !$isRefWork;
                }
            }
        }

        return true;
    }
}
