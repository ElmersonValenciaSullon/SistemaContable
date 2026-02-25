import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, ShieldCheck, TrendingUp, Zap, ArrowLeft } from 'lucide-react';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// Ícono caja de ahorro (piggy bank SVG inline)
const PiggyBankIcon = () => (
  <svg viewBox="0 0 64 64" className="w-28 h-28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="28" cy="36" rx="20" ry="16" fill="#dbeafe" stroke="#2563eb" strokeWidth="2.5"/>
    <circle cx="46" cy="30" r="6" fill="#bfdbfe" stroke="#2563eb" strokeWidth="2.5"/>
    <path d="M44 30h4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="22" cy="33" r="2.5" fill="#2563eb"/>
    <path d="M28 20c0-4 6-6 8-2" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M20 52l3-6h10l3 6" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="26" y="14" width="8" height="5" rx="2" fill="#93c5fd" stroke="#2563eb" strokeWidth="2"/>
    <path d="M30 14v-4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

type Modo = 'signin' | 'signup' | 'reset';

export default function Auth() {
  const [modo, setModo] = useState<Modo>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [animado, setAnimado] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimado(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setError(null);
    setMensaje(null);
    setPassword('');
  }, [modo]);

  const handleGoogleAuth = async () => {
    setLoadingGoogle(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin, queryParams: { access_type: 'offline', prompt: 'consent' } },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Error al conectar con Google');
      setLoadingGoogle(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMensaje(null);
    try {
      if (modo === 'signup') {
        // FIX: Supabase en modo "Confirm email" devuelve sesión vacía si el correo ya existe
        // pero no lanza error. Hacemos signUp y chequeamos la respuesta.
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;

        // FIX: si identities está vacío significa que el correo YA está registrado
        // Supabase devuelve esto cuando "Prevent sign up" no está activo pero el email existe
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setError('Ya existe una cuenta con ese correo. Intenta ingresar o recuperar tu contraseña.');
        } else {
          setMensaje('¡Cuenta creada! Revisa tu correo para confirmar tu cuenta antes de ingresar.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.session) {
          setMensaje('Confirma tu correo electrónico para poder ingresar.');
        }
      }
    } catch (err: any) {
      const msg: string = err.message || '';
      if (msg.includes('Invalid login credentials')) {
        setError('Correo o contraseña incorrectos.');
      } else if (msg.includes('Email not confirmed')) {
        setError('Debes confirmar tu correo antes de ingresar. Revisa tu bandeja de entrada.');
      } else if (msg.includes('Password should be at least')) {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else if (msg.includes('User already registered')) {
        setError('Ya existe una cuenta con ese correo. Intenta ingresar.');
      } else if (msg.includes('over_email_send_rate_limit')) {
        setError('Demasiados intentos. Espera unos minutos antes de volver a intentar.');
      } else {
        setError(msg || 'Ocurrió un error inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  // FIX: solo enviar correo de recuperación si el email está registrado
  // Supabase no expone directamente si un email existe por seguridad,
  // pero podemos intentar un signIn con password vacío — si el error es
  // "Invalid login credentials" el email SÍ existe. Si no hay usuario,
  // el error sería diferente. La forma más limpia: enviar siempre pero
  // mostrar mensaje genérico que no confirme ni niegue la existencia del correo.
  // (Esto es buena práctica de seguridad — igual que GitHub/Google)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Ingresa tu correo electrónico.'); return; }
    setLoading(true);
    setError(null);
    setMensaje(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      // Mensaje genérico por seguridad — no revelar si el correo existe o no
      setMensaje(`Recibirás un enlace para crear una nueva contraseña. Revisa tu bandeja de entrada o carpeta de spam.`);
    } catch (err: any) {
      const msg: string = err.message || '';
      if (msg.includes('over_email_send_rate_limit') || msg.includes('email rate limit')) {
        setError('Límite de envíos alcanzado. Espera unos minutos antes de volver a intentarlo.');
      } else if (msg.includes('Failed to fetch') || msg.includes('fetch') || msg.includes('ERR_NAME_NOT_RESOLVED') || msg.includes('NetworkError')) {
        setError('Sin conexión a internet. Verifica tu conexión y vuelve a intentarlo.');
      } else {
        setError(msg || 'No se pudo enviar el correo. Intenta más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Pantalla recuperar contraseña ───
  if (modo === 'reset') {
    return (
      <div className="min-h-screen flex bg-[#f0f4f8] font-sans">
        <div className={`w-full lg:w-1/2 flex flex-col justify-between bg-white px-8 sm:px-14 py-10 transition-all duration-700 ease-out ${animado ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">SolConta</span>
          </div>

          <div className="w-full max-w-sm mx-auto space-y-7">
            <button onClick={() => setModo('signin')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Volver al inicio de sesión
            </button>

            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Recuperar contraseña</h1>
              <p className="text-slate-500 text-sm">Te enviaremos un enlace para crear una nueva contraseña.</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Correo electrónico</label>
                <div className="relative">
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full px-4 py-3 rounded-xl text-sm border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all duration-200 placeholder:text-slate-300 bg-slate-50 focus:bg-white"
                  />
                  {email.includes('@') && email.includes('.') && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </div>
              </div>

              {/* FIX: un solo ✓ en el mensaje, sin duplicar */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium py-3 px-4 rounded-xl flex items-start gap-2">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">⚠</span>{error}
                </div>
              )}
              {mensaje && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium py-3 px-4 rounded-xl flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5 text-green-500">✓</span>
                  <span>{mensaje}</span>
                </div>
              )}

              {!mensaje ? (
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-blue-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98]"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : 'Enviar enlace de recuperación'}
                </button>
              ) : (
                <button type="button" onClick={() => setModo('signin')}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver a ingresar
                </button>
              )}
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Al continuar, aceptas los <a href="#" className="underline hover:text-slate-600">Términos de Servicio</a> y la <a href="#" className="underline hover:text-slate-600">Política de Privacidad</a>.
          </p>
        </div>
        <RightPanel animado={animado} />
      </div>
    );
  }

  // ─── Signin / Signup ───
  return (
    <div className="min-h-screen flex bg-[#f0f4f8] font-sans">
      <div className={`w-full lg:w-1/2 flex flex-col justify-between bg-white px-8 sm:px-14 py-10 transition-all duration-700 ease-out ${animado ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">SolConta</span>
        </div>

        <div className="w-full max-w-sm mx-auto space-y-7">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {modo === 'signin' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
            </h1>
            <p className="text-slate-500 text-sm">
              {modo === 'signin' ? 'Ingresa para controlar tus finanzas en soles.' : 'Empieza a gestionar tus finanzas hoy.'}
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            {(['signin', 'signup'] as const).map(m => (
              <button key={m} onClick={() => setModo(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${modo === m ? 'bg-white text-slate-900 shadow-sm shadow-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                {m === 'signin' ? 'Ingresar' : 'Registrarse'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <button onClick={handleGoogleAuth} disabled={loadingGoogle}
              className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/50 text-slate-700 font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-100 disabled:opacity-60 active:scale-[0.98]">
              {loadingGoogle ? <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> : <GoogleIcon />}
              <span>{loadingGoogle ? 'Conectando...' : modo === 'signin' ? 'Continuar con Google' : 'Registrarse con Google'}</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">o con correo</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Correo electrónico</label>
              <div className="relative">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="ejemplo@correo.com"
                  className="w-full px-4 py-3 rounded-xl text-sm border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all duration-200 placeholder:text-slate-300 bg-slate-50 focus:bg-white" />
                {email.includes('@') && email.includes('.') && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Contraseña</label>
                {modo === 'signin' && (
                  <button type="button" onClick={() => setModo('reset')}
                    className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <input type={mostrarPass ? 'text' : 'password'} required minLength={6} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all duration-200 placeholder:text-slate-300 bg-slate-50 focus:bg-white" />
                <button type="button" onClick={() => setMostrarPass(!mostrarPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg hover:bg-slate-100">
                  {mostrarPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {modo === 'signup' && password.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-300 ${password.length >= n * 2 ? password.length >= 10 ? 'bg-green-400' : password.length >= 6 ? 'bg-yellow-400' : 'bg-red-400' : 'bg-slate-200'}`} />
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium py-3 px-4 rounded-xl flex items-start gap-2">
                <span className="text-red-400 mt-0.5 flex-shrink-0">⚠</span>{error}
              </div>
            )}
            {mensaje && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium py-3 px-4 rounded-xl flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5 text-green-500">✓</span>
                <span>{mensaje}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98]">
              {loading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : modo === 'signin' ? 'Ingresar' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Al continuar, aceptas los <a href="#" className="underline hover:text-slate-600">Términos de Servicio</a> y la <a href="#" className="underline hover:text-slate-600">Política de Privacidad</a>.
        </p>
      </div>
      <RightPanel animado={animado} />
    </div>
  );
}

function RightPanel({ animado }: { animado: boolean }) {
  return (
    <div className={`hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-[#c8dff7] via-[#d6e8f8] to-[#e8f3fc] flex-col items-center justify-center transition-all duration-700 ease-out delay-200 ${animado ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-blue-200/30 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 px-12">
        {/* Logo caja de ahorro */}
        <div className="w-48 h-48 bg-white/40 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-300/30 animate-[float_4s_ease-in-out_infinite]">
          <PiggyBankIcon />
        </div>

        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Finanzas seguras,<br />decisiones inteligentes.
          </h2>
          <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
            Controla tus ingresos y gastos en soles peruanos con la seguridad de nivel bancario.
          </p>
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          {[
            { icon: <ShieldCheck className="w-4 h-4" />, label: 'RLS activado', color: 'text-blue-600 bg-blue-50' },
            { icon: <TrendingUp className="w-4 h-4" />, label: 'Tiempo real', color: 'text-green-600 bg-green-50' },
            { icon: <Zap className="w-4 h-4" />, label: 'Multi-usuario', color: 'text-amber-600 bg-amber-50' },
          ].map(badge => (
            <div key={badge.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${badge.color}`}>
              {badge.icon}{badge.label}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #1e3a5f 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <style>{`@keyframes float { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-18px) rotate(2deg)} }`}</style>
    </div>
  );
}
