import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import BottomNav from '@/Components/BottomNav';

export default function Edit({ auth, level }) {
    const { data, setData, put, processing, errors } = useForm({
        nama: level.nama || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('level.update', level.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Level</h2>}
        >
            <Head title="Edit Level" />

            <div className="py-12 pb-24">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="nama" value="Nama *" />
                                    <TextInput
                                        id="nama"
                                        type="text"
                                        value={data.nama}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('nama', e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.nama} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end space-x-3">
                                    <Link
                                        href={route('level.index')}
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
