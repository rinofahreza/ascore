import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BottomNav from '@/Components/BottomNav';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Index({ auth, berkas }) {
    const { props } = usePage();
    const flash = props.flash || {};
    const [isDragging, setIsDragging] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
    const [showFlash, setShowFlash] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
        custom_filename: '',
    });

    // Initialize AOS
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
        });
    }, []);

    // Show flash message on mount if exists
    useEffect(() => {
        if (flash.success || flash.error) {
            setShowFlash(true);
            const timer = setTimeout(() => {
                setShowFlash(false);
            }, 3000); // Hide after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        validateAndSetFile(file);
    };

    const validateAndSetFile = (file) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            alert('File harus berupa gambar (JPG, JPEG, PNG, GIF) atau PDF');
            return;
        }

        // Validate file size (2MB = 2048KB = 2097152 bytes)
        if (file.size > 2097152) {
            alert('Ukuran file maksimal 2MB');
            return;
        }

        // Get filename without extension
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
        setData({
            file: file,
            custom_filename: nameWithoutExt
        });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        validateAndSetFile(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('berkas.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleDownload = async (id, filename) => {
        try {
            // Fetch the file as blob
            const response = await fetch(route('berkas.download', id), {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error('Download failed');
            }

            // Get blob from response
            const blob = await response.blob();

            // Create blob URL
            const url = window.URL.createObjectURL(blob);

            // Create temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            alert('Gagal mendownload file');
        }
    };

    const handleDelete = (id) => {
        router.delete(route('berkas.destroy', id), {
            onSuccess: () => {
                setConfirmDelete({ isOpen: false, id: null });
            },
        });
    };

    const getFileIcon = (icon) => {
        if (icon === 'image') {
            return (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
        } else if (icon === 'pdf') {
            return (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            );
        }
        return (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        );
    };

    // Colors for dynamic cards (matching Jurnal style)
    const cardColors = [
        { bg: 'bg-orange-100 dark:bg-orange-900/30', iconBg: 'bg-white/60 dark:bg-orange-900/50', iconText: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-700/50' },
        { bg: 'bg-green-100 dark:bg-green-900/30', iconBg: 'bg-white/60 dark:bg-green-900/50', iconText: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-700/50' },
        { bg: 'bg-blue-100 dark:bg-blue-900/30', iconBg: 'bg-white/60 dark:bg-blue-900/50', iconText: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-700/50' },
        { bg: 'bg-red-100 dark:bg-red-900/30', iconBg: 'bg-white/60 dark:bg-red-900/50', iconText: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-700/50' },
        { bg: 'bg-purple-100 dark:bg-purple-900/30', iconBg: 'bg-white/60 dark:bg-purple-900/50', iconText: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-700/50' },
        { bg: 'bg-teal-100 dark:bg-teal-900/30', iconBg: 'bg-white/60 dark:bg-teal-900/50', iconText: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-700/50' },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Berkas" />

            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-24 pt-header">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">

                    {/* Header */}


                    {/* Upload Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8" data-aos="fade-up">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                            <span className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </span>
                            Upload File Baru
                        </h2>

                        <form onSubmit={handleSubmit}>
                            {/* Drag & Drop Area */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isDragging
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 scale-[1.01]'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-[var(--color-primary)]/50'
                                    }`}
                            >
                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="mt-2">
                                    <label htmlFor="file-upload" className="cursor-pointer relative z-10">
                                        <span className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-bold underline decoration-2 decoration-transparent hover:decoration-[var(--color-primary)] transition-all">
                                            Pilih file
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400 font-medium ml-1">atau drag & drop disini</span>
                                    </label>
                                    <input
                                        id="file-upload"
                                        name="file"
                                        type="file"
                                        className="sr-only"
                                        onChange={handleFileChange}
                                        accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">
                                    JPG, PNG, GIF, PDF (Max 2MB)
                                </p>
                            </div>

                            {/* Selected File Display */}
                            {data.file && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
                                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                                    File Siap Upload
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                    {(data.file.size / 1024).toFixed(2)} KB • {data.file.name.split('.').pop().toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setData({
                                                    file: null,
                                                    custom_filename: ''
                                                });
                                            }}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Editable Filename */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                            Nama File (Opsional)
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={data.custom_filename}
                                                onChange={(e) => setData('custom_filename', e.target.value)}
                                                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                                                placeholder="Masukkan nama file custom..."
                                            />
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600">
                                                .{data.file.name.split('.').pop()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {errors.file && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    {errors.file}
                                </p>
                            )}

                            {/* Upload Button */}
                            <button
                                type="submit"
                                disabled={!data.file || processing}
                                className={`mt-4 w-full px-6 py-3 rounded-xl font-bold uppercase tracking-wide text-sm transition-all transform active:scale-95 shadow-lg ${!data.file || processing
                                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 shadow-none cursor-not-allowed'
                                    : 'bg-[var(--color-primary)] hover:brightness-110 text-white shadow-[var(--color-primary)]/30'
                                    }`}
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Mengupload...
                                    </span>
                                ) : 'Upload File Sekarang'}
                            </button>
                        </form>
                    </div>

                    {/* Files List */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                Daftar File Tersimpan
                            </h2>
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-bold">
                                {berkas.length} File
                            </span>
                        </div>

                        {berkas.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-gray-900 dark:text-white font-medium text-lg">Belum ada file</h3>
                                <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                                    Upload file pertama Anda untuk mulai menyimpan dokumen.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {berkas.map((file, index) => {
                                    const color = cardColors[index % cardColors.length];
                                    return (
                                        <div
                                            key={file.id}
                                            className={`${color.bg} rounded-2xl p-5 border ${color.border} group hover:shadow-lg transition-all duration-300 relative overflow-hidden`}
                                            data-aos="fade-up"
                                            data-aos-delay={index * 50}
                                        >
                                            <div className="relative z-10 flex flex-col h-full justify-between">
                                                <div className="flex items-start justify-between gap-3 mb-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.iconBg} ${color.iconText} shadow-sm shrink-0`}>
                                                        {getFileIcon(file.icon)}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className={`${color.iconBg} ${color.iconText} text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider`}>
                                                            {file.jenis_file}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base leading-tight mb-1 line-clamp-2">
                                                        {file.nama_file}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                        <span>{file.ukuran_format}</span>
                                                        <span>•</span>
                                                        <span>{file.created_at_diff}</span>
                                                    </div>
                                                </div>

                                                <div className="gap-2 grid grid-cols-2">
                                                    <button
                                                        onClick={() => handleDownload(file.id, file.nama_file)}
                                                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold bg-white/70 dark:bg-black/20 hover:bg-white dark:hover:bg-black/30 ${color.iconText} transition-colors`}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        Download
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDelete({ isOpen: true, id: file.id })}
                                                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Decorative blob */}
                                            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${color.iconBg} opacity-20 pointer-events-none`}></div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <BottomNav />

            {/* Flash Message Toast */}
            {showFlash && (flash.success || flash.error) && (
                <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
                    <div className={`max-w-md rounded-2xl shadow-xl p-4 border transform transition-all ${flash.success
                        ? 'bg-white dark:bg-gray-800 border-green-200 dark:border-green-800'
                        : 'bg-white dark:bg-gray-800 border-red-200 dark:border-red-800'
                        }`}>
                        <div className="flex items-center">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${flash.success ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                                {flash.success ? (
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </div>
                            <div className="ml-3">
                                <h4 className={`text-sm font-bold ${flash.success ? 'text-green-600' : 'text-red-600'}`}>
                                    {flash.success ? 'Berhasil!' : 'Gagal!'}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {flash.success || flash.error}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowFlash(false)}
                                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {confirmDelete.isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-auto shadow-2xl animate-scale-in">
                        <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
                            Hapus File?
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 text-center text-sm">
                            Apakah Anda yakin ingin menghapus file ini? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDelete({ isOpen: false, id: null })}
                                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleDelete(confirmDelete.id)}
                                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium shadow-lg shadow-red-500/30 transition-all"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
