<?php

namespace App\Http\Controllers;

use App\Models\Berkas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BerkasController extends Controller
{
    /**
     * Display a listing of the user's berkas.
     */
    public function index()
    {
        $berkas = Berkas::where('user_id', auth()->id())
            ->latest()
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'nama_file' => $item->nama_file,
                    'jenis_file' => $item->jenis_file,
                    'ukuran' => $item->ukuran,
                    'ukuran_format' => $item->ukuran_format,
                    'icon' => $item->icon,
                    'created_at' => $item->created_at->format('d M Y H:i'),
                    'created_at_diff' => $item->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Berkas/Index', [
            'berkas' => $berkas,
        ]);
    }

    /**
     * Store a newly uploaded berkas.
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,pdf|max:2048', // 2MB max
            'custom_filename' => 'nullable|string|max:255',
        ], [
            'file.required' => 'File harus dipilih',
            'file.mimes' => 'File harus berupa gambar (JPG, JPEG, PNG, GIF) atau PDF',
            'file.max' => 'Ukuran file maksimal 2MB',
        ]);

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $size = $file->getSize();

        // Use custom filename if provided, otherwise use original filename
        $customFilename = $request->input('custom_filename');
        if ($customFilename) {
            // Clean filename: remove special characters except dash and underscore
            $cleanFilename = preg_replace('/[^A-Za-z0-9_\-\s]/', '', $customFilename);
            $cleanFilename = trim($cleanFilename);
            $originalName = $cleanFilename . '.' . $extension;
        } else {
            $originalName = $file->getClientOriginalName();
        }

        // Generate unique filename for storage
        $storedName = time() . '_' . uniqid() . '.' . $extension;

        // Store file in storage/app/public/berkas
        $path = $file->storeAs('berkas', $storedName, 'public');

        // Save to database
        Berkas::create([
            'user_id' => auth()->id(),
            'nama_file' => $originalName,
            'nama_tersimpan' => $storedName,
            'jenis_file' => $extension,
            'ukuran' => $size,
            'path' => $path,
        ]);

        return redirect()->back()->with('success', 'File berhasil diupload');
    }

    /**
     * Download the specified berkas.
     */
    public function download($id)
    {
        $berkas = Berkas::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $filePath = storage_path('app/public/' . $berkas->path);

        if (!file_exists($filePath)) {
            return redirect()->back()->with('error', 'File tidak ditemukan');
        }

        return response()->download($filePath, $berkas->nama_file);
    }

    /**
     * Remove the specified berkas.
     */
    public function destroy($id)
    {
        $berkas = Berkas::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        // Delete file from storage
        if (Storage::disk('public')->exists($berkas->path)) {
            Storage::disk('public')->delete($berkas->path);
        }

        // Delete from database
        $berkas->delete();

        return redirect()->back()->with('success', 'File berhasil dihapus');
    }
}
