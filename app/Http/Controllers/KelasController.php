<?php

namespace App\Http\Controllers;

use App\Models\Kelas;
use App\Models\Cabang;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KelasController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:kelas.view')->only(['index']);
        $this->middleware('can:kelas.create')->only(['create', 'store']);
        $this->middleware('can:kelas.edit')->only(['edit', 'update', 'toggleStatus', 'aturSiswa', 'assignSiswa', 'removeSiswa']);
        $this->middleware('can:kelas.delete')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Kelas::with(['cabang', 'departemen']);

        // Apply filters
        if ($request->filled('cabang_id')) {
            $query->where('cabang_id', $request->cabang_id);
        }

        if ($request->filled('departemen_id')) {
            $query->where('departemen_id', $request->departemen_id);
        }

        $kelas = $query->latest()->paginate(10)->appends($request->query());

        $cabangs = Cabang::all();

        return Inertia::render('Kelas/Index', [
            'kelas' => $kelas,
            'cabangs' => $cabangs,
            'filters' => $request->only(['cabang_id', 'departemen_id'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $cabangs = Cabang::all();
        $levels = \App\Models\Level::all();

        return Inertia::render('Kelas/Create', [
            'cabangs' => $cabangs,
            'levels' => $levels
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cabang_id' => 'required|exists:cabangs,id',
            'departemen_id' => 'nullable|exists:departemens,id',
            'level_id' => 'nullable|exists:levels,id',
            'nama' => 'required|string|max:255',
            'jurusan' => 'nullable|string|max:255',
        ]);

        // Status default is true (set in migration)
        Kelas::create($validated);

        return redirect()->route('kelas.index')
            ->with('success', 'Kelas berhasil ditambahkan');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $kelas = Kelas::findOrFail($id);
        $cabangs = Cabang::all();
        $levels = \App\Models\Level::all();

        return Inertia::render('Kelas/Edit', [
            'kelas' => [
                'id' => $kelas->id,
                'cabang_id' => $kelas->cabang_id,
                'departemen_id' => $kelas->departemen_id,
                'level_id' => $kelas->level_id,
                'nama' => $kelas->nama,
                'jurusan' => $kelas->jurusan,
                'status' => $kelas->status,
            ],
            'cabangs' => $cabangs,
            'levels' => $levels
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $kelas = Kelas::findOrFail($id);

        $validated = $request->validate([
            'cabang_id' => 'required|exists:cabangs,id',
            'departemen_id' => 'nullable|exists:departemens,id',
            'level_id' => 'nullable|exists:levels,id',
            'nama' => 'required|string|max:255',
            'jurusan' => 'nullable|string|max:255',
        ]);

        $kelas->update($validated);

        return redirect()->route('kelas.index')
            ->with('success', 'Kelas berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $kelas = Kelas::findOrFail($id);
        $kelas->delete();

        return redirect()->route('kelas.index')
            ->with('success', 'Kelas berhasil dihapus');
    }

    /**
     * Toggle status of the resource.
     */
    /**
     * Toggle status of the resource.
     */
    public function toggleStatus($id)
    {
        $kelas = Kelas::findOrFail($id);
        $kelas->status = !$kelas->status;
        $kelas->save();

        return back();
    }

    /**
     * Show the page to assign students to a class.
     */
    public function aturSiswa(Request $request, $id)
    {
        $kelas = Kelas::with(['cabang', 'departemen'])->findOrFail($id);
        $periodes = \App\Models\PeriodeAkademik::orderBy('id', 'desc')->get();

        $activePeriodeId = $request->input('periode_id');

        // If no period selected, try to get active one, or fallback to latest
        if (!$activePeriodeId) {
            $activePeriode = \App\Models\PeriodeAkademik::where('status', 'Active')->first();
            $activePeriodeId = $activePeriode ? $activePeriode->id : ($periodes->first()->id ?? null);
        }

        if (!$activePeriodeId) {
            // Handle edge case where no periods exist
            return redirect()->back()->with('error', 'Belum ada data Periode Akademik.');
        }

        // 1. Get Assigned Students for this Class & Period
        $assignedStudents = \App\Models\KelasSiswa::where('kelas_id', $kelas->id)
            ->where('periode_akademik_id', $activePeriodeId)
            ->with('siswa')
            ->get()
            ->map(function ($ks) {
                return [
                    'id' => $ks->id, // ID of the pivot record (kelas_siswa)
                    'siswa_id' => $ks->siswa_id,
                    'name' => $ks->siswa->name,
                    'nis' => $ks->siswa->username ?? '-', // Assuming username or another field is NIS
                    'avatar_url' => $ks->siswa->avatar_url,
                ];
            });

        // 2. Get Available Students 
        // Logic: Role Siswa AND Not assigned to ANY class in THIS period
        // AND Must be registered in 'siswas' table

        // First get IDs of students already assigned to ANY class in this period
        $assignedStudentIds = \App\Models\KelasSiswa::where('periode_akademik_id', $activePeriodeId)
            ->pluck('siswa_id')
            ->toArray();

        // Get students not in that list AND exist in siswas table
        $roleSiswa = \App\Models\Role::where('nama', 'siswa')->first();
        $roleSiswaId = $roleSiswa ? $roleSiswa->id : null;

        $availableStudents = \App\Models\User::where('users.role_id', $roleSiswaId)
            ->where('users.cabang_id', $kelas->cabang_id)
            ->where('users.departemen_id', $kelas->departemen_id)
            ->join('siswas', 'users.id', '=', 'siswas.user_id') // inner join ensures they are in siswas
            ->whereNotIn('users.id', $assignedStudentIds)
            ->select('users.*', 'siswas.nis') // Get actual NIS
            ->orderBy('users.name')
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'name' => $s->name,
                    'nis' => $s->nis ?? '-',
                    'avatar_url' => $s->avatar_url,
                ];
            });

        return Inertia::render('Kelas/AturSiswa', [
            'kelas' => $kelas,
            'periodes' => $periodes,
            'selectedPeriodeId' => (int) $activePeriodeId,
            'assignedStudents' => $assignedStudents,
            'availableStudents' => $availableStudents,
        ]);
    }

    /**
     * Assign a student to a class.
     */
    public function assignSiswa(Request $request, $id)
    {
        $request->validate([
            'siswa_id' => 'required|exists:users,id',
            'periode_id' => 'required|exists:periode_akademiks,id',
        ]);

        $kelas = Kelas::findOrFail($id);

        \App\Models\KelasSiswa::create([
            'kelas_id' => $kelas->id,
            'siswa_id' => $request->siswa_id,
            'periode_akademik_id' => $request->periode_id,
            'cabang_id' => $kelas->cabang_id,
            'departemen_id' => $kelas->departemen_id,
        ]);

        return redirect()->back()->with('success', 'Siswa berhasil ditambahkan ke kelas.');
    }

    /**
     * Remove a student from a class.
     */
    public function removeSiswa($id)
    {
        // $id is the ID of the kelas_siswa record
        $assignment = \App\Models\KelasSiswa::findOrFail($id);
        $assignment->delete();

        return redirect()->back()->with('success', 'Siswa berhasil dikeluarkan dari kelas.');
    }
}
