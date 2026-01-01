import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import BottomNav from '@/Components/BottomNav';

export default function Index({ auth, departemens }) {
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        departemenId: null,
        departemenNama: ''
    });

    const hasPermission = (permission) => {
        return auth.role === 'Admin' || (auth.permissions && auth.permissions.includes(permission));
    };

    const handleDelete = (id) => {
        router.delete(route('departemen.destroy', id), {
            onSuccess: () => {
                setConfirmDialog({ isOpen: false, departemenId: null, departemenNama: '' });
            }
        });
    };

    const toggleStatus = (id) => {
        if (!hasPermission('departemen.edit')) return;
        router.post(route('departemen.toggle-status', id), {}, {
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Departemen</h2>}
        >
            <Head title="Departemen" />

            <div className="py-12 pb-24">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Daftar Departemen</h3>
                                {hasPermission('departemen.create') && (
                                    <Link
                                        href={route('departemen.create')}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                    >
                                        + Tambah Departemen
                                    </Link>
                                )}
                            </div>

                            {departemens.data.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    Belum ada data departemen
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cabang</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {departemens.data.map((departemen, index) => (
                                                    <tr key={departemen.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {departemens.from + index}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{departemen.cabang?.nama || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{departemen.nama}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <button
                                                                onClick={() => toggleStatus(departemen.id)}
                                                                disabled={!hasPermission('departemen.edit')}
                                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 
                                                                    ${departemen.status ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}
                                                                    ${!hasPermission('departemen.edit') ? 'opacity-50 cursor-not-allowed' : ''}
                                                                `}
                                                            >
                                                                <span
                                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${departemen.status ? 'translate-x-6' : 'translate-x-1'
                                                                        }`}
                                                                />
                                                            </button>
                                                            <span className={`ml-2 text-xs ${departemen.status ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                                {departemen.status ? 'Aktif' : 'Nonaktif'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                            {hasPermission('departemen.edit') && (
                                                                <Link
                                                                    href={route('departemen.edit', departemen.id)}
                                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                                >
                                                                    Edit
                                                                </Link>
                                                            )}
                                                            {hasPermission('departemen.delete') && (
                                                                <button
                                                                    onClick={() => setConfirmDialog({ isOpen: true, departemenId: departemen.id, departemenNama: departemen.nama })}
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
                                    {departemens.last_page > 1 && (
                                        <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                Menampilkan <span className="font-medium">{departemens.from}</span> sampai{' '}
                                                <span className="font-medium">{departemens.to}</span> dari{' '}
                                                <span className="font-medium">{departemens.total}</span> data
                                            </div>
                                            <div className="flex space-x-2">
                                                {departemens.links.map((link, index) => (
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
                            Apakah Anda yakin ingin menghapus departemen "<strong>{confirmDialog.departemenNama}</strong>"?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setConfirmDialog({ isOpen: false, departemenId: null, departemenNama: '' })}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleDelete(confirmDialog.departemenId)}
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
