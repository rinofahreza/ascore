import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import BottomNav from '@/Components/BottomNav';

export default function Create({ auth, cabangs, periodeAkademiks, activePeriode }) {
    const { data, setData, post, processing, errors } = useForm({
        periode_akademik_id: activePeriode?.id || '',
        cabang_id: '',
        departemen_id: '',
        hari: '',
        nama: '',
        jam_mulai: '',
        jam_selesai: '',
    });

    const [departemens, setDepartemens] = useState([]);
    const [loadingDepartemen, setLoadingDepartemen] = useState(false);

    const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

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
        post(route('jam-pelajaran.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Tambah Jam Pelajaran</h2>}
        >
            <Head title="Tambah Jam Pelajaran" />

            <div className="py-12 pb-24">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Periode Akademik */}
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

                                {/* Cabang */}
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

                                {/* Departemen */}
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
                                </div>

                                {/* Hari */}
                                <div>
                                    <InputLabel htmlFor="hari" value="Hari *" />
                                    <select
                                        id="hari"
                                        value={data.hari}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        onChange={(e) => setData('hari', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Pilih Hari --</option>
                                        {hariOptions.map((hari) => (
                                            <option key={hari} value={hari}>
                                                {hari}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.hari} className="mt-2" />
                                </div>

                                {/* Nama */}
                                <div>
                                    <InputLabel htmlFor="nama" value="Nama *" />
                                    <TextInput
                                        id="nama"
                                        type="text"
                                        value={data.nama}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('nama', e.target.value)}
                                        required
                                        placeholder="Contoh: JP1, JP2, Istirahat"
                                    />
                                    <InputError message={errors.nama} className="mt-2" />
                                </div>

                                {/* Jam Mulai & Jam Selesai */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="jam_mulai" value="Jam Mulai *" />
                                        <TextInput
                                            id="jam_mulai"
                                            type="time"
                                            value={data.jam_mulai}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('jam_mulai', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.jam_mulai} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="jam_selesai" value="Jam Selesai *" />
                                        <TextInput
                                            id="jam_selesai"
                                            type="time"
                                            value={data.jam_selesai}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('jam_selesai', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.jam_selesai} className="mt-2" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-3">
                                    <Link
                                        href={route('jam-pelajaran.index')}
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
