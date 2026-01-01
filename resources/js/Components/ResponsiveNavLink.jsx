import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    themeColor = '#6366f1', // default indigo-500
    ...props
}) {
    // Convert hex to RGB for transparency
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const rgb = hexToRgb(themeColor);
    const rgbString = rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '99, 102, 241'; // fallback to indigo

    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${active
                    ? 'focus:outline-none'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200 dark:focus:border-gray-600 dark:focus:bg-gray-700 dark:focus:text-gray-200'
                } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
            style={active ? {
                borderLeftColor: themeColor,
                backgroundColor: `rgba(${rgbString}, 0.1)`,
                color: themeColor,
            } : {}}
        >
            {children}
        </Link>
    );
}
