import { useState } from 'react';
import { Transition } from '@headlessui/react';

export default function ThemeColorPicker({ isOpen, onClose, currentColor, onColorChange, colors }) {
    const colorOptions = [
        { key: 'purple', color: '#9333ea', name: 'Default' },
        { key: 'red', color: '#ef4444', name: 'Red' },
        { key: 'orange', color: '#f97316', name: 'Orange' },
        { key: 'pink', color: '#ec4899', name: 'Pink' },
        { key: 'violet', color: '#8b5cf6', name: 'Purple' },

        { key: 'aqua', color: '#06b6d4', name: 'Aqua' },
        { key: 'teal', color: '#14b8a6', name: 'Teal' },
        { key: 'mint', color: '#10b981', name: 'Mint' },
        { key: 'green', color: '#22c55e', name: 'Green' },
        { key: 'grass', color: '#84cc16', name: 'Grass' },

        { key: 'sunny', color: '#eab308', name: 'Sunny' },
        { key: 'goldish', color: '#f59e0b', name: 'Goldish' },
        { key: 'wood', color: '#a16207', name: 'Wood' },
        { key: 'gray', color: '#9ca3af', name: 'Gray' },
        { key: 'dark', color: '#374151', name: 'Dark' },
    ];

    const handleColorSelect = (colorKey) => {
        onColorChange(colorKey);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <Transition
                show={isOpen}
                enter="transition-opacity duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={onClose}
                ></div>
            </Transition>

            {/* Modal */}
            <Transition
                show={isOpen}
                enter="transition-all duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition-all duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                ASCORE
                            </h2>
                        </div>

                        {/* Color Grid - 5 columns */}
                        <div className="grid grid-cols-5 gap-4 mb-6">
                            {colorOptions.map((option) => (
                                <button
                                    key={option.key}
                                    onClick={() => handleColorSelect(option.key)}
                                    className="flex flex-col items-center gap-2 transition-transform hover:scale-110"
                                >
                                    <div
                                        className={`w-12 h-12 rounded-full shadow-lg transition-all ${currentColor === option.key
                                            ? 'ring-4 ring-offset-2 ring-gray-400 dark:ring-gray-500'
                                            : ''
                                            }`}
                                        style={{ backgroundColor: option.color }}
                                    ></div>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {option.name}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="w-full py-3 text-white font-bold rounded-xl transition-all shadow-lg"
                            style={{
                                background: `linear-gradient(to right, var(--color-primary), var(--color-primary-light))`,
                                boxShadow: `0 10px 25px -5px var(--color-primary)`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = `linear-gradient(to right, var(--color-primary-hover), var(--color-primary))`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = `linear-gradient(to right, var(--color-primary), var(--color-primary-light))`;
                            }}
                        >
                            CLOSE COLOR MENU
                        </button>
                    </div>
                </div>
            </Transition>
        </>
    );
}
