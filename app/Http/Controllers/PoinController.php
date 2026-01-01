<?php

namespace App\Http\Controllers;

use App\Models\Poin;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PoinController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:poin.view')->only(['index']);
        $this->middleware('can:poin.create')->only(['create', 'store']);
        $this->middleware('can:poin.edit')->only(['edit', 'update']);
        $this->middleware('can:poin.delete')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $poin = Poin::latest()->paginate(10);

        return Inertia::render('Poin/Index', [
            'poin' => $poin
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Poin/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kategori' => 'required|in:Ringan,Sedang,Berat',
        ]);

        Poin::create($validated);

        return redirect()->route('poin.index')
            ->with('success', 'Poin berhasil ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(Poin $poin)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Poin $poin)
    {
        return Inertia::render('Poin/Edit', [
            'poin' => $poin
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Poin $poin)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kategori' => 'required|in:Ringan,Sedang,Berat',
        ]);

        $poin->update($validated);

        return redirect()->route('poin.index')
            ->with('success', 'Poin berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Poin $poin)
    {
        $poin->delete();

        return redirect()->route('poin.index')
            ->with('success', 'Poin berhasil dihapus');
    }
}
