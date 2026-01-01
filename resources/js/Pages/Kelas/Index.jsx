import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import BottomNav from '@/Components/BottomNav';

export default function Index({ auth, kelas, cabangs, filters }) {
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        kelasId: null,
        kelasNama: ''
    });

    const hasPermission = (permission) => {
        return auth.role === 'Admin' || (auth.permissions && auth.permissions.includes(permission));
    };

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

    const handleDelete = (id) => {
        router.delete(route('kelas.destroy', id), {
            onSuccess: () => {
                setConfirmDialog({ isOpen: false, kelasId: null, kelasNama: '' });
            }
        });
    };

    const handleToggleStatus = (id) => {
        router.post(route('kelas.toggle-status', id), {}, {
            preserveScroll: true,
        });
    };

    // Apply filters
    const applyFilters = () => {
        router.get(route('kelas.index'), {
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
        router.get(route('kelas.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Kelas</h2>}
        >
            <Head title="Kelas" />

            <div className="py-12 pb-32">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Daftar Kelas</h3>
                                {hasPermission('kelas.create') && (
                                    <Link
                                        href={route('kelas.create')}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                    >
                                        + Tambah Kelas
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
                                            className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">Semua Cabang</option>
                                            {cabangs.map((cabang) => (
                                                <option key={cabang.id} value={cabang.id}>{cabang.nama}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Departemen</label>
                                        <select
                                            value={filterDepartemen}
                                            onChange={(e) => setFilterDepartemen(e.target.value)}
                                            disabled={!filterCabang || loadingDepartemen}
                                            className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                                        >
                                            <option value="">
                                                {loadingDepartemen ? 'Loading...' : !filterCabang ? 'Pilih Cabang Dulu' : 'Semua Departemen'}
                                            </option>
                                            {departemens.map((departemen) => (
                                                <option key={departemen.id} value={departemen.id}>{departemen.nama}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-end space-x-2">
                                        <button
                                            onClick={applyFilters}
                                            className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition"
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

                            {kelas.data.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    Belum ada data kelas
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Kelas</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cabang</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Departemen</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {kelas.data.map((item, index) => (
                                                    <tr key={item.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {kelas.from + index}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.nama}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{item.cabang?.nama || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{item.departemen?.nama || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <button
                                                                onClick={() => handleToggleStatus(item.id)}
                                                                disabled={!hasPermission('kelas.edit')}
                                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${!hasPermission('kelas.edit')
                                                                    ? 'opacity-50 cursor-not-allowed ' + (item.status ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600')
                                                                    : item.status ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                                                                    }`}
                                                            >
                                                                <span
                                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.status ? 'translate-x-6' : 'translate-x-1'
                                                                        }`}
                                                                />
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex justify-end items-center gap-2">
                                                                {hasPermission('kelas.edit') && (
                                                                    <>
                                                                        <Link
                                                                            href={route('kelas.atur-siswa', item.id)}
                                                                            className="p-1 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                                            title="Atur Siswa"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 013 19.235z" />
                                                                            </svg>
                                                                        </Link>
                                                                        <Link
                                                                            href={route('kelas.edit', item.id)}
                                                                            className="p-1 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                                                            title="Edit Kelas"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.69 1.04l-3.296 1.311a1.125 1.125 0 01-1.42-1.42l1.311-3.297a4.5 4.5 0 011.04-1.69l9.635-9.632z" />
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.688 5.562l3.375 3.375" />
                                                                            </svg>
                                                                        </Link>
                                                                    </>
                                                                )}
                                                                {hasPermission('kelas.delete') && (
                                                                    <button
                                                                        onClick={() => setConfirmDialog({ isOpen: true, kelasId: item.id, kelasNama: item.nama })}
                                                                        className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                        title="Hapus Kelas"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {kelas.last_page > 1 && (
                                        <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                Menampilkan <span className="font-medium">{kelas.from}</span> sampai{' '}
                                                <span className="font-medium">{kelas.to}</span> dari{' '}
                                                <span className="font-medium">{kelas.total}</span> data
                                            </div>
                                            <div className="flex space-x-2">
                                                {kelas.links.map((link, index) => (
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
                            Apakah Anda yakin ingin menghapus kelas "<strong>{confirmDialog.kelasNama}</strong>"?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setConfirmDialog({ isOpen: false, kelasId: null, kelasNama: '' })}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleDelete(confirmDialog.kelasId)}
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
