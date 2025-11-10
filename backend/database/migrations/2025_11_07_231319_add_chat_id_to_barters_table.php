<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
        public function up()
        {
            Schema::table('barters', function (Blueprint $table) {
                $table->foreignId('chat_id')->nullable()->after('status')->constrained()->onDelete('cascade');
            });
        }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('barters', function (Blueprint $table) {
            //
        });
    }
};
