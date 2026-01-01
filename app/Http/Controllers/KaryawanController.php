<?php

namespace App\Http\Controllers;

use App\Models\Karyawan;
use App\Models\Role;
use App\Models\User;
use App\Models\Cabang;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KaryawanController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:karyawan.view')->only(['index']);
        $this->middleware('can:karyawan.create')->only(['create', 'store']);
        $this->middleware('can:karyawan.edit')->only(['edit', 'update']);
        $this->middleware('can:karyawan.delete')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Karyawan::with(['role', 'user.cabang', 'user.departemen']);

        // Search by user name
        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        // Apply filters through user relationship
        if ($request->filled('cabang_id')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('cabang_id', $request->cabang_id);
            });
        }

        if ($request->filled('departemen_id')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('departemen_id', $request->departemen_id);
            });
        }

        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        $karyawans = $query->latest()->paginate(10)->appends($request->query());

        $cabangs = Cabang::all();
        $roles = Role::all();

        return Inertia::render('Karyawan/Index', [
            'karyawans' => $karyawans,
            'cabangs' => $cabangs,
            'roles' => $roles,
            'filters' => $request->only(['cabang_id', 'departemen_id', 'role_id', 'search'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::all();
        $cabangs = Cabang::all();

        return Inertia::render('Karyawan/Create', [
            'roles' => $roles,
            'cabangs' => $cabangs
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'user_id' => 'required|exists:users,id',
            'nig' => 'nullable|string|max:255|unique:karyawans,nig',
            'posisi' => 'nullable|string|max:255',
            'status' => 'required|in:Tetap,Percobaan,Kontrak,Mitra Kerja',
            'no_kk' => 'nullable|string|max:255',
            'nik' => 'nullable|string|max:255',
            'tempat_lahir' => 'nullable|string|max:255',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:L,P',
            'alamat' => 'nullable|string',
            'rt_rw' => 'nullable|string|max:255',
            'kelurahan_desa' => 'nullable|string|max:255',
            'kecamatan' => 'nullable|string|max:255',
            'kabupaten_kota' => 'nullable|string|max:255',
            'provinsi' => 'nullable|string|max:255',
            'agama' => 'nullable|string|max:255',
            'status_perkawinan' => 'nullable|string|max:255',
            'pekerjaan' => 'nullable|string|max:255',
            'pendidikan_terakhir' => 'nullable|string|max:255',
            'tanggal_masuk' => 'nullable|date',
            'tanggal_sk' => 'nullable|date',
            'nomor_sk' => 'nullable|string|max:255',
        ]);

        Karyawan::create($validated);

        return redirect()->route('karyawan.index')
            ->with('success', 'Karyawan berhasil ditambahkan');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $karyawan = Karyawan::with('user')->findOrFail($id);
        $roles = Role::all();
        $cabangs = Cabang::all();

        return Inertia::render('Karyawan/Edit', [
            'karyawan' => [
                'id' => $karyawan->id,
                'role_id' => $karyawan->role_id,
                'user_id' => $karyawan->user_id,
                'nig' => $karyawan->nig,
                'posisi' => $karyawan->posisi,
                'status' => $karyawan->status,
                // Pass user's cabang and departemen for initial state
                'user_cabang_id' => $karyawan->user->cabang_id ?? null,
                'user_departemen_id' => $karyawan->user->departemen_id ?? null,
                'no_kk' => $karyawan->no_kk,
                'nik' => $karyawan->nik,
                'tempat_lahir' => $karyawan->tempat_lahir,
                'tanggal_lahir' => $karyawan->tanggal_lahir,
                'jenis_kelamin' => $karyawan->jenis_kelamin,
                'alamat' => $karyawan->alamat,
                'rt_rw' => $karyawan->rt_rw,
                'kelurahan_desa' => $karyawan->kelurahan_desa,
                'kecamatan' => $karyawan->kecamatan,
                'kabupaten_kota' => $karyawan->kabupaten_kota,
                'provinsi' => $karyawan->provinsi,
                'agama' => $karyawan->agama,
                'status_perkawinan' => $karyawan->status_perkawinan,
                'pekerjaan' => $karyawan->pekerjaan,
                'pendidikan_terakhir' => $karyawan->pendidikan_terakhir,
                'tanggal_masuk' => $karyawan->tanggal_masuk,
                'tanggal_sk' => $karyawan->tanggal_sk,
                'nomor_sk' => $karyawan->nomor_sk,
            ],
            'roles' => $roles,
            'cabangs' => $cabangs
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $karyawan = Karyawan::findOrFail($id);

        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'user_id' => 'required|exists:users,id',
            'nig' => 'nullable|string|max:255|unique:karyawans,nig,' . $id,
            'posisi' => 'nullable|string|max:255',
            'status' => 'required|in:Tetap,Percobaan,Kontrak,Mitra Kerja',
            'no_kk' => 'nullable|string|max:255',
            'nik' => 'nullable|string|max:255',
            'tempat_lahir' => 'nullable|string|max:255',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:L,P',
            'alamat' => 'nullable|string',
            'rt_rw' => 'nullable|string|max:255',
            'kelurahan_desa' => 'nullable|string|max:255',
            'kecamatan' => 'nullable|string|max:255',
            'kabupaten_kota' => 'nullable|string|max:255',
            'provinsi' => 'nullable|string|max:255',
            'agama' => 'nullable|string|max:255',
            'status_perkawinan' => 'nullable|string|max:255',
            'pekerjaan' => 'nullable|string|max:255',
            'pendidikan_terakhir' => 'nullable|string|max:255',
            'tanggal_masuk' => 'nullable|date',
            'tanggal_sk' => 'nullable|date',
            'nomor_sk' => 'nullable|string|max:255',
        ]);

        $karyawan->update($validated);

        return redirect()->route('karyawan.index')
            ->with('success', 'Karyawan berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $karyawan = Karyawan::findOrFail($id);
        $karyawan->delete();

        return redirect()->route('karyawan.index')
            ->with('success', 'Karyawan berhasil dihapus');
    }

    /**
     * Get users by filters (cabang, departemen, role) for dynamic dropdown.
     */
    public function getUsersByFilters(Request $request)
    {
        $query = User::query();

        // Exclude users who are already registered as karyawan
        $existingKaryawanUserIds = Karyawan::pluck('user_id')->toArray();

        // If include_user_id is provided, remove it from the exclusion list
        if ($request->filled('include_user_id')) {
            $existingKaryawanUserIds = array_diff($existingKaryawanUserIds, [$request->include_user_id]);
        }

        $query->whereNotIn('id', $existingKaryawanUserIds);

        if ($request->filled('cabang_id')) {
            $query->where('cabang_id', $request->cabang_id);
        }

        if ($request->filled('departemen_id')) {
            $query->where('departemen_id', $request->departemen_id);
        }

        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        $users = $query->get(['id', 'name']);
        return response()->json($users);
    }
}
