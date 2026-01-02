import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';
import { IconPhoto, IconTrophy } from '@tabler/icons-react';
import imageCompression from 'browser-image-compression';
import Swal from 'sweetalert2';

export default function Edit({ auth, prestasi }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        nama: prestasi.nama || '',
        role: prestasi.role || '',
        prestasi: prestasi.prestasi || '',
        penghargaan: prestasi.penghargaan || '',
        foto: null,
        tanggal: prestasi.tanggal ? prestasi.tanggal.split('T')[0] : '',
        urutan: prestasi.urutan || 0,
        is_active: prestasi.is_active
    });

    const [preview, setPreview] = useState(prestasi.foto || null);
    const [isCompressing, setIsCompressing] = useState(false);

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsCompressing(true);
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, fileType: 'image/jpeg' };

            const compressedBlob = await imageCompression(file, options);
            const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', { type: 'image/jpeg', lastModified: Date.now() });

            setData('foto', compressedFile);
            setPreview(URL.createObjectURL(compressedFile));
        } catch (error) {
            console.error('Error compressing image:', error);
            Swal.fire('Error', 'Gagal memproses gambar.', 'error');
        } finally {
            setIsCompressing(false);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('prestasi.update', prestasi.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Prestasi</h2>}
        >
            <Head title="Edit Prestasi" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Photo Upload */}
                                <div className="flex flex-col items-center justify-center mb-6">
                                    <div className="w-32 h-32 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 relative group">
                                        {preview ? (
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <IconPhoto size={48} className="text-gray-400" />
                                        )}
                                        <label htmlFor="foto" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white font-medium text-xs">
                                            {isCompressing ? 'Memproses...' : 'Ubah Foto'}
                                        </label>
                                        <input
                                            type="file"
                                            id="foto"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                            accept="image/*"
                                            disabled={isCompressing}
                                        />
                                    </div>
                                    <InputError message={errors.foto} className="mt-2" />
                                    <p className="text-xs text-gray-500 mt-2">Format: JPG, PNG. Max: 2MB (Automatis Kompres)</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Nama */}
                                    <div>
                                        <InputLabel htmlFor="nama" value="Nama Lengkap" />
                                        <TextInput
                                            id="nama"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.nama}
                                            onChange={(e) => setData('nama', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.nama} className="mt-2" />
                                    </div>

                                    {/* Role / Jabatan */}
                                    <div>
                                        <InputLabel htmlFor="role" value="Jabatan / Role" />
                                        <TextInput
                                            id="role"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.role}
                                            onChange={(e) => setData('role', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.role} className="mt-2" />
                                    </div>

                                    {/* Prestasi */}
                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="prestasi" value="Nama Prestasi" />
                                        <TextInput
                                            id="prestasi"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.prestasi}
                                            onChange={(e) => setData('prestasi', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.prestasi} className="mt-2" />
                                    </div>

                                    {/* Penghargaan */}
                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="penghargaan" value="Penghargaan / Reward" />
                                        <div className="relative">
                                            <TextInput
                                                id="penghargaan"
                                                type="text"
                                                className="mt-1 block w-full pl-10"
                                                value={data.penghargaan}
                                                onChange={(e) => setData('penghargaan', e.target.value)}
                                                required
                                            />
                                            <IconTrophy className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                        </div>
                                        <InputError message={errors.penghargaan} className="mt-2" />
                                    </div>

                                    {/* Tanggal */}
                                    <div>
                                        <InputLabel htmlFor="tanggal" value="Tanggal Prestasi" />
                                        <TextInput
                                            id="tanggal"
                                            type="date"
                                            className="mt-1 block w-full"
                                            value={data.tanggal}
                                            onChange={(e) => setData('tanggal', e.target.value)}
                                        />
                                        <InputError message={errors.tanggal} className="mt-2" />
                                    </div>

                                    {/* Urutan */}
                                    <div>
                                        <InputLabel htmlFor="urutan" value="Urutan (Prioritas)" />
                                        <TextInput
                                            id="urutan"
                                            type="number"
                                            className="mt-1 block w-full"
                                            value={data.urutan}
                                            onChange={(e) => setData('urutan', e.target.value)}
                                            min="0"
                                        />
                                        <InputError message={errors.urutan} className="mt-2" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end mt-4 gap-3">
                                    <Link
                                        href={route('prestasi.index')}
                                        className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-md font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        Batal
                                    </Link>
                                    <PrimaryButton disabled={processing || isCompressing}>
                                        {isCompressing ? 'Memproses Gambar...' : 'Simpan Perubahan'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
