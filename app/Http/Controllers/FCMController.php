<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FCMController extends Controller
{
    public function updateToken(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $user = auth()->user();
        $user->update(['fcm_token' => $request->token]);

        return response()->json(['message' => 'Token updated successfully']);
    }
}
