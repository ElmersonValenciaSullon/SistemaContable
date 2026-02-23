import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, ArrowRight, Wallet, CheckCircle2 } from 'lucide-react';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Revisa tu correo para confirmar tu cuenta');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Error de credenciales');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
            {/* Left Section: Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-white shrink-0">
                <div className="w-full max-w-[400px] space-y-8">
                    {/* Logo */}
                    <div className="flex items-center space-x-3 text-[#1A1C1E]">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center transform -rotate-12">
                            <Wallet className="text-white w-6 h-6 rotate-12" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">SolConta</span>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-[#1A1C1E]">
                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                        </h1>
                        <p className="text-slate-500 text-sm">
                            {isSignUp ? 'Join us and manage your finances better' : 'Welcome back, Please enter Your details'}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        <button
                            onClick={() => setIsSignUp(false)}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${!isSignUp ? 'bg-white shadow-sm text-black' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsSignUp(true)}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${isSignUp ? 'bg-white shadow-sm text-black' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Signup
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="flex h-14 w-full flex-col justify-center rounded-2xl border border-slate-200 px-12 transition-all focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-transparent text-[15px] font-semibold text-black placeholder:text-slate-300 focus:outline-none"
                                        placeholder="mail-address@gmail.com"
                                    />
                                </div>
                                {email.includes('@') && (
                                    <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5" />
                                )}
                            </div>

                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div className="flex h-14 w-full flex-col justify-center rounded-2xl border border-slate-200 px-12 transition-all focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-transparent text-[15px] font-semibold text-black placeholder:text-slate-300 focus:outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-500 text-xs font-medium px-1">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-[#0066FF] hover:bg-[#0052CC] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <span>{isSignUp ? 'Create Account' : 'Continue'}</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Social Logins */}
                    <div className="space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center tracking-tighter">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-[11px] uppercase tracking-widest font-bold">
                                <span className="bg-white px-4 text-slate-400">Or Continue With</span>
                            </div>
                        </div>

                        <div className="flex justify-center space-x-4">
                            <button className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            </button>
                            <button className="w-12 h-12 rounded-full bg-black flex items-center justify-center hover:bg-slate-900 transition-colors">
                                <img src="https://www.svgrepo.com/show/303108/apple-black-logo.svg" className="w-5 h-5 invert" alt="Apple" />
                            </button>
                            <button className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center hover:bg-[#166FE5] transition-colors">
                                <img src="https://www.svgrepo.com/show/303114/facebook-3-logo.svg" className="w-5 h-5 invert" alt="Facebook" />
                            </button>
                        </div>
                    </div>

                    <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                        Join the millions of smart investors who trust us to manage their finances. Log in to access your personalized dashboard, track your portfolio performance, and make informed investment decisions.
                    </p>
                </div>
            </div>

            {/* Right Section: Visual */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#EEF6FF] to-[#CDE4FF] items-center justify-center relative overflow-hidden">
                {/* Abstract background particles */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#1e40af 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                {/* Floating Safe Image */}
                <div className="relative z-10 p-12 animate-in fade-in zoom-in duration-700">
                    <img
                        src="/login_safe.png"
                        alt="Security Safe"
                        className="w-[480px] h-auto drop-shadow-[0_50px_100px_rgba(30,64,175,0.2)] transform hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => {
                            // Fallback if image not found
                            e.currentTarget.src = "https://cdn3d.iconscout.com/3d/premium/thumb/safe-locker-4161741-3444021.png";
                        }}
                    />
                </div>

                {/* Background decorative bars (vertical lines from image) */}
                <div className="absolute right-20 top-0 h-40 w-1 bg-white/30 rounded-full blur-sm"></div>
                <div className="absolute left-40 bottom-0 h-60 w-1 bg-white/20 rounded-full blur-sm"></div>
            </div>
        </div>
    );
}
