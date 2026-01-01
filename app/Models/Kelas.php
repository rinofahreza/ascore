<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Kelas extends Model
{
    use HasFactory;

    protected $table = 'kelas';

    protected $fillable = [
        'cabang_id',
        'departemen_id',
        'level_id',
        'nama',
        'jurusan',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
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

    public function level()
    {
        return $this->belongsTo(Level::class);
    }
}
