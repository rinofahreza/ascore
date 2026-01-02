<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Define permissions Group -> [Menu -> [Actions]]
        // We will create CRUD actions: view, create, edit, delete
        // Format: 'group' => ['menu1', 'menu2']

        $structure = [
            'Organisasi' => [
                'cabang' => 'Cabang',
                'departemen' => 'Departemen',
                'karyawan' => 'Karyawan',
            ],
            'Aplikasi' => [
                'role' => 'Role Manajemen',
                'user' => 'Pengguna',
                'slider' => 'Slider Gambar',
            ],
            'Sekolah - Kurikulum' => [
                'mata_pelajaran' => 'Mata Pelajaran',
                'jam_pelajaran' => 'Jam Pelajaran',
            ],
            'Sekolah - Akademik' => [
                'periode_akademik' => 'Periode Akademik',
                'jadwal_pelajaran' => 'Jadwal Pelajaran',
                'kalender' => 'Kalender Akademik',
                'prestasi' => 'Prestasi GuKar',
            ],

            'Sekolah - Kesiswaan' => [
                'kelas' => 'Kelas',
                'guru' => 'Guru',
                'siswa' => 'Siswa',
                'poin' => 'Poin Pelanggaran',
                'pelanggaran' => 'Data Pelanggaran',
            ],
        ];

        $actions = [
            'view' => 'Melihat',
            'create' => 'Menambah',
            'edit' => 'Mengubah',
            'delete' => 'Menghapus',
        ];

        DB::beginTransaction();

        try {
            foreach ($structure as $group => $menus) {
                foreach ($menus as $slug => $labelMenu) {
                    foreach ($actions as $actionSlug => $actionLabel) {
                        $permissionName = "{$slug}.{$actionSlug}";

                        // Check if exists to avoid duplicates if re-run
                        if (!Permission::where('name', $permissionName)->exists()) {
                            Permission::create([
                                'name' => $permissionName, // e.g., cabang.create
                                'group' => $group,         // e.g., Organisasi
                                'label' => "{$actionLabel} {$labelMenu}", // e.g., Menambah Cabang
                            ]);
                        }
                    }
                }
            }

            DB::commit();
            $this->command->info('Permissions seeded successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Error seeding permissions: ' . $e->getMessage());
        }
    }
}
