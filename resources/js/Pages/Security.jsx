import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import Swal from 'sweetalert2';
import InputError from '@/Components/InputError';
import { IconEye, IconEyeOff, IconArrowLeft } from '@tabler/icons-react';

export default function Security({ auth }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                Swal.fire({
                    title: 'Berhasil',
                    text: 'Password berhasil diperbarui.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    confirmButtonColor: '#3b82f6', // indigo-500
                }).then(() => {
                    // router.visit(route('settings')); // Optional: Redirect or stay
                });
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth?.user} // Pass user prop if needed by layout
            hideNav={false} // Maybe hideNav if we want full screen custom feel, but layout handles bottom nav. Design has no bottom nav visible in snippet but better keep consistency or hide it. 
            // The request image shows a mobile view with NO bottom nav, just the form. 
            // But let's keep BottomNav if it's the main app, or hide it if it's a subpage.
            // Let's hide nav elements in the layout typically for full specific pages.
            // Actually, I'll pass header={null} to remove default header.
            header={null}
        >
            <Head title="Keamanan" />

            {/* Custom Header Area */}
            <div className="min-h-[calc(100vh-5rem)] bg-white dark:bg-gray-900 pt-12"> {/* Fill remaining height to avoid gray background from layout */}

                <div className="px-6 flex flex-col items-center">
                    {/* Illustration */}
                    <div className="w-full max-w-[200px] mb-8">
                        <img
                            src="/images/security-illustration.png"
                            alt="Security Illustration"
                            className="w-full h-auto object-contain"
                        />
                    </div>

                    {/* Title */}
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                        Update your password
                    </h1>

                    {/* Form */}
                    <form onSubmit={updatePassword} className="w-full max-w-xs space-y-5">

                        {/* Current Password / Security Code */}
                        <div className="relative group">
                            <input
                                ref={currentPasswordInput}
                                id="current_password"
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                className="w-full px-4 py-3.5 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white transition-all outline-none placeholder-gray-400 text-sm"
                                placeholder="Enter 8 digit security code"
                                autoComplete="current-password"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                {/* Optional: Eye icon for this field too if desired, though design didn't explicitly show it open */}
                            </div>
                            <InputError message={errors.current_password} className="mt-1" />
                        </div>

                        {/* New Password */}
                        <div className="relative">
                            <input
                                ref={passwordInput}
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full px-4 py-3.5 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white transition-all outline-none placeholder-gray-400 text-sm"
                                placeholder="New password"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <IconEye size={20} /> : <IconEyeOff size={20} />}
                            </button>
                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                            <input
                                id="password_confirmation"
                                type="password" // Typically confirm doesn't need show toggle unless requested, keeping clean as per design sketch
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="w-full px-4 py-3.5 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white transition-all outline-none placeholder-gray-400 text-sm"
                                placeholder="Re-write password"
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password_confirmation} className="mt-1" />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#1a73e8] hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-sm tracking-wide"
                            >
                                {processing ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
