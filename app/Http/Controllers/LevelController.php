<?php

namespace App\Http\Controllers;

use App\Models\Level;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LevelController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:kelas.view')->only(['index']);
        $this->middleware('can:kelas.create')->only(['create', 'store']);
        $this->middleware('can:kelas.edit')->only(['edit', 'update']);
        $this->middleware('can:kelas.delete')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $levels = Level::latest()->paginate(10);

        return Inertia::render('Level/Index', [
            'levels' => $levels
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Level/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
        ]);

        Level::create($validated);

        return redirect()->route('level.index')
            ->with('success', 'Level berhasil ditambahkan');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $level = Level::findOrFail($id);

        return Inertia::render('Level/Edit', [
            'level' => $level
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $level = Level::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
        ]);

        $level->update($validated);

        return redirect()->route('level.index')
            ->with('success', 'Level berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $level = Level::findOrFail($id);
        $level->delete();

        return redirect()->route('level.index')
            ->with('success', 'Level berhasil dihapus');
    }
}
