<?php

namespace App\Http\Controllers;

use App\Models\JadwalPelajaran;
use App\Models\Cabang;
use App\Models\Kelas;
use App\Models\MataPelajaran;
use App\Models\JamPelajaran;
use App\Models\Guru;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class JadwalPelajaranController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:jadwal_pelajaran.view')->only(['index']);
        $this->middleware('can:jadwal_pelajaran.create')->only(['create', 'store']);
        $this->middleware('can:jadwal_pelajaran.edit')->only(['edit', 'update']);
        $this->middleware('can:jadwal_pelajaran.delete')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Get active periode for default filter
        $activePeriode = \App\Models\PeriodeAkademik::where('status', 'Active')->first();

        // Check if any filter is applied
        $hasFilters = $request->filled('cabang_id') ||
            $request->filled('departemen_id') ||
            $request->filled('hari') ||
            $request->filled('kelas_id') ||
            $request->filled('mata_pelajaran_id') ||
            $request->filled('guru_id');

        // Only fetch data if filters are applied
        if ($hasFilters) {
            $query = JadwalPelajaran::with([
                'cabang',
                'departemen',
                'kelas',
                'mataPelajaran',
                'jamPelajaran',
                'guru.user',
                'periodeAkademik'
            ]);

            // Apply periode filter (default to active)
            $periodeFilter = $request->input('periode_akademik_id');
            if ($periodeFilter === null || $periodeFilter === '') {
                $periodeFilter = $activePeriode ? $activePeriode->id : null;
            }
            if ($periodeFilter) {
                $query->where('periode_akademik_id', $periodeFilter);
            }

            // Apply other filters
            if ($request->filled('cabang_id')) {
                $query->where('cabang_id', $request->cabang_id);
            }
            if ($request->filled('departemen_id')) {
                $query->where('departemen_id', $request->departemen_id);
            }
            if ($request->filled('hari')) {
                $query->where('hari', $request->hari);
            }
            if ($request->filled('kelas_id')) {
                $query->where('kelas_id', $request->kelas_id);
            }
            if ($request->filled('mata_pelajaran_id')) {
                $query->where('mata_pelajaran_id', $request->mata_pelajaran_id);
            }
            if ($request->filled('guru_id')) {
                $query->where('guru_id', $request->guru_id);
            }

            $jadwals = $query->latest()->paginate(10)->appends($request->query());
        } else {
            // Return empty paginated result
            $jadwals = new \Illuminate\Pagination\LengthAwarePaginator(
                [],
                0,
                10,
                1,
                ['path' => $request->url(), 'query' => $request->query()]
            );
        }

        $cabangs = Cabang::all();
        $periodeAkademiks = \App\Models\PeriodeAkademik::all();
        $jamPelajarans = JamPelajaran::all();

        // Get periode filter for response
        $periodeFilter = $request->input('periode_akademik_id');
        if ($periodeFilter === null || $periodeFilter === '') {
            $periodeFilter = $activePeriode ? $activePeriode->id : null;
        }

        return Inertia::render('JadwalPelajaran/Index', [
            'jadwals' => $jadwals,
            'cabangs' => $cabangs,
            'periodeAkademiks' => $periodeAkademiks,
            'activePeriode' => $activePeriode,
            'jamPelajarans' => $jamPelajarans,
            'filters' => [
                'periode_akademik_id' => $periodeFilter,
                'cabang_id' => $request->cabang_id,
                'departemen_id' => $request->departemen_id,
                'hari' => $request->hari,
                'kelas_id' => $request->kelas_id,
                'mata_pelajaran_id' => $request->mata_pelajaran_id,
                'guru_id' => $request->guru_id
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $cabangs = Cabang::all();
        $jamPelajarans = JamPelajaran::all();
        $periodeAkademiks = \App\Models\PeriodeAkademik::all();
        $activePeriode = \App\Models\PeriodeAkademik::where('status', 'Active')->first();

        return Inertia::render('JadwalPelajaran/Create', [
            'cabangs' => $cabangs,
            'jamPelajarans' => $jamPelajarans,
            'hariOptions' => ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
            'periodeAkademiks' => $periodeAkademiks,
            'activePeriode' => $activePeriode
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'periode_akademik_id' => 'required|exists:periode_akademiks,id',
            'cabang_id' => 'required|exists:cabangs,id',
            'departemen_id' => 'required|exists:departemens,id',
            'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat',
            'kelas_id' => 'required|exists:kelas,id',
            'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
            'jam_pelajaran_id' => 'required|exists:jam_pelajarans,id',
            'guru_id' => 'required|exists:gurus,id',
        ]);

        JadwalPelajaran::create($validated);

        return redirect()->route('jadwal-pelajaran.index')
            ->with('success', 'Jadwal pelajaran berhasil ditambahkan');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $jadwal = JadwalPelajaran::with(['cabang', 'departemen', 'kelas', 'mataPelajaran', 'jamPelajaran', 'guru'])->findOrFail($id);
        $cabangs = Cabang::all();
        $jamPelajarans = JamPelajaran::all();
        $periodeAkademiks = \App\Models\PeriodeAkademik::all();

        return Inertia::render('JadwalPelajaran/Edit', [
            'jadwal' => $jadwal,
            'cabangs' => $cabangs,
            'jamPelajarans' => $jamPelajarans,
            'hariOptions' => ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
            'periodeAkademiks' => $periodeAkademiks
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $jadwal = JadwalPelajaran::findOrFail($id);

        $validated = $request->validate([
            'periode_akademik_id' => 'required|exists:periode_akademiks,id',
            'cabang_id' => 'required|exists:cabangs,id',
            'departemen_id' => 'required|exists:departemens,id',
            'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat',
            'kelas_id' => 'required|exists:kelas,id',
            'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
            'jam_pelajaran_id' => 'required|exists:jam_pelajarans,id',
            'guru_id' => 'required|exists:gurus,id',
        ]);

        $jadwal->update($validated);

        return redirect()->route('jadwal-pelajaran.index')
            ->with('success', 'Jadwal pelajaran berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $jadwal = JadwalPelajaran::findOrFail($id);
        $jadwal->delete();

        return redirect()->route('jadwal-pelajaran.index')
            ->with('success', 'Jadwal pelajaran berhasil dihapus');
    }

    /**
     * Get kelas by departemen for cascading dropdown.
     */
    public function getKelasByDepartemen(Request $request)
    {
        $kelas = Kelas::where('departemen_id', $request->departemen_id)
            ->get(['id', 'nama']);

        return response()->json($kelas);
    }

    /**
     * Get mata pelajaran by departemen for cascading dropdown.
     */
    public function getMataPelajaranByDepartemen(Request $request)
    {
        $mataPelajarans = MataPelajaran::where('departemen_id', $request->departemen_id)
            ->get(['id', 'nama']);

        return response()->json($mataPelajarans);
    }

    /**
     * Get guru by departemen for cascading dropdown.
     */
    public function getGuruByDepartemen(Request $request)
    {
        $gurus = Guru::with('user')
            ->whereHas('user', function ($q) use ($request) {
                $q->where('departemen_id', $request->departemen_id);
            })
            ->get()
            ->map(function ($guru) {
                return [
                    'id' => $guru->id,
                    'name' => $guru->user->name ?? '-'
                ];
            });

        return response()->json($gurus);
    }

    /**
     * Batch save: create, update, and delete multiple records at once.
     */
    public function batchSave(Request $request)
    {
        \DB::beginTransaction();

        try {
            $created = 0;
            $updated = 0;
            $deleted = 0;

            // Create new records
            if ($request->has('new') && is_array($request->new)) {
                if (!Gate::allows('jadwal_pelajaran.create')) {
                    abort(403, 'Unauthorized action.');
                }
                foreach ($request->new as $data) {
                    $validated = validator($data, [
                        'periode_akademik_id' => 'required|exists:periode_akademiks,id',
                        'cabang_id' => 'required|exists:cabangs,id',
                        'departemen_id' => 'nullable|exists:departemens,id',
                        'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat',
                        'kelas_id' => 'required|exists:kelas,id',
                        'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
                        'jam_pelajaran_id' => 'required|exists:jam_pelajarans,id',
                        'guru_id' => 'required|exists:gurus,id',
                    ])->validate();

                    JadwalPelajaran::create($validated);
                    $created++;
                }
            }

            // Update edited records
            if ($request->has('edited') && is_array($request->edited)) {
                if (!Gate::allows('jadwal_pelajaran.edit')) {
                    abort(403, 'Unauthorized action.');
                }
                foreach ($request->edited as $data) {
                    if (isset($data['id'])) {
                        $validated = validator($data, [
                            'periode_akademik_id' => 'required|exists:periode_akademiks,id',
                            'cabang_id' => 'required|exists:cabangs,id',
                            'departemen_id' => 'nullable|exists:departemens,id',
                            'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat',
                            'kelas_id' => 'required|exists:kelas,id',
                            'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
                            'jam_pelajaran_id' => 'required|exists:jam_pelajarans,id',
                            'guru_id' => 'required|exists:gurus,id',
                        ])->validate();

                        $jadwal = JadwalPelajaran::find($data['id']);
                        if ($jadwal) {
                            $jadwal->update($validated);
                            $updated++;
                        }
                    }
                }
            }

            // Delete marked records
            if ($request->has('deleted') && is_array($request->deleted)) {
                if (!Gate::allows('jadwal_pelajaran.delete')) {
                    abort(403, 'Unauthorized action.');
                }
                $deleted = JadwalPelajaran::whereIn('id', $request->deleted)->delete();
            }

            \DB::commit();

            $message = "Berhasil menyimpan perubahan";
            if ($created > 0)
                $message .= " ($created data baru";
            if ($updated > 0)
                $message .= ($created > 0 ? ", " : " (") . "$updated data diubah";
            if ($deleted > 0)
                $message .= (($created > 0 || $updated > 0) ? ", " : " (") . "$deleted data dihapus";
            if ($created > 0 || $updated > 0 || $deleted > 0)
                $message .= ")";

            return redirect()->back()->with('success', $message);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \DB::rollback();
            return redirect()->back()->withErrors($e->errors())->with('error', 'Validasi gagal, periksa kembali data Anda');
        } catch (\Exception $e) {
            \DB::rollback();
            return redirect()->back()->with('error', 'Gagal menyimpan perubahan: ' . $e->getMessage());
        }
    }
}

