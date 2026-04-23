<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('rule_id')->nullable()->constrained('rule_work_settings');
            $table->foreignId('calendar_day_id')->nullable()->constrained('work_calendar_days');

            $table->date('work_date');
            $table->timestamp('check_in')->nullable();
            $table->timestamp('check_out')->nullable();

            $table->decimal('total_hours', 5, 2)->default(0);
            $table->integer('late_minutes')->default(0);
            $table->integer('early_leave_minutes')->default(0);
            $table->decimal('ot_hours', 5, 2)->default(0);

            $table->enum('status', ['on_time', 'late', 'early_leave', 'absent', 'leave', 'holiday'])->default('absent');
            $table->boolean('is_completed')->default(false);
            $table->boolean('is_edited')->default(false);

            $table->foreignId('process_by')->nullable()->constrained('users');
            $table->timestamp('process_at')->nullable();

            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'work_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
