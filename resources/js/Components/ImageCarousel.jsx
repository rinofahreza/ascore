import { useState } from 'react';

export default function ImageCarousel({ images, onImageClick }) {
    if (!images || images.length === 0) return null;

    const totalImages = images.length;

    // Determine how many images to show
    let displayImages;
    let remainingCount = 0;

    if (totalImages <= 4) {
        // Show all images if 4 or less
        displayImages = images;
    } else {
        // Show 4 images with +N overlay on last one
        displayImages = images.slice(0, 4);
        remainingCount = totalImages - 4;
    }

    // Grid layout based on number of images
    const getGridClass = () => {
        if (totalImages === 1) return 'grid-cols-1';
        if (totalImages === 2) return 'grid-cols-2';
        if (totalImages === 3) return 'grid-cols-2 grid-rows-2'; // 2 columns, 2 rows
        return 'grid-cols-2'; // 4 or more
    };

    return (
        <div className={`grid ${getGridClass()} gap-0.5`}>
            {displayImages.map((image, index) => {
                // Special layout for 3 images: first image spans 2 columns
                const isFirstOfThree = totalImages === 3 && index === 0;

                // Show +N overlay on last image if there are more than 4
                const showOverlay = index === 3 && remainingCount > 0;

                return (
                    <div
                        key={index}
                        className={`relative overflow-hidden cursor-pointer ${isFirstOfThree ? 'col-span-2 row-span-1' : ''
                            }`}
                        style={{
                            aspectRatio: totalImages === 1 ? '16/9' : (isFirstOfThree ? '2/1' : '1/1'),
                            maxHeight: totalImages === 1 ? '400px' : (isFirstOfThree ? '200px' : '200px')
                        }}
                        onClick={() => onImageClick && onImageClick(image, index)}
                    >
                        <img
                            src={`/storage/${image}`}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                        />

                        {/* Overlay for remaining images (only if 5+ images) - clickable */}
                        {showOverlay && (
                            <div
                                className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center hover:bg-opacity-70 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering parent onClick
                                    onImageClick && onImageClick(image, index); // Open viewer at this image
                                }}
                            >
                                <span className="text-white text-4xl font-bold">
                                    +{remainingCount}
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
