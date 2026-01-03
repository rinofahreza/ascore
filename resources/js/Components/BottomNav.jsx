import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function BottomNav() {
    const { url } = usePage();
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread count
    useEffect(() => {
        fetchUnreadCount();

        // Poll every 10 seconds for updates (reduced from 30s)
        const interval = setInterval(fetchUnreadCount, 10000);

        // Fetch when page becomes visible
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchUnreadCount();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const fetchUnreadCount = async () => {
        try {
            // Add timestamp to prevent caching
            const response = await axios.get(`/notifications/unread-count?t=${Date.now()}`, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });
            setUnreadCount(response.data.count || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const navItems = [
        {
            name: 'Post',
            href: '/post',
            icon: () => (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
            ),
        },
        {
            name: 'Absensi',
            href: '/absensi',
            icon: () => (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
        },
        {
            name: 'Home',
            href: '/home',
            isCenter: true,
            icon: () => (
                <div className="relative -mt-8">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                        style={{
                            background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-light), var(--color-primary))`,
                            boxShadow: `0 10px 25px -5px var(--color-primary)`
                        }}
                    >
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                </div>
            ),
        },
        {
            name: 'Kalender',
            href: '/kalender-akademik?readonly=true',
            icon: () => (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: () => (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 safe-area-bottom z-50">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="flex items-center justify-around h-20">
                    {navItems.map((item) => {
                        const isActive = url.startsWith(item.href);

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center justify-center ${item.isCenter ? 'flex-1' : 'flex-1'} active:scale-90 transition-transform duration-150`}
                            >
                                <div className={`flex flex-col items-center transition-all ${isActive
                                    ? 'scale-110'
                                    : 'opacity-60 hover:opacity-100'
                                    }`}>
                                    <div
                                        className={`mb-1 ${!isActive ? 'text-gray-600 dark:text-gray-300' : ''}`}
                                        style={{
                                            color: isActive ? 'var(--color-primary)' : undefined
                                        }}
                                    >
                                        {item.icon()}
                                    </div>
                                    <span
                                        className={`text-xs font-medium transition-colors ${isActive
                                            ? ''
                                            : 'text-gray-600 dark:text-gray-300'
                                            }`}
                                        style={{
                                            color: isActive ? 'var(--color-primary)' : undefined
                                        }}
                                    >
                                        {item.name}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
