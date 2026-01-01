<?php

namespace App\Http\Controllers;

use App\Models\SemesterAkademik;
use App\Models\PeriodeAkademik;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SemesterAkademikController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:periode_akademik.view')->only(['index']);
        $this->middleware('can:periode_akademik.create')->only(['create', 'store']);
        $this->middleware('can:periode_akademik.edit')->only(['edit', 'update', 'toggleAktif']);
        $this->middleware('can:periode_akademik.delete')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $semesters = SemesterAkademik::with('periodeAkademik')->latest()->paginate(10);

        return Inertia::render('SemesterAkademik/Index', [
            'semesters' => $semesters
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $periodeAkademiks = PeriodeAkademik::all();

        return Inertia::render('SemesterAkademik/Create', [
            'periodeAkademiks' => $periodeAkademiks
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'periode_akademik_id' => 'required|exists:periode_akademiks,id',
            'nama' => 'required|in:Ganjil,Genap',
            'kode' => 'required|in:1,2',
        ]);

        // is_aktif defaults to false (from migration)
        SemesterAkademik::create($validated);

        return redirect()->route('semester-akademik.index')
            ->with('success', 'Semester akademik berhasil ditambahkan');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $semester = SemesterAkademik::findOrFail($id);
        $periodeAkademiks = PeriodeAkademik::all();

        return Inertia::render('SemesterAkademik/Edit', [
            'semester' => $semester,
            'periodeAkademiks' => $periodeAkademiks
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $semester = SemesterAkademik::findOrFail($id);

        $validated = $request->validate([
            'periode_akademik_id' => 'required|exists:periode_akademiks,id',
            'nama' => 'required|in:Ganjil,Genap',
            'kode' => 'required|in:1,2',
        ]);

        $semester->update($validated);

        return redirect()->route('semester-akademik.index')
            ->with('success', 'Semester akademik berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $semester = SemesterAkademik::findOrFail($id);
        $semester->delete();

        return redirect()->route('semester-akademik.index')
            ->with('success', 'Semester akademik berhasil dihapus');
    }

    /**
     * Toggle is_aktif status
     * Only one semester can be active at a time
     */
    public function toggleAktif($id)
    {
        $semester = SemesterAkademik::findOrFail($id);

        if (!$semester->is_aktif) {
            // Deactivate all others first
            SemesterAkademik::where('id', '!=', $id)->update(['is_aktif' => false]);
            // Then activate this one
            $semester->update(['is_aktif' => true]);
        } else {
            // Just deactivate this one
            $semester->update(['is_aktif' => false]);
        }

        return redirect()->route('semester-akademik.index')
            ->with('success', 'Status semester berhasil diupdate');
    }
}
