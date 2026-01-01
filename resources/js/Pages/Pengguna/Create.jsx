import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import BottomNav from '@/Components/BottomNav';

export default function Create({ auth, roles, cabangs, departemens }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        rfid: '',
        password: '',
        role_id: '',
        cabang_id: '',
        departemen_id: '',
        is_active: 1,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('pengguna.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Tambah Pengguna</h2>}
        >
            <Head title="Tambah Pengguna" />

            <div className="py-12 pb-32">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Nama Lengkap *" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email *" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="rfid" value="RFID" />
                                    <TextInput
                                        id="rfid"
                                        type="text"
                                        value={data.rfid}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('rfid', e.target.value)}
                                    />
                                    <InputError message={errors.rfid} className="mt-2" />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Opsional - ID kartu RFID</p>
                                </div>

                                <div>
                                    <InputLabel htmlFor="password" value="Password *" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Minimal 8 karakter</p>
                                </div>

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
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        onChange={(e) => setData('departemen_id', e.target.value)}
                                    >
                                        <option value="">-- Pilih Departemen (Opsional) --</option>
                                        {departemens.map((departemen) => (
                                            <option key={departemen.id} value={departemen.id}>
                                                {departemen.nama}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.departemen_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="is_active" value="Status Aktif *" />
                                    <select
                                        id="is_active"
                                        value={data.is_active}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        onChange={(e) => setData('is_active', e.target.value)}
                                        required
                                    >
                                        <option value="1">Aktif</option>
                                        <option value="0">Non-Aktif</option>
                                    </select>
                                    <InputError message={errors.is_active} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end space-x-3">
                                    <Link
                                        href={route('pengguna.index')}
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
