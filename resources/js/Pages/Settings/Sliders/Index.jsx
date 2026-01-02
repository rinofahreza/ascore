import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2';
import { IconPlus, IconTrash, IconPencil, IconPhoto } from '@tabler/icons-react';

export default function Index({ auth, sliders }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editSlider, setEditSlider] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        judul: '',
        gambar: null,
        urutan: 0,
        status: true,
    });

    const openModal = (slider = null) => {
        setIsEditing(!!slider);
        setEditSlider(slider);
        setData({
            judul: slider ? slider.judul : '',
            gambar: null,
            urutan: slider ? slider.urutan : sliders.length + 1,
            status: slider ? slider.status : true,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            router.post(route('settings.sliders.update', editSlider.id), {
                _method: 'put',
                ...data,
            }, {
                onSuccess: () => {
                    closeModal();
                    Swal.fire('Berhasil', 'Slider berhasil diperbarui', 'success');
                }
            });
        } else {
            post(route('settings.sliders.store'), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire('Berhasil', 'Slider berhasil ditambahkan', 'success');
                }
            });
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Apakah anda yakin?',
            text: "Gambar yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('settings.sliders.destroy', id), {
                    onSuccess: () => Swal.fire('Terhapus!', 'Slider telah dihapus.', 'success')
                });
            }
        });
    };

    const toggleStatus = (slider) => {
        router.put(route('settings.sliders.update', slider.id), {
            ...slider,
            status: !slider.status
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Toast notification could go here
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Slider Gambar" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                            Slider Gambar
                        </h2>
                        <button
                            onClick={() => openModal()}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition"
                        >
                            <IconPlus size={20} />
                            <span>Tambah Gambar</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sliders.map((slider) => (
                            <div key={slider.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group">
                                <div className="relative aspect-video bg-gray-100 dark:bg-gray-900">
                                    <img
                                        src={`/storage/${slider.gambar}`}
                                        alt={slider.judul}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => openModal(slider)}
                                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm"
                                        >
                                            <IconPencil size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(slider.id)}
                                            className="p-2 bg-red-500/80 hover:bg-red-600/80 text-white rounded-full backdrop-blur-sm"
                                        >
                                            <IconTrash size={20} />
                                        </button>
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <div
                                            className={`px-2 py-1 text-xs font-bold rounded-full ${slider.status
                                                    ? 'bg-green-500/90 text-white'
                                                    : 'bg-gray-500/90 text-white'
                                                } cursor-pointer`}
                                            onClick={() => toggleStatus(slider)}
                                        >
                                            {slider.status ? 'Aktif' : 'Nonaktif'}
                                        </div>
                                    </div>
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-md">
                                        Urutan: {slider.urutan}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                                        {slider.judul || 'Tanpa Judul'}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    {sliders.length === 0 && (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            <IconPhoto className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Belum ada gambar slider</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                        {isEditing ? 'Edit Slider' : 'Tambah Slider Baru'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="judul" value="Judul / Keterangan" />
                            <TextInput
                                id="judul"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.judul}
                                onChange={(e) => setData('judul', e.target.value)}
                                placeholder="Contoh: Kegiatan Upacara Senin"
                            />
                            <InputError message={errors.judul} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="urutan" value="Urutan Tampil" />
                            <TextInput
                                id="urutan"
                                type="number"
                                className="mt-1 block w-full"
                                value={data.urutan}
                                onChange={(e) => setData('urutan', e.target.value)}
                            />
                            <InputError message={errors.urutan} className="mt-2" />
                        </div>

                        {!isEditing && (
                            <div>
                                <InputLabel htmlFor="gambar" value="Upload Gambar" />
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md hover:border-teal-500 transition-colors">
                                    <div className="space-y-1 text-center">
                                        <IconPhoto className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                            <label
                                                htmlFor="gambar"
                                                className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"
                                            >
                                                <span>Upload a file</span>
                                                <input
                                                    id="gambar"
                                                    name="gambar"
                                                    type="file"
                                                    className="sr-only"
                                                    onChange={(e) => setData('gambar', e.target.files[0])}
                                                    accept="image/*"
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, GIF up to 2MB
                                        </p>
                                    </div>
                                </div>
                                {data.gambar && (
                                    <p className="mt-2 text-sm text-green-600">
                                        File selected: {data.gambar.name}
                                    </p>
                                )}
                                <InputError message={errors.gambar} className="mt-2" />
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <SecondaryButton onClick={closeModal}>
                                Batal
                            </SecondaryButton>
                            <PrimaryButton disabled={processing}>
                                {isEditing ? 'Simpan Perubahan' : 'Upload Gambar'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
