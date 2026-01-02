import { useState, useEffect, useRef } from 'react';

export default function ImageSlider({ sliders = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef(null);

    // Use passed sliders or fallbacks if empty (optional, but better to show nothing or default?)
    // User requested dynamic, so we rely on DB. 
    // But we need to map DB fields to component fields if they differ.
    // DB: judul, gambar. Component: title, image.
    const slides = sliders.length > 0 ? sliders.map(s => ({
        id: s.id,
        image: `/storage/${s.gambar}`,
        title: s.judul || '',
        description: '' // DB doesn't have description yet
    })) : [];

    // If no slides, return null or empty div to avoid errors
    if (slides.length === 0) return null;

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
