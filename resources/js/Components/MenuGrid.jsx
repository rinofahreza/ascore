import { Link, usePage } from '@inertiajs/react';

export default function MenuGrid() {
    const menuItems = [
        {
            name: 'Absensi',
            image: '/images/menu-absensi-v2.png',
            href: '/absensi',
        },
        {
            name: 'Jadwal',
            image: '/images/menu-jadwal-v2.png',
            href: '/jadwal',
        },
        {
            name: 'Jurnal',
            image: '/images/menu-jurnal-v2.png',
            href: '/jurnal',
        },
        {
            name: 'Berkas',
            image: '/images/menu-berkas-v2.png',
            href: '/berkas',
        },
        {
            name: 'K.Akademik',
            image: '/images/menu-ekskul-v2.png',
            href: '/kalender-akademik',
        },
        {
            name: 'Kesehatan',
            image: '/images/menu-perpustakaan-v2.png',
            href: '/kesehatan',
        },
        {
            name: 'Nilai',
            image: '/images/menu-nilai-v2.png',
            href: '/nilai',
        },
        {
            name: 'Laporan',
            image: '/images/menu-laporan-v2.png',
            href: '/laporan',
        },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 px-4 pt-0 pb-2">
            <div className="max-w-7xl mx-auto">
                <div className="bg-blue-50/50 dark:bg-gray-800 rounded-2xl p-4 border border-blue-100 dark:border-gray-700">
                    <div className="grid grid-cols-4 gap-1">
                        {menuItems.map((item, index) => {
                            const Component = item.href ? Link : 'button';
                            return (
                                <Component
                                    key={index}
                                    href={item.href}
                                    className="flex flex-col items-center gap-0.5 p-2 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                                >
                                    <div className="w-16 h-16 flex items-center justify-center transition-transform duration-300 hover:rotate-6">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                                        {item.name}
                                    </span>
                                </Component>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
