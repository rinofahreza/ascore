import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import BottomNav from '@/Components/BottomNav';
import axios from 'axios';

export default function Index({ auth, jurnals, filters, lists, context, hasFiltered, isGuru }) {
    const { data, setData, get, processing } = useForm({
        periode_id: filters.periode_id || '',
        semester_id: filters.semester_id || '',
        month_year: filters.month_year || '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        get(route('laporan.jurnal.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Laporan Jurnal Mengajar" />

            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-24 pt-header">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

                    {/* Header Info Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg className="w-32 h-32 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v5h5v11H6z" />
                            </svg>
                        </div>

                        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-4 relative z-10">
                            Laporan Jurnal Mengajar
                        </h1>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 text-sm">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Nama Guru</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{auth.user.name}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Unit</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">
                                    {context.cabang?.nama || '-'} / {context.departemen?.nama || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Restricted Access Message */}
                    {!isGuru ? (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 mb-6">
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
                            {/* Filter Section */}
                            <form onSubmit={handleFilter} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Periode Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Periode Akademik</label>
                                        <select
                                            value={data.periode_id}
                                            onChange={e => setData('periode_id', e.target.value)}
                                            className="w-full rounded-xl border-gray-200 dark:border-gray-700 text-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] dark:bg-gray-900 dark:text-white"
                                        >
                                            <option value="">Pilih Periode</option>
                                            {lists.periodes.map(p => (
                                                <option key={p.id} value={p.id}>{p.nama}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Semester Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                                        <select
                                            value={data.semester_id}
                                            onChange={e => setData('semester_id', e.target.value)}
                                            className="w-full rounded-xl border-gray-200 dark:border-gray-700 text-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] dark:bg-gray-900 dark:text-white"
                                        >
                                            <option value="">Pilih Semester</option>
                                            {lists.semesters.map(s => (
                                                <option key={s.id} value={s.id}>{s.nama}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Month/Year Picker */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bulan & Tahun</label>
                                        <input
                                            type="month"
                                            value={data.month_year}
                                            onChange={e => setData('month_year', e.target.value)}
                                            className="w-full rounded-xl border-gray-200 dark:border-gray-700 text-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] dark:bg-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-between items-center">
                                    {hasFiltered && jurnals.length > 0 ? (
                                        <button
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                const btn = e.currentTarget;
                                                const originalText = btn.innerText;
                                                btn.innerText = 'Mengunduh...';
                                                btn.disabled = true;

                                                try {
                                                    const response = await axios.get(route('laporan.jurnal.export', {
                                                        periode_id: data.periode_id,
                                                        semester_id: data.semester_id,
                                                        month_year: data.month_year,
                                                    }), {
                                                        responseType: 'blob'
                                                    });

                                                    const now = new Date();
                                                    const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
                                                    const cleanName = auth.user.name.replace(/[^a-zA-Z0-9]/g, '_');
                                                    const fileName = `Jurnal_Mengajar_${cleanName}-${data.month_year}-${timeStr}.pdf`;

                                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                                    const link = document.createElement('a');
                                                    link.href = url;
                                                    link.setAttribute('download', fileName);
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    link.remove();
                                                    window.URL.revokeObjectURL(url);
                                                } catch (error) {
                                                    console.error('Download error:', error);
                                                    alert('Gagal mengunduh PDF.');
                                                } finally {
                                                    btn.innerText = originalText;
                                                    btn.disabled = false;
                                                }
                                            }}
                                            className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium shadow-sm hover:bg-red-700 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Download PDF
                                        </button>
                                    ) : (
                                        <div></div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        {processing ? 'Memuat...' : 'Tampilkan Data'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    {/* Journal List */}
                    {isGuru && (
                        <div className="space-y-4">
                            {jurnals.length > 0 ? (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3">No</th>
                                                    <th scope="col" className="px-6 py-3">Tanggal</th>
                                                    <th scope="col" className="px-6 py-3">Jam</th>
                                                    <th scope="col" className="px-6 py-3">Kelas</th>
                                                    <th scope="col" className="px-6 py-3">Mapel</th>
                                                    <th scope="col" className="px-6 py-3">Materi</th>
                                                    <th scope="col" className="px-6 py-3">Catatan & Refleksi</th>
                                                    <th scope="col" className="px-6 py-3">Gambar</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {jurnals.map((jurnal, index) => (
                                                    <tr key={jurnal.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                            {new Date(jurnal.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                            {jurnal.jam_mulai} - {jurnal.jam_selesai}
                                                        </td>
                                                        <td className="px-6 py-4 text-[var(--color-primary)] font-medium">
                                                            {jurnal.kelas?.nama}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                            {jurnal.mata_pelajaran?.nama}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-xs truncate" title={jurnal.materi}>
                                                            {jurnal.materi}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-xs truncate" title={jurnal.catatan}>
                                                            {jurnal.catatan || '-'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {jurnal.foto && jurnal.foto.length > 0 ? (
                                                                <div className="flex -space-x-2 overflow-hidden">
                                                                    {jurnal.foto.slice(0, 3).map((foto, idx) => (
                                                                        <img
                                                                            key={idx}
                                                                            src={`/storage/${foto}`} // Assuming storage path
                                                                            alt="Bukti"
                                                                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 object-cover cursor-pointer"
                                                                            onClick={() => window.open(`/storage/${foto}`, '_blank')}
                                                                        />
                                                                    ))}
                                                                    {jurnal.foto.length > 3 && (
                                                                        <span className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-100 text-xs font-medium text-gray-600">
                                                                            +{jurnal.foto.length - 3}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs italic">No Image</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            {hasFiltered ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            )}
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        {hasFiltered ? 'Tidak ada data' : 'Siap Menampilkan Laporan'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                                        {hasFiltered
                                            ? 'Belum ada jurnal mengajar yang sesuai dengan filter.'
                                            : 'Silakan pilih Periode, Semester, dan Bulan untuk menampilkan data.'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <BottomNav />
        </AuthenticatedLayout>
    );
}
