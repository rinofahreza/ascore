import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import Modal from '@/Components/Modal';
import { Transition } from '@headlessui/react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Show({ auth, subject, className, kelas_id, mapel_id, riwayat = [] }) {
    const [selectedImage, setSelectedImage] = useState(null);

    // Initialize AOS
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
        });
    }, []);

    // Refresh AOS when data changes
    useEffect(() => {
        AOS.refresh();
    }, [riwayat]);

    // State for Filter Tabs (Riwayat Jurnal)
    const [activeTab, setActiveTab] = useState('Hari Ini');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Date Range Filter State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Use real data from backend
    const [journals, setJournals] = useState(riwayat);

    // Filter Logic
    useEffect(() => {
        if (riwayat) {
            let data = riwayat;

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
    }, [riwayat, activeTab, startDate, endDate]);

    // Simple handlers
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setStartDate(''); // Clear custom range when tab is clicked
        setEndDate('');
        setShowFilterDropdown(false);
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

    // Colors for dynamic cards (matching Index.jsx)
    const cardColors = [
        { bg: 'bg-orange-100 dark:bg-orange-900/30', iconBg: 'bg-white/60 dark:bg-orange-900/50', iconText: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-700/50' },
        { bg: 'bg-green-100 dark:bg-green-900/30', iconBg: 'bg-white/60 dark:bg-green-900/50', iconText: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-700/50' },
        { bg: 'bg-blue-100 dark:bg-blue-900/30', iconBg: 'bg-white/60 dark:bg-blue-900/50', iconText: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-700/50' },
        { bg: 'bg-red-100 dark:bg-red-900/30', iconBg: 'bg-white/60 dark:bg-red-900/50', iconText: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-700/50' },
        { bg: 'bg-purple-100 dark:bg-purple-900/30', iconBg: 'bg-white/60 dark:bg-purple-900/50', iconText: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-700/50' },
        { bg: 'bg-teal-100 dark:bg-teal-900/30', iconBg: 'bg-white/60 dark:bg-teal-900/50', iconText: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-700/50' },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title={`Jurnal - ${subject} `} />

            <div className="pb-40 pt-4 bg-gray-50 dark:bg-gray-900 min-h-scheme">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header for Class Context */}
                    <div className="mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            {/* Back link removed */}
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                            {subject} - {className}
                        </h1>
                    </div>

                    {/* Banner Card - "Input Jurnal Belajar" */}
                    <div className="bg-[rgba(var(--color-primary-rgb),0.1)] dark:bg-[rgba(var(--color-primary-rgb),0.15)] rounded-2xl p-6 mb-8 relative overflow-hidden border border-[rgba(var(--color-primary-rgb),0.2)] dark:border-[rgba(var(--color-primary-rgb),0.3)]">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)] rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>

                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex-1 pr-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                    Input <span className="font-bold">Jurnal Belajar</span>
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                    Catat kegiatan belajar mengajar Anda hari ini.
                                </p>
                                <Link
                                    href={route('jurnal.create', { kelas_id, mapel_id })}
                                    className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-2.5 px-4 rounded-xl shadow-lg shadow-[rgba(var(--color-primary-rgb),0.3)] flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Tambah Jurnal
                                </Link>
                            </div>
                            <div className="w-32 flex-shrink-0">
                                {/* Teacher Illustration */}
                                <div className="w-full aspect-square relative">
                                    <img
                                        src="/images/teacher_illustration.png"
                                        alt="Teacher Illustration"
                                        className="w-full h-full object-contain drop-shadow-md"
                                    />
                                </div>
                            </div>
                        </div>
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
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Filter Button */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                    className={`px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 border transition-colors ${startDate && endDate
                                        ? 'bg-blue-100 text-blue-600 border-blue-200'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    Filter
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {/* Filter Dropdown */}
                                <Transition
                                    show={showFilterDropdown}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 p-4">
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-sm">Rentang Tanggal</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Dari Tanggal</label>
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Sampai Tanggal</label>
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={handleResetFilter}
                                                    className="flex-1 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                                >
                                                    Reset
                                                </button>
                                                <button
                                                    onClick={handleApplyDateRange}
                                                    className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                                >
                                                    Terapkan
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Transition>
                            </div>
                        </div>
                    </div>

                    {/* List Items (Filtered) */}
                    <div className="space-y-4">
                        {journals.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                {startDate && endDate ? 'Tidak ada jurnal dalam rentang tanggal ini.' : 'Belum ada riwayat jurnal.'}
                            </div>
                        ) : (
                            journals.map((journal, index) => {
                                // Use Dynamic Primary Color (matching Menu Grid)
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
                                                <Link
                                                    href={route('jurnal.edit', journal.id)}
                                                    className="flex items-center justify-center w-6 h-6 bg-white/60 dark:bg-black/20 rounded-full text-gray-500 hover:text-[var(--color-primary)] transition-colors mr-1"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                </Link>
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
                                                        {journal.materi}
                                                    </h4>
                                                </div>
                                                <div className="ml-auto text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                    {journal.time}
                                                </div>
                                            </div>

                                            {/* Row 2: Subject/Class & Chevron */}
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 ${color.iconBg} rounded-lg flex items-center justify-center ${color.iconText}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                                        {subject} - {className}
                                                    </h4>
                                                </div>
                                                <div className="ml-auto flex items-center text-xs text-gray-500 gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Attendance Summary - ALWAYS SHOW */}
                                            {journal.attendance_stats ? (
                                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[rgba(var(--color-primary-rgb),0.1)]">
                                                    <div className="flex items-center gap-2 text-xs font-medium">
                                                        <span className="text-gray-500 dark:text-gray-400">Kehadiran:</span>
                                                        <div className="flex gap-2">
                                                            <span className="text-green-600 dark:text-green-400" title="Hadir">H: {journal.attendance_stats.H ?? 0}</span>
                                                            <span className="text-blue-600 dark:text-blue-400" title="Izin">I: {journal.attendance_stats.I ?? 0}</span>
                                                            <span className="text-yellow-600 dark:text-yellow-400" title="Sakit">S: {journal.attendance_stats.S ?? 0}</span>
                                                            <span className="text-red-600 dark:text-red-400" title="Absen">A: {journal.attendance_stats.A ?? 0}</span>
                                                            <span className="text-gray-600 dark:text-gray-400" title="Tanpa Keterangan">X: {journal.attendance_stats.X ?? 0}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[rgba(var(--color-primary-rgb),0.1)]">
                                                    <span className="text-gray-400 text-xs italic">Data kehadiran belum tersedia</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Images */}
                                        {journal.images && journal.images.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[rgba(var(--color-primary-rgb),0.1)]">
                                                {journal.images.map((img, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="h-24 bg-white/40 dark:bg-black/20 rounded-lg overflow-hidden relative cursor-pointer active:scale-95 transition-transform"
                                                        onClick={() => setSelectedImage(img)}
                                                    >
                                                        {/* Number overlay */}
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
                            })
                        )}
                    </div>
                </div>
            </div>

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
                        className="max-h-[85vh] max-w-full object-contain rounded-lg"
                    />
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
