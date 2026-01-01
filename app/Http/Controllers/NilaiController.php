<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NilaiController extends Controller
{
    /**
     * Display a listing of classes taught by the teacher.
     */
    public function index()
    {
        $user = auth()->user();
        $guru = \App\Models\Guru::where('user_id', $user->id)->first();
        $isGuru = $guru ? true : false;

        // Prepare Data for View
        $classesList = [];

        if ($isGuru) {
            // Get active period only
            $activePeriod = \App\Models\PeriodeAkademik::where('status', 'Active')->first();
            $selectedPeriodId = $activePeriod ? $activePeriod->id : null;

            if ($selectedPeriodId) {
                $classesList = $this->getGuruClasses($guru, $selectedPeriodId);
            }
        }

        return Inertia::render('Nilai/Index', [
            'isGuru' => $isGuru,
            'classesList' => $classesList,
        ]);
    }

    /**
     * Show form for creating a new assessment item.
     */
    public function create($jadwal_id)
    {
        $jadwal = \App\Models\JadwalPelajaran::with(['kelas.cabang', 'kelas.departemen', 'mataPelajaran', 'guru'])
            ->findOrFail($jadwal_id);

        // Verify that the current user is the teacher for this schedule
        $user = auth()->user();
        $guru = \App\Models\Guru::where('user_id', $user->id)->first();

        if (!$guru || $jadwal->guru_id !== $guru->id) {
            abort(403, 'Unauthorized');
        }

        // Get existing assessment items for this class and subject
        $items = \App\Models\ItemPenilaian::where('kelas_id', $jadwal->kelas_id)
            ->where('mata_pelajaran_id', $jadwal->mata_pelajaran_id)
            ->withCount('nilaiPelajarans')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get active semester for this periode
        $activeSemester = \App\Models\SemesterAkademik::where('periode_akademik_id', $jadwal->periode_akademik_id)
            ->where('is_aktif', true)
            ->first();

        return Inertia::render('Nilai/Create', [
            'jadwal' => [
                'id' => $jadwal->id,
                'kelas_id' => $jadwal->kelas_id,
                'kelas_nama' => $jadwal->kelas->nama,
                'mata_pelajaran_id' => $jadwal->mata_pelajaran_id,
                'mata_pelajaran_nama' => $jadwal->mataPelajaran->nama,
                'cabang_id' => $jadwal->kelas->cabang_id,
                'departemen_id' => $jadwal->kelas->departemen_id,
                'periode_akademik_id' => $jadwal->periode_akademik_id,
                'semester_akademik_id' => $activeSemester ? $activeSemester->id : null,
            ],
            'items' => $items,
        ]);
    }

    /**
     * Store a new assessment item.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cabang_id' => 'required|exists:cabangs,id',
            'departemen_id' => 'required|exists:departemens,id',
            'kelas_id' => 'required|exists:kelas,id',
            'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
            'periode_akademik_id' => 'required|exists:periode_akademiks,id',
            'semester_akademik_id' => 'required|exists:semester_akademik,id',
            'nama' => 'required|string|max:255',
            'jenis' => 'required|in:Formatif,Sumatif',
            'keterangan' => 'nullable|string',
            'tanggal_penilaian' => 'required|date',
        ]);

        // Verify authorization - check if guru teaches this class
        $user = auth()->user();
        $guru = \App\Models\Guru::where('user_id', $user->id)->first();

        if (!$guru) {
            abort(403, 'Unauthorized');
        }

        $jadwal = \App\Models\JadwalPelajaran::where('kelas_id', $validated['kelas_id'])
            ->where('mata_pelajaran_id', $validated['mata_pelajaran_id'])
            ->where('guru_id', $guru->id)
            ->first();

        if (!$jadwal) {
            abort(403, 'Unauthorized - You do not teach this class');
        }

        \App\Models\ItemPenilaian::create($validated);

        return redirect()->back()->with('success', 'Item penilaian berhasil ditambahkan');
    }

    /**
     * Update an assessment item.
     */
    public function update(Request $request, $id)
    {
        $item = \App\Models\ItemPenilaian::findOrFail($id);

        // Verify authorization
        $user = auth()->user();
        $guru = \App\Models\Guru::where('user_id', $user->id)->first();

        if (!$guru) {
            abort(403, 'Unauthorized');
        }

        $jadwal = \App\Models\JadwalPelajaran::where('kelas_id', $item->kelas_id)
            ->where('mata_pelajaran_id', $item->mata_pelajaran_id)
            ->where('guru_id', $guru->id)
            ->first();

        if (!$jadwal) {
            abort(403, 'Unauthorized - You do not teach this class');
        }

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jenis' => 'required|in:Formatif,Sumatif',
            'keterangan' => 'nullable|string',
            'tanggal_penilaian' => 'required|date',
        ]);

        $item->update($validated);

        return redirect()->back()->with('success', 'Item penilaian berhasil diupdate');
    }

    /**
     * Delete an assessment item.
     */
    public function destroy($id)
    {
        $item = \App\Models\ItemPenilaian::findOrFail($id);

        // Verify authorization
        $user = auth()->user();
        $guru = \App\Models\Guru::where('user_id', $user->id)->first();

        if (!$guru) {
            abort(403, 'Unauthorized');
        }

        $jadwal = \App\Models\JadwalPelajaran::where('kelas_id', $item->kelas_id)
            ->where('mata_pelajaran_id', $item->mata_pelajaran_id)
            ->where('guru_id', $guru->id)
            ->first();

        if (!$jadwal) {
            abort(403, 'Unauthorized - You do not teach this class');
        }

        $item->delete();

        return redirect()->back()->with('success', 'Item penilaian berhasil dihapus');
    }

    /**
     * Show student list for grade input.
     */
    public function show($kelas_id, $mata_pelajaran_id)
    {
        $user = auth()->user();
        $guru = \App\Models\Guru::where('user_id', $user->id)->first();

        if (!$guru) {
            abort(403, 'Unauthorized');
        }

        // Verify that the guru teaches this class and subject
        $jadwal = \App\Models\JadwalPelajaran::where('kelas_id', $kelas_id)
            ->where('mata_pelajaran_id', $mata_pelajaran_id)
            ->where('guru_id', $guru->id)
            ->first();

        if (!$jadwal) {
            abort(403, 'Unauthorized - You do not teach this class');
        }

        // Get class and subject details
        $kelas = \App\Models\Kelas::findOrFail($kelas_id);
        $mataPelajaran = \App\Models\MataPelajaran::findOrFail($mata_pelajaran_id);

        // Get students and grades using helper methods
        $students = $this->getStudentsForClass($kelas_id);
        $existingGrades = $this->getExistingGrades($kelas_id, $mata_pelajaran_id);

        // Get assessment items for this class and subject
        $items = \App\Models\ItemPenilaian::where('kelas_id', $kelas_id)
            ->where('mata_pelajaran_id', $mata_pelajaran_id)
            ->orderBy('jenis')
            ->orderBy('created_at')
            ->get();

        // Get active periode and semester
        $activePeriode = \App\Models\PeriodeAkademik::where('status', 'Active')->first();
        $activeSemester = null;
        if ($activePeriode) {
            $activeSemester = \App\Models\SemesterAkademik::where('periode_akademik_id', $activePeriode->id)
                ->where('is_aktif', true)
                ->first();
        }

        return Inertia::render('Nilai/Show', [
            'jadwal' => ['id' => $jadwal->id],
            'kelas' => ['id' => $kelas->id, 'nama' => $kelas->nama],
            'mataPelajaran' => ['id' => $mataPelajaran->id, 'nama' => $mataPelajaran->nama],
            'periode' => $activePeriode ? ['id' => $activePeriode->id, 'nama' => $activePeriode->nama] : null,
            'semester' => $activeSemester ? ['id' => $activeSemester->id, 'nama' => $activeSemester->nama] : null,
            'students' => $students,
            'items' => $items,
            'existingGrades' => $existingGrades,
        ]);
    }

    /**
     * Save or update student grades.
     */
    public function saveGrades(Request $request)
    {
        $validated = $request->validate([
            'item_penilaian_id' => 'required|exists:item_penilaian,id',
            'kelas_id' => 'required|exists:kelas,id',
            'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
            'periode_akademik_id' => 'required|exists:periode_akademiks,id',
            'semester_akademik_id' => 'nullable|exists:semester_akademik,id',
            'grades' => 'required|array',
            'grades.*.siswa_id' => 'required|exists:users,id',
            'grades.*.nilai' => 'required|numeric|min:0|max:100',
        ]);

        // Verify authorization
        $user = auth()->user();
        $guru = \App\Models\Guru::where('user_id', $user->id)->first();

        if (!$guru) {
            abort(403, 'Unauthorized');
        }

        $jadwal = \App\Models\JadwalPelajaran::where('kelas_id', $validated['kelas_id'])
            ->where('mata_pelajaran_id', $validated['mata_pelajaran_id'])
            ->where('guru_id', $guru->id)
            ->first();

        if (!$jadwal) {
            abort(403, 'Unauthorized - You do not teach this class');
        }

        $savedCount = 0;
        foreach ($validated['grades'] as $gradeData) {
            try {
                \App\Models\NilaiPelajaran::updateOrCreate(
                    [
                        'siswa_id' => $gradeData['siswa_id'],
                        'item_penilaian_id' => $validated['item_penilaian_id'],
                    ],
                    [
                        'nilai' => $gradeData['nilai'],
                        'kelas_id' => $validated['kelas_id'],
                        'mata_pelajaran_id' => $validated['mata_pelajaran_id'],
                        'periode_akademik_id' => $validated['periode_akademik_id'],
                        'semester_akademik_id' => $validated['semester_akademik_id'],
                    ]
                );
                $savedCount++;
            } catch (\Exception $e) {
                \Log::error('Failed to save grade', [
                    'error' => $e->getMessage(),
                    'siswa_id' => $gradeData['siswa_id']
                ]);
            }
        }

        return redirect()->back()->with('success', "Berhasil menyimpan {$savedCount} nilai siswa");
    }

    private function getGuruClasses($guru, $selectedPeriodId)
    {
        $jadwals = \App\Models\JadwalPelajaran::where('guru_id', $guru->id)
            ->when($selectedPeriodId, function ($query) use ($selectedPeriodId) {
                return $query->where('periode_akademik_id', $selectedPeriodId);
            })
            ->with(['kelas', 'mataPelajaran'])
            ->get();

        return $jadwals->map(function ($jadwal) {
            return [
                'jadwal_id' => $jadwal->id,
                'kelas_id' => $jadwal->kelas_id,
                'kelas_nama' => $jadwal->kelas->nama,
                'mata_pelajaran_id' => $jadwal->mata_pelajaran_id,
                'mata_pelajaran_nama' => $jadwal->mataPelajaran->nama,
            ];
        })->unique(function ($item) {
            return $item['kelas_id'] . '-' . $item['mata_pelajaran_nama'];
        })->values();
    }

    private function getStudentsForClass($kelas_id)
    {
        return \App\Models\KelasSiswa::where('kelas_id', $kelas_id)
            ->with(['siswa'])
            ->get()
            ->map(function ($kelasSiswa) {
                $siswaData = \App\Models\Siswa::where('user_id', $kelasSiswa->siswa_id)->first();
                return [
                    'id' => $kelasSiswa->siswa_id,
                    'nis' => $siswaData?->nis ?? '-',
                    'nama' => $kelasSiswa->siswa?->name ?? 'Unknown',
                ];
            });
    }

    private function getExistingGrades($kelas_id, $mata_pelajaran_id)
    {
        return \App\Models\NilaiPelajaran::where('kelas_id', $kelas_id)
            ->where('mata_pelajaran_id', $mata_pelajaran_id)
            ->get()
            ->groupBy('item_penilaian_id')
            ->map(function ($grades) {
                return $grades->keyBy('siswa_id')->map(function ($grade) {
                    return [
                        'nilai' => (int) $grade->nilai,
                        'tanggal_penilaian' => \Carbon\Carbon::parse($grade->tanggal_penilaian)->format('Y-m-d'),
                    ];
                });
            });
    }
}
