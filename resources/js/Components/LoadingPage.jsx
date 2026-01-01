export default function LoadingPage() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-gray-950 transition-colors duration-500">
            {/* Main Content */}
            <div className="relative flex flex-col items-center">
                {/* Logo Section */}
                <div className="relative mb-6">
                    {/* Glowing effect behind */}
                    <div className="absolute inset-0 bg-[var(--color-primary)] opacity-20 blur-[60px] rounded-full animate-pulse-slow"></div>

                    {/* Logo Text */}
                    <h1
                        className="relative text-6xl md:text-7xl font-black tracking-tighter"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            filter: 'drop-shadow(0 0 20px rgba(var(--color-primary-rgb), 0.3))'
                        }}
                    >
                        ASCORE
                    </h1>
                </div>

                {/* Subtitle with typing cursor effect or just fade */}
                <div className="space-y-4 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 font-medium">
                        As-Shofa Core System
                    </p>

                    {/* Minimal Progress Line */}
                    <div className="w-24 h-1 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--color-primary)] w-full origin-left animate-progress-indeterminate rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Version or Footer (Optional, keeps it grounded) */}
            <div className="absolute bottom-10 text-xs text-gray-300 dark:text-gray-700 font-mono">
                Loading...
            </div>

            {/* Inline Styles for Custom Animations if needed, though Tailwind config should handle most. 
                Adding a custom keyframe for the progress bar if 'animate-progress-indeterminate' isn't in tailwind config yet.
                Since I can't check config easily, I'll use a standard pulse or a style tag.
            */}
            <style>{`
                @keyframes progress-indeterminate {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0%); }
                    100% { transform: translateX(100%); }
                }
                .animate-progress-indeterminate {
                    animation: progress-indeterminate 1.5s infinite linear;
                }
            `}</style>
        </div>
    );
}
