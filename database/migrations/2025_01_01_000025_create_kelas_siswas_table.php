<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('kelas_siswas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('periode_akademik_id')->constrained('periode_akademiks')->onDelete('cascade');
            $table->foreignId('kelas_id')->constrained('kelas')->onDelete('cascade');
            $table->foreignId('siswa_id')->constrained('users')->onDelete('cascade'); // Points to users(id) in schema
            $table->foreignId('cabang_id')->nullable()->constrained('cabangs')->onDelete('set null');
            $table->foreignId('departemen_id')->nullable()->constrained('departemens')->onDelete('set null');
            $table->timestamps();

            $table->unique(['siswa_id', 'periode_akademik_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kelas_siswas');
    }
};
