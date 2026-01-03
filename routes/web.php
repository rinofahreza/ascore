<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\JurnalController;
use App\Http\Controllers\JurnalAccessCodeController;
use App\Http\Controllers\AbsensiController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $redirectTo = auth()->check() ? route('home') : route('login');

    return Inertia::render('Loading', [
        'redirectTo' => $redirectTo
    ]);
});

Route::get('/jadwal', [App\Http\Controllers\JadwalController::class, 'index'])->middleware(['auth', 'verified'])->name('jadwal.index');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Bottom Navigation Routes
    // Bottom Navigation Routes
    Route::get('/home', function () {
        return Inertia::render('Home', [
            'siswaCount' => App\Models\User::whereHas('role', function ($q) {
                $q->where('nama', 'Siswa');
            })->where('is_active', 1)->count(),
            'guruCount' => App\Models\User::whereHas('role', function ($q) {
                $q->where('nama', 'Guru');
            })->where('is_active', 1)->count(),
            'karyawanCount' => App\Models\User::whereHas('role', function ($q) {
                $q->where('nama', 'Karyawan');
            })->where('is_active', 1)->count(),
            'sliders' => App\Models\Slider::where('status', true)->orderBy('urutan')->get(),
            'prestasis' => App\Models\Prestasi::where('is_active', true)
                ->orderBy('urutan', 'asc')
                ->orderBy('created_at', 'desc')
                ->take(4)
                ->get(),
        ]);
    })->name('home');

    Route::get('/absensi', function () {
        return Inertia::render('Absensi/Index');
    })->name('absensi');

    Route::get('/absensi/scan', function () {
        return Inertia::render('Absensi/Scan');
    })->name('absensi.scan');

    // Post Routes
    Route::get('/post', [PostController::class, 'index'])->name('post.index');
    Route::get('/post/{post}', [PostController::class, 'show'])->name('post.show');
    // FCM
    Route::post('/fcm-token', [App\Http\Controllers\FCMController::class, 'updateToken'])->name('fcm.update');

    Route::post('/absensi', [App\Http\Controllers\AbsensiController::class, 'store'])->name('absensi.store');
    Route::post('/post', [PostController::class, 'store'])->name('post.store');
    Route::post('/post/{post}/like', [PostController::class, 'toggleLike'])->name('post.like');
    Route::post('/post/{post}/comment', [PostController::class, 'addComment'])->name('post.comment');
    Route::delete('/post/{post}', [PostController::class, 'deletePost'])->name('post.delete');
    Route::delete('/post/comment/{comment}', [PostController::class, 'deleteComment'])->name('post.comment.delete');
    Route::get('/post/search-users', [PostController::class, 'searchUsers'])->name('post.search-users');
    Route::post('/post/{post}/save', [PostController::class, 'toggleSave'])->name('post.save');


    // Notification Routes
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/read/{id}', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::get('/notifications/unread-count', [App\Http\Controllers\NotificationController::class, 'getUnreadCount'])->name('notifications.unread-count');

    // Avatar Routes
    Route::post('/profile/avatar', [App\Http\Controllers\ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
    Route::delete('/profile/avatar', [App\Http\Controllers\ProfileController::class, 'deleteAvatar'])->name('profile.avatar.delete');

    // Cabang Routes
    Route::resource('cabang', App\Http\Controllers\CabangController::class)->except(['show']);

    // Departemen Routes
    Route::resource('departemen', App\Http\Controllers\DepartemenController::class)->except(['show']);
    Route::post('departemen/{departemen}/toggle-status', [App\Http\Controllers\DepartemenController::class, 'toggleStatus'])->name('departemen.toggle-status');

    // Role Routes
    Route::resource('settings/roles', App\Http\Controllers\RoleController::class)->names('settings.roles')->except(['show']);
    Route::resource('settings/sliders', App\Http\Controllers\SliderController::class)->names('settings.sliders')->except(['show']);

    // Pengguna Routes
    Route::resource('pengguna', App\Http\Controllers\PenggunaController::class)->except(['show']);

    // API NIK Routes
    Route::get('/api-nik', [App\Http\Controllers\ApiNikController::class, 'index'])->name('api-nik.index');
    Route::post('/api-nik/execute', [App\Http\Controllers\ApiNikController::class, 'execute'])->name('api-nik.execute');
    Route::post('/api-nik/sync', [App\Http\Controllers\ApiNikController::class, 'sync'])->name('api-nik.sync');
    Route::post('/api-nik/batch-sync', [App\Http\Controllers\ApiNikController::class, 'batchSync'])->name('api-nik.batch-sync');

    // Mata Pelajaran Routes
    Route::resource('mata-pelajaran', App\Http\Controllers\MataPelajaranController::class)->except(['show']);
    // API endpoint for dynamic dropdown
    Route::get('api/departemen/cabang/{cabangId}', [App\Http\Controllers\MataPelajaranController::class, 'getDepartemenByCabang'])->name('api.departemen.by-cabang');
    Route::get('api/guru/mata-pelajaran/{mataPelajaranId}', [App\Http\Controllers\GuruController::class, 'getGuruByMataPelajaran'])->name('api.guru.by-mata-pelajaran');

    // Jam Pelajaran Routes
    Route::post('/jam-pelajaran/batch-save', [App\Http\Controllers\JamPelajaranController::class, 'batchSave'])->name('jam-pelajaran.batch-save');
    Route::resource('jam-pelajaran', App\Http\Controllers\JamPelajaranController::class)->except(['show']);



    // Periode Akademik Routes
    Route::resource('periode-akademik', App\Http\Controllers\PeriodeAkademikController::class)->except(['show']);
    Route::post('periode-akademik/{id}/toggle', [App\Http\Controllers\PeriodeAkademikController::class, 'toggleStatus'])->name('periode-akademik.toggle');

    // Kelas Routes
    Route::resource('kelas', App\Http\Controllers\KelasController::class)->except(['show']);
    Route::post('kelas/{id}/toggle-status', [App\Http\Controllers\KelasController::class, 'toggleStatus'])->name('kelas.toggle-status');
    Route::get('kelas/{id}/atur-siswa', [App\Http\Controllers\KelasController::class, 'aturSiswa'])->name('kelas.atur-siswa');
    Route::post('kelas/{id}/assign-siswa', [App\Http\Controllers\KelasController::class, 'assignSiswa'])->name('kelas.assign-siswa');
    Route::delete('kelas-siswa/{id}', [App\Http\Controllers\KelasController::class, 'removeSiswa'])->name('kelas-siswa.destroy');

    // Guru Routes
    Route::resource('guru', App\Http\Controllers\GuruController::class)->except(['show']);
    Route::get('api/users/filters', [App\Http\Controllers\GuruController::class, 'getUsersByFilters'])->name('api.users.by-filters');

    // Siswa Routes
    Route::resource('siswa', App\Http\Controllers\SiswaController::class)->except(['show']);
    Route::resource('level', App\Http\Controllers\LevelController::class)->except(['show']);


    // Poin Routes
    Route::resource('poin', App\Http\Controllers\PoinController::class)->except(['show']);

    // Pelanggaran Routes
    Route::resource('pelanggaran', App\Http\Controllers\PelanggaranController::class)->except(['show']);
    Route::get('api/siswa/by-kelas/{kelas_id}', [App\Http\Controllers\PelanggaranController::class, 'getSiswaByKelas'])->name('api.siswa.by-kelas');

    // Semester Akademik Routes
    Route::resource('semester-akademik', App\Http\Controllers\SemesterAkademikController::class)->except(['show']);
    Route::post('semester-akademik/{id}/toggle', [App\Http\Controllers\SemesterAkademikController::class, 'toggleAktif'])->name('semester-akademik.toggle');

    // Jadwal Pelajaran Routes
    Route::resource('jadwal-pelajaran', App\Http\Controllers\JadwalPelajaranController::class)->except(['show']);
    Route::post('jadwal-pelajaran/batch-save', [App\Http\Controllers\JadwalPelajaranController::class, 'batchSave'])->name('jadwal-pelajaran.batch-save');

    // Prestasi Routes
    Route::resource('prestasi', App\Http\Controllers\PrestasiController::class)->except(['show']);
    Route::post('prestasi/{id}/toggle-status', [App\Http\Controllers\PrestasiController::class, 'toggleStatus'])->name('prestasi.toggle-status');

    // API Routes
    Route::get('api/departemen/by-cabang/{cabang_id}', [App\Http\Controllers\JamPelajaranController::class, 'getDepartemenByCabang'])->name('api.jam-pelajaran.departemen.by-cabang');
    Route::get('api/kelas/by-departemen/{departemen_id}', [App\Http\Controllers\JadwalPelajaranController::class, 'getKelasByDepartemen'])->name('api.kelas.by-departemen');

    Route::get('api/mata-pelajaran/by-departemen/{departemen_id}', [App\Http\Controllers\JadwalPelajaranController::class, 'getMataPelajaranByDepartemen'])->name('api.mata-pelajaran.by-departemen');
    Route::get('api/guru/by-departemen/{departemen_id}', [App\Http\Controllers\JadwalPelajaranController::class, 'getGuruByDepartemen'])->name('api.guru.by-departemen');

    // Berkas Routes
    Route::resource('berkas', App\Http\Controllers\BerkasController::class)->only(['index', 'store', 'destroy']);
    Route::get('berkas/{id}/download', [App\Http\Controllers\BerkasController::class, 'download'])->name('berkas.download');

    // Karyawan Routes
    Route::resource('karyawan', App\Http\Controllers\KaryawanController::class)->except(['show']);

    // Jurnal Routes
    Route::get('/jurnal', [App\Http\Controllers\JurnalController::class, 'index'])->name('jurnal.index');
    Route::get('/jurnal/kelas/{kelas_id}/mapel/{mapel_id}', [App\Http\Controllers\JurnalController::class, 'showKelas'])->name('jurnal.show-kelas');
    Route::get('/jurnal/kelas/{kelas_id}/mapel/{mapel_id}/create', [App\Http\Controllers\JurnalController::class, 'create'])->name('jurnal.create');
    Route::post('/jurnal', [App\Http\Controllers\JurnalController::class, 'store'])->name('jurnal.store');
    Route::get('/jurnal/{id}/edit', [App\Http\Controllers\JurnalController::class, 'edit'])->name('jurnal.edit');
    Route::post('/jurnal/{id}/update', [JurnalController::class, 'update'])->name('jurnal.update');

    // Access Code / Substitute Teacher Routes
    Route::post('/jurnal/access-code/generate', [JurnalAccessCodeController::class, 'generate'])->name('jurnal.access-code.generate');
    Route::post('/jurnal/access-code/verify', [JurnalAccessCodeController::class, 'verify'])->name('jurnal.access-code.verify');
    Route::post('/jurnal/access-code/exit', [JurnalAccessCodeController::class, 'exitSubstituteMode'])->name('jurnal.access-code.exit');
    Route::post('/jurnal/access-code/revoke', [JurnalAccessCodeController::class, 'revoke'])->name('jurnal.access-code.revoke');



    Route::get('/notifikasi', function () {
        return Inertia::render('Notifikasi');
    })->name('notifikasi');

    // Settings Route
    Route::get('/settings', function () {
        return Inertia::render('Settings');
    })->name('settings');

    // Security Route
    Route::get('/security', function () {
        return Inertia::render('Security');
    })->name('security');

    // Academic Routes
    Route::get('/nilai', [App\Http\Controllers\NilaiController::class, 'index'])->name('nilai.index');
    Route::get('/nilai/show/{kelas_id}/{mata_pelajaran_id}', [App\Http\Controllers\NilaiController::class, 'show'])->name('nilai.show');
    Route::get('/nilai/create/{jadwal_id}', [App\Http\Controllers\NilaiController::class, 'create'])->name('nilai.create');
    Route::post('/nilai/store', [App\Http\Controllers\NilaiController::class, 'store'])->name('nilai.store');
    Route::put('/nilai/update/{id}', [App\Http\Controllers\NilaiController::class, 'update'])->name('nilai.update');
    Route::delete('/nilai/destroy/{id}', [App\Http\Controllers\NilaiController::class, 'destroy'])->name('nilai.destroy');
    Route::post('/nilai/save-grades', [App\Http\Controllers\NilaiController::class, 'saveGrades'])->name('nilai.saveGrades');
    Route::get('/kesehatan', [App\Http\Controllers\KesehatanController::class, 'index'])->name('kesehatan.index');
    Route::get('/laporan', [App\Http\Controllers\LaporanController::class, 'index'])->name('laporan.index');
    Route::get('/laporan/jurnal-mengajar', [App\Http\Controllers\LaporanJurnalController::class, 'index'])->name('laporan.jurnal.index');
    Route::get('/laporan/jurnal-mengajar/export', [App\Http\Controllers\LaporanJurnalController::class, 'exportPdf'])->name('laporan.jurnal.export');

    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
});

require __DIR__ . '/auth.php';
Route::get('/achievements', function () {
    return Inertia::render('Achievements/Index');
})->name('achievements.index');
Route::get('/prestasi/list', [App\Http\Controllers\PrestasiController::class, 'publicIndex'])->name('prestasi.public-index');
Route::resource('kalender-akademik', App\Http\Controllers\KalenderAkademikController::class)->except(['show']);
