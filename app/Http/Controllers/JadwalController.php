<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class JadwalController extends Controller
{
    /**
     * Display the user's schedule.
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        // Determine role and fetch relevant schedule
        $guru = \App\Models\Guru::where('user_id', $user->id)->first();
        $isGuru = $guru ? true : false;

        $jadwals = collect();

        // Active Period Check (Optional, usually we only show active period)
        $activePeriode = \App\Models\PeriodeAkademik::where('status', 'Active')->first();
        $periodeId = $activePeriode ? $activePeriode->id : null;

        if ($isGuru) {
            // Fetch Schedule for Guru
            $jadwals = \App\Models\JadwalPelajaran::where('guru_id', $guru->id)
                ->when($periodeId, function ($q) use ($periodeId) {
                    $q->where('periode_akademik_id', $periodeId);
                })
                ->with(['kelas', 'mataPelajaran', 'jamPelajaran'])
                ->get();
        } else {
            // Assume Siswa (Student)
            // Check if user is a Siswa
            $siswa = \App\Models\Siswa::where('user_id', $user->id)->first();

            if ($siswa) {
                // If the system uses `kelas_siswa` pivot:
                $kelasSiswa = \App\Models\KelasSiswa::where('siswa_id', $siswa->id)
                    ->where('is_active', true)
                    ->first();

                $kelasId = $kelasSiswa ? $kelasSiswa->kelas_id : ($siswa->kelas_id ?? null);

                if ($kelasId) {
                    $jadwals = \App\Models\JadwalPelajaran::where('kelas_id', $kelasId)
                        ->when($periodeId, function ($q) use ($periodeId) {
                            $q->where('periode_akademik_id', $periodeId);
                        })
                        ->with(['kelas', 'mataPelajaran', 'jamPelajaran', 'guru.user'])
                        ->get();
                }
            }
        }

        // Add colors to jadwals
        $jadwals->transform(function ($jadwal) {
            $jadwal->color_class = $this->getColorClass($jadwal->mataPelajaran->nama ?? '');
            return $jadwal;
        });

        // 1. Sort by Day and Start Time
        $dataSorted = $jadwals->sortBy(function ($j) {
            // Mapping numeric day for sorting if needed, but 'hari' string usually grouped is fine.
            // For proper sorting within day, we use Start Time.
            // Let's assume grouping by day happens in frontend or we just sort everything.
            return [$j->hari, $j->jamPelajaran->jam_mulai];
        })->values();

        // 2. Merge Logic
        $mergedJadwals = collect();

        foreach ($dataSorted as $current) {
            if ($mergedJadwals->isEmpty()) {
                $mergedJadwals->push($current);
                continue;
            }

            $last = $mergedJadwals->last();

            // Check merge criteria
            $isSameDay = $last->hari === $current->hari;
            $isSameClass = $last->kelas_id === $current->kelas_id;
            $isSameSubject = $last->mata_pelajaran_id === $current->mata_pelajaran_id;
            $isSameTeacher = $last->guru_id === $current->guru_id;
            $isContinuous = $last->jamPelajaran->jam_selesai === $current->jamPelajaran->jam_mulai;

            if ($isSameDay && $isSameClass && $isSameSubject && $isSameTeacher && $isContinuous) {
                // Merge: Update the 'last' entry's end time visually
                // Use setAttribute to ensure it's properly set on the model instance for serialization
                $last->jamPelajaran->setAttribute('jam_selesai', $current->jamPelajaran->jam_selesai);
            } else {
                $mergedJadwals->push($current);
            }
        }

        return Inertia::render('Jadwal/Index', [
            'rawJadwals' => $mergedJadwals->values(),
            'isGuru' => $isGuru,
        ]);
    }

    private function getColorClass($subjectName)
    {
        // Simple hash or rotating assignment for pastel colors based on subject name
        $colors = [
            'bg-orange-100 text-orange-800',  // Orange Pastel
            'bg-green-100 text-green-800',    // Green Pastel
            'bg-blue-100 text-blue-800',      // Blue Pastel
            'bg-purple-100 text-purple-800',  // Purple Pastel
            'bg-pink-100 text-pink-800',      // Pink Pastel
            'bg-yellow-100 text-yellow-800',  // Yellow Pastel
            'bg-indigo-100 text-indigo-800',  // Indigo Pastel
            'bg-teal-100 text-teal-800',      // Teal Pastel
        ];

        if (empty($subjectName))
            return 'bg-gray-100 text-gray-800';

        // Consistent hashing
        $hash = crc32($subjectName);
        $index = abs($hash) % count($colors);

        return $colors[$index];
    }
}
