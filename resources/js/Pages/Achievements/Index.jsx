import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Index({ auth }) {
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
        },
        {
            id: 7,
            name: 'Rina Kusuma, S.Pd',
            position: 'Guru Bahasa Indonesia',
            achievement: 'Penulis Buku Ajar Terbaik',
            award: 'Sertifikat & Royalti',
            photo: '/images/achievements/teacher1.png',
            year: '2023'
        },
        {
            id: 8,
            name: 'Eko Prasetyo, S.Or',
            position: 'Guru Olahraga',
            achievement: 'Pelatih Terbaik Kejuaraan Futsal Daerah',
            award: 'Trofi Pelatih Terbaik',
            photo: '/images/achievements/teacher2.png',
            year: '2024'
        },
        {
            id: 9,
            name: 'Sri Wahyuni, S.Pd',
            position: 'Guru Seni Budaya',
            achievement: 'Juara Harapan 1 Pagelaran Seni Guru',
            award: 'Piagam Penghargaan',
            photo: '/images/achievements/teacher1.png',
            year: '2023'
        },
        {
            id: 10,
            name: 'Hendra Gunawan, S.Pd',
            position: 'Guru Fisika',
            achievement: 'Finalis Olimpiade Guru Sains Nasional',
            award: 'Sertifikat Finalis',
            photo: '/images/achievements/teacher2.png',
            year: '2024'
        },
        {
            id: 11,
            name: 'Nurlaila, S.Pd',
            position: 'Guru Kimia',
            achievement: 'Guru Pembimbing Terbaik Kompetisi Sains',
            award: 'Plakat Penghargaan',
            photo: '/images/achievements/teacher1.png',
            year: '2024'
        },
        {
            id: 12,
            name: 'Agus Salim, S.Pd',
            position: 'Guru Sejarah',
            achievement: 'Narasumber Webinar Sejarah Nasional',
            award: 'Sertifikat Narasumber',
            photo: '/images/achievements/teacher2.png',
            year: '2023'
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Guru & Karyawan Berprestasi" />

            <div className="bg-gray-100 dark:bg-gray-900 min-h-screen pb-24 pt-header">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    <div className="sticky top-[100px] z-40 bg-gray-100 dark:bg-gray-900 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-8 text-center border-b border-gray-200 dark:border-gray-700 shadow-sm transition-all">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-blue-600 bg-clip-text text-transparent mb-2">
                            Hall of Fame
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Daftar Guru dan Karyawan Berprestasi yang membanggakan sekolah.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {achievements.map((item) => (
                            <div
                                key={item.id}
                                className="flex p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Image */}
                                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 ring-2 ring-gray-50 dark:ring-gray-700">
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
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-700/50 inline-block px-1.5 py-0.5 rounded-md mt-0.5">
                                                {item.position}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{item.year}</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex flex-col gap-1.5 text-xs">
                                        <div className="flex items-start gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            <span className="font-medium leading-tight">{item.achievement}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 px-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                            <span className="truncate">{item.award}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center text-xs text-gray-400">
                        Menampilkan {achievements.length} Data
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
