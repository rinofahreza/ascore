
import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import BottomNav from '@/Components/BottomNav';
import imageCompression from 'browser-image-compression';
import Swal from 'sweetalert2';

export default function Edit({ auth, subject, className, jurnal, jamPelajarans = [], existingPhotos = [], studentsProp = [] }) {

    // Image Compression State
    const [fotoPreviews, setFotoPreviews] = useState([]); // For NEW photos
    const [isCompressing, setIsCompressing] = useState(false);

    // Manage existing photos
    const [currentExistingPhotos, setCurrentExistingPhotos] = useState(
        existingPhotos.map((url, index) => ({ url, originalIndex: index }))
    );

    // Initialize default students data
    const initialStudents = React.useMemo(() => {
        if (!studentsProp || studentsProp.length === 0) return [];
        return studentsProp.map(s => ({
            id: s.id,
            name: s.name,
            status: s.status || 'H',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random&color=fff&size=128`
        }));
    }, [studentsProp]);

    const { data, setData, post, processing, errors } = useForm({
        kelas_id: jurnal.kelas_id,
        mata_pelajaran_id: jurnal.mata_pelajaran_id,
        tanggal: jurnal.tanggal,
        jam_mulai: jurnal.jam_mulai,
        jam_selesai: jurnal.jam_selesai,
        materi: jurnal.materi,
        catatan: jurnal.catatan || '',
        foto: [], // New files to upload
        deleted_photos: [], // Indices of original photos to remove
        students: initialStudents,
    });

    // Sync studentsProp to form data
    React.useEffect(() => {
        if (studentsProp && studentsProp.length > 0) {
            setData('students', studentsProp.map(s => ({
                id: s.id,
                name: s.name,
                status: s.status || 'H',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random&color=fff&size=128`
            })));
        }
    }, [studentsProp]);

    // Helper to get day name
    const getDayName = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { weekday: 'long' });
    };

    // Filter jam
    const filteredJamPelajarans = React.useMemo(() => {
        if (!data.tanggal) return [];
        const dayName = getDayName(data.tanggal);
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

        // Check max 2 images TOTAL (Existing + New)
        const currentTotal = currentExistingPhotos.length + data.foto.length;
        const newCount = currentTotal + files.length;

        if (newCount > 2) {
            Swal.fire({
                icon: 'warning',
                title: 'Maksimal 2 Gambar',
                text: `Total gambar maksimal 2. Anda sudah punya ${currentTotal} gambar.`,
            });
            return;
        }

        try {
            setIsCompressing(true);
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1280,
                useWebWorker: false,
                fileType: 'image/jpeg',
            };

            const compressedFiles = [];
            const previews = [];

            for (const file of files) {
                const compressedBlob = await imageCompression(file, options);
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
                text: 'Gagal mengkompres gambar.',
            });
        } finally {
            setIsCompressing(false);
        }
    };

    const removeNewImage = (index) => {
        const newFotos = data.foto.filter((_, i) => i !== index);
        const newPreviews = fotoPreviews.filter((_, i) => i !== index);
        setData('foto', newFotos);
        setFotoPreviews(newPreviews);
    };

    const removeExistingImage = (indexInCurrentView) => {
        const photoToRemove = currentExistingPhotos[indexInCurrentView];

        // Remove from view
        setCurrentExistingPhotos(prev => prev.filter((_, i) => i !== indexInCurrentView));

        // Add original index to deleted_photos
        setData(prev => ({
            ...prev,
            deleted_photos: [...prev.deleted_photos, photoToRemove.originalIndex]
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('jurnal.update', jurnal.id), {
            forceFormData: true,
            onError: (errors) => {
                console.error('Validation Errors:', errors);
                let htmlMessage = '<ul style="text-align: left; margin-left: 20px;">';
                // ... same error logic ...
                const knownFields = ['tanggal', 'jam_mulai', 'jam_selesai', 'materi', 'foto'];
                Object.keys(errors).forEach(key => {
                    if (!knownFields.includes(key)) {
                        htmlMessage += `<li>${errors[key]}</li>`;
                    }
                });
                htmlMessage += '</ul>';

                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Mengupdate',
                    html: htmlMessage,
                });
            },
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Jurnal berhasil diperbarui.',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Edit Jurnal Belajar" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-40 pt-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-6">

                        <div className="border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Edit Jurnal</h2>
                            <p className="text-gray-500 text-sm">Mengedit jurnal untuk {subject} - {className}</p>
                        </div>

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
                                    {/* Fallback if current time is not in filtered list (e.g. day changed) */}
                                    {data.jam_mulai && !filteredJamPelajarans.find(j => j.jam_mulai === data.jam_mulai) && (
                                        <option value={data.jam_mulai}>{data.jam_mulai}</option>
                                    )}
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
                                    {data.jam_selesai && !filteredJamPelajarans.find(j => j.jam_selesai === data.jam_selesai) && (
                                        <option value={data.jam_selesai}>{data.jam_selesai}</option>
                                    )}
                                </select>
                                {errors.jam_selesai && <div className="text-red-500 text-sm mt-1">{errors.jam_selesai}</div>}
                            </div>
                        </div>

                        {/* Materi Pembelajaran */}
                        <div>
                            <InputLabel htmlFor="materi" value="Materi Pembelajaran" className="mb-2 text-gray-700 dark:text-gray-300 font-medium" />
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
                            <InputLabel htmlFor="catatan" value="Catatan & Refleksi (Optional)" className="mb-2 text-gray-700 dark:text-gray-300 font-medium" />
                            <textarea
                                id="catatan"
                                rows="6"
                                className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:border-[var(--color-primary)] focus:ring focus:ring-[var(--color-primary)] focus:ring-opacity-50 placeholder-gray-400 italic resize-none"
                                placeholder="Tulis catatan atau refleksi Anda..."
                                value={data.catatan}
                                onChange={(e) => setData('catatan', e.target.value)}
                            ></textarea>
                        </div>

                        {/* Attendance List */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                    </svg>
                                    Absensi Siswa
                                </h3>
                                <button
                                    type="button"
                                    onClick={markAllPresent}
                                    className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium transition-colors"
                                >
                                    Tandai Semua Hadir
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
                                Foto Dokumentasi <span className="text-gray-400 font-normal ml-1">(Max 2 Foto)</span>
                            </label>

                            <div className="space-y-4">
                                {/* Combine previews of EXISTING (not deleted) and NEW */}
                                <div className="grid grid-cols-2 gap-4">
                                    {currentExistingPhotos.map((photo, index) => (
                                        <div key={`existing-${index}`} className="relative group">
                                            <div className="absolute top-0 left-0 z-10 bg-blue-500 text-white text-xs px-2 py-1 rounded-tl-lg rounded-br-lg shadow-sm">Tersimpan</div>
                                            <img src={photo.url} alt="Existing" className="w-full h-40 object-cover rounded-lg border border-gray-200" />
                                            <button type="button" onClick={() => removeExistingImage(index)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-all z-20">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    ))}

                                    {fotoPreviews.map((src, index) => (
                                        <div key={`new-${index}`} className="relative group">
                                            <div className="absolute top-0 left-0 z-10 bg-green-500 text-white text-xs px-2 py-1 rounded-tl-lg rounded-br-lg shadow-sm">Baru</div>
                                            <img src={src} alt="New Preview" className="w-full h-40 object-cover rounded-lg border border-gray-200" />
                                            <button type="button" onClick={() => removeNewImage(index)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-all z-20">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Upload button only if total < 2 */}
                                {(currentExistingPhotos.length + data.foto.length) < 2 && (
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
                                                <p className="text-sm text-gray-500">{isCompressing ? 'Mengompres...' : 'Klik untuk upload (max 2)'}</p>
                                            </div>
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 pb-2 flex gap-3">
                            <Link
                                href={route('jurnal.show-kelas', { kelas_id: jurnal.kelas_id, mapel_id: jurnal.mata_pelajaran_id })}
                                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95 text-lg text-center"
                            >
                                Batal
                            </Link>
                            <button
                                type="button"
                                onClick={submit}
                                disabled={processing}
                                className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-3.5 rounded-full shadow-lg shadow-[rgba(var(--color-primary-rgb),0.3)] transition-all active:scale-95 text-lg"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <BottomNav />
        </AuthenticatedLayout>
    );
}
