<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up()
{
    Schema::table('barters', function (Blueprint $table) {
        $table->timestamp('cancelled_at')->nullable()->after('completed_at');
        $table->unsignedBigInteger('cancelled_by')->nullable()->after('cancelled_at');
        $table->text('cancel_reason')->nullable()->after('cancelled_by');

        // في حال أردت علاقة مع المستخدم
        $table->foreign('cancelled_by')->references('id')->on('users')->onDelete('set null');
    });
}

public function down()
{
    Schema::table('barters', function (Blueprint $table) {
        $table->dropForeign(['cancelled_by']);
        $table->dropColumn(['cancelled_at', 'cancelled_by', 'cancel_reason']);
    });
}

};
