
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import { useState, useEffect, useRef } from 'react';

export default function Index({ auth, rawJadwals, isGuru }) {
    // Helper to get day name
    const getDayName = (dayIndex) => {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return days[dayIndex];
    };

    // Initialize state with current day
    const todayIndex = new Date().getDay();
    const todayName = getDayName(todayIndex);

    // Default to today
    const [selectedDay, setSelectedDay] = useState(todayName);

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    // Auto-scroll refs
    const scrollContainerRef = useRef(null);
    const itemsRef = useRef(new Map());

    // Auto-scroll effect
    useEffect(() => {
        const node = itemsRef.current.get(selectedDay);
        if (node) {
            node.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [selectedDay]);

    // Filter jadwals for selected day
    const dailyJadwals = rawJadwals.filter(j => j.hari === selectedDay);

    // Sort by start time
    dailyJadwals.sort((a, b) => {
        const timeA = a.jam_pelajaran?.jam_mulai || '00:00';
        const timeB = b.jam_pelajaran?.jam_mulai || '00:00';
        return timeA.localeCompare(timeB);
    });

    const getSubjectColor = (subjectName) => {
        const colors = [
            'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
            'bg-orange-500', 'bg-teal-500', 'bg-indigo-500'
        ];
        let sum = 0;
        for (let i = 0; i < subjectName.length; i++) sum += subjectName.charCodeAt(i);
        return colors[sum % colors.length];
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Jadwal Pelajaran" />

            <div className="bg-[#F8F9FD] dark:bg-gray-900 min-h-screen pb-32">

                {rawJadwals && rawJadwals.length > 0 ? (
                    <>
                        {/* Header Section */}
                        <div className="pt-16 -mt-8 pb-6 px-6 bg-white dark:bg-gray-800 rounded-b-[2.5rem] shadow-sm sticky top-0 z-30">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    Jadwal <span className="text-[var(--color-primary)]">Kelas</span>
                                </h1>
                                <div className="text-xs font-medium px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                                    {selectedDay === todayName ? 'Hari Ini' : selectedDay}
                                </div>
                            </div>

                            {/* Day Selector Chips */}
                            <div
                                ref={scrollContainerRef}
                                className="flex overflow-x-auto gap-3 pb-2 no-scrollbar scroll-smooth -mx-6 px-6"
                            >
                                {days.map((day) => (
                                    <button
                                        key={day}
                                        ref={(node) => {
                                            if (node) itemsRef.current.set(day, node);
                                            else itemsRef.current.delete(day);
                                        }}
                                        onClick={() => setSelectedDay(day)}
                                        className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${selectedDay === day
                                            ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-purple-500/20 translate-y-0'
                                            : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-600'
                                            }`}
                                    >
                                        {day.substring(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Timeline Content */}
                        <div className="px-6 mt-6">
                            {dailyJadwals.length > 0 ? (
                                <div className="space-y-4">
                                    {dailyJadwals.map((jadwal, index) => (
                                        <div
                                            key={jadwal.id}
                                            className="flex gap-4 group animate-fade-in-up"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            {/* Time Column */}
                                            <div className="flex flex-col items-center pt-1 min-w-[3.5rem]">
                                                <span className="text-base font-bold text-gray-800 dark:text-white">
                                                    {jadwal.jam_pelajaran?.jam_mulai?.substring(0, 5)}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-medium my-1">
                                                    s/d
                                                </span>
                                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                    {jadwal.jam_pelajaran?.jam_selesai?.substring(0, 5)}
                                                </span>
                                                {/* Vertical line connector */}
                                                {index !== dailyJadwals.length - 1 && (
                                                    <div className="w-px h-full bg-dashed border-l border-gray-300 dark:border-gray-700 my-2 opacity-50"></div>
                                                )}
                                            </div>

                                            {/* Card */}
                                            <div className="flex-1 relative">
                                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group-hover:shadow-md transition-all duration-300">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-400">
                                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <h3 className="font-bold text-gray-800 dark:text-white text-lg leading-snug line-clamp-2">
                                                                    {jadwal.mata_pelajaran?.nama}
                                                                </h3>
                                                                {isGuru && (
                                                                    <span className="shrink-0 ml-2 text-[10px] uppercase font-bold px-2 py-0.5 bg-purple-50 text-purple-600 rounded">
                                                                        Kelas {jadwal.kelas?.nama}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 opacity-60">
                                    <div className="mb-4 p-6 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                                        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-gray-900 dark:text-white font-medium">Bebas Tugas</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada jadwal untuk hari ini.</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Global Empty State */
                    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
                        <div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-12 h-12 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Belum Ada Jadwal
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                            Jadwal pelajaran {isGuru ? 'mengajar' : ''} Anda belum diatur untuk periode akademik ini.
                        </p>
                    </div>
                )}

            </div>
            <BottomNav />
            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.4s ease-out forwards;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
