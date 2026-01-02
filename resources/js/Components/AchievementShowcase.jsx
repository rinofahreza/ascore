import { Link } from '@inertiajs/react';
import { IconTrophy, IconMedal } from '@tabler/icons-react';

export default function AchievementShowcase({ prestasis }) {
    // If no data, hide section or show empty state? Let's hide if empty for now.
    if (!prestasis || prestasis.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 px-4 pt-2 pb-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                        Guru & Karyawan Berprestasi
                    </h2>
                    <Link href={route('prestasi.public-index')} className="text-sm font-medium text-orange-500 hover:text-orange-600">
                        View all
                    </Link>
                </div>

                {/* Grid - 4 Columns */}
                <div className="grid grid-cols-4 gap-2">
                    {prestasis.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col bg-white dark:bg-gray-750 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden"
                        >
                            {/* Image with Year Badge */}
                            <div className="aspect-[4/5] w-full relative bg-gray-100">
                                {item.foto ? (
                                    <img
                                        src={item.foto}
                                        alt={item.nama}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-400">
                                        <IconTrophy size={24} />
                                    </div>
                                )}
                                {item.tanggal && (
                                    <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                        <IconTrophy size={10} className="text-yellow-400" />
                                        <span className="text-[10px] font-bold text-white leading-none">
                                            {new Date(item.tanggal).getFullYear()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Name */}
                            <div className="p-2 text-center flex items-center justify-center h-12">
                                <h3 className="font-bold text-gray-900 dark:text-white text-xs leading-tight line-clamp-2">
                                    {item.nama}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
