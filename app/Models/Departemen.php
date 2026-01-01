<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Departemen extends Model
{
    use HasFactory;

    protected $table = 'departemens';

    protected $fillable = [
        'cabang_id',
        'nama',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    // Relationship to Cabang
    public function cabang()
    {
        return $this->belongsTo(Cabang::class);
    }
}
