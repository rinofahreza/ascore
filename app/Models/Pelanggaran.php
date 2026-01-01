<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pelanggaran extends Model
{
    use HasFactory;

    protected $table = 'pelanggaran';

    protected $fillable = [
        'kelas_id',
        'siswa_id',
        'poin_id',
        'periode_akademik_id',
        'user_id',
        'tanggal',
        'deskripsi',
        'tindak_lanjut',
        'konsekuensi',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];

    // Relationships
    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }

    public function poin()
    {
        return $this->belongsTo(Poin::class);
    }

    public function periodeAkademik()
    {
        return $this->belongsTo(PeriodeAkademik::class, 'periode_akademik_id');
    }

    public function guru()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
