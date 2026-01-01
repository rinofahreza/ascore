<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PeriodeAkademik extends Model
{
    use HasFactory;

    protected $table = 'periode_akademiks';

    protected $fillable = [
        'nama',
        'status',
    ];

    // Get active periode
    public static function getActive()
    {
        return self::where('status', 'Active')->first();
    }
}
