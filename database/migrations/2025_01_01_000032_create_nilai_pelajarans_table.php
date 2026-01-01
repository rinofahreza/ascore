<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('nilai_pelajarans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('item_penilaian_id')->constrained('item_penilaian')->onDelete('cascade');
            $table->decimal('nilai', 5, 2);
            $table->foreignId('kelas_id')->constrained('kelas')->onDelete('cascade');
            $table->foreignId('mata_pelajaran_id')->constrained('mata_pelajarans')->onDelete('cascade');
            $table->foreignId('periode_akademik_id')->constrained('periode_akademiks')->onDelete('cascade');
            $table->foreignId('semester_akademik_id')->nullable()->constrained('semester_akademik')->onDelete('set null');
            $table->timestamps();

            $table->unique(['siswa_id', 'item_penilaian_id']);
            $table->index(['kelas_id', 'mata_pelajaran_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nilai_pelajarans');
    }
};
