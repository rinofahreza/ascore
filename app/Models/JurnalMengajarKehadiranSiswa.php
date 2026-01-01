<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\JurnalMengajar;
use App\Models\User;

class JurnalMengajarKehadiranSiswa extends Model
{
    protected $fillable = [
        'jurnal_mengajar_id',
        'user_id',
        'status',
    ];

    public function jurnalMengajar()
    {
        return $this->belongsTo(JurnalMengajar::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
