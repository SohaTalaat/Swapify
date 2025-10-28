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
        Schema::table('users', function (Blueprint $table) {
            $table->string('verification_token')->nullable()->unique()->after('email_verified_at');
            $table->string('password_reset_token')->nullable()->unique()->after('verification_token');
            $table->timestamp('password_reset_expires_at')->nullable()->after('password_reset_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'email_verified_at',
                'verification_token',
                'password_reset_token',
                'password_reset_expires_at'
            ]);
        });
    }
};
