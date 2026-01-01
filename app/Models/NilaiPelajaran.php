<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NilaiPelajaran extends Model
{
    use HasFactory;

    protected $fillable = [
        'siswa_id',
        'item_penilaian_id',
        'nilai',
        'kelas_id',
        'mata_pelajaran_id',
        'periode_akademik_id',
        'semester_akademik_id',
    ];

    protected $casts = [
        'nilai' => 'decimal:2',
    ];

    // Relationships
    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }

    public function itemPenilaian()
    {
        return $this->belongsTo(ItemPenilaian::class);
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    public function mataPelajaran()
    {
        return $this->belongsTo(MataPelajaran::class);
    }

    public function periodeAkademik()
    {
        return $this->belongsTo(PeriodeAkademik::class);
    }

    public function semesterAkademik()
    {
        return $this->belongsTo(SemesterAkademik::class);
    }
}
