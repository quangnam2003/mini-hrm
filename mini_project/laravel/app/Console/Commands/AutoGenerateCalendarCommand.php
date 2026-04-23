<?php

namespace App\Console\Commands;

use App\Services\WorkSchedule\CalendarService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:auto-generate-calendar')]
#[Description('Tự động sinh lịch làm việc nếu sắp hết lịch trong DB')]
class AutoGenerateCalendarCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(CalendarService $calendarService)
    {
        $this->info('Đang kiểm tra lịch làm việc...');
        try {
            $result = $calendarService->autoScheduleIfNeeded();
            if ($result) {
                $this->info('Đã tự động sinh thêm lịch làm việc mới.');
            } else {
                $this->info('Lịch làm việc vẫn còn đủ, không cần sinh thêm.');
            }
        } catch (\Exception $e) {
            $this->error('Lỗi khi tự động sinh lịch: ' . $e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
