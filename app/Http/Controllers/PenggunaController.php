<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Cabang;
use App\Models\Departemen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class PenggunaController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:user.view')->only(['index']);
        $this->middleware('can:user.create')->only(['create', 'store']);
        $this->middleware('can:user.edit')->only(['edit', 'update']);
        $this->middleware('can:user.delete')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::with(['role', 'cabang', 'departemen']);

        // Search by name or email
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by cabang
        if ($request->filled('cabang_id')) {
            $query->where('cabang_id', $request->cabang_id);
        }

        // Filter by departemen
        if ($request->filled('departemen_id')) {
            $query->where('departemen_id', $request->departemen_id);
        }

        // Filter by role
        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        $users = $query->latest()->paginate(10)->appends($request->query());

        $cabangs = Cabang::all();
        $roles = Role::all();

        return Inertia::render('Pengguna/Index', [
            'users' => $users,
            'cabangs' => $cabangs,
            'roles' => $roles,
            'filters' => $request->only(['search', 'cabang_id', 'departemen_id', 'role_id'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::all();
        $cabangs = Cabang::all();
        $departemens = Departemen::all();

        return Inertia::render('Pengguna/Create', [
            'roles' => $roles,
            'cabangs' => $cabangs,
            'departemens' => $departemens
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'rfid' => 'nullable|string|unique:users,rfid',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'cabang_id' => 'required|exists:cabangs,id',
            'departemen_id' => 'nullable|exists:departemens,id',
            'is_active' => 'required|boolean',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()->route('pengguna.index')
            ->with('success', 'Pengguna berhasil ditambahkan');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $user = User::findOrFail($id);
        $roles = Role::all();
        $cabangs = Cabang::all();
        $departemens = Departemen::all();

        return Inertia::render('Pengguna/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'rfid' => $user->rfid,
                'role_id' => $user->role_id,
                'cabang_id' => $user->cabang_id,
                'departemen_id' => $user->departemen_id,
                'is_active' => $user->is_active,
            ],
            'roles' => $roles,
            'cabangs' => $cabangs,
            'departemens' => $departemens
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'rfid' => 'nullable|string|unique:users,rfid,' . $id,
            'password' => 'nullable|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'cabang_id' => 'required|exists:cabangs,id',
            'departemen_id' => 'nullable|exists:departemens,id',
            'is_active' => 'required|boolean',
        ]);

        // Only update password if provided
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->route('pengguna.index')
            ->with('success', 'Pengguna berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->route('pengguna.index')
            ->with('success', 'Pengguna berhasil dihapus');
    }
}
