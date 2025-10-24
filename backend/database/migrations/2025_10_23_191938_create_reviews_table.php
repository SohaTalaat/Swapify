<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;


return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barter_id')->constrained()->onDelete('cascade');
            $table->foreignId('reviewer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('reviewee_id')->constrained('users')->onDelete('cascade');
            $table->integer('rating')->unsigned(); // 1-5
            $table->integer('communication_rating')->unsigned()->nullable();
            $table->integer('item_condition_rating')->unsigned()->nullable();
            $table->integer('timeliness_rating')->unsigned()->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();

            // Prevent duplicate reviews
            $table->unique(['barter_id', 'reviewer_id']);
        });
        DB::statement('ALTER TABLE reviews ADD CONSTRAINT check_reviewer_not_reviewee CHECK (reviewer_id != reviewee_id)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
