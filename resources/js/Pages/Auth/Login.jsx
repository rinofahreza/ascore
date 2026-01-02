import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { useState } from 'react';

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
        <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden relative font-sans text-gray-900 dark:text-gray-100 flex flex-col">
            <Head title="Log in" />

            {/* Organic Shape Background */}
            <div className="absolute top-0 right-0 w-full h-[50vh] z-0 pointer-events-none">
                <svg
                    viewBox="0 0 500 500"
                    preserveAspectRatio="none"
                    className="w-full h-full text-teal-600 fill-current opacity-90"
                    style={{ filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.1))' }}
                >
                    <path d="M0,0 L500,0 L500,250 C400,350 200,100 0,300 Z" />
                    {/* Simplified wave for smoother look - actually let's try a better path for that 'blob' effect */}
                    <path d="M0,0 L500,0 L500,350 C350,350 300,150 0,200 Z" fill="#0d9488" />
                </svg>
                {/* Let's use a cleaner absolute shape approach typical for this design */}
                <div className="absolute top-[-20%] right-[-10%] w-[120%] h-[70%] bg-gradient-to-br from-teal-400 to-teal-600 rounded-bl-[40%] rounded-br-[40%] transform -rotate-12 scale-110 shadow-xl opacity-90"></div>
                <div className="absolute top-[-25%] right-[-20%] w-[120%] h-[80%] bg-teal-100 dark:bg-teal-900/30 rounded-bl-[45%] rounded-br-[40%] transform -rotate-6 scale-105 -z-10"></div>
            </div>

            {/* Header Content */}
            <div className="relative z-10 px-8 pt-24 pb-8 text-left">
                <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
                    Welcome Back,
                </h1>
                <h2 className="text-5xl font-black text-white mt-2 drop-shadow-md">
                    Log In!
                </h2>
            </div>

            {/* Form Section */}
            <div className="flex-1 relative z-10 px-8 pt-12">

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600 p-4 bg-green-50 rounded-xl rounded-tl-none">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {/* Email Input */}
                    <div className="group">
                        <InputLabel htmlFor="email" value="EMAIL ADDRESS" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1" />
                        <div className="relative">
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="block w-full px-5 py-4 text-lg rounded-2xl border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm group-hover:shadow-md"
                                autoComplete="username"
                                isFocused={true}
                                placeholder="name@example.com"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>
                        <InputError message={errors.email} className="mt-2 ml-1" />
                    </div>

                    {/* Password Input */}
                    <div className="group">
                        <InputLabel htmlFor="password" value="PASSWORD" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1" />
                        <div className="relative">
                            <TextInput
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={data.password}
                                className="block w-full px-5 py-4 text-lg rounded-2xl border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm group-hover:shadow-md pr-12"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                            >
                                {showPassword ? <IconEyeOff size={22} /> : <IconEye size={22} />}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-2 ml-1" />
                    </div>

                    {/* Remember & Forgot Password */}
                    <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center cursor-pointer group">
                            <div className="relative flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 border-gray-300 transition-all group-hover:scale-110"
                                />
                            </div>
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-teal-600 transition-colors">Remember me</span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm font-semibold text-gray-500 hover:text-teal-600 dark:text-gray-400 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            disabled={processing}
                            className="w-full bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white font-bold text-xl py-4 rounded-full shadow-xl shadow-teal-500/30 transform transition-all active:scale-95 disabled:opacity-75 flex justify-center items-center gap-2"
                        >
                            {processing ? (
                                <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Log in'
                            )}
                        </button>
                    </div>
                </form>

                {/* Social Login / Register Link Placeholder - Optional */}
                <div className="mt-12 text-center">
                    {/* Can add 'Or login with' or 'Create account' here later */}
                </div>
            </div>
        </div>
    );
}
