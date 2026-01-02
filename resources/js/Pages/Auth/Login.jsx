import { useEffect, useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

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
        <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden relative font-sans text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-6">
            <Head title="Log in" />

            {/* Gradient Bubbles Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 opacity-90 blur-xl pointer-events-none z-0 transform -translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute top-[10%] left-[20%] w-[100px] h-[100px] rounded-full bg-gradient-to-br from-orange-400 to-pink-500 blur-md pointer-events-none z-0 shadow-lg"></div>

            {/* Main Content Container */}
            <div className="relative z-10 w-full max-w-sm">

                {/* Header Typography */}
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold text-purple-800 dark:text-purple-400 tracking-tight leading-none">
                        LOG IN
                    </h1>
                    <h2 className="text-xl font-light text-white/90 dark:text-gray-300 tracking-[0.2em] mt-1 relative">
                        <span className="relative z-10 text-white mix-blend-overlay">TO CONTINUE</span>
                        {/* Overlay text for readability against white parts if needed, though bubble covers it mostly */}
                        <span className="absolute left-0 top-0 text-gray-400 -z-10 dark:text-gray-500">TO CONTINUE</span>
                    </h2>
                </div>

                {status && (
                    <div className="mb-6 text-sm font-medium text-green-600 p-3 bg-green-50 rounded-lg border border-green-100">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-8">
                    {/* Username/Email Input - Material Underline Style */}
                    <div className="group relative">
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full px-0 py-2 text-gray-900 dark:text-white bg-transparent border-0 border-b-2 border-purple-200 focus:border-purple-600 dark:border-gray-700 dark:focus:border-purple-500 focus:ring-0 appearance-none transition-colors peer placeholder-transparent"
                            autoComplete="username"
                            placeholder="Username"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <label
                            htmlFor="email"
                            className="absolute duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-purple-600 peer-focus:dark:text-purple-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 text-gray-500 dark:text-gray-400 font-medium"
                        >
                            Username
                        </label>
                        <InputError message={errors.email} className="mt-2 text-xs" />
                    </div>

                    {/* Password Input - Material Underline Style */}
                    <div className="group relative">
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={data.password}
                                className="block w-full px-0 py-2 text-gray-900 dark:text-white bg-transparent border-0 border-b-2 border-purple-200 focus:border-purple-600 dark:border-gray-700 dark:focus:border-purple-500 focus:ring-0 appearance-none transition-colors peer placeholder-transparent pr-8"
                                autoComplete="current-password"
                                placeholder="Password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <label
                                htmlFor="password"
                                className="absolute duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-purple-600 peer-focus:dark:text-purple-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 text-gray-500 dark:text-gray-400 font-medium"
                            >
                                Password
                            </label>

                            {/* Toggle Password Eye - Minimalist */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-0 top-2 text-gray-400 hover:text-purple-600 transition-colors"
                            >
                                {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                            </button>
                        </div>

                        <div className="flex justify-between items-start mt-2">
                            <InputError message={errors.password} className="text-xs" />
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-xs italic text-gray-400 hover:text-purple-600 transition-colors ml-auto"
                                >
                                    Forgot it?
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Submit Button - Gradient Pill */}
                    <div className="pt-8 flex justify-center">
                        <button
                            disabled={processing}
                            className="w-full max-w-[200px] bg-gradient-to-r from-purple-500 to-orange-400 hover:from-purple-600 hover:to-orange-500 text-white font-bold text-sm uppercase tracking-wider py-4 rounded-full shadow-lg shadow-purple-500/30 transform transition-all active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {processing ? 'LOGGING IN...' : 'LOG IN'}
                        </button>
                    </div>

                    {/* Remember Me - Hidden in this strict design but functionality retained if needed invisibly or add back small */}
                    {/* 
                     <div className="flex items-center mt-4">
                        <Checkbox 
                            name="remember" 
                            checked={data.remember} 
                            onChange={(e) => setData('remember', e.target.checked)} 
                        />
                        <span className="ml-2 text-sm text-gray-600">Remember me</span>
                     </div>
                     */}
                </form>
            </div>
        </div>
    );
}
