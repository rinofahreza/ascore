import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import BottomNav from '@/Components/BottomNav';

export default function Index({ auth, semesters }) {
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        semesterId: null,
        semesterName: ''
    });

    const handleDelete = (id) => {
        router.delete(route('semester-akademik.destroy', id), {
            onSuccess: () => {
                setConfirmDialog({ isOpen: false, semesterId: null, semesterName: '' });
            }
        });
    };

    const handleToggle = (id, currentStatus) => {
        if (!hasPermission('periode_akademik.edit')) return;
        router.post(route('semester-akademik.toggle', id), {}, {
            preserveScroll: true,
        });
    };

    const hasPermission = (permission) => {
        return auth.role === 'Admin' || (auth.permissions && auth.permissions.includes(permission));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title="Semester Akademik" />

            <div className="py-6 pb-32">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Daftar Semester Akademik</h3>
                                {hasPermission('periode_akademik.create') && (
                                    <Link
                                        href={route('semester-akademik.create')}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                    >
                                        + Tambah Semester
                                    </Link>
                                )}
                            </div>

                            {semesters.data.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    Belum ada data semester akademik
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Periode Akademik</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kode</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {semesters.data.map((semester, index) => (
                                                    <tr key={semester.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {semesters.from + index}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                            {semester.periode_akademik?.nama || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {semester.nama}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                            {semester.kode}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <button
                                                                onClick={() => handleToggle(semester.id, semester.is_aktif)}
                                                                disabled={!hasPermission('periode_akademik.edit')}
                                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${semester.is_aktif ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                                                                    } ${!hasPermission('periode_akademik.edit') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                                title={semester.is_aktif ? 'Aktif - Klik untuk nonaktifkan' : 'Nonaktif - Klik untuk aktifkan'}
                                                            >
                                                                <span
                                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${semester.is_aktif ? 'translate-x-6' : 'translate-x-1'
                                                                        }`}
                                                                />
                                                            </button>
                                                            <span className={`ml-2 text-xs font-medium ${semester.is_aktif ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                                                                }`}>
                                                                {semester.is_aktif ? 'Aktif' : 'Nonaktif'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                            {hasPermission('periode_akademik.edit') && (
                                                                <Link
                                                                    href={route('semester-akademik.edit', semester.id)}
                                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                                >
                                                                    Edit
                                                                </Link>
                                                            )}
                                                            {hasPermission('periode_akademik.delete') && (
                                                                <button
                                                                    onClick={() => setConfirmDialog({ isOpen: true, semesterId: semester.id, semesterName: `${semester.periode_akademik?.nama} - ${semester.nama}` })}
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
                                    {semesters.last_page > 1 && (
                                        <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                Menampilkan <span className="font-medium">{semesters.from}</span> sampai{' '}
                                                <span className="font-medium">{semesters.to}</span> dari{' '}
                                                <span className="font-medium">{semesters.total}</span> data
                                            </div>
                                            <div className="flex space-x-2">
                                                {semesters.links.map((link, index) => (
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
                            Apakah Anda yakin ingin menghapus semester "<strong>{confirmDialog.semesterName}</strong>"?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setConfirmDialog({ isOpen: false, semesterId: null, semesterName: '' })}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleDelete(confirmDialog.semesterId)}
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
