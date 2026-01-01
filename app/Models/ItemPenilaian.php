<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ItemPenilaian extends Model
{
    use HasFactory;

    protected $table = 'item_penilaian';

    protected $fillable = [
        'cabang_id',
        'departemen_id',
        'kelas_id',
        'mata_pelajaran_id',
        'periode_akademik_id',
        'semester_akademik_id',
        'nama',
        'jenis',
        'keterangan',
        'tanggal_penilaian',
    ];

    protected $casts = [
        'tanggal_penilaian' => 'date',
    ];

    // Relationships
    public function cabang()
    {
        return $this->belongsTo(Cabang::class);
    }

    public function departemen()
    {
        return $this->belongsTo(Departemen::class);
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

    public function nilaiPelajarans()
    {
        return $this->hasMany(NilaiPelajaran::class);
    }
}
