import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Show({ auth, jadwal, kelas, mataPelajaran, students, items, periode, semester, existingGrades }) {
    const { flash } = usePage().props;
    const [selectedItem, setSelectedItem] = useState(null);
    const [grades, setGrades] = useState({});
    const [processing, setProcessing] = useState(false);

    // Load existing grades when selected item changes
    useEffect(() => {
        if (selectedItem && existingGrades && existingGrades[selectedItem.id]) {
            const itemGrades = existingGrades[selectedItem.id];
            const loadedGrades = {};
            let loadedDate = null;

            Object.entries(itemGrades).forEach(([siswaId, gradeData]) => {
                loadedGrades[siswaId] = gradeData.nilai.toString();
                if (!loadedDate) {
                    loadedDate = gradeData.tanggal_penilaian;
                }
            });

            setGrades(loadedGrades);
        } else {
            setGrades({});
        }
    }, [selectedItem, existingGrades]);

    // Show success message from flash
    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: flash.success,
                confirmButtonColor: 'var(--color-primary)',
                timer: 2000,
                timerProgressBar: true,
            });
        }
    }, [flash]);

    const handleGradeChange = (siswaId, nilai) => {
        // Only accept whole numbers (integers)
        if (nilai === '' || nilai === null) {
            setGrades(prev => ({
                ...prev,
                [siswaId]: ''
            }));
            return;
        }

        // Parse as integer and validate range
        const intValue = parseInt(nilai);
        if (!isNaN(intValue) && intValue >= 0 && intValue <= 100) {
            setGrades(prev => ({
                ...prev,
                [siswaId]: intValue.toString()
            }));
        }
    };

    const handleSave = () => {
        if (!selectedItem) {
            Swal.fire({
                icon: 'warning',
                title: 'Perhatian',
                text: 'Pilih item penilaian terlebih dahulu',
                confirmButtonColor: 'var(--color-primary)',
            });
            return;
        }

        const gradesArray = Object.entries(grades)
            .filter(([_, nilai]) => nilai !== '' && nilai !== null && nilai !== undefined)
            .map(([siswa_id, nilai]) => ({
                siswa_id: parseInt(siswa_id),
                nilai: parseFloat(nilai)
            }));

        if (gradesArray.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Perhatian',
                text: 'Masukkan minimal satu nilai',
                confirmButtonColor: 'var(--color-primary)',
            });
            return;
        }

        const formData = {
            item_penilaian_id: selectedItem.id,
            kelas_id: kelas.id,
            mata_pelajaran_id: mataPelajaran.id,
            periode_akademik_id: periode?.id,
            semester_akademik_id: semester?.id,
            grades: gradesArray,
        };

        setProcessing(true);

        router.post('/nilai/save-grades', formData, {
            preserveScroll: true,
            onSuccess: () => {
                setGrades({});
                setProcessing(false);
            },
            onError: (errors) => {
                console.error('Save failed:', errors);
                setProcessing(false);
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal!',
                    text: 'Gagal menyimpan nilai. Silakan coba lagi.',
                    confirmButtonColor: 'var(--color-primary)',
                });
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Nilai - ${kelas.nama} `} />

            <div className="pt-header pb-24 bg-gray-100 dark:bg-gray-900 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Input Nilai Siswa
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {kelas.nama} - {mataPelajaran.nama}
                        </p>
                        {(periode || semester) && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {periode?.nama} {semester && `• ${semester.nama} `}
                            </p>
                        )}
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Siswa</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{students.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Item Penilaian</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{items.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assessment Item Selection */}
                    {items.length > 0 ? (
                        <>
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Pilih Item Penilaian
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {items.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setSelectedItem(item)}
                                            className={`p-4 rounded-lg border-2 transition-all text-left ${selectedItem?.id === item.id
                                                ? 'border-[var(--color-primary)] bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${item.jenis === 'Formatif'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                    }`}>
                                                    {item.jenis}
                                                </span>
                                                {selectedItem?.id === item.id && (
                                                    <svg className="w-5 h-5 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.nama}</p>
                                            {item.tanggal_penilaian && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(item.tanggal_penilaian).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                            {item.keterangan && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {item.keterangan}
                                                </p>
                                            )}
                                            {/* Grade Count Badge */}
                                            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {existingGrades[item.id] ? Object.keys(existingGrades[item.id]).length : 0} / {students.length} nilai terinput
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>


                        </>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="mt-4 text-gray-500 dark:text-gray-400">
                                Belum ada item penilaian. Silakan buat item penilaian terlebih dahulu.
                            </p>
                            <Link
                                href={`/nilai/create/${jadwal.id}`}
                                className="mt-4 inline-flex items-center px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-md font-medium transition-colors"
                            >
                                Buat Item Penilaian
                            </Link>
                        </div>
                    )}

                    {/* Student List */}
                    {students.length > 0 && selectedItem ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Daftar Nilai Siswa - {selectedItem.nama}
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                No
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Nama Siswa
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Nilai
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {students.map((student, index) => (
                                            <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {student.nama}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        min="0"
                                                        max="100"
                                                        step="1"
                                                        value={grades[student.id] || ''}
                                                        onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                                        placeholder="0-100"
                                                        className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {Object.keys(grades).length} dari {students.length} siswa terinput
                                </p>
                                <button
                                    onClick={handleSave}
                                    disabled={processing || Object.keys(grades).length === 0}
                                    className="px-6 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Nilai'}
                                </button>
                            </div>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <p className="mt-4 text-gray-500 dark:text-gray-400">
                                Belum ada siswa terdaftar di kelas ini
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>

            <BottomNav />
        </AuthenticatedLayout>
    );
}
