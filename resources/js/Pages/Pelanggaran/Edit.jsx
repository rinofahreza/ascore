import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import BottomNav from '@/Components/BottomNav';

export default function Edit({ auth, pelanggaran, cabangs, poins }) {
    const { data, setData, put, processing, errors } = useForm({
        cabang_id: pelanggaran.kelas?.cabang_id || '',
        departemen_id: pelanggaran.kelas?.departemen_id || '',
        kelas_id: pelanggaran.kelas_id || '',
        siswa_id: pelanggaran.siswa_id || '',
        poin_id: pelanggaran.poin_id || '',
        periode_akademik_id: pelanggaran.periode_akademik_id || '',
        tanggal: pelanggaran.tanggal || '',
        deskripsi: pelanggaran.deskripsi || '',
        tindak_lanjut: pelanggaran.tindak_lanjut || '',
        konsekuensi: pelanggaran.konsekuensi || '',
    });

    const [departemens, setDepartemens] = useState([]);
    const [kelases, setKelases] = useState([]);
    const [siswas, setSiswas] = useState([]);
    const [loadingDepartemen, setLoadingDepartemen] = useState(false);
    const [loadingKelas, setLoadingKelas] = useState(false);
    const [loadingSiswa, setLoadingSiswa] = useState(false);

    // Initial load - fetch departemen for pre-selected cabang
    useEffect(() => {
        if (pelanggaran.kelas?.cabang_id) {
            setLoadingDepartemen(true);
            axios.get(route('api.departemen.by-cabang', pelanggaran.kelas.cabang_id))
                .then(response => {
                    setDepartemens(response.data);
                    setLoadingDepartemen(false);
                })
                .catch(error => {
                    console.error('Error fetching departemen:', error);
                    setLoadingDepartemen(false);
                });
        }
    }, []);

    // Initial load - fetch kelas for pre-selected departemen
    useEffect(() => {
        if (pelanggaran.kelas?.departemen_id) {
            setLoadingKelas(true);
            axios.get(route('api.kelas.by-departemen', pelanggaran.kelas.departemen_id))
                .then(response => {
                    setKelases(response.data);
                    setLoadingKelas(false);
                })
                .catch(error => {
                    console.error('Error fetching kelas:', error);
                    setLoadingKelas(false);
                });
        }
    }, []);

    // Initial load - fetch siswa for pre-selected kelas
    useEffect(() => {
        if (pelanggaran.kelas_id) {
            setLoadingSiswa(true);
            axios.get(route('api.siswa.by-kelas', pelanggaran.kelas_id))
                .then(response => {
                    setSiswas(response.data);
                    setLoadingSiswa(false);
                })
                .catch(error => {
                    console.error('Error fetching siswa:', error);
                    setLoadingSiswa(false);
                });
        }
    }, []);

    // Fetch departemen when cabang changes
    useEffect(() => {
        if (data.cabang_id && data.cabang_id !== pelanggaran.kelas?.cabang_id) {
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
        }
    }, [data.cabang_id]);

    // Fetch kelas when departemen changes
    useEffect(() => {
        if (data.departemen_id && data.departemen_id !== pelanggaran.kelas?.departemen_id) {
            setLoadingKelas(true);
            axios.get(route('api.kelas.by-departemen', data.departemen_id))
                .then(response => {
                    setKelases(response.data);
                    setLoadingKelas(false);
                })
                .catch(error => {
                    console.error('Error fetching kelas:', error);
                    setLoadingKelas(false);
                });
        }
    }, [data.departemen_id]);

    // Fetch siswa when kelas changes
    useEffect(() => {
        if (data.kelas_id && data.kelas_id !== pelanggaran.kelas_id) {
            setLoadingSiswa(true);
            axios.get(route('api.siswa.by-kelas', data.kelas_id))
                .then(response => {
                    setSiswas(response.data);
                    setLoadingSiswa(false);
                })
                .catch(error => {
                    console.error('Error fetching siswa:', error);
                    setLoadingSiswa(false);
                });
        }
    }, [data.kelas_id]);

    const submit = (e) => {
        e.preventDefault();
        put(route('pelanggaran.update', pelanggaran.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Pelanggaran</h2>}
        >
            <Head title="Edit Pelanggaran" />

            <div className="py-12 pb-32">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Cascading Dropdowns */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            {kelases.map((kelas) => (
                                                <option key={kelas.id} value={kelas.id}>
                                                    {kelas.nama}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.kelas_id} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="siswa_id" value="Siswa *" />
                                        <select
                                            id="siswa_id"
                                            value={data.siswa_id}
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm disabled:opacity-50"
                                            onChange={(e) => setData('siswa_id', e.target.value)}
                                            disabled={!data.kelas_id || loadingSiswa}
                                            required
                                        >
                                            <option value="">
                                                {loadingSiswa ? 'Loading...' : !data.kelas_id ? '-- Pilih Kelas Terlebih Dahulu --' : '-- Pilih Siswa --'}
                                            </option>
                                            {siswas.map((siswa) => (
                                                <option key={siswa.id} value={siswa.id}>
                                                    {siswa.nisn} - {siswa.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.siswa_id} className="mt-2" />
                                    </div>
                                </div>

                                {/* Pelanggaran & Tanggal */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="poin_id" value="Pelanggaran *" />
                                        <select
                                            id="poin_id"
                                            value={data.poin_id}
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                            onChange={(e) => setData('poin_id', e.target.value)}
                                            required
                                        >
                                            <option value="">-- Pilih Pelanggaran --</option>
                                            {poins.map((poin) => (
                                                <option key={poin.id} value={poin.id}>
                                                    {poin.nama} ({poin.kategori})
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.poin_id} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="tanggal" value="Tanggal *" />
                                        <TextInput
                                            id="tanggal"
                                            type="date"
                                            className="mt-1 block w-full"
                                            value={data.tanggal}
                                            onChange={(e) => setData('tanggal', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.tanggal} className="mt-2" />
                                    </div>
                                </div>

                                {/* Deskripsi */}
                                <div>
                                    <InputLabel htmlFor="deskripsi" value="Deskripsi *" />
                                    <textarea
                                        id="deskripsi"
                                        rows="4"
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        value={data.deskripsi}
                                        onChange={(e) => setData('deskripsi', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.deskripsi} className="mt-2" />
                                </div>

                                {/* Tindak Lanjut */}
                                <div>
                                    <InputLabel htmlFor="tindak_lanjut" value="Tindak Lanjut" />
                                    <textarea
                                        id="tindak_lanjut"
                                        rows="3"
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        value={data.tindak_lanjut}
                                        onChange={(e) => setData('tindak_lanjut', e.target.value)}
                                    />
                                    <InputError message={errors.tindak_lanjut} className="mt-2" />
                                </div>

                                {/* Konsekuensi */}
                                <div>
                                    <InputLabel htmlFor="konsekuensi" value="Konsekuensi" />
                                    <textarea
                                        id="konsekuensi"
                                        rows="3"
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        value={data.konsekuensi}
                                        onChange={(e) => setData('konsekuensi', e.target.value)}
                                    />
                                    <InputError message={errors.konsekuensi} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end space-x-3">
                                    <Link
                                        href={route('pelanggaran.index')}
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
