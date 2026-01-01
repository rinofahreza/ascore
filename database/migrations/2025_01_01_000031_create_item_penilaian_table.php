<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('item_penilaian', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cabang_id')->constrained('cabangs')->onDelete('cascade');
            $table->foreignId('departemen_id')->constrained('departemens')->onDelete('cascade');
            $table->foreignId('kelas_id')->constrained('kelas')->onDelete('cascade');
            $table->foreignId('mata_pelajaran_id')->constrained('mata_pelajarans')->onDelete('cascade');
            $table->foreignId('periode_akademik_id')->constrained('periode_akademiks')->onDelete('cascade');
            $table->foreignId('semester_akademik_id')->nullable()->constrained('semester_akademik')->onDelete('set null');
            $table->string('nama');
            $table->enum('jenis', ['Formatif', 'Sumatif']);
            $table->text('keterangan')->nullable();
            $table->date('tanggal_penilaian')->nullable();
            $table->timestamps();

            $table->index(['kelas_id', 'mata_pelajaran_id']);
            $table->index('tanggal_penilaian');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_penilaian');
    }
};
