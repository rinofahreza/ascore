
import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import BottomNav from '@/Components/BottomNav';
import imageCompression from 'browser-image-compression';
import Swal from 'sweetalert2';

export default function Create({ auth, subject, className, kelas_id, mapel_id, tanggal, jamPelajarans = [], studentsProp = [] }) {

    // Image Compression State
    const [fotoPreviews, setFotoPreviews] = useState([]);
    const [isCompressing, setIsCompressing] = useState(false);

    // Initialize default students data
    const initialStudents = React.useMemo(() => {
        if (!studentsProp || studentsProp.length === 0) return [];
        return studentsProp.map(s => ({
            id: s.id,
            name: s.name,
            status: 'H', // Default to 'H' (Hadir)
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random&color=fff&size=128`
        }));
    }, [studentsProp]);

    const { data, setData, post, processing, errors } = useForm({
        kelas_id: kelas_id,
        mata_pelajaran_id: mapel_id,
        tanggal: tanggal,
        jam_mulai: '',
        jam_selesai: '',
        materi: '',
        catatan: '',
        foto: [],
        students: initialStudents,
    });

    // Sync studentsProp to form data if it changes (e.g. re-visit)
    React.useEffect(() => {
        if (studentsProp && studentsProp.length > 0) {
            setData('students', studentsProp.map(s => ({
                id: s.id,
                name: s.name,
                status: 'H',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random&color=fff&size=128`
            })));
        }
    }, [studentsProp]);

    // Helper to get day name from date string in Indonesian
    const getDayName = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { weekday: 'long' });
    };

    // Filter jamPelajarans based on the selected date's day
    const filteredJamPelajarans = React.useMemo(() => {
        if (!data.tanggal) return [];
        const dayName = getDayName(data.tanggal);
        // Filter strict match on day name (e.g. "Senin")
        return jamPelajarans.filter(jam => jam.hari?.toLowerCase() === dayName.toLowerCase());
    }, [data.tanggal, jamPelajarans]);

    const handleAttendanceChange = (id, status) => {
        setData('students', data.students.map(student =>
            student.id === id ? { ...student, status } : student
        ));
    };

    const markAllPresent = () => {
        setData('students', data.students.map(student => ({ ...student, status: 'H' })));
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Check max 2 images
        const currentCount = data.foto.length;
        const newCount = currentCount + files.length;

        if (newCount > 2) {
            Swal.fire({
                icon: 'warning',
                title: 'Maksimal 2 Gambar',
                text: 'Anda sudah memiliki ' + currentCount + ' gambar. Maksimal hanya 2 gambar.',
            });
            return;
        }

        try {
            setIsCompressing(true);
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1280,
                useWebWorker: false, // Disabled for better iOS compatibility
                fileType: 'image/jpeg',
            };

            const compressedFiles = [];
            const previews = [];

            for (const file of files) {
                const compressedBlob = await imageCompression(file, options);

                // Create a new File from the blob
                const compressedFile = new File([compressedBlob], file.name, {
                    type: file.type,
                    lastModified: Date.now(),
                });

                compressedFiles.push(compressedFile);

                const reader = new FileReader();
                reader.readAsDataURL(compressedBlob);
                await new Promise((resolve) => {
                    reader.onloadend = () => {
                        previews.push(reader.result);
                        resolve();
                    };
                });
            }

            setData(prevData => ({
                ...prevData,
                foto: [...prevData.foto, ...compressedFiles]
            }));
            setFotoPreviews(prev => [...prev, ...previews]);

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Gagal mengkompres gambar. Silakan coba gambar lain.',
            });
        } finally {
            setIsCompressing(false);
        }
    };

    const removeImage = (index) => {
        const newFotos = data.foto.filter((_, i) => i !== index);
        const newPreviews = fotoPreviews.filter((_, i) => i !== index);
        setData('foto', newFotos);
        setFotoPreviews(newPreviews);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('jurnal.store'), {
            forceFormData: true,
            onError: (errors) => {
                console.error('Validation Errors:', errors);
                let htmlMessage = '<ul style="text-align: left; margin-left: 20px;">';

                if (errors.tanggal) htmlMessage += '<li>Tanggal harus diisi</li>';
                if (errors.jam_mulai) htmlMessage += '<li>Jam Mulai harus dipilih</li>';
                if (errors.jam_selesai) htmlMessage += '<li>Jam Selesai harus dipilih</li>';
                if (errors.materi) htmlMessage += '<li>Materi Pembelajaran harus diisi</li>';
                if (errors.foto) htmlMessage += '<li>Foto bermasalah</li>';

                // If there are other errors not covered above
                const knownFields = ['tanggal', 'jam_mulai', 'jam_selesai', 'materi', 'foto'];
                Object.keys(errors).forEach(key => {
                    if (!knownFields.includes(key)) {
                        htmlMessage += `<li>${errors[key]}</li>`;
                    }
                });
                htmlMessage += '</ul>';

                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Menyimpan',
                    html: htmlMessage,
                    confirmButtonText: 'Periksa Kembali',
                    confirmButtonColor: '#d33',
                });
            },
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Jurnal mengajar berhasil disimpan.',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title="Input Jurnal Belajar" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-40 pt-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


                    {/* Content Card (Red outlined area) */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-6">

                        {/* Tanggal Input */}
                        {/* Tanggal Input */}
                        <div>
                            <InputLabel htmlFor="tanggal" value="Tanggal" className="mb-2 text-gray-700 dark:text-gray-300 font-medium" />
                            <div className="relative">
                                <TextInput
                                    id="tanggal"
                                    type="date"
                                    className={`w-full pl-10 border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-xl shadow-sm focus:border-[var(--color-primary)] focus:ring focus:ring-[var(--color-primary)] focus:ring-opacity-50 ${errors.tanggal ? 'border-red-500 ring-red-500' : ''}`}
                                    value={data.tanggal}
                                    onChange={(e) => setData('tanggal', e.target.value)}
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            {errors.tanggal && <div className="text-red-500 text-sm mt-1">{errors.tanggal}</div>}
                        </div>

                        {/* Jam Mulai & Selesai */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="jam_mulai" value="Jam Mulai" className="mb-2 text-gray-700 dark:text-gray-300 font-medium" />
                                <select
                                    id="jam_mulai"
                                    className={`w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:border-[var(--color-primary)] focus:ring focus:ring-[var(--color-primary)] focus:ring-opacity-50 ${errors.jam_mulai ? 'border-red-500 ring-red-500' : ''}`}
                                    value={data.jam_mulai}
                                    onChange={(e) => setData('jam_mulai', e.target.value)}
                                >
                                    <option value="">Pilih Jam</option>
                                    {filteredJamPelajarans.map((jam) => (
                                        <option key={jam.id} value={jam.jam_mulai}>
                                            {jam.nama} ({jam.jam_mulai.substring(0, 5)})
                                        </option>
                                    ))}
                                </select>
                                {errors.jam_mulai && <div className="text-red-500 text-sm mt-1">{errors.jam_mulai}</div>}
                            </div>
                            <div>
                                <InputLabel htmlFor="jam_selesai" value="Jam Selesai" className="mb-2 text-gray-700 dark:text-gray-300 font-medium" />
                                <select
                                    id="jam_selesai"
                                    className={`w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:border-[var(--color-primary)] focus:ring focus:ring-[var(--color-primary)] focus:ring-opacity-50 ${errors.jam_selesai ? 'border-red-500 ring-red-500' : ''}`}
                                    value={data.jam_selesai}
                                    onChange={(e) => setData('jam_selesai', e.target.value)}
                                >
                                    <option value="">Pilih Jam</option>
                                    {filteredJamPelajarans.map((jam) => (
                                        <option key={jam.id} value={jam.jam_selesai}>
                                            {jam.nama} ({jam.jam_selesai.substring(0, 5)})
                                        </option>
                                    ))}
                                </select>
                                {errors.jam_selesai && <div className="text-red-500 text-sm mt-1">{errors.jam_selesai}</div>}
                            </div>
                        </div>



                        {/* Mata Pelajaran - Readonly */}
                        <div>
                            <label className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300 font-medium text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                </svg>
                                Mata Pelajaran
                            </label>
                            <div className="space-y-3">
                                <div className="relative">
                                    <div className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 flex items-center justify-between text-gray-500 dark:text-gray-400 cursor-not-allowed">
                                        <div className="flex items-center gap-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                                {/* Briefcase Icon placeholder */}
                                                <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                            </svg>
                                            <span>{subject}</span>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 flex items-center justify-between text-gray-500 dark:text-gray-400 cursor-not-allowed">
                                        <div className="flex items-center gap-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                            </svg>
                                            <span>{className}</span>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Materi Pembelajaran */}
                        <div>
                            <label className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300 font-medium text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                                </svg>
                                Materi Pembelajaran
                            </label>
                            <textarea
                                id="materi"
                                rows="2"
                                className={`w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:border-[var(--color-primary)] focus:ring focus:ring-[var(--color-primary)] focus:ring-opacity-50 placeholder-gray-400 italic resize-none ${errors.materi ? 'border-red-500 ring-red-500' : ''}`}
                                placeholder="Masukkan materi yang diajarkan..."
                                value={data.materi}
                                onChange={(e) => setData('materi', e.target.value)}
                            />
                            {errors.materi && <div className="text-red-500 text-sm mt-1">{errors.materi}</div>}
                        </div>

                        {/* Catatan & Refleksi */}
                        <div>
                            <label className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300 font-medium text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                Catatan & Refleksi <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                            </label>
                            <textarea
                                id="catatan"
                                rows="6"
                                className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:border-[var(--color-primary)] focus:ring focus:ring-[var(--color-primary)] focus:ring-opacity-50 placeholder-gray-400 italic resize-none"
                                placeholder="Tulis catatan atau refleksi Anda..."
                                value={data.catatan}
                                onChange={(e) => setData('catatan', e.target.value)}
                            ></textarea>
                        </div>

                        {/* Absen Siswa */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium text-sm">
                                    <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    Kehadiran Siswa
                                </label>
                                <button
                                    type="button"
                                    onClick={markAllPresent}
                                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-600 transition-colors"
                                >
                                    <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    Centang semua hadir
                                </button>
                            </div>

                            <div className="space-y-3">
                                {data.students && data.students.map((student) => (
                                    <div key={student.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors border border-gray-100 dark:border-gray-700/50">
                                        <img
                                            src={student.avatar}
                                            alt={student.name}
                                            className="w-12 h-12 rounded-full bg-gray-200 object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 truncate">
                                                {student.name}
                                            </div>
                                            <div className="flex gap-1 flex-wrap">
                                                {[
                                                    { label: 'H', value: 'H', activeEndpoint: 'bg-green-500 text-white', inactiveEndpoint: 'text-gray-500 hover:text-green-600 bg-gray-100 dark:bg-gray-900' },
                                                    { label: 'I', value: 'I', activeEndpoint: 'bg-blue-500 text-white', inactiveEndpoint: 'text-gray-500 hover:text-gray-600 bg-gray-100 dark:bg-gray-900' },
                                                    { label: 'S', value: 'S', activeEndpoint: 'bg-yellow-500 text-white', inactiveEndpoint: 'text-gray-500 hover:text-yellow-600 bg-gray-100 dark:bg-gray-900' },
                                                    { label: 'A', value: 'A', activeEndpoint: 'bg-red-500 text-white', inactiveEndpoint: 'text-gray-500 hover:text-red-600 bg-gray-100 dark:bg-gray-900' },
                                                    { label: 'X', value: 'X', activeEndpoint: 'bg-black dark:bg-gray-200 text-white dark:text-gray-800', inactiveEndpoint: 'text-gray-500 hover:text-gray-800 bg-gray-100 dark:bg-gray-900' },
                                                ].map((option) => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => handleAttendanceChange(student.id, option.value)}
                                                        className={`w-9 h-9 flex items-center justify-center text-sm font-bold rounded-lg transition-all border border-transparent ${student.status === option.value
                                                            ? option.activeEndpoint + ' shadow-md scale-105'
                                                            : option.inactiveEndpoint + ' border-gray-200 dark:border-gray-700'
                                                            }`}
                                                        title={option.label}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upload Foto */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                            <label className="flex items-center gap-2 mb-4 text-gray-700 dark:text-gray-300 font-medium text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                                Upload Foto Dokumentasi <span className="text-gray-400 font-normal ml-1">(Max 2 Foto)</span>
                            </label>

                            <div className="space-y-4">
                                {fotoPreviews.length > 0 && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {fotoPreviews.map((src, index) => (
                                            <div key={index} className="relative group">
                                                <img src={src} alt="Preview" className="w-full h-40 object-cover rounded-lg border border-gray-200" />
                                                <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-all">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {data.foto.length < 2 && (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="foto-upload"
                                            disabled={isCompressing}
                                        />
                                        <label
                                            htmlFor="foto-upload"
                                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                {isCompressing ? (
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                                                ) : (
                                                    <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                                )}
                                                <p className="text-sm text-gray-500">{isCompressing ? 'Mengompres...' : 'Klik untuk upload foto'}</p>
                                            </div>
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 pb-2 flex gap-3">
                            <Link
                                href={route('jurnal.show-kelas', { kelas_id, mapel_id })}
                                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95 text-lg text-center"
                            >
                                Batal
                            </Link>
                            <button
                                type="button"
                                onClick={submit}
                                className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-3.5 rounded-full shadow-lg shadow-[rgba(var(--color-primary-rgb),0.3)] transition-all active:scale-95 text-lg"
                            >
                                Simpan
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            <BottomNav />
        </AuthenticatedLayout >
    );
}
