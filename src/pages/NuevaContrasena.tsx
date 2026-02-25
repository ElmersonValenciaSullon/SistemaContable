import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

interface Props {
  onExito: () => void;
}

export default function NuevaContrasena({ onExito }: Props) {
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const fuerza = password.length === 0 ? 0 : password.length >= 10 ? 4 : password.length >= 8 ? 3 : password.length >= 6 ? 2 : 1;
  const coloresFuerza = ['bg-slate-200', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400'];
  const textoFuerza = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setExito(true);
      // Dar 2 segundos para ver el mensaje de éxito y luego continuar al dashboard
      setTimeout(() => {
        onExito();
      }, 2500);
    } catch (err: any) {
      const msg: string = err.message || '';
      if (msg.includes('same password')) {
        setError('La nueva contraseña no puede ser igual a la anterior.');
      } else if (msg.includes('Password should be at least')) {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError(msg || 'No se pudo actualizar la contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">SolConta</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {exito ? (
            /* Pantalla de éxito */
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">¡Contraseña actualizada!</h2>
              <p className="text-slate-500 text-sm">
                Tu nueva contraseña ha sido guardada correctamente. Redirigiendo al dashboard...
              </p>
              <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mt-2" />
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Crear nueva contraseña
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Elige una contraseña segura para tu cuenta.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nueva contraseña */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Nueva contraseña</label>
                  <div className="relative">
                    <input
                      type={mostrarPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="
                        w-full px-4 py-3 pr-12 rounded-xl text-sm
                        border-2 border-slate-200
                        focus:border-blue-400 focus:ring-4 focus:ring-blue-50
                        outline-none transition-all duration-200
                        placeholder:text-slate-300 bg-slate-50 focus:bg-white
                      "
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPass(!mostrarPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      {mostrarPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Indicador de fuerza */}
                  {password.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(n => (
                          <div
                            key={n}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${fuerza >= n ? coloresFuerza[fuerza] : 'bg-slate-200'}`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${fuerza <= 1 ? 'text-red-500' : fuerza === 2 ? 'text-yellow-600' : fuerza === 3 ? 'text-blue-600' : 'text-green-600'}`}>
                        {textoFuerza[fuerza]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Confirmar contraseña</label>
                  <div className="relative">
                    <input
                      type={mostrarPass ? 'text' : 'password'}
                      required
                      value={confirmar}
                      onChange={e => setConfirmar(e.target.value)}
                      placeholder="Repite la contraseña"
                      className="
                        w-full px-4 py-3 pr-10 rounded-xl text-sm
                        border-2 border-slate-200
                        focus:border-blue-400 focus:ring-4 focus:ring-blue-50
                        outline-none transition-all duration-200
                        placeholder:text-slate-300 bg-slate-50 focus:bg-white
                      "
                    />
                    {confirmar.length > 0 && (
                      <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center ${password === confirmar ? 'bg-green-100' : 'bg-red-100'}`}>
                        {password === confirmar ? (
                          <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium py-3 px-4 rounded-xl flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">⚠</span>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || password !== confirmar || password.length < 6}
                  className="
                    w-full bg-blue-600 hover:bg-blue-700
                    text-white font-bold py-3.5 rounded-xl text-sm
                    shadow-lg shadow-blue-200 hover:shadow-blue-300
                    transition-all duration-200
                    flex items-center justify-center gap-2
                    disabled:opacity-50 disabled:cursor-not-allowed
                    active:scale-[0.98]
                  "
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Guardar nueva contraseña'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
