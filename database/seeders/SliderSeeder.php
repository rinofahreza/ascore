<?php

namespace Database\Seeders;

use App\Models\Slider;
use Illuminate\Database\Seeder;

class SliderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Slider::truncate();

        $sliders = [
            [
                'judul' => 'Lingkungan Belajar yang Asri',
                'gambar' => 'sliders/slider_image_1_1766334301911.png',
                'urutan' => 1,
                'status' => true,
            ],
            [
                'judul' => 'Fasilitas Modern',
                'gambar' => 'sliders/slider_image_2_1766334341504.png',
                'urutan' => 2,
                'status' => true,
            ],
            [
                'judul' => 'Masjid yang Megah',
                'gambar' => 'sliders/slider_image_3_1766334368480.png',
                'urutan' => 3,
                'status' => true,
            ],
            [
                'judul' => 'Aktivitas Olahraga',
                'gambar' => 'sliders/slider_image_4_1766334393950.png',
                'urutan' => 4,
                'status' => true,
            ],
            [
                'judul' => 'Perpustakaan Modern',
                'gambar' => 'sliders/slider_image_5_1766334420330.png',
                'urutan' => 5,
                'status' => true,
            ],
        ];

        foreach ($sliders as $slider) {
            Slider::create($slider);
        }
    }
}
