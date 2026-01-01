import React from 'react';

export default function CivitasSection({ siswaCount = 0, guruCount = 0, karyawanCount = 0 }) {
    const items = [
        {
            label: 'Siswa Aktif',
            count: siswaCount,
            image: '/images/civitas-siswa.png',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            textColor: 'text-blue-600 dark:text-blue-400',
            borderColor: 'border-blue-100 dark:border-blue-800'
        },
        {
            label: 'Guru',
            count: guruCount,
            image: '/images/civitas-guru.png',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            textColor: 'text-green-600 dark:text-green-400',
            borderColor: 'border-green-100 dark:border-green-800'
        },
        {
            label: 'Karyawan',
            count: karyawanCount,
            image: '/images/civitas-karyawan.png',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            textColor: 'text-purple-600 dark:text-purple-400',
            borderColor: 'border-purple-100 dark:border-purple-800'
        }
    ];

    return (
        <div className="bg-white dark:bg-gray-800 px-4 pb-6 pt-0">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-600 dark:text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                        Civitas Sekolah
                    </h2>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className={`rounded-2xl p-3 border ${item.borderColor} ${item.bgColor} flex flex-col items-center justify-center text-center transition-transform hover:scale-105`}
                        >
                            <div className="w-12 h-12 mb-2">
                                <img
                                    src={item.image}
                                    alt={item.label}
                                    className="w-full h-full object-contain drop-shadow-sm"
                                />
                            </div>
                            <span className={`text-xl font-black ${item.textColor} leading-none mb-1`}>
                                {item.count}
                            </span>
                            <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
