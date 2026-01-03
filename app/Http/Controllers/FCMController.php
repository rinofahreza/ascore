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
        \Log::info("FCM Token Update Request for User: " . $user->id . " Token: " . substr($request->token, 0, 20) . "...");
        $user->update(['fcm_token' => $request->token]);
        \Log::info("FCM Token Updated Successfully for User: " . $user->id);

        return response()->json(['message' => 'Token updated successfully']);
    }
}
