import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import BottomNav from '@/Components/BottomNav';

export default function Create({ auth, cabangs }) {
    const { data, setData, post, processing, errors } = useForm({
        nama: '',
        cabang_id: '',
        departemen_id: '',
    });

    const [departemens, setDepartemens] = useState([]);
    const [loadingDepartemen, setLoadingDepartemen] = useState(false);

    // Fetch departemen when cabang changes
    useEffect(() => {
        if (data.cabang_id) {
            setLoadingDepartemen(true);
            axios.get(route('api.departemen.by-cabang', data.cabang_id))
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
            setData('departemen_id', '');
        }
    }, [data.cabang_id]);

    const submit = (e) => {
        e.preventDefault();
        post(route('mata-pelajaran.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Tambah Mata Pelajaran</h2>}
        >
            <Head title="Tambah Mata Pelajaran" />

            <div className="py-12 pb-24">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="nama" value="Nama Mata Pelajaran *" />
                                    <TextInput
                                        id="nama"
                                        type="text"
                                        value={data.nama}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('nama', e.target.value)}
                                        required
                                        placeholder="Contoh: Matematika, Bahasa Indonesia"
                                    />
                                    <InputError message={errors.nama} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="cabang_id" value="Cabang *" />
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
                                    <InputLabel htmlFor="departemen_id" value="Departemen" />
                                    <select
                                        id="departemen_id"
                                        value={data.departemen_id}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm disabled:opacity-50"
                                        onChange={(e) => setData('departemen_id', e.target.value)}
                                        disabled={!data.cabang_id || loadingDepartemen}
                                    >
                                        <option value="">
                                            {loadingDepartemen ? 'Loading...' : !data.cabang_id ? '-- Pilih Cabang Terlebih Dahulu --' : '-- Pilih Departemen (Opsional) --'}
                                        </option>
                                        {departemens.map((departemen) => (
                                            <option key={departemen.id} value={departemen.id}>
                                                {departemen.nama}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.departemen_id} className="mt-2" />
                                    {data.cabang_id && departemens.length === 0 && !loadingDepartemen && (
                                        <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                                            Tidak ada departemen aktif untuk cabang ini
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-end space-x-3">
                                    <Link
                                        href={route('mata-pelajaran.index')}
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
