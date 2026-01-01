<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JurnalAccessCode extends Model
{
    protected $fillable = [
        'user_id',
        'code',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
