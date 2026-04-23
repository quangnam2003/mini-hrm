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
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('module');       // Ví dụ: 'employee', 'permission'
            $table->string('action');       // Ví dụ: 'view', 'create', 'update', 'delete'
            $table->string('description')->nullable(); // Mô tả quyền
            $table->timestamps();

            // Mỗi cặp module + action là unique
            $table->unique(['module', 'action']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};
