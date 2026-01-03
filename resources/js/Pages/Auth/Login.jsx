import { useEffect, useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Swal from 'sweetalert2';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Waduh!',
                    text: 'Email atau Password salah. Coba cek lagi ya!',
                    confirmButtonColor: '#f97316',
                    confirmButtonText: 'Oke, Paham',
                    background: '#ffffff',
                    color: '#333',
                    borderRadius: '20px'
                });
            }
        });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6">
            <Head title="Log in" />

            <div className="w-full max-w-sm flex flex-col items-center">
                {/* Illustration */}
                <div className="w-full max-w-[300px] mb-8">
                    <img
                        src="/images/login-illustration.png"
                        alt="Login Illustration"
                        className="w-full h-auto object-contain"
                    />
                </div>

                {/* Title */}
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                    Log in to continue to the ASCORE
                </h1>

                {/* Status Message */}
                {status && (
                    <div className="mb-6 w-full text-sm font-medium text-green-600 text-center bg-green-50 p-3 rounded-lg border border-green-100">
                        {status}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={submit} className="w-full max-w-xs space-y-5">
                    {/* Email Input */}
                    <div className="relative group">
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full px-4 py-3.5 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white transition-all outline-none placeholder-gray-400 text-sm"
                            autoComplete="username"
                            placeholder="nama@asshofa.sch.id"
                        />
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full px-4 py-3.5 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white transition-all outline-none placeholder-gray-400 text-sm pr-12"
                            autoComplete="current-password"
                            placeholder="Password"
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

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-[#1a73e8] hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-sm tracking-wide"
                        >
                            {processing ? 'Logging in...' : 'Log in'}
                        </button>
                    </div>

                    {/* Hidden Remember Me */}
                    <div className="sr-only">
                        <Checkbox name="remember" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
                    </div>
                </form>
            </div>
        </div>
    );
}
