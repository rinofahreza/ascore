import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BottomNav from '@/Components/BottomNav';
import AvatarUploadModal from '@/Components/AvatarUploadModal';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Settings({ auth }) {
    // Real Dark Mode Logic
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    // Initialize state from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setIsDarkMode(savedTheme === 'dark');
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        const newTheme = newMode ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newMode);
    };

    const settingsItems = [
        {
            name: 'Keamanan',
            icon: (
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            iconBg: 'bg-teal-100 dark:bg-teal-900',
            href: route('security')
        },
        // Role Management Link (Only for admins/appropriate roles in future, for now visible)
        {
            name: 'Manajemen Role',
            icon: (
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            iconBg: 'bg-blue-100 dark:bg-blue-900',
            href: route('settings.roles.index')
        },

    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            hideNav={true}
        >
            <Head title="Profile Settings" />

            <div className="min-h-screen bg-gradient-to-b from-teal-50/50 to-white dark:from-gray-900 dark:to-gray-800 pb-24">
                {/* Header / Top Section */}
                <div className="pt-16 pb-6 px-4 text-center">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6 hidden">Profile</h1>

                    {/* Avatar */}
                    <div
                        className="relative mx-auto w-24 h-24 mb-4 cursor-pointer group"
                        onClick={() => setIsAvatarModalOpen(true)}
                    >
                        <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white dark:ring-gray-700 shadow-lg">
                            <img
                                src={auth.user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=random&color=fff&size=256`}
                                alt={auth.user.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Camera Icon Overlay */}
                        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>

                        {/* Validated Edit Pencil Icon - Bottom Right */}
                        <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg border-2 border-white dark:border-gray-800 text-gray-600 dark:text-gray-300">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                    </div>

                    {/* User Info */}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{auth.user.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{auth.user.email}</p>

                    {/* Edit Profile Button */}
                    <Link
                        href={route('profile.edit')}
                        className="inline-flex items-center px-6 py-2.5 bg-gray-800 dark:bg-gray-700 text-white text-sm font-medium rounded-full hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Profile
                    </Link>
                </div>

                {/* Settings List */}
                {/* Settings Groups */}
                <div className="px-6 max-w-lg mx-auto">
                    <div className="space-y-8">
                        {/* Group: Aplikasi */}
                        <div>
                            <h3 className="text-teal-600 dark:text-teal-400 text-sm font-bold uppercase tracking-wider mb-3 px-2">
                                Aplikasi
                            </h3>
                            <div className="space-y-1">
                                <Link
                                    href={route('security')}
                                    className="flex items-center justify-between py-2 px-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-200">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">Keamanan</h4>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav />

            <AvatarUploadModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                currentAvatarUrl={auth.user.avatar_url}
            />
        </AuthenticatedLayout>
    );
}
