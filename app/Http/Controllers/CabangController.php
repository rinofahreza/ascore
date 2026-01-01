<?php

namespace App\Http\Controllers;

use App\Models\Cabang;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CabangController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:cabang.view')->only(['index']);
        $this->middleware('can:cabang.create')->only(['create', 'store']);
        $this->middleware('can:cabang.edit')->only(['edit', 'update']);
        $this->middleware('can:cabang.delete')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cabangs = Cabang::latest()->get();

        return Inertia::render('Cabang/Index', [
            'cabangs' => $cabangs
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Cabang/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:0',
        ]);

        Cabang::create($validated);

        return redirect()->route('cabang.index')
            ->with('success', 'Cabang berhasil ditambahkan');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Cabang $cabang)
    {
        return Inertia::render('Cabang/Edit', [
            'cabang' => $cabang
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Cabang $cabang)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:0',
        ]);

        $cabang->update($validated);

        return redirect()->route('cabang.index')
            ->with('success', 'Cabang berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cabang $cabang)
    {
        $cabang->delete();

        return redirect()->route('cabang.index')
            ->with('success', 'Cabang berhasil dihapus');
    }
}
