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
            $table->index('id_document_public_id');
            $table->index('selfie_public_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('id_verifications', function (Blueprint $table) {
            $table->dropIndex(['id_document_public_id']);
            $table->dropIndex(['selfie_public_id']);
        });
    }
};
