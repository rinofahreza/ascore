<?php

namespace App\Http\Controllers;

use App\Models\Prestasi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class PrestasiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function __construct()
    {
        $this->middleware('can:prestasi.view')->only(['index']);
        $this->middleware('can:prestasi.create')->only(['create', 'store']);
        $this->middleware('can:prestasi.edit')->only(['edit', 'update', 'toggleStatus']);
        $this->middleware('can:prestasi.delete')->only(['destroy']);
    }

    public function index(Request $request)
    {
        $query = Prestasi::query();

        if ($request->has('search')) {
            $query->where('nama', 'like', '%' . $request->search . '%')
                ->orWhere('role', 'like', '%' . $request->search . '%')
                ->orWhere('prestasi', 'like', '%' . $request->search . '%');
        }

        $prestasis = $query->orderBy('urutan', 'asc')
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Prestasi/Index', [
            'prestasis' => $prestasis,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Prestasi/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'prestasi' => 'required|string',
            'penghargaan' => 'required|string',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'tanggal' => 'nullable|date',
            'urutan' => 'integer',
            'is_active' => 'boolean',
        ]);

        $data = $request->except('foto');

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('prestasis', 'public');
            $data['foto'] = '/storage/' . $path;
        }

        Prestasi::create($data);

        return redirect()->route('prestasi.index')->with('success', 'Data prestasi berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Prestasi $prestasi)
    {
        return Inertia::render('Prestasi/Edit', [
            'prestasi' => $prestasi
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Prestasi $prestasi)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'prestasi' => 'required|string',
            'penghargaan' => 'required|string',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'tanggal' => 'nullable|date',
            'urutan' => 'integer',
            'is_active' => 'boolean',
        ]);

        $data = $request->except('foto');

        if ($request->hasFile('foto')) {
            // Delete old photo if exists
            if ($prestasi->foto) {
                $oldPath = str_replace('/storage/', '', $prestasi->foto);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $path = $request->file('foto')->store('prestasis', 'public');
            $data['foto'] = '/storage/' . $path;
        }

        $prestasi->update($data);

        return redirect()->route('prestasi.index')->with('success', 'Data prestasi berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Prestasi $prestasi)
    {
        if ($prestasi->foto) {
            $oldPath = str_replace('/storage/', '', $prestasi->foto);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $prestasi->delete();

        return redirect()->route('prestasi.index')->with('success', 'Data prestasi berhasil dihapus.');
    }

    public function toggleStatus($id)
    {
        $prestasi = Prestasi::findOrFail($id);
        $prestasi->is_active = !$prestasi->is_active;
        $prestasi->save();

        return back()->with('success', 'Status updated successfully');
    }

    public function publicIndex()
    {
        $prestasis = Prestasi::where('is_active', true)
            ->orderBy('urutan', 'asc')
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return Inertia::render('Prestasi/PublicList', [
            'prestasis' => $prestasis
        ]);
    }
}
