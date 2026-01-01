<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\Role;
use App\Models\User;
use App\Models\Cabang;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SiswaController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:siswa.view')->only(['index']);
        $this->middleware('can:siswa.create')->only(['create', 'store']);
        $this->middleware('can:siswa.edit')->only(['edit', 'update']);
        $this->middleware('can:siswa.delete')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Siswa::with(['role', 'user.cabang', 'user.departemen']);

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

        $siswas = $query->latest()->paginate(10)->appends($request->query());

        $cabangs = Cabang::all();
        $roles = Role::all();

        return Inertia::render('Siswa/Index', [
            'siswas' => $siswas,
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

        return Inertia::render('Siswa/Create', [
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
            'nis' => 'nullable|string|max:255|unique:siswas,nis',
            'kelas_id' => 'nullable|exists:kelas,id',
            'status' => 'required|in:Aktif,Lulus,Pindah,Keluar,Drop Out',
            'nisn' => 'nullable|string|max:255|unique:siswas,nisn',
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
        ]);

        Siswa::create($validated);

        return redirect()->route('siswa.index')
            ->with('success', 'Siswa berhasil ditambahkan');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $siswa = Siswa::with('user')->findOrFail($id);
        $roles = Role::all();
        $cabangs = Cabang::all();

        return Inertia::render('Siswa/Edit', [
            'siswa' => [
                'id' => $siswa->id,
                'role_id' => $siswa->role_id,
                'user_id' => $siswa->user_id,
                'nis' => $siswa->nis,
                'kelas_id' => $siswa->kelas_id,
                'status' => $siswa->status,
                'nisn' => $siswa->nisn,
                // Pass user's cabang and departemen for initial state
                'user_cabang_id' => $siswa->user->cabang_id ?? null,
                'user_departemen_id' => $siswa->user->departemen_id ?? null,
                'no_kk' => $siswa->no_kk,
                'nik' => $siswa->nik,
                'tempat_lahir' => $siswa->tempat_lahir,
                'tanggal_lahir' => $siswa->tanggal_lahir,
                'jenis_kelamin' => $siswa->jenis_kelamin,
                'alamat' => $siswa->alamat,
                'rt_rw' => $siswa->rt_rw,
                'kelurahan_desa' => $siswa->kelurahan_desa,
                'kecamatan' => $siswa->kecamatan,
                'kabupaten_kota' => $siswa->kabupaten_kota,
                'provinsi' => $siswa->provinsi,
                'agama' => $siswa->agama,
                'status_perkawinan' => $siswa->status_perkawinan,
                'pekerjaan' => $siswa->pekerjaan,
                'pendidikan_terakhir' => $siswa->pendidikan_terakhir,
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
        $siswa = Siswa::findOrFail($id);

        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'user_id' => 'required|exists:users,id',
            'nis' => 'nullable|string|max:255|unique:siswas,nis,' . $id,
            'kelas_id' => 'nullable|exists:kelas,id',
            'status' => 'required|in:Aktif,Lulus,Pindah,Keluar,Drop Out',
            'nisn' => 'nullable|string|max:255|unique:siswas,nisn,' . $id,
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
        ]);

        $siswa->update($validated);

        return redirect()->route('siswa.index')
            ->with('success', 'Siswa berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $siswa = Siswa::findOrFail($id);
        $siswa->delete();

        return redirect()->route('siswa.index')
            ->with('success', 'Siswa berhasil dihapus');
    }
}
