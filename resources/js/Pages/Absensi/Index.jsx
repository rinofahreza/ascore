
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Index({ auth }) {
    const { url } = usePage();
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const scanResult = queryParams.get('scan_result');

    useEffect(() => {
        if (scanResult) {
            Swal.fire({
                title: 'Scan Berhasil!',
                text: `Kode: ${scanResult}`,
                icon: 'success',
                confirmButtonText: 'Proses Absensi',
            });
        }
    }, [scanResult]);

    // Dummy Data Template for 7 Days History
    const history = [
        {
            date: 'Senin, 30 Des 2025',
            status: 'Hadir',
            masuk: '07:05',
            pulang: '14:10',
            color: 'green'
        },
        {
            date: 'Minggu, 29 Des 2025',
            status: 'Libur',
            masuk: '-',
            pulang: '-',
            color: 'gray'
        },
        {
            date: 'Sabtu, 28 Des 2025',
            status: 'Hadir',
            masuk: '07:15',
            pulang: '12:30',
            color: 'green'
        },
        {
            date: 'Jumat, 27 Des 2025',
            status: 'Terlambat',
            masuk: '07:45',
            pulang: '11:30',
            color: 'yellow'
        },
        {
            date: 'Kamis, 26 Des 2025',
            status: 'Izin',
            masuk: '-',
            pulang: '-',
            color: 'blue'
        },
        {
            date: 'Rabu, 25 Des 2025',
            status: 'Libur',
            masuk: '-',
            pulang: '-',
            color: 'gray'
        },
        {
            date: 'Selasa, 24 Des 2025',
            status: 'Alpha',
            masuk: '-',
            pulang: '-',
            color: 'red'
        },
    ];

    const getStatusColor = (color) => {
        switch (color) {
            case 'green': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'yellow': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
            case 'blue': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            case 'red': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        }
    };

    const getIcon = (color) => {
        switch (color) {
            case 'green':
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'yellow':
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'blue':
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            case 'red':
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                );
        }
    }

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Absensi" />

            <div className="pt-header pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">



                    {/* Feature Unavailable Alert */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-4 mb-8 flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h3 className="font-bold text-yellow-800 dark:text-yellow-200 text-sm">Fitur Belum Tersedia</h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                Fitur Absensi ini belum tersedia saat ini. Anda tetap dapat mencoba menu Scan QR Code, namun data tidak akan tersimpan.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Scan Action */}
                        <div className="lg:col-span-1">
                            <div className="bg-gradient-to-br from-[var(--color-primary)] to-blue-600 rounded-3xl p-6 shadow-xl shadow-blue-500/20 text-white relative overflow-hidden group">
                                {/* Decor circles */}
                                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                                <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>

                                <div className="relative z-10 flex flex-col h-full bg-white/5 rounded-2xl p-2 border border-white/10">
                                    <div className="p-4 flex-1">
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 text-white backdrop-blur-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h-4v-4H8m13-4V4a1 1 0 00-1-1H4a1 1 0 00-1 1v12a1 1 0 001 1h8l4 4V9.281l1-1.071z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-bold mb-2">Scan QR Code</h2>
                                        <p className="text-blue-100 text-sm leading-relaxed opacity-90">
                                            Arahkan kamera ke QR Code yang disediakan untuk melaporkan kehadiran.
                                        </p>
                                    </div>

                                    <Link
                                        href={route('absensi.scan')}
                                        className="bg-white text-blue-600 py-3 px-4 rounded-xl text-center font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 mx-2 mb-2 w-[calc(100%-1rem)]"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Mulai Scan
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: History */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                                    Riwayat 7 Hari Terakhir
                                </h3>

                                <div className="space-y-4">
                                    {history.map((day, index) => (
                                        <div
                                            key={index}
                                            className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-600 flex items-center justify-between group hover:border-[var(--color-primary)] hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Icon Box */}
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getStatusColor(day.color)} bg-opacity-20`}>
                                                    <div className={day.color === 'gray' ? 'text-gray-500' : ''}>
                                                        {getIcon(day.color)}
                                                    </div>
                                                </div>

                                                {/* Text Info */}
                                                <div>
                                                    <p className="font-bold text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                                                        {day.date}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                        {/* Times row */}
                                                        {day.status !== 'Libur' && day.status !== 'Alpha' && day.status !== 'Izin' ? (
                                                            <>
                                                                <span className="flex items-center gap-1">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                                    In: {day.masuk}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                                                    Out: {day.pulang}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="italic">{day.status === 'Alpha' ? 'Tidak ada keterangan' : day.status === 'Libur' ? 'Libur Sekolah' : 'Izin Tidak Masuk'}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(day.color)} bg-opacity-10 border-opacity-20`}>
                                                {day.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <BottomNav />
        </AuthenticatedLayout>
    );
}
