<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Seed initial system users.
     */
    public function run(): void
    {
        // 1. Admin User
        $admin = User::updateOrCreate(
            ['email' => 'admin@strangedev.com'],
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
        $adminRole = Role::where('name', 'Admin')->first();
        $superAdminRole = Role::where('name', 'Super Admin')->first();
        if ($adminRole) {
            $admin->assignRole($adminRole);
        }
        if ($superAdminRole) {
            $admin->assignRole($superAdminRole);
        }

        // 2. Instructor User
        $instructor = User::updateOrCreate(
            ['email' => 'instructor@strangedev.com'],
            [
                'first_name' => 'Lead',
                'last_name' => 'Instructor',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
        $instructorRole = Role::where('name', 'Instructor')->first();
        if ($instructorRole) {
            $instructor->assignRole($instructorRole);
        }

        // 3. Student User
        $student = User::updateOrCreate(
            ['email' => 'student@strangedev.com'],
            [
                'first_name' => 'Student',
                'last_name' => 'Learner',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
        $studentRole = Role::where('name', 'Student')->first();
        if ($studentRole) {
            $student->assignRole($studentRole);
        }
    }
}
