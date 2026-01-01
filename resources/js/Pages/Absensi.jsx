import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BottomNav from '@/Components/BottomNav';
import { Head } from '@inertiajs/react';

export default function Absensi({ auth }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Absensi" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Absensi
                        </h1>
                        {/* Text removed */}
                    </div>

                    {/* Under Development Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-12 text-center">
                            {/* Construction Icon */}
                            <div className="flex justify-center mb-6">
                                <div
                                    className="w-24 h-24 rounded-full flex items-center justify-center"
                                    style={{
                                        background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-light))`,
                                        boxShadow: `0 10px 30px -5px var(--color-primary)`
                                    }}
                                >
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                Dalam Tahap Pengembangan
                            </h2>

                            {/* Description */}
                            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                                Fitur absensi sedang dalam proses pengembangan. Segera hadir dengan fitur-fitur menarik!
                            </p>

                            {/* Features Preview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                        Absen Real-time
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Catat kehadiran secara langsung
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                        GPS Location
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Verifikasi lokasi kehadiran
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                        Laporan Lengkap
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Rekap kehadiran otomatis
                                    </p>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="mt-8 inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">Coming Soon</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav />
        </AuthenticatedLayout>
    );
}
