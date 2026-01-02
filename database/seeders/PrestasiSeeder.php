<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Prestasi;

class PrestasiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample Data based on previous static content
        $prestasis = [
            [
                'nama' => 'Siti Nurhaliza, S.Pd',
                'role' => 'Guru Matematika',
                'prestasi' => 'Juara 1 Lomba Guru Berprestasi Tingkat Nasional',
                'penghargaan' => 'Medali Emas & Piagam Penghargaan',
                'foto' => '/images/achievements/teacher1.png',
                'tanggal' => '2024-05-20',
                'urutan' => 1,
            ],
            [
                'nama' => 'Ahmad Fauzi, M.Pd',
                'role' => 'Guru Bahasa Inggris',
                'prestasi' => 'Best Teacher Innovation Award',
                'penghargaan' => 'Penghargaan Inovasi Pembelajaran',
                'foto' => '/images/achievements/teacher2.png',
                'tanggal' => '2024-06-15',
                'urutan' => 2,
            ],
            [
                'nama' => 'Dewi Sartika, S.Pd',
                'role' => 'Guru IPA',
                'prestasi' => 'Juara 2 Lomba Karya Tulis Ilmiah Guru',
                'penghargaan' => 'Medali Perak & Sertifikat',
                'foto' => '/images/achievements/teacher1.png',
                'tanggal' => '2023-11-10',
                'urutan' => 3,
            ],
            [
                'nama' => 'Muhammad Rizki, S.Kom',
                'role' => 'Staff IT',
                'prestasi' => 'Best IT Support of The Year',
                'penghargaan' => 'Penghargaan Karyawan Teladan',
                'foto' => '/images/achievements/teacher2.png',
                'tanggal' => '2024-08-17',
                'urutan' => 4,
            ],
            [
                'nama' => 'Fatimah Az-Zahra, S.Pd',
                'role' => 'Guru Agama Islam',
                'prestasi' => 'Juara 1 Lomba Dai Muda Nasional',
                'penghargaan' => 'Trofi & Beasiswa Pendidikan',
                'foto' => '/images/achievements/teacher1.png',
                'tanggal' => '2023-09-01',
                'urutan' => 5,
            ],
            [
                'nama' => 'Budi Santoso, S.E',
                'role' => 'Staff Administrasi',
                'prestasi' => 'Excellence in Administration Award',
                'penghargaan' => 'Penghargaan Dedikasi Kerja',
                'foto' => '/images/achievements/teacher2.png',
                'tanggal' => '2024-01-25',
                'urutan' => 6,
            ]
        ];

        foreach ($prestasis as $data) {
            Prestasi::create($data);
        }
    }
}
