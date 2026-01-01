<?php

namespace App\Http\Controllers;

use App\Models\KalenderAkademik;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class KalenderAkademikController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if ($request->route()->getActionMethod() === 'index') {
                Gate::authorize('view', KalenderAkademik::class);
            }
            return $next($request);
        })->only('index');
    }

    public function index()
    {
        // Custom gate check for view since we don't have a model instance yet and policy might strict
        // Using "kalender.view" permission check via "can" or similar logic usually preferred
        // But let's assume standard policy mapping or simple permission check
        if (!auth()->user()->can('kalender.view')) {
            abort(403);
        }

        $events = KalenderAkademik::orderBy('tanggal')->get()->map(function ($event) {
            return [
                'id' => $event->id,
                'date' => $event->tanggal->day,
                'month' => $event->tanggal->month - 1, // JS months are 0-indexed
                'year' => $event->tanggal->year,
                'title' => $event->judul,
                'type' => $event->tipe,
                'color' => $event->warna,
                'description' => $event->keterangan,
                'full_date' => $event->tanggal->format('Y-m-d'),
            ];
        });

        return Inertia::render('KalenderAkademik/Index', [
            'events' => $events,
            'can' => [
                'create' => auth()->user()->can('kalender.create'),
                'edit' => auth()->user()->can('kalender.edit'),
                'delete' => auth()->user()->can('kalender.delete'),
            ]
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->can('kalender.create')) {
            abort(403);
        }

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'judul' => 'required|string|max:255',
            'tipe' => 'required|string',
            'warna' => 'nullable|string',
            'keterangan' => 'nullable|string',
        ]);

        KalenderAkademik::create($validated);

        return redirect()->back()->with('success', 'Event berhasil ditambahkan.');
    }

    public function update(Request $request, KalenderAkademik $kalenderAkademik)
    {
        if (!auth()->user()->can('kalender.edit')) {
            abort(403);
        }

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'judul' => 'required|string|max:255',
            'tipe' => 'required|string',
            'warna' => 'nullable|string',
            'keterangan' => 'nullable|string',
        ]);

        $kalenderAkademik->update($validated);

        return redirect()->back()->with('success', 'Event berhasil diperbarui.');
    }

    public function destroy(KalenderAkademik $kalenderAkademik)
    {
        if (!auth()->user()->can('kalender.delete')) {
            abort(403);
        }

        $kalenderAkademik->delete();

        return redirect()->back()->with('success', 'Event berhasil dihapus.');
    }
}
