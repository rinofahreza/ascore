<?php

namespace App\Http\Controllers;

use App\Models\Pelanggaran;
use App\Models\Cabang;
use App\Models\Poin;
use App\Models\PeriodeAkademik;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PelanggaranController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:pelanggaran.view')->only(['index', 'getSiswaByKelas']);
        $this->middleware('can:pelanggaran.create')->only(['create', 'store']);
        $this->middleware('can:pelanggaran.edit')->only(['edit', 'update']);
        $this->middleware('can:pelanggaran.delete')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Pelanggaran::with(['kelas.cabang', 'kelas.departemen', 'siswa', 'poin', 'periodeAkademik', 'guru']);

        // Apply filters
        if ($request->filled('cabang_id')) {
            $query->whereHas('kelas', function ($q) use ($request) {
                $q->where('cabang_id', $request->cabang_id);
            });
        }

        if ($request->filled('departemen_id')) {
            $query->whereHas('kelas', function ($q) use ($request) {
                $q->where('departemen_id', $request->departemen_id);
            });
        }

        if ($request->filled('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }

        // Search by NISN or Nama Siswa
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('siswa', function ($q) use ($search) {
                $q->where('nisn', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        // Default to active periode akademik if no filter is provided
        if (!$request->filled('periode_akademik_id')) {
            $activePeriode = PeriodeAkademik::where('status', 'Active')->first();
            if ($activePeriode) {
                $query->where('periode_akademik_id', $activePeriode->id);
            }
        } else {
            $query->where('periode_akademik_id', $request->periode_akademik_id);
        }

        $pelanggaran = $query->latest()->paginate(10)->appends($request->query());
        $cabangs = Cabang::all();
        $periodeAkademiks = PeriodeAkademik::all();

        // Get active periode for default filter
        $activePeriode = PeriodeAkademik::where('status', 'Active')->first();

        return Inertia::render('Pelanggaran/Index', [
            'pelanggaran' => $pelanggaran,
            'cabangs' => $cabangs,
            'periodeAkademiks' => $periodeAkademiks,
            'activePeriodeId' => $activePeriode?->id,
            'filters' => $request->only(['cabang_id', 'departemen_id', 'kelas_id', 'periode_akademik_id', 'search'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $cabangs = Cabang::all();
        $poins = Poin::all();
        $periodeAkademik = PeriodeAkademik::where('status', 'Active')->first();

        return Inertia::render('Pelanggaran/Create', [
            'cabangs' => $cabangs,
            'poins' => $poins,
            'periodeAkademik' => $periodeAkademik
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kelas_id' => 'required|exists:kelas,id',
            'siswa_id' => 'required|exists:users,id',
            'poin_id' => 'required|exists:poin,id',
            'periode_akademik_id' => 'required|exists:periode_akademiks,id',
            'tanggal' => 'required|date',
            'deskripsi' => 'required|string',
            'tindak_lanjut' => 'nullable|string',
            'konsekuensi' => 'nullable|string',
        ]);

        // Add user_id (guru who input)
        $validated['user_id'] = auth()->id();

        Pelanggaran::create($validated);

        return redirect()->route('pelanggaran.index')
            ->with('success', 'Pelanggaran berhasil ditambahkan');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $pelanggaran = Pelanggaran::with(['kelas.cabang', 'kelas.departemen'])->findOrFail($id);
        $cabangs = Cabang::all();
        $poins = Poin::all();

        return Inertia::render('Pelanggaran/Edit', [
            'pelanggaran' => $pelanggaran,
            'cabangs' => $cabangs,
            'poins' => $poins
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $pelanggaran = Pelanggaran::findOrFail($id);

        $validated = $request->validate([
            'kelas_id' => 'required|exists:kelas,id',
            'siswa_id' => 'required|exists:users,id',
            'poin_id' => 'required|exists:poin,id',
            'periode_akademik_id' => 'required|exists:periode_akademiks,id',
            'tanggal' => 'required|date',
            'deskripsi' => 'required|string',
            'tindak_lanjut' => 'nullable|string',
            'konsekuensi' => 'nullable|string',
        ]);

        $pelanggaran->update($validated);

        return redirect()->route('pelanggaran.index')
            ->with('success', 'Pelanggaran berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $pelanggaran = Pelanggaran::findOrFail($id);
        $pelanggaran->delete();

        return redirect()->route('pelanggaran.index')
            ->with('success', 'Pelanggaran berhasil dihapus');
    }

    /**
     * Get siswa by kelas for cascading dropdown
     */
    public function getSiswaByKelas($kelas_id)
    {
        $siswa = User::where('kelas_id', $kelas_id)
            ->where('role', 'siswa')
            ->select('id', 'name', 'nisn')
            ->get();

        return response()->json($siswa);
    }
}
