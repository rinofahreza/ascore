import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ImageSlider from '@/Components/ImageSlider';
import MenuGrid from '@/Components/MenuGrid';
import CivitasSection from '@/Components/CivitasSection';
import AchievementShowcase from '@/Components/AchievementShowcase';
import BottomNav from '@/Components/BottomNav';
import { Head } from '@inertiajs/react';

export default function Home({ auth, siswaCount, guruCount, karyawanCount }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Home" />

            <div className="bg-gray-100 dark:bg-gray-900 pb-24 pt-header">
                <div className="mx-auto">
                    {/* Image Slider */}
                    <ImageSlider />

                    {/* Menu Grid */}
                    <MenuGrid />

                    {/* Civitas Sekolah Section */}
                    <CivitasSection
                        siswaCount={siswaCount}
                        guruCount={guruCount}
                        karyawanCount={karyawanCount}
                    />

                    {/* Achievement Showcase */}
                    <AchievementShowcase />


                </div>
            </div>

            <BottomNav />
        </AuthenticatedLayout>
    );
}

