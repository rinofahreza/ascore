<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JurnalMengajar extends Model
{
    use HasFactory;

    protected $fillable = [
        'cabang_id',
        'departemen_id',
        'periode_akademik_id',
        'semester_akademik_id',
        'user_id',
        'kelas_id',
        'mata_pelajaran_id',
        'tanggal',
        'jam_mulai',
        'jam_selesai',
        'materi',
        'catatan',
        'foto',
        'created_by',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jam_mulai' => 'datetime:H:i',
        'jam_selesai' => 'datetime:H:i',
        'foto' => 'array',
    ];

    public function cabang()
    {
        return $this->belongsTo(Cabang::class);
    }

    public function departemen()
    {
        return $this->belongsTo(Departemen::class);
    }

    public function periodeAkademik()
    {
        return $this->belongsTo(PeriodeAkademik::class);
    }

    public function semesterAkademik()
    {
        return $this->belongsTo(SemesterAkademik::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    public function mataPelajaran()
    {
        return $this->belongsTo(MataPelajaran::class);
    }

    public function kehadiranSiswas()
    {
        return $this->hasMany(JurnalMengajarKehadiranSiswa::class);
    }
}
