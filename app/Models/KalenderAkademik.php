<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KalenderAkademik extends Model
{
    protected $fillable = [
        'tanggal',
        'judul',
        'tipe',
        'warna',
        'keterangan',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];
}
