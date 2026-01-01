<?php

namespace App\Http\Controllers;

use App\Models\Guru;
use App\Models\Role;
use App\Models\User;
use App\Models\Cabang;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuruController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:guru.view')->only(['index', 'getUsersByFilters', 'getGuruByMataPelajaran']);
        $this->middleware('can:guru.create')->only(['create', 'store']);
        $this->middleware('can:guru.edit')->only(['edit', 'update']);
        $this->middleware('can:guru.delete')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Guru::with(['role', 'user.cabang', 'user.departemen']);

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

        $gurus = $query->latest()->paginate(10)->appends($request->query());

        $cabangs = Cabang::all();
        $roles = Role::all();

        return Inertia::render('Guru/Index', [
            'gurus' => $gurus,
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

        return Inertia::render('Guru/Create', [
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
            'nig' => 'nullable|string|max:255|unique:gurus,nig',
            'bidang_studi' => 'nullable|string|max:255',
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

        Guru::create($validated);

        return redirect()->route('guru.index')
            ->with('success', 'Guru berhasil ditambahkan');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $guru = Guru::with('user')->findOrFail($id);
        $roles = Role::all();
        $cabangs = Cabang::all();

        return Inertia::render('Guru/Edit', [
            'guru' => [
                'id' => $guru->id,
                'role_id' => $guru->role_id,
                'user_id' => $guru->user_id,
                'nig' => $guru->nig,
                'bidang_studi' => $guru->bidang_studi,
                'status' => $guru->status,
                // Pass user's cabang and departemen for initial state
                'user_cabang_id' => $guru->user->cabang_id ?? null,
                'user_departemen_id' => $guru->user->departemen_id ?? null,
                'no_kk' => $guru->no_kk,
                'nik' => $guru->nik,
                'tempat_lahir' => $guru->tempat_lahir,
                'tanggal_lahir' => $guru->tanggal_lahir,
                'jenis_kelamin' => $guru->jenis_kelamin,
                'alamat' => $guru->alamat,
                'rt_rw' => $guru->rt_rw,
                'kelurahan_desa' => $guru->kelurahan_desa,
                'kecamatan' => $guru->kecamatan,
                'kabupaten_kota' => $guru->kabupaten_kota,
                'provinsi' => $guru->provinsi,
                'agama' => $guru->agama,
                'status_perkawinan' => $guru->status_perkawinan,
                'pekerjaan' => $guru->pekerjaan,
                'pendidikan_terakhir' => $guru->pendidikan_terakhir,
                'tanggal_masuk' => $guru->tanggal_masuk,
                'tanggal_sk' => $guru->tanggal_sk,
                'nomor_sk' => $guru->nomor_sk,
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
        $guru = Guru::findOrFail($id);

        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'user_id' => 'required|exists:users,id',
            'nig' => 'nullable|string|max:255|unique:gurus,nig,' . $id,
            'bidang_studi' => 'nullable|string|max:255',
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

        $guru->update($validated);

        return redirect()->route('guru.index')
            ->with('success', 'Guru berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $guru = Guru::findOrFail($id);
        $guru->delete();

        return redirect()->route('guru.index')
            ->with('success', 'Guru berhasil dihapus');
    }

    /**
     * Get users by filters (cabang, departemen, role) for dynamic dropdown.
     */
    public function getUsersByFilters(Request $request)
    {
        $query = User::query();

        // Exclude users who are already registered as guru
        $existingGuruUserIds = Guru::pluck('user_id')->toArray();

        // If include_user_id is provided, remove it from the exclusion list
        if ($request->filled('include_user_id')) {
            $existingGuruUserIds = array_diff($existingGuruUserIds, [$request->include_user_id]);
        }

        $query->whereNotIn('id', $existingGuruUserIds);

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

    /**
     * Get guru by mata_pelajaran_id (API endpoint for dynamic dropdown)
     */
    public function getGuruByMataPelajaran($mataPelajaranId)
    {
        // Get mata pelajaran to find matching gurus by bidang_studi
        $mataPelajaran = \App\Models\MataPelajaran::find($mataPelajaranId);

        if (!$mataPelajaran) {
            return response()->json([]);
        }

        // Get all active gurus
        $gurus = Guru::with('user')
            ->get()
            ->map(function ($guru) {
                return [
                    'id' => $guru->id,
                    'name' => $guru->user->name ?? '-'
                ];
            });

        return response()->json($gurus);
    }
}
