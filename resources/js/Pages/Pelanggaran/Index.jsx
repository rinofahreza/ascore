import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import BottomNav from '@/Components/BottomNav';

export default function Index({ auth, pelanggaran, cabangs, periodeAkademiks, activePeriodeId, filters }) {
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        pelanggaranId: null,
        siswaName: ''
    });

    const hasPermission = (permission) => {
        return auth.role === 'Admin' || (auth.permissions && auth.permissions.includes(permission));
    };

    const [filterCabang, setFilterCabang] = useState(filters?.cabang_id || '');
    const [filterDepartemen, setFilterDepartemen] = useState(filters?.departemen_id || '');
    const [filterKelas, setFilterKelas] = useState(filters?.kelas_id || '');
    const [filterPeriode, setFilterPeriode] = useState(filters?.periode_akademik_id || activePeriodeId || '');
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');

    const [departemens, setDepartemens] = useState([]);
    const [kelases, setKelases] = useState([]);
    const [loadingDepartemen, setLoadingDepartemen] = useState(false);
    const [loadingKelas, setLoadingKelas] = useState(false);

    // Fetch departemen when cabang changes
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

    // Fetch kelas when departemen changes
    useEffect(() => {
        if (filterDepartemen) {
            setLoadingKelas(true);
            axios.get(route('api.kelas.by-departemen', filterDepartemen))
                .then(response => {
                    setKelases(response.data);
                    setLoadingKelas(false);
                })
                .catch(error => {
                    console.error('Error fetching kelas:', error);
                    setLoadingKelas(false);
                });
        } else {
            setKelases([]);
            setFilterKelas('');
        }
    }, [filterDepartemen]);

    const handleDelete = (id) => {
        router.delete(route('pelanggaran.destroy', id), {
            onSuccess: () => {
                setConfirmDialog({ isOpen: false, pelanggaranId: null, siswaName: '' });
            }
        });
    };

    // Apply filters
    const applyFilters = () => {
        router.get(route('pelanggaran.index'), {
            cabang_id: filterCabang,
            departemen_id: filterDepartemen,
            kelas_id: filterKelas,
            periode_akademik_id: filterPeriode,
            search: searchQuery,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Clear filters
    const clearFilters = () => {
        setFilterCabang('');
        setFilterDepartemen('');
        setFilterKelas('');
        setFilterPeriode('');
        setSearchQuery('');
        router.get(route('pelanggaran.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getKategoriColor = (kategori) => {
        switch (kategori) {
            case 'Ringan':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'Sedang':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'Berat':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title="Data Pelanggaran" />

            <div className="py-6 pb-32">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Daftar Pelanggaran</h3>
                                {hasPermission('pelanggaran.create') && (
                                    <Link
                                        href={route('pelanggaran.create')}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                    >
                                        + Tambah Pelanggaran
                                    </Link>
                                )}
                            </div>

                            {/* Filter Section */}
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Filter & Pencarian</h4>

                                {/* Search */}
                                <div className="mb-4">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Cari (NISN atau Nama Siswa)</label>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Masukkan NISN atau Nama Siswa..."
                                        className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Kelas</label>
                                        <select
                                            value={filterKelas}
                                            onChange={(e) => setFilterKelas(e.target.value)}
                                            disabled={!filterDepartemen || loadingKelas}
                                            className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                                        >
                                            <option value="">
                                                {loadingKelas ? 'Loading...' : !filterDepartemen ? 'Pilih Departemen Dulu' : 'Semua Kelas'}
                                            </option>
                                            {kelases.map((kelas) => (
                                                <option key={kelas.id} value={kelas.id}>{kelas.nama}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Periode Akademik</label>
                                        <select
                                            value={filterPeriode}
                                            onChange={(e) => setFilterPeriode(e.target.value)}
                                            className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">Semua Periode</option>
                                            {periodeAkademiks.map((periode) => (
                                                <option key={periode.id} value={periode.id}>{periode.nama}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-end space-x-2 mt-4">
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

                            {pelanggaran.data.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    Belum ada data pelanggaran
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">NISN</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Siswa</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kelas</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Periode</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pelanggaran</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kategori</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Guru</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {pelanggaran.data.map((item, index) => (
                                                    <tr key={item.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {pelanggaran.from + index}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{item.siswa?.nisn || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.siswa?.name || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{item.kelas?.nama || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{item.periode_akademik?.nama || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{item.poin?.nama || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getKategoriColor(item.poin?.kategori)}`}>
                                                                {item.poin?.kategori || '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                            {new Date(item.tanggal).toLocaleDateString('id-ID')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{item.guru?.name || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                            {hasPermission('pelanggaran.edit') && (
                                                                <Link
                                                                    href={route('pelanggaran.edit', item.id)}
                                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                                >
                                                                    Edit
                                                                </Link>
                                                            )}
                                                            {hasPermission('pelanggaran.delete') && (
                                                                <button
                                                                    onClick={() => setConfirmDialog({ isOpen: true, pelanggaranId: item.id, siswaName: item.siswa?.name })}
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
                                    {pelanggaran.last_page > 1 && (
                                        <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                Menampilkan <span className="font-medium">{pelanggaran.from}</span> sampai{' '}
                                                <span className="font-medium">{pelanggaran.to}</span> dari{' '}
                                                <span className="font-medium">{pelanggaran.total}</span> data
                                            </div>
                                            <div className="flex space-x-2">
                                                {pelanggaran.links.map((link, index) => (
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
                            Apakah Anda yakin ingin menghapus pelanggaran siswa "<strong>{confirmDialog.siswaName}</strong>"?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setConfirmDialog({ isOpen: false, pelanggaranId: null, siswaName: '' })}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleDelete(confirmDialog.pelanggaranId)}
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
