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
        Schema::create('work_calendar_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_month_id')->constrained('work_months')->onDelete('cascade');
            $table->date('work_date');
            $table->enum('day_type', ['workday', 'weekend', 'holiday', 'company_off'])->default('workday');
            $table->string('holiday_name')->nullable();
            $table->string('note')->nullable();
            $table->timestamps();

            $table->unique('work_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_calendar_days');
    }
};
