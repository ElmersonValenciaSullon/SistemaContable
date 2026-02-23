import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Wallet, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

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
                alert('Revisa tu correo para confirmar tu cuenta (si activaste la confirmación)');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background premium-gradient-bg flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
            {/* Decorative blurred circles for premium depth */}
            <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-subtle"></div>
            <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-income/10 rounded-full blur-[120px] animate-pulse-subtle"></div>

            <div className="w-full max-w-md relative">
                <div className="glass-card p-10 rounded-[2.5rem] space-y-10 border border-white/40 dark:border-slate-800/50 relative overflow-hidden">

                    <div className="text-center space-y-4 relative">
                        <div className="mx-auto w-20 h-20 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(37,99,235,0.3)] mb-8 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                            <Wallet className="text-white w-10 h-10" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                            {isSignUp ? 'Crear Cuenta' : 'Sigue Ganando'}
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            {isSignUp ? 'Empieza tu libertad financiera' : 'Accede a tu panel financiero'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6 relative">
                        <div className="space-y-5">
                            <div className="group space-y-2">
                                <label className="text-sm font-semibold px-2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                    Correo Electrónico
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-14 pr-6 py-4 bg-secondary/30 border border-transparent rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all text-lg"
                                        placeholder="ejemplo@correo.com"
                                    />
                                </div>
                            </div>

                            <div className="group space-y-2">
                                <label className="text-sm font-semibold px-2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-14 pr-6 py-4 bg-secondary/30 border border-transparent rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all text-lg"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium py-4 px-6 rounded-2xl text-center animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-[1.25rem] shadow-[0_15px_30px_rgba(37,99,235,0.25)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center space-x-3 active:scale-[0.97] disabled:opacity-50 ring-offset-background focus:ring-4 focus:ring-primary/20"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <span className="text-lg">{isSignUp ? 'Registrarse' : 'Entrar ahora'}</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-4">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-primary font-bold hover:underline underline-offset-4 decoration-2 transition-all p-2"
                        >
                            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo aquí? Regístrate gratis'}
                        </button>
                    </div>
                </div>

                {/* Subtle footer */}
                <p className="text-center text-muted-foreground/60 text-sm mt-8 font-medium">
                    Sistema Contable Premium &bull; 2026
                </p>
            </div>
        </div>
    );
}
