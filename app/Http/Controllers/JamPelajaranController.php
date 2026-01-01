<?php

namespace App\Http\Controllers;

use App\Models\JamPelajaran;
use App\Models\Cabang;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JamPelajaranController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:jam_pelajaran.view')->only(['index']);
        $this->middleware('can:jam_pelajaran.create')->only(['create', 'store']);
        $this->middleware('can:jam_pelajaran.edit')->only(['edit', 'update']);
        $this->middleware('can:jam_pelajaran.delete')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Get active periode
        $activePeriode = \App\Models\PeriodeAkademik::where('status', 'Active')->first();

        // Check if any filters are applied (excluding periode_akademik_id)
        $hasFilters = $request->filled(['hari', 'cabang_id', 'departemen_id']);

        if (!$hasFilters) {
            // Return empty data if no filters applied
            $jamPelajarans = new \Illuminate\Pagination\LengthAwarePaginator(
                [], // empty items
                0,  // total
                10, // per page
                1   // current page
            );
        } else {
            // Build query with filters
            $query = JamPelajaran::with(['periodeAkademik', 'cabang', 'departemen']);

            // Apply filters
            if ($request->filled('hari')) {
                $query->where('hari', $request->hari);
            }

            if ($request->filled('cabang_id')) {
                $query->where('cabang_id', $request->cabang_id);
            }

            if ($request->filled('departemen_id')) {
                $query->where('departemen_id', $request->departemen_id);
            }

            $jamPelajarans = $query->oldest()->paginate(10)->appends($request->query());
        }

        $cabangs = Cabang::all();
        $periodeAkademiks = \App\Models\PeriodeAkademik::all();

        return Inertia::render('JamPelajaran/Index', [
            'jamPelajarans' => $jamPelajarans,
            'cabangs' => $cabangs,
            'periodeAkademiks' => $periodeAkademiks,
            'activePeriode' => $activePeriode,
            'filters' => $request->only(['hari', 'cabang_id', 'departemen_id'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $cabangs = Cabang::all();
        $periodeAkademiks = \App\Models\PeriodeAkademik::all();
        $activePeriode = \App\Models\PeriodeAkademik::where('status', 'Active')->first();

        return Inertia::render('JamPelajaran/Create', [
            'cabangs' => $cabangs,
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
            'departemen_id' => 'nullable|exists:departemens,id',
            'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
            'nama' => 'required|string|max:255',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
        ]);

        JamPelajaran::create($validated);

        return redirect()->route('jam-pelajaran.index')
            ->with('success', 'Jam Pelajaran berhasil ditambahkan');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $jamPelajaran = JamPelajaran::findOrFail($id);
        $cabangs = Cabang::all();
        $periodeAkademiks = \App\Models\PeriodeAkademik::all();

        return Inertia::render('JamPelajaran/Edit', [
            'jamPelajaran' => [
                'id' => $jamPelajaran->id,
                'periode_akademik_id' => $jamPelajaran->periode_akademik_id,
                'hari' => $jamPelajaran->hari,
                'nama' => $jamPelajaran->nama,
                'jam_mulai' => $jamPelajaran->jam_mulai,
                'jam_selesai' => $jamPelajaran->jam_selesai,
                'cabang_id' => $jamPelajaran->cabang_id,
                'departemen_id' => $jamPelajaran->departemen_id,
            ],
            'cabangs' => $cabangs,
            'periodeAkademiks' => $periodeAkademiks
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $jamPelajaran = JamPelajaran::findOrFail($id);

        $validated = $request->validate([
            'periode_akademik_id' => 'required|exists:periode_akademiks,id',
            'cabang_id' => 'required|exists:cabangs,id',
            'departemen_id' => 'nullable|exists:departemens,id',
            'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
            'nama' => 'required|string|max:255',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
        ]);

        $jamPelajaran->update($validated);

        return redirect()->route('jam-pelajaran.index')
            ->with('success', 'Jam Pelajaran berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $jamPelajaran = JamPelajaran::findOrFail($id);
        $jamPelajaran->delete();

        return redirect()->route('jam-pelajaran.index')
            ->with('success', 'Jam Pelajaran berhasil dihapus');
    }

    /**
     * Batch save (create, update, delete) jam pelajaran records.
     */
    public function batchSave(Request $request)
    {
        \DB::beginTransaction();

        try {
            $created = 0;
            $updated = 0;
            $deleted = 0;

            // Process new records
            if ($request->has('new') && is_array($request->new)) {
                \Illuminate\Support\Facades\Gate::authorize('jam_pelajaran.create');
                foreach ($request->new as $newRecord) {
                    $validated = \Validator::make($newRecord, [
                        'periode_akademik_id' => 'required|exists:periode_akademiks,id',
                        'cabang_id' => 'required|exists:cabangs,id',
                        'departemen_id' => 'nullable|exists:departemens,id',
                        'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
                        'nama' => 'required|string|max:255',
                        'jam_mulai' => 'required|date_format:H:i:s',
                        'jam_selesai' => 'required|date_format:H:i:s|after:jam_mulai',
                    ])->validate();

                    JamPelajaran::create($validated);
                    $created++;
                }
            }

            // Process updates
            if ($request->has('edited') && is_array($request->edited)) {
                \Illuminate\Support\Facades\Gate::authorize('jam_pelajaran.edit');
                foreach ($request->edited as $id => $editedRecord) {
                    $jamPelajaran = JamPelajaran::findOrFail($id);

                    $validated = \Validator::make($editedRecord, [
                        'periode_akademik_id' => 'required|exists:periode_akademiks,id',
                        'cabang_id' => 'required|exists:cabangs,id',
                        'departemen_id' => 'nullable|exists:departemens,id',
                        'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
                        'nama' => 'required|string|max:255',
                        'jam_mulai' => 'required|date_format:H:i:s',
                        'jam_selesai' => 'required|date_format:H:i:s|after:jam_mulai',
                    ])->validate();

                    $jamPelajaran->update($validated);
                    $updated++;
                }
            }

            // Process deletions
            if ($request->has('deleted') && is_array($request->deleted)) {
                \Illuminate\Support\Facades\Gate::authorize('jam_pelajaran.delete');
                JamPelajaran::whereIn('id', $request->deleted)->delete();
                $deleted = count($request->deleted);
            }

            \DB::commit();

            return redirect()->route('jam-pelajaran.index')
                ->with('success', "Berhasil menyimpan perubahan: $created baru, $updated diupdate, $deleted dihapus");

        } catch (\Exception $e) {
            \DB::rollBack();
            return redirect()->back()
                ->with('error', 'Gagal menyimpan perubahan: ' . $e->getMessage());
        }
    }

    /**
     * Get departemen by cabang (API endpoint for cascading dropdown)
     */
    public function getDepartemenByCabang($cabang_id)
    {
        $departemens = \App\Models\Departemen::where('cabang_id', $cabang_id)
            ->get(['id', 'nama']);

        return response()->json($departemens);
    }
}
