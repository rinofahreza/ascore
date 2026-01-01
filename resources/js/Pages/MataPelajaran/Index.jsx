import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import BottomNav from '@/Components/BottomNav';

export default function Index({ auth, mataPelajarans, cabangs, filters }) {
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        mataPelajaranId: null,
        mataPelajaranNama: ''
    });

    const [filterCabang, setFilterCabang] = useState(filters?.cabang_id || '');
    const [filterDepartemen, setFilterDepartemen] = useState(filters?.departemen_id || '');
    const [departemens, setDepartemens] = useState([]);
    const [loadingDepartemen, setLoadingDepartemen] = useState(false);

    // Fetch departemen when filter cabang changes
    useEffect(() => {
        if (filterCabang) {
            setLoadingDepartemen(true);
            axios.get(route('api.departemen.by-cabang', filterCabang))
                .then(response => {
                    setDepartemens(response.data);
                    setLoadingDepartemen(false);
                })
                .catch(error => {
                    console.error('Error fetching departemen:', error);
                    setLoadingDepartemen(false);
                });
        } else {
            setDepartemens([]);
            setFilterDepartemen('');
        }
    }, [filterCabang]);

    // Apply filters
    const applyFilters = () => {
        router.get(route('mata-pelajaran.index'), {
            cabang_id: filterCabang,
            departemen_id: filterDepartemen,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Clear filters
    const clearFilters = () => {
        setFilterCabang('');
        setFilterDepartemen('');
        router.get(route('mata-pelajaran.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasPermission = (permission) => {
        return auth.role === 'Admin' || (auth.permissions && auth.permissions.includes(permission));
    };

    const handleDelete = (id) => {
        router.delete(route('mata-pelajaran.destroy', id), {
            onSuccess: () => {
                setConfirmDialog({ isOpen: false, mataPelajaranId: null, mataPelajaranNama: '' });
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Mata Pelajaran</h2>}
        >
            <Head title="Mata Pelajaran" />

            <div className="py-12 pb-32">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Daftar Mata Pelajaran</h3>
                                {hasPermission('mata_pelajaran.create') && (
                                    <Link
                                        href={route('mata-pelajaran.create')}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                    >
                                        + Tambah Mata Pelajaran
                                    </Link>
                                )}
                            </div>

                            {/* Filter Section */}
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Filter Data</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Cabang</label>
                                        <select
                                            value={filterCabang}
                                            onChange={(e) => setFilterCabang(e.target.value)}
                                            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm text-sm"
                                        >
                                            <option value="">Semua Cabang</option>
                                            {cabangs.map((cabang) => (
                                                <option key={cabang.id} value={cabang.id}>
                                                    {cabang.nama}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Departemen</label>
                                        <select
                                            value={filterDepartemen}
                                            onChange={(e) => setFilterDepartemen(e.target.value)}
                                            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm text-sm disabled:opacity-50"
                                            disabled={!filterCabang || loadingDepartemen}
                                        >
                                            <option value="">
                                                {loadingDepartemen ? 'Loading...' : !filterCabang ? 'Pilih Cabang Dulu' : 'Semua Departemen'}
                                            </option>
                                            {departemens.map((departemen) => (
                                                <option key={departemen.id} value={departemen.id}>
                                                    {departemen.nama}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-end space-x-2">
                                        <button
                                            onClick={applyFilters}
                                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition"
                                        >
                                            Terapkan
                                        </button>
                                        <button
                                            onClick={clearFilters}
                                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {mataPelajarans.data.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    Belum ada data mata pelajaran
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cabang</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Departemen</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {mataPelajarans.data.map((mataPelajaran, index) => (
                                                    <tr key={mataPelajaran.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {mataPelajarans.from + index}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{mataPelajaran.nama}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{mataPelajaran.cabang?.nama || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{mataPelajaran.departemen?.nama || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                            {hasPermission('mata_pelajaran.edit') && (
                                                                <Link
                                                                    href={route('mata-pelajaran.edit', mataPelajaran.id)}
                                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                                >
                                                                    Edit
                                                                </Link>
                                                            )}
                                                            {hasPermission('mata_pelajaran.delete') && (
                                                                <button
                                                                    onClick={() => setConfirmDialog({ isOpen: true, mataPelajaranId: mataPelajaran.id, mataPelajaranNama: mataPelajaran.nama })}
                                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                                >
                                                                    Hapus
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {mataPelajarans.last_page > 1 && (
                                        <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                Menampilkan <span className="font-medium">{mataPelajarans.from}</span> sampai{' '}
                                                <span className="font-medium">{mataPelajarans.to}</span> dari{' '}
                                                <span className="font-medium">{mataPelajarans.total}</span> data
                                            </div>
                                            <div className="flex space-x-2">
                                                {mataPelajarans.links.map((link, index) => (
                                                    link.url ? (
                                                        <Link
                                                            key={index}
                                                            href={link.url}
                                                            preserveScroll
                                                            className={`px-3 py-2 text-sm rounded-lg transition ${link.active
                                                                ? 'bg-purple-600 text-white'
                                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                                }`}
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    ) : (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Delete Dialog */}
            {confirmDialog.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Konfirmasi Hapus</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Apakah Anda yakin ingin menghapus mata pelajaran "<strong>{confirmDialog.mataPelajaranNama}</strong>"?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setConfirmDialog({ isOpen: false, mataPelajaranId: null, mataPelajaranNama: '' })}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleDelete(confirmDialog.mataPelajaranId)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </AuthenticatedLayout>
    );
}
