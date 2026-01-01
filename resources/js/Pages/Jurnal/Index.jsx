import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import React, { useState, useEffect } from 'react';
import { Transition, Listbox } from '@headlessui/react';
import Modal from '@/Components/Modal';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Swal from 'sweetalert2';

export default function Index({ auth, isGuru, classesList, periodes, selectedPeriodId, isSubstituteMode, substituteForName, activeAccessCode, historyJournals = [] }) {

    const [showGenerateCodeModal, setShowGenerateCodeModal] = useState(false);
    const [showEnterCodeModal, setShowEnterCodeModal] = useState(false);
    const [validityDays, setValidityDays] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedCode, setGeneratedCode] = useState(activeAccessCode?.code || null);
    const [codeExpiresAt, setCodeExpiresAt] = useState(activeAccessCode?.expires_at || null);
    const [enteredCode, setEnteredCode] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    // State for Filter Tabs (Riwayat Jurnal)
    const [activeTab, setActiveTab] = useState('Hari Ini');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Date Range Filter State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Use real data from backend
    const [journals, setJournals] = useState(historyJournals);

    // Derive selected period object
    const selectedPeriod = periodes?.find(p => p.id == selectedPeriodId);

    // Initialize AOS
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
        });
    }, []);

    useEffect(() => {
        AOS.refresh();
    }, [journals]);

    useEffect(() => {
        if (historyJournals) {
            let data = historyJournals;

            // Priority: Date Range
            if (startDate && endDate) {
                data = data.filter(j => {
                    return j.full_date >= startDate && j.full_date <= endDate;
                });
            } else {
                // Fallback to Tabs
                if (activeTab === 'Hari Ini') {
                    const now = new Date();
                    const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
                    data = data.filter(j => j.full_date === today);
                } else if (activeTab === 'Minggu Ini') {
                    const now = new Date();
                    const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                    data = data.filter(j => new Date(j.full_date) >= oneWeekAgo);
                }
            }

            setJournals(data);
        }
    }, [historyJournals, activeTab, startDate, endDate]);

    // Simple handlers
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setStartDate(''); // Clear custom range when tab is clicked
        setEndDate('');
    };

    const handleApplyDateRange = () => {
        if (startDate && endDate) {
            setActiveTab(''); // Clear active tab to indicate custom mode
            setShowFilterDropdown(false);
        }
    };

    const handleResetFilter = () => {
        setStartDate('');
        setEndDate('');
        setActiveTab('Hari Ini'); // Revert to default
        setShowFilterDropdown(false);
    };

    const handleGenerateCode = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(route('jurnal.access-code.generate'), {
                days: validityDays
            });
            setGeneratedCode(response.data.code);
            setCodeExpiresAt(response.data.expires_at);
            // Update active access code prop locally to reflect change immediately (optional but good for UX)
            // Ideally we should reload page or update state to "has active code"
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Gagal membuat kode akses.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevokeCode = () => {
        Swal.fire({
            title: 'Hapus Kode Akses?',
            text: "Kode akses lama tidak akan bisa digunakan lagi.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.post(route('jurnal.access-code.revoke'));
                    setGeneratedCode(null);
                    setCodeExpiresAt(null);
                    setShowGenerateCodeModal(false);
                    Swal.fire({
                        icon: 'success',
                        title: 'Dihapus!',
                        text: 'Kode akses berhasil dihapus.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } catch (error) {
                    Swal.fire('Error', 'Gagal menghapus kode akses.', 'error');
                }
            }
        })
    };

    const handleEnterCode = (e) => {
        e.preventDefault();
        router.post(route('jurnal.access-code.verify'), { code: enteredCode }, {
            onSuccess: () => {
                setShowEnterCodeModal(false);
                setEnteredCode('');
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Anda berhasil masuk ke mode guru pengganti.',
                    timer: 1500,
                    showConfirmButton: false
                });
            },
            onError: (errors) => {
                Swal.fire('Gagal', errors.error || 'Kode tidak valid.', 'error');
            }
        });
    };

    const handleExitSubstituteMode = () => {
        router.post(route('jurnal.access-code.exit'), {}, {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Anda telah keluar dari mode guru pengganti.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    const copyToClipboard = () => {
        if (generatedCode) {
            navigator.clipboard.writeText(generatedCode);
            Swal.fire({
                icon: 'success',
                title: 'Disalin!',
                text: 'Kode akses berhasil disalin.',
                timer: 1000,
                showConfirmButton: false
            });
        }
    };

    // Static data for list items
    // Colors for dynamic cards
    const cardColors = [
        { bg: 'bg-orange-100 dark:bg-orange-900/30', iconBg: 'bg-white/60 dark:bg-orange-900/50', iconText: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-700/50' },
        { bg: 'bg-green-100 dark:bg-green-900/30', iconBg: 'bg-white/60 dark:bg-green-900/50', iconText: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-700/50' },
        { bg: 'bg-blue-100 dark:bg-blue-900/30', iconBg: 'bg-white/60 dark:bg-blue-900/50', iconText: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-700/50' },
        { bg: 'bg-red-100 dark:bg-red-900/30', iconBg: 'bg-white/60 dark:bg-red-900/50', iconText: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-700/50' },
        { bg: 'bg-purple-100 dark:bg-purple-900/30', iconBg: 'bg-white/60 dark:bg-purple-900/50', iconText: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-700/50' },
        { bg: 'bg-teal-100 dark:bg-teal-900/30', iconBg: 'bg-white/60 dark:bg-teal-900/50', iconText: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-700/50' },
    ];

    const [showAll, setShowAll] = useState(false);

    // Filter logic handles data, selectedPeriod handled in top state



    const hasMoreClasses = classesList.length > 4;

    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title="Jurnal Belajar Guru" />

            <div className="pb-40 pt-4 bg-gray-50 dark:bg-gray-900 min-h-scheme">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header Section with Greeting and Filter */}
                    <div className="flex flex-col mb-6">
                        {/* Substitute Mode Banner - Prioritized Display */}
                        {isSubstituteMode && (
                            <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-4 mb-4 flex items-center justify-between shadow-sm animate-pulse-slow">
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-500 text-white p-2 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-amber-900 dark:text-amber-100">Mode Guru Pengganti</h4>
                                        <p className="text-sm text-amber-800 dark:text-amber-200">
                                            Anda sedang mengisi jurnal a.n. <span className="font-bold underline">{substituteForName}</span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleExitSubstituteMode}
                                    className="bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm border border-amber-200 hover:bg-amber-50 dark:hover:bg-gray-700 transition"
                                >
                                    Keluar Mode
                                </button>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">


                            <div className="flex gap-2">
                                {/* Substitute Features */}
                                <button
                                    onClick={() => setShowEnterCodeModal(true)}
                                    className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition tooltip-trigger relative group"
                                    title="Masuk Mode Guru Pengganti"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => setShowGenerateCodeModal(true)}
                                    className="bg-[var(--color-primary)] hover:brightness-90 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl text-sm font-medium shadow-md shadow-gray-200 dark:shadow-none flex items-center gap-2 transition shrink-0"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                    <span className="hidden sm:inline">Buat Kode Akses</span>
                                </button>

                                {/* Period Filter - Only for Guru */}
                                {isGuru && periodes && periodes.length > 0 && (
                                    <Listbox
                                        value={selectedPeriodId}
                                        onChange={(val) => router.get(route('jurnal.index'), { periode_id: val }, { preserveState: true })}
                                    >
                                        <div className="relative w-full sm:w-48">
                                            <Listbox.Button className="relative w-full cursor-pointer bg-white dark:bg-gray-800 py-2.5 pl-3 pr-8 text-left rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-100 dark:border-gray-700 text-sm">
                                                <span className="block truncate text-gray-700 dark:text-gray-200 font-medium">
                                                    {selectedPeriod ? selectedPeriod.nama : 'Pilih Periode'}
                                                </span>
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                    <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            </Listbox.Button>
                                            <Transition
                                                as={React.Fragment}
                                                leave="transition ease-in duration-100"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <Listbox.Options className="absolute right-0 z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm min-w-[150px]">
                                                    {periodes.map((period) => (
                                                        <Listbox.Option
                                                            key={period.id}
                                                            className={({ active }) =>
                                                                `relative cursor-default select-none py-2 pl-3 pr-4 ${active ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
                                                                }`
                                                            }
                                                            value={period.id}
                                                        >
                                                            {({ selected }) => (
                                                                <>
                                                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                                        {period.nama}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Classes Grid Section */}
                    <div className="mb-8">


                        {!isGuru ? (
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <h4 className="font-semibold text-red-800 dark:text-red-200">Akses Terbatas</h4>
                                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                                        Akun Anda tidak terdaftar sebagai Guru. Jurnal dan Riwayat Kelas tidak dapat ditampilkan.
                                    </p>
                                </div>
                            </div>
                        ) : classesList.length === 0 ? (
                            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center">
                                <p className="text-yellow-700 dark:text-yellow-300 font-medium">Belum ada jadwal pelajaran yang ditentukan untuk Anda.</p>
                            </div>
                        ) : (
                            <>
                                {/* First 4 items always visible */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {classesList.slice(0, 4).map((kelasItem, index) => {
                                        const color = cardColors[index % cardColors.length];
                                        return (
                                            <Link
                                                key={`${kelasItem.kelas_id}-${kelasItem.mata_pelajaran_nama}`}
                                                href={route('jurnal.show-kelas', { kelas_id: kelasItem.kelas_id, mapel_id: kelasItem.mata_pelajaran_id })}
                                                className={`p-4 rounded-2xl flex flex-col h-32 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 shadow-sm hover:shadow-md bg-white dark:bg-gray-800 border-2 ${color.border}`}
                                            >
                                                <div className="z-10 relative h-full flex flex-col justify-between">
                                                    <div className="flex justify-between items-start">
                                                        <div className={`w-10 h-10 ${color.bg} rounded-xl flex items-center justify-center ${color.iconText}`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                                            </svg>
                                                        </div>
                                                        <div className={`w-2 h-2 rounded-full ${color.iconText.replace('text-', 'bg-')}`}></div>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-1 leading-tight line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                                                            {kelasItem.mata_pelajaran_nama}
                                                        </h4>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                            {kelasItem.kelas_nama}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Remaining items in Transition */}
                                <Transition
                                    show={showAll}
                                    enter="transition-all duration-500 ease-out overflow-hidden"
                                    enterFrom="opacity-0 max-h-0"
                                    enterTo="opacity-100 max-h-[1000px]"
                                    leave="transition-all duration-300 ease-in overflow-hidden"
                                    leaveFrom="opacity-100 max-h-[1000px]"
                                    leaveTo="opacity-0 max-h-0"
                                >
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        {classesList.slice(4).map((kelasItem, index) => {
                                            const color = cardColors[(index + 4) % cardColors.length];
                                            return (
                                                <Link
                                                    key={`${kelasItem.kelas_id}-${kelasItem.mata_pelajaran_nama}`}
                                                    href={route('jurnal.show-kelas', { kelas_id: kelasItem.kelas_id, mapel_id: kelasItem.mata_pelajaran_id })}
                                                    className={`p-4 rounded-2xl flex flex-col h-32 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 shadow-sm hover:shadow-md bg-white dark:bg-gray-800 border-2 ${color.border}`}
                                                >
                                                    <div className="z-10 relative h-full flex flex-col justify-between">
                                                        <div className="flex justify-between items-start">
                                                            <div className={`w-10 h-10 ${color.bg} rounded-xl flex items-center justify-center ${color.iconText}`}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                                                </svg>
                                                            </div>
                                                            <div className={`w-2 h-2 rounded-full ${color.iconText.replace('text-', 'bg-')}`}></div>
                                                        </div>

                                                        <div>
                                                            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-1 leading-tight line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                                                                {kelasItem.mata_pelajaran_nama}
                                                            </h4>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                                {kelasItem.kelas_nama}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </Transition>

                                {hasMoreClasses && (
                                    <button
                                        onClick={() => setShowAll(!showAll)}
                                        className="w-full mt-4 font-medium py-3 rounded-xl flex items-center justify-center gap-1 transition-colors bg-[rgba(var(--color-primary-rgb),0.1)] text-[var(--color-primary)] hover:bg-[rgba(var(--color-primary-rgb),0.2)] dark:bg-[rgba(var(--color-primary-rgb),0.2)] dark:text-[var(--color-primary-light)] dark:hover:bg-[rgba(var(--color-primary-rgb),0.3)]"
                                    >
                                        {showAll ? 'Tampilkan Lebih Sedikit' : 'Lihat Semua'}
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    {/* History Section */}
                    <div className="mb-4 relative">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                            Riwayat Jurnal
                        </h3>

                        {/* Tabs & Filter Container */}
                        <div className="flex justify-between items-start gap-2 mb-4">
                            {/* Scrollable Tabs */}
                            <div className="flex-1 flex gap-2 overflow-x-auto pb-2 scrollbar-hide items-center">
                                {['Hari Ini', 'Minggu Ini', 'Semua'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => handleTabChange(tab)}
                                        className={`px-5 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab
                                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 ring-2 ring-blue-500/20'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Filter Button (Fixed right) */}
                            <div className="relative shrink-0 pt-0.5">
                                <button
                                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                    className={`px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 border transition-colors ${startDate && endDate
                                        ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {(startDate && endDate) ? 'Terfilter' : 'Filter'}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {/* Date Range Dropdown */}
                                {showFilterDropdown && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowFilterDropdown(false)}
                                        ></div>
                                        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 p-4">
                                            <div className="mb-4">
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Dari Tanggal</label>
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Sampai Tanggal</label>
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleResetFilter}
                                                    className="flex-1 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition"
                                                >
                                                    Reset
                                                </button>
                                                <button
                                                    onClick={handleApplyDateRange}
                                                    className="flex-1 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition shadow-lg shadow-blue-500/30"
                                                >
                                                    Terapkan
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* List Items */}
                    <div className="space-y-4">
                        {journals.map((journal, index) => {
                            // Dynamic Primary Color (matching Menu Grid and Show.jsx)
                            const color = {
                                bg: 'bg-[rgba(var(--color-primary-rgb),0.05)] dark:bg-[rgba(var(--color-primary-rgb),0.1)]',
                                iconBg: 'bg-white dark:bg-gray-800',
                                iconText: 'text-[var(--color-primary)]',
                                border: 'border-[rgba(var(--color-primary-rgb),0.2)] dark:border-[rgba(var(--color-primary-rgb),0.3)]'
                            };

                            return (
                                <div
                                    key={journal.id}
                                    className={`${color.bg} rounded-2xl p-4 shadow-sm border ${color.border}`}
                                    data-aos="fade-up"
                                    data-aos-delay={index < 3 ? index * 100 : 0}
                                >
                                    {/* Header Info */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {journal.date}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {/* Edit Button */}
                                            <a // Using simple anchor or Link if imported. Let's use Inertia Link.
                                                href={route('jurnal.edit', journal.id)}
                                                className="flex items-center justify-center w-6 h-6 bg-white/60 dark:bg-black/20 rounded-full text-gray-500 hover:text-[var(--color-primary)] transition-colors mr-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                </svg>
                                            </a>
                                            <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full border border-green-100 dark:border-green-800">
                                                <div className="w-2 h-2 bg-green-500 rounded-full flex items-center justify-center"></div>
                                                <span className="text-xs font-medium text-green-700 dark:text-green-300">{journal.status}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Rows */}
                                    <div className="space-y-3 mb-4">
                                        {/* Row 1: Materi & Time */}
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 ${color.iconBg} rounded-lg flex items-center justify-center ${color.iconText}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm line-clamp-1">
                                                    {journal.materi || 'Materi belum diisi'}
                                                </h4>
                                            </div>
                                            <div className="ml-auto text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {journal.time}
                                            </div>
                                        </div>

                                        {/* Row 2: Subject/Class */}
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 ${color.iconBg} rounded-lg flex items-center justify-center ${color.iconText}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                                    {journal.subject} - {journal.class}
                                                </h4>
                                            </div>
                                        </div>

                                        {/* Attendance Summary */}
                                        {journal.attendance_stats && (
                                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[rgba(var(--color-primary-rgb),0.1)]">
                                                <div className="flex items-center gap-2 text-xs font-medium">
                                                    <span className="text-gray-500 dark:text-gray-400">Kehadiran:</span>
                                                    <div className="flex gap-2">
                                                        <span className="text-green-600 dark:text-green-400" title="Hadir">H: {journal.attendance_stats.H}</span>
                                                        <span className="text-blue-600 dark:text-blue-400" title="Izin">I: {journal.attendance_stats.I}</span>
                                                        <span className="text-yellow-600 dark:text-yellow-400" title="Sakit">S: {journal.attendance_stats.S}</span>
                                                        <span className="text-red-600 dark:text-red-400" title="Absen">A: {journal.attendance_stats.A}</span>
                                                        <span className="text-gray-600 dark:text-gray-400" title="Tanpa Keterangan">X: {journal.attendance_stats.X}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Images */}
                                    {journal.images && journal.images.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2 p-4 pt-0">
                                            {journal.images.map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    className="h-24 bg-white/40 dark:bg-black/20 rounded-lg overflow-hidden relative cursor-pointer active:scale-95 transition-transform"
                                                    onClick={() => setSelectedImage(img)}
                                                >
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
                                                        Foto {idx + 1}
                                                    </div>
                                                    <img src={img} alt="" className="w-full h-full object-cover relative z-10" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div >

            <BottomNav />

            {/* Lightbox Modal */}
            <Modal show={!!selectedImage} onClose={() => setSelectedImage(null)} maxWidth="2xl">
                <div className="p-2 bg-black/90 flex items-center justify-center min-h-[50vh] relative">
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors z-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <img
                        src={selectedImage}
                        alt="Full Preview"
                        className="max-w-full max-h-[80vh] object-contain rounded-lg"
                    />
                </div>
            </Modal>

            {/* Generate Code Modal */}
            <Modal show={showGenerateCodeModal} onClose={() => { setShowGenerateCodeModal(false); setValidityDays(1); }} maxWidth="sm">
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Kode Akses Guru Pengganti</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {generatedCode ? 'Kode ini sedang aktif. Bagikan kepada guru pengganti.' : 'Buat kode akses baru untuk guru pengganti.'}
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-500">Memproses...</p>
                        </div>
                    ) : generatedCode ? (
                        <>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 mb-6 relative group">
                                <h2 className="text-3xl font-mono font-bold text-gray-800 dark:text-gray-200 tracking-wider">
                                    {generatedCode}
                                </h2>
                                {codeExpiresAt && (
                                    <p className="text-xs text-gray-500 mt-2">Berlaku hingga: {codeExpiresAt}</p>
                                )}

                                <button
                                    onClick={copyToClipboard}
                                    className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                                >
                                    <span className="bg-white dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                                        Salin Kode
                                    </span>
                                </button>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleRevokeCode}
                                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Hapus / Nonaktifkan Kode
                                </button>
                                <button
                                    onClick={() => setShowGenerateCodeModal(false)}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition"
                                >
                                    Tutup
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Masa Belaku Kode
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[1, 3, 7].map((day) => (
                                        <button
                                            key={day}
                                            onClick={() => setValidityDays(day)}
                                            className={`py-2 px-4 rounded-lg text-sm font-medium border transition ${validityDays === day
                                                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200'
                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            {day} Hari
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Kode akan kadaluarsa otomatis setelah {validityDays} hari.
                                </p>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => { setShowGenerateCodeModal(false); setValidityDays(1); }}
                                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleGenerateCode}
                                    className="px-4 py-2.5 bg-[var(--color-primary)] hover:brightness-90 text-white font-medium rounded-xl transition shadow-lg shadow-gray-200 dark:shadow-none"
                                >
                                    Buat Kode
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Enter Code Modal */}
            <Modal show={showEnterCodeModal} onClose={() => setShowEnterCodeModal(false)} maxWidth="sm">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Masuk Mode Pengganti</h3>
                    <form onSubmit={handleEnterCode}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Masukkan Kode Akses
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase font-mono text-center tracking-widest placeholder:normal-case placeholder:tracking-normal"
                                placeholder="JRNL-XXXX"
                                value={enteredCode}
                                onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                                required
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => setShowEnterCodeModal(false)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[var(--color-primary)] hover:brightness-90 text-white rounded-lg transition font-medium"
                            >
                                Masuk
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout >
    );
}
