<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:role.view')->only(['index']);
        $this->middleware('can:role.create')->only(['create', 'store']);
        $this->middleware('can:role.edit')->only(['edit', 'update']);
        $this->middleware('can:role.delete')->only(['destroy']);
    }
    public function index()
    {
        return Inertia::render('Settings/Roles/Index', [
            'roles' => Role::withCount('permissions')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Settings/Roles/Form', [
            'permissions' => Permission::all()->groupBy('group'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|unique:roles,nama',
            'permissions' => 'array',
        ]);

        $role = Role::create(['nama' => $request->nama]);
        $role->permissions()->sync($request->permissions);

        return redirect()->route('settings.roles.index')->with('success', 'Role created successfully');
    }

    public function edit(Role $role)
    {
        return Inertia::render('Settings/Roles/Form', [
            'role' => $role->load('permissions'),
            'permissions' => Permission::all()->groupBy('group'),
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'nama' => 'required|unique:roles,nama,' . $role->id,
            'permissions' => 'array',
        ]);

        $role->update(['nama' => $request->nama]);
        $role->permissions()->sync($request->permissions);

        return redirect()->route('settings.roles.index')->with('success', 'Role updated successfully');
    }

    public function destroy(Role $role)
    {
        if ($role->id === 1) { // Prevent deleting Admin role if it's ID 1
            return back()->with('error', 'Cannot delete super admin role');
        }

        $role->delete();
        return back()->with('success', 'Role deleted successfully');
    }
}
