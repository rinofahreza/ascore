<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class KesehatanController extends Controller
{
    public function index()
    {
        return Inertia::render('Kesehatan/Index', [
            // Mock data for initial implementation, can be replaced with DB data later
            'visits' => [
                [
                    'id' => 1,
                    'date' => '2025-10-15',
                    'complaint' => 'Sakit Kepala',
                    'diagnosis' => 'Migrain Ringan',
                    'treatment' => 'Istirahat di UKS, Obat Paracetamol',
                    'status' => 'Selesai',
                    'severity' => 'low'
                ],
                [
                    'id' => 2,
                    'date' => '2025-09-20',
                    'complaint' => 'Luka Lecet',
                    'diagnosis' => 'Luka jatuh saat olahraga',
                    'treatment' => 'Pembersihan luka, Betadine',
                    'status' => 'Selesai',
                    'severity' => 'medium'
                ]
            ],
            'summary' => [
                'total_visits' => 2,
                'last_checkup' => '15 Okt 2025'
            ]
        ]);
    }
}
