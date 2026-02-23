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
        <div className="min-h-screen bg-background premium-gradient-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 glass-card p-8 rounded-3xl relative overflow-hidden">
                {/* Background blobs for aesthetics */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse-subtle"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-income/10 rounded-full blur-3xl animate-pulse-subtle"></div>

                <div className="relative text-center space-y-2">
                    <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 mb-6">
                        <Wallet className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        {isSignUp ? 'Crear Cuenta' : 'Bienvenido'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isSignUp ? 'Empieza a controlar tus finanzas hoy' : 'Accede a tu panel contable personal'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="mt-8 space-y-6 relative">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium px-1 text-muted-foreground">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="tu@ejemplo.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium px-1 text-muted-foreground">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <span>{isSignUp ? 'Registrarse' : 'Iniciar Sesión'}</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Registrate gratis'}
                    </button>
                </div>
            </div>
        </div>
    );
}
