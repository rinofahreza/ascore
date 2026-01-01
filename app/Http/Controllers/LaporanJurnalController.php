<?php

namespace App\Http\Controllers;

use App\Models\JurnalMengajar;
use App\Models\PeriodeAkademik;
use App\Models\SemesterAkademik;
use App\Models\MataPelajaran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class LaporanJurnalController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $isGuru = $user->role->nama === 'Guru';

        // Fetch all mapping data for dropdowns
        $allPeriodes = PeriodeAkademik::orderBy('nama', 'desc')->get();
        $allSemesters = SemesterAkademik::orderBy('nama', 'desc')->get();


        // Get filter inputs
        $selectedPeriodeId = $request->input('periode_id');
        $selectedSemesterId = $request->input('semester_id');

        $monthYear = $request->input('month_year');

        $jurnals = [];
        $hasFiltered = false;

        if ($isGuru && $monthYear && $selectedPeriodeId && $selectedSemesterId) {
            $hasFiltered = true;
            $date = Carbon::createFromFormat('Y-m', $monthYear);
            $month = $date->month;
            $year = $date->year;

            $query = JurnalMengajar::query()
                ->with(['mataPelajaran', 'kelas', 'cabang', 'departemen', 'periodeAkademik', 'semesterAkademik'])
                ->where('user_id', $user->id)
                ->where('periode_akademik_id', $selectedPeriodeId)
                ->where('semester_akademik_id', $selectedSemesterId)
                ->whereYear('tanggal', $year)
                ->whereMonth('tanggal', $month);



            if ($user->cabang_id) {
                $query->where('cabang_id', $user->cabang_id);
            }
            if ($user->departemen_id) {
                $query->where('departemen_id', $user->departemen_id);
            }

            $jurnals = $query->orderBy('tanggal', 'asc')
                ->orderBy('jam_mulai', 'asc')
                ->get();
        }

        return Inertia::render('Laporan/Jurnal/Index', [
            'jurnals' => $jurnals,
            'filters' => [
                'periode_id' => $selectedPeriodeId,
                'semester_id' => $selectedSemesterId,

                'month_year' => $monthYear,
            ],
            'lists' => [
                'periodes' => $allPeriodes,
                'semesters' => $allSemesters,

            ],
            'context' => [
                'cabang' => $user->cabang,
                'departemen' => $user->departemen,
            ],
            'hasFiltered' => $hasFiltered,
            'isGuru' => $isGuru,
        ]);
    }

    public function exportPdf(Request $request)
    {
        $user = auth()->user();

        if ($user->role->nama !== 'Guru') {
            abort(403, 'Unauthorized');
        }

        $selectedPeriodeId = $request->input('periode_id');
        $selectedSemesterId = $request->input('semester_id');

        $monthYear = $request->input('month_year');

        if (!$monthYear || !$selectedPeriodeId || !$selectedSemesterId) {
            return redirect()->back()->with('error', 'Filter tidak lengkap.');
        }

        $date = Carbon::createFromFormat('Y-m', $monthYear);
        $month = $date->month;
        $year = $date->year;

        $query = JurnalMengajar::query()
            ->with(['mataPelajaran', 'kelas', 'cabang', 'departemen', 'periodeAkademik', 'semesterAkademik', 'user.guru'])
            ->where('user_id', $user->id)
            ->where('periode_akademik_id', $selectedPeriodeId)
            ->where('semester_akademik_id', $selectedSemesterId)
            ->whereYear('tanggal', $year)
            ->whereMonth('tanggal', $month);



        if ($user->cabang_id) {
            $query->where('cabang_id', $user->cabang_id);
        }
        if ($user->departemen_id) {
            $query->where('departemen_id', $user->departemen_id);
        }

        $jurnals = $query->orderBy('tanggal', 'asc')
            ->orderBy('jam_mulai', 'asc')
            ->get();

        $periode = PeriodeAkademik::find($selectedPeriodeId);
        $semester = SemesterAkademik::find($selectedSemesterId);
        $mapel = null;
        $guru = $user->guru;

        $pdf = Pdf::loadView('pdf.laporan-jurnal', [
            'jurnals' => $jurnals,
            'user' => $user,
            'guru' => $guru,
            'periode' => $periode,
            'semester' => $semester,
            'mapel' => $mapel,
            'monthName' => $date->locale('id')->translatedFormat('F'),
            'year' => $year,
        ]);

        return $pdf->setPaper('a4', 'landscape')->download('laporan-jurnal.pdf');
    }
}

