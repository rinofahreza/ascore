import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BottomNav from '@/Components/BottomNav';
import { Head, useForm, router } from '@inertiajs/react'; // Added router import
import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export default function Index({ auth, events, can }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    // Check for readonly mode from URL
    const isReadOnly = new URLSearchParams(window.location.search).get('readonly') === 'true';

    // Override permissions if in read-only mode
    const effectiveCan = isReadOnly ? { create: false, edit: false, delete: false } : can;

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        tanggal: '',
        judul: '',
        tipe: 'academic',
        warna: '#3b82f6', // Default blue
        keterangan: '',
    });

    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const openCreateModal = (date = null) => {
        reset();
        setEditingEvent(null);
        if (date) {
            // Format date to YYYY-MM-DD for input type="date"
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(date).padStart(2, '0');
            setData('tanggal', `${year}-${month}-${day}`);
        } else {
            setData('tanggal', new Date().toISOString().split('T')[0]);
        }
        setIsModalOpen(true);
    };

    const openEditModal = (event) => {
        setEditingEvent(event);
        setData({
            tanggal: event.full_date,
            judul: event.title,
            tipe: event.type,
            warna: event.color || '#3b82f6',
            keterangan: event.description || '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEvent(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingEvent) {
            put(route('kalender-akademik.update', editingEvent.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('kalender-akademik.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus event ini?')) {
            destroy(route('kalender-akademik.destroy', editingEvent.id), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const renderCalendarDays = () => {
        const totalDays = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const calendarDays = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="h-14 sm:h-20 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl"></div>);
        }

        // Days of current month
        for (let day = 1; day <= totalDays; day++) {
            const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

            const dayEvents = events.filter(
                (e) => e.date === day && e.month === currentDate.getMonth() && e.year === currentDate.getFullYear()
            );

            calendarDays.push(
                <div
                    key={day}
                    onClick={() => effectiveCan.create && openCreateModal(day)}
                    className={`h-14 sm:h-20 flex flex-col items-center justify-start pt-2 rounded-xl relative group transition-all cursor-pointer border
                        ${isToday
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 dark:bg-[var(--color-primary)]/10'
                            : 'border-transparent bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md'
                        }
                    `}
                >
                    <span className={`text-sm sm:text-base font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-1
                         ${isToday ? 'bg-[var(--color-primary)] text-white' : 'text-gray-700 dark:text-gray-200'}
                    `}>
                        {day}
                    </span>

                    {/* Event Dots Container */}
                    <div className="flex flex-wrap justify-center gap-1 w-full px-1">
                        {dayEvents.map((event, idx) => (
                            <div
                                key={idx}
                                title={event.title}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (effectiveCan.edit) openEditModal(event);
                                }}
                                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full hover:scale-150 transition-transform"
                                style={{ backgroundColor: event.color || (event.type === 'holiday' ? '#ef4444' : event.type === 'exam' ? '#eab308' : '#3b82f6') }}
                            ></div>
                        ))}
                    </div>
                </div>
            );
        }

        return calendarDays;
    };

    const currentMonthEvents = events.filter(
        (e) => e.month === currentDate.getMonth() && e.year === currentDate.getFullYear()
    ).sort((a, b) => a.date - b.date);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kalender Akademik" />

            <div className="pt-header pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Header Title with Add Button */}
                    <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-blue-600 bg-clip-text text-transparent mb-1">
                                Kalender Akademik
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Info libur, ujian, dan kegiatan akademik lainnya.
                            </p>
                        </div>

                        {effectiveCan.create && (
                            <button
                                onClick={() => openCreateModal()}
                                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white rounded-xl shadow-lg shadow-[var(--color-primary)]/20 transition-all active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Tambah Event
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Calendar */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/20">
                                {/* Month Navigation */}
                                <div className="p-6 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-white">
                                    <div className="flex justify-between items-center">
                                        <button onClick={prevMonth} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <div className="text-center">
                                            <h2 className="text-xl font-bold capitalize">
                                                {months[currentDate.getMonth()]}
                                            </h2>
                                            <span className="text-sm opacity-80 font-medium">
                                                {currentDate.getFullYear()}
                                            </span>
                                        </div>
                                        <button onClick={nextMonth} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Calendar Grid */}
                                <div className="p-4 sm:p-6">
                                    {/* Days Header */}
                                    <div className="grid grid-cols-7 mb-4">
                                        {days.map((day, index) => (
                                            <div key={index} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Days Grid */}
                                    <div className="grid grid-cols-7 gap-2">
                                        {renderCalendarDays()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Events List */}
                        <div>
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full sticky top-24">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-[var(--color-primary)] rounded-full"></span>
                                    Agenda Bulan {months[currentDate.getMonth()]}
                                </h3>
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {currentMonthEvents.length > 0 ? (
                                        currentMonthEvents.map((event, index) => (
                                            <div
                                                key={index}
                                                onClick={() => effectiveCan.edit && openEditModal(event)}
                                                className={`bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-600 flex items-start gap-4 group hover:scale-[1.02] transition-transform duration-200 cursor-pointer`}
                                            >
                                                <div className={`
                                                    w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 text-white shadow-md
                                                `} style={{ backgroundColor: event.color || '#3b82f6' }}>
                                                    <span className="text-[10px] font-bold uppercase leading-none mb-0.5">{months[event.month].substring(0, 3)}</span>
                                                    <span className="text-lg font-black leading-none">{event.date}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-tight mb-1">
                                                        {event.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 capitalize">
                                                            {event.type}
                                                        </span>
                                                    </div>
                                                    {event.description && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                            {event.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">Tidak ada agenda bulan ini</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav />

            {/* Modal Form */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        {editingEvent ? 'Edit Event' : 'Tambah Event Baru'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Tanggal */}
                        <div>
                            <InputLabel htmlFor="tanggal" value="Tanggal" />
                            <TextInput
                                id="tanggal"
                                type="date"
                                className="mt-1 block w-full"
                                value={data.tanggal}
                                onChange={(e) => setData('tanggal', e.target.value)}
                                required
                            />
                            <InputError message={errors.tanggal} className="mt-2" />
                        </div>

                        {/* Judul */}
                        <div>
                            <InputLabel htmlFor="judul" value="Judul Event" />
                            <TextInput
                                id="judul"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.judul}
                                onChange={(e) => setData('judul', e.target.value)}
                                placeholder="Contoh: Rapat Guru"
                                required
                            />
                            <InputError message={errors.judul} className="mt-2" />
                        </div>

                        {/* Tipe & Warna */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="tipe" value="Tipe Event" />
                                <select
                                    id="tipe"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                    value={data.tipe}
                                    onChange={(e) => setData('tipe', e.target.value)}
                                >
                                    <option value="academic">Akademik</option>
                                    <option value="holiday">Libur</option>
                                    <option value="exam">Ujian</option>
                                    <option value="activity">Kegiatan</option>
                                    <option value="other">Lainnya</option>
                                </select>
                                <InputError message={errors.tipe} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="warna" value="Warna Label" />
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        type="color"
                                        value={data.warna}
                                        onChange={(e) => setData('warna', e.target.value)}
                                        className="h-10 w-12 rounded cursor-pointer border-0 p-0"
                                    />
                                    <TextInput
                                        type="text"
                                        className="block w-full uppercase"
                                        value={data.warna}
                                        onChange={(e) => setData('warna', e.target.value)}
                                        placeholder="#000000"
                                    />
                                </div>
                                <InputError message={errors.warna} className="mt-2" />
                            </div>
                        </div>

                        {/* Keterangan */}
                        <div>
                            <InputLabel htmlFor="keterangan" value="Keterangan (Opsional)" />
                            <textarea
                                id="keterangan"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                rows="3"
                                value={data.keterangan}
                                onChange={(e) => setData('keterangan', e.target.value)}
                            ></textarea>
                            <InputError message={errors.keterangan} className="mt-2" />
                        </div>

                        <div className="flex justify-between items-center mt-6">
                            {editingEvent ? (
                                <DangerButton type="button" onClick={handleDelete} disabled={processing}>
                                    Hapus Event
                                </DangerButton>
                            ) : (
                                <div></div> // Spacer
                            )}

                            <div className="flex gap-2">
                                <SecondaryButton onClick={closeModal} disabled={processing}>
                                    Batal
                                </SecondaryButton>
                                <PrimaryButton disabled={processing}>
                                    {editingEvent ? 'Simpan Perubahan' : 'Tambah Event'}
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
