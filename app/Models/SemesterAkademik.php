<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SemesterAkademik extends Model
{
    use HasFactory;

    protected $table = 'semester_akademik';

    protected $fillable = [
        'periode_akademik_id',
        'nama',
        'kode',
        'is_aktif',
    ];

    protected $casts = [
        'is_aktif' => 'boolean',
    ];

    // Relationship
    public function periodeAkademik()
    {
        return $this->belongsTo(PeriodeAkademik::class, 'periode_akademik_id');
    }

    // Get active semester
    public static function getActive()
    {
        return self::where('is_aktif', true)->first();
    }
}
