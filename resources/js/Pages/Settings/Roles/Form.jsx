import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { IconDeviceFloppy, IconCheck } from '@tabler/icons-react';

export default function Form({ role, permissions }) {
    const isEdit = !!role;

    // Parse permissions from array to IDs if editing
    const initialPermissions = role
        ? role.permissions.map(p => p.id)
        : [];

    const { data, setData, post, put, processing, errors } = useForm({
        nama: role?.nama || '',
        permissions: initialPermissions,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('settings.roles.update', role.id));
        } else {
            post(route('settings.roles.store'));
        }
    };

    const handleCheckboxChange = (permissionId) => {
        const newPermissions = data.permissions.includes(permissionId)
            ? data.permissions.filter(id => id !== permissionId)
            : [...data.permissions, permissionId];

        setData('permissions', newPermissions);
    };

    const handleGroupToggle = (groupPermissions, isChecked) => {
        const groupIds = groupPermissions.map(p => p.id);
        let newPermissions = [...data.permissions];

        if (isChecked) {
            // Add all missing IDs from this group
            groupIds.forEach(id => {
                if (!newPermissions.includes(id)) {
                    newPermissions.push(id);
                }
            });
        } else {
            // Remove all IDs from this group
            newPermissions = newPermissions.filter(id => !groupIds.includes(id));
        }
        setData('permissions', newPermissions);
    };

    const { auth } = usePage().props;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={isEdit ? 'Edit Role' : 'Tambah Role'} />

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href={route('settings.roles.index')}
                        className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isEdit ? 'Edit Role' : 'Tambah Role Baru'}
                        </h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Role Name Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="max-w-xl">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nama Role
                            </label>
                            <input
                                type="text"
                                value={data.nama}
                                onChange={e => setData('nama', e.target.value)}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-teal-500 focus:border-teal-500"
                                placeholder="Contoh: Tata Usaha"
                            />
                            {errors.nama && (
                                <p className="mt-1 text-sm text-red-600">{errors.nama}</p>
                            )}
                        </div>
                    </div>

                    {/* Permission Matrix */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Hak Akses (Permissions)
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Tentukan menu dan aksi apa saja yang dapat diakses oleh role ini.
                            </p>
                        </div>

                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {Object.entries(permissions).map(([group, groupPermissions]) => {
                                const allChecked = groupPermissions.every(p => data.permissions.includes(p.id));
                                const someChecked = groupPermissions.some(p => data.permissions.includes(p.id));

                                return (
                                    <div key={group} className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-base font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wide">
                                                {group}
                                            </h3>
                                            <label className="inline-flex items-center text-sm text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 mr-2"
                                                    checked={allChecked}
                                                    onChange={(e) => handleGroupToggle(groupPermissions, e.target.checked)}
                                                    ref={input => {
                                                        if (input) input.indeterminate = someChecked && !allChecked;
                                                    }}
                                                />
                                                Pilih Semua di {group}
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {groupPermissions.map((permission) => (
                                                <label
                                                    key={permission.id}
                                                    className={`
                                                        relative flex items-start p-3 rounded-lg border cursor-pointer transition-all
                                                        ${data.permissions.includes(permission.id)
                                                            ? 'bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-700/50'
                                                            : 'bg-white border-gray-200 hover:border-teal-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-teal-700'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center h-5">
                                                        <input
                                                            type="checkbox"
                                                            value={permission.id}
                                                            checked={data.permissions.includes(permission.id)}
                                                            onChange={() => handleCheckboxChange(permission.id)}
                                                            className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                                        />
                                                    </div>
                                                    <div className="ml-3 text-sm">
                                                        <span className={`block font-medium ${data.permissions.includes(permission.id)
                                                            ? 'text-teal-900 dark:text-teal-100'
                                                            : 'text-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {permission.label}
                                                        </span>
                                                        <span className="block text-xs text-gray-500 mt-0.5 font-mono opacity-75">
                                                            {permission.name}
                                                        </span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 sticky bottom-4 z-10">
                        <Link
                            href={route('settings.roles.index')}
                            className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20 transition-all font-medium disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            <IconDeviceFloppy className="w-5 h-5" />
                            <span>{processing ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
