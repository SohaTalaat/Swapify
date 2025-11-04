<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ListingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $user1 = User::where('username', 'SohaAdmin')->first();
        $user2 = User::where('username', 'AbdelrahmanAdmin')->first();
        $category = Category::first();

        // Soha's listings
        Listing::create([
            'user_id' => $user1->id,
            'category_id' => $category->id,
            'title' => 'Used iPhone 12',
            'description' => 'Well-maintained iPhone 12, 128GB storage.',
            'type' => 'product',
            'condition' => 'used',
            'desired_in_return' => 'Android phone or smartwatch',
            'is_active' => true,
        ]);

        Listing::create([
            'user_id' => $user1->id,
            'category_id' => $category->id,
            'title' => 'Guitar Lessons',
            'description' => 'Beginner-friendly guitar lessons for adults.',
            'type' => 'service',
            'availability_info' => 'Evenings only',
            'desired_in_return' => 'Photography course',
            'is_active' => true,
        ]);

        // Abdelrahman's listings
        Listing::create([
            'user_id' => $user2->id,
            'category_id' => $category->id,
            'title' => 'Bluetooth Speaker',
            'description' => 'Portable JBL speaker with deep bass.',
            'type' => 'product',
            'condition' => 'like new',
            'desired_in_return' => 'Gaming headset or old phone',
            'is_active' => true,
        ]);

        Listing::create([
            'user_id' => $user2->id,
            'category_id' => $category->id,
            'title' => 'Web Design Service',
            'description' => 'Landing page design for small businesses.',
            'type' => 'service',
            'availability_info' => 'Flexible',
            'desired_in_return' => 'Marketing consultation',
            'is_active' => true,
        ]);
    }
}
