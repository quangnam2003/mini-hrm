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
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('leave_type_id')->constrained()->onDelete('cascade');
            $table->enum('request_scope', ['full_day', 'half_day', 'hourly']);
            $table->enum('half_day_period', ['morning', 'afternoon'])->nullable();
            $table->timestamp('start_time');
            $table->timestamp('end_time');
            $table->decimal('total_amount', 8, 2);
            $table->enum('amount_unit', ['days', 'hours']);
            $table->string('attachment')->nullable();
            $table->string('reason');
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            $table->string('approver_note')->nullable();
            $table->foreignId('process_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('process_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
    }
};
