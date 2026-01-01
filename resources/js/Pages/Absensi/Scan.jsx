import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function Scan({ auth }) {
    const [hasPermission, setHasPermission] = useState(null);

    useEffect(() => {
        const html5QrCode = new Html5Qrcode("reader");

        const qrCodeSuccessCallback = (decodedText, decodedResult) => {
            console.log(`Scan result ${decodedText}`, decodedResult);

            // Stop scanning and redirect
            html5QrCode.stop().then(() => {
                router.get(route('absensi'), { scan_result: decodedText }, { replace: true });
            }).catch(err => {
                console.error("Failed to stop scanner", err);
                router.get(route('absensi'), { scan_result: decodedText }, { replace: true });
            });
        };

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        // Start scanning with back camera
        html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
            .then(() => {
                setHasPermission(true);
            })
            .catch(err => {
                console.error("Error starting scanner", err);
                setHasPermission(false);
                Swal.fire({
                    title: 'Akses Kamera Ditolak',
                    text: 'Mohon izinkan akses kamera untuk melakukan absensi.',
                    icon: 'error'
                });
            });

        return () => {
            if (html5QrCode.isScanning) {
                html5QrCode.stop().catch(err => console.error("Failed to stop scanner", err));
            }
        };
    }, []);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Scan Absensi" />

            <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
                <div className="fixed bottom-10 left-0 right-0 z-[60] flex justify-center px-4 pb-safe">
                    <button
                        onClick={() => router.get(route('absensi'), {}, { replace: true })}
                        className="bg-red-600/90 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-full shadow-lg backdrop-blur-sm transition-all active:scale-95 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Batalkan Scan
                    </button>
                </div>

                <div className="w-full max-w-md px-4 relative">
                    <div id="reader" className="w-full h-auto bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-white/20"></div>
                    <p className="text-white/80 text-center mt-6 animate-pulse">
                        Arahkan kamera ke QR Code
                    </p>
                    {hasPermission === false && (
                        <div className="text-red-500 text-center mt-4 bg-white/10 p-3 rounded-xl backdrop-blur-md">
                            <p>Akses kamera diperlukan.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
