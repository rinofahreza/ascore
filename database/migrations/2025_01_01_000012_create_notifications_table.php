<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Add user_id FK as seen in schema dump
            $table->string('type');
            $table->morphs('notifiable');
            $table->json('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            // Note: Schema dump has user_id, which suggests a modification to standard structure or specific app need
            // Key `notifications_user_id_read_at_index` (`user_id`,`read_at`),
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
