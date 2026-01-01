import { useState, useEffect } from 'react';

const THEME_COLORS = {
    purple: {
        name: 'Default',
        primary: '#9333ea',
        primaryHover: '#7e22ce',
        primaryLight: '#a855f7',
    },
    red: {
        name: 'Red',
        primary: '#ef4444',
        primaryHover: '#dc2626',
        primaryLight: '#f87171',
    },
    orange: {
        name: 'Orange',
        primary: '#f97316',
        primaryHover: '#ea580c',
        primaryLight: '#fb923c',
    },
    pink: {
        name: 'Pink',
        primary: '#ec4899',
        primaryHover: '#db2777',
        primaryLight: '#f472b6',
    },
    violet: {
        name: 'Purple',
        primary: '#8b5cf6',
        primaryHover: '#7c3aed',
        primaryLight: '#a78bfa',
    },
    aqua: {
        name: 'Aqua',
        primary: '#06b6d4',
        primaryHover: '#0891b2',
        primaryLight: '#22d3ee',
    },
    teal: {
        name: 'Teal',
        primary: '#14b8a6',
        primaryHover: '#0d9488',
        primaryLight: '#2dd4bf',
    },
    mint: {
        name: 'Mint',
        primary: '#10b981',
        primaryHover: '#059669',
        primaryLight: '#34d399',
    },
    green: {
        name: 'Green',
        primary: '#22c55e',
        primaryHover: '#16a34a',
        primaryLight: '#4ade80',
    },
    grass: {
        name: 'Grass',
        primary: '#84cc16',
        primaryHover: '#65a30d',
        primaryLight: '#a3e635',
    },
    sunny: {
        name: 'Sunny',
        primary: '#eab308',
        primaryHover: '#ca8a04',
        primaryLight: '#facc15',
    },
    goldish: {
        name: 'Goldish',
        primary: '#f59e0b',
        primaryHover: '#d97706',
        primaryLight: '#fbbf24',
    },
    wood: {
        name: 'Wood',
        primary: '#a16207',
        primaryHover: '#854d0e',
        primaryLight: '#ca8a04',
    },
    gray: {
        name: 'Gray',
        primary: '#9ca3af',
        primaryHover: '#6b7280',
        primaryLight: '#d1d5db',
    },
    dark: {
        name: 'Dark',
        primary: '#374151',
        primaryHover: '#1f2937',
        primaryLight: '#4b5563',
    },
};

export default function useThemeColor() {
    const [currentColor, setCurrentColor] = useState('teal');

    useEffect(() => {
        // Load from localStorage on mount
        const savedColor = localStorage.getItem('themeColor');
        if (savedColor && THEME_COLORS[savedColor]) {
            setCurrentColor(savedColor);
            applyThemeColor(savedColor);
        } else {
            applyThemeColor('teal');
        }
    }, []);

    const applyThemeColor = (colorKey) => {
        const color = THEME_COLORS[colorKey];
        if (color) {
            // Convert hex to RGB
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            };

            const rgb = hexToRgb(color.primary);

            document.documentElement.style.setProperty('--color-primary', color.primary);
            document.documentElement.style.setProperty('--color-primary-hover', color.primaryHover);
            document.documentElement.style.setProperty('--color-primary-light', color.primaryLight);

            if (rgb) {
                document.documentElement.style.setProperty('--color-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
            }
        }
    };
    const changeColor = (colorKey) => {
        if (THEME_COLORS[colorKey]) {
            setCurrentColor(colorKey);
            applyThemeColor(colorKey);
            localStorage.setItem('themeColor', colorKey);
        }
    };

    return {
        currentColor,
        changeColor,
        colors: THEME_COLORS,
    };
}
