import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BottomNav from '@/Components/BottomNav';
import UpdatePasswordForm from './Profile/Partials/UpdatePasswordForm';
import { Head, Link } from '@inertiajs/react';

export default function Security({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            hideNav={true}
        >
            <Head title="Keamanan" />

            <div className="min-h-screen bg-white dark:bg-gray-900 pb-32">
                {/* Custom Header */}
                <div className="bg-white dark:bg-gray-900 sticky top-0 z-40 px-4 py-3 pt-12 safe-area-top flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('settings')}
                            className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <h1 className="text-xl font-bold font-sans tracking-wide text-gray-800 dark:text-white">
                            Keamanan
                        </h1>
                    </div>
                </div>

                <div className="px-4 py-4 space-y-6">
                    <div className="bg-white p-4 shadow-sm rounded-3xl sm:p-8 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <UpdatePasswordForm className="w-full" />
                    </div>
                </div>
            </div>

            <BottomNav />
        </AuthenticatedLayout>
    );
}
