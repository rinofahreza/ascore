<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class JamPelajaran extends Model
{
    use HasFactory;

    protected $table = 'jam_pelajarans';

    protected $fillable = [
        'periode_akademik_id',
        'cabang_id',
        'departemen_id',
        'hari',
        'nama',
        'jam_mulai',
        'jam_selesai',
    ];

    // Relationships
    public function periodeAkademik()
    {
        return $this->belongsTo(PeriodeAkademik::class);
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
