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
        Schema::create('disputes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barter_id')->constrained()->onDelete('cascade')->unique();
            $table->foreignId('initiator_id')->constrained('users')->onDelete('cascade');
            $table->string('reason'); // e.g., 'item_not_as_described'
            $table->text('description');
            $table->enum('status', ['open', 'under_review', 'resolved', 'appealed'])->default('open');
            $table->foreignId('resolved_by_admin_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('resolution_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disputes');
    }
};
