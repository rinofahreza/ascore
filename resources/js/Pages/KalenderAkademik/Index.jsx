import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BottomNav from '@/Components/BottomNav';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Mock Events
    const events = [
        { date: 5, month: 0, year: 2026, type: 'holiday', title: 'Tahun Baru Masehi' },
        { date: 15, month: 0, year: 2026, type: 'academic', title: 'Awal Semester Genap' },
        { date: 20, month: 0, year: 2026, type: 'exam', title: 'Ujian Susulan' },
        { date: 1, month: 0, year: 2026, type: 'holiday', title: 'Libur Tahun Baru' },
    ];

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

    const renderCalendarDays = () => {
        const totalDays = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const calendarDays = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="h-10 sm:h-14"></div>);
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

            let eventIndicator = null;
            if (dayEvents.length > 0) {
                const type = dayEvents[0].type;
                const colorClass =
                    type === 'holiday' ? 'bg-red-400' :
                        type === 'exam' ? 'bg-yellow-400' : 'bg-blue-400';

                eventIndicator = (
                    <div className={`w-1.5 h-1.5 rounded-full ${colorClass} mx-auto mt-1`}></div>
                );
            }

            calendarDays.push(
                <div
                    key={day}
                    className={`h-10 sm:h-14 flex flex-col items-center justify-center rounded-xl relative group transition-colors cursor-pointer
                        ${isToday
                            ? 'bg-[var(--color-primary)] text-white font-bold shadow-md'
                            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                        }
                    `}
                >
                    <span className="text-sm sm:text-base">{day}</span>
                    {eventIndicator}
                </div>
            );
        }

        return calendarDays;
    };

    const currentMonthEvents = events.filter(
        (e) => e.month === currentDate.getMonth() && e.year === currentDate.getFullYear()
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kalender Akademik" />

            <div className="pt-header pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Header Title */}
                    <div className="mb-8 text-center sm:text-left">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-blue-600 bg-clip-text text-transparent mb-1">
                            Kalender Akademik
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Info libur, ujian, dan kegiatan akademik lainnya.
                        </p>
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
                                            <h2 className="text-xl font-bold">
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
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-[var(--color-primary)] rounded-full"></span>
                                    Agenda Bulan Ini
                                </h3>
                                <div className="space-y-4">
                                    {currentMonthEvents.length > 0 ? (
                                        currentMonthEvents.map((event, index) => (
                                            <div
                                                key={index}
                                                className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-600 flex items-start gap-4 group hover:scale-[1.02] transition-transform duration-200"
                                            >
                                                <div className={`
                                                    w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0
                                                    ${event.type === 'holiday' ? 'bg-red-100 text-red-600' :
                                                        event.type === 'exam' ? 'bg-yellow-100 text-yellow-600' :
                                                            'bg-blue-100 text-blue-600'}
                                                `}>
                                                    <span className="text-[10px] font-bold uppercase leading-none mb-0.5">{months[event.month].substring(0, 3)}</span>
                                                    <span className="text-sm font-black leading-none">{event.date}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-tight mb-1">
                                                        {event.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                        {event.type === 'academic' ? 'Kegiatan Akademik' : event.type}
                                                    </p>
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
        </AuthenticatedLayout>
    );
}
