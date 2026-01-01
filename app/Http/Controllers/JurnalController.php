<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class JurnalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        /** @var \App\Models\User $realUser */
        $realUser = auth()->user();
        $targetUserId = session('jurnal_substitute_for', $realUser->id);

        // Subsitution Safety Check
        if ($targetUserId !== $realUser->id) {
            $hasValidCode = \App\Models\JurnalAccessCode::where('user_id', $targetUserId)
                ->where('is_active', true)
                ->where('expires_at', '>', now())
                ->exists();

            if (!$hasValidCode) {
                session()->forget('jurnal_substitute_for');
                return redirect()->route('jurnal.index')->with('error', 'Akses dicabut. Kode akses tuan rumah tidak lagi aktif.');
            }
        }

        $guru = \App\Models\Guru::where('user_id', $targetUserId)->first();
        $isGuru = $guru ? true : false;

        $isSubstituteMode = ($targetUserId !== $realUser->id);
        $userSub = $isSubstituteMode ? \App\Models\User::find($targetUserId) : null;
        $substituteName = $userSub ? $userSub->name : null;

        // Prepare Data for View
        $classesList = [];
        $periodes = [];
        $selectedPeriodId = null;

        if ($isGuru) {
            $periodes = \App\Models\PeriodeAkademik::select('id', 'nama', 'status')->orderBy('id', 'desc')->get();
            $activePeriod = $periodes->firstWhere('status', 'Active');
            $selectedPeriodId = request('periode_id') ?? ($activePeriod ? $activePeriod->id : ($periodes->first() ? $periodes->first()->id : null));

            $classesList = $this->getGuruClasses($guru, $selectedPeriodId);
        }

        $riwayatJurnal = $this->getHistoryJournals($realUser, $selectedPeriodId);
        $activeAccessCode = $this->getActiveAccessCode($realUser);

        return Inertia::render('Jurnal/Index', [
            'isGuru' => $isGuru,
            'classesList' => $classesList,
            'periodes' => $periodes,
            'selectedPeriodId' => $selectedPeriodId,
            'isSubstituteMode' => $isSubstituteMode,
            'substituteForName' => $substituteName,
            'activeAccessCode' => $activeAccessCode,
            'historyJournals' => $riwayatJurnal,
        ]);
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
                'kelas_id' => $jadwal->kelas_id,
                'kelas_nama' => $jadwal->kelas->nama,
                'mata_pelajaran_id' => $jadwal->mata_pelajaran_id,
                'mata_pelajaran_nama' => $jadwal->mataPelajaran->nama,
            ];
        })->unique(function ($item) {
            return $item['kelas_id'] . '-' . $item['mata_pelajaran_nama'];
        })->values();
    }

    public function getHistoryJournals($realUser, $selectedPeriodId = null)
    {
        return \App\Models\JurnalMengajar::with(['kelas', 'mataPelajaran', 'kehadiranSiswas'])
            ->where(function ($q) use ($realUser) {
                $q->where('user_id', $realUser->id)
                    ->orWhere('created_by', $realUser->id);
            })
            ->when($selectedPeriodId, function ($query) use ($selectedPeriodId) {
                return $query->where('periode_akademik_id', $selectedPeriodId);
            })
            ->latest('tanggal')
            ->latest('jam_mulai')
            ->limit(50)
            ->get()
            ->map(function ($jurnal) {
                \Carbon\Carbon::setLocale('id');

                // Calculate attendance stats
                $stats = [
                    'H' => 0,
                    'I' => 0,
                    'S' => 0,
                    'A' => 0,
                    'X' => 0,
                ];

                foreach ($jurnal->kehadiranSiswas as $kehadiran) {
                    if (array_key_exists($kehadiran->status, $stats)) {
                        $stats[$kehadiran->status]++;
                    }
                }

                // \Illuminate\Support\Facades\Log::info('Journal ID: ' . $jurnal->id . ' Stats: ' . json_encode($stats));
    
                return [
                    'id' => $jurnal->id,
                    'date' => \Carbon\Carbon::parse($jurnal->tanggal)->translatedFormat('l, d M Y'),
                    'full_date' => \Carbon\Carbon::parse($jurnal->tanggal)->format('Y-m-d'),
                    'subject' => $jurnal->mataPelajaran->nama,
                    'materi' => $jurnal->materi,
                    'class' => $jurnal->kelas->nama,
                    'time' => \Carbon\Carbon::parse($jurnal->jam_mulai)->format('H:i') . ' - ' . \Carbon\Carbon::parse($jurnal->jam_selesai)->format('H:i'),
                    'status' => $jurnal->status,
                    'images' => collect($jurnal->foto ?? [])->map(function ($path) {
                        return asset('storage/' . $path);
                    })->toArray(),
                    'attendance_stats' => $stats,
                ];
            });
    }

    private function getActiveAccessCode($user)
    {
        $code = \App\Models\JurnalAccessCode::where('user_id', $user->id)
            ->where('is_active', true)
            ->where('expires_at', '>', now())
            ->first();

        return $code ? [
            'code' => $code->code,
            'expires_at' => \Carbon\Carbon::parse($code->expires_at)->format('d M Y H:i'),
        ] : null;
    }

    /**
     * Display the specified resource.
     */
    public function showKelas($kelas_id, $mapel_id)
    {
        // dd('DEBUG: Reached showKelas'); // Uncomment to test route
        /** @var \App\Models\User $realUser */
        $realUser = auth()->user();
        $targetUserId = session('jurnal_substitute_for', $realUser->id);

        $guru = \App\Models\Guru::where('user_id', $targetUserId)->first();

        // 1. Check if the TARGET user is a Guru
        if (!$guru) {
            abort(403, 'Akses ditolak. Pengguna target bukan Guru.');
        }

        // 2. Check if this Guru teaches this specific Class and Subject
        $hasAccess = \App\Models\JadwalPelajaran::where('guru_id', $guru->id)
            ->where('kelas_id', $kelas_id)
            ->where('mata_pelajaran_id', $mapel_id)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Guru tidak memiliki jadwal mengajar di kelas dan mata pelajaran ini.');
        }

        $kelas = \App\Models\Kelas::findOrFail($kelas_id);
        $mapel = \App\Models\MataPelajaran::findOrFail($mapel_id);

        /**
         * Fetch Journal History
         * Logic:
         * - If Normal Mode ($targetUserId == $realUser->id):
         *      Show journals where user_id = Me OR created_by = Me.
         *      (Shows my journals + journals I made for others)
         * - If Substitute Mode ($targetUserId != $realUser->id):
         *      Show journals where user_id = Target.
         *      (Shows target's journals, including ones I just made for them)
         */

        $query = \App\Models\JurnalMengajar::where('kelas_id', $kelas_id)
            ->where('mata_pelajaran_id', $mapel_id);

        if ($targetUserId === $realUser->id) {
            // Normal Mode: My journals OR journals I created
            $query->where(function ($q) use ($realUser) {
                $q->where('user_id', $realUser->id)
                    ->orWhere('created_by', $realUser->id);
            });
        } else {
            // Substitute Mode: Target's journals
            $query->where('user_id', $targetUserId);
        }

        $riwayat = $query->latest('tanggal')
            ->latest('created_at')
            ->with('kehadiranSiswas') // Eager load attendance
            ->get()
            ->map(function ($jurnal) {
                // Calculate attendance stats
                $stats = [
                    'H' => 0,
                    'I' => 0,
                    'S' => 0,
                    'A' => 0,
                    'X' => 0,
                ];

                foreach ($jurnal->kehadiranSiswas as $kehadiran) {
                    if (array_key_exists($kehadiran->status, $stats)) {
                        $stats[$kehadiran->status]++;
                    }
                }

                return [
                    'id' => $jurnal->id,
                    'date' => \Carbon\Carbon::parse($jurnal->tanggal)->translatedFormat('l, d F Y'),
                    'full_date' => $jurnal->tanggal, // Required for filtering (Y-m-d)
                    'time' => \Carbon\Carbon::parse($jurnal->jam_mulai)->format('H:i') . ' - ' . \Carbon\Carbon::parse($jurnal->jam_selesai)->format('H:i'),
                    'materi' => $jurnal->materi,
                    'status' => 'Selesai', // Assuming if it exists, it's done
                    'images' => collect($jurnal->foto ?? [])->map(function ($path) {
                        return asset('storage/' . $path);
                    })->toArray(),
                    'iconColor' => 'bg-blue-500', // Default color, can be dynamic
                    'attendance_stats' => $stats,
                ];
            });

        // \Illuminate\Support\Facades\Log::info('ShowKelas Stats for Class ' . $kelas_id . ': ' . json_encode($riwayat->first()));

        return Inertia::render('Jurnal/Show', [
            'subject' => $mapel->nama,
            'className' => $kelas->nama,
            // We can pass IDs if needed for form submission later
            'kelas_id' => $kelas->id,
            'mapel_id' => $mapel->id,
            'riwayat' => $riwayat,
        ]);
    }
    public function create($kelas_id, $mapel_id)
    {
        /** @var \App\Models\User $realUser */
        $realUser = auth()->user();
        $targetUserId = session('jurnal_substitute_for', $realUser->id);
        $guru = \App\Models\Guru::where('user_id', $targetUserId)->first();

        // 1. Check if user is a Guru
        if (!$guru) {
            abort(403, 'Akses ditolak. Pengguna target bukan Guru.');
        }

        // 2. Check if this Guru teaches this specific Class and Subject
        $hasAccess = \App\Models\JadwalPelajaran::where('guru_id', $guru->id)
            ->where('kelas_id', $kelas_id)
            ->where('mata_pelajaran_id', $mapel_id)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Guru tidak memiliki jadwal mengajar di kelas dan mata pelajaran ini.');
        }

        $kelas = \App\Models\Kelas::findOrFail($kelas_id);
        $mapel = \App\Models\MataPelajaran::findOrFail($mapel_id);

        // Fetch Jam Pelajaran associated with the department and branch of the class
        $jamPelajarans = \App\Models\JamPelajaran::where('cabang_id', $kelas->cabang_id)
            ->where('departemen_id', $kelas->departemen_id)
            ->orderBy('jam_mulai')
            ->get();

        // Fetch Students enrolled in this class
        $students = \App\Models\KelasSiswa::where('kelas_id', $kelas->id)
            ->with('siswa')
            ->get()
            ->map(function ($ks) {
                return [
                    'id' => $ks->siswa->id ?? 0,
                    'name' => $ks->siswa->name ?? 'Unknown',
                ];
            })
            ->sortBy('name')
            ->values();

        return Inertia::render('Jurnal/Create', [
            'subject' => $mapel->nama,
            'className' => $kelas->nama,
            'kelas_id' => $kelas->id,
            'mapel_id' => $mapel->id,
            'tanggal' => now()->format('Y-m-d'),
            'jamPelajarans' => $jamPelajarans,
            'studentsProp' => $students,
        ]);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'kelas_id' => 'required|exists:kelas,id',
            'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
            'tanggal' => 'required|date',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
            'materi' => 'required|string',
            'catatan' => 'nullable|string',
            'foto.*' => 'nullable|image|max:2048', // Validate each photo
            'students' => 'nullable|array',
            'students.*.id' => 'required|exists:users,id',
            'students.*.status' => 'required|in:H,I,S,A,X',
        ]);

        /** @var \App\Models\User $realUser */
        $realUser = auth()->user();
        $targetUserId = session('jurnal_substitute_for', $realUser->id);

        // Get Organizational Data from Kelas or User (Assuming Guru/User belongs to Cabang/Dep)
        // Better to get from Kelas because the schedule is class-based.
        $kelas = \App\Models\Kelas::findOrFail($request->kelas_id);

        // Get Active Periode & Semester
        $periode = \App\Models\PeriodeAkademik::getActive();
        $semester = \App\Models\SemesterAkademik::getActive();

        if (!$periode || !$semester) {
            return back()->withErrors(['message' => 'Periode atau Semester Akademik aktif tidak ditemukan.']);
        }

        $jurnal = new \App\Models\JurnalMengajar();
        $jurnal->cabang_id = $kelas->cabang_id; // Inherit from Class
        $jurnal->departemen_id = $kelas->departemen_id; // Inherit from Class
        $jurnal->periode_akademik_id = $periode->id;
        $jurnal->semester_akademik_id = $semester->id;
        $jurnal->user_id = $targetUserId;
        $jurnal->kelas_id = $request->kelas_id;
        $jurnal->mata_pelajaran_id = $request->mata_pelajaran_id;
        $jurnal->tanggal = $request->tanggal;
        $jurnal->jam_mulai = $request->jam_mulai;
        $jurnal->jam_selesai = $request->jam_selesai;
        $jurnal->materi = $request->materi;
        $jurnal->catatan = $request->catatan;
        $jurnal->created_by = $realUser->id; // Track who actually created it

        // Handle File Uploads
        $fotoPaths = [];
        if ($request->hasFile('foto')) {
            foreach ($request->file('foto') as $file) {
                // Generate unique filename
                $filename = time() . '_' . \Illuminate\Support\Str::random(10) . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('jurnal-foto', $filename, 'public'); // Store in 'storage/app/public/jurnal-foto'
                $fotoPaths[] = $path;
            }
        }

        $jurnal = new \App\Models\JurnalMengajar();
        $jurnal->cabang_id = $kelas->cabang_id;
        $jurnal->departemen_id = $kelas->departemen_id;
        $jurnal->periode_akademik_id = $periode->id;
        $jurnal->semester_akademik_id = $semester->id;
        $jurnal->user_id = $targetUserId;
        $jurnal->kelas_id = $request->kelas_id;
        $jurnal->mata_pelajaran_id = $request->mata_pelajaran_id;
        $jurnal->tanggal = $request->tanggal;
        $jurnal->jam_mulai = $request->jam_mulai;
        $jurnal->jam_selesai = $request->jam_selesai;
        $jurnal->materi = $request->materi;
        $jurnal->catatan = $request->catatan;
        $jurnal->created_by = $realUser->id;
        $jurnal->foto = $fotoPaths;

        $jurnal->save();

        // Save Attendance (Kehadiran Siswa)
        if ($request->has('students')) {
            foreach ($request->students as $studentData) {
                \App\Models\JurnalMengajarKehadiranSiswa::create([
                    'jurnal_mengajar_id' => $jurnal->id,
                    'user_id' => $studentData['id'],
                    'status' => $studentData['status'],
                ]);
            }
        }

        return redirect()->route('jurnal.index')->with('success', 'Jurnal berhasil disimpan.');
    }
    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $jurnal = \App\Models\JurnalMengajar::with(['kelas', 'mataPelajaran'])->findOrFail($id);

        // Authorization: Check if user is the owner
        if ($jurnal->user_id !== $user->id) {
            abort(403, 'Anda tidak berhak mengedit jurnal ini.');
        }

        // Fetch Jam Pelajaran associated with the department and branch of the class
        $jamPelajarans = $this->getJamPelajaransForJurnal($jurnal);

        // Fetch Students and their existing attendance for this journal
        $students = $this->getStudentsWithAttendance($jurnal);

        return Inertia::render('Jurnal/Edit', [
            'jurnal' => [
                ...$jurnal->toArray(),
                'tanggal' => \Carbon\Carbon::parse($jurnal->tanggal)->format('Y-m-d'),
            ],
            'subject' => $jurnal->mataPelajaran->nama,
            'className' => $jurnal->kelas->nama,
            'jamPelajarans' => $jamPelajarans,
            'studentsProp' => $students,
            // Pass formatted photos URL
            'existingPhotos' => collect($jurnal->foto ?? [])->map(function ($path) {
                return asset('storage/' . $path);
            })->toArray(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
            'materi' => 'required|string',
            'catatan' => 'nullable|string',
            'foto' => 'nullable|array|max:2',
            'foto.*' => 'image|max:2048',
            'students' => 'nullable|array',
            'students.*.id' => 'required|exists:users,id',
            'students.*.status' => 'required|in:H,I,S,A,X',
        ]);

        $jurnal = \App\Models\JurnalMengajar::findOrFail($id);
        /** @var \App\Models\User $user */
        $user = auth()->user();

        if ($jurnal->user_id !== $user->id) {
            abort(403);
        }

        // For simplicity: We append new photos. Pruning old ones requires more UI logic (delete button per image)
        // If the user wants to "replace", they might need to delete old ones.
        // Let's assume the frontend sends 'deleted_photos' array indices or paths to remove?
        // Or simpler: Append new photos to existing array.

        // Initialize current photos from DB
        $currentPhotos = $jurnal->foto ?? [];

        // Handle deletions if 'deleted_photos' indices are passed
        if ($request->filled('deleted_photos')) {
            $indicesToRemove = $request->deleted_photos;
            foreach ($indicesToRemove as $idx) {
                if (isset($currentPhotos[$idx])) {
                    // Optionally delete file from storage:
                    if (Storage::disk('public')->exists($currentPhotos[$idx])) {
                        Storage::disk('public')->delete($currentPhotos[$idx]);
                    }
                    unset($currentPhotos[$idx]);
                }
            }
        }

        // Append new photos
        if ($request->hasFile('foto')) {
            foreach ($request->file('foto') as $file) {
                $filename = time() . '_' . \Illuminate\Support\Str::random(10) . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('jurnal-foto', $filename, 'public');
                $currentPhotos[] = $path;
            }
        }

        // Re-index array to be clean JSON
        $jurnal->foto = array_values($currentPhotos);

        $jurnal->tanggal = $request->tanggal;
        $jurnal->jam_mulai = $request->jam_mulai;
        $jurnal->jam_selesai = $request->jam_selesai;
        $jurnal->materi = $request->materi;
        $jurnal->catatan = $request->catatan;
        $jurnal->save();

        // Update Attendance
        // Update Attendance
        if ($request->has('students')) {
            foreach ($request->students as $studentData) {
                // Check if we need to update or create
                // Since user_id and jurnal_mengajar_id are unique together (or should be handled per student)
                \App\Models\JurnalMengajarKehadiranSiswa::updateOrCreate(
                    [
                        'jurnal_mengajar_id' => $jurnal->id,
                        'user_id' => $studentData['id'],
                    ],
                    [
                        'status' => $studentData['status'],
                    ]
                );
            }
        }

        return redirect()->route('jurnal.index')->with('success', 'Jurnal berhasil diperbarui.');
    }

    private function getJamPelajaransForJurnal($jurnal)
    {
        return \App\Models\JamPelajaran::where('cabang_id', $jurnal->cabang_id)
            ->where('departemen_id', $jurnal->departemen_id)
            ->orderBy('jam_mulai')
            ->get();
    }

    private function getStudentsWithAttendance($jurnal)
    {
        $existingAttendance = \App\Models\JurnalMengajarKehadiranSiswa::where('jurnal_mengajar_id', $jurnal->id)
            ->get()
            ->keyBy('user_id');

        return \App\Models\KelasSiswa::where('kelas_id', $jurnal->kelas_id)
            ->with('siswa')
            ->get()
            ->map(function ($ks) use ($existingAttendance) {
                $studentId = $ks->siswa->id ?? 0;
                $attendance = $existingAttendance->get($studentId);
                return [
                    'id' => $studentId,
                    'name' => $ks->siswa->name ?? 'Unknown',
                    'status' => $attendance ? $attendance->status : 'H',
                ];
            })
            ->sortBy('name')
            ->values();
    }
}
