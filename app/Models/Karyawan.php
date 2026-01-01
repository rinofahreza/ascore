<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Karyawan extends Model
{
    use HasFactory;

    protected $table = 'karyawans';

    protected $fillable = [
        'role_id',
        'user_id',
        'nig',
        'posisi',
        'status',
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
        'tanggal_masuk',
        'tanggal_sk',
        'nomor_sk',
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

    // Accessor to get cabang through user
    public function getCabangAttribute()
    {
        return $this->user->cabang ?? null;
    }

    // Accessor to get departemen through user
    public function getDepartemenAttribute()
    {
        return $this->user->departemen ?? null;
    }
}
