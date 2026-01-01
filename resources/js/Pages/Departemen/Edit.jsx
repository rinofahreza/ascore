import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import BottomNav from '@/Components/BottomNav';

export default function Edit({ auth, departemen, cabangs }) {
    const { data, setData, put, processing, errors } = useForm({
        cabang_id: departemen?.cabang_id || '',
        nama: departemen?.nama || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('departemen.update', departemen.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Departemen</h2>}
        >
            <Head title="Edit Departemen" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="cabang_id" value="Pilih Cabang *" />
                                    <select
                                        id="cabang_id"
                                        value={data.cabang_id}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        onChange={(e) => setData('cabang_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Pilih Cabang --</option>
                                        {cabangs.map((cabang) => (
                                            <option key={cabang.id} value={cabang.id}>
                                                {cabang.nama}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.cabang_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="nama" value="Nama Departemen *" />
                                    <TextInput
                                        id="nama"
                                        type="text"
                                        value={data.nama}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('nama', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.nama} className="mt-2" />
                                </div>

                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                        <strong>Info:</strong> Untuk mengubah status, gunakan toggle di halaman daftar departemen.
                                    </p>
                                </div>

                                <div className="flex items-center justify-end space-x-3">
                                    <Link
                                        href={route('departemen.index')}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                                    >
                                        Batal
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        Update
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
