import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { IconTrophy, IconMedal, IconCalendar, IconArrowLeft } from '@tabler/icons-react';
import BottomNav from '@/Components/BottomNav';
import Pagination from '@/Components/Pagination';

export default function PublicList({ auth, prestasis }) {
    return (
        <AuthenticatedLayout
            user={auth ? auth.user : null}
            header={null}
        >
            <Head title="Guru & Karyawan Berprestasi" />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-400 to-pink-500 py-12 px-4 sm:px-6 lg:px-8 mb-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-3xl font-extrabold text-white sm:text-4xl text-shadow-sm">
                        Hall of Fame
                    </h1>
                    <p className="mt-3 max-w-2xl mx-auto text-xl text-orange-100 sm:mt-4">
                        Apresiasi tertinggi untuk Guru dan Karyawan yang telah memberikan kontribusi terbaik.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prestasis.data.length > 0 ? (
                        prestasis.data.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col"
                            >
                                {/* Card Body */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-start space-x-4">
                                        {/* Avatar */}
                                        <div className="flex-shrink-0">
                                            {item.foto ? (
                                                <img
                                                    className="h-16 w-16 rounded-xl object-cover shadow-sm bg-gray-100"
                                                    src={item.foto}
                                                    alt={item.nama}
                                                />
                                            ) : (
                                                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-orange-500">
                                                    <IconTrophy size={32} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Header Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-0.5">
                                                {item.role}
                                            </p>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                                {item.nama}
                                            </h3>
                                            {item.tanggal && (
                                                <div className="flex items-center text-xs text-gray-400 mt-1">
                                                    <IconCalendar size={14} className="mr-1" />
                                                    {new Date(item.tanggal).getFullYear()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="my-4 border-t border-gray-100 dark:border-gray-700"></div>

                                    {/* Achievement Details */}
                                    <div className="space-y-3 flex-1">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                                                Prestasi
                                            </p>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">
                                                {item.prestasi}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                                                Penghargaan
                                            </p>
                                            <div className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                                <IconMedal size={16} className="text-yellow-500 mr-1.5 mt-0.5 flex-shrink-0" />
                                                <span>{item.penghargaan}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
                            <IconTrophy size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-lg">Belum ada data prestasi yang ditampilkan.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="mt-8">
                    <Pagination links={prestasis.links} />
                </div>
            </div>

            <BottomNav />
        </AuthenticatedLayout>
    );
}
