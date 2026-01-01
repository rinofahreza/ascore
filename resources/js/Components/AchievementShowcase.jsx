import { Link } from '@inertiajs/react';

export default function AchievementShowcase() {
    const achievements = [
        {
            id: 1,
            name: 'Siti Nurhaliza, S.Pd',
            position: 'Guru Matematika',
            achievement: 'Juara 1 Lomba Guru Berprestasi Tingkat Nasional',
            award: 'Medali Emas & Piagam Penghargaan',
            photo: '/images/achievements/teacher1.png',
            year: '2024'
        },
        {
            id: 2,
            name: 'Ahmad Fauzi, M.Pd',
            position: 'Guru Bahasa Inggris',
            achievement: 'Best Teacher Innovation Award',
            award: 'Penghargaan Inovasi Pembelajaran',
            photo: '/images/achievements/teacher2.png',
            year: '2024'
        },
        {
            id: 3,
            name: 'Dewi Sartika, S.Pd',
            position: 'Guru IPA',
            achievement: 'Juara 2 Lomba Karya Tulis Ilmiah Guru',
            award: 'Medali Perak & Sertifikat',
            photo: '/images/achievements/teacher1.png',
            year: '2023'
        },
        {
            id: 4,
            name: 'Muhammad Rizki, S.Kom',
            position: 'Staff IT',
            achievement: 'Best IT Support of The Year',
            award: 'Penghargaan Karyawan Teladan',
            photo: '/images/achievements/teacher2.png',
            year: '2024'
        },
        {
            id: 5,
            name: 'Fatimah Az-Zahra, S.Pd',
            position: 'Guru Agama Islam',
            achievement: 'Juara 1 Lomba Dai Muda Nasional',
            award: 'Trofi & Beasiswa Pendidikan',
            photo: '/images/achievements/teacher1.png',
            year: '2023'
        },
        {
            id: 6,
            name: 'Budi Santoso, S.E',
            position: 'Staff Administrasi',
            achievement: 'Excellence in Administration Award',
            award: 'Penghargaan Dedikasi Kerja',
            photo: '/images/achievements/teacher2.png',
            year: '2024'
        }
    ];

    const displayAchievements = achievements.slice(0, 3);

    return (
        <div className="bg-white dark:bg-gray-800 px-4 pt-2 pb-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                        Guru & Karyawan Berprestasi
                    </h2>
                    <Link href={route('achievements.index')} className="text-sm font-medium text-orange-500 hover:text-orange-600">
                        View all
                    </Link>
                </div>

                {/* List - Expert Servicer Style */}
                <div className="space-y-2">
                    {displayAchievements.map((item) => (
                        <div
                            key={item.id}
                            className="flex p-4 bg-white dark:bg-gray-750 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Image */}
                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                <img
                                    src={item.photo}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 ml-4 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-base truncate pr-2">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                            {item.position}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.year}</span>
                                    </div>
                                </div>
                                <div className="mt-2 flex flex-col gap-0.5 text-xs">
                                    <p className="text-gray-400 flex items-center gap-1 truncate">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        {item.achievement}
                                    </p>
                                    <p className="text-gray-400 flex items-center gap-1 truncate">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                        {item.award}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
