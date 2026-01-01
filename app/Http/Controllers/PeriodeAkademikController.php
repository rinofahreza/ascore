<?php

namespace App\Http\Controllers;

use App\Models\PeriodeAkademik;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PeriodeAkademikController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:periode_akademik.view')->only(['index']);
        $this->middleware('can:periode_akademik.create')->only(['create', 'store']);
        $this->middleware('can:periode_akademik.edit')->only(['edit', 'update', 'toggleStatus']);
        $this->middleware('can:periode_akademik.delete')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $periodeAkademiks = PeriodeAkademik::latest()->paginate(10);

        return Inertia::render('PeriodeAkademik/Index', [
            'periodeAkademiks' => $periodeAkademiks
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('PeriodeAkademik/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'status' => 'required|in:Active,Draft,Inactive',
        ]);

        // If status is Active, deactivate all other periods
        if ($validated['status'] === 'Active') {
            DB::transaction(function () use ($validated) {
                PeriodeAkademik::where('status', 'Active')->update(['status' => 'Inactive']);
                PeriodeAkademik::create($validated);
            });
        } else {
            PeriodeAkademik::create($validated);
        }

        return redirect()->route('periode-akademik.index')
            ->with('success', 'Periode Akademik berhasil ditambahkan');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $periodeAkademik = PeriodeAkademik::findOrFail($id);

        return Inertia::render('PeriodeAkademik/Edit', [
            'periodeAkademik' => [
                'id' => $periodeAkademik->id,
                'nama' => $periodeAkademik->nama,
                'status' => $periodeAkademik->status,
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $periodeAkademik = PeriodeAkademik::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'status' => 'required|in:Active,Draft,Inactive',
        ]);

        // If status is Active, deactivate all other periods
        if ($validated['status'] === 'Active') {
            DB::transaction(function () use ($periodeAkademik, $validated) {
                PeriodeAkademik::where('id', '!=', $periodeAkademik->id)
                    ->where('status', 'Active')
                    ->update(['status' => 'Inactive']);
                $periodeAkademik->update($validated);
            });
        } else {
            $periodeAkademik->update($validated);
        }

        return redirect()->route('periode-akademik.index')
            ->with('success', 'Periode Akademik berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $periodeAkademik = PeriodeAkademik::findOrFail($id);
        $periodeAkademik->delete();

        return redirect()->route('periode-akademik.index')
            ->with('success', 'Periode akademik berhasil dihapus');
    }

    /**
     * Toggle status between Active and Inactive
     * Only one periode can be Active at a time
     */
    public function toggleStatus($id)
    {
        $periode = PeriodeAkademik::findOrFail($id);

        if ($periode->status !== 'Active') {
            // Deactivate all others first
            DB::transaction(function () use ($id, $periode) {
                PeriodeAkademik::where('id', '!=', $id)
                    ->where('status', 'Active')
                    ->update(['status' => 'Inactive']);
                // Then activate this one
                $periode->update(['status' => 'Active']);
            });
        } else {
            // Just deactivate this one
            $periode->update(['status' => 'Inactive']);
        }

        return redirect()->route('periode-akademik.index')
            ->with('success', 'Status periode akademik berhasil diupdate');
    }
}
