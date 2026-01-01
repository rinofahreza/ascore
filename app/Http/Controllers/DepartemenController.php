<?php

namespace App\Http\Controllers;

use App\Models\Departemen;
use App\Models\Cabang;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartemenController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:departemen.view')->only(['index']);
        $this->middleware('can:departemen.create')->only(['create', 'store']);
        $this->middleware('can:departemen.edit')->only(['edit', 'update', 'toggleStatus']);
        $this->middleware('can:departemen.delete')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $departemens = Departemen::with('cabang')
            ->latest()
            ->paginate(10);

        return Inertia::render('Departemen/Index', [
            'departemens' => $departemens
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $cabangs = Cabang::all();

        return Inertia::render('Departemen/Create', [
            'cabangs' => $cabangs
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cabang_id' => 'required|exists:cabangs,id',
            'nama' => 'required|string|max:255',
        ]);

        // Status defaults to true (active)
        $validated['status'] = true;

        Departemen::create($validated);

        return redirect()->route('departemen.index')
            ->with('success', 'Departemen berhasil ditambahkan');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $departemen = Departemen::findOrFail($id);
        $cabangs = Cabang::all();

        return Inertia::render('Departemen/Edit', [
            'departemen' => [
                'id' => $departemen->id,
                'cabang_id' => $departemen->cabang_id,
                'nama' => $departemen->nama,
                'status' => $departemen->status,
            ],
            'cabangs' => $cabangs
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $departemen = Departemen::findOrFail($id);

        $validated = $request->validate([
            'cabang_id' => 'required|exists:cabangs,id',
            'nama' => 'required|string|max:255',
        ]);

        $departemen->update($validated);

        return redirect()->route('departemen.index')
            ->with('success', 'Departemen berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $departemen = Departemen::findOrFail($id);
        $departemen->delete();

        return redirect()->route('departemen.index')
            ->with('success', 'Departemen berhasil dihapus');
    }

    /**
     * Toggle status of the departemen
     */
    public function toggleStatus($id)
    {
        $departemen = Departemen::findOrFail($id);
        $departemen->update([
            'status' => !$departemen->status
        ]);

        return back();
    }
}
