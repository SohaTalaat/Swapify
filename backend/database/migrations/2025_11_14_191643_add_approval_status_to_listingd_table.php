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
        Schema::table('listings', function (Blueprint $table) {
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])
                ->default('pending')
                ->after('is_active');
            $table->text('rejection_reason')->nullable()->after('approval_status');
            $table->foreignId('reviewed_by_admin_id')
                ->nullable()
                ->after('rejection_reason')
                ->constrained('users')
                ->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by_admin_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by_admin_id']);
            $table->dropColumn([
                'approval_status',
                'rejection_reason',
                'reviewed_by_admin_id',
                'reviewed_at'
            ]);
        });
    }
};
