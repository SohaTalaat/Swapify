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
        Schema::table('id_verifications', function (Blueprint $table) {
            $table->string('id_document_public_id')->nullable();
            $table->string('selfie_public_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('id_verifications', function (Blueprint $table) {
            $table->dropColumn(['id_document_public_id', 'selfie_public_id']);
        });
    }
};
