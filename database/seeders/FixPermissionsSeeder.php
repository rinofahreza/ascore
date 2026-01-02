<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class FixPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Find Super Admin role (adjust column name if different, e.g., 'nama')
        $role = Role::where('nama', 'Super Admin')->first();

        if (!$role) {
            $role = Role::where('nama', 'Admin')->first();
        }

        if ($role) {
            $permissions = Permission::where('name', 'like', 'prestasi.%')->get();
            $role->permissions()->syncWithoutDetaching($permissions->pluck('id'));
            $this->command->info("Attached " . $permissions->count() . " permissions to role: " . $role->name);
        } else {
            $this->command->error("Role 'Super Admin' or 'Admin' not found.");
        }
    }
}
