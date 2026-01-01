<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Siswa extends Model
{
    use HasFactory;

    protected $table = 'siswas';

    protected $fillable = [
        'role_id',
        'user_id',
        'nis',
        'kelas_id',
        'status',
        'nisn',
        'no_kk',
        'nik',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'alamat',
        'rt_rw',
        'kelurahan_desa',
        'kecamatan',
        'kabupaten_kota',
        'provinsi',
        'agama',
        'status_perkawinan',
        'pekerjaan',
        'pendidikan_terakhir',
    ];

    // Relationships
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Accessor for cabang through user
    public function getCabangAttribute()
    {
        return $this->user?->cabang;
    }

    // Accessor for departemen through user
    public function getDepartemenAttribute()
    {
        return $this->user?->departemen;
    }
}
