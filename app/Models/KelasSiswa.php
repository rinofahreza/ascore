<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KelasSiswa extends Model
{
    protected $fillable = [
        'periode_akademik_id',
        'kelas_id',
        'siswa_id',
        'cabang_id',
        'departemen_id',
    ];

    public function periode()
    {
        return $this->belongsTo(PeriodeAkademik::class, 'periode_akademik_id');
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }

    public function cabang()
    {
        return $this->belongsTo(Cabang::class);
    }

    public function departemen()
    {
        return $this->belongsTo(Departemen::class);
    }
}
