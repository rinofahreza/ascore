import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import BottomNav from '@/Components/BottomNav';

export default function Edit({ auth, cabang }) {
    const { data, setData, put, processing, errors } = useForm({
        nama: cabang.nama || '',
        alamat: cabang.alamat || '',
        latitude: cabang.latitude || '',
        longitude: cabang.longitude || '',
        radius: cabang.radius || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('cabang.update', cabang.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Cabang</h2>}
        >
            <Head title="Edit Cabang" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="nama" value="Nama Cabang *" />
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

                                <div>
                                    <InputLabel htmlFor="alamat" value="Alamat" />
                                    <textarea
                                        id="alamat"
                                        value={data.alamat}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        rows="3"
                                        onChange={(e) => setData('alamat', e.target.value)}
                                    />
                                    <InputError message={errors.alamat} className="mt-2" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="latitude" value="Latitude" />
                                        <TextInput
                                            id="latitude"
                                            type="number"
                                            step="0.00000001"
                                            value={data.latitude}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('latitude', e.target.value)}
                                            placeholder="-6.200000"
                                        />
                                        <InputError message={errors.latitude} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="longitude" value="Longitude" />
                                        <TextInput
                                            id="longitude"
                                            type="number"
                                            step="0.00000001"
                                            value={data.longitude}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('longitude', e.target.value)}
                                            placeholder="106.816666"
                                        />
                                        <InputError message={errors.longitude} className="mt-2" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="radius" value="Radius (meter)" />
                                    <TextInput
                                        id="radius"
                                        type="number"
                                        value={data.radius}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('radius', e.target.value)}
                                        placeholder="100"
                                    />
                                    <InputError message={errors.radius} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end space-x-3">
                                    <Link
                                        href={route('cabang.index')}
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
