import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import OfflineIndicator from '@/Components/OfflineIndicator';
import ThemeColorPicker from '@/Components/ThemeColorPicker';
import AvatarUploadModal from '@/Components/AvatarUploadModal';
import { useState, useEffect } from 'react';
import useThemeColor from '@/Hooks/useThemeColor';
import { Link, usePage } from '@inertiajs/react';
import { messaging, getFcmToken } from '../firebase';
import axios from 'axios';

export default function AuthenticatedLayout({ header, children, hideNav, forceMenu = false }) {
    // ... (keep existing hook calls)
    const { currentColor, changeColor, colors } = useThemeColor();
    const { url, props } = usePage();
    const user = props.auth?.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const [isKontrolAksesOpen, setIsKontrolAksesOpen] = useState(false);
    const [isKurikulumOpen, setIsKurikulumOpen] = useState(false);
    const [isAkademikOpen, setIsAkademikOpen] = useState(false);
    const [isKesiswaanOpen, setIsKesiswaanOpen] = useState(false);
    const [isPoinOpen, setIsPoinOpen] = useState(false);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [theme, setTheme] = useState('light');

    // Determine if we should show back button instead of hamburger
    const subPages = ['/profile', '/security', '/nilai', '/profile/edit', '/absensi', '/jadwal', '/berkas', '/jurnal', '/settings', '/kalender-akademik', '/notifikasi', '/achievements', '/kesehatan', '/laporan', '/prestasi/list'];
    const isSubPage = !forceMenu && subPages.some(page => url.startsWith(page));

    // Permission Helper
    const hasPermission = (permission) => {
        const userRole = props.auth?.role; // Role name from HandleInertiaRequests
        const userPermissions = props.auth?.permissions || [];
        return userRole === 'Admin' || userPermissions.includes(permission);
    };

    // Auto-open parent menus based on current route
    useEffect(() => {
        // Auto-open submenus based on current route
        if (route().current('user.*') || route().current('role.*')) {
            setIsKontrolAksesOpen(true);
        }
        if (route().current('mata-pelajaran.*') || route().current('jam-pelajaran.*')) {
            setIsKurikulumOpen(true);
        }

        // Akademik submenu routes
        if (route().current('periode-akademik.*') || route().current('semester-akademik.*') || route().current('jadwal-pelajaran.*')) {
            setIsAkademikOpen(true);
        }

        // Kesiswaan submenu routes

        // Poin submenu routes
        if (route().current('poin.*') || route().current('pelanggaran.*')) {
            setIsKesiswaanOpen(true);
            setIsPoinOpen(true);
        }
        if (route().current('kelas.*') || route().current('guru.*') || route().current('siswa.*') || route().current('level.*')) {
            setIsKesiswaanOpen(true);
        }

        // Kontrol Akses submenu routes
        if (route().current('role.*') || route().current('pengguna.*')) {
            setIsKontrolAksesOpen(true);
        }
    }, [url]); // Re-run when URL changes

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');

        // Request Notification Permission
        const requestNotificationPermission = async () => {
            if ('Notification' in window && messaging) {
                try {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        const currentToken = await getFcmToken();

                        if (currentToken) {
                            if (props.auth.user) {
                                await axios.post(route('fcm.update'), { token: currentToken });
                                console.log('FCM Token refreshed');
                            }
                        } else {
                            console.log('No registration token available. Request permission to generate one.');
                        }
                    }
                } catch (err) {
                    console.log('An error occurred while retrieving token. ', err);
                }
            }
        };

        requestNotificationPermission();
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <OfflineIndicator />
            {!hideNav && (
                <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 left-0 right-0 z-50 safe-area-top pt-10 pb-1">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            {/* Left: Hamburger or Back Button */}
                            <div className="flex items-center w-24">
                                {isSubPage ? (
                                    <button
                                        onClick={() => window.history.back()}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <svg className="h-6 w-6 text-gray-600 dark:text-gray-300" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Center: App Name - Absolutely Centered */}
                            <div className="absolute left-1/2 transform -translate-x-1/2">
                                <div className="text-center">
                                    <h1
                                        className="text-xl font-black tracking-tight"
                                        style={{
                                            background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-light))`,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        ASCORE
                                    </h1>
                                </div>
                            </div>

                            {/* Right: Action Buttons */}
                            <div className="flex items-center space-x-2 w-32 justify-end">
                                {/* Theme Color Picker Button */}
                                <button
                                    onClick={() => setIsColorPickerOpen(true)}
                                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    aria-label="Change theme color"
                                >
                                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                    </svg>
                                </button>

                                {/* Clear Cache Button */}
                                <button
                                    onClick={async () => {
                                        try {
                                            // Unregister all service workers
                                            if ('serviceWorker' in navigator) {
                                                const registrations = await navigator.serviceWorker.getRegistrations();
                                                for (let registration of registrations) {
                                                    await registration.unregister();
                                                }
                                            }
                                            // Clear all caches
                                            if ('caches' in window) {
                                                const cacheNames = await caches.keys();
                                                await Promise.all(
                                                    cacheNames.map(cacheName => caches.delete(cacheName))
                                                );
                                            }
                                            // Clear localStorage
                                            localStorage.clear();
                                            // Force reload
                                            window.location.reload(true);
                                        } catch (error) {
                                            console.error('Error clearing cache:', error);
                                        }
                                    }}
                                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    aria-label="Clear cache"
                                >
                                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>

                                {/* Theme Toggle Removed */}
                            </div>
                        </div>
                    </div>
                </nav >
            )}

            {/* Backdrop Overlay */}
            {
                showingNavigationDropdown && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setShowingNavigationDropdown(false)}
                    />
                )
            }

            {/* Slide-in Sidebar from Right */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-[70] ${showingNavigationDropdown ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full safe-area-inset">
                    {/* Header with User Profile - Centered Design */}
                    <div
                        className="relative pt-12 pb-8 px-6"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))'
                        }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowingNavigationDropdown(false)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>


                        {/* User Profile - Centered */}
                        <div className="flex flex-col items-center text-center">
                            {/* Avatar */}
                            <div
                                className="relative w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center mb-4 ring-4 ring-white/30 overflow-hidden group cursor-pointer"
                                onClick={() => setIsAvatarModalOpen(true)}
                            >
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-pink-500 bg-clip-text text-transparent">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                )}

                                {/* Camera Icon Overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Name */}
                            <h2 className="text-xl font-bold text-white mb-1">
                                {user.name}
                            </h2>

                            {/* Email/Role */}
                            {/* Email/Role */}
                            <p className="text-sm text-white/90">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto py-4">
                        <div className="space-y-1 px-3">
                            <ResponsiveNavLink
                                href={route('home')}
                                active={route().current('home')}
                                themeColor={currentColor}
                            >
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span>Home</span>
                                </div>
                            </ResponsiveNavLink>

                            {/* ORGANISASI Group */}
                            {(hasPermission('cabang.view') || hasPermission('departemen.view') || hasPermission('karyawan.view')) && (
                                <div className="pt-4 pb-2">
                                    <div className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        ORGANISASI
                                    </div>
                                </div>
                            )}

                            {hasPermission('cabang.view') && (
                                <ResponsiveNavLink themeColor={currentColor}
                                    href={route('cabang.index')}
                                    active={route().current('cabang.*')}
                                >
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span>Cabang</span>
                                    </div>
                                </ResponsiveNavLink>
                            )}

                            {hasPermission('departemen.view') && (
                                <ResponsiveNavLink themeColor={currentColor}
                                    href={route('departemen.index')}
                                    active={route().current('departemen.*')}
                                >
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span>Departemen</span>
                                    </div>
                                </ResponsiveNavLink>
                            )}

                            {hasPermission('karyawan.view') && (
                                <ResponsiveNavLink themeColor={currentColor}
                                    href={route('karyawan.index')}
                                    active={route().current('karyawan.*')}
                                >
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span>Karyawan</span>
                                    </div>
                                </ResponsiveNavLink>
                            )}

                            {/* APLIKASI Group */}
                            {(hasPermission('role.view') || hasPermission('user.view') || hasPermission('slider.view')) && (
                                <div className="pt-4 pb-2">
                                    <div className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        APLIKASI
                                    </div>
                                </div>
                            )}

                            {/* Kontrol Akses Dropdown */}
                            {(hasPermission('role.view') || hasPermission('user.view')) && (
                                <div>
                                    <button
                                        onClick={() => setIsKontrolAksesOpen(!isKontrolAksesOpen)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition ${isKontrolAksesOpen
                                            ? ''
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                        style={isKontrolAksesOpen ? {
                                            color: currentColor,
                                            backgroundColor: `${currentColor}15`
                                        } : {}}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            <span>Kontrol Akses</span>
                                        </div>
                                        <svg
                                            className={`w-4 h-4 transition-transform ${isKontrolAksesOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Submenu */}
                                    {isKontrolAksesOpen && (
                                        <div className="ml-8 mt-1 space-y-1">
                                            {hasPermission('role.view') && (
                                                <ResponsiveNavLink themeColor={currentColor}
                                                    href={route('settings.roles.index')}
                                                    active={route().current('settings.roles.*')}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                        </svg>
                                                        <span>Role Manajemen</span>
                                                    </div>
                                                </ResponsiveNavLink>
                                            )}
                                            {hasPermission('user.view') && (
                                                <ResponsiveNavLink themeColor={currentColor}
                                                    href={route('pengguna.index')}
                                                    active={route().current('pengguna.*')}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                        </svg>
                                                        <span>Pengguna</span>
                                                    </div>
                                                </ResponsiveNavLink>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {hasPermission('slider.view') && (
                                <div className="mt-1">
                                    <ResponsiveNavLink themeColor={currentColor}
                                        href={route('settings.sliders.index')}
                                        active={route().current('settings.sliders.*')}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>Slider Gambar</span>
                                        </div>
                                    </ResponsiveNavLink>
                                </div>
                            )}

                            {/* SEKOLAH Group */}
                            {(hasPermission('mata_pelajaran.view') || hasPermission('jam_pelajaran.view') || hasPermission('periode_akademik.view') || hasPermission('jadwal_pelajaran.view') || hasPermission('kelas.view') || hasPermission('guru.view') || hasPermission('siswa.view') || hasPermission('poin.view') || hasPermission('pelanggaran.view')) && (
                                <div className="pt-4 pb-2">
                                    <div className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        SEKOLAH
                                    </div>
                                </div>
                            )}

                            {/* Kurikulum Dropdown */}
                            {(hasPermission('mata_pelajaran.view') || hasPermission('jam_pelajaran.view')) && (
                                <div>
                                    <button
                                        onClick={() => setIsKurikulumOpen(!isKurikulumOpen)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition ${isKurikulumOpen
                                            ? ''
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                        style={isKurikulumOpen ? {
                                            color: currentColor,
                                            backgroundColor: `${currentColor}15`
                                        } : {}}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            <span>Kurikulum</span>
                                        </div>
                                        <svg
                                            className={`w-4 h-4 transition-transform ${isKurikulumOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Submenu */}
                                    {isKurikulumOpen && (
                                        <div className="ml-8 mt-1 space-y-1">
                                            {hasPermission('mata_pelajaran.view') && (
                                                <ResponsiveNavLink themeColor={currentColor}
                                                    href={route('mata-pelajaran.index')}
                                                    active={route().current('mata-pelajaran.*')}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <span>Mata Pelajaran</span>
                                                    </div>
                                                </ResponsiveNavLink>
                                            )}
                                            {hasPermission('jam_pelajaran.view') && (
                                                <ResponsiveNavLink themeColor={currentColor}
                                                    href={route('jam-pelajaran.index')}
                                                    active={route().current('jam-pelajaran.*')}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>Jam Pelajaran</span>
                                                    </div>
                                                </ResponsiveNavLink>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Akademik Dropdown */}
                            {(hasPermission('periode_akademik.view') || hasPermission('jadwal_pelajaran.view') || hasPermission('kalender.view') || hasPermission('prestasi.view')) && (
                                <div>
                                    <button
                                        onClick={() => setIsAkademikOpen(!isAkademikOpen)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition ${isAkademikOpen
                                            ? ''
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                        style={isAkademikOpen ? {
                                            color: currentColor,
                                            backgroundColor: `${currentColor}15`
                                        } : {}}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                            </svg>
                                            <span>Akademik</span>
                                        </div>
                                        <svg
                                            className={`w-4 h-4 transition-transform ${isAkademikOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Submenu */}
                                    {isAkademikOpen && (
                                        <div className="ml-8 mt-1 space-y-1">
                                            {hasPermission('periode_akademik.view') && (
                                                <ResponsiveNavLink themeColor={currentColor}
                                                    href={route('periode-akademik.index')}
                                                    active={route().current('periode-akademik.*')}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>Periode Akademik</span>
                                                    </div>
                                                </ResponsiveNavLink>
                                            )}
                                            {/* Semester Akademik uses Periode Akademik permission since it's missing specific permission */}
                                            {hasPermission('periode_akademik.view') && (
                                                <ResponsiveNavLink themeColor={currentColor}
                                                    href={route('semester-akademik.index')}
                                                    active={route().current('semester-akademik.*')}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        <span>Semester Akademik</span>
                                                    </div>
                                                </ResponsiveNavLink>
                                            )}
                                            {hasPermission('jadwal_pelajaran.view') && (
                                                <ResponsiveNavLink themeColor={currentColor}
                                                    href={route('jadwal-pelajaran.index')}
                                                    active={route().current('jadwal-pelajaran.*')}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>Jadwal Pelajaran</span>
                                                    </div>
                                                </ResponsiveNavLink>
                                            )}
                                            {hasPermission('kalender.view') && (
                                                <ResponsiveNavLink themeColor={currentColor}
                                                    href={route('kalender-akademik.index')}
                                                    active={route().current('kalender-akademik.*')}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>Kalender Akademik</span>
                                                    </div>
                                                </ResponsiveNavLink>
                                            )}

                                            <ResponsiveNavLink themeColor={currentColor}
                                                href={route('prestasi.index')}
                                                active={route().current('prestasi.*')}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                    </svg>
                                                    <span>Prestasi GuKar</span>
                                                </div>
                                            </ResponsiveNavLink>

                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Kesiswaan Dropdown */}
                            {(hasPermission('kelas.view') || hasPermission('guru.view') || hasPermission('siswa.view') || hasPermission('poin.view') || hasPermission('pelanggaran.view')) && (
                                <div>
                                    <button
                                        onClick={() => setIsKesiswaanOpen(!isKesiswaanOpen)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition ${isKesiswaanOpen
                                            ? ''
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                        style={isKesiswaanOpen ? {
                                            color: currentColor,
                                            backgroundColor: `${currentColor}15`
                                        } : {}}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            <span>Kesiswaan</span>
                                        </div>
                                        <svg
                                            className={`w-4 h-4 transition-transform ${isKesiswaanOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Submenu */}
                                    {isKesiswaanOpen && (
                                        <div className="ml-8 mt-1 space-y-1">
                                            {hasPermission('kelas.view') && (
                                                <ResponsiveNavLink themeColor={currentColor}
                                                    href={route('kelas.index')}
                                                    active={route().current('kelas.*')}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                        <span>Kelas</span>
                                                    </div>
                                                </ResponsiveNavLink>
                                            )}
                                            {hasPermission('guru.view') && (
                                                <ResponsiveNavLink themeColor={currentColor}
                                                    href={route('guru.index')}
                                                    active={route().current('guru.*')}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        <span>Guru</span>
                                                    </div>
                                                </ResponsiveNavLink>
                                            )}
                                            {hasPermission('siswa.view') && (
                                                <ResponsiveNavLink themeColor={currentColor}
                                                    href={route('siswa.index')}
                                                    active={route().current('siswa.*')}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                        </svg>
                                                        <span>Siswa</span>
                                                    </div>
                                                </ResponsiveNavLink>
                                            )}

                                            {/* Using kelas.view as fallback for Level since strict permission might be missing */}
                                            {hasPermission('kelas.view') && (
                                                <ResponsiveNavLink themeColor={currentColor}
                                                    href={route('level.index')}
                                                    active={route().current('level.*')}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                                        </svg>
                                                        <span>Level</span>
                                                    </div>
                                                </ResponsiveNavLink>
                                            )}

                                            {/* Poin Nested Menu */}
                                            {(hasPermission('poin.view') || hasPermission('pelanggaran.view')) && (
                                                <div>
                                                    <button
                                                        onClick={() => setIsPoinOpen(!isPoinOpen)}
                                                        className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 text-base font-medium transition duration-150 ease-in-out focus:outline-none ${isPoinOpen
                                                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300'
                                                            : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between w-full">
                                                            <div className="flex items-center space-x-3">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <span>Poin</span>
                                                            </div>
                                                            <svg
                                                                className={`w-4 h-4 transition-transform ${isPoinOpen ? 'rotate-180' : ''}`}
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                    </button>

                                                    {/* Poin Submenu */}
                                                    {isPoinOpen && (
                                                        <div className="ml-8 mt-1 space-y-1">
                                                            {hasPermission('poin.view') && (
                                                                <ResponsiveNavLink themeColor={currentColor}
                                                                    href={route('poin.index')}
                                                                    active={route().current('poin.*')}
                                                                >
                                                                    <div className="flex items-center space-x-3">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                        <span>Data</span>
                                                                    </div>
                                                                </ResponsiveNavLink>
                                                            )}
                                                            {hasPermission('pelanggaran.view') && (
                                                                <ResponsiveNavLink
                                                                    href={route('pelanggaran.index')}
                                                                    themeColor={currentColor}
                                                                    active={route().current('pelanggaran.*')}
                                                                >
                                                                    <div className="flex items-center space-x-3">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                        </svg>
                                                                        <span>Pelanggaran</span>
                                                                    </div>
                                                                </ResponsiveNavLink>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-4"></div>




                            <ResponsiveNavLink href={route('settings')} >
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>Settings</span>
                                </div>
                            </ResponsiveNavLink>

                            <ResponsiveNavLink
                                href={route('logout')}
                                themeColor={currentColor}
                                method="post"
                                as="button"
                            >
                                <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span className="font-semibold">Logout</span>
                                </div>
                            </ResponsiveNavLink>
                        </div>
                    </div>

                    {/* Footer - Social Media & Copyright */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        {/* Social Media Icons */}
                        <div className="flex items-center justify-center space-x-6 mb-4">
                            {/* Facebook */}
                            <a
                                href="#"
                                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                aria-label="Facebook"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>

                            {/* Instagram */}
                            <a
                                href="#"
                                className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                                aria-label="Instagram"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>

                            {/* TikTok */}
                            <a
                                href="#"
                                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                                aria-label="TikTok"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                            </a>
                        </div>

                        {/* Copyright */}
                    </div>
                </div>
            </div>
            {
                header && (
                    <header className="bg-white shadow dark:bg-gray-800 pt-header">
                        <div className="mx-auto max-w-7xl px-4 pt-3 pb-1 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )
            }

            <main>{children}</main>

            {/* Theme Color Picker Modal */}
            <ThemeColorPicker
                isOpen={isColorPickerOpen}
                onClose={() => setIsColorPickerOpen(false)}
                currentColor={currentColor}
                onColorChange={changeColor}
                colors={colors}
            />

            {/* Avatar Upload Modal */}
            <AvatarUploadModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                currentAvatarUrl={user.avatar_url}
            />
        </div >
    );
}
