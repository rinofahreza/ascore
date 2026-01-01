<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Berkas extends Model
{
    protected $table = 'berkas';

    protected $fillable = [
        'user_id',
        'nama_file',
        'nama_tersimpan',
        'jenis_file',
        'ukuran',
        'path',
    ];

    // Relationship to User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Accessor for human-readable file size
    public function getUkuranFormatAttribute()
    {
        $bytes = $this->ukuran;
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' B';
    }

    // Accessor for file icon based on type
    public function getIconAttribute()
    {
        $extension = strtolower($this->jenis_file);

        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif'])) {
            return 'image';
        } elseif ($extension === 'pdf') {
            return 'pdf';
        }

        return 'file';
    }
}
