import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import BottomNav from '@/Components/BottomNav';

export default function Edit({ auth, guru, roles, cabangs }) {
    const { data, setData, put, processing, errors } = useForm({
        role_id: guru?.role_id || '',
        user_id: guru?.user_id || '',
        nig: guru?.nig || '',
        bidang_studi: guru?.bidang_studi || '',
        status: guru?.status || 'Tetap',
        no_kk: guru?.no_kk || '',
        nik: guru?.nik || '',
        tempat_lahir: guru?.tempat_lahir || '',
        tanggal_lahir: guru?.tanggal_lahir || '',
        jenis_kelamin: guru?.jenis_kelamin || '',
        alamat: guru?.alamat || '',
        rt_rw: guru?.rt_rw || '',
        kelurahan_desa: guru?.kelurahan_desa || '',
        kecamatan: guru?.kecamatan || '',
        kabupaten_kota: guru?.kabupaten_kota || '',
        provinsi: guru?.provinsi || '',
        agama: guru?.agama || '',
        status_perkawinan: guru?.status_perkawinan || '',
        pekerjaan: guru?.pekerjaan || '',
        pendidikan_terakhir: guru?.pendidikan_terakhir || '',
        tanggal_masuk: guru?.tanggal_masuk || '',
        tanggal_sk: guru?.tanggal_sk || '',
        nomor_sk: guru?.nomor_sk || '',
    });

    // Filter states (initialized from user's data, not saved to database)
    const [filterCabang, setFilterCabang] = useState(guru?.user_cabang_id || '');
    const [filterDepartemen, setFilterDepartemen] = useState(guru?.user_departemen_id || '');

    const [departemens, setDepartemens] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingDepartemen, setLoadingDepartemen] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Fetch departemen when filter cabang changes
    useEffect(() => {
        if (filterCabang) {
            setLoadingDepartemen(true);
            axios.get(route('api.departemen.by-cabang', filterCabang))
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
            setFilterDepartemen('');
        }
    }, [filterCabang]);

    // Fetch users when filters change
    useEffect(() => {
        if (filterCabang && data.role_id) {
            setLoadingUsers(true);
            const params = {
                cabang_id: filterCabang,
                role_id: data.role_id,
                include_user_id: guru.user_id // Include current user in list
            };
            if (filterDepartemen) {
                params.departemen_id = filterDepartemen;
            }

            axios.get(route('api.users.by-filters'), { params })
                .then(response => {
                    setUsers(response.data);
                    setLoadingUsers(false);
                })
                .catch(error => {
                    console.error('Error fetching users:', error);
                    setLoadingUsers(false);
                });
        } else {
            setUsers([]);
        }
    }, [filterCabang, filterDepartemen, data.role_id]);

    const submit = (e) => {
        e.preventDefault();
        put(route('guru.update', guru.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Guru</h2>}
        >
            <Head title="Edit Guru" />

            <div className="py-12 pb-32">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Filter Section - Not saved to database */}
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3">Filter Pengguna</h3>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-4">
                                        Gunakan filter ini untuk mempersempit pencarian pengguna berdasarkan cabang dan departemen
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <InputLabel htmlFor="filter_cabang" value="Cabang *" />
                                            <select
                                                id="filter_cabang"
                                                value={filterCabang}
                                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                                onChange={(e) => setFilterCabang(e.target.value)}
                                            >
                                                <option value="">-- Pilih Cabang --</option>
                                                {cabangs.map((cabang) => (
                                                    <option key={cabang.id} value={cabang.id}>
                                                        {cabang.nama}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="filter_departemen" value="Departemen" />
                                            <select
                                                id="filter_departemen"
                                                value={filterDepartemen}
                                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm disabled:opacity-50"
                                                onChange={(e) => setFilterDepartemen(e.target.value)}
                                                disabled={!filterCabang || loadingDepartemen}
                                            >
                                                <option value="">
                                                    {loadingDepartemen ? 'Loading...' : !filterCabang ? '-- Pilih Cabang Terlebih Dahulu --' : '-- Semua Departemen --'}
                                                </option>
                                                {departemens.map((departemen) => (
                                                    <option key={departemen.id} value={departemen.id}>
                                                        {departemen.nama}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Actual Form Fields - Saved to database */}
                                <div>
                                    <InputLabel htmlFor="role_id" value="Peran *" />
                                    <select
                                        id="role_id"
                                        value={data.role_id}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        onChange={(e) => setData('role_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Pilih Peran --</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.nama}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.role_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="user_id" value="Nama *" />
                                    <select
                                        id="user_id"
                                        value={data.user_id}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm disabled:opacity-50"
                                        onChange={(e) => setData('user_id', e.target.value)}
                                        disabled={!filterCabang || !data.role_id || loadingUsers}
                                        required
                                    >
                                        <option value="">
                                            {loadingUsers ? 'Loading...' : (!filterCabang || !data.role_id) ? '-- Pilih Cabang dan Peran Terlebih Dahulu --' : '-- Pilih Nama --'}
                                        </option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.user_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="nig" value="NIG (Nomor Induk Guru)" />
                                    <TextInput
                                        id="nig"
                                        type="text"
                                        value={data.nig}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('nig', e.target.value)}
                                        placeholder="Contoh: 123456789 (Opsional)"
                                    />
                                    <InputError message={errors.nig} className="mt-2" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <InputLabel htmlFor="tanggal_masuk" value="Tanggal Masuk" />
                                        <TextInput
                                            id="tanggal_masuk"
                                            type="date"
                                            value={data.tanggal_masuk}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('tanggal_masuk', e.target.value)}
                                        />
                                        <InputError message={errors.tanggal_masuk} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="tanggal_sk" value="Tanggal SK" />
                                        <TextInput
                                            id="tanggal_sk"
                                            type="date"
                                            value={data.tanggal_sk}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('tanggal_sk', e.target.value)}
                                        />
                                        <InputError message={errors.tanggal_sk} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="nomor_sk" value="Nomor SK" />
                                        <TextInput
                                            id="nomor_sk"
                                            type="text"
                                            value={data.nomor_sk}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('nomor_sk', e.target.value)}
                                            placeholder="Opsional"
                                        />
                                        <InputError message={errors.nomor_sk} className="mt-2" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="bidang_studi" value="Bidang Studi" />
                                    <TextInput
                                        id="bidang_studi"
                                        type="text"
                                        value={data.bidang_studi}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('bidang_studi', e.target.value)}
                                        placeholder="Contoh: Matematika, Bahasa Indonesia (Opsional)"
                                    />
                                    <InputError message={errors.bidang_studi} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="status" value="Status Kepegawaian" />
                                    <select
                                        id="status"
                                        value={data.status}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        onChange={(e) => setData('status', e.target.value)}
                                    >
                                        <option value="Tetap">Tetap</option>
                                        <option value="Percobaan">Percobaan</option>
                                        <option value="Kontrak">Kontrak</option>
                                        <option value="Mitra Kerja">Mitra Kerja</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                <div className="border-t pt-4 mt-4">
                                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-4">Informasi Identitas</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="no_kk" value="No. KK" />
                                            <TextInput id="no_kk" value={data.no_kk} onChange={(e) => setData('no_kk', e.target.value)} className="mt-1 block w-full" placeholder="Opsional" />
                                            <InputError message={errors.no_kk} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="nik" value="NIK" />
                                            <TextInput id="nik" value={data.nik} onChange={(e) => setData('nik', e.target.value)} className="mt-1 block w-full" placeholder="Opsional" />
                                            <InputError message={errors.nik} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="tempat_lahir" value="Tempat Lahir" />
                                            <TextInput id="tempat_lahir" value={data.tempat_lahir} onChange={(e) => setData('tempat_lahir', e.target.value)} className="mt-1 block w-full" placeholder="Opsional" />
                                            <InputError message={errors.tempat_lahir} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="tanggal_lahir" value="Tanggal Lahir" />
                                            <TextInput id="tanggal_lahir" type="date" value={data.tanggal_lahir} onChange={(e) => setData('tanggal_lahir', e.target.value)} className="mt-1 block w-full" />
                                            <InputError message={errors.tanggal_lahir} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="jenis_kelamin" value="Jenis Kelamin" />
                                            <select id="jenis_kelamin" value={data.jenis_kelamin} onChange={(e) => setData('jenis_kelamin', e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm">
                                                <option value="">-- Pilih --</option>
                                                <option value="L">Laki-laki</option>
                                                <option value="P">Perempuan</option>
                                            </select>
                                            <InputError message={errors.jenis_kelamin} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="agama" value="Agama" />
                                            <TextInput id="agama" value={data.agama} onChange={(e) => setData('agama', e.target.value)} className="mt-1 block w-full" placeholder="Opsional" />
                                            <InputError message={errors.agama} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="status_perkawinan" value="Status Perkawinan" />
                                            <TextInput id="status_perkawinan" value={data.status_perkawinan} onChange={(e) => setData('status_perkawinan', e.target.value)} className="mt-1 block w-full" placeholder="Opsional" />
                                            <InputError message={errors.status_perkawinan} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="pekerjaan" value="Pekerjaan" />
                                            <TextInput id="pekerjaan" value={data.pekerjaan} onChange={(e) => setData('pekerjaan', e.target.value)} className="mt-1 block w-full" placeholder="Opsional" />
                                            <InputError message={errors.pekerjaan} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="pendidikan_terakhir" value="Pendidikan Terakhir" />
                                            <TextInput id="pendidikan_terakhir" value={data.pendidikan_terakhir} onChange={(e) => setData('pendidikan_terakhir', e.target.value)} className="mt-1 block w-full" placeholder="Opsional" />
                                            <InputError message={errors.pendidikan_terakhir} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4 mt-4">
                                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-4">Informasi Alamat</h4>
                                    <div>
                                        <InputLabel htmlFor="alamat" value="Alamat Lengkap" />
                                        <textarea id="alamat" value={data.alamat} onChange={(e) => setData('alamat', e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm" rows="3" placeholder="Opsional"></textarea>
                                        <InputError message={errors.alamat} className="mt-2" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <InputLabel htmlFor="rt_rw" value="RT / RW" />
                                            <TextInput id="rt_rw" value={data.rt_rw} onChange={(e) => setData('rt_rw', e.target.value)} className="mt-1 block w-full" placeholder="Contoh: 001/002" />
                                            <InputError message={errors.rt_rw} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="kelurahan_desa" value="Kelurahan / Desa" />
                                            <TextInput id="kelurahan_desa" value={data.kelurahan_desa} onChange={(e) => setData('kelurahan_desa', e.target.value)} className="mt-1 block w-full" placeholder="Opsional" />
                                            <InputError message={errors.kelurahan_desa} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="kecamatan" value="Kecamatan" />
                                            <TextInput id="kecamatan" value={data.kecamatan} onChange={(e) => setData('kecamatan', e.target.value)} className="mt-1 block w-full" placeholder="Opsional" />
                                            <InputError message={errors.kecamatan} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="kabupaten_kota" value="Kabupaten / Kota" />
                                            <TextInput id="kabupaten_kota" value={data.kabupaten_kota} onChange={(e) => setData('kabupaten_kota', e.target.value)} className="mt-1 block w-full" placeholder="Opsional" />
                                            <InputError message={errors.kabupaten_kota} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="provinsi" value="Provinsi" />
                                            <TextInput id="provinsi" value={data.provinsi} onChange={(e) => setData('provinsi', e.target.value)} className="mt-1 block w-full" placeholder="Opsional" />
                                            <InputError message={errors.provinsi} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-3">
                                    <Link
                                        href={route('guru.index')}
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
