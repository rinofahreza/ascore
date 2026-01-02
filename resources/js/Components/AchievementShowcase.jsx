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

                {/* List - Expert Servicer Style */}
                <div className="space-y-2">
                    {prestasis.map((item) => (
                        <div
                            key={item.id}
                            className="flex p-4 bg-white dark:bg-gray-750 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Image */}
                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
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
                            </div>

                            {/* Content */}
                            <div className="flex-1 ml-4 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">
                                            {item.nama}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium truncate">
                                            {item.role}
                                        </p>
                                    </div>
                                    {item.tanggal && (
                                        <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg flex-shrink-0">
                                            <IconTrophy size={14} className="text-yellow-400" />
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                {new Date(item.tanggal).getFullYear()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 flex flex-col gap-0.5 text-xs">
                                    <p className="text-gray-400 flex items-center gap-1 truncate">
                                        <IconTrophy size={14} className="flex-shrink-0" />
                                        <span className="truncate">{item.prestasi}</span>
                                    </p>
                                    <p className="text-gray-400 flex items-center gap-1 truncate">
                                        <IconMedal size={14} className="flex-shrink-0" />
                                        <span className="truncate">{item.penghargaan}</span>
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
