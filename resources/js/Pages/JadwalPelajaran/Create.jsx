import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import BottomNav from '@/Components/BottomNav';

export default function Create({ auth, cabangs, jamPelajarans, hariOptions, periodeAkademiks, activePeriode }) {
    const { data, setData, post, processing, errors } = useForm({
        periode_akademik_id: activePeriode?.id || '',
        cabang_id: '',
        departemen_id: '',
        hari: '',
        kelas_id: '',
        mata_pelajaran_id: '',
        jam_pelajaran_id: '',
        guru_id: '',
    });

    const [departemens, setDepartemens] = useState([]);
    const [kelass, setKelass] = useState([]);
    const [mataPelajarans, setMataPelajarans] = useState([]);
    const [gurus, setGurus] = useState([]);

    const [loadingDepartemen, setLoadingDepartemen] = useState(false);
    const [loadingKelas, setLoadingKelas] = useState(false);
    const [loadingMataPelajaran, setLoadingMataPelajaran] = useState(false);
    const [loadingGuru, setLoadingGuru] = useState(false);

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

    // Fetch kelas, mata pelajaran, and guru when departemen changes
    useEffect(() => {
        if (data.departemen_id) {
            // Fetch Kelas
            setLoadingKelas(true);
            axios.get(route('api.kelas.by-departemen', data.departemen_id))
                .then(response => {
                    setKelass(response.data);
                    setLoadingKelas(false);
                })
                .catch(error => {
                    console.error('Error fetching kelas:', error);
                    setLoadingKelas(false);
                });

            // Fetch Mata Pelajaran
            setLoadingMataPelajaran(true);
            axios.get(route('api.mata-pelajaran.by-departemen', data.departemen_id))
                .then(response => {
                    setMataPelajarans(response.data);
                    setLoadingMataPelajaran(false);
                })
                .catch(error => {
                    console.error('Error fetching mata pelajaran:', error);
                    setLoadingMataPelajaran(false);
                });

            // Fetch Guru
            setLoadingGuru(true);
            axios.get(route('api.guru.by-departemen', data.departemen_id))
                .then(response => {
                    setGurus(response.data);
                    setLoadingGuru(false);
                })
                .catch(error => {
                    console.error('Error fetching guru:', error);
                    setLoadingGuru(false);
                });
        } else {
            setKelass([]);
            setMataPelajarans([]);
            setGurus([]);
            setData(prev => ({
                ...prev,
                kelas_id: '',
                mata_pelajaran_id: '',
                guru_id: ''
            }));
        }
    }, [data.departemen_id]);

    const submit = (e) => {
        e.preventDefault();
        post(route('jadwal-pelajaran.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Tambah Jadwal Pelajaran</h2>}
        >
            <Head title="Tambah Jadwal Pelajaran" />

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

                                {/* Filter Section */}
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3">Filter Lokasi</h3>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-4">
                                        Pilih cabang dan departemen terlebih dahulu untuk memfilter data
                                    </p>

                                    <div className="space-y-4">
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
                                            <InputLabel htmlFor="departemen_id" value="Departemen *" />
                                            <select
                                                id="departemen_id"
                                                value={data.departemen_id}
                                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm disabled:opacity-50"
                                                onChange={(e) => setData('departemen_id', e.target.value)}
                                                disabled={!data.cabang_id || loadingDepartemen}
                                                required
                                            >
                                                <option value="">
                                                    {loadingDepartemen ? 'Loading...' : !data.cabang_id ? '-- Pilih Cabang Terlebih Dahulu --' : '-- Pilih Departemen --'}
                                                </option>
                                                {departemens.map((departemen) => (
                                                    <option key={departemen.id} value={departemen.id}>
                                                        {departemen.nama}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.departemen_id} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields */}
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

                                <div>
                                    <InputLabel htmlFor="kelas_id" value="Kelas *" />
                                    <select
                                        id="kelas_id"
                                        value={data.kelas_id}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm disabled:opacity-50"
                                        onChange={(e) => setData('kelas_id', e.target.value)}
                                        disabled={!data.departemen_id || loadingKelas}
                                        required
                                    >
                                        <option value="">
                                            {loadingKelas ? 'Loading...' : !data.departemen_id ? '-- Pilih Departemen Terlebih Dahulu --' : '-- Pilih Kelas --'}
                                        </option>
                                        {kelass.map((kelas) => (
                                            <option key={kelas.id} value={kelas.id}>
                                                {kelas.nama}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.kelas_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="mata_pelajaran_id" value="Mata Pelajaran *" />
                                    <select
                                        id="mata_pelajaran_id"
                                        value={data.mata_pelajaran_id}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm disabled:opacity-50"
                                        onChange={(e) => setData('mata_pelajaran_id', e.target.value)}
                                        disabled={!data.departemen_id || loadingMataPelajaran}
                                        required
                                    >
                                        <option value="">
                                            {loadingMataPelajaran ? 'Loading...' : !data.departemen_id ? '-- Pilih Departemen Terlebih Dahulu --' : '-- Pilih Mata Pelajaran --'}
                                        </option>
                                        {mataPelajarans.map((mapel) => (
                                            <option key={mapel.id} value={mapel.id}>
                                                {mapel.nama}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.mata_pelajaran_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="jam_pelajaran_id" value="Jam Pelajaran *" />
                                    <select
                                        id="jam_pelajaran_id"
                                        value={data.jam_pelajaran_id}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm disabled:opacity-50"
                                        onChange={(e) => setData('jam_pelajaran_id', e.target.value)}
                                        disabled={!data.hari}
                                        required
                                    >
                                        <option value="">
                                            {!data.hari ? '-- Pilih Hari Terlebih Dahulu --' : '-- Pilih Jam Pelajaran --'}
                                        </option>
                                        {jamPelajarans
                                            .filter(jam => jam.hari === data.hari)
                                            .map((jam) => (
                                                <option key={jam.id} value={jam.id}>
                                                    {jam.nama} ({jam.jam_mulai} - {jam.jam_selesai})
                                                </option>
                                            ))}
                                    </select>
                                    <InputError message={errors.jam_pelajaran_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="guru_id" value="Guru *" />
                                    <select
                                        id="guru_id"
                                        value={data.guru_id}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm disabled:opacity-50"
                                        onChange={(e) => setData('guru_id', e.target.value)}
                                        disabled={!data.departemen_id || loadingGuru}
                                        required
                                    >
                                        <option value="">
                                            {loadingGuru ? 'Loading...' : !data.departemen_id ? '-- Pilih Departemen Terlebih Dahulu --' : '-- Pilih Guru --'}
                                        </option>
                                        {gurus.map((guru) => (
                                            <option key={guru.id} value={guru.id}>
                                                {guru.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.guru_id} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end space-x-3">
                                    <Link
                                        href={route('jadwal-pelajaran.index')}
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
