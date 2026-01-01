import LoadingPage from '@/Components/LoadingPage';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function Loading({ redirectTo }) {
    useEffect(() => {
        // Redirect after a short delay to show loading
        const timer = setTimeout(() => {
            router.visit(redirectTo);
        }, 1000);

        return () => clearTimeout(timer);
    }, [redirectTo]);

    return <LoadingPage />;
}
