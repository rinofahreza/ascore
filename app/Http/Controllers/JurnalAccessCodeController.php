<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class JurnalAccessCodeController extends Controller
{
    public function generate(Request $request)
    {
        $request->validate([
            'days' => 'required|integer|min:1|max:30',
        ]);

        $user = auth()->user();

        // Check for existing active code that hasn't expired
        $existingCode = $user->accessCodes()
            ->where('is_active', true)
            ->where('expires_at', '>', now())
            ->first();

        if ($existingCode) {
            return response()->json([
                'success' => false,
                'message' => 'Anda masih memiliki kode akses yang aktif. Harap hapus kode lama sebelum membuat yang baru.',
                'code' => $existingCode->code
            ], 400);
        }

        // Generate unique code
        $code = 'JRNL-' . mt_rand(10000, 99999);

        while (\App\Models\JurnalAccessCode::where('code', $code)->exists()) {
            $code = 'JRNL-' . mt_rand(10000, 99999);
        }

        $days = $request->input('days', 1);

        $accessCode = \App\Models\JurnalAccessCode::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => now()->addDays($days),
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'code' => $code,
            'expires_at' => $accessCode->expires_at->format('d M Y H:i'),
        ]);
    }

    public function revoke()
    {
        $user = auth()->user();
        $user->accessCodes()
            ->where('is_active', true)
            ->update(['is_active' => false]);

        return response()->json(['success' => true, 'message' => 'Kode akses berhasil dinonaktifkan.']);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $accessCode = \App\Models\JurnalAccessCode::where('code', $request->code)
            ->where('is_active', true)
            ->where('expires_at', '>', now())
            ->first();

        if (!$accessCode) {
            return back()->withErrors(['error' => 'Kode akses tidak valid atau sudah kadaluarsa.']);
        }

        if ($accessCode->user_id === auth()->id()) {
            return back()->withErrors(['error' => 'Anda tidak bisa menggunakan kode akses milik sendiri.']);
        }

        // Set session for substitute mode
        session(['jurnal_substitute_for' => $accessCode->user_id]);

        return redirect()->route('jurnal.index')->with('success', 'Berhasil masuk ke mode guru pengganti. Anda sekarang mengakses jurnal a.n. ' . $accessCode->user->name);
    }

    public function exitSubstituteMode()
    {
        session()->forget('jurnal_substitute_for');
        return redirect()->route('jurnal.index')->with('success', 'Anda telah keluar dari mode guru pengganti.');
    }
}
