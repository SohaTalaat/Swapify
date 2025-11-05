<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CreateAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admins = [
            [
                'username' => 'SohaAdmin',
                'email' => 'sohaadmin@swapify.local',
                'full_name' => 'Soha Talaat',
            ],
            [
                'username' => 'AbdelrahmanAdmin',
                'email' => 'abdelrahmanadmin@swapify.local',
                'full_name' => 'Abdelrahman Ramadan',
            ],
            [
                'username' => 'SarahAdmin',
                'email' => 'sarahadmin@swapify.local',
                'full_name' => 'Sarah Mahmoud',
            ],
            [
                'username' => 'AbanoubAdmin',
                'email' => 'abanoubadmin@swapify.local',
                'full_name' => 'Abanoub Yousry'
            ]
        ];

        foreach ($admins as $adminData) {
            if (!User::where('email', $adminData['email'])->exists()) {
                User::create([
                    'username' => $adminData['username'],
                    'email' => $adminData['email'],
                    'password' => Hash::make('123&Swapify'),
                    'full_name' => $adminData['full_name'],
                    'role' => 'admin',
                    'email_verified_at' => now(),
                    'is_id_verified' => true,
                ]);
                $this->command->info("Admin created: {$adminData['email']}");
            } else {
                $this->command->warn("Admin already exists: {$adminData['email']}");
            }
        }
    }
}
