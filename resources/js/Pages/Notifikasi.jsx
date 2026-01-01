import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BottomNav from '@/Components/BottomNav';
import { Head, router, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Notifikasi({ auth }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch notifications
    useEffect(() => {
        fetchNotifications();

        // Fetch when page becomes visible
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchNotifications();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            // Add timestamp to prevent caching
            const response = await axios.get(`/notifications?t=${Date.now()}`, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });
            setNotifications(response.data.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read
        if (!notification.read_at) {
            try {
                await axios.post(`/notifications/read/${notification.id}`);
                // Update local state
                setNotifications(notifications.map(n =>
                    n.id === notification.id ? { ...n, read_at: new Date() } : n
                ));
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }

        // Navigate to single post view with comment highlight
        if (notification.data.post_id) {
            const commentId = notification.data.comment_id;
            const url = commentId
                ? `/post/${notification.data.post_id}?comment=${commentId}`
                : `/post/${notification.data.post_id}`;
            router.visit(url, {
                preserveScroll: false, // Allow scroll to comment
                preserveState: false,
            });
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, read_at: new Date() })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const getNotificationIcon = (type) => {
        if (type === 'like') {
            return (
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            );
        } else if (type === 'comment') {
            return (
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            );
        }
    };

    const getNotificationMessage = (notification) => {
        const actorName = notification.data.actor_name || 'Someone';

        if (notification.type === 'like') {
            return `${actorName} menyukai postingan Anda`;
        } else if (notification.type === 'comment') {
            const commentPreview = notification.data.comment_content?.substring(0, 50) || '';
            return `${actorName} berkomentar: "${commentPreview}${commentPreview.length >= 50 ? '...' : ''}"`;
        }
        return 'Notifikasi baru';
    };

    const unreadCount = notifications.filter(n => !n.read_at).length;

    return (
        <AuthenticatedLayout user={auth.user} header={null} hideNav={true}>
            <Head title="Notifikasi" />

            <div className="bg-white dark:bg-gray-900 min-h-screen pb-32">
                {/* Custom Header */}
                <div className="bg-white dark:bg-gray-900 sticky top-0 z-40 px-4 py-3 pt-12 safe-area-top flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <button onClick={() => window.history.back()} className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-bold font-sans tracking-wide">
                            <span className="text-gray-800 dark:text-white">SOCIAL</span>
                            <span className="text-cyan-500 ml-1">MATE</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                        <Link href={route('post.index', { saved: true })} className="hover:text-cyan-500 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                        </Link>

                        {/* Notification Icon (Active Page) */}
                        <div className="relative text-cyan-500">
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </div>
                    </div>
                </div>

                {/* Mark All Read Button */}
                {unreadCount > 0 && (
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex justify-end">
                        <button
                            onClick={markAllAsRead}
                            className="text-xs font-medium text-cyan-500 hover:text-cyan-600 flex items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Tandai semua dibaca
                        </button>
                    </div>
                )}

                <div className="px-4 py-4 space-y-4">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Memuat notifikasi...</div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            Belum ada notifikasi.
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`mb-2 bg-white dark:bg-gray-800 rounded-2xl border ${!notification.read_at ? 'border-cyan-200 dark:border-cyan-900 bg-cyan-50/10' : 'border-gray-100 dark:border-gray-700'} shadow-sm overflow-hidden relative cursor-pointer hover:border-cyan-300 transition`}
                            >
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                                                style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
                                            >
                                                {getInitials(notification.data.actor_name || 'U')}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                    {notification.data.actor_name}
                                                </p>
                                                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                    {new Date(notification.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                                                {notification.type === 'like' && 'menyukai postingan Anda.'}
                                                {notification.type === 'comment' && 'mengomentari postingan Anda:'}
                                            </p>

                                            {notification.data.comment_content && (
                                                <p className="text-sm text-gray-500 italic mt-1 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                                                    "{notification.data.comment_content.substring(0, 100)}{notification.data.comment_content.length > 100 ? '...' : ''}"
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                    </div>

                                    {!notification.read_at && (
                                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-cyan-500"></div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <BottomNav />
        </AuthenticatedLayout>
    );
}
