import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import BottomNav from '@/Components/BottomNav';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        nama: '',
        status: 'Draft',
    });

    const statusOptions = ['Active', 'Draft', 'Inactive'];

    const submit = (e) => {
        e.preventDefault();
        post(route('periode-akademik.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Tambah Periode Akademik</h2>}
        >
            <Head title="Tambah Periode Akademik" />

            <div className="py-12 pb-32">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {data.status === 'Active' && (
                                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        ⚠️ <strong>Perhatian:</strong> Jika Anda mengaktifkan periode ini, semua periode akademik lainnya akan otomatis dinonaktifkan.
                                    </p>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="nama" value="Nama Periode *" />
                                    <TextInput
                                        id="nama"
                                        type="text"
                                        value={data.nama}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('nama', e.target.value)}
                                        required
                                        placeholder="Contoh: Tahun Ajaran 2024/2025"
                                    />
                                    <InputError message={errors.nama} className="mt-2" />
                                </div>



                                <div>
                                    <InputLabel htmlFor="status" value="Status *" />
                                    <select
                                        id="status"
                                        value={data.status}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        onChange={(e) => setData('status', e.target.value)}
                                        required
                                    >
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Active: Periode sedang berjalan | Draft: Belum aktif | Inactive: Sudah selesai
                                    </p>
                                </div>

                                <div className="flex items-center justify-end space-x-3">
                                    <Link
                                        href={route('periode-akademik.index')}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                                    >
                                        Batal
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        Simpan
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav />
        </AuthenticatedLayout>
    );
}
