import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BottomNav from '@/Components/BottomNav';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth }) {
    const menus = [
        {
            image: '/images/laporan/kehadiranku.png',
            alt: 'Kehadiranku'
        },
        {
            href: '/laporan/jurnal-mengajar',
            image: '/images/laporan/jurnal_mengajar.png',
            alt: 'Jurnal Mengajar'
        },
        {
            image: '/images/laporan/kehadiran_siswa.png',
            alt: 'Kehadiran Siswa'
        },
        {
            image: '/images/laporan/penilaian_siswa.png',
            alt: 'Penilaian Siswa'
        }
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Laporan" />

            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-24 pt-header">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">

                    {/* Header */}


                    <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                        {menus.map((menu, index) => (
                            <Link
                                href={menu.href || '#'}
                                key={index}
                                className="block"
                            >
                                <img
                                    src={menu.image}
                                    alt={menu.alt}
                                    className="w-full h-auto object-contain"
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <BottomNav />
        </AuthenticatedLayout>
    );
}
