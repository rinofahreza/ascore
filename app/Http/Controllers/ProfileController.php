<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $user->load(['guru', 'siswa', 'karyawan']);

        $personalData = null;
        if ($user->guru) {
            $personalData = $user->guru;
        } elseif ($user->siswa) {
            $personalData = $user->siswa;
        } elseif ($user->karyawan) {
            $personalData = $user->karyawan;
        }

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'personalData' => $personalData,
            'userRole' => $user->role->name ?? 'User', // Send role name just in case
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        // Update User table fields
        $user->fill($request->only(['name', 'email']));

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        // Update Personal Data based on role
        $personalDataFields = $request->only([
            'no_kk',
            'nik',
            'tempat_lahir',
            'tanggal_lahir',
            'jenis_kelamin',
            'alamat',
            'rt_rw',
            'kelurahan_desa',
            'kecamatan',
            'kabupaten_kota',
            'provinsi',
            'pendidikan_terakhir'
        ]);

        if ($user->guru) {
            $user->guru->update($personalDataFields);
        } elseif ($user->siswa) {
            $user->siswa->update($personalDataFields);
        } elseif ($user->karyawan) {
            $user->karyawan->update($personalDataFields);
        }

        return Redirect::route('profile.edit');
    }

    /**
     * Update the user's avatar.
     */
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg|max:5120', // 5MB max
        ]);

        $user = $request->user();

        // Delete old avatar if exists
        if ($user->avatar) {
            Storage::disk('public')->delete('avatars/' . $user->avatar);
        }

        // Generate unique filename
        $filename = 'avatar_' . $user->id . '_' . time() . '_' . bin2hex(random_bytes(8)) . '.jpg';

        // Process and compress image
        $manager = new ImageManager(new Driver());
        $image = $manager->read($request->file('avatar'));

        // Resize to 300x300 and compress
        $image->cover(300, 300);

        // Save to storage with compression
        $path = storage_path('app/public/avatars/' . $filename);

        // Ensure directory exists
        if (!file_exists(storage_path('app/public/avatars'))) {
            mkdir(storage_path('app/public/avatars'), 0755, true);
        }

        $image->toJpeg(80)->save($path);

        // Update user record
        $user->avatar = $filename;
        $user->save();

        return response()->json([
            'avatar_url' => $user->avatar_url,
            'message' => 'Avatar updated successfully'
        ]);
    }

    /**
     * Delete the user's avatar.
     */
    public function deleteAvatar(Request $request)
    {
        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete('avatars/' . $user->avatar);
            $user->avatar = null;
            $user->save();
        }

        return response()->json([
            'message' => 'Avatar deleted successfully'
        ]);
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
