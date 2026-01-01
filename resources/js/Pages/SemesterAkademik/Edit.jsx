import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import BottomNav from '@/Components/BottomNav';

export default function Edit({ auth, semester, periodeAkademiks }) {
    const { data, setData, put, processing, errors } = useForm({
        periode_akademik_id: semester.periode_akademik_id || '',
        nama: semester.nama || '',
        kode: semester.kode || '',
    });

    // Auto-fill kode based on nama
    useEffect(() => {
        if (data.nama === 'Ganjil') {
            setData('kode', 1);
        } else if (data.nama === 'Genap') {
            setData('kode', 2);
        }
    }, [data.nama]);

    const submit = (e) => {
        e.preventDefault();
        put(route('semester-akademik.update', semester.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Semester Akademik</h2>}
        >
            <Head title="Edit Semester Akademik" />

            <div className="py-12 pb-32">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="periode_akademik_id" value="Periode Akademik *" />
                                    <select
                                        id="periode_akademik_id"
                                        value={data.periode_akademik_id}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        onChange={(e) => setData('periode_akademik_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Pilih Periode Akademik --</option>
                                        {periodeAkademiks.map((periode) => (
                                            <option key={periode.id} value={periode.id}>
                                                {periode.nama}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.periode_akademik_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="nama" value="Nama *" />
                                    <select
                                        id="nama"
                                        value={data.nama}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        onChange={(e) => setData('nama', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Pilih Nama --</option>
                                        <option value="Ganjil">Ganjil</option>
                                        <option value="Genap">Genap</option>
                                    </select>
                                    <InputError message={errors.nama} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="kode" value="Kode" />
                                    <input
                                        id="kode"
                                        type="text"
                                        value={data.kode}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-800"
                                        readOnly
                                    />
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Kode akan terisi otomatis: Ganjil = 1, Genap = 2
                                    </p>
                                    <InputError message={errors.kode} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end space-x-3">
                                    <Link
                                        href={route('semester-akademik.index')}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                    >
                                        Batal
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Update'}
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
