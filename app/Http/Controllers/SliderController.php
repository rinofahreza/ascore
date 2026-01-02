<?php

namespace App\Http\Controllers;

use App\Models\Slider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SliderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sliders = Slider::orderBy('urutan')->get();
        return Inertia::render('Settings/Sliders/Index', [
            'sliders' => $sliders
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'gambar' => 'required|image|max:2048',
            'judul' => 'nullable|string|max:255',
        ]);

        $path = $request->file('gambar')->store('sliders', 'public');

        Slider::create([
            'judul' => $request->judul,
            'gambar' => $path,
            'urutan' => Slider::count() + 1,
            'status' => true,
        ]);

        return redirect()->back()->with('success', 'Slider berhasil ditambahkan');
    }

    public function update(Request $request, Slider $slider)
    {
        $request->validate([
            'judul' => 'nullable|string|max:255',
            'urutan' => 'integer',
            'status' => 'boolean',
        ]);

        $slider->update($request->only(['judul', 'urutan', 'status']));

        return redirect()->back()->with('success', 'Slider berhasil diperbarui');
    }

    public function destroy(Slider $slider)
    {
        if ($slider->gambar && Storage::disk('public')->exists($slider->gambar)) {
            Storage::disk('public')->delete($slider->gambar);
        }

        $slider->delete();

        return redirect()->back()->with('success', 'Slider berhasil dihapus');
    }
}
