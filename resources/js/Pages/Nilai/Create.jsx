import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import { useState } from 'react';
import Swal from 'sweetalert2';

export default function Create({ auth, jadwal, items }) {
    const [editingId, setEditingId] = useState(null);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        cabang_id: jadwal.cabang_id,
        departemen_id: jadwal.departemen_id,
        kelas_id: jadwal.kelas_id,
        mata_pelajaran_id: jadwal.mata_pelajaran_id,
        periode_akademik_id: jadwal.periode_akademik_id,
        semester_akademik_id: jadwal.semester_akademik_id,
        nama: '',
        jenis: 'Formatif',
        keterangan: '',
        tanggal_penilaian: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingId) {
            put(`/nilai/update/${editingId}`, {
                onSuccess: () => {
                    reset('nama', 'jenis', 'keterangan', 'tanggal_penilaian');
                    setData('tanggal_penilaian', new Date().toISOString().split('T')[0]);
                    setEditingId(null);
                },
            });
        } else {
            post('/nilai/store', {
                onSuccess: () => {
                    reset('nama', 'jenis', 'keterangan', 'tanggal_penilaian');
                    setData('tanggal_penilaian', new Date().toISOString().split('T')[0]);
                },
            });
        }
    };

    const handleEdit = (item) => {
        setData({
            ...data,
            nama: item.nama,
            jenis: item.jenis,
            keterangan: item.keterangan || '',
            tanggal_penilaian: item.tanggal_penilaian || new Date().toISOString().split('T')[0],
        });
        setEditingId(item.id);
    };

    const handleCancelEdit = () => {
        reset('nama', 'jenis', 'keterangan', 'tanggal_penilaian');
        setData('tanggal_penilaian', new Date().toISOString().split('T')[0]);
        setEditingId(null);
    };

    const handleDelete = (item) => {
        const gradeCount = item.nilai_pelajarans_count || 0;

        Swal.fire({
            icon: 'warning',
            title: 'Hapus Item Penilaian?',
            html: gradeCount > 0
                ? `<p>Item ini memiliki <strong>${gradeCount} nilai siswa</strong> yang akan ikut terhapus.</p><p>Apakah Anda yakin ingin melanjutkan?</p>`
                : '<p>Apakah Anda yakin ingin menghapus item ini?</p>',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/nilai/destroy/${item.id}`, {
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Terhapus!',
                            text: 'Item penilaian berhasil dihapus.',
                            confirmButtonColor: 'var(--color-primary)',
                            timer: 2000,
                        });
                    },
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kelola Item Penilaian" />

            <div className="pt-header pb-24 bg-gray-100 dark:bg-gray-900 min-h-screen">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-6">
                        {/* Link removed */}
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Kelola Item Penilaian
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {jadwal.kelas_nama} - {jadwal.mata_pelajaran_nama}
                        </p>
                    </div>

                    {/* Form Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            {editingId ? 'Edit Item Penilaian' : 'Tambah Item Penilaian Baru'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nama Item */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nama Item <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama}
                                        onChange={(e) => setData('nama', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                        placeholder="Contoh: Ujian Tengah Semester 1"
                                        required
                                    />
                                    {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
                                </div>

                                {/* Jenis */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Jenis <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.jenis}
                                        onChange={(e) => setData('jenis', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                        required
                                    >
                                        <option value="Formatif">Formatif</option>
                                        <option value="Sumatif">Sumatif</option>
                                    </select>
                                    {errors.jenis && <p className="mt-1 text-sm text-red-600">{errors.jenis}</p>}
                                </div>

                                {/* Tanggal Penilaian */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tanggal Penilaian <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.tanggal_penilaian}
                                        onChange={(e) => setData('tanggal_penilaian', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                        required
                                    />
                                    {errors.tanggal_penilaian && <p className="mt-1 text-sm text-red-600">{errors.tanggal_penilaian}</p>}
                                </div>

                                {/* Keterangan */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Keterangan
                                    </label>
                                    <textarea
                                        value={data.keterangan}
                                        onChange={(e) => setData('keterangan', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                        placeholder="Deskripsi tambahan (opsional)"
                                    />
                                    {errors.keterangan && <p className="mt-1 text-sm text-red-600">{errors.keterangan}</p>}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="mt-4 flex gap-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-md font-medium transition-colors disabled:opacity-50"
                                >
                                    {editingId ? 'Update' : 'Tambah'} Item
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-md font-medium transition-colors"
                                    >
                                        Batal
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* List Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Daftar Item Penilaian
                        </h2>

                        {items.length === 0 ? (
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p className="mt-4 text-gray-500 dark:text-gray-400">
                                    Belum ada item penilaian
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Formatif Section */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                                            Penilaian Formatif
                                        </h3>
                                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                            {items.filter(item => item.jenis === 'Formatif').length} item
                                        </span>
                                    </div>
                                    {items.filter(item => item.jenis === 'Formatif').length === 0 ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                            Belum ada item penilaian formatif
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {items.filter(item => item.jenis === 'Formatif').map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                                {item.nama}
                                                            </h4>
                                                            {item.keterangan && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                    {item.keterangan}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 ml-4">
                                                            <button
                                                                onClick={() => handleEdit(item)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                                                                title="Edit"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item)}
                                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                                                                title="Hapus"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Sumatif Section */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                                            Penilaian Sumatif
                                        </h3>
                                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                            {items.filter(item => item.jenis === 'Sumatif').length} item
                                        </span>
                                    </div>
                                    {items.filter(item => item.jenis === 'Sumatif').length === 0 ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                            Belum ada item penilaian sumatif
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {items.filter(item => item.jenis === 'Sumatif').map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                                {item.nama}
                                                            </h4>
                                                            {item.keterangan && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                    {item.keterangan}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 ml-4">
                                                            <button
                                                                onClick={() => handleEdit(item)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                                                                title="Edit"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item)}
                                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                                                                title="Hapus"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <BottomNav />
        </AuthenticatedLayout>
    );
}
