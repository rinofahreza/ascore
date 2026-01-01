import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Index({ auth, isGuru, classesList }) {
    // Initialize AOS
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
        });
    }, []);

    const cardColors = [
        { bg: 'bg-orange-100 dark:bg-orange-900/30', iconBg: 'bg-white/60 dark:bg-orange-900/50', iconText: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-700/50' },
        { bg: 'bg-green-100 dark:bg-green-900/30', iconBg: 'bg-white/60 dark:bg-green-900/50', iconText: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-700/50' },
        { bg: 'bg-blue-100 dark:bg-blue-900/30', iconBg: 'bg-white/60 dark:bg-blue-900/50', iconText: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-700/50' },
        { bg: 'bg-red-100 dark:bg-red-900/30', iconBg: 'bg-white/60 dark:bg-red-900/50', iconText: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-700/50' },
        { bg: 'bg-purple-100 dark:bg-purple-900/30', iconBg: 'bg-white/60 dark:bg-purple-900/50', iconText: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-700/50' },
        { bg: 'bg-teal-100 dark:bg-teal-900/30', iconBg: 'bg-white/60 dark:bg-teal-900/50', iconText: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-700/50' },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Nilai" />

            <div className="pt-header pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {!isGuru ? (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <h4 className="font-semibold text-red-800 dark:text-red-200">Akses Terbatas</h4>
                                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                                    Fitur ini hanya tersedia untuk guru.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Classes List */}
                            {classesList && classesList.length > 0 ? (
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                    {classesList.map((kelas, index) => {
                                        const color = cardColors[index % cardColors.length];
                                        return (
                                            <div
                                                key={index}
                                                className={`p-4 rounded-2xl flex flex-col h-32 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 shadow-sm hover:shadow-md bg-white dark:bg-gray-800 border-2 ${color.border}`}
                                            >
                                                {/* Card Link */}
                                                <Link
                                                    href={`/nilai/show/${kelas.kelas_id}/${kelas.mata_pelajaran_id}`}
                                                    className="absolute inset-0 z-0"
                                                >
                                                    <span className="sr-only">Lihat Nilai</span>
                                                </Link>

                                                <div className="z-10 relative h-full flex flex-col justify-between pointer-events-none">
                                                    <div className="flex justify-between items-start">
                                                        <div className={`w-10 h-10 ${color.bg} rounded-xl flex items-center justify-center ${color.iconText}`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                                            </svg>
                                                        </div>

                                                        {/* Action Button (Add Grade) - Pointer events auto to allow clicking */}
                                                        <Link
                                                            href={`/nilai/create/${kelas.jadwal_id}`}
                                                            className={`w-8 h-8 rounded-full ${color.bg} ${color.iconText} flex items-center justify-center hover:brightness-90 transition-all pointer-events-auto z-20`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            title="Input Nilai Baru"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                        </Link>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-1 leading-tight line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                                                            {kelas.mata_pelajaran_nama}
                                                        </h4>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                                                            <span>{kelas.kelas_nama}</span>
                                                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                                            <span className="text-[10px] uppercase tracking-wider text-gray-400">Periode Aktif</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-8 text-center">
                                    <svg className="mx-auto h-12 w-12 text-yellow-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-yellow-700 dark:text-yellow-300 font-medium">
                                        Belum ada kelas yang diajarkan pada periode ini
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <BottomNav />
        </AuthenticatedLayout>
    );
}
