<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('poin', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->enum('kategori', ['Ringan', 'Sedang', 'Berat']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('poin');
    }
};
