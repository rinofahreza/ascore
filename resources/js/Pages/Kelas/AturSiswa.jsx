import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import BottomNav from '@/Components/BottomNav';

export default function AturSiswa({ auth, kelas, periodes, selectedPeriodeId, assignedStudents, availableStudents }) {
    const { flash } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [processingId, setProcessingId] = useState(null);

    // Filter available students based on search query
    const filteredAvailableStudents = useMemo(() => {
        if (!searchQuery) return availableStudents;
        return availableStudents.filter(student =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.nis.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [availableStudents, searchQuery]);

    const handleAssign = (studentId) => {
        setProcessingId(studentId);
        router.post(route('kelas.assign-siswa', kelas.id), {
            siswa_id: studentId,
            periode_id: selectedPeriodeId
        }, {
            preserveScroll: true,
            onFinish: () => setProcessingId(null)
        });
    };

    const handleRemove = (assignmentId) => {
        setProcessingId(assignmentId); // Using assignment ID for processing state
        router.delete(route('kelas-siswa.destroy', assignmentId), {
            preserveScroll: true,
            onFinish: () => setProcessingId(null)
        });
    };

    const handlePeriodeChange = (e) => {
        router.get(route('kelas.atur-siswa', kelas.id), {
            periode_id: e.target.value
        }, {
            preserveState: false // Reset state for new period
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Atur Siswa</h2>}
        >
            <Head title={`Atur Siswa - ${kelas.nama}`} />

            <div className="py-12 pb-32">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Header Info Card */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-6 p-6">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{kelas.nama}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {kelas.cabang?.nama} - {kelas.departemen?.nama}
                                </p>
                            </div>

                            <div className="w-full md:w-auto">
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Periode Akademik</label>
                                <select
                                    value={selectedPeriodeId}
                                    onChange={handlePeriodeChange}
                                    className="w-full md:w-64 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {periodes.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.nama} ({p.status})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* LEFT PANEL: Available Students */}
                        <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg flex flex-col h-[600px]">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Siswa Tersedia</h4>
                                <input
                                    type="text"
                                    placeholder="Cari nama atau NIS..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-md focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {filteredAvailableStudents.length === 0 ? (
                                    <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                                        Tidak ada siswa tersedia.
                                    </div>
                                ) : (
                                    filteredAvailableStudents.map(student => (
                                        <div
                                            key={student.id}
                                            className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                                                    {student.avatar_url ? (
                                                        <img src={student.avatar_url} alt={student.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{student.nis}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAssign(student.id)}
                                                disabled={processingId === student.id}
                                                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full transition disabled:opacity-50"
                                                title="Tambahkan ke Kelas"
                                            >
                                                {processingId === student.id ? (
                                                    <span className="animate-spin h-5 w-5 block border-2 border-green-600 rounded-full border-t-transparent"></span>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-b-lg border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 text-center">
                                Menampilkan {filteredAvailableStudents.length} siswa
                            </div>
                        </div>

                        {/* RIGHT PANEL: Assigned Students */}
                        <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg flex flex-col h-[600px] border-2 border-indigo-100 dark:border-indigo-900/30">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/20 rounded-t-lg flex justify-between items-center">
                                <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">Siswa di Kelas Ini</h4>
                                <span className="px-2 py-1 bg-white dark:bg-indigo-800 text-indigo-600 dark:text-indigo-200 text-xs font-bold rounded-full shadow-sm">
                                    {assignedStudents.length} Siswa
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {assignedStudents.length === 0 ? (
                                    <div className="text-center text-gray-500 dark:text-gray-400 py-10 flex flex-col items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <p>Kelas masih kosong.</p>
                                        <p className="text-xs mt-1">Tambahkan siswa dari panel kiri.</p>
                                    </div>
                                ) : (
                                    assignedStudents.map((assignment, index) => (
                                        <div
                                            key={assignment.id}
                                            className="flex items-center justify-between p-3 border border-indigo-100 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-mono text-gray-400 w-6">{index + 1}.</span>
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-800 overflow-hidden">
                                                    {assignment.avatar_url ? (
                                                        <img src={assignment.avatar_url} alt={assignment.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <svg className="w-full h-full text-indigo-300" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{assignment.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{assignment.nis}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemove(assignment.id)}
                                                disabled={processingId === assignment.id}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition disabled:opacity-50"
                                                title="Keluarkan dari Kelas"
                                            >
                                                {processingId === assignment.id ? (
                                                    <span className="animate-spin h-5 w-5 block border-2 border-red-500 rounded-full border-t-transparent"></span>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                    <div className="mt-6 flex justify-start">
                        <Link
                            href={route('kelas.index')}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Kembali ke Daftar Kelas
                        </Link>
                    </div>

                </div>
            </div>

            <BottomNav />
        </AuthenticatedLayout>
    );
}
