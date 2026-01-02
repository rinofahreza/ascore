import { useEffect, useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 flex flex-col items-center">
            <Head title="Log in" />

            {/* Header with Wave Background */}
            <div className="relative w-full h-[35vh] bg-gradient-to-r from-orange-300 to-pink-500 rounded-b-[40px] shadow-lg flex items-center justify-center overflow-hidden">
                {/* Decorative Circles in Header */}
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-yellow-300 opacity-20 rounded-full blur-xl pointer-events-none"></div>

                {/* Logo Area */}
                <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-sm shadow-inner">
                        <ApplicationLogo className="w-16 h-16 text-white fill-current" />
                    </div>
                </div>

                {/* Wave Shape at bottom - using simpler CSS border radius approach for this specific design looks cleaner, but let's add a subtle SVG wave at the very bottom edge for detail if needed. The reference uses a smooth curve which rounded-b-[40px] achieves well. */}
            </div>

            {/* Main Content */}
            <div className="w-full max-w-sm px-6 mt-4 relative z-10 flex-1 flex flex-col justify-start">

                <div className="text-center mb-8 mt-8">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white tracking-tight">
                        Hello
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                        Sign In to your account
                    </p>
                </div>

                {status && (
                    <div className="mb-6 text-sm font-medium text-green-600 text-center bg-green-50 p-3 rounded-xl border border-green-100">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {/* Email Input - White Pill */}
                    <div className="relative shadow-sm rounded-full bg-white dark:bg-gray-800 transition-shadow hover:shadow-md">
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full px-6 py-4 text-gray-900 dark:text-white bg-transparent border-none rounded-full focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-700 placeholder-gray-400 text-base"
                            autoComplete="username"
                            placeholder="nama@asshofa.sch.id"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="absolute -bottom-5 left-6 text-xs" />
                    </div>

                    {/* Password Input - White Pill */}
                    <div className="relative shadow-sm rounded-full bg-white dark:bg-gray-800 transition-shadow hover:shadow-md mt-2">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            className="block w-full px-6 py-4 text-gray-900 dark:text-white bg-transparent border-none rounded-full focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-700 placeholder-gray-400 text-base pr-12"
                            autoComplete="current-password"
                            placeholder="Password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors"
                        >
                            {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                        </button>
                        <InputError message={errors.password} className="absolute -bottom-5 left-6 text-xs" />
                    </div>

                    {/* Forgot Password */}
                    <div className="flex justify-end pt-1">
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs text-gray-400 hover:text-pink-500 transition-colors"
                            >
                                Forgot your Password?
                            </Link>
                        )}
                    </div>

                    {/* Submit Button - Gradient Pill */}
                    <button
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-orange-300 to-pink-500 hover:from-orange-400 hover:to-pink-600 text-white font-bold text-sm uppercase tracking-wider py-4 rounded-full shadow-lg shadow-pink-500/20 transform transition-all active:scale-95 disabled:opacity-75 mt-4"
                    >
                        {processing ? 'SIGNING IN...' : 'SIGN IN'}
                    </button>

                    {/* Hidden Remember Me for functionality */}
                    <div className="sr-only">
                        <Checkbox name="remember" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
                    </div>
                </form>
            </div>
        </div>
    );
}
