import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, ShieldCheck, TrendingUp, Zap } from 'lucide-react';

// Componente del ícono de Google SVG inline
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export default function Auth() {
    const [modo, setModo] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mostrarPass, setMostrarPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingGoogle, setLoadingGoogle] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [animado, setAnimado] = useState(false);

    useEffect(() => {
        // Animación de entrada al montar el componente
        const timer = setTimeout(() => setAnimado(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Resetear errores al cambiar de modo
    useEffect(() => {
        setError(null);
        setMensaje(null);
    }, [modo]);

    // Autenticación solo con Google OAuth
    const handleGoogleAuth = async () => {
        setLoadingGoogle(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    // Redirige al origen actual después del OAuth
                    redirectTo: window.location.origin,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Error al conectar con Google');
            setLoadingGoogle(false);
        }
    };

    // Autenticación con email (complementaria)
    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMensaje(null);

        try {
            if (modo === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: window.location.origin,
                    },
                });
                if (error) throw error;
                setMensaje('¡Cuenta creada! Revisa tu correo para confirmar.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err: any) {
            // Traducir mensajes comunes de Supabase al español
            const msg = err.message || '';
            if (msg.includes('Invalid login credentials')) {
                setError('Correo o contraseña incorrectos.');
            } else if (msg.includes('Email not confirmed')) {
                setError('Confirma tu correo antes de ingresar.');
            } else if (msg.includes('Password should be at least')) {
                setError('La contraseña debe tener al menos 6 caracteres.');
            } else if (msg.includes('User already registered')) {
                setError('Ya existe una cuenta con ese correo. Inicia sesión.');
            } else {
                setError(msg || 'Ocurrió un error inesperado.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#f0f4f8] font-sans">

            {/* ── Panel izquierdo: Formulario ── */}
            <div className={`
        w-full lg:w-1/2 flex flex-col justify-between
        bg-white px-8 sm:px-14 py-10
        transition-all duration-700 ease-out
        ${animado ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
      `}>

                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-slate-800 tracking-tight">SolConta</span>
                </div>

                {/* Formulario central */}
                <div className="w-full max-w-sm mx-auto space-y-7">

                    {/* Encabezado */}
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            {modo === 'signin' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
                        </h1>
                        <p className="text-slate-500 text-sm">
                            {modo === 'signin'
                                ? 'Ingresa para controlar tus finanzas en soles.'
                                : 'Empieza a gestionar tus finanzas hoy.'}
                        </p>
                    </div>

                    {/* Selector Ingresar / Registrarse */}
                    <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                        {(['signin', 'signup'] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => setModo(m)}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${modo === m
                                        ? 'bg-white text-slate-900 shadow-sm shadow-slate-200'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {m === 'signin' ? 'Ingresar' : 'Registrarse'}
                            </button>
                        ))}
                    </div>

                    {/* Botón Google OAuth (PRINCIPAL) */}
                    <div className="space-y-3">
                        <button
                            onClick={handleGoogleAuth}
                            disabled={loadingGoogle}
                            className="
                w-full flex items-center justify-center gap-3
                border-2 border-slate-200 hover:border-blue-300
                bg-white hover:bg-blue-50/50
                text-slate-700 font-semibold text-sm
                py-3.5 rounded-xl
                transition-all duration-200
                shadow-sm hover:shadow-md hover:shadow-blue-100
                disabled:opacity-60 disabled:cursor-not-allowed
                active:scale-[0.98]
              "
                        >
                            {loadingGoogle ? (
                                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <GoogleIcon />
                            )}
                            <span>
                                {loadingGoogle
                                    ? 'Conectando...'
                                    : modo === 'signin'
                                        ? 'Continuar con Google'
                                        : 'Registrarse con Google'}
                            </span>
                        </button>

                        {/* Separador */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="text-xs text-slate-400 font-medium">o con correo</span>
                            <div className="flex-1 h-px bg-slate-200" />
                        </div>
                    </div>

                    {/* Formulario de email */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {/* Campo Email */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Correo electrónico</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ejemplo@correo.com"
                                    className="
                    w-full px-4 py-3 rounded-xl text-sm
                    border-2 border-slate-200
                    focus:border-blue-400 focus:ring-4 focus:ring-blue-50
                    outline-none transition-all duration-200
                    placeholder:text-slate-300
                    bg-slate-50 focus:bg-white
                  "
                                />
                                {/* Indicador de validez */}
                                {email.includes('@') && email.includes('.') && (
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Campo Contraseña con toggle de visibilidad */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700">Contraseña</label>
                                {modo === 'signin' && (
                                    <button
                                        type="button"
                                        className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type={mostrarPass ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="
                    w-full px-4 py-3 pr-12 rounded-xl text-sm
                    border-2 border-slate-200
                    focus:border-blue-400 focus:ring-4 focus:ring-blue-50
                    outline-none transition-all duration-200
                    placeholder:text-slate-300
                    bg-slate-50 focus:bg-white
                  "
                                />
                                {/* Botón para ver/ocultar contraseña */}
                                <button
                                    type="button"
                                    onClick={() => setMostrarPass(!mostrarPass)}
                                    className="
                    absolute right-3.5 top-1/2 -translate-y-1/2
                    text-slate-400 hover:text-slate-600
                    transition-colors p-0.5 rounded-lg
                    hover:bg-slate-100
                  "
                                    title={mostrarPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {mostrarPass
                                        ? <EyeOff className="w-4.5 h-4.5" />
                                        : <Eye className="w-4.5 h-4.5" />
                                    }
                                </button>
                            </div>
                            {/* Indicador de fuerza de contraseña (solo en signup) */}
                            {modo === 'signup' && password.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                    {[1, 2, 3, 4].map((n) => (
                                        <div
                                            key={n}
                                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${password.length >= n * 2
                                                    ? password.length >= 10 ? 'bg-green-400' : password.length >= 6 ? 'bg-yellow-400' : 'bg-red-400'
                                                    : 'bg-slate-200'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mensajes de error/éxito */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium py-3 px-4 rounded-xl flex items-start gap-2">
                                <span className="text-red-400 mt-0.5 flex-shrink-0">⚠</span>
                                {error}
                            </div>
                        )}
                        {mensaje && (
                            <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium py-3 px-4 rounded-xl flex items-start gap-2">
                                <span className="flex-shrink-0">✓</span>
                                {mensaje}
                            </div>
                        )}

                        {/* Botón principal */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="
                w-full bg-blue-600 hover:bg-blue-700
                text-white font-bold py-3.5 rounded-xl text-sm
                shadow-lg shadow-blue-200 hover:shadow-blue-300
                transition-all duration-200
                flex items-center justify-center gap-2
                disabled:opacity-60 disabled:cursor-not-allowed
                active:scale-[0.98]
              "
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                            ) : (
                                modo === 'signin' ? 'Ingresar' : 'Crear cuenta'
                            )}
                        </button>
                    </form>
                </div>

                {/* Pie del panel */}
                <p className="text-center text-xs text-slate-400 mt-6">
                    Al continuar, aceptas los{' '}
                    <a href="#" className="underline hover:text-slate-600">Términos de Servicio</a>
                    {' '}y la{' '}
                    <a href="#" className="underline hover:text-slate-600">Política de Privacidad</a>.
                </p>
            </div>

            {/* ── Panel derecho: Imagen + Branding ── */}
            <div className={`
        hidden lg:flex w-1/2 relative overflow-hidden
        bg-gradient-to-br from-[#c8dff7] via-[#d6e8f8] to-[#e8f3fc]
        flex-col items-center justify-center
        transition-all duration-700 ease-out delay-200
        ${animado ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}>

                {/* Efectos de fondo */}
                <div className="absolute inset-0">
                    <div className="absolute top-10 right-10 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 left-10 w-48 h-48 bg-blue-200/30 rounded-full blur-2xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                </div>

                {/* Imagen del safe fintech */}
                <div className="relative z-10 flex flex-col items-center gap-10">
                    <img
                        src="data:image/jpeg;base64,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"
                        alt="Fintech Secure Safe"
                        className="w-80 h-80 object-contain drop-shadow-2xl
              animate-[float_4s_ease-in-out_infinite]"
                        style={{
                            filter: 'drop-shadow(0 30px 60px rgba(37,99,235,0.25))',
                        }}
                    />

                    {/* Texto de marca */}
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            Finanzas seguras,<br />decisiones inteligentes.
                        </h2>
                        <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
                            Controla tus ingresos y gastos en soles peruanos con la seguridad de nivel bancario.
                        </p>
                    </div>

                    {/* Stats / badges */}
                    <div className="flex gap-4">
                        {[
                            { icon: <ShieldCheck className="w-4 h-4" />, label: 'RLS activado', color: 'text-blue-600 bg-blue-50' },
                            { icon: <TrendingUp className="w-4 h-4" />, label: 'Tiempo real', color: 'text-green-600 bg-green-50' },
                            { icon: <Zap className="w-4 h-4" />, label: 'Multi-usuario', color: 'text-amber-600 bg-amber-50' },
                        ].map((badge) => (
                            <div
                                key={badge.label}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${badge.color} backdrop-blur-sm`}
                            >
                                {badge.icon}
                                {badge.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Patrón de puntos decorativo */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #1e3a5f 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                />
            </div>

            {/* Animación float CSS */}
            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-18px) rotate(2deg); }
        }
      `}</style>
        </div>
    );
}