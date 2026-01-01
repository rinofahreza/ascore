import { useState, useEffect, useRef } from 'react';

export default function ImageSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef(null);

    const slides = [
        {
            image: '/images/slider/slider_image_1_1766334301911.png',
            title: 'Lingkungan Belajar yang Asri',
            description: 'Suasana belajar yang nyaman dengan taman hijau'
        },
        {
            image: '/images/slider/slider_image_2_1766334341504.png',
            title: 'Fasilitas Modern',
            description: 'Ruang kelas dilengkapi teknologi terkini'
        },
        {
            image: '/images/slider/slider_image_3_1766334368480.png',
            title: 'Masjid yang Megah',
            description: 'Tempat ibadah yang indah dan nyaman'
        },
        {
            image: '/images/slider/slider_image_4_1766334393950.png',
            title: 'Aktivitas Olahraga',
            description: 'Fasilitas olahraga lengkap untuk siswa'
        },
        {
            image: '/images/slider/slider_image_5_1766334420330.png',
            title: 'Perpustakaan Modern',
            description: 'Koleksi buku lengkap untuk menunjang pembelajaran'
        }
    ];

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        resetTimeout();
        timeoutRef.current = setTimeout(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === slides.length - 1 ? 0 : prevIndex + 1
            );
        }, 4000);

        return () => {
            resetTimeout();
        };
    }, [currentIndex]);

    return (
        <div className="bg-white dark:bg-gray-800 px-4 pt-2 pb-0">
            <div className="mx-auto max-w-7xl relative group">
                <div className="relative overflow-hidden rounded-xl aspect-[2/1] md:aspect-[2.5/1] shadow-lg">
                    <div
                        className="whitespace-nowrap transition-transform duration-1000 ease-in-out h-full"
                        style={{ transform: `translate3d(${-currentIndex * 100}%, 0, 0)` }}
                    >
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className="inline-block w-full h-full relative"
                            >
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination Dots (Moon Icons) */}
                <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`transition-all duration-300 ${currentIndex === index
                                ? 'text-[var(--color-primary)] scale-125'
                                : 'text-gray-300 hover:text-gray-400'
                                }`}
                            onClick={() => setCurrentIndex(index)}
                        >
                            {/* Moon Icon / Dot */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4">
                                <circle cx="12" cy="12" r="12" />
                            </svg>
                        </button>
                    ))}
                </div>
            </div>
            {/* Spacer for dots */}
            <div className="h-4"></div>
        </div>
    );
}
