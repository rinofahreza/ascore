import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export default function ImageViewer({ isOpen, onClose, images = [], currentIndex = 0 }) {
    const [activeIndex, setActiveIndex] = useState(currentIndex);

    // Update active index when currentIndex prop changes
    useEffect(() => {
        setActiveIndex(currentIndex);
    }, [currentIndex, isOpen]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, activeIndex, images.length]);

    const goToPrevious = () => {
        setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    if (!images || images.length === 0) return null;

    const currentImage = images[activeIndex];
    const imageUrl = currentImage;
    const imageName = `image-${activeIndex + 1}`;

    const handleDownload = async () => {
        try {
            // Detect iOS
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

            if (isIOS) {
                // Try to use Share API first (iOS 12+)
                if (navigator.share && navigator.canShare) {
                    try {
                        const response = await fetch(imageUrl);
                        const blob = await response.blob();
                        const file = new File([blob], `${imageName}.jpg`, { type: 'image/jpeg' });

                        if (navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                files: [file],
                                title: 'Download Gambar',
                                text: 'Simpan gambar ini'
                            });
                            onClose();
                            return;
                        }
                    } catch (shareError) {
                        console.log('Share API failed, using fallback');
                    }
                }

                // Fallback for iOS: Open in new tab
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);

                // Open in new tab
                window.open(blobUrl, '_blank');

                // Clean up
                setTimeout(() => {
                    URL.revokeObjectURL(blobUrl);
                }, 1000);

                onClose();
            } else {
                // For other browsers: use traditional download
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = `${imageName}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Download error:', error);
            // Fallback: just open in new tab
            window.open(imageUrl, '_blank');
            onClose();
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-90" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="relative w-full max-w-5xl">
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
                                    title="Tutup"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                {/* Download Button */}
                                <button
                                    onClick={handleDownload}
                                    className="absolute -top-12 right-12 p-2 text-white hover:text-gray-300 transition-colors"
                                    title="Download"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>

                                {/* Image Counter (if multiple images) */}
                                {images.length > 1 && (
                                    <div className="absolute -top-12 left-0 text-white text-sm">
                                        {activeIndex + 1} / {images.length}
                                    </div>
                                )}

                                {/* Image */}
                                <div className="relative bg-black rounded-lg overflow-hidden">
                                    <img
                                        src={imageUrl}
                                        alt="Full size"
                                        className="w-full h-auto max-h-[85vh] object-contain"
                                    />

                                    {/* Navigation Arrows (if multiple images) */}
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={goToPrevious}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 transition-all"
                                                title="Previous (←)"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={goToNext}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 transition-all"
                                                title="Next (→)"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Hint Text */}
                                <p className="text-center text-white text-sm mt-4 opacity-75">
                                    {images.length > 1
                                        ? 'Gunakan ← → atau klik arrow untuk navigate • Klik di luar untuk menutup'
                                        : 'Klik di luar gambar untuk menutup'
                                    }
                                </p>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
