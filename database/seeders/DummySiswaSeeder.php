<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DummySiswaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roleSiswa = \App\Models\Role::where('nama', 'siswa')->first();

        if (!$roleSiswa) {
            $this->command->error('Role siswa not found!');
            return;
        }

        $cabang = \App\Models\Cabang::first();
        $departemen = \App\Models\Departemen::first();

        for ($i = 0; $i < 10; $i++) {
            $user = \App\Models\User::create([
                'name' => fake()->name(),
                'email' => fake()->unique()->safeEmail(),
                'password' => bcrypt('password'), // default password
                'role_id' => $roleSiswa->id,
                'cabang_id' => $cabang ? $cabang->id : null,
                'departemen_id' => $departemen ? $departemen->id : null,
            ]);

            \App\Models\Siswa::create([
                'user_id' => $user->id,
                'role_id' => $roleSiswa->id,
                'nis' => fake()->unique()->numerify('#####'),
                'nisn' => fake()->unique()->numerify('##########'),
            ]);
        }
    }
}
