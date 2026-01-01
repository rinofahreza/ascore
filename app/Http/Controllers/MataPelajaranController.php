<?php

namespace App\Http\Controllers;

use App\Models\MataPelajaran;
use App\Models\Cabang;
use App\Models\Departemen;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MataPelajaranController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:mata_pelajaran.view')->only(['index']);
        $this->middleware('can:mata_pelajaran.create')->only(['create', 'store']);
        $this->middleware('can:mata_pelajaran.edit')->only(['edit', 'update']);
        $this->middleware('can:mata_pelajaran.delete')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = MataPelajaran::with(['cabang', 'departemen']);

        // Apply filters
        if ($request->filled('cabang_id')) {
            $query->where('cabang_id', $request->cabang_id);
        }

        if ($request->filled('departemen_id')) {
            $query->where('departemen_id', $request->departemen_id);
        }

        $mataPelajarans = $query->latest()->paginate(10)->appends($request->query());

        $cabangs = Cabang::all();

        return Inertia::render('MataPelajaran/Index', [
            'mataPelajarans' => $mataPelajarans,
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

        return Inertia::render('MataPelajaran/Create', [
            'cabangs' => $cabangs
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'cabang_id' => 'required|exists:cabangs,id',
            'departemen_id' => 'nullable|exists:departemens,id',
        ]);

        MataPelajaran::create($validated);

        return redirect()->route('mata-pelajaran.index')
            ->with('success', 'Mata Pelajaran berhasil ditambahkan');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $mataPelajaran = MataPelajaran::findOrFail($id);
        $cabangs = Cabang::all();

        return Inertia::render('MataPelajaran/Edit', [
            'mataPelajaran' => [
                'id' => $mataPelajaran->id,
                'nama' => $mataPelajaran->nama,
                'cabang_id' => $mataPelajaran->cabang_id,
                'departemen_id' => $mataPelajaran->departemen_id,
            ],
            'cabangs' => $cabangs
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $mataPelajaran = MataPelajaran::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'cabang_id' => 'required|exists:cabangs,id',
            'departemen_id' => 'nullable|exists:departemens,id',
        ]);

        $mataPelajaran->update($validated);

        return redirect()->route('mata-pelajaran.index')
            ->with('success', 'Mata Pelajaran berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $mataPelajaran = MataPelajaran::findOrFail($id);
        $mataPelajaran->delete();

        return redirect()->route('mata-pelajaran.index')
            ->with('success', 'Mata Pelajaran berhasil dihapus');
    }

    /**
     * Get departemen by cabang_id (API endpoint for dynamic dropdown)
     */
    public function getDepartemenByCabang($cabangId)
    {
        $departemens = Departemen::where('cabang_id', $cabangId)
            ->where('status', true)
            ->get(['id', 'nama']);

        return response()->json($departemens);
    }
}
