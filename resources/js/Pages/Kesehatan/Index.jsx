import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BottomNav from '@/Components/BottomNav';
import { Head } from '@inertiajs/react';

export default function Index({ auth, visits, summary }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kesehatan" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 pt-header px-4">
                <div className="max-w-2xl mx-auto py-6">

                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                            Riwayat Kesehatan
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Catatan kunjungan ke UKS & histori medis
                        </p>
                    </div>

                    {/* Coming Soon Warning */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                                    Fitur ini masih dalam tahap pengembangan dan akan tersedia sepenuhnya di masa mendatang.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-800 dark:text-white mb-0.5">
                                {summary.total_visits}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Total Kunjungan</div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="text-lg font-bold text-gray-800 dark:text-white mb-0.5 truncate">
                                {summary.last_checkup}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Terakhir Periksa</div>
                        </div>
                    </div>

                    {/* Timeline / History List */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white px-2">
                            Aktivitas Terakhir
                        </h3>

                        <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8 pb-4">
                            {visits.length > 0 ? (
                                visits.map((visit, index) => (
                                    <div key={visit.id} className="relative pl-8">
                                        {/* Timeline Dot */}
                                        <div className={`
                                            absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 box-content
                                            ${visit.severity === 'high' ? 'bg-red-500' : visit.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}
                                        `}></div>

                                        {/* Card Content */}
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 group hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                                                        {visit.date}
                                                    </span>
                                                    <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                                                        {visit.complaint}
                                                    </h4>
                                                </div>
                                                <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
                                                    {visit.status}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex gap-2 text-sm">
                                                    <span className="text-gray-400 min-w-[70px]">Diagnosa:</span>
                                                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                        {visit.diagnosis}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2 text-sm">
                                                    <span className="text-gray-400 min-w-[70px]">Penanganan:</span>
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {visit.treatment}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="pl-8 pt-2 text-gray-500">
                                    Belum ada riwayat kunjungan.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <BottomNav />
        </AuthenticatedLayout>
    );
}
