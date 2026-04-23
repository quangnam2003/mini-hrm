<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Thứ tự quan trọng: permissions trước, users sau
        $this->call([
            PermissionSeeder::class,
            UserSeeder::class,
        ]);
    }
}
