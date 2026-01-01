import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BottomNav from '@/Components/BottomNav';
import { IconPlus, IconPencil, IconTrash, IconShieldLock } from '@tabler/icons-react';
import Swal from 'sweetalert2';

export default function Index({ roles }) {
    const { auth } = usePage().props;

    const hasPermission = (permission) => {
        return auth.role === 'Admin' || (auth.permissions && auth.permissions.includes(permission));
    };

    const handleDelete = (role) => {
        Swal.fire({
            title: 'Apakah anda yakin?',
            text: "Role yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('settings.roles.destroy', role.id), {
                    onSuccess: () => {
                        Swal.fire(
                            'Terhapus!',
                            'Role telah dihapus.',
                            'success'
                        )
                    },
                    onError: (errors) => {
                        Swal.fire(
                            'Gagal!',
                            'Terjadi kesalahan saat menghapus role.',
                            'error'
                        )
                    }
                });
            }
        })
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Manajemen Role" />

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header & Back Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('settings')}
                            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                        >
                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <IconShieldLock className="w-7 h-7 text-teal-500" />
                                Manajemen Role
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Atur hak akses pengguna aplikasi
                            </p>
                        </div>
                    </div>

                    {hasPermission('role.create') && (
                        <Link
                            href={route('settings.roles.create')}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20 transition-all font-medium"
                        >
                            <IconPlus className="w-5 h-5" />
                            <span>Tambah Role</span>
                        </Link>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Nama Role</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Jumlah Izin</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {roles.map((role) => (
                                    <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white capitalize">
                                            {role.nama}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                {role.permissions_count} Izin
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {hasPermission('role.edit') && (
                                                <Link
                                                    href={route('settings.roles.edit', role.id)}
                                                    className="inline-flex items-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <IconPencil className="w-4 h-4" />
                                                </Link>
                                            )}
                                            {hasPermission('role.delete') && role.id !== 1 && (
                                                <button
                                                    onClick={() => handleDelete(role)}
                                                    className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <IconTrash className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {roles.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                                            <IconShieldLock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>Belum ada role yang dibuat</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <BottomNav />
        </AuthenticatedLayout>
    );
}
