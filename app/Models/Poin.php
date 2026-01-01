<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Poin extends Model
{
    use HasFactory;

    protected $table = 'poin';

    protected $fillable = [
        'nama',
        'kategori',
    ];
}
