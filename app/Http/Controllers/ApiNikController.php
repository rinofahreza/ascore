<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class ApiNikController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:user.create');
    }
    public function index()
    {
        $cabangs = \App\Models\Cabang::all();
        $departemens = \App\Models\Departemen::all();
        $roles = \App\Models\Role::all();

        return Inertia::render('ApiNik/Index', [
            'cabangs' => $cabangs,
            'departemens' => $departemens,
            'roles' => $roles,
        ]);
    }

    public function execute(Request $request)
    {
        $request->validate([
            'http_request' => 'required|string',
            'nik' => 'required|string',
        ]);

        $rawRequest = $request->input('http_request');
        $nik = $request->input('nik');

        // Parse the raw request
        $lines = explode("\n", $rawRequest);
        $firstLine = array_shift($lines);

        // Parse Method and Path from first line (e.g., "GET /nik?nik=$nik HTTP/1.1")
        if (!preg_match('/^([A-Z]+)\s+([^\s]+)\s+HTTP\/\d\.\d$/', trim($firstLine), $matches)) {
            return response()->json(['error' => 'Invalid HTTP Request Request Line'], 400);
        }

        $method = $matches[1];
        $path = $matches[2];

        // Parse Headers
        $headers = [];
        $host = '';
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line))
                continue;

            if (strpos($line, ':') !== false) {
                list($key, $value) = explode(':', $line, 2);
                $key = trim($key);
                $value = trim($value);
                $headers[$key] = $value;

                if (strtolower($key) === 'host') {
                    $host = $value;
                }
            }
        }

        if (empty($host)) {
            return response()->json(['error' => 'Host header is required'], 400);
        }

        // Variable Substitution
        $path = str_replace('$nik', $nik, $path);

        // Construct Full URL (Assuming HTTPS for external APIs mostly)
        $url = "https://{$host}{$path}";

        try {
            // Execute Request
            /** @var \Illuminate\Http\Client\Response $response */
            $response = Http::withHeaders($headers)->send($method, $url);

            return response()->json([
                'status' => $response->status(),
                'data' => $response->json() ?? $response->body(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function sync(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'role_id' => 'required|exists:roles,id',
            'cabang_id' => 'required|exists:cabangs,id',
            'departemen_id' => 'nullable|exists:departemens,id',
            'is_active' => 'boolean',
            'nik' => 'required|string',
            'nama' => 'required|string',
            'status' => 'nullable|string',
            // Identity Fields
            'no_kk' => 'nullable|string',
            'tempat_lahir' => 'nullable|string',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|string',
            'alamat' => 'nullable|string',
            'rt_rw' => 'nullable|string',
            'kelurahan_desa' => 'nullable|string',
            'kecamatan' => 'nullable|string',
            'agama' => 'nullable|string',
            'status_perkawinan' => 'nullable|string',
            'pekerjaan' => 'nullable|string',
            'pendidikan_terakhir' => 'nullable|string',
            'kabupaten_kota' => 'nullable|string',
            'provinsi' => 'nullable|string',
        ]);

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            // 1. Create User
            $user = \App\Models\User::create([
                'name' => $validated['nama'], // Use name from API result
                'email' => $validated['email'],
                'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
                'role_id' => $validated['role_id'],
                'cabang_id' => $validated['cabang_id'],
                'departemen_id' => $validated['departemen_id'],
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // 2. Determine Role and Create Profile
            $role = \App\Models\Role::find($validated['role_id']);
            $roleName = strtolower($role->nama);

            // Common identity data
            $identityData = [
                'nik' => $validated['nik'],
                'no_kk' => $validated['no_kk'] ?? null,
                'tempat_lahir' => $validated['tempat_lahir'] ?? null,
                'tanggal_lahir' => $validated['tanggal_lahir'] ?? null,
                'jenis_kelamin' => $validated['jenis_kelamin'] ?? null,
                'alamat' => $validated['alamat'] ?? null,
                'rt_rw' => $validated['rt_rw'] ?? null,
                'kelurahan_desa' => $validated['kelurahan_desa'] ?? null,
                'kecamatan' => $validated['kecamatan'] ?? null,
                'kabupaten_kota' => $validated['kabupaten_kota'] ?? null,
                'provinsi' => $validated['provinsi'] ?? null,
                'agama' => $validated['agama'] ?? null,
                'status_perkawinan' => $validated['status_perkawinan'] ?? null,
                'pekerjaan' => $validated['pekerjaan'] ?? null,
                'pendidikan_terakhir' => $validated['pendidikan_terakhir'] ?? null,
            ];

            if ($roleName === 'siswa') {
                \App\Models\Siswa::create(array_merge([
                    'user_id' => $user->id,
                    'role_id' => $validated['role_id'],
                    'status_siswa' => 'Aktif',
                ], $identityData));
            } elseif ($roleName === 'guru') {
                \App\Models\Guru::create(array_merge([
                    'user_id' => $user->id,
                    'role_id' => $validated['role_id'],
                    'status_kepegawaian' => $validated['status'] ?? 'Tetap',
                ], $identityData));
            } else {
                \App\Models\Karyawan::create(array_merge([
                    'user_id' => $user->id,
                    'role_id' => $validated['role_id'],
                    'status_kepegawaian' => $validated['status'] ?? 'Tetap',
                ], $identityData));
            }

            \Illuminate\Support\Facades\DB::commit();

            return response()->json(['message' => 'User synced successfully', 'user_id' => $user->id], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['error' => 'Failed to sync user: ' . $e->getMessage()], 500);
        }
    }
    public function batchSync(Request $request)
    {
        $payloads = $request->input('users', []);

        if (empty($payloads)) {
            return response()->json(['message' => 'No data provided'], 400);
        }

        $successCount = 0;
        $errors = [];

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            foreach ($payloads as $index => $data) {
                try {
                    // Manual validation for each item
                    if (empty($data['email']) || empty($data['password']) || empty($data['role_id']) || empty($data['cabang_id'])) {
                        throw new \Exception("Missing required fields for row $index");
                    }

                    // Check if email already exists
                    if (\App\Models\User::where('email', $data['email'])->exists()) {
                        // Skip or throw? Let's throw to record error
                        throw new \Exception("Email {$data['email']} already exists");
                    }

                    // 1. Create User
                    $user = \App\Models\User::create([
                        'name' => $data['nama'],
                        'email' => $data['email'],
                        'password' => \Illuminate\Support\Facades\Hash::make($data['password']),
                        'role_id' => $data['role_id'],
                        'cabang_id' => $data['cabang_id'],
                        'departemen_id' => $data['departemen_id'] ?? null,
                        'is_active' => $data['is_active'] ?? true,
                    ]);

                    // 2. Determine Role and Create Profile
                    $role = \App\Models\Role::find($data['role_id']);
                    $roleName = strtolower($role->nama);

                    $identityData = [
                        'nik' => $data['nik'],
                        'no_kk' => $data['no_kk'] ?? null,
                        'tempat_lahir' => $data['tempat_lahir'] ?? null,
                        'tanggal_lahir' => $data['tanggal_lahir'] ?? null,
                        'jenis_kelamin' => $data['jenis_kelamin'] ?? null,
                        'alamat' => $data['alamat'] ?? null,
                        'rt_rw' => $data['rt_rw'] ?? null,
                        'kelurahan_desa' => $data['kelurahan_desa'] ?? null,
                        'kecamatan' => $data['kecamatan'] ?? null,
                        'kabupaten_kota' => $data['kabupaten_kota'] ?? null,
                        'provinsi' => $data['provinsi'] ?? null,
                        'agama' => $data['agama'] ?? null,
                        'status_perkawinan' => $data['status_perkawinan'] ?? null,
                        'pekerjaan' => $data['pekerjaan'] ?? null,
                        'pendidikan_terakhir' => $data['pendidikan_terakhir'] ?? null,
                    ];

                    if ($roleName === 'siswa') {
                        \App\Models\Siswa::create(array_merge([
                            'user_id' => $user->id,
                            'role_id' => $data['role_id'],
                            'status_siswa' => 'Aktif',
                        ], $identityData));
                    } elseif ($roleName === 'guru') {
                        \App\Models\Guru::create(array_merge([
                            'user_id' => $user->id,
                            'role_id' => $data['role_id'],
                            'status' => $data['status'] ?? 'Tetap', // Fixed column name from status_kepegawaian to status
                        ], $identityData));
                    } else {
                        \App\Models\Karyawan::create(array_merge([
                            'user_id' => $user->id,
                            'role_id' => $data['role_id'],
                            'status' => $data['status'] ?? 'Tetap', // Fixed column name from status_kepegawaian to status
                        ], $identityData));
                    }

                    $successCount++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'nik' => $data['nik'] ?? 'Unknown',
                        'error' => $e->getMessage()
                    ];
                }
            }

            \Illuminate\Support\Facades\DB::commit();

            return response()->json([
                'message' => "Successfully synced {$successCount} users",
                'success_count' => $successCount,
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['error' => 'Batch sync failed: ' . $e->getMessage()], 500);
        }
    }
}
