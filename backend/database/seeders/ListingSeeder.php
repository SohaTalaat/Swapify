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
        $user = User::first();
        $categories = Category::pluck('id')->toArray();

        foreach (range(1, 10) as $i) {
            Listing::create([
                'user_id' => $user->id,
                'category_id' => $categories[array_rand($categories)],
                'title' => fake()->sentence(3),
                'description' => fake()->paragraph(),
                'type' => fake()->randomElement(['product', 'service']),
                'condition' => fake()->randomElement(['new', 'used']),
                'availability_info' => fake()->optional()->sentence(),
                'desired_in_return' => fake()->sentence(),
                'is_active' => true,
            ]);
        }
    }
}
